// Ring 2: real forest, natural weather and clock, ordinary idle inputs.
// No actor, clock, flag, quest or random-state writes. The restored world
// comes only from the public snapshot format of the first world.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {boot,rider} from './journey-rider.mjs';

const populationCensus=host=>({alive:[...host.entities.values()].filter(body=>body.alive).length,bodies:[...host.entities.values()].map(body=>({id:body.entityId,kind:body.kind,variant:body.variant,alive:body.alive,hp:body.hp,position:[body.position.x,body.position.y,body.position.z]})).sort((a,b)=>a.id.localeCompare(b.id))});
const {loadHeadlessFolder}=await import('@wildshard/engine/host/headlessFolder');
const {serializeSimSnapshot,snapshotSimHostBytes}=await import('@wildshard/engine/sim/snapshot');

test('Pine population survives natural rain and resumes its complete world', {timeout:30_000},async()=>{
  const began=performance.now(),{resident,world}=await boot(),r=rider(resident);
  let restored;
  const result={engine:process.env.PINE_ENGINE_CANDIDATE??null,complete:false};
  try{
    const product=await loadHeadlessFolder('out/pine-hollow'),rows=await product.json('actors/shelter.json');
    const shelter=r.host.adapters.get(rows.step);assert.ok(shelter);
    const born=populationCensus(r.host),variants=new Set(born.bodies.map(body=>body.variant));
    assert.equal(born.alive,164,'The real authored population is present');
    let maxSheltered=0,maxAlive=born.alive,moved=0;const movedIds=new Set();
    const positions=new Map(born.bodies.map(body=>[body.id,body.position]));
    for(let tick=1;tick<=60_000;tick++){
      r.head(0,0);
      if(tick%600===0){
        maxSheltered=Math.max(maxSheltered,shelter.snapshot().shelters.filter(row=>row?.spot!==null&&row?.spot!==undefined).length);
        const census=populationCensus(r.host);maxAlive=Math.max(maxAlive,census.alive);
        for(const body of census.bodies){
          variants.add(body.variant);
          assert.ok(body.position.every(Number.isFinite));
          const old=positions.get(body.id);
          if(old!==undefined&&Math.hypot(body.position[0]-old[0],body.position[2]-old[2])>1){moved++;movedIds.add(body.id);}
        }
      }
    }
    assert.equal(r.host.state.tick,60_000);
    const final=populationCensus(r.host);
    assert.equal(final.alive,born.alive,'The whole population survives the idle journey');
    assert.deepEqual(final.bodies.map(body=>body.id),born.bodies.map(body=>body.id),'The original population survives, with no silent replacements');
    // Distant bodies pause outside the player’s simulation bands. Require
    // multiple moving bodies, and retain the full observed count.
    assert.ok(movedIds.size>=2,'Multiple active population bodies actually move');
    assert.ok(maxSheltered>0,'Natural rain must actually select shelter sites');
    assert.ok(moved>0,'The population must move during the journey');
    const checkpoint=serializeSimSnapshot(snapshotSimHostBytes(r.host));
    restored=await boot(checkpoint);
    assert.deepEqual(populationCensus(restored.resident.host),populationCensus(r.host));
    assert.equal(serializeSimSnapshot(snapshotSimHostBytes(restored.resident.host)),checkpoint,'Every continuation restores exactly');
    const twin=rider(restored.resident);
    for(let tick=0;tick<5;tick++){
      r.head(0,0);twin.head(0,0);
      assert.equal(serializeSimSnapshot(snapshotSimHostBytes(twin.host)),serializeSimSnapshot(snapshotSimHostBytes(r.host)),'Each suffix tick stays identical');
    }
    Object.assign(result,{complete:true,inputs:60_000,suffix:5,maxSheltered,maxAlive,finalAlive:final.alive,moved,movedBodies:movedIds.size,variants:[...variants].sort()});
  }catch(error){result.error=error.stack??String(error);throw error;}
  finally{
    result.seconds=(performance.now()-began)/1000;
    const directory=process.env.PINE_JOURNEY_DIR??'tmp/pine-population';mkdirSync(directory,{recursive:true});
    writeFileSync(join(directory,'population.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result));restored?.world.dispose();world.dispose();
  }
});
