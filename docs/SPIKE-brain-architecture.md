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

---

# RESULTS (3000 runs/cell, paired seeds, 2026-07-29)

**Integrity check first:** the control `suggestAction` in the spike file is **byte-identical** (4528 chars) to the merged slice-five brain, and the spike CORE is purely additive. Both brains ran against the identical shipped rules engine.

## Ability schema v0 (primary deliverable)

```
{
  id      : string   — maps to the engine's action token
  name    : string   — player-facing
  kind    : "attack" | "autohit" | "heal" | "guard" | "withdraw" | "spare"
  cost    : "action" | "bonus"
  uses    : null (at-will) | number | "item"
  range   : tiles (1 = melee);  needsLoS : bool
  target  : "enemy" | "self"
  toHit   : "weapon" | "spell" | "none"     — "none" ⇒ ignores AC AND the adjacency penalty
  dice    : {n, die, mod:"str"|"dex"|"int"|"wis"|null, flat, perDart}
  rider   : {advantage:bool, bonusDice:{n,die}} | null
  gate    : {hpBelow:f} | null              — declarative tuning (Candidate B only)
}
```

Every current level-1 kit expressed without a schema extension. The engine's four universal actions (potion, Defend, Disengage, Spare) are shared records, not per-class ones. **The only per-class datum a brain reads is `archetype`.** No brain branches on a class name.

Derived-not-declared: the brains compute hit chance, expected damage, and cover from the schema fields, so `toHit:"none"` *implies* "usable point-blank" without anyone writing that rule down per class. That is the architecture's main win.

## Head-to-head (Δ vs control, points)

| class | f1:surprise | f1:prepared | f1:shaken | f1:normal | f1:ambushed | f2:warband | f2:reprisal |
|---|---|---|---|---|---|---|---|
| **fighter** A | +2.0 | −0.2 | +1.0 | +1.9 | +1.3 | +1.1 | +1.5 |
| **fighter** B | −0.7 | −1.0 | −1.1 | −0.9 | −1.1 | −0.0 | +0.0 |
| **rogue** A/B | +0.0 | −0.6 | +0.0 | +0.0 | +0.0 | +0.0 | +0.0 |
| **wizard** A/B | +0.0 | −2.1 | +0.0 | +0.0 | +0.0 | +0.0 | +0.0 |
| **cleric** A | −4.8 | −6.0 | −6.1 | −5.7 | −4.7 | −1.5 | −3.7 |
| **cleric** B | −1.0 | −1.5 | −1.4 | −1.1 | −0.7 | +0.0 | +0.0 |

Absolute smart-with-edges: fighter 89.4 → 89.2 (A) / 88.4 (B); rogue 91.1 → 90.5; wizard 85.1 → 83.0; cleric 70.1 → 64.1 (A) / 68.6 (B). Noise floor at 3000 runs ≈ ±1.1 pts (2 SE), so deltas under ~1 point are not signal.

**The striking result: rogue and wizard are +0.0 in six of seven cells.** The archetype brain reproduces the bespoke brain's decisions *exactly* for those classes — including the wizard's point-blank Magic Missile trick, which the brain derives from `toHit:"none"` rather than being told.

## Criteria

| criterion | Candidate A (pure archetype) | Candidate B (archetype + data gates) |
|---|---|---|
| 1. within 3 pts per class | **FAIL** — cleric −6.0 | **PASS** — worst −2.1 (wizard) |
| 2. no cell worse by >5 | **FAIL** — cleric f1:shaken −6.1 | **PASS** — worst −2.1 |
| 3. all balance assertions | **FAIL** — 15/17; cleric edges 66.0 (<70 floor), fighter ambush margin 4.3 (<5) | **PASS** — 17/17, spread 18.9 (control 17.5) |
| 4. suggestion text teaches | PASS with a caveat (below) | PASS with a caveat (below) |

**VERDICT: Candidate A FAILS. Candidate B PASSES the pre-registered criterion.**

The entire A→B difference is *one number per resource ability* — the heal gate. A generic 0.5 threshold under-serves the cleric (whose Healing Word is cheap, twice-usable, and wants 0.6) and slightly over-serves the fighter. Nothing else in the architecture moved.

## Tuning disclosure (required by the pre-registration)

Two changes were made to the candidate after the first run, both **before** the final criterion evaluation:

