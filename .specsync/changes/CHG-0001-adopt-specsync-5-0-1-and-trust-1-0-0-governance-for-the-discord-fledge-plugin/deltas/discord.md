## MODIFIED
### SPEC SECTION Change Log
| Version | Date | Changes |
|---------|------|---------|
| 1 | 2026-07-12 | Document existing Discord sending, receiving, verification, and credential behavior for SpecSync 5 adoption. |
| 2 | 2026-07-13 | Reconciled existing API documentation and stable requirement IDs for SpecSync 5.0.1 governance; runtime behavior is unchanged. |

### REQUIREMENT REQ-discord-002
Named webhook URLs SHALL use the selected OS-native secure store or a mode-0600 file fallback and remain hidden unless explicitly revealed.

Acceptance Criteria
- Existing credential-store, permission, and redaction tests pass without changing runtime behavior.
