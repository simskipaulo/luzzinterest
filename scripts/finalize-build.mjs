import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("build/client");
const notFound = path.join(output, "404/index.html");
try {
  await stat(notFound);
} catch {
  throw new Error("A rota /404 precisa ser pré-renderizada antes de finalizar o site.");
}
// An unknown URL must keep this complete document instead of hydrating the /404
// route's serialized data against a different client-side route.
const html = (await readFile(notFound, "utf8"))
  .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
  .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, "")
  .replace(/<button\b(?=[^>]*\bclass=["'][^"']*\bmenu-toggle\b[^"']*["'])[^>]*>[\s\S]*?<\/button\s*>/gi, "");
await writeFile(path.join(output, "404.html"), html);
console.log("Página 404 estática preparada para Azure e preview local.");
