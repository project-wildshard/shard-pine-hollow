# Read the CI21 candidate engine source from pnpm’s lock

QA63 ports Nalati 465f74c9. pnpm 10.34.9 omits resolved for a git
dependency. Use the lock resolution then and keep the exact candidate
URL, real package path and producer checks. The candidate job runs
the same git, tarball, registry and ambiguous-source regression.
