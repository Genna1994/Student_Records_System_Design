import { build } from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(__dirname, "api/trpc.ts")],
  outfile: resolve(__dirname, "api/trpc.js"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  external: ["mysql2"],
  alias: {
    "@db": resolve(__dirname, "db"),
    "@contracts": resolve(__dirname, "contracts"),
    "@": resolve(__dirname, "src"),
  },
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  logLevel: "info",
});

console.log("✅ api/trpc.ts bundled → api/trpc.js");
