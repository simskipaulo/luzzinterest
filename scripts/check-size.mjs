import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const maximumBytes = 250_000_000;
async function measure(directory) {
  let bytes = 0;
  let files = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const child = await measure(absolute);
      bytes += child.bytes;
      files += child.files;
    } else if (entry.isFile()) {
      bytes += (await stat(absolute)).size;
      files++;
    }
  }
  return { bytes, files };
}
const { bytes, files } = await measure(path.resolve("build/client"));
console.log(`Pacote: ${(bytes / 1_000_000).toFixed(2)} MB em ${files} arquivos; limite: 250 MB.`);
if (bytes > maximumBytes) {
  throw new Error("O pacote ultrapassa o limite de 250 MB por ambiente do Azure Static Web Apps Free.");
}
