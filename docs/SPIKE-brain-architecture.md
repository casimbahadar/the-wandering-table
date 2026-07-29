# Decision Spike — Guided-brain architecture

*Claude Code, 2026-07-29. Pre-registered BEFORE any candidate code was written (see git history: this file is committed ahead of the implementation). Per DECISIONS.md 2026-07-29, chat did not decide this; the numbers decide it.*

## Question

Can archetype brains reasoning over declarative ability **data** play the classes as well as the current bespoke per-class brains?

Stakes: the roster is 24 kits (12 SRD classes + 12 subclasses, verified against the PDF). Bespoke means 24 hand-written AI implementations, each of which is also a harness agent (ship = test). Archetype means ~5 brains + 24 data files.

## Pre-registered success criterion

**Control** = the current shipped `suggestAction` brains, unchanged, level 1, as merged in slice-five.
**Candidate** = archetype brains reasoning over declarative ability data, same kits, no new features.

**PASS requires ALL of:**
1. At 3000 runs/cell, across every existing opener (`surprise`, `prepared`, `shaken`, `normal`, `ambushed`) and both fights (fight 1 and the seat-scaled stage 2), **each class is within 3 points of control on smart-with-edges**.
2. **No single cell is worse by more than 5 points.**
3. **All existing harness balance assertions still pass** when the candidate is substituted for the control.
4. **Qualitative:** the GM suggestion *text* still explains itself well enough to teach a beginner. A brain that wins while suggesting nonsense **FAILS the product test even if it passes the numeric one.**

**A FAIL is a successful spike.** No tuning the candidate to squeak past. If tuning is required to pass, the exact tuning is reported and treated as evidence about the architecture.

## Two candidates, deliberately

To separate "archetypes work" from "archetypes work *if* you hand them per-class numbers," the spike runs two variants:

- **Candidate A — pure archetype.** One generic policy per archetype. No per-class constants anywhere. This is the honest test of "a generic brain plays a class."
- **Candidate B — archetype + data gates.** Same brains, but ability records may carry declarative gates (e.g. `gate:{hpBelow:0.6}`). Tuning lives in data, not code — which is still the architecture under test, but a weaker claim.

Reporting both makes the finding actionable either way: if A passes, the architecture is free; if only B passes, the architecture works but each class still needs tuned numbers (cheaper than code, not free); if neither passes, bespoke brains are load-bearing and the roster cost is real.

## Method

1. `slices/slice-six-spike.html` — copy of slice-five. Control brain untouched in the same file; candidate added alongside so both run against the identical shipped rules engine.
2. Ability schema designed to express the current level-1 kits (schema is a primary deliverable — see below).
3. Archetype brains implemented: melee striker, ranged striker, healer/support.
4. All four current classes expressed as data (Fighter simplest martial, Wizard fiddliest caster, plus Cleric and Rogue for coverage).
5. Paired-seed head-to-head sim: for run *i*, both agents start from the identical seed, so the opening dice are shared and variance is reduced.
6. Secondary (not a pass condition): can the same schema express a recruited Goblin Minion's actions, so recruit stances could ride the same engine?

## Out of scope (explicit)

No roster conversion, no other classes, no campaign content, no levels 2–5, no modification of the control brains, and no unilateral architecture decision.

---
*Results, schema, head-to-head table, qualitative read, PASS/FAIL, and recommendation are appended below after the run.*
