---
spec: discord.spec.md
---

## Test Plan

### Integration Tests

- `bun install --frozen-lockfile`
- `bun test`
- `bun run lint`
- `shellcheck bin/*`
- `bin/fledge-discord --help`
