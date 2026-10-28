# Changelog

Tomte started as a fork of [HaCasa Nova](https://github.com/damianeickhoff/HaCasa) by Damian Eickhoff (3.0.5 and the work after it). It is now a standalone project with its own name and version numbers, starting at 1.0.0. The history of HaCasa Nova before that is kept at the bottom.

## Unreleased

## 1.0.1 · 2026-10-28

- **Repository name:** links, the HACS path (`/hacsfiles/TomTe/tomte.js`, which is case-sensitive) and the update check use the repository's real name, `emile-bodin/TomTe`; the update check no longer compares the release URL case-sensitively.

## 1.0.0 · 2026-10-28

The first release of Tomte. It contains everything from HaCasa Nova up to its unreleased work after 3.0.5 (listed under *Carried over*) plus the changes below.

### Settings

- **Two layers:** the *household* (shared by everyone, stored in Home Assistant's system data, edited by administrators) and *personal* (user data, only what differs from the household). An administrator edits the household by default and switches to *only me* with the picker in the edit bar and the settings header. A first-time administrator without household settings shares their own with one choice (the personal copy is backed up first).
- **Merge per field:** everything merges deeply, so one personal change no longer replaces a whole room or card. A personal save stores only the difference with the layers below it, a household save stores only what differs from the defaults, and saving to the household drops the personal difference for the same page, card or field (*Back to household* in the edit bar does it by hand).
- **Settings → General → Storage:** shows the household version (revision, time, who) and where the personal layer wins, with *Clear my differences*. Import and export work on the layer being edited; export gives the merged settings. Household settings are polled once a minute, so a change shows on other devices without a reload.
- **The "not saved" marker** compares the draft with the layer it started from (and ignores key order), so it no longer comes back after saving.
- **Edit mode:** non-administrators still cannot edit; for administrators the edit bar shows the scope picker.

### Cards and popups

- **Robot vacuum:** the card shows an icon per state (docked, cleaning, error), the battery (from the robot's battery sensor), the current room or task while cleaning, area and time, and a red dot when a wear part is at zero hours. The popup has Start, Pause, Stop, Dock and Locate; the current or last task (what, with which settings, started by dashboard, automation, app or schedule); *Clean* with mode, suction, water and intensity chosen locally and a button per room plus the whole house; the robot's own tasks; the map; dock actions (empty the dust bin, wash and dry the mop); maintenance with a reset button and confirmation; last clean and totals; the robot's defaults; and its switches. A robot that is loaded twice (a test copy of the integration) shows once.
- **Litter box:** a device with Clean, Empty, Deodorize and similar switches becomes one card with a button per action, the status (cleaning, emptying, waste bin full or the weight) and a popup with the same actions, weight, bin and lifetime. New icon.
- **Appliances:** SmartThings machines are recognised (machine state, job state, completion time); the cycle phase is shown (washing, rinsing, spinning, drying …) and as a row in the popup; the end time only counts while a program runs; the card shows the remaining time next to the finish time; machines whose remote control is switched off cannot be started from the panel; month totals (energy, cost, cycles) from `sensor.<name>_energie_maand`, `_kosten_maand` and `_cycli_maand` show on the card and in the popup (*This month*); a plug that is not named like an appliance is a plain plug unless you switch the appliance features on; the same machine from two integrations (for example Home Connect and SmartThings) shows once.
- **Thermostat:** a setpoint you set in the panel shows at once and for ten seconds, until the device reports it.
- **Two rows:** a room page can show its cards in two rows (*Pages → Card layout*), sized to the space under the title on wide screens, with a compact layout for small cards; the edit strip follows. Media cards get a compact layout too.
- **Idle screen:** the content drifts a little every minute (against burn-in), dims between 23:00 and 06:00, and shows washers and dryers that are running. The tap that wakes it no longer presses the card underneath.
- **Attention:** an unavailable device is reported once by its device name, and not at all while another entity of that device still reports.
- **Smaller fixes:** waste dates with a time are read as the local day; the agenda reloads when the calendar list changes; the notification subscription is cleaned up and restored after a reconnect; the title block keeps its height when the ticker is empty; the Apple TV streaming match no longer catches every `tv` source.

### Project

- **Standalone:** the README, links, documentation and the update check (it now reads this repository's releases) point here. The demo video, the community links to the original's Discord and Discussions, the funding link and the call for testers are gone; the README says what this version is and thanks the original author. The MIT license and the original copyright notice stay.
- **Versions:** this project starts at 1.0.0.
- **Renamed to Tomte** (the Scandinavian household spirit that watches over the house): the element is `<tomte-panel>`, the card `custom:tomte-card`, the bundle `tomte.js`, the panel `/tomte` (dev: `/tomte-dev`), the icon `tomte:logo` and the settings key `tomte` (dev: `tomte_dev`). Settings saved under the old `hacasa_nova` keys, personal and household, are read automatically while the new keys are empty; the old keys are never written or deleted. A new logo replaces the HaCasa one (`dev/make-logo.mjs`).
- **Workflow:** `npm run deploy:dev` and `npm run deploy:prod` check (translations, syntax, a jsdom render smoke test), build, back up the bundle they replace and install it with a cache-busting loader; `deploy:prod` only runs from a clean `main` and tags the version; `rollback:dev` and `rollback:prod` restore the previous bundle; `npm run release -- <version>` writes the version and the changelog heading. See *Workflow* in the development guide.
- **Translations:** English and German for everything above (German falls back to English where it is missing).

### Carried over from HaCasa Nova (unreleased after 3.0.5)

- **Edit mode:** administrators pick **More → Edit room** (or *Edit home view*), or hold the page title. The strip then shows every card of the page: drag a card by its grip to reorder, × hides it, hidden cards stay in the row dimmed with an eye to bring them back, a tap opens the card settings, and an **Add card** tile sits at the end. *Done* in the bar at the bottom (the bottom nav on phones) leaves edit mode. This replaces the up/down list in Page settings for ordering.
- **Template cards as a library:** a template card now lives in **Settings → Template cards** as a reusable definition. The entity is chosen when you place it (`$entity` in the templates), and the template marks which fields (text, label, condition) are **filled in when placing**. Place the same template as often as you like through edit mode → Add card → Template; each copy keeps its own values, name and icon. A template can also be written right in the picker, once for that page or kept in the library. Template cards that were pinned to a page are moved to that page's cards automatically.
- **Card picker:** Add card opens a picker like Home Assistant's: *Devices* (light, switch or plug, door or window, motion, on/off sensor, value, media, thermostat, shutter, fan, lock, camera, other — then the matching entities), *Tomte cards* (weather, agenda, waste, energy, attention, home thermostat, scenes and light scenes of a room, a new group or graph configured right there) and *Your own cards* (a template from your library). A tap on a group or graph in edit mode edits it. Cards added by hand are removed with the bin in edit mode; the panel's automatic cards are hidden with × and come back dimmed with a banner.
- **Simple conditions:** the visibility condition can be a plain comparison (entity · is / is not / greater / less · value) next to the Jinja template; every card in edit mode, including the panel's own, gets this.
- **Add card:** from edit mode, add any light, switch, sensor, media player, cover, thermostat, lock, fan, camera… to the home view or a room. Entities without an area come first, entities from other rooms carry their room name. By default the card is added in Tomte only (`pages[room].add`); administrators can instead move the entity's area in Home Assistant. A plain sensor becomes a **value card**: the number large, the name under it, the last change at the bottom; a tap opens its details. Groups, graphs and template cards start from the same tile and land in their settings tab with the room filled in.
- **Card settings redone:** a live preview of the card next to the form, so every change shows before you save; settings grouped under Appearance, Behaviour, Action buttons and Advanced; choices as buttons with a *std* marker for what the Card defaults give you; action buttons as one row each with a service picker and a JSON check; templates folded away. Door, window and motion cards get a **Kind** choice for sensors with a missing or wrong device class.
- **Visible (condition):** every card, and every template card, can carry a Jinja condition. The card is hidden when it renders false, 0, no, off, none or nothing; *show when false* inverts it. For the home-maintenance use case from #167, and anything else that should only appear when it matters.
- **••• in popups:** the options button now opens a small menu over the popup instead of replacing its contents: Card settings, Open in Home Assistant, Open device (when the entity belongs to a device) and Hide on this page. On phones it is a sheet at the bottom. Esc or a tap outside closes just the menu.
- **Graph card:** Settings → Graphs adds a card with the line of one numeric sensor (temperature, humidity, power, …) over the last 3 hours to 7 days, on the home view or in a room. Current value in the corner, average and range under the name; tap opens the Home Assistant history dialog. Door, window and motion cards get the same layout with **Bottom → graph (on/off line)**.
- **Bottom bar on phones and tablets:** the menu button and the search button in the top bar are replaced by a bar at the bottom: Home, the current room (opens the room list, or the floors when navigation is set to floors), More and a search button. Search opens in the bar itself, with the results above it.
- **More on phone cards:** the waste card shows the pickup after the next one at the bottom, and the agenda card the appointment after the next one (on wider screens both were already in the side column).
- **Thermostat card:** the big number is now the current temperature; the setpoint stays on the slider and is listed under the name, next to one extra item you pick under Bottom line in the card settings (or for all thermostats under Card defaults): humidity or the active preset (automatic), heating time today, outside temperature, or nothing. Phones show that item at the bottom.

## HaCasa Nova history (before this project)

The versions below are the original project's.


## 3.0.5

- **Update notice:** when a new HaCasa Nova is out, administrators see it in the notification row on the home page. Tap it for the changelog and an Install button (Home Assistant's update dialog, from HACS). Installs without HACS check GitHub instead, at most twice a day. Can be turned off under Panel settings → General → Check for updates.
- Lines in the notification row can now be tapped when they lead somewhere.
- For developers: `npm run deploy:dev` builds a dev variant (`hacasa-nova-dev`) that runs next to the HACS install in your own Home Assistant. See the [development guide](https://damianeickhoff.github.io/HaCasa/development/).

## 3.0.4

Maintenance release; the panel works the same as 3.0.3.

- Build tool esbuild updated to 0.28.1 (security advisory GHSA-67mh-4wv8-2f99 affects only esbuild's development server, which HaCasa Nova does not use; the released file was never affected).
- README: a Community section and links to [GitHub Discussions](https://github.com/damianeickhoff/HaCasa/discussions) for questions, ideas and showing your setup.
- New CONTRIBUTING.md and SECURITY.md (report security problems privately via the Security tab).

## 3.0.3

README and docs only; the panel is unchanged since 3.0.2.

- A 40-second demo video, playing on the docs home page; the README header links to it.
- New docs page [Best experience](https://damianeickhoff.github.io/HaCasa/best-experience/): make HaCasa Nova your start page, hide the sidebar, wall tablet tips. Linked from the README.
- The Cards page in the docs shows a picture of every card.

## 3.0.2

- The README now displays properly inside HACS: one logo image that reads on light and dark backgrounds instead of a light/dark switch HACS cannot show, plain notes instead of GitHub-only alert boxes, and absolute links.

## 3.0.1

The HaCasa logo is back ([#159](https://github.com/damianeickhoff/HaCasa/issues/159)).

- The original HaCasa logo by Fredrik Persson is used again: in the panel (top left), the README and the docs site.
- New icon `hacasa:logo`, registered by the panel, for the sidebar (`sidebar_icon: hacasa:logo`) or anywhere else Home Assistant takes an icon. Load the file with `frontend: extra_module_url` so the icon is there at startup; see the [installation guide](https://damianeickhoff.github.io/HaCasa/installation/#2a-sidebar-panel).

## 3.0.0 · HaCasa Nova

The HaCasa reboot. A complete rewrite as a Home Assistant panel, built on the [Homio](https://github.com/iamtherufus/Homio) design by iamtherufus. Nothing from v2 carries over; v2 lives on the [`legacy`](https://github.com/damianeickhoff/HaCasa/tree/legacy) branch.

- One file, `hacasa-nova.js`, usable as a sidebar panel (`panel_custom`) or as a dashboard card (`custom:hacasa-nova-card`). No other frontend dependencies.
- Rooms built from Home Assistant areas, with photos, temperature and humidity.
- Home view with greeting, weather, notification line, status pills, quick actions and home cards.
- Cards for lights, switches, smart plugs, power strips, appliances, media, climate, covers, fans, locks, vacuums, humidifiers, sensors, cameras, groups, scenes, light scene presets and Jinja template cards.
- Built-in Sensors, Energy, Automations, Cameras and System pages.
- Setup wizard, settings page and per-card settings, stored per Home Assistant user.
- Search, presence, alarm keypad, doorbell camera popup, modes, idle screen.
- English and Dutch.

### Known issues

Tracked in [#158](https://github.com/damianeickhoff/HaCasa/issues/158). The main ones:

- Template cards, your own notification lines and the System page's host info need an administrator account; for other users they stay empty without a hint ([#144](https://github.com/damianeickhoff/HaCasa/issues/144)).
- The font is loaded from Google Fonts ([#145](https://github.com/damianeickhoff/HaCasa/issues/145)).
- Automatic room mode shows at most 9 rooms ([#146](https://github.com/damianeickhoff/HaCasa/issues/146)).
- Built-in page addresses are Dutch (`/instellingen`, `/sensoren` …) and an area with the same name can't be opened ([#147](https://github.com/damianeickhoff/HaCasa/issues/147)).
- The dashboard card only works in a Panel view ([#148](https://github.com/damianeickhoff/HaCasa/issues/148)).
- Rooms without a photo cause a burst of 404s in the browser console ([#149](https://github.com/damianeickhoff/HaCasa/issues/149)).
- The plug timer runs in the browser and stops when the panel closes ([#150](https://github.com/damianeickhoff/HaCasa/issues/150)).
