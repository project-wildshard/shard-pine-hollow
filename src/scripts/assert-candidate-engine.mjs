// Match the installed direct edge, its resolved immutable tarball and
// Node’s actual engine package path before accepting candidate receipts.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import { enginePackageUrl, enginePin, engineRoot } from '@wildshard/sdk/headless';
import { lockedEngineSource } from './candidate-engine-source.mjs';
const engine=process.env.PINE_ENGINE_CANDIDATE;
assert.match(engine??'',/^[a-f0-9]{40}$/u,'An exact candidate engine is required');
const listed=spawnSync('pnpm',['list','@wildshard/engine','@wildshard/sdk','@wildshard/format','--depth','1','--json'],{encoding:'utf8'});
assert.equal(listed.status,0,listed.stderr);
const edges=JSON.parse(listed.stdout)[0];
const dependencies={...edges?.dependencies,...edges?.devDependencies};
const producer=process.argv.includes('--producer');
// SHARD-COMPAT SI8c: the shard no longer depends on the engine. The producer runs the engine its sdk pins; a candidate
// run names its engine as a direct dependency for that run only (select-candidate.mjs).
const installed=producer?{version:enginePin,path:engineRoot,resolved:`npm:${enginePin}`}:dependencies?.['@wildshard/engine'];assert.ok(installed);
const resolved=producer?installed.resolved:installed.resolved??lockedEngineSource(readFileSync('pnpm-lock.yaml','utf8'));
if(producer){
 // J475/FS28: npm next carries an exact prerelease, 0.1.54-next.<sha>, before the tag.
 assert.match(enginePin,/^\d+\.\d+\.\d+(?:-next\.[0-9a-f]{7,40})?$/u,'Producer uses its exact released pin');
}else {
 assert.equal(resolved,`https://codeload.github.com/project-wildshard/engine/tar.gz/${engine}`);
 const sdk=JSON.parse(readFileSync('package.json','utf8')).dependencies['@wildshard/sdk'];
 // SA7b lists the SDK by its own name (0.4.N); the older alias form (npm:@wildshard/sdk@0.4.N) still reads.
 assert.match(sdk,/^(?:npm:@wildshard\/sdk@)?\d+\.\d+\.\d+$/u);
 assert.equal(dependencies['@wildshard/sdk'].version,sdk.split('@').at(-1));
 const requireEngine = (await import('node:module')).createRequire(enginePackageUrl);
 const declared = requireEngine('./package.json').dependencies['@wildshard/format'].replace('@^','@');
 const engineFormat = installed.dependencies?.['@wildshard/format'];
 assert.ok(engineFormat, 'The candidate engine has its own installed format edge');
 assert.equal(`npm:@wildshard/shard-format@${engineFormat.version}`,declared);
}
assert.equal(realpathSync(installed.path),realpathSync(dirname(fileURLToPath(enginePackageUrl))));
const result={complete:true,engine:producer?installed.version:engine,resolved,version:installed.version,sdk:dependencies['@wildshard/sdk'],format:dependencies['@wildshard/format'],engineFormat:installed.dependencies?.['@wildshard/format']};
const directory=process.env.PINE_JOURNEY_DIR??'tmp/pine-journeys';mkdirSync(directory,{recursive:true});
writeFileSync(join(directory,producer?'producer.json':'runtime.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
