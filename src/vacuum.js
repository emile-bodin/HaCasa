// Robot vacuum helpers: the integration puts a robot's extra entities (battery, task, maintenance, dock, …) on the same device
// as the vacuum entity, so everything is found through the device. Used by the vacuum card, its popup and the room model.
import { t } from "./i18n.js";
import { unavailable, num } from "./util.js";

/** the entities of the device behind `id`, looked up by their name suffix (sensor.<name>_<key>, button.<name>_<key>, …) */
export function siblings(hass, id) {
  const dev = hass.entities?.[id]?.device_id, ids = dev ? Object.values(hass.entities).filter(x => x.device_id === dev).map(x => x.entity_id) : [], oid = id.split(".")[1];
  const find = (dom, k) => {
    const z = ids.find(y => y === dom + "." + oid + "_" + k) || ids.find(y => y.startsWith(dom + ".") && y.endsWith("_" + k) && !y.endsWith("_total_" + k));
    return z ? hass.states[z] : null;
  };
  return { s: k => find("sensor", k), b: k => find("button", k), sel: k => find("select", k), sw: k => find("switch", k),
    cam: () => { const z = ids.find(y => y.startsWith("camera.")); return z ? hass.states[z] : null; } };
}

/** wear parts with hours remaining: [key, label, icon] */
const PARTS = [["filter", "Filter", "mdi:air-filter"], ["rolling_brush", "Rolborstel", "mdi:broom"], ["side_brush", "Zijborstel", "mdi:brush"], ["mopping_cloth", "Dweil", "mdi:water-outline"], ["cleaning_tray", "Reinigingsbak", "mdi:tray"], ["sensor", "Sensoren", "mdi:eye-outline"]];
export const maintenance = x => PARTS.map(([k, lb, ic]) => {
  const z = x.s(k + "_remaining");
  return z && !unavailable(z) ? { k, lb, ic, v: num(z.state), btn: x.b("reset_" + (k === "sensor" ? "sensors" : k)) } : null;
}).filter(Boolean);

/** option values of the robot's selects, in Dutch */
export const VAC_LABELS = { Quiet: "Stil", Standard: "Normaal", Turbo: "Turbo", Max: "Max", Boost_IQ: "BoostIQ", Vacuum: "Zuigen", Mop: "Dweilen", "Vacuum and mop": "Zuigen + dweilen", "Mopping after sweeping": "Zuigen, dan dweilen", Normal: "Normaal", Narrow: "Grondig", Quick: "Snel", Low: "Laag", Medium: "Middel", High: "Hoog", Automatic: "Auto" };
const vl = v => VAC_LABELS[v] || v;

/** the current or last cleaning task (sensor.<robot>_task): what was cleaned, with which settings, started by whom */
export function vacTask(x) {
  const z = x.s("task"); if (!z || unavailable(z)) return null;
  const a = z.attributes || {}, src = { dashboard: t("dashboard"), automation: t("automatisering"), app: t("app"), schedule: t("schema"), button: t("knop"), home_assistant: "Home Assistant" }[a.source] || a.source;
  const md = [a.clean_mode && vl(a.clean_mode), a.fan_speed && a.clean_mode !== "Mop" && vl(a.fan_speed), a.water_level && a.clean_mode && a.clean_mode !== "Vacuum" && t("water {w}", { w: vl(a.water_level).toLowerCase() }), a.clean_intensity && vl(a.clean_intensity)].filter(Boolean).join(" · ");
  return { z, a, lbl: z.state === "Auto" ? t("Hele huis") : z.state, src, md, on: !!a.active };
}

export const vacStatus = s => ({ cleaning: t("Aan het stofzuigen"), docked: t("Gedockt"), idle: t("Stand-by"), paused: t("Gepauzeerd"), returning: t("Keert terug"), error: t("Fout") })[s?.state] || s?.state;
export const BUSY = ["cleaning", "paused", "returning"];

/** the same robot can be loaded twice (a test copy of the integration): keep one card per serial number, preferring the one
    with rooms, then the one that records tasks. Returns { kept, dropped }. */
export function dedupeVacuums(hass, vacuums) {
  const serial = e => { const d = hass?.devices?.[e.reg.device_id]; return d?.serial_number || (d?.identifiers || []).map(y => y[1]).join("|") || null; };
  const rank = e => (e.state?.attributes?.rooms || []).length * 10 + (Object.values(hass?.entities || {}).some(y => y.device_id === e.reg.device_id && /^sensor\..*_task$/.test(y.entity_id)) ? 1 : 0);
  const kept = [], dropped = [];
  for (const e of vacuums) {
    const k = serial(e), j = k ? kept.findIndex(y => serial(y) === k) : -1;
    if (j < 0) kept.push(e); else if (rank(e) > rank(kept[j])) { dropped.push(kept[j]); kept[j] = e; } else dropped.push(e);
  }
  return { kept, dropped };
}
