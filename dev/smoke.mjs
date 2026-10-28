// Render smoke test: loads a built bundle into jsdom, renders a room and the settings page against a made-up home and
// walks the settings layers (household + personal). Exits 1 on any failure. `node dev/smoke.mjs dist-dev/hacasa-nova-dev.js hacasa-nova-dev`
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const [file = "dist-dev/hacasa-nova-dev.js", tag = "hacasa-nova-dev"] = process.argv.slice(2);
const dom = new JSDOM("<!doctype html><body></body>", { url: "http://localhost/hacasa/", runScripts: "outside-only", pretendToBeVisual: true });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = class { observe() {} disconnect() {} }; w.IntersectionObserver = class { observe() {} disconnect() {} };
w.fetch = async () => ({ ok: false, headers: { get: () => null } });
const origWarn = console.warn; console.warn = () => {};
w.eval(`window.__errs=[]; window.addEventListener('error',e=>window.__errs.push(String(e.message)));`);
const code = readFileSync(file, "utf8").replaceAll("import.meta.url", '"http://localhost/local/hacasa/bundle.js"');
const fails = [];
const check = (ok, what) => { console.log(`${ok ? "ok  " : "FAIL"} ${what}`); if (!ok) fails.push(what); };
try { w.eval(code); } catch (e) { console.log("FAIL bundle does not load:", e.message); process.exit(1); }
check(!!w.customElements.get(tag), `element <${tag}> is defined`);

const mk = (id, state, attrs = {}) => ({ entity_id: id, state, attributes: attrs, last_changed: new Date().toISOString(), last_updated: new Date().toISOString(), context: {} });
const states = {
  "light.a": mk("light.a", "on", { friendly_name: "Lamp" }), "light.b": mk("light.b", "off", { friendly_name: "Bank" }),
  "vacuum.robbie": mk("vacuum.robbie", "docked", { friendly_name: "Robbie", rooms: [{ id: 1, name: "Woonkamer" }, { id: 3, name: "Keuken" }] }),
  "sensor.robbie_battery": mk("sensor.robbie_battery", "87", { unit_of_measurement: "%" }),
  "sensor.robbie_filter_remaining": mk("sensor.robbie_filter_remaining", "0"),
  "switch.cat_clean": mk("switch.cat_clean", "off", { friendly_name: "Kattenbak Clean" }), "switch.cat_empty": mk("switch.cat_empty", "off", { friendly_name: "Kattenbak Empty" }), "switch.cat_deodorize": mk("switch.cat_deodorize", "off", { friendly_name: "Kattenbak Deodorize" }),
  "climate.nest": mk("climate.nest", "heat", { temperature: 20, current_temperature: 19, friendly_name: "Nest", hvac_modes: ["heat", "off"] }),
};
const reg = (id, dev) => ({ entity_id: id, area_id: "huiskamer", device_id: dev });
const entities = Object.fromEntries(Object.keys(states).map(id => [id, reg(id, /robbie/.test(id) ? "dv1" : /cat_/.test(id) ? "dv2" : undefined)]));
const devices = { dv1: { id: "dv1", name: "Robbie", serial_number: "T2280" }, dv2: { id: "dv2", name: "Kattenbak" } };
const sets = [], store = { sys: { v: 2, meta: { rev: 3 }, config: { pages: { huiskamer: { hidden: ["light.zzz"], title: "Huis" } } } }, user: { setupDone: true, pages: { huiskamer: { order: ["b", "a"] } } } };
const el = w.document.createElement(tag);
el.hass = { states, entities, devices, areas: { huiskamer: { area_id: "huiskamer", name: "Huiskamer" } }, floors: {}, user: { name: "Test", is_admin: true }, language: "nl", locale: { language: "nl" }, themes: {}, config: { unit_system: {} },
  callWS: async m => {
    if (m.type === "frontend/get_system_data") return { value: store.sys };
    if (m.type === "frontend/get_user_data") return { value: store.user };
    if (m.type === "frontend/set_system_data") { store.sys = m.value; sets.push("sys"); return null; }
    if (m.type === "frontend/set_user_data") { store.user = m.value; sets.push("user"); return null; }
    return null;
  }, callService: async () => {}, connection: { subscribeMessage: () => Promise.resolve(() => {}), subscribeEvents: () => Promise.resolve(() => {}) }, formatEntityState: s => s.state };
el.route = { path: "/huiskamer", prefix: "/hacasa" }; el.panel = { url_path: "hacasa" }; el.narrow = false;
w.document.body.appendChild(el);
const settle = async (ms = 400) => { await new Promise(r => setTimeout(r, ms)); await el.updateComplete; };
await settle(1500);
const html = () => el.shadowRoot?.innerHTML || "";
check(html().length > 20000, `room page renders (${html().length} chars)`);
check(/Robbie/.test(html()), "robot vacuum card");
check(/socks/.test(html()) && /Reinigen/.test(html()), "litter box card");
check(/vdot/.test(html()), "maintenance dot on the vacuum card");
check(el.scope === "global", "an administrator with household settings edits the household");
check(JSON.stringify(el.config.pages.huiskamer) === JSON.stringify({ hidden: ["light.zzz"], title: "Huis", order: ["b", "a"] }), "layers merge per field");

el.popup = { type: "vacuum", e: { id: "vacuum.robbie", state: states["vacuum.robbie"], reg: entities["vacuum.robbie"] } };
await settle(200);
check(/Schoonmaken/.test(html()) && /Onderhoud/.test(html()), "vacuum popup");
el.popup = null;

await el.setHidden("huiskamer", "light.a", true);
check(JSON.stringify(store.sys.config.pages.huiskamer) === JSON.stringify({ hidden: ["light.zzz", "light.a"], title: "Huis" }), "household save stores the change");
check(store.user.pages === undefined, "household save drops the personal difference for that page");
await el.setScope("user"); await el.setHidden("huiskamer", "light.b", true);
check(el.scope === "user" && store.user.pages.huiskamer.hidden.includes("light.b") && store.sys.config.pages.huiskamer.hidden.length === 2, "personal save stays personal");

el.route = { path: "/instellingen", prefix: "/hacasa" };
await settle(300);
check(/Opslag/.test(html()) && /Huis: /.test(html()), "settings page shows the storage section");
check(w.__errs.length === 0, `no errors thrown (${w.__errs.join("; ") || "none"})`);
console.warn = origWarn;
console.log(fails.length ? `\n${fails.length} check(s) failed` : "\nall checks passed");
process.exit(fails.length ? 1 : 0);
