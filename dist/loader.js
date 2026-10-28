// Tomte loader: /local is served with a 31-day max-age, so the panel loads this tiny file
// and imports the real bundle under its current ETag. A new build gets a new ETag, hence a new URL, hence no stale cache.
const bundle = new URL("./tomte.js", import.meta.url);
let v = Date.now();
try {
  const r = await fetch(bundle, { method: "HEAD", cache: "no-store" });
  v = r.headers.get("etag") || r.headers.get("last-modified") || v;
} catch (e) {}
bundle.searchParams.set("v", String(v).replace(/[^\w-]/g, ""));
await import(bundle.href);
