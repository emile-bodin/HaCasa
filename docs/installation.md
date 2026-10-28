# Installation

Tomte needs **Home Assistant 2024.4 or newer**. It ships as one file, `tomte.js`, that you can use in two ways:

- as a **sidebar panel** (recommended): its own entry in the sidebar, full screen, with clean URLs per room;
- as a **dashboard card**: no YAML at all, the panel lives inside a dashboard view.

Both use the same settings, so you can switch later.

## 1. Download

1. Download `tomte.js` and `loader.js` from the [latest release](https://github.com/emile-bodin/TomTe/releases/latest).
2. Copy both to `/config/www/tomte/` (so `/config/www/tomte/tomte.js` and `/config/www/tomte/loader.js`). Home Assistant serves that folder as `/local/tomte/`.

Home Assistant serves `/local` with a 31-day browser cache, so a `module_url` straight at `tomte.js` keeps showing the old version after an update. The loader asks the server for the current build of `tomte.js` (its ETag) and loads that one, so after an update a browser reload is enough. Use `/local/tomte/loader.js` in `module_url` and in `extra_module_url` below. (Without the loader `/local/tomte/tomte.js` works too, but you have to clear the browser cache after every update.)

For the dashboard-card variant add the loader as a resource: **Settings → Dashboards → ⋮ → Resources → Add resource**, URL `/local/tomte/loader.js`, type *JavaScript module*.

## 2a. Sidebar panel

Add this to `configuration.yaml` and restart Home Assistant:

```yaml
frontend:
  extra_module_url:
    - /local/tomte/loader.js   # loads the Tomte logo icon for the sidebar

panel_custom:
  - name: tomte-panel
    url_path: tomte
    sidebar_title: Tomte
    sidebar_icon: tomte:logo
    module_url: /local/tomte/loader.js
```

| key | value |
|---|---|
| `name` | must be `tomte-panel` (the element the file registers) |
| `url_path` | the address: `http://homeassistant.local:8123/tomte` |
| `sidebar_title` | whatever you like |
| `sidebar_icon` | `tomte:logo` for the Tomte logo, or any `mdi:` icon |
| `require_admin` | optional, `true` hides it from non-admin users |

!!! note "The logo icon and `extra_module_url`"
    `tomte:logo` is an icon that Tomte registers itself. `extra_module_url` loads the file when Home Assistant starts, so the icon is there before you open the panel. Already have a `frontend:` section (for themes, for example)? Add `extra_module_url` to it rather than adding a second `frontend:`. Without it the panel works fine; use an `mdi:` icon for `sidebar_icon` then.

    The icon works anywhere Home Assistant takes an icon, for example `icon: tomte:logo` on your own cards.

!!! tip "Make it the start page"
    In the panel go to **More → Panel settings → General → HA start page** to open Home Assistant on Tomte (per user). See [Best experience](best-experience.md) for that, hiding the sidebar and wall tablets.

## 2b. Dashboard card

1. **Settings → Dashboards → Add dashboard → New dashboard from scratch** and open it.
2. Click the pencil, open the view settings and set **View type** to **Panel (single card)**.
3. Add a card and pick **Tomte**, or use the YAML editor:

```yaml
type: custom:tomte-card
```

Inside a card the rooms are routed through the URL hash (`/dashboard-home/0#/kitchen`), so the dashboard URL itself never changes.

!!! note "Panel view only"
    The card fills the whole view. In a masonry or sections view it does not have room to work.

Optionally give the card a starting configuration. It is shared by all users, and each user can still change things in the panel settings:

```yaml
type: custom:tomte-card
config:
  title: Home.
  rooms: [living_room, kitchen, bedroom]
```

## 3. Open it

Open the panel and the [setup wizard](first-run.md) starts. Then add [room photos](photos.md) and you are done.

## Updating

When a new version is out, administrators see a line in the notification row on the home page: **Tomte 1.x.x · update available**. Tap it to open the release page on GitHub. To update, download `tomte.js` (and `loader.js` if it changed) from the release, replace the files in `/config/www/tomte/` and reload the browser. With the loader a normal reload is enough.

Your settings are stored in Home Assistant, not in the file, so updates never touch them.

!!! note
    The panel asks GitHub for the latest release, at most twice a day, and caches the answer in the browser. Turn the notice off under **More → Panel settings → General → Check for updates**.
