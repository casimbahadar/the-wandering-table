// slice-two.tests.mjs — verifies the SHIPPED file, never a copy.
// Usage: node slice-two.tests.mjs [runs]
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("./slice-three.html",import.meta.url),"utf8");
const m=html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//);
if(!m){console.error("FAIL: CORE markers not found");process.exit(1)}
const CORE=m[1];
const factory=new Function(CORE+`
  return {RNG,d,mod,CLASSES,SPECIES,buildCharacter,checkBonus,rollD20,skillCheck,SCENES,
          MAP,terrain,blockedAt,los,cheb,key,bfsReach,bfsField,unitAt,
          OPENERS,newCombat,livingFoes,heroReach,moveHero,moveProvokers,heroDisengage,
          anyFoeAdjacent,attackOptions,heroAttackMode,rollHeroDamage,applyHeroDamage,
          resolveHeroAttack,heroAttackAuto,castMagicMissile,useBonus,heroDefend,
          goblinPhase,endHeroTurn,suggestAction};`);
const C=factory();

let pass=0,fail=0;
function ok(cond,label){if(cond){pass++}else{fail++;console.error("  FAIL:",label)}}

/* ---------- 1. RNG / dice ---------- */
{
  C.RNG.seed(12345);const a=[C.d(20),C.d(20),C.d(6)];
  C.RNG.seed(12345);const b=[C.d(20),C.d(20),C.d(6)];
  ok(JSON.stringify(a)===JSON.stringify(b),"seeded RNG deterministic");
  let min=99,max=0;C.RNG.seed(7);
  for(let i=0;i<4000;i++){const v=C.d(20);min=Math.min(min,v);max=Math.max(max,v)}
  ok(min===1&&max===20,"d20 range exactly 1..20");
}

/* ---------- 2. terrain / LoS / movement ---------- */
{
  ok(C.MAP.rows.length===C.MAP.h&&C.MAP.rows.every(r=>r.length===C.MAP.w),"map dimensions consistent");
  ok(C.blockedAt(4,0)&&C.blockedAt(0,0)&&!C.blockedAt(1,1),"walls/door/trees block; ground doesn't");
  ok(C.los(1,1,7,1)===true,"clear horizontal LoS");
  ok(C.los(2,1,2,3)===false,"tree at (2,2) blocks vertical LoS");
  ok(C.los(2,1,2,3)===C.los(2,3,2,1),"LoS symmetric across the tree");
  ok(C.los(5,1,5,4)===false,"tree at (5,3) blocks the archer lane");
  // endpoints don't self-block
  ok(C.los(2,2,2,2)===true,"LoS to self");
  const ch=C.buildCharacter("fighter","human","T");
  const s=C.newCombat(ch,"prepared");
  const reach=C.heroReach(s);
  ok(!reach.has(C.key(4,0)),"cannot move onto the door");
  ok(!reach.has(C.key(3,1)),"cannot move onto an occupied goblin tile");
  ok(reach.has(C.key(3,2)),"can reach an open tile within speed");
  ok(Array.isArray(C.moveHero(s,3,2))&&s.pos.hero.x===3,"moveHero applies a legal move");
  ok(C.moveHero(s,4,2)===null,"second move in one turn rejected");
  ok(C.moveHero(s,0,0)===null,"illegal move rejected");
}

/* ---------- 2b. opportunity attacks, Disengage, ranged-in-melee ---------- */
{
  C.RNG.seed(555);
  // stabber adjacent at (3,3); hero at (3,4)
  function setup(cls){
    const ch=C.buildCharacter(cls||"fighter","human","T");
    const s=C.newCombat(ch,"prepared");
    s.foes[0].x=3;s.foes[0].y=3;   // stabber in your face
    s.foes[1].x=7;s.foes[1].y=1;   // archer far away
    return s;
  }
  {
    const s=setup();
    ok(C.moveProvokers(s,6,4).length===1,"breaking away from an adjacent foe provokes");
    ok(C.moveProvokers(s,2,3).length===0,"sliding along its reach does not provoke");
    const ev=C.moveHero(s,6,4);
    ok(ev.some(e=>(e.t==="foehit"||e.t==="foemiss")&&e.oa),"opportunity attack rolled on breakaway");
  }
  {
    const s=setup();
    const dv=C.heroDisengage(s);
    ok(Array.isArray(dv)&&s.acted&&s.disengaged,"Disengage spends the action");
    const ev=C.moveHero(s,6,4);
    ok(Array.isArray(ev)&&!ev.some(e=>e.oa),"no opportunity attack after Disengage");
    ok(C.heroDisengage(s)===null,"cannot Disengage twice");
  }
  {
    const s=setup("wizard");
    ok(C.heroAttackMode(s,false)==="dis","ranged attack with a blade in your face has disadvantage");
    s.firstAttackAdv=true;
    ok(C.heroAttackMode(s,false)==="normal","advantage and disadvantage cancel");
    s.foes[0].x=7;s.foes[0].y=3;s.firstAttackAdv=false;
    ok(C.heroAttackMode(s,false)==="normal","no disadvantage at range");
  }
  {
    // goblins never provoke the hero: archer adjacent then retreating emits Nimble Escape
    const ch=C.buildCharacter("fighter","human","T");
    const s=C.newCombat(ch,"prepared");
    s.foes[0].hp=0;                 // stabber down
    s.foes[1].x=3;s.foes[1].y=3;    // archer in the hero's face
    const ev=C.goblinPhase(s);
    ok(ev.some(e=>e.t==="nimble"),"retreating archer uses Nimble Escape");
  }
  {
    // Dodge expires: defend, take the goblin phase, then confirm the flag cleared
    const ch=C.buildCharacter("fighter","human","T");
    const s=C.newCombat(ch,"prepared");
    C.heroDefend(s);C.endHeroTurn(s);
    ok(s.heroDefending===false,"Dodge expires at the start of your next turn");
  }
}

