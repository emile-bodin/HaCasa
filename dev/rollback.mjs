// `npm run rollback:dev` / `rollback:prod`: put the previous bundle back (the one deploy.mjs backed up).
// The bundle that was live is kept as a backup too, so rolling back twice swaps between the last two.
import { copyFileSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const variant = process.argv[2];
if (!["dev", "prod"].includes(variant)) { console.error("usage: node dev/rollback.mjs dev|prod"); process.exit(1); }
const local = existsSync("deploy.local.json") ? JSON.parse(readFileSync("deploy.local.json", "utf8")) : {};
const target = process.env.TOMTE_TARGET || local[variant] || { dev: "/config/www/tomte-dev", prod: "/config/www/tomte" }[variant];
const name = variant === "dev" ? "tomte-dev" : "tomte", dir = join(".deploy-backups", variant);
const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".js")).sort() : [];
if (!files.length) { console.error(`No backups in ${dir}.`); process.exit(1); }
const last = files[files.length - 1], live = join(target, `${name}.js`);
const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
if (existsSync(live)) copyFileSync(live, join(dir, `${stamp}-rolledback.js`));
copyFileSync(join(dir, last), live);
rmSync(join(dir, last));
console.log(`restored ${last} to ${live}; reload the browser`);
