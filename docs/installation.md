# Installation

Tomte needs **Home Assistant 2024.4 or newer**. It ships as one file, `tomte.js`, that you can use in two ways:

- as a **sidebar panel** (recommended): its own entry in the sidebar, full screen, with clean URLs per room;
- as a **dashboard card**: no YAML at all, the panel lives inside a dashboard view.

Both use the same settings, so you can switch later.

## 1. Download

=== "HACS (recommended)"

    1. Open **HACS** in Home Assistant.
    2. Open the menu (⋮, top right) and choose **Custom repositories**.
    3. Add `https://github.com/emile-bodin/TomTe` with type **Dashboard**.
    4. Search for **Tomte**, open it and choose **Download**.
    5. Reload the browser when HACS asks.

    HACS installs the file at `/config/www/community/TomTe/tomte.js`, which Home Assistant serves as `/hacsfiles/TomTe/tomte.js`. HACS also adds it as a dashboard resource.

=== "Manual"

    1. Download `tomte.js` from the [latest release](https://github.com/emile-bodin/TomTe/releases/latest).
    2. Copy it to `/config/www/tomte/tomte.js`.
    3. Its URL is `/local/tomte/tomte.js`. Use that instead of the `/hacsfiles/…` URL below.
    4. For the card variant, add it as a resource yourself: **Settings → Dashboards → ⋮ → Resources → Add resource**, type *JavaScript module*.

## 2a. Sidebar panel

Add this to `configuration.yaml` and restart Home Assistant:

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/TomTe/tomte.js   # loads the Tomte logo icon for the sidebar

panel_custom:
  - name: tomte-panel
    url_path: tomte
    sidebar_title: Tomte
    sidebar_icon: tomte:logo
    module_url: /hacsfiles/TomTe/tomte.js
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

When a new version is out, administrators see a line in the notification row on the home page: **Tomte 3.x.x · update available**. Tap it to open Home Assistant's update dialog with the **changelog** (all release notes since your version) and an **Install** button. The same dialog is under **Settings → System → Updates → Tomte**. After installing, reload the browser.

Your settings are stored in Home Assistant, not in the file, so updates never touch them.

!!! note
    The notice comes from the update entity HACS creates (`update.tomte_update`). Installed without HACS? Then the panel asks GitHub for the latest release, at most twice a day. Turn the notice off under **More → Panel settings → General → Check for updates**.
