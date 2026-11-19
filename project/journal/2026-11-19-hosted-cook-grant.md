# Give the cold Pine CI cook its CPU grant

Run 44528729453 passed the source, author, build-repeat and checkpoint
checks for the harvest change. The Ring 2 job reached its 15-minute
limit during the first cold cook of the new product. Its earlier steps
completed in about three minutes. The immutable cache missed after the
product bytes changed.

The pinned engine already reads `COOK_CPU_SLOTS` for phone texture
encoding and spawn-part compression. The first three-slot run 44532087546
left two encoders and was stopped after 697 s in the cook step.

With the exact rebuilt draft `52fe5f92`, four slots on the Mac left
three encoders. The cold cook finished in 389.7 s, of which 258.5 s
was texture encoding and 0.70 s was synchronous wire-size accounting.
It produced all 247 server files and 74 spawn parts. Use up to four
hosted slots and reserve one for the caller. Preserve explicit grants,
cache digests, product bytes, ranger and save checks, and both deadlines.

Hosted run 44536740178 still hit the job deadline after 713 s in the
cook step with four slots. The Ring 2 server proof documented device
tiers as off, but the engine now enables the phone encoder by default.
Pass the intended tier configuration explicitly. Keep the full cook,
ASTC source checks, pack integrity, ranger progress and save assertions.
The exact local server proof cooked in 126.54 s, earned ranger talk,
and resumed with five identical ticks across its 247 server files.
The signed staging cook remains the end-to-end tiered phone proof for
S12f4 and uses the full texture pipeline.
