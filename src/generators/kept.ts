/**
 * ONE-FORMAT OF31f4 (Q37): what a Pine player keeps for good, as the items section's `kept` rows. These were Pine's two
 * entries in the engine's `OWNED` table (E314 C) until the engine read them from here; ids, kinds and labels are the old
 * table's, so every save keeps what it holds.
 */
export const PINE_KEPT: { id: string; kind: 'gear'; label: string }[] = [
  { id: 'warden-longbow', kind: 'gear', label: "The Warden's Longbow" },
  { id: 'lever-rifle', kind: 'gear', label: 'Lever-action' },
];
