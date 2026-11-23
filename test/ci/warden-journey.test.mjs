// Ring2: the whole chapter on ordinary movement, interaction and weapon
// inputs. Return travel may take the game's normal checkpoint deaths;
// earned lanterns persist. The King fight refuses a hidden respawn.
// No pose, flag, inventory, clock, HP, RNG or weapon state is written.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {test} from 'node:test';
import {boot} from './journey-rider.mjs';
import {lanternJourney} from './warden-rider.mjs';

test('Pine earns lanterns, stag, King, dawn and the Warden reward',{timeout:30_000},async()=>{
 const {resident,world,shard}=await boot(),began=performance.now();
 const crossbow=shard.items.rows.find(row=>row.id==='weapon.crossbow')?.profile?.projectile;
 assert.ok(crossbow,'The authored crossbow has a projectile profile');
 const {speed}=crossbow,{gravity}=crossbow.flight;
 const catalogue=shard.rows.loot.find(row=>row.id==='barter')?.economy.goods;
 const trade=catalogue?.findIndex(good=>good.id==='cartridges')??-1;
 const tradeRoute=shard.questHost.commands.routes.find(row=>row.action.id==='quest.trade.use');
 const closeRoute=shard.questHost.commands.routes.find(row=>row.action.id==='quest.trade.close');
 assert.ok(trade>=0&&tradeRoute?.actor&&closeRoute?.actor,'The authored shop routes and cartridges exist');
 const result={engine:process.env.PINE_ENGINE_CANDIDATE??null,complete:false,stages:[],deaths:[]};
 resident.host.events.on('player.died',()=>result.deaths.push(resident.host.state.tick),resident.host.scope);
 try{
  const r=lanternJourney(resident,world),{host,player}=r;
  const assertFlag=flag=>assert.equal(r.has(flag),true,flag);
  const stage=name=>{result.stages.push({name,tick:host.state.tick,flags:[...host.flags.all]});};

 r.walk([[189,183],[182,180],[166,160],[150,142],[126,128],[104,124],[82,116],[40,94],[4,70],[4,40],[2,10],[0,-10]]);
 const {nativeInventories}=await import('@wildshard/sdk/internal/engine/game/inventoryLaw');
 r.equip(0);
 for(let hunt=0;hunt<2;hunt++){
  const deer=[...host.entities.values()].filter(a=>a.kind==='deer'&&a.alive).sort((a,b)=>a.position.distanceTo(player.position)-b.position.distanceTo(player.position))[0];assert.ok(deer);
  // OF23c: a declared herd grazes round its own centre (north of the cabin road), so hunt from the road and close to 25 m
  const gap=deer.position.distanceTo(player.position);if(gap>25){const t=(gap-25)/gap;r.walk([[player.position.x+(deer.position.x-player.position.x)*t,player.position.z+(deer.position.z-player.position.z)*t]]);}
  const back=player.position.clone(),front=player.position.clone(),previous=deer.position.clone();
  for(let tick=0,since=180;tick<1800&&deer.alive;tick++,since++){
   const vx=(deer.position.x-previous.x)*60,vz=(deer.position.z-previous.z)*60;previous.copy(deer.position);
   deer.bodyCapsule(back,front);const aim=back.add(front).multiplyScalar(.5),time=Math.hypot(aim.x-player.position.x,aim.z-player.position.z)/speed;
   aim.x+=vx*time;aim.z+=vz*time;const dx=aim.x-player.position.x,dz=aim.z-player.position.z,pitch=Math.atan2(aim.y-player.position.y-1.68+gravity/2*time*time,Math.hypot(dx,dz));
   // a hit deer bolts: follow it to 25 m, standing still to shoot
   const reach=Math.hypot(dx,dz),far=reach>25,ux=far?dx/reach:0,uz=far?dz/reach:0;
   const fire=since>=180&&!far;if(fire)since=0;
   resident.step([{kind:'player',moveX:ux,moveZ:uz,yaw:Math.atan2(-dx,-dz),pitch,commandVersion:1,steer:{keyX:0,keyY:far?1:0,stickX:0,stickY:0},...(far?{sprint:true}:{})},...(fire?[{kind:'launcher',slot:0,ads:1,pitch,fire:true}]:[])]);
  }
  assert.ok(!deer.alive);r.walk([[-5.71,-31.7],[0,-10],[deer.position.x,deer.position.z]]);r.interact(`harvest.${deer.entityId}`);r.settle(2);assert.ok(nativeInventories(host).pack.venison>=hunt+1,'Each carcass pays out through its actual harvest prompt');
 }

 r.equip(1);r.walk([[0,-10],[-5.71,-31.7],[-7.99,-35.02]]);
 r.walk([[-5.71,-31.7],[-1,-40],[-12,-52],[-30,-95],[-14,-122],[-58,-130],[-100,-138],[-128,-138],[-132,-125],[-134,-119],[-131,-117],[-129,-117.5]]);
 assert.equal(nativeInventories(host).pack.venison,2);assert.equal(nativeInventories(host).pack['amber-resin'],1);
 assert.ok(r.read('talk.trader','talked:trader')>0);r.settle(30);
 const roundCount=()=>{const s=r.saved('pine.lever');return s.tube+Number(s.chambered)+s.reserve;};
 const beforeTrade=roundCount();resident.step([{kind:'script',actorId:tradeRoute.actor,value:trade}]);r.settle(1);
 result.cartridges={before:beforeTrade,after:roundCount()};assert.equal(roundCount(),beforeTrade+14);
 resident.step([{kind:'script',actorId:closeRoute.actor,value:closeRoute.value??0}]);
 r.walk([[-131,-117],[-134,-119],[-132,-125],[-128,-138],[-100,-138],[-58,-130],[-14,-122],[-30,-95],[-12,-52],[-1,-40],[-5.71,-31.7],[-7.99,-35.02]]);
 // The director consumes wait:night during the same frame that raises it.
 // Observe its actual phase transition rather than requiring a latched flag.
 result.nightBefore=host.dayClock?.night;assert.ok(result.nightBefore<=.5,'The wait begins during daylight');
 r.read('talk.ranger','wait:night');r.settle(600);
 result.nightAfter=host.dayClock?.night;assert.ok(result.nightAfter>.5,'The ranger wait reaches actual night');stage('night');
 r.walk([[-5.71,-31.7],[0,-10],[12,-8]]);
 for(const point of [[30,-2],[58,12],[86,16],[120,12],[158,6],[155,-6],[151,-18]]){r.walk([point]);r.settle(180);}
 assertFlag('followed:stag');stage('stag');
 const king=[...host.entities.values()].find(a=>a.kind==='antler-king'&&a.alive);assert.ok(king);
 const {nativeGroundBossObservation}=await import('@wildshard/sdk/internal/engine/game/boss/native');
 const target=player.position.clone(),deathsBefore=result.deaths.length;let hits=0,lastHp=king.hp;
 // Circle close enough for the crossbow to reach his chest during the opening.
 for(let tick=0;tick<18000&&king.alive;tick++){
  const rx=player.position.x-150,rz=player.position.z+30,rad=Math.hypot(rx,rz),inward=(rad-18)*.3;
  const mx=-rz/rad-inward*rx/rad,mz=rx/rad-inward*rz/rad,scale=Math.max(1,Math.hypot(mx,mz));
  // OF23d: the declared King's weak point is his skin's chest lock point (no ribs volume of a roster body)
  king.lockPoints.point(0,target);const dx=target.x-player.position.x,dz=target.z-player.position.z,pitch=Math.atan2(target.y-player.position.y-1.68,Math.hypot(dx,dz));
  const obs=nativeGroundBossObservation(host,'pine.king');const lever=r.saved('pine.lever');if(r.saved('pine.loadout').held===1&&lever.reserve===0&&lever.tube===0&&!lever.chambered){r.equip(0);result.usedCrossbow=true;}
  const slot=r.saved('pine.loadout').held,precision=obs.fight.open>.85;
  const shot=precision&&(slot===1?lever.phase==='idle'&&lever.chambered:r.saved('pine.crossbow').loaded);
  const cycle=slot===1&&lever.phase==='idle'&&!lever.chambered&&lever.tube>0;
  const reload=slot===1&&lever.phase==='idle'&&!lever.chambered&&lever.tube===0&&lever.reserve>0;
  const distance=Math.hypot(dx,dz),aimPitch=slot===0?Math.atan2(target.y-player.position.y-1.68+gravity/2*(distance/speed)**2,distance):pitch;
  resident.step([{kind:'player',moveX:precision?0:mx/scale,moveZ:precision?0:mz/scale,yaw:shot?Math.atan2(-dx,-dz):Math.atan2(-mx,-mz),pitch:aimPitch,commandVersion:1,steer:{keyX:0,keyY:precision?0:1,stickX:0,stickY:0},sprint:true,...((shot||cycle)&&slot===1?{swing:true}:{}),...(obs?.fight.rings.some(r=>r.on)&&tick%45===10?{jump:true}:{})},{kind:'script',actorId:'pine.aim',value:1},...(shot&&slot===0?[{kind:'launcher',slot:0,ads:1,pitch:aimPitch,fire:true}]:[]),...(reload?[{kind:'launcher',slot:1,ads:0,pitch:aimPitch,reload:true}]:[])]);
  if(king.hp<lastHp)hits++;lastHp=king.hp;
  assert.equal(result.deaths.length,deathsBefore,'The entire King fight, including weapon swaps, has no death');
  assert.ok(player.health.attributes.health>0,'King fight player is alive');
  assert.ok(Math.hypot(player.position.x-150,player.position.z+30)<35,'No respawn hidden in King fight');
 }
 r.settle(2);assertFlag('dead:king');stage('King');result.kingHits=hits;
 for(let tick=0;tick<3600&&(!r.has('seen:dawn')||!r.has('quest:warden-done'));tick++)r.head(0,0);assertFlag('seen:dawn');assertFlag('quest:warden-done');stage('dawn');
  const reward=r.saved('pine.king.reward').point;assert.ok(reward);
  r.walk([[reward.x,reward.z]]);r.press('quest.reward');r.settle(2);
  assertFlag('paid:king');r.equip(2);assert.equal(r.saved('pine.loadout').held,2,'The earned Warden bow can be held');
  const paid=nativeInventories(host);r.press('quest.reward');r.settle(2);
  assert.deepEqual(nativeInventories(host),paid,'The same reward cannot pay twice');
  result.returnRespawn=r.has('dead:actor.player');result.lanterns=r.journey;result.complete=true;stage('reward');

 }catch(error){result.error=error.stack??String(error);throw error;}
 finally{
  result.seconds=(performance.now()-began)/1000;
  const directory=process.env.PINE_JOURNEY_DIR??'tmp/pine-population';mkdirSync(directory,{recursive:true});
  writeFileSync(join(directory,'warden.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));world.dispose();
 }
});
