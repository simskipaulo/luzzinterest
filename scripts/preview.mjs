import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("build/client");
const portIndex = process.argv.indexOf("--port");
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Porta inválida.");
try { await stat(path.join(root, "index.html")); } catch {
  throw new Error("Build ausente. Execute npm run build antes de npm run preview.");
}
const contentTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".data": "text/x-script; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};
async function resolveFile(urlPath) {
  const candidate = path.resolve(root, "." + urlPath);
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;
  try {
    const entry = await stat(candidate);
    if (entry.isFile()) return candidate;
    if (entry.isDirectory()) {
      const index = path.join(candidate, "index.html");
      if ((await stat(index)).isFile()) return index;
    }
  } catch { /* Missing files are served by the static 404 below. */ }
  return null;
}
const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); response.end("URL inválida."); return; }
  let file = await resolveFile(pathname);
  let statusCode = 200;
  if (!file) { file = path.join(root, "404.html"); statusCode = 404; }
  try {
    const info = await stat(file);
    response.writeHead(statusCode, {
      "Content-Type": contentTypes[path.extname(file)] ?? "application/octet-stream",
      "Content-Length": info.size,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(file).pipe(response);
  } catch { response.writeHead(404); response.end("Página não encontrada."); }
});
server.listen(port, "127.0.0.1", () => console.log(`Preview estático: http://127.0.0.1:${port}`));
