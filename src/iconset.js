// Registers the Tomte logo as an icon set, so `tomte:logo` works anywhere Home Assistant takes an icon:
// the sidebar (panel_custom sidebar_icon), cards, ha-icon. Load the bundle early with frontend: extra_module_url
// for the sidebar icon to show before the panel is opened.
const VIEWBOX = "0 0 500 500";
// the Tomte mark: a tomte's drooping cap that is also a little house with a door (dev/make-logo.mjs draws the logo files)
const LOGO = "M62 392C98 246 168 104 270 54C318 32 372 52 398 108C402 118 396 124 388 118C356 96 330 130 324 178C316 250 358 330 438 392Z" +
  "M40 392H460V436A28 28 0 0 1 432 464H68A28 28 0 0 1 40 436Z" +
  "M222 464H278V420A28 28 0 0 0 222 420Z";
const ICONS = { logo: LOGO };

window.customIconsets = window.customIconsets || {};
if (!window.customIconsets.tomte) window.customIconsets.tomte = async name => ICONS[name] ? { path: ICONS[name], viewBox: VIEWBOX } : {};
// older frontends and other tools look in customIcons
window.customIcons = window.customIcons || {};
if (!window.customIcons.tomte) window.customIcons.tomte = { getIcon: async name => ICONS[name] ? { path: ICONS[name], viewBox: VIEWBOX } : {}, getIconList: async () => Object.keys(ICONS).map(name => ({ name })) };
