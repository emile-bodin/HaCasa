# Card layout contract

Every card is a member of one system: the same slots in the same order, the same spacing and control sizes, and the same compact variant on phones, tablets and in the two-row layout. The rules live in `src/styles.js` (the card section, `cardCompact()` and the tokens on `.card`); `src/graph.js` and `src/usage.js` bring their own tokens for their own bands.

## The slots

A card is a grid with one column for content and one for the corner:

```
 i         c        icon, and the corner state (absolute, top right)
 .         .        flexible gap
 n         n        title        (.n)
 s         s        status       (.s)
 .         .        flexible gap
 l         l        bottom line  (.lbl, one row of --lh)
```

Controls are not grid items. They are anchored to the bottom or the right edge, and the card reserves room for them through four tokens, so text can never run under them:

| token | what it reserves | set by |
|---|---|---|
| `--reserve` | space under the content for a bottom control row | `.pstrip` (sockets), `.appl` / `.acts` (button rows), `.media` (transport), `.climate` (control row) |
| `--rr` | space on the right for a control column | `.actions` (up / down), `.vs` (vertical slider), `.climate` (rail), `.hasspk` (sparkline), `.hassub` (sub-content) |
| `--rc` | how far the corner text moves left of the right edge | `.vs`, `.climate`, and `.actions` in a compact two-row card |
| `--rl` | space on the left | `.media` with artwork (the artwork panel) |

Padding is always `--cp` plus those four.

## Order

- **Base:** title above status. Lights, switches, covers, fans, locks, sensors (binary), cameras, groups, lists.
- **Hero** (`.card.hero`): the big value above its name. Climate (setpoint), plug (watts) and a value card that has a number. The hero rule sets the slot order once; the card only adds the class.
- **Caption variants** put the bottom line right under the status instead of at the bottom edge: media, climate and plug with a control row. The area and row templates are tokens (`--a-base`, `--a-capt`, `--a-hero`, `--a-hero-capt`, `--a-hero-foot`, `--a-cam` with their `--r-*` rows), and a card picks one with `--areas` / `--rows`.

## Geometry tokens

Defined once on `.card`, changed once for the compact variant:

| token | desktop | compact | what |
|---|---|---|---|
| `--cp` | 22px | 14px | padding |
| `--lh` | 28px | 24px | bottom line row |
| `--ib` | 36px | 26px | icon box and corner height |
| `--bh` | 34px | 30px | button rows (appliance, actions) |
| `--bh-sock` | 56px | 44px | socket buttons (the litter box card keeps 44px) |
| `--bh-media` | 42px | 34px | media transport buttons |
| `--bh-tile` | 52px | 40px | scene and group tiles |
| `--ctl-w` | 46px | 34px | the side control column |
| `--vs-w` | 12px | 8px | vertical slider |
| `--bg` | 10px | 6px | gap between content and the controls under it |
| `--gut` | 14px | 10px | gap between content and the furniture at its side |

The graph card adds `--gl-h`, `--gl-gap`, `--gl-nmt` and `--gl-dot` for its line band.

## Compact

"Compact" is one thing with two triggers: a phone or tablet (`max-width: 900px`), and the two-row layout on a wide screen (`.strip.rows2`, and `.compact` when the cards are under 160px high). The rules are written once in `cardCompact(all, compact)` and used for both. What only changes a size is a token; the rules in the function are the ones that hide, move or reorder something. They are placed after every module's own card rules, so they win by position.

## Preserved exceptions

These differ on purpose; each is a modifier class with its own rules:

- **Climate:** the setpoint rail on the right and the control row at the bottom (desktop); the rail only, with the bottom line at the edge (compact). Its name is one line.
- **Media:** artwork under the card with the text on a translucent panel (`.art`, `.appart`), the transport row at the bottom, the progress line (a bar along the bottom edge in compact). In two rows under 160px the icon and the corner state are hidden.
- **Plug with a power meter:** the sparkline on the right (hidden in compact), a footer row for the options.
- **Sub-content** (weather, waste, agenda): a glass column on the right; in compact the second item moves into the bottom line (`.lbl.mob`).
- **Appliance and action rows:** buttons in a row at the bottom; the bottom line is hidden when the row takes its place.
- **Graph:** a line band between the icon and the name; in compact the band shrinks and the average line goes; in two rows under 160px the period text goes too.
- **Lists, scenes, groups, people:** their inner layout (`.s` as a list, tiles) stays; only tile height and gaps follow the tokens.
- **Unavailable:** a centred three-row card without controls.
- **Camera:** name and state anchored at the bottom over a gradient.
- **Litter box:** the power strip card (`stripCard`) with the `.litter` modifier: same markup and slots, a cat icon, icon-only buttons at every width (no label under the icon), a 44px socket row and a one-line title. Its state (weight, cleaning, bin full) is the corner text, like a light's percentage, so the title is never hidden. Gap and icon size follow the compact tokens like every other strip.

## Checking it

`dev/layout-audit.mjs` renders the mock home in a real browser at seven sizes (desktop, small desktop, tablet and phone, each single row and two rows), measures the box of every region of every card and reports overlaps and anything sticking out of its card; it also compares two runs, and can lay out a contact sheet of a page. The mock home has a room of awkward cards for it (`?lab`: long names, unavailable devices, every kind of card). `npm run build && npm run layout` runs it (508 cards, 0 defects; the same run found 9 in the layout before this contract); the exit code is 1 when a card has a defect. See `card-layout-visual.html` in the repository root for the picture of the contract.
