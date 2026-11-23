// Ring2 input controller for the complete chapter, including the den.
// The caller owns/disposes the real world. No simulation state is written.
import assert from 'node:assert/strict';
import {combatRider,takeRifle} from './combat-rider.mjs';
const {worldHit}=await import('@wildshard/sdk/internal/engine/physics/query');
export function lanternJourney(resident,world){
 const r=combatRider(resident,world),{host,player}=r,stages=[];
 const stage=name=>{stages.push({name,tick:host.state.tick});};
 const assertFlag=flag=>assert.equal(r.has(flag),true,flag);
 const stair=points=>{for(const point of points){r.walk([point]);r.settle(20);}};
 const UP=[[41.23,211.92],[38.48,213.08],[37.3,213.28],[34.19,213.79],[34.35,214.78],[37.81,214.21],[37.65,213.22],[34.19,213.79],[34.35,214.78],[37.81,214.21],[37.65,213.22],[34.34,213.77]];
 takeRifle(r);r.read('talk.ranger','talked:ranger');assertFlag('talked:ranger');stage('ranger');
 r.walk([[-5.71,-31.7],[0,-10],[2,10],[4,40],[4,70],[-30,86],[-62,100],[-62.5,101.5]]);
 r.press('lantern.pond');assert.equal(r.has('lit:pond'),false);
 r.walk([[-90,80],[-120,68],[-132.6,63.3]]);r.press('dam-log-b');assertFlag('lever:dam-log-b');
 r.walk([[-125,62],[-125,75],[-135,78],[-145,72],[-146,64],[-143.7,60.4],[-146,64],[-142.3,67.1]]);
 r.press('dam-log-a');assertFlag('open:dam-sluice');
 r.walk([[-146,64],[-143.7,60.4]]);r.press('pond-glass');assertFlag('taken:pond-glass');
 r.walk([[-130,60],[-120,68],[-90,80],[-80,86],[-70,93],[-62.5,101.5]]);r.press('lantern.pond');assertFlag('lit:pond');stage('pond');
 r.walk([[-62,100],[-30,86],[4,70],[40,94],[82,116],[104,124],[126,128],[150,142],[146,158],[110,178],[76,196],[50,208],[43.5,213.5]]);
 stair(UP);stair([[35.2,214.4]]);r.press('ridge-flint');assertFlag('taken:ridge-flint');
 stair([[34.34,213.77],[37.65,213.22],[37.81,214.21],[34.35,214.78],[34.19,213.79],[37.65,213.22],[38.48,213.08],[41.23,211.92],[43.5,213.5]]);
 r.press('lantern.ridge');assertFlag('lit:ridge');stage('ridge');
 stair(UP);stair([[34.75,212.6],[34.6,211.8],[34.5,211.25],[35.3,209.9]]);r.press('pine.zipline');
 for(let tick=0;tick<1500&&!r.has('used:ph-zip');tick++)r.head(0,0);
 assertFlag('used:ph-zip');r.settle(30);stage('zip');
 // ONE-FORMAT OF23c: the den's bears are declared bodies that stalk before they charge. Shoot whichever bear comes for
 // the player (the Sow first): aim its lock point only down a clear line, hold fire until it is inside 23 m or a blow has
 // landed, then keep past 28 m. Rest to full, then walk to the lantern in short steps, fighting off any bear that turns.
 const bears=[...host.entities.values()].filter(actor=>actor.kind==='bear'),sow=bears.find(actor=>actor.label==='Grizzled Sow');assert.ok(sow?.alive);
 const head=player.position.clone(),eye=player.position.clone(),full=player.health.attributes.maxHealth;let lowest=full,hurtFrames=0,previous=sow.hp;
 const aim=actor=>{const locks=actor.lockPoints;return locks===undefined?actor.headWorld(head):locks.point(0,head);};
 const fight=target=>{const start=player.health.attributes.health;
  for(let tick=0;tick<1500&&target.alive;tick++){
   aim(target);const dx=head.x-player.position.x,dz=head.z-player.position.z,d=Math.hypot(dx,dz),pitch=Math.atan2(head.y-player.position.y-1.68,d);
   const hurt=player.health.attributes.health<start,close=hurt?(d<28?-1:0):d>45?1:0,side=tick%600<300?.2:-.2,mx=close*dx/d-side*dz/d,mz=close*dz/d+side*dx/d;
   eye.copy(player.position);eye.y+=1.68;const clear=worldHit(host.physics,eye,head,0)===null;
   const scale=Math.max(1,Math.hypot(mx,mz)),shot=tick%31===0&&clear&&(d<23||hurt);
   resident.step([{kind:'player',moveX:shot?0:mx/scale,moveZ:shot?0:mz/scale,yaw:shot?Math.atan2(-dx,-dz):Math.atan2(-mx,-mz),pitch,commandVersion:1,steer:{keyX:0,keyY:shot?0:1,stickX:0,stickY:0},sprint:true,...shot?{swing:true}:{}},{kind:'script',actorId:'pine.aim',value:1}]);
   if(target===sow&&sow.hp<previous)hurtFrames++;previous=sow.hp;lowest=Math.min(lowest,player.health.attributes.health);
   assert.equal(r.has('dead:actor.player'),false,'No hidden death/respawn on den approach');
  }
  assert.equal(target.alive,false,`${target.label} falls to the earned rifle`);
 };
 const calm=new Set(['wander','sidestep','graze','idle','rest','flee','dead']);
 const rest=()=>{for(let tick=0;tick<1800&&player.health.attributes.health<full;tick++)r.head(0,0);};
 const guarded=points=>{let from=player.position.clone();for(const [x,z] of points){const steps=Math.max(1,Math.ceil(Math.hypot(x-from.x,z-from.z)/4));
  for(let i=1;i<=steps;i++){for(let threat=bears.find(b=>b.alive&&!calm.has(b.state));threat!==undefined;threat=bears.find(b=>b.alive&&!calm.has(b.state))){fight(threat);rest();}
   r.walk([[from.x+(x-from.x)*i/steps,from.z+(z-from.z)*i/steps]]);}
  from=player.position.clone();}};
 // the Sow: shoot from 40 m out on the trail (her herd of one at (179, 179) wanders 15 m), kiting 28 to 32 m off the nearest bear
 r.walk([[4,40],[4,70],[40,94],[82,116],[104,124],[126,128],[150,142],[160,153]]);
 for(let tick=0;tick<1500&&sow.alive;tick++){
  const bear=bears.filter(actor=>actor.alive).sort((a,b)=>a.position.distanceTo(player.position)-b.position.distanceTo(player.position))[0];assert.ok(bear);
  bear.headWorld(head);const dx=head.x-player.position.x,dz=head.z-player.position.z,d=Math.hypot(dx,dz); const aim=player.position.clone();sow.headWorld(aim);const ax=aim.x-player.position.x,az=aim.z-player.position.z,pitch=Math.atan2(aim.y-player.position.y-1.68,Math.hypot(ax,az));
  const close=d>32?1:d<28?-1:0,side=tick%600<300?.2:-.2,mx=close*dx/d-side*dz/d,mz=close*dz/d+side*dx/d,scale=Math.max(1,Math.hypot(mx,mz)),shot=tick%47===0;
  resident.step([{kind:'player',moveX:shot?0:mx/scale,moveZ:shot?0:mz/scale,yaw:shot?Math.atan2(-ax,-az):Math.atan2(-mx,-mz),pitch,commandVersion:1,steer:{keyX:0,keyY:shot?0:1,stickX:0,stickY:0},sprint:true,...(d<8&&tick%45===20?{dodge:true}:{}),...shot?{swing:true}:{}},{kind:'script',actorId:'pine.aim',value:1}]);
  if(sow.hp<previous)hurtFrames++;previous=sow.hp;lowest=Math.min(lowest,player.health.attributes.health);
  assert.equal(r.has('dead:actor.player'),false,'No hidden death/respawn on den approach');
 }
 assert.equal(sow.alive,false,'The Grizzled Sow falls to the earned rifle');rest();
 guarded([[182,180],[189,183],[193.4,197.3]]);r.press('lantern.den');assertFlag('lit:den');stage('den');
 assert.equal(r.has('dead:actor.player'),false,'All three lanterns are earned without a death or respawn');
 assert.ok(hurtFrames>1,'Several real rifle shots hurt the Sow');
 assert.ok(lowest>0&&lowest<full,'A real bear blow lands and the player survives');
 assert.equal(r.has('dead:king'),false);assert.equal(r.has('quest:warden-done'),false);
 return {...r,journey:{stages,lowest,hurtFrames,sow:sow.entityId}};
}
