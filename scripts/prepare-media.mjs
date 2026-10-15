import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDirectory = path.resolve(root, "content/media");
const outputDirectory = path.resolve(root, "public/media");
const catalog = JSON.parse(await readFile(path.join(root, ".generated/catalog.json"), "utf8"));
const sourceOf = (image) => typeof image === "string" ? image : image?.src;
const references = [
  catalog.site.heroImage,
  ...(catalog.site.processImages ?? []),
  ...catalog.pieces.flatMap((piece) => piece.images ?? []),
].map(sourceOf).filter(Boolean);

await mkdir(outputDirectory, { recursive: true });
const manifest = {};
const generatedFiles = new Set();

for (const source of [...new Set(references)].sort()) {
  const absoluteSource = path.resolve(sourceDirectory, source);
  if (!absoluteSource.startsWith(sourceDirectory + path.sep)) {
    throw new Error(`Imagem fora de content/media: ${source}`);
  }
  const metadata = await sharp(absoluteSource).metadata();
  const swapsDimensions = [5, 6, 7, 8].includes(metadata.orientation);
  const originalWidth = swapsDimensions ? metadata.height : metadata.width;
  if (!originalWidth) throw new Error(`Não foi possível ler as dimensões de ${source}`);
  const maximumWidth = Math.min(originalWidth, 1440);
  const widths = [...new Set([480, 800, 1440].map((width) => Math.min(width, maximumWidth)))];
  const stem = path.parse(source).name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imagem";
  const hash = createHash("sha256").update(await readFile(absoluteSource)).digest("hex").slice(0, 12);
  const variants = [];
  for (const width of widths) {
    const filename = `${stem}-${hash}-${width}.webp`;
    const info = await sharp(absoluteSource).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 }).toFile(path.join(outputDirectory, filename));
    generatedFiles.add(filename);
    variants.push({ src: `/media/${filename}`, width: info.width, height: info.height });
  }
  const largest = variants.at(-1);
  const standard = variants.find(({ width }) => width >= 800) ?? largest;
  manifest[source] = {
    src: standard.src,
    srcSet: variants.map(({ src, width }) => `${src} ${width}w`).join(", "),
    width: largest.width,
    height: largest.height,
  };
}

// This directory is generated and ignored by Git; only obsolete generated WebPs are removed.
for (const filename of await readdir(outputDirectory)) {
  if (filename.endsWith(".webp") && !generatedFiles.has(filename)) {
    await unlink(path.join(outputDirectory, filename));
  }
}
await writeFile(path.join(root, ".generated/media.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Mídia: ${Object.keys(manifest).length} originais → ${generatedFiles.size} versões WebP locais.`);
