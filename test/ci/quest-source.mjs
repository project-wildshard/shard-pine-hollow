// Independent original author leaves, never a copied product snapshot.
import {parseShardfileField} from '@wildshard/format/shardSchema';
import {PINE_QUESTS} from '../../src/generators/quests.ts';
import {PINE_FEATS} from '../../src/generators/questInventory.ts';
export function questSource(slug){return parseShardfileField('quests',{...PINE_QUESTS,achievements:PINE_FEATS});}
