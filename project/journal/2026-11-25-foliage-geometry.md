# Foliage as geometry

QA 11-24 row 51 (J510: no flat image stands in for a 3D object), opus-looks.

- The 28 near and mid branch-card meshes in trees.glb become geometry clusters at bake time (`cardClusters.ts`): pine and fir
  needle tufts along each card's twig, birch folded leaf blades, moss hanging strands. The ferns, shrubs, reeds and stones
  in `undergrowth.ts` are fronds, twigs and leaves, keeled blades and pebbles.
- The colour stays the painting's: every triangle samples one solid texel of the zone's own textures (`foliageTexels.ts`,
  table in `src/data/foliageTexels.json`, stale check in `test/pine-foliage-geometry.test.ts`), so nothing is alpha cut.
  The pine-needles graph's alpha is 1.
- Litter and moss stay flat (row 54). The engine tree set needed no change: the parts and materials are the same.
- Cost, phone frame from the same cameras on local product builds: spawn 81 calls 1,125,953 to 1,320,383 triangles;
  canopy view 80 calls 972,305 to 1,189,829; undergrowth 51 calls 678,529 to 845,095. Critical download 2.39 to 4.18 MB
  (the tree-rest GLB); the download/phone/pine-hollow soft line re-records at the next pin (J439/J444).
