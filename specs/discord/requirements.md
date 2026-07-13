---
spec: discord.spec.md
---

## User Stories

- As an operator, I want to send text, embeds, and raw payloads without exposing webhook credentials.
- As a service owner, I want to receive optionally authenticated webhooks and forward normalized Discord messages.

## Acceptance Criteria

### REQ-discord-001

The plugin SHALL send text, embed, and raw JSON payloads and support a network-free dry run.

### REQ-discord-002

Named webhook URLs SHALL use the selected OS-native secure store or a mode-0600 file fallback and remain hidden unless explicitly revealed.

Acceptance Criteria
- Existing credential-store, permission, and redaction tests pass without changing runtime behavior.

### REQ-discord-003

Credential resolution SHALL follow inline, named, environment, then default precedence.

### REQ-discord-004

The receiver SHALL provide health and webhook endpoints, normalize supported input shapes, and verify HMAC signatures when configured.

### REQ-discord-005

The library SHALL validate Discord webhook URLs and surface remote failures without logging credential values.

## Constraints

- Requires Bun; secure backend availability depends on the host OS and installed system tools.

## Out of Scope

- Discord bot authentication, gateway events, and non-webhook Discord APIs.
