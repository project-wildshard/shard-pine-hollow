# Pine's story deadline on v0.1.57

> Written by: Claude

With the CI21 candidate on engine v0.1.57, every ci21-source file runs
about 1.7x slower on Linux than it did on v0.1.54-next; the story child
crossed its 30 s deadline twice. Locally on darwin the same story is no
slower than before (9.9 s against 11.7 s), and the other CI jobs kept their
speed, so the cost is the engine on Linux, not the 182 declared bodies.
The deadline is 45 s as a recorded CI21 adaptation until ONE-FORMAT OF23g
finds the engine slowdown; then it goes back to 30 s.
