// `npm run deploy:dev` / `npm run deploy:prod`: check, build and install HaCasa into Home Assistant.
//
//   dev   builds the current branch as hacasa-nova-dev -> /config/www/hacasa-nova-dev   (panel /hacasa-dev)
//   prod  builds `main` as hacasa-nova          -> /config/www/hacasa-nova       (panel /hacasa), tags the version
//
// Both run the same checks first (translations, syntax, a render smoke test), back up the bundle they replace in
// .deploy-backups/<variant>/ and (re)write a small loader.js next to the bundle: /local is cached for 31 days, the loader
// imports the bundle under its current ETag, so a reload in the browser always gets the new build.
// Other targets: HACASA_TARGET, or { "dev": "...", "prod": "..." } in deploy.local.json (git-ignored).
// Roll back with `npm run rollback:dev` / `npm run rollback:prod`.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const variant = process.argv[2];
if (!["dev", "prod"].includes(variant)) { console.error("usage: node dev/deploy.mjs dev|prod [--force]"); process.exit(1); }
const force = process.argv.includes("--force");
const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const out = cmd => execSync(cmd, { encoding: "utf8" }).trim();

const local = existsSync("deploy.local.json") ? JSON.parse(readFileSync("deploy.local.json", "utf8")) : {};
const DEFAULT = { dev: "/config/www/hacasa-nova-dev", prod: "/config/www/hacasa-nova" };
const target = process.env.HACASA_TARGET || local[variant] || DEFAULT[variant];
if (!existsSync(join(target, ".."))) { console.error(`Target ${target} is not reachable from here. Set HACASA_TARGET or deploy.local.json.`); process.exit(1); }

const git = (a) => out(`git -c safe.directory='*' ${a}`);
const branch = git("rev-parse --abbrev-ref HEAD"), dirty = git("status --porcelain");
if (variant === "prod" && !force) {
  if (branch !== "main") { console.error(`prod is built from main, you are on ${branch}. Merge first (or --force).`); process.exit(1); }
  if (dirty) { console.error("The working tree has uncommitted changes. Commit them first (or --force).\n" + dirty); process.exit(1); }
}

const dev = variant === "dev", name = dev ? "hacasa-nova-dev" : "hacasa-nova", dist = dev ? "dist-dev" : "dist";
console.log(`\n[1/4] checks`);
run("node dev/i18n-check.mjs");
console.log(`\n[2/4] build ${variant}`);
run(`node build.mjs${dev ? " --dev" : ""}`);
const bundle = `${dist}/${name}.js`, { version } = JSON.parse(readFileSync(`${dist}/version.json`, "utf8"));
run(`node --check ${bundle}`);
console.log(`\n[3/4] smoke test`);
run(`node dev/smoke.mjs ${bundle} ${name}`);

console.log(`\n[4/4] install into ${target}`);
mkdirSync(target, { recursive: true });
const backupDir = join(".deploy-backups", variant); mkdirSync(backupDir, { recursive: true });
const current = join(target, `${name}.js`);
if (existsSync(current)) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  copyFileSync(current, join(backupDir, `${stamp}.js`));
  const keep = readdirSync(backupDir).filter(f => f.endsWith(".js")).sort();
  for (const f of keep.slice(0, Math.max(0, keep.length - 10))) rmSync(join(backupDir, f));   // keep the last 10
}
copyFileSync(bundle, current);
writeFileSync(join(target, "loader.js"), `// HaCasa Nova ${variant} loader: /local is served with a 31-day max-age, so the panel
// loads this tiny file and imports the real bundle under its current ETag.
// A new build gets a new ETag, hence a new URL, hence no stale cache.
const bundle = new URL("./${name}.js", import.meta.url);
let v = Date.now();
try {
  const r = await fetch(bundle, { method: "HEAD", cache: "no-store" });
  v = r.headers.get("etag") || r.headers.get("last-modified") || v;
} catch (e) {}
bundle.searchParams.set("v", String(v).replace(/[^\\w-]/g, ""));
await import(bundle.href);
`);
console.log(`deployed ${version} (${branch}${dirty ? ", with uncommitted changes" : ""}) to ${target}; reload the browser`);

if (variant === "prod") {
  const tag = `v${version}`;
  try { git(`rev-parse -q --verify refs/tags/${tag}`); console.log(`tag ${tag} already exists; not moved`); }
  catch { git(`tag -a ${tag} -m "HaCasa ${version}"`); console.log(`tagged ${tag} (push it with: git push origin ${tag})`); }
}
