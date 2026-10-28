// `npm run release -- 1.2.0`: cut a version. Writes it into package.json (and the lock file) and turns the
// "## Unreleased" heading of CHANGELOG.md into "## 1.2.0 · <date>", with an empty Unreleased above it, then commits.
// It also builds dist/ so the release commit carries the matching bundle. Needs a clean working tree on main. `npm run deploy:prod` builds that commit and tags it v1.2.0.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version || "")) { console.error("usage: npm run release -- <major.minor.patch>   e.g. 1.0.1"); process.exit(1); }
const git = a => execSync(`git -c safe.directory='*' ${a}`, { encoding: "utf8" }).trim();
if (git("rev-parse --abbrev-ref HEAD") !== "main") { console.error("Release from main."); process.exit(1); }
if (git("status --porcelain")) { console.error("The working tree has uncommitted changes."); process.exit(1); }
if (git(`tag -l v${version}`)) { console.error(`v${version} already exists.`); process.exit(1); }

const log = readFileSync("CHANGELOG.md", "utf8");
const m = log.match(/## Unreleased\n([\s\S]*?)(?=\n## )/);
if (!m || !m[1].trim()) { console.error("CHANGELOG.md has nothing under '## Unreleased'. Write what changed first."); process.exit(1); }
const date = new Date().toISOString().slice(0, 10);
writeFileSync("CHANGELOG.md", log.replace("## Unreleased\n", `## Unreleased\n\n## ${version} · ${date}\n`));
for (const f of ["package.json", "package-lock.json"]) {
  const j = JSON.parse(readFileSync(f, "utf8")); j.version = version;
  if (j.packages?.[""]) j.packages[""].version = version;
  writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
}
execSync("node build.mjs", { stdio: "inherit" });   // dist/ is tracked: the release commit carries the build of that version
git("add package.json package-lock.json CHANGELOG.md dist");
git(`-c user.name="$(git config user.name || echo release)" -c user.email="$(git config user.email || echo release@local)" commit -q -m "Release ${version}"`);
console.log(`released ${version}. Next: npm run deploy:prod (builds, installs and tags v${version}), then git push origin main --tags (the tag publishes the GitHub release with tomte.js and loader.js)`);
