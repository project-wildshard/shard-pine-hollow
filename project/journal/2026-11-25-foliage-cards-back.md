# The branch cards, litter and moss come back

QA 11-25 row 46, J519 (Jake, 11-25: J510 covers held items, props and creatures only; foliage cards come back), opus-fr13.

- The forest's 28 near and mid branch cards are painted cards again: `treeRest.ts` bakes `trees.glb` as it is, and
  `cardClusters.ts` (row 51's needle tufts, birch leaves and moss strands) is gone. The pine-needles graph's alpha is
  the cut-out texture again (`f146`).
- The needle litter and the moss mats are flat painted quads again (row 54 undone in `undergrowth.ts`).
- The ferns, shrubs, reeds and stones stay geometry, with their texel table and test: J519 names only the branch cards,
  litter and moss.
- Local product build: critical download 4.18 MB back to 2.39 MB (the tree-rest GLB), the size before row 51. The
  engine's `download/phone/pine-hollow` soft line was never re-recorded for 4.18 MB, so it does not move.
