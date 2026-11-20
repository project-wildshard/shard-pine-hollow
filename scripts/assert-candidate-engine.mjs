// Match the installed direct edge, its resolved immutable tarball and
// Node’s actual engine package path before accepting candidate receipts.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const engine=process.env.PINE_ENGINE_CANDIDATE;
assert.match(engine??'',/^[a-f0-9]{40}$/u,'An exact candidate engine is required');
const listed=spawnSync('pnpm',['list','@wildshard/engine','@wildshard/sharddev','@wildshard/format','--depth','1','--json'],{encoding:'utf8'});
assert.equal(listed.status,0,listed.stderr);
const edges=JSON.parse(listed.stdout)[0];
const dependencies={...edges?.dependencies,...edges?.devDependencies};
const installed=dependencies?.['@wildshard/engine'];assert.ok(installed);
const producer=process.argv.includes('--producer');
if(producer){
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const declared=pkg.devDependencies?.['@wildshard/engine']??pkg.dependencies['@wildshard/engine'];
 // J475/FS28: npm next carries an exact prerelease, 0.1.54-next.<sha>, before the tag.
 assert.match(declared,/^\d+\.\d+\.\d+(?:-next\.[0-9a-f]{7,40})?$/u,'Producer uses its exact released pin');
 assert.equal(installed.version,declared);
 assert.notEqual(installed.resolved,`https://codeload.github.com/project-wildshard/engine/tar.gz/${engine}`);
}else {
 assert.equal(installed.resolved,`https://codeload.github.com/project-wildshard/engine/tar.gz/${engine}`);
 const sdk=JSON.parse(readFileSync('package.json','utf8')).dependencies['@wildshard/sharddev'];
 assert.match(sdk,/^npm:@wildshard\/sdk@0\.4\.\d+$/u);
 assert.equal(dependencies['@wildshard/sharddev'].version,sdk.split('@').at(-1));
 const requireEngine = (await import('node:module')).createRequire(import.meta.resolve('@wildshard/engine/package.json'));
 const declared = requireEngine('@wildshard/engine/package.json').dependencies['@wildshard/format'].replace('@^','@');
 const engineFormat = installed.dependencies?.['@wildshard/format'];
 assert.ok(engineFormat, 'The candidate engine has its own installed format edge');
 assert.equal(`npm:@wildshard/shard-format@${engineFormat.version}`,declared);
}
assert.equal(realpathSync(installed.path),realpathSync(dirname(fileURLToPath(import.meta.resolve('@wildshard/engine/package.json')))));
const result={complete:true,engine:producer?installed.version:engine,resolved:installed.resolved,version:installed.version,sdk:dependencies['@wildshard/sharddev'],format:dependencies['@wildshard/format'],engineFormat:installed.dependencies?.['@wildshard/format']};
const directory=process.env.PINE_JOURNEY_DIR??'tmp/pine-journeys';mkdirSync(directory,{recursive:true});
writeFileSync(join(directory,producer?'producer.json':'runtime.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
