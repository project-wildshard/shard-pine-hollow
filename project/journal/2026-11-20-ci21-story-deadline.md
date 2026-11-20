# Restore Pine's CI21 story deadline

On engine v0.1.57, hosted Linux ran the complete 33,090-tick story and
replay in 19.9 s and 26.3 s (runs 44790316884 and 44789617395). Restore
the 30 s child and 35 s case limits and record the original test blob.

The older engine rejects the current declared roster at creature 168
(run 44790316776). Both engines took about 8.5 s through the shared
stag checkpoint with the same legacy Pine product in a Linux container.
The slow hosted run also spent longer building the ordinary pinned
producer before switching to candidate source. That run does not
isolate an engine performance regression.

The deadline restoration failed on run 44791443093. The story was the
only failed test and ran into 30 s; the producer build, before selecting
candidate source, also rose from 103.4 s on the fast run to 148.4 s.
Restore the previously approved 45 s child and 50 s case limits while
OF23g remains open.
