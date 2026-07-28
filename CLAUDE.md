# CLAUDE.md — The Wandering Table

## What this is
Premium buy-once mobile game recreating tabletop-at-a-table 5e-compatible play: GM voice, hand-rolled dice, real SRD 5.2 rules, persistent tactical map. Two modes on one rules engine: authored Campaign (product spine) + Dice Dungeon roguelite. No microtransactions ever.

## Current state (2026-07-28)
Repo seeded; slice-four is current — the SRD 5.2 deep-fidelity artifact (verified: harness 124/0 at 3000 runs/cell, smoke 22/0). SRD-faithful statblocks + rules; encounter = two Goblin Minions (50 XP Low budget); hero solo-tune removed. Slices 1–3 frozen as pre-fidelity playtest artifacts. The SRD 5.2 PDF is committed at repo root — it is the sole rules source of truth; never cite memory or wikis. Casim playtest of slice-four pending. Next milestones (see docs/GDD.md production plan): campaign architecture spec → recruitment spec → Campaign 1 Act 1.

## Tech stack & architecture
- Slices 1–3: single-file HTML, zero dependencies, raw Web Audio, mobile-first ~480px (historical artifacts — keep as-is).
- Production canon (2026-07-27): dependencies by justification — admitted when they solve a real limit, recorded in docs/DECISIONS.md, boring and few. Recommended stack pending confirm at repo seed: Vite + TypeScript + Vitest, Supabase SDK (sharing), Capacitor (stores), React for creator-mode UI later. Raw Web Audio stays until a real need says otherwise.
- Game logic lives ONLY between `/* CORE-START */` and `/* CORE-END */`: pure functions, no DOM/timers/audio. UI layer below it.
- `slice-three.tests.mjs` — harness extracts CORE from the SHIPPED file (never a copy): unit checks, scene-graph walk, Monte-Carlo balance with assertions, anti-degenerate proofs (no stalemate, no kiting).
- `slice-three.smoke.mjs` — jsdom drives the real DOM: creation → checks → combat win → replay → loss.
- Store path: Capacitor wrap (web-to-app-store skill), not yet exercised.

## Conventions (standing rules)
- Casim authors all creative/mission decisions; at meaningful forks present 2–4 options with a marked recommendation. Claude owns build + verification.
- Ship = test: the Guided-mode suggestion brain IS the harness "smart" agent. Never fork them.
- "Verified" claims require executed numbers. Run harness + smoke before shipping any build; new mechanics need new unit tests.
- Audit before changing existing code; minimal diffs; one concern per change.
- Balance changes: re-run Monte-Carlo, report the spread, respect assertions (smart-with-edges 70–96%, ambush ≥5 pts, smart ≥ naive, spread ≤25 pts, degenerate strategies fail).
- Playtest feedback (Casim + Sobia) is real data: diagnose symptom before accepting prescription; one experiment per cycle.
- Licensing hard rules: SRD 5.2 attribution statement verbatim in-app; "compatible with fifth edition" only; never "D&D" or Wizards IP anywhere.
- Solo-tune monster deviations from SRD are recorded in docs/GDD.md fidelity tables — never deviate silently.

## Key design flags (do not re-litigate; see docs/DECISIONS.md)
- Wizard-strongest flag RESOLVED 2026-07-28: Mage Armor costs a slot → 1 Magic Missile cast; wizard now third of four (84.8% edges). Watch items: cleric (72.3%) and wizard-even (72.5%) sit near the band floor.
- Encounter principle: free-swing rules only bind when eating the swing is tempting; mix threat profiles.
- Deferred rules: Dash, Hide, difficult terrain, cover AC, full class kits.
- Open forks (Casim only): setting/tone, solo vs party, rest/progression model, campaign length, Dice Dungeon theme, pricing, art direction.

## Session hygiene
Read this file + docs/DECISIONS.md tail + docs/TODO.md at session start; restate state in 2–3 lines. At session end: update TODO.md, append DECISIONS.md, give a done/in-progress/next/landmine handoff.
