# TODO — The Wandering Table
*Prioritized. Update at every session end.*

1. Confirm production stack (Vite+TS+Vitest / Supabase / Capacitor — see DECISIONS.md 2026-07-27). Repo seed itself DONE 2026-07-28. [Casim + Code session]
2. Domain check: thewanderingtable.app / .ca (quick, from phone). [Casim]
3. ~~Milestone 2 — SRD 5.2 deep fidelity pass~~ **DONE 2026-07-28** (slice-four; harness 124/0 at 3000 runs/cell, smoke 22/0; see GDD fidelity tables + DECISIONS.md). Casim playtest of slice-four pending — new feel: squishier hero (no +3 HP), chaff minions, dagger-slinger instead of archer.
4. **Recruitment system** — spec v1 drafted; **step 1 BUILT 2026-07-28 (slice-five)**: spare-the-goblin, seats, stances, hero-downed rescue, camp short rest, seat-scaled two-fight arc (harness 180/0 at 3000 runs/cell, smoke 28/0). Casim playtest pending. Next: spec steps 2–4 — Bond levels + growth track on the goblin, second trigger type (adventure path), party-size >2 harness. Open forks: recruit naming (current "Goblin" is placeholder), track names/flavor, Campaign 1 roster, co-op scene authority.
5. Campaign architecture spec: leveling model (rec: milestone for authored / XP for Dice Dungeon), campaign length, save system.
6. ~~Wizard tuning pass (slot accounting)~~ **DONE 2026-07-28** — Mage Armor costs a slot, 1 Magic Missile at AC 15; wizard 92.9→84.8 edges, back in the pack; harness 125/0. Still open in this item: rogue Aimed Strike + Sneak Attack stacking sims (party-era, DECISIONS 2026-07-28); cleric (72.3) and wizard-even (72.5) near the band floor — watch in playtest.
6b. Expert-mode v1 items from flag resolutions: per-dart Magic Missile aiming; RAW Heroic Inspiration (any d20); legal standard-array+background ability scores (full rebalance).
7. Full level-1 class kits (deferred item, now the named fix for the class spread): cleric's offensive half (Sacred Flame, Guiding Bolt/Bless), wizard cantrip variety, rogue Sneak Attack proper — expected to compress the fighter/rogue vs wizard/cleric gap; re-sim after, and again once multi-fight rest arcs exist. [Claude Code]
8. Class roster long-game (Casim direction 2026-07-28): all SRD 5.2 classes + subclasses implemented over time; homebrew tooling for experts/DMs in the complete version (post-launch, per ruleset decision). Sequence via production plan.
9. Formal trademark search (USPTO/CIPO) — HARD GATE before any store submission.

## Landmines
- Slice-three (and earlier) Monte-Carlo values are pre-fidelity; slice-four numbers (GDD 2026-07-28 table) are the only current balance reference.
- Slice-two Monte-Carlo numbers were inflated by the Dodge-forever bug (fixed in slice three).
- Warrior+Minion (75 XP Moderate) sims 42–68% smart-with-edges solo — do not ship as a slice climax without rests/party; it's the pocket option for multi-fight arcs.
- The jsdom smoke has one conditional assertion (scouted-goblins-visible) that only runs when the run-1 scout check succeeds — 22 vs 23 passed is RNG, not a regression.
