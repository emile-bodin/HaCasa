// Claude Code usage card: the 5-hour session and the weekly limit, read from the sensors of a Claude usage integration
// (percentages with the moment each window resets). Added to a page through Bewerken → Kaart toevoegen → Claude Code.
import { html, nothing } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { t } from "./i18n.js";
import { num, unavailable, relTime } from "./util.js";
import { pressDir, cardCfg, icoFor, ua } from "./cards.js";
import { loadGraph, line } from "./graph.js";

const WINDOWS = { session: { ms: 5 * 3600000, label: "Sessie (5 uur)", attr: "session_resets_at" }, week: { ms: 7 * 86400000, label: "Week", attr: "weekly_resets_at" } };
const WARN = 70, CRIT = 90, STALE_MS = 30 * 60000, PACE_SLACK = 10;

/** the four sensors: from Settings → Claude Code, else found by name (sensor.claude_5_h_session, sensor.claude_week, …) */
export function claudeSensors(p) {
  const set = p.config.home?.claude || {}, ids = Object.keys(p.hass?.states || {}).filter(id => id.startsWith("sensor.") && /claude/i.test(id));
  const find = (win, reset) => ids.find(id => (win === "session" ? /(session|5_?h)/ : /week/).test(id) && /reset/.test(id) === reset) || null;
  return { session: set.session || find("session", false), week: set.week || find("week", false), sessionReset: set.sessionReset || find("session", true), weekReset: set.weekReset || find("week", true) };
}
export const claudeAvailable = p => { const s = claudeSensors(p); return !!(s.session || s.week); };

/** the moment a window resets: the sensor's attribute (a timestamp), else the reset sensor's text ("17:50" or "29/10 00:00") */
function resetAt(p, state, resetId, attr) {
  const a = state?.attributes?.[attr], d = a ? new Date(a) : null;
  if (d && !isNaN(d)) return d;
  const txt = resetId ? p.hass.states[resetId]?.state : null, m = /^(?:(\d{1,2})\/(\d{1,2}) )?(\d{1,2}):(\d{2})$/.exec(String(txt || ""));
  if (!m) return null;
  const now = new Date(), at = new Date(now.getFullYear(), m[2] ? +m[2] - 1 : now.getMonth(), m[1] ? +m[1] : now.getDate(), +m[3], +m[4]);
  if (!m[1] && at < now) at.setDate(at.getDate() + 1);                     // a bare time is the next one
  if (m[1] && at < now - 86400000 * 30) at.setFullYear(at.getFullYear() + 1);
  return at;
}
/** "2 u 55 min", "55 min", "3 d 4 u" */
export function span(ms) {
  const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60);
  if (m < 60) return t("{m} min", { m });
  if (h < 48) return t("{h} u {m} min", { h, m: m % 60 });
  return t("{d} d {h} u", { d: Math.floor(h / 24), h: h % 24 });
}

/** everything the card and the popup show about one window */
export function claudeWindow(p, kind) {
  const sensors = claudeSensors(p), id = sensors[kind], w = WINDOWS[kind];
  if (!id) return null;
  const s = p.hass.states[id], down = !s || unavailable(s), pct = down ? null : num(s.state);
  const reset = down ? null : resetAt(p, s, sensors[kind + "Reset"], w.attr), left = reset ? reset - Date.now() : null;
  const elapsed = left != null ? Math.min(1, Math.max(0, 1 - left / w.ms)) : null;
  const last = s?.attributes?.last_success_at ? new Date(s.attributes.last_success_at) : null, stale = !!last && Date.now() - last > STALE_MS;
  const status = s?.attributes?.state && s.attributes.state !== "ok" ? String(s.attributes.state) : null;
  return { kind, id, state: s, down, pct, reset, left, elapsed, pace: pct != null && elapsed != null ? (pct > elapsed * 100 + PACE_SLACK ? "over" : "within") : null,
    level: pct == null ? "" : pct >= CRIT ? "crit" : pct >= WARN ? "warn" : "ok", last, stale, status, label: t(w.label) };
}
const pctText = v => v == null ? "–" : `${Math.round(v)} %`;

