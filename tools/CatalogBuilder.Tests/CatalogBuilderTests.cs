using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml.Linq;
using Luzzinterest.CatalogBuilder;
using Xunit;

namespace Luzzinterest.CatalogBuilder.Tests;

public sealed class CatalogBuilderTests : IDisposable
{
    private readonly string root = Path.Combine(Path.GetTempPath(), "luzzinterest-catalog-tests", Guid.NewGuid().ToString("N"));

    public CatalogBuilderTests()
    {
        Directory.CreateDirectory(Path.Combine(root, "content", "pieces"));
        Directory.CreateDirectory(Path.Combine(root, "content", "media"));
        File.WriteAllBytes(Path.Combine(root, "content", "media", "confusao-frente.jpg"), [0x01]);
        WriteSite();
        WritePiece("01-confusao.json");
    }

    [Fact]
    public void ValidCatalogPreservesContentAndWritesCanonicalRoutes()
    {
        var catalog = CatalogBuilderService.Build(root, "https://luzzinterest.example/");

        Assert.Equal("https://luzzinterest.example", catalog.Site.PublicUrl);
        var output = File.ReadAllText(Path.Combine(root, ".generated", "catalog.json"));
        Assert.Contains("Confusão", output);
        Assert.DoesNotContain("\\u00", output);
        using var json = JsonDocument.Parse(output);
        Assert.Equal("LUZZINTEREST", json.RootElement.GetProperty("site").GetProperty("name").GetString());
        Assert.Null(catalog.Site.CustomProcess);
        Assert.False(json.RootElement.GetProperty("site").TryGetProperty("customProcess", out _));
        Assert.Equal("confusao-frente.jpg", json.RootElement.GetProperty("pieces")[0].GetProperty("images")[0].GetProperty("src").GetString());
        Assert.False(json.RootElement.GetProperty("pieces")[0].GetProperty("featured").GetBoolean());
        Assert.False(json.RootElement.GetProperty("pieces")[0].GetProperty("images")[0].TryGetProperty("position", out _));

        XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
        var sitemap = XDocument.Load(Path.Combine(root, "public", "sitemap.xml"));
        Assert.Equal(new[]
        {
            "https://luzzinterest.example/",
            "https://luzzinterest.example/acervo/",
            "https://luzzinterest.example/pecas/confusao/"
        }, sitemap.Descendants(ns + "loc").Select(element => element.Value));
        Assert.Contains("Sitemap: https://luzzinterest.example/sitemap.xml", File.ReadAllText(Path.Combine(root, "public", "robots.txt")));
    }

    [Fact]
    public void MissingPublicUrlDoesNotInventDomainAndRemovesStaleSitemap()
    {
        CatalogBuilderService.Build(root, "https://old.example");
        CatalogBuilderService.Build(root);

        Assert.False(File.Exists(Path.Combine(root, "public", "sitemap.xml")));
        Assert.DoesNotContain("Sitemap:", File.ReadAllText(Path.Combine(root, "public", "robots.txt")));
        using var catalog = JsonDocument.Parse(File.ReadAllText(Path.Combine(root, ".generated", "catalog.json")));
        Assert.False(catalog.RootElement.GetProperty("site").TryGetProperty("publicUrl", out _));
    }

    [Fact]
    public void OptionalCustomProcessPreservesItsContentAndStepOrder()
    {
        var site = Site();
        site["customProcess"] = CustomProcess();
        WriteSite(site);

        var catalog = CatalogBuilderService.Build(root);

        Assert.Equal("Como nasce uma custom", catalog.Site.CustomProcess!.Title);
        Assert.Equal(new[] { "A ideia", "A criação" }, catalog.Site.CustomProcess.Steps!.Select(step => step.Title));
        using var output = JsonDocument.Parse(File.ReadAllText(Path.Combine(root, ".generated", "catalog.json")));
        var process = output.RootElement.GetProperty("site").GetProperty("customProcess");
        Assert.Equal("CUSTOM / PROCESSO", process.GetProperty("eyebrow").GetString());
        Assert.Equal("Uma conversa dá início à peça.", process.GetProperty("introduction").GetString());
        Assert.Equal("Referências e desejos viram um ponto de partida.", process.GetProperty("steps")[0].GetProperty("text").GetString());
    }

