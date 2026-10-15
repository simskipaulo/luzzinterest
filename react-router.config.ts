import { readFile } from "node:fs/promises";
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  async prerender() {
    const catalog = JSON.parse(await readFile(new URL("./.generated/catalog.json", import.meta.url), "utf8")) as {
      pieces: Array<{ slug: string }>;
    };
    return ["/", "/acervo/", "/404", ...catalog.pieces.map(({ slug }) => `/pecas/${slug}/`)];
  },
} satisfies Config;
