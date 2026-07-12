---
change: CHG-0001-adopt-specsync-5-0-1-and-trust-1-0-0-governance-for-the-discord-fledge-plugin
artifact: testing
---

# Testing

- `bun test` (65 tests)
- `bun run lint`
- `shellcheck bin/*`
- `bin/fledge-discord --help`
- `specsync check --strict --require-coverage 100 --force`
- `fledge trust doctor` and `fledge trust verify`