/* ---------- 3. character invariants ---------- */
for(const cls of Object.keys(C.CLASSES))for(const sp of Object.keys(C.SPECIES)){
  const ch=C.buildCharacter(cls,sp,"T");
  ok(ch.hp===ch.maxHp&&ch.hp>0,`hp positive ${cls}/${sp}`);
  if(sp==="dwarf"){const base=C.buildCharacter(cls,"human","T");ok(ch.maxHp===base.maxHp+2,`dwarf +2hp ${cls}`)}
}
{
  const half=C.buildCharacter("rogue","halfling","T");
  C.RNG.seed(9);let c=0;for(let i=0;i<40000;i++)if(C.rollD20(half,"normal").value===1)c++;
  ok(c/40000>0.0005&&c/40000<0.01,`halfling nat-1 suppressed (~1/400): ${(c/400).toFixed(2)}%`);
}

/* ---------- 4. scene graph ---------- */
{
  const S=C.SCENES;const seen=new Set();let paths=0,endsInCombat=0;
  (function walk(id,depth){
    if(depth>20){fail++;console.error("  FAIL: scene runaway",id);return}
    seen.add(id);const n=S.nodes[id];
    if(!n){fail++;console.error("  FAIL: missing node",id);return}
    if(n.combat){paths++;endsInCombat++;return}
    if(n.next)return walk(n.next,depth+1);
    if(n.choices)return n.choices.forEach(c=>{
      if(c.goto)walk(c.goto,depth+1);else{walk(c.ok,depth+1);walk(c.fail,depth+1)}});
    fail++;console.error("  FAIL: dead-end",id);
  })(S.start,0);
  ok(seen.size===Object.keys(S.nodes).length,`all ${Object.keys(S.nodes).length} scene nodes reachable`);
  ok(paths===endsInCombat&&paths>0,`all ${paths} paths end in combat`);
  const openers=new Set();
  Object.values(S.nodes).forEach(n=>{if(n.set&&n.set.opener)openers.add(n.set.opener)});
  ok([...openers].every(o=>o in C.OPENERS),"all scene openers defined in OPENERS");
  // exploration positions must be on walkable tiles
  Object.entries(S.nodes).forEach(([id,n])=>{
    if(n.pos)ok(!C.blockedAt(n.pos[0],n.pos[1]),`node ${id} pos walkable`);
  });
  Object.entries(C.OPENERS).forEach(([o,cfg])=>{
    ok(!C.blockedAt(cfg.hero[0],cfg.hero[1]),`opener ${o} hero tile walkable`);
    cfg.foes.forEach(f=>ok(!C.blockedAt(f[1],f[2]),`opener ${o} foe tile walkable`));
  });
}

/* ---------- 5. no stalemate: goblins always reach a passive hero ---------- */
{
  C.RNG.seed(424242);
  for(const opener of Object.keys(C.OPENERS)){
    let allDied=true;
    for(let t=0;t<300;t++){
      const ch=C.buildCharacter("fighter","human","T");
      const s=C.newCombat(ch,opener);
      let guard=0;
      while(!s.over&&guard++<40){C.heroDefend(s);C.endHeroTurn(s);s.acted=false}
      if(!(s.over&&!s.won))allDied=false;
    }
    ok(allDied,`passive hero always loses (${opener}) — goblins can always reach/shoot`);
  }
}

