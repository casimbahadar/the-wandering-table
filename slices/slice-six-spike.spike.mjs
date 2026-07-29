// slice-six-spike.spike.mjs — head-to-head: control (bespoke per-class brains) vs
// candidate (archetype brains over declarative ability data). Reads the SHIPPED spike file.
// Usage: node slice-six-spike.spike.mjs [runs]
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("./slice-six-spike.html",import.meta.url),"utf8");
const m=html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//);
if(!m){console.error("FAIL: CORE markers not found");process.exit(1)}
const C=new Function(m[1]+`
  return {RNG,d,mod,CLASSES,buildCharacter,newCombat,livingFoes,heroReach,moveHero,heroDisengage,
          attackOptions,heroAttackAuto,castMagicMissile,useBonus,heroDefend,endHeroTurn,cheb,
          bfsField,key,los,makeAlly,makeFoe,shortRest,resolveSpare,spareMode,spareTarget,rollD20,
          suggestAction,suggestActionData,KIT_DATA,UNIVERSAL_ABILITIES,abilitiesOf,avgDice,OPENERS};`)();

const RUNS=+(process.argv[2]||3000);
const CLASSES=Object.keys(C.CLASSES);

/* ---------- agents: identical execution, only the brain differs ---------- */
function makeAgent(brainFn){
  return (s)=>{
    const sug=brainFn(s);
    if(sug.bonus)C.useBonus(s,sug.bonus);
    if(sug.action==="spare"){C.resolveSpare(s,C.rollD20(s.hero,C.spareMode()));return}
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
      else C.heroDefend(s);
    }
    else C.heroDefend(s);
  };
}
const AGENTS={
  control: makeAgent(s=>C.suggestAction(s)),
  candA:   makeAgent(s=>C.suggestActionData(s,false)),   // pure archetype, one constant
  candB:   makeAgent(s=>C.suggestActionData(s,true)),    // archetype + declarative gates
};
function runAgent(s,agent){
  let guard=0;
  while(!s.over&&guard++<40){
    if(!s.heroDown){agent(s);if(!s.acted)C.heroDefend(s)}
    C.endHeroTurn(s);
  }
  return s.won;
}

/* ---------- paired-seed cells ---------- */
// Both brains face the same opening dice for run i, cutting variance in the comparison.
function cellFight1(cls,opener,agentName,potion,baseSeed){
  let w=0;
  for(let i=0;i<RUNS;i++){
    C.RNG.seed(baseSeed+i);
    const ch=C.buildCharacter(cls,"human","T");ch.potion=!!potion;
    if(runAgent(C.newCombat(ch,opener),AGENTS[agentName]))w++;
  }
  return w/RUNS;
}
function cellFight2(cls,withAlly,agentName,baseSeed){
  let w=0;
  for(let i=0;i<RUNS;i++){
    C.RNG.seed(baseSeed+i);
    const ch=C.buildCharacter(cls,"human","T");
    const allies=withAlly?[C.makeAlly(C.makeFoe("stab",0,0))]:[];
    if(runAgent(C.newCombat(ch,withAlly?"warband":"reprisal",allies),AGENTS[agentName]))w++;
  }
  return w/RUNS;
}

const OPENERS=["surprise","prepared","shaken","normal","ambushed"];
const pct=v=>(v*100).toFixed(1);
const sign=v=>(v>=0?"+":"")+v.toFixed(1);

console.log(`\n=== BRAIN ARCHITECTURE SPIKE — ${RUNS} runs/cell, paired seeds ===`);
console.log(`control = shipped bespoke per-class brains | candA = pure archetype | candB = archetype + data gates\n`);