    [Theory]
    [InlineData("eyebrow", null)]
    [InlineData("eyebrow", "")]
    [InlineData("title", "   ")]
    [InlineData("introduction", "")]
    public void PresentCustomProcessRequiresItsTextFields(string field, string? value)
    {
        var site = Site();
        var process = CustomProcess();
        process[field] = value;
        site["customProcess"] = process;
        WriteSite(site);

        AssertInvalidWithoutOutput($"customProcess.{field}");
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void CustomProcessRequiresAtLeastOneStep(bool nullSteps)
    {
        var site = Site();
        var process = CustomProcess();
        process["steps"] = nullSteps ? null : new JsonArray();
        site["customProcess"] = process;
        WriteSite(site);

        AssertInvalidWithoutOutput("customProcess.steps");
    }

    [Theory]
    [InlineData("title", "")]
    [InlineData("text", "   ")]
    [InlineData("text", null)]
    public void CustomProcessStepRequiresTitleAndText(string field, string? value)
    {
        var site = Site();
        var process = CustomProcess();
        process["steps"]![0]![field] = value;
        site["customProcess"] = process;
        WriteSite(site);

        AssertInvalidWithoutOutput($"customProcess.steps[0].{field}");
    }

    [Fact]
    public void CustomProcessStepCannotBeNull()
    {
        var site = Site();
        var process = CustomProcess();
        process["steps"] = new JsonArray((JsonNode?)null);
        site["customProcess"] = process;
        WriteSite(site);

        AssertInvalidWithoutOutput("customProcess.steps[0]");
    }

    [Fact]
    public void DuplicateSlugFailsBeforeWritingAnyOutput()
    {
        var duplicate = Piece();
        duplicate["id"] = "second-piece";
        WriteJson(Path.Combine(root, "content", "pieces", "02-duplicate.json"), duplicate);

        AssertInvalidWithoutOutput("slug duplicado");
    }

    [Fact]
    public void DuplicateIdFailsBeforeWritingAnyOutput()
    {
        var duplicate = Piece();
        duplicate["slug"] = "outra-peca";
        WriteJson(Path.Combine(root, "content", "pieces", "02-duplicate.json"), duplicate);

        AssertInvalidWithoutOutput("id duplicado");
    }

    [Fact]
    public void MissingPieceImageFailsBeforeWritingAnyOutput()
    {
        var piece = Piece();
        piece["images"]![0]!["src"] = "nao-existe.jpg";
        WritePiece("01-confusao.json", piece);

        AssertInvalidWithoutOutput("mídia ausente");
    }

    [Theory]
    [InlineData("heroImage")]
    [InlineData("processImages")]
    public void MissingSiteImageFailsBeforeWritingAnyOutput(string field)
    {
        var site = Site();
        if (field == "heroImage")
            site[field] = "nao-existe.jpg";
        else
            site[field] = new JsonArray("nao-existe.jpg");
        WriteSite(site);

        AssertInvalidWithoutOutput("mídia ausente");
    }

    [Theory]
    [InlineData("../outside.jpg")]
    [InlineData("..\\outside.jpg")]
    [InlineData("nested/../../outside.jpg")]
    [InlineData("/outside.jpg")]
    [InlineData("C:\\outside.jpg")]
    [InlineData("https://example.com/image.jpg")]
    public void ImagePathCannotEscapeMediaDirectory(string source)
    {
        var piece = Piece();
        piece["images"]![0]!["src"] = source;
        WritePiece("01-confusao.json", piece);

        AssertInvalidWithoutOutput("dentro de content/media");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ImageAltIsRequired(string? alt)
    {
        var piece = Piece();
        piece["images"]![0]!["alt"] = alt;
        WritePiece("01-confusao.json", piece);

        AssertInvalidWithoutOutput("images[0].alt");
    }

    [Fact]
    public void FilesAreOrderedByFilenameInsteadOfPieceName()
    {
        var second = Piece();
        second["id"] = "second";
        second["slug"] = "aaa";
        second["name"] = "AAA";
        WritePiece("99-aaa.json", second);

        var catalog = CatalogBuilderService.Build(root);

        Assert.Equal(new[] { "confusao", "aaa" }, catalog.Pieces.Select(piece => piece.Slug));
        var firstBuild = File.ReadAllBytes(Path.Combine(root, ".generated", "catalog.json"));
        CatalogBuilderService.Build(root);
        Assert.Equal(firstBuild, File.ReadAllBytes(Path.Combine(root, ".generated", "catalog.json")));
    }

    [Theory]
    [InlineData("http://example.com")]
    [InlineData("javascript:alert(1)")]
    [InlineData("/relative")]
    [InlineData("https://user:password@example.com")]
    public void ExternalLinksRequireAbsoluteHttpsUrls(string url)
    {
        var site = Site();
        site["whatsappUrl"] = url;
        WriteSite(site);

        AssertInvalidWithoutOutput("whatsappUrl");
    }

    [Theory]
    [InlineData("http://localhost:3000/", "http://localhost:3000")]
    [InlineData("https://luzzinterest.example/", "https://luzzinterest.example")]
    public void PublicUrlAcceptsLocalDevelopmentAndHttpsRoot(string siteUrl, string expected)
    {
        var catalog = CatalogBuilderService.Build(root, siteUrl);

        Assert.Equal(expected, catalog.Site.PublicUrl);
        Assert.Contains(expected + "/acervo/", File.ReadAllText(Path.Combine(root, "public", "sitemap.xml")));
    }

    [Theory]
    [InlineData("http://example.com")]
    [InlineData("https://luzzinterest.example/subpath/")]
    [InlineData("https://example.com?tracking=1")]
    [InlineData("https://example.com#fragment")]
    public void InvalidPublicUrlFailsBeforeWritingAnyOutput(string siteUrl)
    {
        var error = Assert.Throws<CatalogValidationException>(() => CatalogBuilderService.Build(root, siteUrl));

        Assert.Contains("SITE_URL", error.Message);
        Assert.False(Directory.Exists(Path.Combine(root, ".generated")));
        Assert.False(Directory.Exists(Path.Combine(root, "public")));
    }

    [Fact]
    public void PublicUrlWithSubpathDoesNotOverwriteExistingOutput()
    {
        CatalogBuilderService.Build(root, "https://luzzinterest.example");
        var catalogPath = Path.Combine(root, ".generated", "catalog.json");
        var sitemapPath = Path.Combine(root, "public", "sitemap.xml");
        var robotsPath = Path.Combine(root, "public", "robots.txt");
        var previousCatalog = File.ReadAllBytes(catalogPath);
        var previousSitemap = File.ReadAllBytes(sitemapPath);
        var previousRobots = File.ReadAllBytes(robotsPath);

        var error = Assert.Throws<CatalogValidationException>(() => CatalogBuilderService.Build(root, "https://luzzinterest.example/subpath/"));

        Assert.Contains("sem subcaminho", error.Message);
        Assert.Equal(previousCatalog, File.ReadAllBytes(catalogPath));
        Assert.Equal(previousSitemap, File.ReadAllBytes(sitemapPath));
        Assert.Equal(previousRobots, File.ReadAllBytes(robotsPath));
    }

    [Fact]
    public void InvalidContentDoesNotOverwriteExistingOutput()
    {
        CatalogBuilderService.Build(root, "https://luzzinterest.example");
        var catalogPath = Path.Combine(root, ".generated", "catalog.json");
        var sitemapPath = Path.Combine(root, "public", "sitemap.xml");
        var robotsPath = Path.Combine(root, "public", "robots.txt");
        var previousCatalog = File.ReadAllBytes(catalogPath);
        var previousSitemap = File.ReadAllBytes(sitemapPath);
        var previousRobots = File.ReadAllBytes(robotsPath);
        var piece = Piece();
        piece["images"]![0]!["alt"] = "";
        WritePiece("01-confusao.json", piece);

        Assert.Throws<CatalogValidationException>(() => CatalogBuilderService.Build(root));

        Assert.Equal(previousCatalog, File.ReadAllBytes(catalogPath));
        Assert.Equal(previousSitemap, File.ReadAllBytes(sitemapPath));
        Assert.Equal(previousRobots, File.ReadAllBytes(robotsPath));
    }

    [Fact]
    public void CliUsesEnvironmentUrlAndReturnsClearFailure()
    {
        var stdout = new StringWriter();
        var stderr = new StringWriter();
        var success = CatalogCli.Run(["--root", root], stdout, stderr, "https://environment.example");
        Assert.Equal(0, success);
        Assert.Equal("", stderr.ToString());
        Assert.Contains("https://environment.example", stdout.ToString());

        var invalid = CatalogCli.Run(["--unknown"], stdout, stderr);
        Assert.Equal(1, invalid);
        Assert.Contains("Opção desconhecida", stderr.ToString());
    }

    [Fact]
    public void CliExplicitPublicUrlOverridesEnvironment()
    {
        var result = CatalogCli.Run(["--root", root, "--site-url", "https://explicit.example"], TextWriter.Null, TextWriter.Null, "https://environment.example");

        Assert.Equal(0, result);
        Assert.Contains("https://explicit.example", File.ReadAllText(Path.Combine(root, "public", "robots.txt")));
        Assert.DoesNotContain("environment.example", File.ReadAllText(Path.Combine(root, "public", "robots.txt")));
    }

    [Fact]
    public void FeaturedMustBePresentEvenWhenItsValueIsFalse()
    {
        var piece = Piece();
        piece.Remove("featured");
        WritePiece("01-confusao.json", piece);

        AssertInvalidWithoutOutput("featured");
    }

    [Fact]
    public void CliReportsInvalidContentWithFilenameAndDoesNotWriteOutput()
    {
        var piece = Piece();
        piece.Remove("collection");
        WritePiece("01-confusao.json", piece);
        var stderr = new StringWriter();

        var result = CatalogCli.Run(["--root", root], TextWriter.Null, stderr);

        Assert.Equal(1, result);
        Assert.Contains("content/pieces/01-confusao.json", stderr.ToString());
        Assert.Contains("collection", stderr.ToString());
        Assert.False(Directory.Exists(Path.Combine(root, ".generated")));
        Assert.False(Directory.Exists(Path.Combine(root, "public")));
    }

    [Fact]
    public void MalformedJsonFailsWithoutWritingOutput()
    {
        File.WriteAllText(Path.Combine(root, "content", "site.json"), "{\"name\":");

        AssertInvalidWithoutOutput("JSON inválido");
    }

    private void AssertInvalidWithoutOutput(string expectedMessage)
    {
        var error = Assert.Throws<CatalogValidationException>(() => CatalogBuilderService.Build(root));
        Assert.Contains(expectedMessage, error.Message);
        Assert.False(Directory.Exists(Path.Combine(root, ".generated")));
        Assert.False(Directory.Exists(Path.Combine(root, "public")));
    }

    private void WriteSite(JsonObject? site = null) => WriteJson(Path.Combine(root, "content", "site.json"), site ?? Site());

    private void WritePiece(string filename, JsonObject? piece = null) => WriteJson(Path.Combine(root, "content", "pieces", filename), piece ?? Piece());

    private static void WriteJson(string path, JsonObject value) => File.WriteAllText(path, value.ToJsonString(), new UTF8Encoding(false));

    private static JsonObject Site() => new()
    {
        ["name"] = "LUZZINTEREST",
        ["tagline"] = "Irracional / Hipersensível",
        ["introduction"] = "Roupas feitas à mão.",
        ["manifesto"] = new JsonArray("Vestir o que sentimos."),
        ["location"] = "Brasil",
        ["instagramUrl"] = "https://www.instagram.com/luzzinterest/",
        ["whatsappUrl"] = "https://chat.whatsapp.com/example",
        ["heroImage"] = "confusao-frente.jpg",
        ["processImages"] = new JsonArray()
    };

    private static JsonObject Piece() => new()
    {
        ["id"] = "piece-confusao",
        ["slug"] = "confusao",
        ["name"] = "Confusão",
        ["description"] = "Intervenção em tecido.",
        ["collection"] = "Peças únicas",
        ["category"] = "Calça",
        ["featured"] = false,
        ["images"] = new JsonArray(new JsonObject
        {
            ["src"] = "confusao-frente.jpg",
            ["alt"] = "Frente de uma calça com intervenção manual."
        }),
        ["credits"] = new JsonArray(),
        ["details"] = new JsonArray("Produção artesanal."),
        ["sourceUrl"] = "https://www.instagram.com/p/example/"
    };

    private static JsonObject CustomProcess() => new()
    {
        ["eyebrow"] = "CUSTOM / PROCESSO",
        ["title"] = "Como nasce uma custom",
        ["introduction"] = "Uma conversa dá início à peça.",
        ["steps"] = new JsonArray(
            new JsonObject { ["title"] = "A ideia", ["text"] = "Referências e desejos viram um ponto de partida." },
            new JsonObject { ["title"] = "A criação", ["text"] = "A intervenção ganha forma na roupa." })
    };

    public void Dispose()
    {
        var resolvedRoot = Path.GetFullPath(root);
        var testDirectory = Path.GetFullPath(Path.Combine(Path.GetTempPath(), "luzzinterest-catalog-tests")) + Path.DirectorySeparatorChar;
        if (resolvedRoot.StartsWith(testDirectory, OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal))
            Directory.Delete(resolvedRoot, recursive: true);
    }
}
