# Pin the observed cache publication repair

> Written by: Codex
> State: built, 2026-11-08.

CI 42504777128 passed the new real director proof but failed before the
retained rain case ran: generation cache COMMIT hit a native SQLite
reader lock. SDK ea3e2d1 reproduces that exact failure with a real reader
and fixes it by taking the exclusive barrier before file publication.
All eleven cache edge proofs pass, using the unchanged bounded wait.

Pin that published SDK repair and regenerate the portable lockfile.
Engine and format pins stay fixed. Lockfile-only resolution preserves
the live local source aliases; no frozen install interrupts a build.
The hosted cold retained suite must prove the repaired pinned graph.
No timeout, quarantine, assertion or gameplay bytes are changed here.