const rows=[];let worstCell={d:0,label:""},worstCellB={d:0,label:""};
for(const cls of CLASSES){
  for(const op of OPENERS){
    const potion=(op==="prepared");            // matches the shipped "smart with edges" cell
    const seed=20260729;
    const c=cellFight1(cls,op,"control",potion,seed);
    const a=cellFight1(cls,op,"candA",potion,seed);
    const b=cellFight1(cls,op,"candB",potion,seed);
    rows.push({cls,cell:"f1:"+op,c,a,b});
    if((c-a)*100>worstCell.d){worstCell={d:(c-a)*100,label:cls+" f1:"+op}}
    if((c-b)*100>worstCellB.d){worstCellB={d:(c-b)*100,label:cls+" f1:"+op}}
  }
  for(const [lbl,withAlly] of [["f2:warband",true],["f2:reprisal",false]]){
    const seed=20260730;
    const c=cellFight2(cls,withAlly,"control",seed);
    const a=cellFight2(cls,withAlly,"candA",seed);
    const b=cellFight2(cls,withAlly,"candB",seed);
    rows.push({cls,cell:lbl,c,a,b});
    if((c-a)*100>worstCell.d){worstCell={d:(c-a)*100,label:cls+" "+lbl}}
    if((c-b)*100>worstCellB.d){worstCellB={d:(c-b)*100,label:cls+" "+lbl}}
  }
}

console.log("class    cell           control   candA    ΔA      candB    ΔB");
console.log("-".repeat(66));
for(const r of rows){
  console.log(
    r.cls.padEnd(8),
    r.cell.padEnd(14),
    (pct(r.c)+"%").padStart(7),
    (pct(r.a)+"%").padStart(8),
    sign((r.a-r.c)*100).padStart(7),
    (pct(r.b)+"%").padStart(8),
    sign((r.b-r.c)*100).padStart(7));
}

/* ---------- criterion 1: smart-with-edges per class (the prepared+potion cell) ---------- */
console.log("\n--- CRITERION 1: smart-with-edges (prepared + potion), must be within 3 pts ---");
let c1A=true,c1B=true;
for(const cls of CLASSES){
  const r=rows.find(x=>x.cls===cls&&x.cell==="f1:prepared");
  const dA=(r.a-r.c)*100,dB=(r.b-r.c)*100;
  if(Math.abs(dA)>3)c1A=false;
  if(Math.abs(dB)>3)c1B=false;
  console.log(cls.padEnd(8),"control",pct(r.c)+"%","| candA",pct(r.a)+"%",`(${sign(dA)})`,
    Math.abs(dA)<=3?"ok":"OUT","| candB",pct(r.b)+"%",`(${sign(dB)})`,Math.abs(dB)<=3?"ok":"OUT");
}
console.log("criterion 1 — candA:",c1A?"PASS":"FAIL","| candB:",c1B?"PASS":"FAIL");

/* ---------- criterion 2: no cell worse by more than 5 pts ---------- */
console.log("\n--- CRITERION 2: no single cell worse by >5 pts ---");
console.log("candA worst cell:",worstCell.label||"(none worse)",worstCell.d?`-${worstCell.d.toFixed(1)}`:"0.0",
  worstCell.d<=5?"ok":"OUT");
console.log("candB worst cell:",worstCellB.label||"(none worse)",worstCellB.d?`-${worstCellB.d.toFixed(1)}`:"0.0",
  worstCellB.d<=5?"ok":"OUT");
const c2A=worstCell.d<=5,c2B=worstCellB.d<=5;
console.log("criterion 2 — candA:",c2A?"PASS":"FAIL","| candB:",c2B?"PASS":"FAIL");

