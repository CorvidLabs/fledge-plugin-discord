---
id: CHG-0001-adopt-specsync-5-0-1-and-trust-1-0-0-governance-for-the-discord-fledge-plugin
state: archived
type: migration
base_commit: 9e580c3c191c48e5e43dcd5a7379e9b71ec8b3a0
---

# Adopt SpecSync 5.0.1 and Trust 1.0.0 governance for the Discord Fledge plugin

## Intent

Adopt SpecSync 5.0.1 and Trust 1.0.0 governance for the Discord Fledge plugin

## Affected Canonical Specs

- `discord`

## Acceptance Criteria

- SpecSync strict check passes at 100 percent with all 33 exports documented; all four integrations report installed; Trust doctor and verification pass.
- All 65 tests, Biome, ShellCheck, and the help smoke remain green.

## No-spec Rationale

Not applicable

## Migration Note

Migrated by hand to SpecSync 6 per Leif's decision (2026-09-28); the 6.0.0 tool refused to archive this legacy record (`` exact-only delivery input `.github/workflows/trust.yml` changed after acceptance and requires an audited reopen; run `specsync change reopen CHG-0001-adopt-specsync-5-0-1-and-trust-1-0-0-governance-for-the-discord-fledge-plugin` to re-verify the accepted change, or supersede it from a later change under a module granted the path by `owns` in `.specsync/config.toml` ``).

- Workflow v1 (SpecSync 5) record, accepted on 2026-07-13 by the closing approval already stored in `approvals.json`. SpecSync 6.0.0 reports its accepted evidence as stale, for the reason quoted above.
- Moved by hand from `.specsync/changes/CHG-0001-adopt-specsync-5-0-1-and-trust-1-0-0-governance-for-the-discord-fledge-plugin/` into the layout `specsync change archive` writes: `accepted-state.json` is the unchanged accepted `state.json`, `state.json` is marked `archived`, and this file's front matter says `archived`.
- `approvals.json`, `verification.json` and every other artifact are the original SpecSync 5 evidence, unchanged. `verification.json` verifies commit `66a6190db9e1588935f929be0e80b2cf477aab5c`, not the tree this record was archived from.
- There is no `verification-attempts.json`: SpecSync 5 did not write one for this record, and this migration does not invent attempt history.
- This migration added no verification evidence, test result, attempt history, or approval. It is a manual migration, not a fresh re-verification.
- Closing it through the tool takes `specsync change reopen`, `specsync change verify`, then `specsync change accept`, which writes a new closing approval. Per Leif's decision it was archived by hand instead, so no reopen or new approval is recorded.
