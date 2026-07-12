---
spec: discord.spec.md
---

## Context

The plugin combines a reusable TypeScript library, send/receiver CLIs, and cross-platform secret storage for Discord webhooks.

## Related Modules

- fledge plugin packaging
- Discord webhook API

## Design Decisions

- Prefer OS-native secret stores and make fallback permissions explicit.
- Keep dry-run and unit tests network-free.
- Centralize URL and signature validation.
