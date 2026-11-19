# Give the cold Pine CI cook its CPU grant

Run 44528729453 passed the source, author, build-repeat and checkpoint
checks for the harvest change. The Ring 2 job reached its 15-minute
limit during the first cold cook of the new product. Its earlier steps
completed in about three minutes. The immutable cache missed after the
product bytes changed.

The pinned engine already reads `COOK_CPU_SLOTS` for phone texture
encoding and spawn-part compression. GitHub Actions now grants at most
three CPUs and the cooker reserves one for its caller. Explicit grants
continue to take precedence. The cache digest, installed inputs, full
cook, ranger progress, save continuation and time budgets stay intact.
