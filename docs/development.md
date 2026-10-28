# Development

HaCasa Nova is written with [Lit](https://lit.dev) and bundled with [esbuild](https://esbuild.github.io) into one file.

```bash
git clone https://github.com/emile-bodin/HaCasa.git
cd HaCasa
npm install
npm run watch            # rebuilds dist/hacasa-nova.js on every change
```

## Run it outside Home Assistant

The `dev/` folder runs the panel in a normal browser against a mock home:

```bash
npx http-server .. -p 8097 -c-1
```

then open `http://localhost:8097/HaCasa/dev/index.html` (adjust the folder name).

| page | what it is |
|---|---|
| `dev/index.html` | the panel with the mock home (`dev/mock-hass.js`); `?lang=nl` for Dutch, `#/kitchen` for a room |
| `dev/index.html?shot&popup=light:light.floor_lamp` | screenshot mode: no hints, animations off, a popup opened |
| `dev/card.html?fresh` | the dashboard card with empty settings, so the setup wizard shows |
| `dev/phones.html` | three phones side by side (the README image) |
| `dev/icons.html` | every icon |

Room photos are looked up under `/images/rooms/` of the served folder; without them the rooms get gradients.

## Inside Home Assistant: a dev panel next to the real one

`npm run build:dev` builds a variant that registers its own names (`<hacasa-nova-dev>`, `custom:hacasa-nova-dev-card`) and keeps its own settings (copied once from your real ones). It runs side by side with the version installed through HACS, so the household keeps the stable one while you experiment.

1. Tell the deploy script where your Home Assistant `www` folder is, in `deploy.local.json` (git-ignored):

    ```json
    { "target": "//homeassistant/config/www/hacasa-dev" }
    ```

    (any path to `/config/www/hacasa-dev`: a mapped network drive, a Samba share, …)

2. Add the dev panel to `configuration.yaml` once and restart Home Assistant:

    ```yaml
    panel_custom:
      - name: hacasa-nova-dev
        url_path: hacasa-dev
        sidebar_title: HaCasa dev
        sidebar_icon: mdi:flask-outline
        require_admin: true
        module_url: /local/hacasa-dev/hacasa-nova-dev-loader.js
    ```

3. After every change: `npm run deploy:dev` and reload the browser. The loader picks up the new build by itself, no restart needed.

Releases go the normal way: `npm run build`, commit `dist/hacasa-nova.js`, publish a GitHub release, and update your own install through HACS like any other user.

## Layout

```
src/
  panel.js      <hacasa-nova> element: navigation, header, strip, routing, popups
  card.js       <hacasa-nova-card> wrapper for dashboards
  model.js      registries and states → rooms and the home model
  cards.js      card renderers and tap/hold behaviour
  popups.js     popups, the setup wizard and the card settings form
  pages.js      Sensors, Energy, Automations, Cameras, System
  settings.js   the settings page and per-user storage
  features.js   quick actions, doorbell, updates, light scenes
  extras*.js    keypad, idle screen, history, statistics, calendar
  i18n.js       t(), the language list and fallbacks (the Dutch text is the key)
  lang/         one dictionary per language (en.js, …)
  styles.js     all CSS
icons/          SVG icons, drawn by dev/make-icons.mjs, inlined by build.mjs
dist/           the built file Home Assistant loads (committed for HACS)
docs/           this site (MkDocs Material)
```

## Translations

All text goes through `t()` from `src/i18n.js`. The Dutch text is the key; each other language is one file in `src/lang/` (`en.js` holds the English). To add a language:

1. Copy `src/lang/en.js` to `src/lang/<code>.js` (`de`, `fr`, … as Home Assistant names the language) and translate the values. The keys are the Dutch text used in the source; leave them as they are.
2. Add one line to `LANGS` in `src/i18n.js`: `de: { name: "Deutsch", locale: "de-DE", dict: de }`, plus the matching `import`.
3. Run `npm run i18n:check`. It shows how many keys are translated, and fails on a `{placeholder}` that differs from the key. `npm run i18n:check -- <code>` prints the keys still missing, ready to paste into your file.

A missing or empty key falls back to English, so a partial translation works. The panel picks the language from the Home Assistant profile (`de-CH` uses `de`); users can override it in the panel settings. Check long words with `?lang=<code>` in `dev/index.html`.

Pull requests are welcome.

## Releasing

1. Bump `version` in `package.json` and add the changes to `CHANGELOG.md`.
2. `npm run build` and commit `dist/hacasa-nova.js`.
3. Tag `vX.Y.Z` and publish a GitHub release; HACS picks it up.

## Workflow: dev, then production

This repository is a standalone project with two panels in Home Assistant: **HaCasa-dev** (`/hacasa-dev`, bundle `hacasa-nova-dev`, settings key `hacasa_nova_dev`) and **HaCasa** (`/hacasa`, bundle `hacasa-nova`, settings key `hacasa_nova`). They keep separate settings, so a test in dev never touches production. Versions are `major.minor.patch` and start at 1.0.0; the dev build adds `-dev`.

1. **Branch.** `git switch -c feature/<name>`.
2. **Dev.** `npm run deploy:dev` checks the translations, builds the current branch, syntax-checks the bundle, runs the render smoke test (`dev/smoke.mjs`, jsdom) and installs the bundle in `/config/www/hacasa-nova-dev` (override with `HACASA_TARGET` or `deploy.local.json`). Reload the browser: the loader picks up the new build. `npm run rollback:dev` puts the previous bundle back.
3. **Changelog.** Describe the change under `## Unreleased` in `CHANGELOG.md` as you go, in the same commit as the change.
4. **Merge** the branch into `main` (a pull request on GitHub, or locally).
5. **Release.** On a clean `main`: `npm run release -- 1.0.1`. It writes the version into `package.json` and the lock file, turns `## Unreleased` into `## 1.0.1 · <date>` and commits. Patch for fixes, minor for new features, major for breaking changes of the stored settings.
6. **Production.** `npm run deploy:prod` refuses to run unless you are on a clean `main` (`--force` skips that), runs the same checks, installs into `/config/www/hacasa-nova` and tags the commit `v1.0.1`. Then `git push origin main --tags`. `npm run rollback:prod` restores the previous production bundle.

The last ten replaced bundles per panel are kept in `.deploy-backups/` (git-ignored). Promoting does not have to wait: dev is where you test, and you decide when a change is good enough for production.
