# 2026-11-27 Kit stamp: the commit lane checks the staged tree

Stamped repo-kit 4d6a2612c4 and 7e9e964052 (meta QA 11-27 row 28). The commit lane now lints, formats and typechecks a
clean copy of the staged index, so another lane's unstaged edit in the shared checkout can neither fail nor pass a commit,
and the pre-commit test fixture runs isolated. By hand, since these hooks predate the land gate: run-checks took only the
staged-tree hunks. The rest of the kit (about 14 updates) waits for its own sync.
