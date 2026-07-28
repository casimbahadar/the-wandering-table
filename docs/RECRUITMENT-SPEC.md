# RECRUITMENT-SPEC.md — The Wandering Table
*v1 draft, 2026-07-28. DECIDED items are Casim's calls from the design session; PROPOSED items are Claude's detail layer awaiting veto/edits. Original system — no SRD sidekick rules exist; SRD statblocks are the base, growth mechanics are ours.*

## Purpose

Recruitment is a signature system: NPCs, enemies, and especially creatures can join the hero when conditions are met in battle or during the adventure. It is the bridge from solo play to full-table play, and it must be **data-driven** — every recruitable carries its own recruitment block, so authored campaigns and (later) creator-mode users define custom recruits without engine changes.

## Decided (2026-07-28, Casim)

- **Chassis:** recruit = SRD statblock base + original growth track. A goblin ally stays recognizably a goblin and grows.
- **Control:** Guided mode = orders/stances + AI; Expert mode = full manual control of every recruit.
- **The table seats four:** total active combatants = 4, filled by any mix of human players and recruits. Solo = hero + up to 3 recruits. Matches SRD encounter math's assumed party of four; makes "an open table for every adventurer" literal.
- **Bond:** recruitment is permanent — they never leave. Loyalty ("Bond") is an up-only stat that deepens and unlocks perks.
- **Downed, never dead:** recruits at 0 HP are out of the fight, not lost.
- **Multiplayer co-op:** post-launch feature, architected for from day one.

## Recruitment block (data schema — per creature)

```
recruit: {
  triggers: [                    // any may fire; each is one path in
    {type:"battle_spare",  hpBelow:0.25, check:{skill:"persuasion",  dc:13}},
    {type:"battle_impress",contest:"athletics", check:{skill:"intimidation", dc:12}},
    {type:"adventure",     questId:"...", check:null},        // quest/gift/camp path
    {type:"hybrid",        weakenFirst:true, sealAt:"camp", check:{skill:"insight", dc:12}}
  ],
  respects: "strength|cunning|kindness|...",   // flavors GM hints + which approaches land
  growthTrack: "bruiser|skirmisher|adept",
  bondSources: ["fight_together","camp_scene","gift:food","quest:..."],
  flavor: { recruitLine:"...", campLines:[...] }
}
```

Guided mode surfaces triggers diegetically ("It's bleeding and watching you. The GM raises an eyebrow.") — never as raw UI checkboxes. Expert mode may show the conditions plainly.

## PROPOSED — growth tracks (names/flavor are Casim's fork)

Three tracks, each a simple ladder gained at campaign milestones (recruits level when the hero does):

| Track | Identity | Ladder shape (per level) |
|---|---|---|
| Bruiser | frontline muscle | +HP, later +damage die step, capstone: guard reaction (protect an adjacent ally) |
| Skirmisher | mobile harasser | +speed/disengage tricks, later advantage-generation, capstone: extra reposition |
| Adept | utility/caster-ish | support cantrip-grade trick, later a leveled-spell-grade ability 1/rest |

Base statblock never loses its identity: a Goblin Minion bruiser is still AC 12 dagger goblin, just tougher. Numbers land in a balance pass with the harness (party sims become multi-seat).

## PROPOSED — Bond

- Bond levels 1–5 per recruit; sources: fights survived together, camp scenes, gifts, quest beats (all data-driven via bondSources).
- Perks per level: 1 = recruited; 2 = +1 trait use tied to its nature; 3 = growth-track bonus pick; 4 = signature move upgrade; 5 = a "loyal beyond reason" capstone (e.g., once per campaign, auto-stands from downed at 1 HP).
- Bond never decreases. No management anxiety — only deepening.

## PROPOSED — combat integration

- Stances (Guided): **Protect me** / **Focus my target** / **Skirmish freely** / **Hold back**. Recruit AI = same suggestAction architecture (ship = test: recruit brains are harness agents).
- Turn order: hero acts, then recruits (fast auto-resolution in Guided), then foes. Expert mode gives each recruit the full move+act interface.
- Downed recruit: out of the fight, auto-recovers at the next rest (1 HP); Bond capstone can self-revive. **Hero downed with recruits standing (DECIDED 2026-07-28, Casim): the fight continues** — recruits keep acting (AI or remote players) and can win and bail the hero out; defeat only when the whole table is down. On a recruit victory, the hero wakes at 1 HP with a GM beat honoring the rescuer (Bond source: "carried me out"). This makes recruits genuine lifelines, not accessories, and it is the exact rule co-op needs anyway — one player down never ends a multiplayer fight.
- Encounter budgets scale with filled seats: XP budget computed from active party size per the SRD tables — the encounter-budget decision extends naturally from 1 seat to 4.

## Multiplayer-ready architecture (what "architected now" means concretely)

**The seat is the unit.** A seat is driven by: local player | recruit AI brain | remote player (post-launch). Everything already true of the engine stays law: state fully serializable, every action a plain message into the reducer, all rolls seeded and replayable. If those hold, co-op is a transport problem (Supabase rooms, proven in Ludo Mehfil), not a rewrite. Scene-choice authority in co-op (who picks at forks) is an open design item deferred to the multiplayer spec.

## Open items (Casim's forks, not blocking implementation of the core)

Track names and flavor; perk flavor per creature type; which creatures are recruitable in Campaign 1 (The Lantern Road — the spared goblin is the obvious first); co-op scene authority (deferred).

## Implementation order (rec)

1. Recruitment slice: spare-the-goblin path in The Lantern Road — one trigger type, one recruit, stance AI, seat abstraction. Proves the loop.
2. Bond + growth track on that one goblin.
3. Multi-seat harness (party Monte-Carlo, budget scaling).
4. Full schema + second recruit type (adventure-trigger path).
