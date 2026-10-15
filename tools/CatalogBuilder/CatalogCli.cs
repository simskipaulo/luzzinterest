namespace Luzzinterest.CatalogBuilder;

public static class CatalogCli
{
    public static int Run(string[] args, TextWriter stdout, TextWriter stderr, string? environmentSiteUrl = null)
    {
        try
        {
            string? root = null;
            string? siteUrl = null;
            for (var index = 0; index < args.Length; index++)
            {
                var option = args[index];
                if (option is "--help" or "-h")
                {
                    stdout.WriteLine("Uso: dotnet run --project tools/CatalogBuilder -- --root <pasta> [--site-url <URL absoluta HTTPS ou localhost>]");
                    stdout.WriteLine("SITE_URL também pode definir o endereço público quando --site-url não for informado.");
                    return 0;
                }

                if (option is not ("--root" or "--site-url"))
                    throw new CatalogValidationException($"Opção desconhecida: {option}.");
                if (index + 1 >= args.Length || args[index + 1].StartsWith("--", StringComparison.Ordinal))
                    throw new CatalogValidationException($"Informe um valor para {option}.");

                var value = args[++index];
                if (option == "--root")
                {
                    if (root is not null)
                        throw new CatalogValidationException("A opção --root foi informada mais de uma vez.");
                    root = value;
                }
                else
                {
                    if (siteUrl is not null)
                        throw new CatalogValidationException("A opção --site-url foi informada mais de uma vez.");
                    siteUrl = value;
                }
            }

            if (string.IsNullOrWhiteSpace(root))
                throw new CatalogValidationException("Informe a pasta do projeto com --root <pasta>.");

            siteUrl ??= string.IsNullOrWhiteSpace(environmentSiteUrl) ? null : environmentSiteUrl;
            var catalog = CatalogBuilderService.Build(root, siteUrl);
            stdout.WriteLine($"Catálogo gerado: {catalog.Pieces.Count} peça(s).");
            stdout.WriteLine(catalog.Site.PublicUrl is null
                ? "SITE_URL ausente: robots.txt gerado sem sitemap; nenhum domínio foi presumido."
                : $"Sitemap e robots.txt gerados para {catalog.Site.PublicUrl}.");
            return 0;
        }
        catch (Exception error) when (error is CatalogValidationException or IOException or UnauthorizedAccessException or ArgumentException)
        {
            stderr.WriteLine($"Erro ao gerar catálogo: {error.Message}");
            return 1;
        }
    }
}