export function claudeCard(p) {
  const wins = ["session", "week"].map(k => claudeWindow(p, k)).filter(Boolean);
  if (!wins.length) return null;
  const cfg = cardCfg(p, "claude"), down = wins.every(w => w.down), stale = wins.some(w => w.stale), over = wins.some(w => w.pace === "over");
  const corner = wins.find(w => w.status)?.status || (stale ? t("verouderd") : over ? t("boven schema") : "");
  const worst = wins.reduce((a, w) => (w.pct ?? 0) > (a ?? 0) ? w.pct : a, null);
  return html`<div class=${classMap({ card: true, claude: true, unavailable: down, stale, over, on: worst >= CRIT })} ${pressDir(p, { tap: () => p.openPopup({ type: "claude" }) })}>
    ${down ? ua() : nothing}
    <div class="i">${icoFor(p, "claude", "mdi:creation", null)}</div>
    <div class="c">${corner}</div>
    <div class="n">${cfg.name || "Claude Code"}</div>
    <div class="s">${wins.map(w => html`<div class=${"cm " + w.level}>
      <span class="cl">${w.label}${w.left != null ? html`<em>${t("reset over {t}", { t: span(w.left) })}</em>` : nothing}</span><b>${pctText(w.pct)}</b>
      <i class="bar"><u style=${`width:${Math.min(100, w.pct ?? 0)}%`}></u>${w.elapsed != null ? html`<s style=${`left:${(w.elapsed * 100).toFixed(1)}%`} title=${t("Verstreken deel van het venster")}></s>` : nothing}</i></div>`)}</div>
  </div>`;
}

/** body of the popup: the numbers, whether the pace is on schedule, and the history of both windows */
export function claudePopup(p, li) {
  const wins = ["session", "week"].map(k => claudeWindow(p, k)).filter(Boolean);
  const hist = (w, hours) => {
    const key = "claude:" + w.kind, h = p.graphHist?.[key];
    if (w.id && (!h || Date.now() - h.at > 5 * 60000 || h.hours !== hours)) loadGraph(p, { id: key, entity: w.id, hours });
    return html`<div class="vs">${w.label} · ${hours === 24 ? t("Afgelopen 24 uur") : t("Afgelopen {n} dagen", { n: hours / 24 })}</div><div class="cgraph">${line(h?.pts || [])}</div>`;
  };
  return html`
    <ul>${wins.flatMap(w => [
      li("mdi:timer-sand", w.label, pctText(w.pct), { on: w.level === "crit", sub: w.left != null ? t("reset over {t}", { t: span(w.left) }) + " · " + w.reset.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }) : "", onclick: () => p.moreInfo(w.id) }),
      w.pace ? li("mdi:speedometer", t("Tempo"), w.pace === "over" ? t("boven schema") : t("binnen schema"), { on: w.pace === "over", sub: t("{u} % gebruikt · {e} % van het venster verstreken", { u: Math.round(w.pct), e: Math.round(w.elapsed * 100) }) }) : null,
    ]).filter(Boolean)}
    ${wins.some(w => w.last) ? li("mdi:update", t("Laatst bijgewerkt"), relTime(wins.find(w => w.last).last.toISOString()), { on: wins.some(w => w.stale) }) : nothing}</ul>
    ${wins.map(w => hist(w, w.kind === "week" ? 168 : 24))}`;
}

export const claudeStyles = `
  /* ===== Claude Code card: two meters (session, week) with a tick for where the window's time stands ===== */
  .card.claude .s{display:grid;gap:10px;margin-top:6px;color:inherit}
  .card.claude .cm{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;align-items:baseline}
  .card.claude .cl{font-size:12px;color:var(--fg-2);letter-spacing:.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .card.claude .cl em{font-style:normal;margin-left:8px;opacity:.65;font-size:11px}
  .card.claude .cm b{font-size:16px;font-weight:700;letter-spacing:-.4px;color:var(--fg)}
  .card.claude .bar{grid-column:1/-1;position:relative;display:block;height:6px;border-radius:3px;background:rgba(255,255,255,.14)}
  .card.claude .bar u{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#fff;transition:width .6s ease}
  .card.claude .cm.warn .bar u{background:#f2b63a}
  .card.claude .cm.crit .bar u{background:#f27a5c}
  .card.claude .cm.crit b{color:#f27a5c}
  .card.claude .bar s{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;border-radius:1px;background:rgba(255,255,255,.8)}
  .card.claude.over .c,.card.claude.stale .c{color:#f2b63a}
  .popup .cgraph{height:56px;margin:4px 0 14px}
  .popup .cgraph svg{display:block;width:100%;height:100%;overflow:visible}
  @media (min-width:901px){ :where(.strip.rows2.compact) .card.claude .cl em{display:none} :where(.strip.rows2.compact) .card.claude .s{gap:7px} }
  @media (max-width:900px){ .card.claude .cl em{display:none} .card.claude .s{gap:8px;margin-top:4px} .card.claude .cm b{font-size:14px} .card.claude .cl{font-size:11px} }
`;
