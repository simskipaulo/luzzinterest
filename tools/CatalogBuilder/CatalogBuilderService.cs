using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace Luzzinterest.CatalogBuilder;

public static partial class CatalogBuilderService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = false,
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    private static readonly UTF8Encoding Utf8 = new(encoderShouldEmitUTF8Identifier: false);

    public static CatalogDocument Build(string root, string? siteUrl = null)
    {
        var rootPath = Path.GetFullPath(root);
        var contentPath = Path.Combine(rootPath, "content");
        var mediaPath = Path.Combine(contentPath, "media");
        var sitePath = Path.Combine(contentPath, "site.json");
        var piecesPath = Path.Combine(contentPath, "pieces");
        var publicUrl = NormalizePublicUrl(siteUrl);

        var site = ReadJson<CatalogSite>(sitePath) with { PublicUrl = publicUrl };
        ValidateSite(site, mediaPath);
        if (!Directory.Exists(piecesPath))
            throw new CatalogValidationException("Pasta obrigatória ausente: content/pieces.");

        var pieceFiles = Directory.GetFiles(piecesPath, "*.json")
            .OrderBy(Path.GetFileName, StringComparer.Ordinal)
            .ToArray();
        var pieces = new List<CatalogPiece>();
        var ids = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var slugs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in pieceFiles)
        {
            var context = $"content/pieces/{Path.GetFileName(file)}";
            var piece = ReadJson<CatalogPiece>(file);
            ValidatePiece(piece, mediaPath, context);
            if (!ids.Add(piece.Id.Trim()))
                throw new CatalogValidationException($"{context}: id duplicado '{piece.Id}'.");
            if (!slugs.Add(piece.Slug))
                throw new CatalogValidationException($"{context}: slug duplicado '{piece.Slug}'.");
            pieces.Add(piece);
        }

        var catalog = new CatalogDocument(site, pieces);
        // All source and URL validation is complete before any output changes.
        var catalogJson = JsonSerializer.Serialize(catalog, JsonOptions) + "\n";
        var sitemap = publicUrl is null ? null : CreateSitemap(publicUrl, pieces);
        var robots = "User-agent: *\nAllow: /\n";
        if (publicUrl is not null)
            robots += $"\nSitemap: {publicUrl}/sitemap.xml\n";

        var generatedPath = Path.Combine(rootPath, ".generated");
        var publicPath = Path.Combine(rootPath, "public");
        Directory.CreateDirectory(generatedPath);
        Directory.CreateDirectory(publicPath);
        File.WriteAllText(Path.Combine(generatedPath, "catalog.json"), catalogJson, Utf8);
        File.WriteAllText(Path.Combine(publicPath, "robots.txt"), robots, Utf8);
        var sitemapPath = Path.Combine(publicPath, "sitemap.xml");
        if (sitemap is not null)
            File.WriteAllText(sitemapPath, sitemap, Utf8);
        else if (File.Exists(sitemapPath))
            File.Delete(sitemapPath);

        return catalog;
    }

    private static T ReadJson<T>(string file)
    {
        if (!File.Exists(file))
            throw new CatalogValidationException($"Arquivo obrigatório ausente: {file}.");
        try
        {
            return JsonSerializer.Deserialize<T>(File.ReadAllText(file, Utf8), JsonOptions)
                ?? throw new CatalogValidationException($"{file}: o JSON não pode ser null.");
        }
        catch (JsonException error)
        {
            throw new CatalogValidationException($"{file}: JSON inválido ({error.Message}).");
        }
    }

    private static void ValidateSite(CatalogSite site, string mediaPath)
    {
        const string context = "content/site.json";
        Required(site.Name, context, "name");
        Required(site.Tagline, context, "tagline");
        Required(site.Introduction, context, "introduction");
        Required(site.Location, context, "location");
        ValidateHttpsUrl(site.InstagramUrl, context, "instagramUrl");
        ValidateHttpsUrl(site.WhatsappUrl, context, "whatsappUrl");
        ValidateTextArray(site.Manifesto, context, "manifesto");
        ValidateImagePath(site.HeroImage, mediaPath, context, "heroImage");
        if (site.ProcessImages is null)
            throw new CatalogValidationException($"{context}: 'processImages' é obrigatório e deve ser uma lista.");
        for (var index = 0; index < site.ProcessImages.Length; index++)
            ValidateImagePath(site.ProcessImages[index], mediaPath, context, $"processImages[{index}]");
        if (site.CustomProcess is not null)
        {
            Required(site.CustomProcess.Eyebrow, context, "customProcess.eyebrow");
            Required(site.CustomProcess.Title, context, "customProcess.title");
            Required(site.CustomProcess.Introduction, context, "customProcess.introduction");
            if (site.CustomProcess.Steps is null || site.CustomProcess.Steps.Length == 0)
                throw new CatalogValidationException($"{context}: 'customProcess.steps' deve conter ao menos uma etapa.");
            for (var index = 0; index < site.CustomProcess.Steps.Length; index++)
            {
                var step = site.CustomProcess.Steps[index];
                if (step is null)
                    throw new CatalogValidationException($"{context}: 'customProcess.steps[{index}]' não pode ser null.");
                Required(step.Title, context, $"customProcess.steps[{index}].title");
                Required(step.Text, context, $"customProcess.steps[{index}].text");
            }
        }
    }

    private static void ValidatePiece(CatalogPiece piece, string mediaPath, string context)
    {
        Required(piece.Id, context, "id");
        Required(piece.Slug, context, "slug");
        if (!SlugPattern().IsMatch(piece.Slug))
            throw new CatalogValidationException($"{context}: 'slug' deve usar letras minúsculas sem acentos, números e hífens entre palavras.");
        Required(piece.Name, context, "name");
        Required(piece.Description, context, "description");
        Required(piece.Collection, context, "collection");
        Required(piece.Category, context, "category");
        if (piece.Featured is null)
            throw new CatalogValidationException($"{context}: 'featured' é obrigatório e deve ser true ou false.");
        ValidateHttpsUrl(piece.SourceUrl, context, "sourceUrl");
        ValidateTextArray(piece.Details, context, "details");
        if (piece.Images is null || piece.Images.Length == 0)
            throw new CatalogValidationException($"{context}: 'images' deve conter ao menos uma imagem.");
        for (var index = 0; index < piece.Images.Length; index++)
        {
            var image = piece.Images[index];
            if (image is null)
                throw new CatalogValidationException($"{context}: 'images[{index}]' não pode ser null.");
            Required(image.Alt, context, $"images[{index}].alt");
            ValidateImagePath(image.Src, mediaPath, context, $"images[{index}].src");
            if (image.Position is not null)
                Required(image.Position, context, $"images[{index}].position");
        }

        if (piece.Credits is null)
            throw new CatalogValidationException($"{context}: 'credits' é obrigatório e deve ser uma lista.");
        for (var index = 0; index < piece.Credits.Length; index++)
        {
            var credit = piece.Credits[index];
            if (credit is null)
                throw new CatalogValidationException($"{context}: 'credits[{index}]' não pode ser null.");
            Required(credit.Name, context, $"credits[{index}].name");
            ValidateHttpsUrl(credit.Url, context, $"credits[{index}].url");
        }
    }

    private static void ValidateTextArray(string[]? values, string context, string field)
    {
        if (values is null)
            throw new CatalogValidationException($"{context}: '{field}' é obrigatório e deve ser uma lista.");
        for (var index = 0; index < values.Length; index++)
            Required(values[index], context, $"{field}[{index}]");
    }

    private static void Required(string? value, string context, string field)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new CatalogValidationException($"{context}: '{field}' é obrigatório e não pode estar vazio.");
    }

    private static void ValidateHttpsUrl(string? value, string context, string field)
    {
        Required(value, context, field);
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || uri.Scheme != Uri.UriSchemeHttps
            || string.IsNullOrWhiteSpace(uri.Host)
            || !string.IsNullOrEmpty(uri.UserInfo))
            throw new CatalogValidationException($"{context}: '{field}' deve ser uma URL HTTPS absoluta válida.");
    }

    private static void ValidateImagePath(string? source, string mediaPath, string context, string field)
    {
        Required(source, context, field);
        var relativePath = source!.Replace('\\', '/');
        if (Path.IsPathRooted(source)
            || relativePath.StartsWith("/", StringComparison.Ordinal)
            || relativePath.Contains(':', StringComparison.Ordinal)
            || relativePath.Split('/').Contains("..", StringComparer.Ordinal))
            throw new CatalogValidationException($"{context}: '{field}' deve apontar para um arquivo dentro de content/media, sem caminhos absolutos ou '..'.");

        var fullMediaPath = Path.GetFullPath(mediaPath) + Path.DirectorySeparatorChar;
        string fullImagePath;
        try
        {
            fullImagePath = Path.GetFullPath(Path.Combine(mediaPath, relativePath.Replace('/', Path.DirectorySeparatorChar)));
        }
        catch (Exception error) when (error is ArgumentException or NotSupportedException or PathTooLongException)
        {
            throw new CatalogValidationException($"{context}: caminho inválido em '{field}'.");
        }
        var comparison = OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;
        if (!fullImagePath.StartsWith(fullMediaPath, comparison))
            throw new CatalogValidationException($"{context}: '{field}' aponta para fora de content/media.");
        if (!File.Exists(fullImagePath))
            throw new CatalogValidationException($"{context}: mídia ausente em '{field}': content/media/{relativePath}.");
    }

    private static string? NormalizePublicUrl(string? value)
    {
        if (value is null)
            return null;
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || string.IsNullOrWhiteSpace(uri.Host)
            || !(uri.Scheme == Uri.UriSchemeHttps || (uri.Scheme == Uri.UriSchemeHttp && uri.IsLoopback))
            || uri.AbsolutePath != "/"
            || !string.IsNullOrEmpty(uri.UserInfo)
            || !string.IsNullOrEmpty(uri.Query)
            || !string.IsNullOrEmpty(uri.Fragment))
            throw new CatalogValidationException("SITE_URL/--site-url deve ser uma URL absoluta HTTPS (ou HTTP em localhost) na raiz do domínio, sem subcaminho, credenciais, query ou fragmento.");
        return uri.AbsoluteUri.TrimEnd('/');
    }

    private static string CreateSitemap(string publicUrl, IReadOnlyList<CatalogPiece> pieces)
    {
        XNamespace sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
        var paths = new[] { "", "acervo/" }
            .Concat(pieces.Select(piece => $"pecas/{Uri.EscapeDataString(piece.Slug)}/"));
        var sitemap = new XElement(sitemapNamespace + "urlset", paths.Select(path =>
            new XElement(sitemapNamespace + "url", new XElement(sitemapNamespace + "loc", $"{publicUrl}/{path}"))));
        return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + sitemap + "\n";
    }

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant)]
    private static partial Regex SlugPattern();
}
