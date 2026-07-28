# TODO — The Wandering Table
*Prioritized. Update at every session end.*

1. Confirm production stack (Vite+TS+Vitest / Supabase / Capacitor — see DECISIONS.md 2026-07-27). Repo seed itself DONE 2026-07-28. [Casim + Code session]
2. Domain check: thewanderingtable.app / .ca (quick, from phone). [Casim]
3. ~~Milestone 2 — SRD 5.2 deep fidelity pass~~ **DONE 2026-07-28** (slice-four; harness 124/0 at 3000 runs/cell, smoke 22/0; see GDD fidelity tables + DECISIONS.md). Casim playtest of slice-four pending — new feel: squishier hero (no +3 HP), chaff minions, dagger-slinger instead of archer.
4. **Recruitment system spec** [chat, collaborative]: recruit conditions, creature allies in the action economy, party size, loyalty concept.
5. Campaign architecture spec: leveling model (rec: milestone for authored / XP for Dice Dungeon), campaign length, save system.
6. ~~Wizard tuning pass (slot accounting)~~ **DONE 2026-07-28** — Mage Armor costs a slot, 1 Magic Missile at AC 15; wizard 92.9→84.8 edges, back in the pack; harness 125/0. Still open in this item: rogue Aimed Strike + Sneak Attack stacking sims (party-era, DECISIONS 2026-07-28); cleric (72.3) and wizard-even (72.5) near the band floor — watch in playtest.
6b. Expert-mode v1 items from flag resolutions: per-dart Magic Missile aiming; RAW Heroic Inspiration (any d20); legal standard-array+background ability scores (full rebalance).
7. Formal trademark search (USPTO/CIPO) — HARD GATE before any store submission.

## Landmines
- Slice-three (and earlier) Monte-Carlo values are pre-fidelity; slice-four numbers (GDD 2026-07-28 table) are the only current balance reference.
- Slice-two Monte-Carlo numbers were inflated by the Dodge-forever bug (fixed in slice three).
- Warrior+Minion (75 XP Moderate) sims 42–68% smart-with-edges solo — do not ship as a slice climax without rests/party; it's the pocket option for multi-fight arcs.
- The jsdom smoke has one conditional assertion (scouted-goblins-visible) that only runs when the run-1 scout check succeeds — 22 vs 23 passed is RNG, not a regression.
