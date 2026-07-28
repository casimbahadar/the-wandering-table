# GDD — The Wandering Table

*Tagline: "an open table for every adventurer." Store subtitle: "5E-Compatible Tabletop RPG." Campaign one: The Lantern Road.*

*GDD-lite, v1 — 2026-07-27. Owner: Casim. Name, setting, tone, pricing are Casim's forks and undecided.*

## What this is

A premium buy-once mobile game (iOS/Android) that recreates the feel of playing fifth-edition-compatible tabletop at a real table: a GM voice narrating, visible dice you roll yourself, real rules, a shared map. No microtransactions, no subscription; all launch content included, optional paid DLC later.

**Pillars:**
1. **You are at a table.** GM voice, your dice, your sheet, a map between you. The tabletop-simulator framing IS the app's identity, not a mode.
2. **Real rules, gently taught.** SRD 5.2 mechanics with Guided mode (default: GM suggests actions with reasons, plain-language math) and an Expert toggle. Beginner-friendly and veteran-legible is a hard requirement.
3. **Rolling is the fun.** Every player d20 and every player damage/healing die is hand-rolled. Validated in playtest: the two-tap attack (to-hit, then damage) reads as payoff, not friction.
4. **Long playability.** Authored Campaign mode + Dice Dungeon roguelite on one shared rules engine. Campaigns are the product's spine (Casim's stated priority).

## Market position (research 2026-07)

Free "D&D app" space = companion tools (character sheets, bestiaries, dice rollers), thin ad-driven choice-text RPGs, premium non-5e RPGs, and F2P gacha. No buy-once app does actual tabletop-feel 5e play with visible dice, skill checks, GM voice, and real rules. That is the gap this fills.

## Licensing & legal (verified against the SRD 5.2 PDF legal page, 2026-07-27)

- SRD 5.2 is CC-BY-4.0: irrevocable, commercial use allowed.
- **Required attribution statement** (already embedded in-app, wording verified verbatim): *"This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode."*
- No other attribution to Wizards anywhere. "Compatible with fifth edition" phrasing is explicitly permitted.
- Never use: "D&D"/"Dungeons & Dragons" in name or marketing, Wizards-owned monsters (beholders, mind flayers, etc.), Wizards settings. Where content is omitted from the SRD, we design our own equivalents.

## Engineering canon

- Slices: single-file HTML, zero dependencies, raw Web Audio, mobile-first. Production may modularize but the zero-dependency / raw-Web-Audio canon holds.
- Game logic lives between `/* CORE-START */` and `/* CORE-END */` markers — pure functions, no DOM/timers/audio. The test harness extracts and runs the shipped CORE (never a copy).
- Ship = test: the Guided-mode suggestion brain IS the harness's "smart" agent.
- Every build passes: unit checks, scene-graph walk, Monte-Carlo balance assertions, anti-degenerate proofs, and a jsdom smoke that plays win + loss through the real DOM.
- Store path: Capacitor wrap (web-to-app-store pipeline; not yet exercised for this project).

## Modes

- **Campaign** (authored, branching): scene graph of narrated nodes → skill checks with consequences → positional combats whose openers are set by scene outcomes. Proven in slices 1–3.
- **Dice Dungeon** (roguelite): procedurally assembled runs on the same rules engine. Spec below is a sketch; forks open.
- One rules engine behind an interface; SRD 5.1 ruleset / homebrew are possible later DLC, NOT launch.

## Rules engine — scope & fidelity

| Rule | Status | SRD 5.2 fidelity |
|---|---|---|
| d20 checks, DC, adv/dis (incl. cancellation) | in | faithful |
| Crits (double damage dice), nat-1 auto-miss | in | faithful |
| Move (speed 6 tiles = 30 ft, 8-dir) + action + bonus action | in | faithful shape |
| Opportunity attacks (leave reach → free swing) | in | simplified: start-adjacent & end-not-adjacent, not per-step path |
| Disengage (action; slice grants a fresh move after) | in | simplification — 5e splits movement instead |
| Dodge/Defend (attackers at dis until your next turn) | in | faithful (expiry unit-tested) |
| Ranged attack with adjacent enemy → disadvantage | in | faithful |
| Goblin Nimble Escape (bonus Disengage) | in | faithful; Hide half omitted |
| Potion as bonus action | in | 2024 rule, high confidence — confirm vs SRD 5.2 equipment ch. before v1 |
| Line of sight (Bresenham, trees/walls block) | in | reasonable approximation of cover; real cover AC bonuses deferred |
| Dash, Hide, difficult terrain, opportunity-attack reactions per-round tracking | deferred | v1 items |
| Class kits (1 signature action / bonus each) | in | deliberately simplified from full level-1 kits |

**Monster fidelity — deliberate solo-tune deviations (recorded, not silent):**

| Stat | SRD 5.2 Goblin Warrior | Our Stabber/Archer |
|---|---|---|
| AC | 15 | 15 |
| HP | 10 (3d6) | 7 |
| Attack | +4 | +4 |
| Damage | 1d6+2 (scimitar or shortbow) | 1d6+1 |
| Traits | Nimble Escape (Disengage or Hide) | Nimble Escape (Disengage only) |

