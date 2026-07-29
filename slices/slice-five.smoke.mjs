// slice-five.smoke.mjs — drives the SHIPPED page in jsdom.
import {readFileSync} from "node:fs";
import {JSDOM} from "jsdom";

const html=readFileSync(new URL("./slice-five.html",import.meta.url),"utf8");
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true});
const {window}=dom;const doc=window.document;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let pass=0,fail=0;
const ok=(c,l)=>{c?pass++:(fail++,console.error("  SMOKE FAIL:",l))};
const on=id=>doc.getElementById(id).classList.contains("on");
const click=el=>el.dispatchEvent(new window.Event("click",{bubbles:true}));
async function waitFor(fn,label,ms=20000){
  const t0=Date.now();
  while(Date.now()-t0<ms){if(fn())return true;await sleep(60)}
  fail++;console.error("  SMOKE FAIL: timeout waiting for",label);return false;
}
let sawDamageStage=false,sawOaTile=false,sawSpareBtn=false;
async function driveOverlay(){
  // click through every stage the overlay presents (d20 roll, then damage dice on a hit)
  for(let i=0;i<4&&doc.getElementById("roll").classList.contains("on");i++){
    await waitFor(()=>!doc.getElementById("roll").classList.contains("on")||!doc.getElementById("roll-btn").disabled,"overlay stage ready");
    if(!doc.getElementById("roll").classList.contains("on"))break;
    if(doc.getElementById("roll-btn").textContent.startsWith("Roll damage"))sawDamageStage=true;
    click(doc.getElementById("roll-btn"));
    await sleep(120);
  }
  await waitFor(()=>!doc.getElementById("roll").classList.contains("on"),"overlay closes");
}
// step through reader-paced transitions: Continue buttons, roll overlays, recruit naming
async function advance(fn,label,ms=40000){
  const t0=Date.now();
  while(Date.now()-t0<ms){
    if(fn())return true;
    if(doc.getElementById("roll").classList.contains("on")){await driveOverlay();continue}
    const nameBtn=doc.getElementById("btn-name-recruit");
    if(nameBtn){
      const inp=doc.getElementById("recruit-name");if(inp)inp.value="Grib";
      click(nameBtn);await sleep(150);continue;
    }
    // only tap buttons the player could actually see (scene choices, or combat actions while in combat)
    const cont=doc.querySelector(on("sc-combat")?"#actions button.cont":"#choices button.cont");
    if(cont&&!cont.disabled){click(cont);await sleep(150);continue}
    await sleep(80);
  }
  fail++;console.error("  SMOKE FAIL: timeout advancing to",label);return false;
}
async function playCombatOut(S,maxTurns){
  for(let t=0;t<maxTurns&&S.G.combat&&!S.G.combat.over;t++){
    await waitFor(()=>S.G.phase!=="anim"&&(!S.G.combat||S.G.combat.over||!S.G.combat.acted),"turn ready");
    if(!S.G.combat||S.G.combat.over)break;
    const s=S.G.combat;
    const sug=S.suggestAction(s);
    if(sug.bonus&&!s.bonusUsed){
      const bb=[...doc.querySelectorAll("#bonusrow button")].find(b=>!b.disabled&&
        (sug.bonus==="potion"?b.textContent.startsWith("Potion"):!b.textContent.startsWith("Potion")));
      if(bb){click(bb);await sleep(120);await driveOverlay();
        await waitFor(()=>S.G.phase!=="anim","bonus played")}
    }
    if(doc.querySelector(".tile.hl.oa"))sawOaTile=true;
    if(sug.action==="spare"){
      const sb=[...doc.querySelectorAll("#sparerow button")].find(b=>b.textContent.startsWith("Spare")&&!b.disabled);
      if(sb){
        sawSpareBtn=true;
        click(sb);await sleep(120);await driveOverlay();
        await waitFor(()=>S.G.phase!=="anim","spare resolved");
        continue;
      }
    }
    if(sug.action==="disengage"){
      const dbtn=[...doc.querySelectorAll("#actions button")].find(b=>b.textContent.startsWith("Disengage")&&!b.disabled);
      if(dbtn){
        click(dbtn);
        await waitFor(()=>S.G.phase!=="anim"&&S.G.combat&&S.G.combat.disengaged,"disengaged");
        if(sug.move)click(doc.querySelectorAll("#grid .tile")[sug.move.y*9+sug.move.x]);
        else{const stay=[...doc.querySelectorAll("#actions button")].find(b=>b.textContent.startsWith("Stay put"));if(stay)click(stay)}
        await waitFor(()=>S.G.phase!=="anim","disengage move played");
        continue;
      }
    }
    if(sug.move&&!s.moved&&!s.acted){
      click(doc.querySelectorAll("#grid .tile")[sug.move.y*9+sug.move.x]);
      await sleep(120);
      await waitFor(()=>S.G.phase!=="anim","move events played");
      if(!S.G.combat||S.G.combat.over)break;
    }
    const btns=[...doc.querySelectorAll("#actions button")];
    let btn=null;
    if(sug.action==="attack")btn=btns.find(b=>b.textContent.startsWith("Attack")&&!b.disabled);
    else if(sug.action==="ability"&&btns[1]&&!btns[1].disabled)btn=btns[1];
    if(!btn)btn=btns.find(b=>b.textContent.startsWith("Defend")&&!b.disabled);
    if(!btn){await sleep(200);continue}
    click(btn);await sleep(140);
    if(doc.querySelector(".fchip.targetable")){
      const chips=doc.querySelectorAll(".fchip");
      const chip=(chips[sug.target]&&chips[sug.target].classList.contains("targetable"))
        ?chips[sug.target]:doc.querySelector(".fchip.targetable");
      click(chip);await sleep(140);
    }
    if(doc.getElementById("roll").classList.contains("on"))await driveOverlay();
    await waitFor(()=>S.G.phase!=="anim","events played");
  }
}

