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

*Deep fidelity pass completed 2026-07-28 against the SRD 5.2 PDF (in-repo, sole source of truth). Slice four is the fidelity-pass artifact; slices 1–3 keep their pre-fidelity numbers as history.*

| Rule | Status | SRD 5.2 fidelity (verified 2026-07-28) |
|---|---|---|
| d20 checks, DC, adv/dis (incl. cancellation) | in | faithful (both→neither verified verbatim; no stacking) |
| Nat 20 / nat 1 | in | faithful — auto-hit/miss on attack rolls only; SRD 5.2 does NOT apply it to ability checks |
| Crits (roll all the attack's damage dice twice) | in | faithful — weapon dice, Aimed Strike d6, and goblin rider d4 all double |
| Move (speed 6 tiles = 30 ft, 8-dir, diagonal = 1 square) + action + bonus action | in | faithful — matches SRD grid rules; corner rule added in s4 (diagonals can't cross wall/tree corners) |
| Opportunity attacks (leave reach → free swing) | in | simplified: start-adjacent & end-not-adjacent, not per-step path; reaction budget untracked (flagged) |
| Disengage (action; slice grants a fresh move after) | in | simplification — 5e splits movement; slice can exceed 30 ft in a Disengage turn (flagged) |
| Dodge/Defend (attackers at dis until your next turn) | in | faithful (expiry unit-tested) |
| Ranged attack with adjacent enemy → disadvantage | in | faithful |
| Ranged attack beyond normal range → disadvantage | in (s4) | faithful — binds for thrown daggers (20/60 ft); shortbow's 80 ft never binds on this map |
| Goblin Nimble Escape (bonus Disengage) | in | faithful; Hide half omitted (recorded) |
| Potion of Healing as bonus action, 2d4+2 | in | **verified verbatim** vs SRD 5.2 equipment ch. ("As a Bonus Action, you can drink it…") |
| Second Wind 1d10+1, two uses | in (s4 fix) | faithful — SRD grants two uses at level 1 (was 1) |
| Healing Word: bonus action, 2d4+2, two level-1 slots | in (s4 fix) | faithful — 2d4 + Wis mod (+2); was 2d4+3 |
| Magic Missile 3×(1d4+1), auto-hit, needs sight | in | faithful numbers; darts auto-target lowest-HP visible foe (guided simplification, flagged) |
| Wizard slot accounting | in | **flagged:** 2 MM casts + "free" Mage Armor = 3 level-1 slots vs SRD's 2 — resolve in wizard tuning pass |
| Fire Bolt 1d10, ranged spell attack, no mod | in | faithful (120 ft range never binds) |
| Mage Armor 13+Dex, 8 h ("cast at dawn") | in | faithful (slot cost folded into wizard flag above) |
| Skill→ability map (all 10 used) | in | faithful — verified against SRD skill table |
| Class chassis (hit dice d10/d8/d6/d8; chain mail 16, studded 15, chain shirt+shield 15, mage armor 15; longsword d8, shortsword d6 finesse, mace d6) | in (s4 fix) | faithful — rogue armor relabeled studded leather ("leather AC 15" was impossible); hero HP = die max + Con (solo +3 removed) |
| Rogue Aimed Strike (adv + 1d6, 2 uses) | in | recorded stand-in for Sneak Attack (1d6 matches; SRD version is at-will but conditional on adv/ally) |
| Species traits | in (s4 fix) | Dwarf +1 HP/level (was +2 flat); Elf = Perception proficiency (was advantage); Halfling Luck rerolls one die of an adv/dis pair; Human = Heroic-Inspiration-shaped reroll (flag: RAW rerolls any die) |
| Ability arrays (primary 16) | in | flagged: near-standard-array + "2024-style background bonus"; exact array+background arithmetic doesn't reproduce all six values — Casim's call at v1 |
| Line of sight (Bresenham, trees/walls block) | in | reasonable approximation of cover; real cover AC bonuses deferred |
| Initiative | replaced | openers set order/advantage by scene outcome (recorded design; goblin Initiative +2 unused) |
| Dash, Hide, difficult terrain, opportunity-attack reactions per-round tracking | deferred | v1 items |

**Monster fidelity — SRD-faithful as of slice four (solo-tune retired):**

| Stat | SRD 5.2 Goblin Warrior = our Archer | SRD 5.2 Goblin Minion = our Stabber/Slinger |
|---|---|---|
| AC | 15 | 12 |
| HP | 10 (3d6) | 7 (2d6) |
| Attack | +4 | +4 |
| Damage | 1d6+2, +1d4 if the attack roll had Advantage | 1d4+2 (dagger; melee or thrown 20/60 ft) |
| Traits | Nimble Escape (Disengage half; Hide omitted) | Nimble Escape (Disengage half; Hide omitted) |

Balance now comes from the SRD encounter budget, not stat edits: solo level-1 hero → Low difficulty = 50 XP → **two Goblin Minions** (stabber + dagger-slinger; mixed threat profiles preserved). Warrior + Minion (75 XP Moderate) sims at 42–68% smart-with-edges — correctly brutal for a slice climax; kept in the pocket for multi-fight arcs with rests. Two Warriors (100 XP High) remains Deadly-tier solo (~33–55% pre-fix; 22–53% at full SRD stats).

## Balance findings (slice 4, 3000 runs/cell, harness-enforced, 2026-07-28)

| Class | smart, scene edges | smart, even | smart, ambushed | naive, even |
|---|---|---|---|---|
| Fighter | 90.8% | 85.4% | 82.2% | 74.6% |
| Rogue | 91.1% | 86.2% | 81.5% | 47.1% |
| Wizard | 92.9% | 88.1% | 82.0% | 27.4% |
| Cleric | 72.6% | 71.2% | 63.3% | 48.4% |

Harness assertions: smart-with-edges ≥70% and ≤96%; ambush costs ≥5 pts (now a hard assertion; s4 margins 8.6–10.9); smart ≥ naive; class spread ≤25 pts (s4: 20.3); defend-only and flee-only strategies provably fail (no stalemate, no kiting). **Flags:** wizard still strongest (fix its slot accounting in the tuning pass — see fidelity table); cleric now the floor of the band (72.6%) — watch in playtest. Slice-3 numbers (pre-fidelity) retained in git history for comparison.

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