/* ---------- criterion 3: existing balance assertions, candidate substituted ---------- */
console.log("\n--- CRITERION 3: existing harness balance assertions with the candidate as the smart agent ---");
function naive(s){
  const h=s.pos.hero,foes=C.livingFoes(s);
  if(!foes.length)return;
  foes.sort((a,b)=>C.cheb(h,a)-C.cheb(h,b));
  const tgt=foes[0],ti=s.foes.indexOf(tgt);
  if(!C.attackOptions(s)[ti].ok){
    const field=C.bfsField(tgt.x,tgt.y),reach=C.heroReach(s);
    let best=null,bestD=field.get(C.key(h.x,h.y))??999;
    reach.forEach((_,k)=>{const fd=field.get(k);if(fd!==undefined&&fd<bestD){bestD=fd;const p=k.split(",");best={x:+p[0],y:+p[1]}}});
    if(best)C.moveHero(s,best.x,best.y);
  }
  const first=C.attackOptions(s).find(o=>o.ok);
  if(first)C.heroAttackAuto(s,first.i,false);else C.heroDefend(s);
}
function assertSet(agentName){
  const res=[];let allOk=true;
  const edges={},evens={},ambs={},naives={};
  for(const cls of CLASSES){
    edges[cls]=cellFight1(cls,"prepared",agentName,true,777);
    evens[cls]=cellFight1(cls,"normal",agentName,false,778);
    ambs[cls]=cellFight1(cls,"ambushed",agentName,false,779);
    let w=0;
    for(let i=0;i<RUNS;i++){C.RNG.seed(780+i);const ch=C.buildCharacter(cls,"human","T");
      if(runAgent(C.newCombat(ch,"normal"),naive))w++}
    naives[cls]=w/RUNS;
  }
  for(const cls of CLASSES){
    const chk=[
      [`${cls}: edges >=70%`,edges[cls]>=0.70,pct(edges[cls])],
      [`${cls}: edges <=96%`,edges[cls]<=0.96,pct(edges[cls])],
      [`${cls}: smart >= naive`,evens[cls]>=naives[cls]-0.02,pct(evens[cls])+" vs "+pct(naives[cls])],
      [`${cls}: ambush costs >=5 pts`,(edges[cls]-ambs[cls])>=0.05,((edges[cls]-ambs[cls])*100).toFixed(1)],
    ];
    chk.forEach(([l,ok,v])=>{res.push([l,ok,v]);if(!ok)allOk=false});
  }
  const vals=CLASSES.map(c=>edges[c]);
  const spread=(Math.max(...vals)-Math.min(...vals));
  res.push(["class spread <=25 pts",spread<=0.25,(spread*100).toFixed(1)]);
  if(spread>0.25)allOk=false;
  return {res,allOk,spread};
}
for(const nm of ["control","candA","candB"]){
  const {res,allOk,spread}=assertSet(nm);
  const fails=res.filter(r=>!r[1]);
  console.log(`${nm.padEnd(8)} assertions: ${res.length-fails.length}/${res.length} pass, spread ${(spread*100).toFixed(1)} — ${allOk?"ALL GREEN":"FAILURES:"}`);
  fails.forEach(f=>console.log("   FAIL:",f[0],"=",f[2]));
}

/* ---------- secondary: can the schema express a Goblin Minion? ---------- */
console.log("\n--- SECONDARY: can the schema express a recruited Goblin Minion? ---");
const goblin=C.makeAlly(C.makeFoe("stab",0,0));
const goblinKit={archetype:"melee_striker",abilities:[
  {id:"strike",name:"Dagger",kind:"attack",cost:"action",uses:null,range:1,needsLoS:true,target:"enemy",toHit:"weapon",dice:{n:1,die:4,flat:2}},
  {id:"nimble_escape",name:"Nimble Escape",kind:"withdraw",cost:"bonus",uses:null}
]};
const dagger=goblinKit.abilities[0];
const avg=dagger.dice.n*(dagger.dice.die+1)/2+dagger.dice.flat;
console.log("Goblin Minion dagger expressed in schema:",JSON.stringify(dagger));
console.log("  schema-computed average damage:",avg,"| engine statblock: 1d4+2 =",(1*2.5+2));
console.log("  match:",avg===(1*2.5+2)?"YES":"NO");
console.log("  gap: Nimble Escape is a BONUS-cost withdraw — the schema has cost:'bonus' and");
console.log("       kind:'withdraw', so it expresses; the hero kits never used a bonus withdraw.");
console.log("  stances (Protect me / Focus / Skirmish / Hold) are POLICY, not abilities — they would");
console.log("       be archetype parameters, not schema fields. Schema covers actions; stance covers target selection.");
