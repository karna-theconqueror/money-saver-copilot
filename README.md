# MoneySaver Copilot

**Find the free money you're already eligible for.**

Answer a few quick questions → get a matched list of Indian government benefits,
their estimated yearly value, a step-by-step checklist, official links, a
pre-filled application draft, and a shareable result card.

## Features (v2)

- **English + Hindi** full interface & scheme summaries (toggle in header)
- **60-second wizard** — income, age, gender, work, state, urban/rural, household flags
- **PIN code autofill** — type your 6-digit PIN, your state auto-detects
- **24 real schemes** including urban/rural-specific ones (PMAY-U vs PMAY-G, MGNREGS)
- **"Already claimed" tracking** — mark schemes you already get; totals update live
- **Saved progress** — results survive refresh (localStorage, never leaves your browser)
- **Shareable links** — your exact answers encoded in the URL, works in WhatsApp
- **WhatsApp share** + **1080×1080 result card PNG** (the viral loop)
- **Pre-filled application draft** using your name/address/mobile fields
- **Freshness badges** — "Verified: October 2026" on every scheme
- **Privacy-light analytics** — local event log (visits, completions, scheme views)
  shown in the About modal; plug in Plausible later via one script tag
- **SEO** — meta/OG tags, JSON-LD, and 24 generated static per-scheme pages
  (`schemes/<id>.html`, regenerate with `node build-pages.js`)

## Run locally

Open `index.html` in any browser. No build step, no server.

## Ship it

Static hosting works anywhere: GitHub Pages, Netlify, Cloudflare Pages, Vercel.
After deploying, replace `YOUR-DOMAIN` in the generated scheme pages' canonical tags.

## The 3-step growth playbook

1. **Week 1 — MVP ✅ (this repo)**
2. **Week 2 — Launch in one state** (AP/Telangana/Karnataka/Delhi have dense scheme
   coverage). Post real result screenshots as marketing.
3. **Month 2+ — Expand** languages (Telugu/Kannada/Tamil), district-level scheme
   data, then pitch banks/NGOs/fintechs for distribution or funding.

## Deliberately NOT included (needs external services — next phase)

| Item | What it needs |
|---|---|
| Live scheme-rate updates | A CMS or scheduled data pipeline |
| Real email/SMS result delivery | A backend (or WhatsApp Business API) |
| Government application-status tracking | Tie-ups / portal integrations per state |
| Bank/fintech lead-gen & affiliate links | Partner agreements |
| Telugu/Kannada/Tamil packs | Translators (structure ready in `langs.js`) |

## Accuracy & ethics

- Values are **estimates**; every scheme links to its official portal for verification.
- Not affiliated with any government. Never asks for Aadhaar numbers or bank details —
  everything runs and stays in the user's browser.