const run=async()=>{
  const S=window.__slice;
  ok(!!S,"debug hook present");
  ok(doc.getElementById("btn-sheet").parentElement.id==="hdr","sheet button lives in the in-flow header (overlap fix)");
  ok(!on("sc-scene")&&on("sc-cover"),"cover first, header hidden");
  ok(!doc.getElementById("hdr").classList.contains("on"),"header off on cover");

  // creation
  click(doc.getElementById("btn-sit"));
  click(doc.querySelectorAll("#class-cards button")[0]);   // Fighter
  click(doc.querySelectorAll("#species-cards button")[2]); // Dwarf
  click(doc.getElementById("btn-randname"));
  click(doc.getElementById("btn-begin"));
  ok(on("sc-scene"),"scene screen reached");
  ok(doc.getElementById("hdr").classList.contains("on"),"header visible in scene");
  ok(doc.getElementById("map").style.display!=="none","map visible in scene");
  ok(doc.querySelectorAll("#grid .tile").length===9*6,"54 tiles built");
  await waitFor(()=>doc.getElementById("tk-hero"),"hero token on map");
  ok(doc.querySelector(".tile.satch"),"satchel marked on map");

  // sheet toggle from header
  click(doc.getElementById("btn-sheet"));
  ok(doc.getElementById("minisheet").classList.contains("on"),"minisheet opens");
  click(doc.getElementById("btn-sheet"));
  ok(!doc.getElementById("minisheet").classList.contains("on"),"minisheet closes");

  // road choice → manual check roll
  await waitFor(()=>doc.querySelectorAll("#choices button").length===3,"3 road choices");
  click(doc.querySelectorAll("#choices button")[1]);       // Read the tracks
  await waitFor(()=>doc.getElementById("roll").classList.contains("on"),"check overlay opens");
  await driveOverlay();
  const knownAfter=S.G.flags.known;

  // satchel → leave it → combat (Continue taps pace every hop now)
  await advance(()=>doc.querySelectorAll("#choices button:not(.cont)").length===2,"satchel choices");
  if(knownAfter)ok(doc.getElementById("tk-f0"),"scouted goblins visible on exploration map");
  click(doc.querySelectorAll("#choices button")[1]);
  await advance(()=>on("sc-combat"),"combat reached");
  ok(doc.getElementById("map-slot-combat").contains(doc.getElementById("map")),"same map carried into combat");
  ok(doc.querySelectorAll(".fchip").length===2,"two foe chips");
  ok(doc.getElementById("tk-f0")&&doc.getElementById("tk-f1"),"both goblin tokens placed");

  // movement: wait for hero turn, tap a highlighted tile, confirm position changed
  await waitFor(()=>doc.querySelector(".tile.hl"),"movement tiles highlighted");
  const before={...S.G.combat.pos.hero};
  const hl=doc.querySelector(".tile.hl");
  click(hl);
  await sleep(150);
  ok(S.G.combat.pos.hero.x!==before.x||S.G.combat.pos.hero.y!==before.y,"tile tap moved the hero");
  ok(S.G.combat.moved===true,"move consumed");

  // buff hero (HP + silver tongue so the spare lands when offered), play fight 1 through the UI
  S.G.combat.hero.hp=S.G.combat.hero.maxHp=80;
  S.G.combat.hero.stats.cha=30;
  await playCombatOut(S,30);
  // fight 1 won -> Continue -> camp (naming if recruited, Hit-Die rest) -> stage-2 fight
  await advance(()=>on("sc-combat")&&S.G.stage===2,"stage-2 combat after camp",60000);
  ok(S.G.stage===2,"stage 2 entered after camp");
  const recruited=!!(S.G.party&&S.G.party.length);
  if(recruited){
    ok(S.G.party[0].name==="Grib","recruit named at recruitment (always offered)");
    ok(sawSpareBtn,"spare button appeared and was used");
    await waitFor(()=>doc.querySelector(".fchip.ally"),"ally chip rendered");
    const ally=S.G.combat.allies[0];
    const before=ally.stance;
    click(doc.querySelector(".fchip.ally"));
    ok(ally.stance!==before,"tapping the ally chip changes its orders");
    ok(doc.getElementById("tk-a0"),"ally token on the map");
  }
  await playCombatOut(S,40);
  await waitFor(()=>on("sc-recap"),"recap after the stage-2 fight",60000);
  ok(S.G.combat.won===true,"campaign arc won");
  if(recruited)ok(S.G.stats.recruited===true,"recruit recorded in the session stats");
  ok(sawDamageStage,"manual damage-roll stage appeared after a hit");
  ok(doc.querySelector(".attrib").textContent.includes("SRD 5.2"),"SRD attribution present");

  // replay → loss run
  click(doc.getElementById("btn-again"));
  ok(on("sc-class")&&S.G.combat===null,"replay resets to class screen");
  click(doc.querySelectorAll("#class-cards button")[3]);   // Cleric
  click(doc.querySelectorAll("#species-cards button")[1]); // Elf
  click(doc.getElementById("btn-begin"));
  await waitFor(()=>doc.querySelectorAll("#choices button").length===3,"road choices (run 2)");
  click(doc.querySelectorAll("#choices button")[0]);       // Stealth
  await waitFor(()=>doc.getElementById("roll").classList.contains("on"),"check overlay (run 2)");
  await driveOverlay();
  await advance(()=>doc.querySelectorAll("#choices button:not(.cont)").length===2,"satchel (run 2)");
  click(doc.querySelectorAll("#choices button")[1]);
  await advance(()=>on("sc-combat"),"combat (run 2)");
  await waitFor(()=>S.G.phase!=="anim","opening events done");
  if(S.G.combat&&!S.G.combat.over){
    S.G.combat.hero.hp=1;
    S.G.combat.foes.forEach(f=>{if(f.hp>0){f.hp=f.maxHp=60;f.atk=20;f.dmgMod=10}});
    await playCombatOut(S,15);
  }
  await waitFor(()=>on("sc-recap"),"recap after defeat",40000);
  ok(S.G.combat.won===false,"combat lost");
  ok(doc.getElementById("recap-title").textContent.includes("Dragged"),"defeat recap text");

  console.log(`\nSMOKE: ${pass} passed, ${fail} failed`);
  window.close();process.exit(fail?1:0);
};
run().catch(e=>{console.error("SMOKE CRASH:",e);process.exit(1)});