1. **Implementation defect, fixed.** `bestOffense` evaluated abilities from the hero's *pre-move* tile, so on approach turns every melee ability was filtered out and the brain fell back to a plain strike. This was the candidate failing to implement its own design, not a tuning knob. (Cost before fix: rogue −26 to −34 pts.)
2. **Capability added: threat-aware targeting.** The bespoke brains contain a hand-written tiebreak — *at equal distance, go for the ranged foe*. The archetype brain had no equivalent, so it was given a general `foeThreat()` derived from the foe's own statblock (damage × hit chance, discounted by how many turns a melee foe needs to close). This is architecture-relevant and honest to report: **a generic brain needs a threat model to derive what a bespoke brain simply asserts.** Written once, not 24 times.

Neither change was a tune-to-pass: after both, Candidate A still failed. The discriminating result survived them.

## Qualitative read: does the text still teach?

Sampled at every decision point across all four classes. Representative pairs:

| situation | control (bespoke) | candidate (generated from data) |
|---|---|---|
| melee, adjacent | "It's in your face. Don't turn your back — cut it down." | "It's in your face. Longsword is your best swing from here — about 5.3 damage on average." |
| rogue opening | "Close the gap and take the opening — advantage on the strike." | "Close the gap and take the opening — Aimed Strike strikes with advantage." |
| wizard, engaged | "Three darts, no roll to miss. Certain damage while you hold distance." | "Magic Missile — three darts, no roll to miss. Certain damage while you hold distance." |
| low HP | "[potion] Close the gap and swing…" | "[potion] Healing potion first — you're at 50%. Then: close the gap and swing…" |

**Verdict: PASS, with a real caveat.** The generated text is *more* numerate — it names the ability and its expected damage, which serves the "plain-language math" pillar, and it can never drift out of sync with the decision because both come from the same record. But it teaches differently: the control's *"Don't turn your back"* is teaching the **opportunity-attack rule**; the candidate's *"about 5.3 damage on average"* is teaching **expected value**. The bespoke line carries situational rules-teaching that generic templates do not reproduce. A shipped archetype brain would want a small per-situation phrase library (adjacency, cover, low-HP, resource-spend) so it teaches rules as well as math — that is content, not code, and it is shared across all 24 kits.

## Secondary: can the schema express a recruited Goblin Minion?

**Yes.** The dagger expresses exactly — `{kind:"attack", range:1, toHit:"weapon", dice:{n:1,die:4,flat:2}}`, schema-computed average 4.5 matching the engine statblock's 1d4+2. Nimble Escape expresses as `{kind:"withdraw", cost:"bonus"}` — the schema already carries a cost field, though no hero kit has yet used a bonus-cost withdraw.

**One boundary found:** the four recruit stances (Protect me / Focus my target / Skirmish freely / Hold back) are **policy, not abilities**. They belong as archetype *parameters* (target-selection and positioning preferences), not schema fields. So recruits could ride the same engine — one `melee_striker` archetype plus a stance parameter — but the schema alone is not sufficient; the archetype layer needs a stance input. That is a small, known extension rather than a blocker.

## Recommendation

**Adopt the archetype architecture with declarative per-ability tuning (Candidate B), as a hybrid with a per-class override escape hatch.**

Reasoning, load-bearing parts only:
1. Candidate B met every pre-registered numeric bar and kept all 17 balance assertions green — this is measured, not argued.
2. Two of four classes were reproduced *exactly*, including the fiddliest caster trick in the game. The brains derived behaviour the bespoke code had to state.
3. The cost of the roster changes shape: 24 hand-written AI implementations become ~5 brains + 24 data files, where each data file needs one tuned number per resource ability — which a balance pass produces anyway.
4. The escape hatch matters and should be written into the plan now: when sims or playtest show a class playing badly through its archetype, that class gets a bespoke override. Keeping that door open costs nothing and prevents the architecture from becoming a straitjacket at level 5+ where kits get genuinely weird.

**The strongest case against my own recommendation:** this spike tested four level-1 kits with two abilities each, against one enemy family, on one map. That is the easy end of the problem. The classes where archetypes plausibly break are the ones not tested — a Druid's Wild Shape changes the whole action economy, a Warlock's pact mechanics are not "damage/heal/control," and level 3–5 features (Extra Attack, Cunning Action, subclass triggers) add conditional interactions the schema has no vocabulary for yet. **Candidate B passing here is evidence the floor works, not proof the ceiling does.** The honest scope of this result: it justifies *starting* archetype-first, and it does not justify promising that no class will need bespoke work. Anyone reading only the PASS should read this paragraph too.

**What would change my recommendation:** if a spike at level 5 with Extra Attack + a subclass trigger showed the schema needing per-class extensions to express the kit, the data-file cost would approach the code cost and bespoke-per-class would win on directness. That test should run before the roster build starts, not after.
