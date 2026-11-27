# Pine waits for the SessionEnd sleeper to exit

QA27. Stamp repo-kit's accepted test from ec8a2459be. The old test
refused the QA63 gate twice while the child was exiting. The new
fixture owns and reaps the children and awaits exit before asserting.
