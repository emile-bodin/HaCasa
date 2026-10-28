// Writes the Tomte logo files: docs/assets/logo/*.svg, the in-panel mark icons/tomte.svg and the path used by src/iconset.js.
// The mark is a tomte's drooping cap that is also a little house with a door. `node dev/make-logo.mjs`
import { writeFileSync, mkdirSync } from "node:fs";

// 500 x 500; the door is wound the other way, so it is a hole under the default (nonzero) fill rule
export const MARK = "M62 392C98 246 168 104 270 54C318 32 372 52 398 108C402 118 396 124 388 118C356 96 330 130 324 178C316 250 358 330 438 392Z" +
  "M40 392H460V436A28 28 0 0 1 432 464H68A28 28 0 0 1 40 436Z" +
  "M222 464H278V420A28 28 0 0 0 222 420Z";
const CORAL = "#f27a5c", NIGHT = "#242d39", font = `font-family="Hanken Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700"`;
const mark = (fill, attrs = "") => `<path d="${MARK}" fill="${fill}"${attrs}/>`;
const svg = (viewBox, body, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra}>${body}</svg>\n`;
const lockup = (markFill, textFill) => svg("0 0 1000 300", `<g transform="translate(10 25) scale(.5)">${mark(markFill)}</g><text x="290" y="205" font-size="190" letter-spacing="-4" ${font} fill="${textFill}">tomte</text>`);
const dir = "docs/assets/logo"; mkdirSync(dir, { recursive: true });
const out = (f, s) => writeFileSync(`${dir}/${f}`, s);

for (const [name, c] of [["white", "#fff"], ["black", "#000"], ["color", CORAL]]) out(`tomte-mark-${name}.svg`, svg("0 0 500 500", mark(c)));
out("tomte-white.svg", lockup("#fff", "#fff"));
out("tomte-black.svg", lockup("#000", "#000"));
out("tomte-color.svg", lockup(CORAL, "#2a2430"));
out("tomte-banner.svg", svg("0 0 1200 400", `<rect width="1200" height="400" rx="56" fill="${NIGHT}"/><g transform="translate(205 50)">${`<g transform="translate(10 25) scale(.5)">${mark(CORAL)}</g><text x="290" y="205" font-size="190" letter-spacing="-4" ${font} fill="#fff">tomte</text>`}</g>`));
const fav = (bg, fg) => svg("0 0 64 64", `<rect width="64" height="64" rx="14" fill="${bg}"/><g transform="translate(9 9) scale(.092)">${mark(fg)}</g>`);
out("favicon.svg", fav(NIGHT, CORAL)); out("tomte-white-favicon.svg", fav(NIGHT, "#fff")); out("tomte-black-favicon.svg", fav("#fff", "#000"));
writeFileSync("icons/tomte.svg", svg("0 0 500 500", mark("#fff")));
console.log("logo files written");
