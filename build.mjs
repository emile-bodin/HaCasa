// Bundles src/panel.js into one self-contained file, dist/tomte.js (Home Assistant serves a single file),
// with the SVG icons from icons/ inlined as data: URLs. Also writes version.json for cache-busting.
// `node build.mjs --watch` rebuilds on change.
// `node build.mjs --dev` builds the dev variant into dist-dev/tomte-dev.js: element <tomte-panel-dev>,
// card custom:tomte-card-dev and its own settings key, so it runs next to the real one.
import * as esbuild from "esbuild";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const watch = process.argv.includes("--watch");
const dev = process.argv.includes("--dev");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version + (dev ? "-dev" : "");
const outdir = dev ? "dist-dev" : "dist";
const name = dev ? "tomte-dev" : "tomte";
mkdirSync(outdir, { recursive: true });

const icons = {
  name: "icons",
  setup(build) {
    build.onResolve({ filter: /^hcn:icons$/ }, () => ({ path: "icons", namespace: "hcn" }));
    build.onLoad({ filter: /.*/, namespace: "hcn" }, () => {
      const map = {};
      for (const f of readdirSync("icons").filter(f => f.endsWith(".svg")))
        map[f.slice(0, -4)] = "data:image/svg+xml," + encodeURIComponent(readFileSync(`icons/${f}`, "utf8").trim());
      return { contents: `export default ${JSON.stringify(map)};`, loader: "js", watchDirs: ["icons"] };
    });
  },
};

// loader.js next to the bundle: /local is served with a 31-day browser cache, so a module_url pointing straight at the bundle keeps
// showing an old build. The loader asks for the bundle's ETag (HEAD, no cache) and imports it as ?v=<etag>: a new build is a new URL.
const loader = `// Tomte loader: /local is served with a 31-day max-age, so the panel loads this tiny file
// and imports the real bundle under its current ETag. A new build gets a new ETag, hence a new URL, hence no stale cache.
const bundle = new URL("./${name}.js", import.meta.url);
let v = Date.now();
try {
  const r = await fetch(bundle, { method: "HEAD", cache: "no-store" });
  v = r.headers.get("etag") || r.headers.get("last-modified") || v;
} catch (e) {}
bundle.searchParams.set("v", String(v).replace(/[^\\w-]/g, ""));
await import(bundle.href);
`;

const stamp = {
  name: "version-stamp",
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length) return;
      const v = Date.now().toString(36);
      writeFileSync(`${outdir}/loader.js`, loader);
      writeFileSync(`${outdir}/version.json`, JSON.stringify({ v, version, built: new Date().toISOString() }));
      console.log(`[tomte] built ${version} v=${v}`);
    });
  },
};

const ctx = await esbuild.context({
  entryPoints: ["src/panel.js"],
  define: { __VERSION__: JSON.stringify(version), __SUFFIX__: JSON.stringify(dev ? "-dev" : "") },
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  outfile: `${outdir}/${name}.js`,
  legalComments: "eof",
  banner: { js: `/*! Tomte ${version} · MIT · https://github.com/emile-bodin/TomTe */` },
  plugins: [icons, stamp],
});

if (watch) await ctx.watch();
else { await ctx.rebuild(); await ctx.dispose(); }
