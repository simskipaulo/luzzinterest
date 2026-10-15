using System.Text.Json.Serialization;

namespace Luzzinterest.CatalogBuilder;

public sealed record CatalogDocument(CatalogSite Site, IReadOnlyList<CatalogPiece> Pieces);

public sealed record CatalogSite
{
    public string Name { get; init; } = "";
    public string Tagline { get; init; } = "";
    public string Introduction { get; init; } = "";
    public string[]? Manifesto { get; init; }
    public string Location { get; init; } = "";
    public string InstagramUrl { get; init; } = "";
    public string WhatsappUrl { get; init; } = "";
    public string HeroImage { get; init; } = "";
    public string[]? ProcessImages { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public CatalogCustomProcess? CustomProcess { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PublicUrl { get; init; }
}

public sealed record CatalogCustomProcess
{
    public string Eyebrow { get; init; } = "";
    public string Title { get; init; } = "";
    public string Introduction { get; init; } = "";
    public CatalogProcessStep[]? Steps { get; init; }
}

public sealed record CatalogProcessStep
{
    public string Title { get; init; } = "";
    public string Text { get; init; } = "";
}

public sealed record CatalogPiece
{
    public string Id { get; init; } = "";
    public string Slug { get; init; } = "";
    public string Name { get; init; } = "";
    public string Description { get; init; } = "";
    public string Collection { get; init; } = "";
    public string Category { get; init; } = "";
    public bool? Featured { get; init; }
    public CatalogImage[]? Images { get; init; }
    public CatalogCredit[]? Credits { get; init; }
    public string[]? Details { get; init; }
    public string SourceUrl { get; init; } = "";
}

public sealed record CatalogImage
{
    public string Src { get; init; } = "";
    public string Alt { get; init; } = "";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Position { get; init; }
}

public sealed record CatalogCredit
{
    public string Name { get; init; } = "";
    public string Url { get; init; } = "";
}

public sealed class CatalogValidationException(string message) : Exception(message);
