import { pineKingCollision } from './kingCollision';
import { ANTLER_KING_FIGHT, ANTLER_KING_BOSS_PROFILE } from './kingFight';
import bossRows from '../data/bossEncounter.json' with { type: 'json' };
import bossPresentation from '../data/bossPresentation.json' with { type: 'json' };
import { roamingEncounterRows as parseRoamingEncounter } from '@wildshard/sdk/bossProfiles';
import { KING_FX_LOOKS } from './kingFxLook';
import * as LAYOUT from './layout';
import { CRAG_LOOK, CAVE_LOOK } from './cragLook';
import { SPRAY_LOOK } from './streamLook';
import SPRAY_PUFFS from '../data/sprayPuffs.json' with { type: 'json' };
import KING_CUES from '../data/kingCues.json' with { type: 'json' };

// GR8: called, not read from a scheduler job's output
const bossCollision = pineKingCollision();

/** World-only view data, read from the admitted shard file before its builders run. */
export const NATIVE_VIEW: { KINGS_CLEARING: { x: number; z: number; r: number; blend: number; clear: number; }; BEAR_CAVE: { x: number; z: number; rot: number; }; KING_ARENA_FOG: 31; BOSS_RIBS: number[]; BOSS_ENCOUNTER: ReturnType<typeof parseRoamingEncounter>; BOSS_PRESENTATION: { reward: { tier: string; name: string; flavour: string; prompt: string; }; score: { intro: ({ kind: string; value: string; } | { kind: string; value: number; })[]; phase: { kind: string; values: number[]; otherwise: number; }[]; victory: ({ kind: string; value?: never; } | { kind: string; value: string; })[]; death: ({ kind: string; value?: never; } | { kind: string; value: string; })[]; pickup: { kind: string; value: string; }[]; }; }; KING_FX_LOOKS: { readonly fog: "pine-king-fog"; readonly flame: "pine-king-flame"; }; KING_CUES: { version: number; fields: never[]; rows: { id: string; vfx: { kind: string; material: string; count: number; reverse: boolean; offset: number[]; }[]; }[]; }; CRAG_LOOK: string; CAVE_LOOK: { readonly near: 60; readonly under: { readonly height: 7; readonly lzMin: -4; readonly lzMax: 36; }; readonly fill: readonly [0.05, 1.6]; readonly surface: "rock"; readonly shaft: { readonly look: "pine-cave-shaft"; readonly radialSegments: 20; readonly heightSegments: 6; readonly renderOrder: 7; readonly gain: 0.2; readonly sunBase: 0.4; readonly sunGain: 2; readonly floor: 0.02; }; readonly drips: { readonly color: 13621468; readonly size: 0.045; readonly opacity: 0.85; readonly period: 1.7; readonly periodStep: 0.53; readonly kinds: 5; readonly phaseStep: 0.37; readonly gravity: 9.8; readonly hang: 0.04; readonly minDrop: 0.2; }; }; SPRAY_LOOK: string; SPRAY_PUFFS: { notice: string; at: number[]; seed: number[]; size: number[]; }; } = { KINGS_CLEARING: LAYOUT.KINGS_CLEARING, BEAR_CAVE: LAYOUT.BEAR_CAVE, KING_ARENA_FOG: ANTLER_KING_FIGHT.arena.fog,
  BOSS_RIBS: bossCollision.volumes.ribs, BOSS_ENCOUNTER: parseRoamingEncounter(bossRows, ANTLER_KING_BOSS_PROFILE), BOSS_PRESENTATION: bossPresentation,
  KING_FX_LOOKS, KING_CUES, CRAG_LOOK, CAVE_LOOK, SPRAY_LOOK, SPRAY_PUFFS };
