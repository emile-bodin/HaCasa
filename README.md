<div align="center">

<img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/logo/hacasa-banner.svg" alt="HaCasa" width="280">

# HaCasa Nova

A room-first Home Assistant panel, based on [HaCasa Nova](https://github.com/damianeickhoff/HaCasa) by Damian Eickhoff and the [Homio](https://github.com/iamtherufus/Homio) design by iamtherufus.

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5?style=flat-square)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/emile-bodin/HaCasa?style=flat-square&label=release)](https://github.com/emile-bodin/HaCasa/releases)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.4%2B-18BCF2?style=flat-square)](https://www.home-assistant.io/)
[![License](https://img.shields.io/github/license/emile-bodin/HaCasa?style=flat-square)](https://github.com/emile-bodin/HaCasa/blob/main/LICENSE)

[Documentation](https://github.com/emile-bodin/HaCasa/tree/main/docs) · [Install](#install) · [Screenshots](#screenshots)

</div>

> 🏠 **A standalone, personal project.** This began as a fork of [damianeickhoff/HaCasa](https://github.com/damianeickhoff/HaCasa) and has been detached from it. I maintain it for my own household and give it its own versions (from `3.1.0`). It is not affiliated with or supported by the original author: for the original panel, go to [their repository](https://github.com/damianeickhoff/HaCasa). Everything good about the foundation is theirs. See [Thanks](#thanks).

> ⚠️ **Built for one home.** It is tested in the house it was made for and in the mock home (`dev/index.html`), nowhere else. Expect rough edges, try it next to your current dashboard rather than replacing it, and [open an issue](https://github.com/emile-bodin/HaCasa/issues/new/choose) if something breaks.

## What it is

HaCasa is a room-first panel for [Home Assistant](https://www.home-assistant.io/). It is a single JavaScript file that reads your home straight from Home Assistant:

- **Your areas become rooms.** Every entity assigned to an area (directly or through its device) shows up on that room's page. Add a lamp in Home Assistant and it appears; no dashboard to edit.
- **Everything is set up in the panel.** A four-step wizard on first open, then a settings page with tabs. Settings live in two layers: one for the **whole household** (set by an administrator, seen by everyone) and a **personal** layer that only holds what differs for you. They merge per field and survive updates.
- **No dependencies.** No button-card, card-mod, layout-card or theme required.

The look comes from [Homio](https://github.com/iamtherufus/Homio) by iamtherufus: big photo backgrounds, frosted-glass cards, a pill navigation and a lot of breathing room.

## What this version adds

Compared with HaCasa Nova 3.0.5 (details in the [changelog](CHANGELOG.md)):

- **Household and personal settings**, with a scope picker in the edit bar and the settings header.
- **A robot vacuum card and popup** (rooms, tasks, maintenance, dock), a **litter box card**, extra **appliance details** (SmartThings phases, month totals, remaining time) and an optional **two-row room layout**.
- **Smaller changes** to the idle screen (it drifts and dims at night), the attention list (one line per dead device) and the thermostat setpoint (shown at once).
- **A deploy workflow** with checks, a render smoke test, backups and rollback (see [Development](#development)).

## Features

| | |
|---|---|
| **Home view** | Greeting, date, indoor climate, weather with hourly forecast, a rotating line of things worth knowing (waste pickup, open doors, appointments), status pills and quick actions. |
| **Room pages** | One page per area with a photo, its temperature and humidity, and a scrolling strip of cards. Swipe or scroll between rooms. |
| **Cards** | Lights (vertical dimmer, brightness steps or colour dots), switches and smart plugs (live watts, kWh today, timers), media with artwork and transport, covers, thermostats (drag rail, modes, presets), fans, locks, vacuums, humidifiers, cameras, appliances (Home Connect, Miele …: programme, progress, finish time), groups, scenes and Jinja template cards. |
| **Pages** | Sensors (attention first, per room or per kind, trend bars), Energy (today per hour, biggest consumers), Automations (toggle, errors, last run), Cameras and System (CPU, memory, disk, network, updates). |
| **Attention** | Unavailable devices, low batteries, pending updates and persistent notifications in one place, with one-tap install for updates. |
| **Popups** | Every card opens a detailed popup: brightness, colour and colour temperature, climate modes, media volume, history of the last 24 hours, and a shortcut to Home Assistant's own dialog. |
| **Per-card settings** | Name, icon, tap and hold behaviour, bottom line, custom action buttons and template overrides per card, plus defaults per card type. |
| **Extras** | Search, presence pill, alarm keypad, doorbell camera popup, light scene presets per room, guest and vacation modes, idle screen, Dutch, English and German. |
| **Settings** | Household and personal layers, a setup wizard, export and import, a scope picker in the edit bar. |
| **Phone and tablet** | Built for wall tablets and phones alike: the strip becomes a two-column grid on phones. |

## Screenshots

<sub>Taken from HaCasa Nova 3.0.x; the newer cards are not in them yet.</sub>

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/room.png" alt="Room page"><br><sub><b>Room page</b> · photo, climate and a strip of cards</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/kitchen.png" alt="Kitchen"><br><sub><b>Appliances and plugs</b> · power strips, dishwasher programme and progress</sub></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/popup-light.png" alt="Light popup"><br><sub><b>Light popup</b> · brightness, colour and colour temperature</sub></td>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/popup-climate.png" alt="Climate popup"><br><sub><b>Climate popup</b> · target, modes, presets, every room's temperature</sub></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/sensors.png" alt="Sensors page"><br><sub><b>Sensors</b> · attention first, then every room</sub></td>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/energy.png" alt="Energy page"><br><sub><b>Energy</b> · now, today per hour, biggest consumers</sub></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/settings.png" alt="Settings"><br><sub><b>Settings</b> · everything in the panel, stored per user</sub></td>
    <td><img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/wizard.png" alt="Setup wizard"><br><sub><b>First run</b> · a four-step setup</sub></td>
  </tr>
</table>

<img src="https://raw.githubusercontent.com/emile-bodin/HaCasa/main/docs/assets/screenshots/phones.png" alt="HaCasa Nova on phones" width="100%">

## Install

You need Home Assistant **2024.4 or newer**. HaCasa Nova can run as its own sidebar panel (recommended) or as a card inside a dashboard.

### 1. Download with HACS

1. Open **HACS** in Home Assistant.
2. Open the menu (⋮, top right) and choose **Custom repositories**.
3. Add `https://github.com/emile-bodin/HaCasa` with type **Dashboard**.
4. Search for **HaCasa Nova**, open it and choose **Download**.
5. Reload your browser when HACS asks.

<details>
<summary>Manual download (without HACS)</summary>

1. Download `hacasa-nova.js` from the [latest release](https://github.com/emile-bodin/HaCasa/releases/latest).
2. Copy it to `/config/www/hacasa-nova/hacasa-nova.js`.
3. Use `/local/hacasa-nova/hacasa-nova.js` wherever the steps below say `/hacsfiles/HaCasa/hacasa-nova.js`.

</details>

### 2a. Add it as a sidebar panel (recommended)

Add this to `configuration.yaml` and restart Home Assistant:

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/HaCasa/hacasa-nova.js   # loads the HaCasa logo icon for the sidebar

panel_custom:
  - name: hacasa-nova
    url_path: hacasa
    sidebar_title: HaCasa
    sidebar_icon: hacasa:logo
    module_url: /hacsfiles/HaCasa/hacasa-nova.js
```

**HaCasa** now appears in the sidebar with the HaCasa logo. Open it and the setup wizard starts.

> 💡 Already have a `frontend:` section (for themes, for example)? Add `extra_module_url` to it instead of adding a second one. Without `extra_module_url` the panel still works; use `sidebar_icon: mdi:home-outline` then, because the logo icon only loads once the panel has been opened.

The icon works everywhere Home Assistant takes an icon, so `hacasa:logo` can also be used on your own cards.

### 2b. Or use it as a dashboard card (no YAML)

HACS registers the file as a dashboard resource for you. Then:

1. **Settings → Dashboards → Add dashboard → New dashboard from scratch**, then open it.
2. Edit the dashboard, change the view type to **Panel (single card)**.
3. Add a card of type **HaCasa Nova** (or paste the YAML below).

```yaml
type: custom:hacasa-nova-card
```

Inside a card the rooms are routed through the URL hash (`#/kitchen`), so the dashboard URL itself never changes.

### 3. Add room photos (optional)

Put a photo per room in `/config/www/images/rooms/`, named after the area: `Living room` → `living-room.jpg` (`.jpeg`, `.png` and `.webp` work too). The home view uses `home.jpg`. You can also set a picture on the area in Home Assistant, or choose a photo per page in the panel settings. Rooms without a photo get a calm gradient.

That's it. Everything else lives in the panel: **More → Panel settings**.

> 💡 **For the best experience**, make HaCasa Nova your start page and hide Home Assistant's sidebar. Both are one click per user; see [Best experience](https://github.com/emile-bodin/HaCasa/blob/main/docs/best-experience.md) in the docs, which also has tips for wall tablets.

## Documentation

The full guide is at **[the docs folder](https://github.com/emile-bodin/HaCasa/tree/main/docs)**: installation, the setup wizard, every card and its settings, the built-in pages, the optional theme for the rest of Home Assistant, and troubleshooting.

## Good to know

- **Admin features.** Template cards and your own ticker lines use Home Assistant's template renderer, installing updates calls `update.install`, and the System page asks the Supervisor for host info. These need an administrator account; for other users those parts stay empty.
- **Fonts.** The panel uses [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) from Google Fonts. Without internet access it falls back to the system font.
- **Languages.** English, Dutch and German, following your Home Assistant language. Other languages fall back to English. Translations are welcome: each language is one file in [`src/lang/`](https://github.com/emile-bodin/HaCasa/tree/main/src/lang), see [CONTRIBUTING](https://github.com/emile-bodin/HaCasa/blob/main/CONTRIBUTING.md#translations).

## Contributing

Bugs and ideas are welcome as [issues](https://github.com/emile-bodin/HaCasa/issues/new/choose); see [CONTRIBUTING.md](CONTRIBUTING.md) before sending a change. For the original v2 button-card HaCasa, see the [`legacy` branch](https://github.com/damianeickhoff/HaCasa/tree/legacy) of the original repository.

## Development

```bash
npm install
npm run watch            # rebuilds dist/hacasa-nova.js on every change
npm run deploy:dev       # check, build, smoke-test and install as the HaCasa-dev panel
npm run deploy:prod      # the same from a clean main, installed as the HaCasa panel, and tags the version
npm run rollback:dev     # (or rollback:prod) put the previous bundle back
```

`dev/index.html` runs the panel outside Home Assistant against a mock home (`dev/mock-hass.js`); add `?lang=nl` for Dutch. `dev/smoke.mjs` renders the panel in jsdom and walks the settings layers. Icons are drawn by `dev/make-icons.mjs` and inlined into the bundle by `build.mjs`. The workflow (dev first, then production) is described in the [development guide](https://github.com/emile-bodin/HaCasa/blob/main/docs/development.md).

## Thanks

**Thank you, Damian Eickhoff.** HaCasa started as your button-card dashboard that a whole household could use, and you rebuilt it from scratch as HaCasa Nova, in the open and under an MIT license. This project would not exist without that work, your design decisions and the care you put into the details (the wizard, the cards, the documentation, the translations). I have changed it to suit my house, but the foundation, the idea and most of the code are yours. Thank you for sharing it.

- **Design:** [Homio](https://github.com/iamtherufus/Homio) by [iamtherufus](https://github.com/iamtherufus). The panel would not look the way it does without it.
- **HaCasa and HaCasa Nova:** created by [Damian Eickhoff](https://github.com/damianeickhoff) with an AI coding assistant. HaCasa logo by [Fredrik Persson](https://github.com/fredrikpersson92).
- **This version:** maintained by [emile-bodin](https://github.com/emile-bodin); the changes in it were written together with [Claude Code](https://claude.com/claude-code).
- **Built with** [Lit](https://lit.dev). Icons are original, drawn for the project.
- **And everyone** who kept asking about HaCasa after the first version went quiet.

## License

[MIT](LICENSE), with the original copyright notice kept. The Homio design credit and the license notices of what is bundled are in [NOTICE.md](NOTICE.md).
