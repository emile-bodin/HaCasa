---
hide:
  - navigation
---

<div class="hero" markdown>

![HaCasa](assets/logo/hacasa-white.svg#only-dark){ width="300" }
![HaCasa](assets/logo/hacasa-color.svg#only-light){ width="300" }

# HaCasa Nova

<p class="tag">A room-first Home Assistant panel, based on HaCasa Nova by Damian Eickhoff and the <a href="https://github.com/iamtherufus/Homio">Homio</a> design by iamtherufus.</p>

[Install it](installation.md){ .md-button .md-button--primary } [View on GitHub](https://github.com/emile-bodin/HaCasa){ .md-button }

</div>

!!! warning "Built for one home"
    This panel is tested in the house it was made for and in the mock home, nowhere else. Expect rough edges, try it next to your current dashboard rather than replacing it, and [report what you run into](https://github.com/emile-bodin/HaCasa/issues/new/choose).

## What it is

HaCasa Nova is a full-screen panel for [Home Assistant](https://www.home-assistant.io/). It turns your **areas** into rooms, each with its own photo and a strip of cards, and puts a calm home view in front of them: greeting, weather, what needs attention, and the things you use every day.

It is a single JavaScript file. There is no YAML dashboard to maintain and nothing else to install: no button-card, no card-mod, no layout-card. Add a device to an area in Home Assistant and it shows up in the right room by itself.

## Where it comes from

This is a standalone project that began as a fork of **HaCasa Nova** by Damian Eickhoff, which rebuilt the original button-card HaCasa as a native panel on the [Homio](https://github.com/iamtherufus/Homio) design. Thank you, Damian: the idea, the design decisions and most of the code are yours. This version keeps your MIT license and adds household and personal settings, a robot vacuum card, a litter box card, more appliance details and a two-row room layout. For the original, see [damianeickhoff/HaCasa](https://github.com/damianeickhoff/HaCasa).

## Highlights

<div class="grid2" markdown>

<figure markdown>
![Room page](assets/screenshots/room.png)
<figcaption>Rooms come straight from your Home Assistant areas.</figcaption>
</figure>

<figure markdown>
![Light popup](assets/screenshots/popup-light.png)
<figcaption>Every card opens a detailed popup.</figcaption>
</figure>

<figure markdown>
![Sensors page](assets/screenshots/sensors.png)
<figcaption>Sensors, energy, automations, cameras and system pages are built in.</figcaption>
</figure>

<figure markdown>
![Settings](assets/screenshots/settings.png)
<figcaption>Everything is configured inside the panel and stored per user.</figcaption>
</figure>

</div>

![HaCasa Nova on phones](assets/screenshots/phones.png)

## Where next

- **[Installation](installation.md)**: HACS, then a sidebar panel or a dashboard card.
- **[First run](first-run.md)**: the four-step setup.
- **[Best experience](best-experience.md)**: start page, hidden sidebar, wall tablets.
- **[Cards](cards.md)**: what every card does and how to change it.
- **[Settings](settings.md)**: a tour of the settings page.
- **[Issues](https://github.com/emile-bodin/HaCasa/issues)**: bugs, questions and ideas.