/* ---------- 6. anti-kiting: running away doesn't work ---------- */
{
  C.RNG.seed(777);
  let wins=0;const N=500;
  for(let t=0;t<N;t++){
    const ch=C.buildCharacter("wizard","human","T");
    const s=C.newCombat(ch,"prepared");
    let guard=0;
    while(!s.over&&guard++<40){
      // coward: move to maximize distance from nearest foe, then defend
      const reach=C.heroReach(s);let best=null,bestD=-1;
      reach.forEach((_,k)=>{const p=k.split(","),x=+p[0],y=+p[1];
        const dmin=Math.min(...C.livingFoes(s).map(f=>Math.max(Math.abs(x-f.x),Math.abs(y-f.y))));
        if(dmin>bestD){bestD=dmin;best={x,y}}});
      if(best)C.moveHero(s,best.x,best.y);
      C.heroDefend(s);C.endHeroTurn(s);
    }
    if(s.won)wins++;
  }
  ok(wins/N<=0.02,`pure flight fails (${(wins/N*100).toFixed(1)}% wins) — no kiting degenerate`);
}

/* ---------- 7. Monte-Carlo strategy spread ---------- */
const RUNS=+(process.argv[2]||3000);
function runAgent(s,agent){
  let guard=0;
  while(!s.over&&guard++<40){
    agent(s);
    if(!s.acted)C.heroDefend(s); // safety: never dead-turn
    C.endHeroTurn(s);
  }
  return s.won;
}
const smart=(s)=>{
  const sug=C.suggestAction(s);
  if(sug.bonus)C.useBonus(s,sug.bonus);
  if(sug.action==="disengage"){
    C.heroDisengage(s);
    if(sug.move)C.moveHero(s,sug.move.x,sug.move.y);
    return;
  }
  if(sug.move)C.moveHero(s,sug.move.x,sug.move.y);
  if(sug.action==="attack")C.heroAttackAuto(s,sug.target,false);
  else if(sug.action==="ability"){
    const ch=s.hero;
    if(ch.action2&&ch.action2.id==="magic_missile"){if(!C.castMagicMissile(s))C.heroDefend(s)}
    else if(ch.action2&&ch.action2.id==="aimed_strike")C.heroAttackAuto(s,sug.target,true);
  }
  else C.heroDefend(s);
};
const naive=(s)=>{
  // charge nearest goblin, swing if possible, never use abilities/bonuses
  const h=s.pos.hero,foes=C.livingFoes(s);
  if(!foes.length)return;
  foes.sort((a,b)=>C.cheb(h,a)-C.cheb(h,b));
  const tgt=foes[0],ti=s.foes.indexOf(tgt);
  const opts=C.attackOptions(s);
  if(!opts[ti].ok){
    const field=C.bfsField(tgt.x,tgt.y);const reach=C.heroReach(s);
    let best=null,bestD=field.get(C.key(h.x,h.y))??999;
    reach.forEach((_,k)=>{const fd=field.get(k);if(fd!==undefined&&fd<bestD){bestD=fd;const p=k.split(",");best={x:+p[0],y:+p[1]}}});
    if(best)C.moveHero(s,best.x,best.y);
  }
  const opts2=C.attackOptions(s);
  const first=opts2.find(o=>o.ok);
  if(first)C.heroAttackAuto(s,first.i,false);else C.heroDefend(s);
};
function rate(cls,opener,agent,potion){
  let w=0;
  for(let i=0;i<RUNS;i++){
    const ch=C.buildCharacter(cls,"human","T");ch.potion=!!potion;
    if(runAgent(C.newCombat(ch,opener),agent))w++;
  }
  return w/RUNS;
}
console.log(`\n--- combat Monte-Carlo (${RUNS} runs/cell) ---`);
C.RNG.seed(20260727);
const report={};
for(const cls of Object.keys(C.CLASSES)){
  const sEdge=rate(cls,"prepared",smart,true);
  const sEven=rate(cls,"normal",smart,false);
  const sAmb=rate(cls,"ambushed",smart,false);
  const nEven=rate(cls,"normal",naive,false);
  report[cls]={sEdge,sEven,sAmb,nEven};
  console.log(cls.padEnd(8),
    "smart(prep+potion)",(sEdge*100).toFixed(1)+"%",
    "| smart(even)",(sEven*100).toFixed(1)+"%",
    "| smart(ambushed)",(sAmb*100).toFixed(1)+"%",
    "| naive(even)",(nEven*100).toFixed(1)+"%");
  ok(sEdge>=0.70,`${cls}: smart with scene edges wins >=70% (${(sEdge*100).toFixed(1)}%)`);
  ok(sEven>=nEven-0.02,`${cls}: smart >= naive on even footing`);
  ok(sAmb<sEdge,`${cls}: scene failure genuinely hurts`);
  ok(sEdge<=0.96,`${cls}: not a guaranteed win (${(sEdge*100).toFixed(1)}%)`);
}
{
  const vals=Object.values(report).map(r=>r.sEdge);
  ok(Math.max(...vals)-Math.min(...vals)<=0.25,"class spread (smart, edges) within 25 pts");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