Rationale: SRD encounters assume a party of four; a solo level-1 hero vs two SRD-baseline goblins is Deadly-tier (v1 sims: 33–55% smart win rates). Solo tuning: primary stat 16 (2024-style background bonus), +3 HP "hardened by the road," goblin HP/damage reduced. **RESOLVED 2026-07-27 by rules-fidelity mandate (pending veto):** production uses SRD-faithful statblocks; balance comes from encounter budgets, not stat edits. Solo-tune above is slice-only history.

## Balance findings (slice 3, 3000 runs/cell, harness-enforced)

| Class | smart, scene edges | smart, even | smart, ambushed | naive, even |
|---|---|---|---|---|
| Fighter | 84.0% | 79.7% | 73.7% | 67.4% |
| Rogue | 85.7% | 81.2% | 77.0% | 47.7% |
| Wizard | 93.6% | 91.7% | 88.0% | 24.0% |
| Cleric | 75.8% | 72.6% | 68.5% | 48.2% |

Harness assertions: smart-with-edges ≥70% and ≤96%; ambush costs ≥5 pts; smart ≥ naive; class spread ≤25 pts; defend-only and flee-only strategies provably fail (no stalemate, no kiting). **Flag:** wizard is the strongest class everywhere (Disengage + point-blank Magic Missile); tune in v1.

## Encounter design principles (from playtest)

1. Scene outcomes must change combat openers materially (surprise/prepared/shaken/normal/ambushed; ambush = foes act first with advantage).
2. **A free-swing rule only creates decisions when eating the swing is tempting.** If the closest enemy is also the scariest, target priority has one right answer (playtest finding: stabber-first was dominant before AND after OAs existed). Mix threat profiles — e.g., chaffy melee + scary ranged — to make "push past and eat the hit" a live choice.
3. Mixed-range enemy compositions make the map matter; all-melee compositions don't.
4. Every encounter ships with its Monte-Carlo spread and passes the anti-degenerate proofs.

## Campaign architecture (Casim's priority — partially open)

**Decided (proven in slices):** data-driven scene graph (nodes: DM lines, checks with DC/skill, flags, positions, opener effects); consequences flow scene→combat; harness walks every branch.

**Needed for real campaigns (design next, forks marked):**
- Persistence: save slots (guarded localStorage first), mid-scene resume, character continuity across sessions.
- Progression: XP/levels or milestone leveling *(fork)*; short/long rests between scenes *(fork: rest economy is the difficulty dial for multi-fight arcs)*.
- Structure: campaign = acts → sessions (~20–40 min each) → scenes; target launch campaign length *(fork: e.g., 6–10 sessions)*.
- Content pipeline: scenes as data means authored campaigns are writable without engine changes; a campaign-lint harness (branch walk + per-encounter sims) makes content verifiable at scale.
- Party model **(DECIDED)**: solo start; party grows via recruitment — NPCs, enemies, and creatures join when conditions are met in battle or during the adventure. Recruitment mechanics are an original system (SRD has no sidekick rules) and a collaborative design item.
- Rests/uses/conditions **(DECIDED by mandate)**: standard 5e — short/long rests, per-rest ability uses, spell slots, conditions. Rest placement in authored campaigns remains the difficulty dial.
- Leveling *(small fork)*: XP vs milestone — recommendation: milestone for authored campaigns, XP for Dice Dungeon.

## Dice Dungeon (sketch — all forks open)

Roguelite runs on the same engine: pick a hero, descend N encounters assembled from a room/encounter pool, escalating stakes, run-scoped loot/boons, death ends the run. Purpose: infinite replayability between authored campaigns. Everything else (theme, meta-progression, length) is undesigned.

## Production plan (milestone order; S/M/L)

1. **Name + repo setup** — Casim names it; seed repo with slices, harnesses, docs, CLAUDE.md. (S)
2. **SRD 5.2 deep fidelity pass** — full-kit class check, potion rule, spell wordings vs the PDF. (M)
3. **Campaign architecture spec + save system** — rests decided (standard 5e); remaining: leveling model, campaign length. (M)
3b. **Recruitment system spec** — collaborative design: conditions, recruit statblocks (SRD monsters as allies), party action economy in combat. (M)
4. **Campaign 1, act 1** — 2–3 sessions of authored content on the proven scene format + campaign-lint harness. (L)
5. **Guided/Expert full toggle** — expert sheet, manual stat detail, suggestion off. (M)
6. **Dice Dungeon slice** — one full run loop. (L)
7. **Wizard/goblin tuning pass** per flags. (S)
8. **Capacitor packaging spike** — web-to-app-store pipeline proof. (M)

## Creator mode (v2 — decided 2026-07-27)

Procedural-only campaign creation; no LLM generation in-app and no bring-your-own-key (rejected). Anti-generic mandate: the generator seeds drafts, users own every level — campaign skeleton, scenes, beats, checks, dialogue, encounters, statblocks. Ships with deep resource libraries (SRD monsters, original monsters, NPC/location/hook/twist tables, map tiles) and seeded, constraint-aware variance (encounter budgets, pacing rules, scene-type variety). Global sharing via Supabase with report/block moderation (Apple UGC requirement). Tagline concept: "an open table for every adventurer."

## Open forks (Casim's — never to be authored by Claude)

Setting/tone/campaign premise; solo vs party; rest & progression model; campaign length; class roster expansion; Dice Dungeon theme & meta; pricing; art direction (external resource engaged for map/atmosphere polish).
