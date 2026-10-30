# Announcements

A quick action of the type **Omroep** (announcement) plays a spoken message with a chime on the speakers you choose, for example *"We gaan eten"* on the speakers in the kids' rooms. The button sits under the greeting like the other quick actions. Tap it and a list of the speakers opens; tap a speaker (or *All*) and the message plays there. Whatever was playing on that speaker is paused and carries on afterwards.

## Requirements

An announcement is not something Tomte does on its own. It needs these in Home Assistant:

| Requirement | Why |
|---|---|
| [**Chime TTS**](https://github.com/nimroddolev/chime_tts) (HACS) | builds the audio file: chime, spoken message and an optional chime after it |
| A **text-to-speech** platform, for example Google Translate (`tts.google_nl_nl`) | speaks the message |
| **Music Assistant** with the speakers added as players | plays the file as an *announcement*: it pauses what is playing, plays the message and resumes the queue. Only Music Assistant players can be ticked in Tomte |
| An **external URL** (Settings → System → Network) that the speakers can reach | the audio file is served from Home Assistant's `/local/` folder |
| The script **`script.omroep_afspelen`** below | Tomte calls it; it ties the pieces together |

A speaker that is not a Music Assistant player (a plain Cast entity, for instance) is not offered in the list: playing on it would interrupt the music and not bring it back.

### The script

Add it to `scripts.yaml` (or a package). Change `tts_platform`, `language` and `tld` to your own.

```yaml
omroep_afspelen:
  alias: Omroep afspelen
  mode: queued
  fields:
    message:
      name: Bericht
      required: true
      selector:
        text:
    speakers:
      name: Speakers
      required: true
      selector:
        entity:
          multiple: true
          filter:
            domain: media_player
            integration: music_assistant
    chime_path:
      name: Chime ervoor
      description: Preset or path; empty is no chime.
      default: airport
      selector:
        text:
    end_chime_path:
      name: Chime erna
      description: Preset or path; empty is no chime.
      default: ""
      selector:
        text:
    announce_volume:
      name: Volume
      description: Volume of the announcement, 1-100.
      default: 30
      selector:
        number:
          min: 1
          max: 100
  sequence:
    - action: chime_tts.say_url
      data: >-
        {{ {'message': message, 'tts_platform': 'tts.google_nl_nl', 'language': 'nl', 'tld': 'nl'}
           | combine({'chime_path': chime_path | default('airport')} if chime_path | default('airport') else {})
           | combine({'end_chime_path': end_chime_path} if end_chime_path | default('') else {}) }}
      response_variable: omroep
    - condition: template
      value_template: "{{ omroep.success | default(false) and omroep.url | default('') | length > 0 }}"
    - action: music_assistant.play_announcement
      target:
        entity_id: "{{ speakers }}"
      data:
        url: "{{ omroep.url }}"
        use_pre_announce: false
        announce_volume: "{{ announce_volume | default(30) | int }}"
```

Reload scripts afterwards (*Developer tools → YAML → Scripts*). You can try it first from *Developer tools → Actions*: run `script.omroep_afspelen` with a message and one speaker.

## Setting it up

**Settings → Quick actions → + quick action**, then choose the type **Announcement**:

| Field | What it does |
|---|---|
| **Label** and **icon** | the button under the greeting |
| **Message** | the text that is spoken |
| **Chime before** | any Chime TTS preset, or *none*. Default *Airport* |
| **Chime after** | any Chime TTS preset, or *none*. Default *none* |
| **Volume** | 1–100 % in steps of 5 with the **−** and **+** buttons. Default 30 % |
| **Speakers** | a tick list of all available Music Assistant players, named after the area they are in (the Nest Mini in the area *Justin* is listed as *Justin*). Tick one or more |

Make one button per message: add another announcement with its own message, chimes and speakers.

## Good to know

- With a single ticked speaker the popup lists just that speaker; with more, an **All** row plays on every ticked speaker at once.
- The volume is the volume of the announcement (chimes and voice). Music Assistant puts the speaker back to its own volume afterwards.
- Nothing happens when the message is empty or no speaker is ticked: the button is hidden until both are set.
- If the file cannot be made (the TTS service is down), the script stops after the first step and nothing plays.
