# S1 byte-preserving lint debt

**Status:** in progress (2026-11-08): 18 real counts remain;
Jake's reserved ten bakers are untouched.

Baseline: 637f0385eae483a1bd976fd7e0803febdc646c5f.
An empty-ratchet AST census confirms all 18 recorded counts.
No rule, dependency, source, bake output or ceiling changes.

| File under generators/ | Counts | Remaining boundary |
| --- | ---: | --- |
| bake-hdri-keys.mjs | 4 | Node child_process/fs/os/path; reserved baker work |
| bake-pine-code-parts.mjs | 1 | Node fs; reserved baker work |
| bake-pine-painted.mjs | 1 | Node fs; reserved baker work |
| bake-pine-rain.mjs | 1 | Node fs; reserved baker work |
| bake-pine-spray.mjs | 1 | Node fs; reserved baker work |
| bake-pine-thrall-extras.mjs | 1 | Node fs; reserved baker work |
| bake-pine-trophies.mjs | 1 | Node fs; reserved baker work |
| sections.ts | 7 | Format schemas and valibot; exact sealed product input |
| coatProducer.ts | 1 | Sandbox asset-prefix ownership; coat baker pipeline |

The first seven files account for ten lint counts; that is not a
claim that those files enumerate Jake's ten reserved bakers. No
baker or coat pipeline was edited or rebaked in this job; normal
product generation consumes the admitted inputs.

Pine's map inputs are only three explicitly named map programs;
do not apply Sky's whole-generators explanation here. A removable
comment-only probe in sections.ts changed validation.json.buildKey
and no other product file. Thus even behavior-preserving edits to
that sealed source fail complete product byte identity. The probe
was removed and original source rebuilt before landing.

Final complete before/after equality: 1270 files,
433458149 bytes, with every relative path and byte checked,
including validation, index and packed blobs. No excluded fields.

Each row remains open. The baker pipeline waits for Jake as directed.
For sections.ts, separately authorize changed receipt/product bytes
before migrating the defining schema APIs, preserving validation.
For coats, repair ownership through its caller/asset contract when
the baker work is authorized, rather than hiding the asset literal.
Then build, validate and lower only actual counts.
