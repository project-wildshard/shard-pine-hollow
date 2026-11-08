// Independent original author leaves, never a copied product snapshot.
import {parseShardfileField} from '@wildshard/engine/host/shardfile';
import {PINE_QUESTS} from '../../src/shards/pine-hollow/generators/quests.ts';
import {PINE_FEATS} from '../../src/shards/pine-hollow/generators/questInventory.ts';
export function questSource(slug){return parseShardfileField('quests',{...PINE_QUESTS,achievements:PINE_FEATS});}
