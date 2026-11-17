# Pine Hollow loading-renderer allocation census

> Written by: Codex
> **State:** measured 2026-11-17, MEMORY-GATES MG9. Shared engine findings addressed to mini-ninemem2 (MG10).

Exact Pine product `9328c222`, shard main `403a2c53`, ran against the
`4a7ba050` preparation client, the same client as the 1,960–2,131 MB
phone estimate. Headless Chromium used the 402 × 874 phone viewport, DPR 3
and Low graphics. The page heap snapshot triggered at `modules`, 5.071 s,
with a 1,000 MB native renderer footprint, 135 MB of main-isolate JS used
and 308 MB of reported main-isolate backing storage before the snapshot.
The single snapshot contains 305 MB of objects and native backing stores
that survived collection. A separate allocation sample hit `modules` at
4.184 s, 996 MB renderer, before control. The loading ledger read at 981 MB
used a loopback-only hook on the existing ledger.

## Loading footprint and live allocations

The detailed native run from the same product and client sampled a
1,024 MB `modules` peak. Rows below include nested totals and different
meters. Sizes are decimal MB and cannot be summed into a process total.

| Bucket over 50 MB | MB | Owner and evidence |
| --- | ---: | --- |
| Native PartitionAlloc | 566 | Chromium and shared engine. Its ArrayBuffer partition accounts for 506 MB of allocated objects. The engine owns the runtime lifetimes. The buffers include Pine payloads and data associated with workers and decode. |
| V8 main | 205 | Shared engine and Chromium. The committed old and new spaces account for 105 and 67 MB. At the snapshot trigger the main isolate had 135 MB of JS in use. |
| V8 workers | 106 | Shared engine and Chromium. Worker new space accounts for 64 MB. Active targets included the standalone server, image decode, KTX2 Zstd and three blob workers. The dump does not give a reliable per-target owner. |
| Native malloc | 120 | Chromium and shared engine. Live allocated objects accounted for 88 MB. The renderer dump did not resolve these C++ allocations to asset owners. |
| WebGL allocations in the renderer dump | 69 | Shared renderer with Pine draw inputs. About 60 MB is buffers, nested within the WebGL total. |
| Snapshot ArrayBuffer backing stores | 170 | Mixed. Heap edges reach geometry for about 89 MB, texture pixel data for 29 MB and the product wire cache for 26 MB. Other or unresolved backing stores total 24 MB. The snapshot counted each backing store once. |
| Snapshot main-isolate JS objects and code | 110 | Shared engine/V8. Includes scene objects, parsed rows and compiled code. This is the shallow JS total after the snapshot collection. |
| Loading ledger RAM ArrayBuffers | 174 | Mixed across runtime owners. The largest were `engine/scene` at 32.7 MB, the entire Pine product wire cache at 31.5 MB, and `engine/loadRigFile` at 21.4 MB. |
| Loading ledger GPU textures | 87 | Shared renderer and multiple Pine assets. The largest groups were `engine/scene` at 23.7 MB and render targets at 15.4 MB. This ledger reports allocation capacities. |

The 89 MB geometry total pools buffers from many scene and renderer
owners. The labelled loading census puts Pine's crags at 14.7 MB of CPU
buffers under its scene label plus 4.9 MB under the phone batch label.
The forest's CPU buffers total 15.6 MB across its batch and model labels.
Fine ground used 5.2 MB and the cabin cluster 4.3 MB. The entire authored
wire cache was 31.5 MB, with a largest single payload of 3.2 MB.
Decoded audio was absent from the loading ledger. After control the
audio ledger counted 68 MB across Pine and common audio, including
30.7 MB for the Pine one-shot sprite. The loading read identified no
independent Pine-owned group above 50 MB. Source files and the Low
spawn view therefore need no change from this census.

## Sampled allocation traffic through the peak

The main-isolate V8 sampler used a 16 KiB interval and kept samples for
objects already collected by the time of the read. Source maps resolve
the bundled call sites. The 800 MB figure is estimated cumulative
allocation traffic through 4.184 s. It includes short-lived work.

| Source group over 50 MB | Sampled MB | Owner |
| --- | ---: | --- |
| Scene, renderer and model construction | 342 | Shared engine. The Three core and WebGL modules account for 110 MB. Their callers include upload ownership, model construction, decoded geometry and shader warmup. |
| Format intake and schema work | 226 | Shared engine/format. Valibot accounts for 89 MB. Its callers include save decoding, manifest intake and runtime scene schemas. |
| Other shared engine code | 193 | Shared engine. Includes simulation Math, boot plumbing and runtime work outside the groups above. |

The remaining 39 MB was in other dependencies and unresolved frames.
No source group mapped to Pine author code at this threshold. The
shared-engine receipt carries the native totals and sampled sources.
The ordinary calibrated peak is still 1.960–2.131 GB. These diagnostics
provide no evidence of a change outside the roughly 170 MB run spread.

The Mac mini evidence directory
`~/.cache/wildshard/plan-artifacts/memory-gates/pine-mg9-peak-2026-11-17`
holds the compressed heap, sampling stacks, native dump and loading
ledger. MEMORY-GATES MG9 and the MG8 cook hold stay open.
