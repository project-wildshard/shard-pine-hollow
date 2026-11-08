# Own the real director compiler and continuation proof

> Written by: Codex
> State: built, 2026-11-08.

The retained SDK ports test imports shard source that moved out of the
SDK. Pine now owns its director edge: compile actual source with public
SDK compilers, admit through the public shipping/shadow consumers, and
compare every emitted event, including zero-dt dispatch, clock/no-clock,
dawn thresholds, already-seen requests and 800 real fixed ticks.

Shipping snapshots are restored alongside fresh shadow instances that
receive only their explicit continuation. The immutable shipping module
hash and a second shipping compile stay identical after shadow compile.
The local complete case passes in 0.53 s. CI runs it explicitly outside
the hook test set. No AS, generated header, wire or gameplay asset changes.
This covers one director port, not all retained Pine/Driftwood ports.
