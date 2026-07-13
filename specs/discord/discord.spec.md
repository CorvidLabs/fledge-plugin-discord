---
module: discord
version: 2
status: active
files:
  - src/args.ts
  - src/cli-credentials.ts
  - src/cli-send.ts
  - src/cli-webhook.ts
  - src/colors.ts
  - src/credentials.ts
  - src/credentials/dpapi.ts
  - src/credentials/file.ts
  - src/credentials/index-file.ts
  - src/credentials/keychain.ts
  - src/credentials/paths.ts
  - src/credentials/secret-tool.ts
  - src/credentials/spawn.ts
  - src/credentials/types.ts
  - src/discord.ts
  - src/format.ts
  - src/index.ts
  - src/payload.ts
  - src/prompt.ts
  - src/verify.ts

db_tables: []
depends_on: []
---

# Discord

## Purpose

Send Discord webhook messages, receive and transform inbound webhooks, verify optional HMAC signatures, format embeds, and store named webhook URLs through OS-native secure backends with a permission-hardened file fallback.

## Public API

| Surface | Behavior |
|---------|----------|
| Send | Resolve a webhook URL, build text/embed/raw JSON payloads, and support dry-run preview. |
| Receiver | Serve health and webhook endpoints, verify optional signatures, transform input, and forward to Discord. |
| Credentials | Set, list, query, reveal explicitly, and clear named webhook URLs through selected secure storage. |
| Library | Expose URL validation, sending, formatting, payload conversion, colors, and HMAC verification helpers. |

### Export Inventory

| Export | Description |
|--------|-------------|
| `ParsedArgs` | Parsed CLI option model. |
| `parseArgs` | Parse send and credential CLI arguments. |
| `runCredentialsCommand` | Execute credential-management commands. |
| `NAMED_COLORS` | Supported named Discord embed colors. |
| `parseColor` | Convert named, hex, or numeric color input. |
| `OpenStoreOptions` | Credential-store selection options. |
| `openCredentialStore` | Select and open the configured credential backend. |
| `CredentialStore` | Common named-secret storage interface. |
| `isValidName` | Validate a credential name. |
| `CredentialError` | Typed credential backend failure. |
| `DPAPIStore` | Windows per-user DPAPI backend. |
| `FileStore` | Permission-hardened file fallback backend. |
| `NameIndex` | Persistent list of stored credential names. |
| `KeychainStore` | macOS Keychain backend. |
| `configDir` | Resolve the plugin configuration directory. |
| `indexFilePath` | Resolve the credential-name index path. |
| `fileBackendDir` | Resolve the file-backend directory. |
| `dpapiBackendDir` | Resolve the DPAPI-backend directory. |
| `SecretToolStore` | Linux libsecret backend. |
| `SpawnResult` | Sanitized subprocess result. |
| `spawnCmd` | Run a credential-backend command without shell interpolation. |
| `commandExists` | Determine whether a backend command is available. |
| `SERVICE_NAME` | Stable OS credential service identifier. |
| `DiscordMessage` | Discord webhook payload model. |
| `DiscordEmbed` | Discord embed payload model. |
| `sendDiscordWebhook` | Validate and send a Discord webhook request. |
| `FormatOptions` | Embed formatting options. |
| `formatEmbed` | Build a Discord embed message. |
| `formatText` | Build a plain-text Discord message. |
| `toDiscordMessage` | Normalize inbound JSON into a Discord payload. |
| `verifyHmacSignature` | Verify supported HMAC signature headers. |
| `PromptOptions` | Masked credential prompt options. |
| `promptSecret` | Read a secret without echoing it. |

## Invariants

1. Stored webhook URLs are not printed unless the caller explicitly requests reveal.
2. Credential resolution order is inline override, named credential, environment variable, then default credential.
3. File fallback uses a private per-user directory and mode 0600 credential files.
4. Forced credential backends do not silently switch to a different backend.
5. HMAC comparison validates supported signature headers without timing-sensitive string comparison.
6. Dry-run mode never sends a network request.
7. Receiver health checks do not require or forward a Discord payload.
8. Unknown inbound JSON is rendered as a fenced code block rather than discarded.

## Behavioral Examples

```
Given a named stored webhook and `--dry-run --embed`
When the user sends a message
Then the plugin resolves the credential, prints the generated embed payload, and performs no Discord request
```

## Error Cases

| Error | When | Behavior |
|-------|------|----------|
| Missing webhook URL | No override, named, environment, or default credential resolves | Report configuration guidance and exit non-zero. |
| Invalid Discord URL | URL does not match Discord webhook hosts/path | Reject it before storage or sending. |
| Secure backend unavailable | Auto-selected OS backend cannot be used | Use the permission-hardened file fallback; forced backends fail. |
| Invalid HMAC | Secret is configured and no supported signature matches | Reject the inbound request. |
| Discord failure | Webhook returns a non-success response | Surface status and response without exposing the URL. |
| Malformed payload | CLI or receiver JSON cannot be parsed | Report validation failure and do not send. |

## Dependencies

- Bun runtime and built-in HTTP, crypto, and process APIs
- Discord webhook API
- macOS Keychain, Linux secret-tool, Windows DPAPI, or private file fallback
- fledge command packaging

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1 | 2026-07-12 | Document existing Discord sending, receiving, verification, and credential behavior for SpecSync 5 adoption. |
| 2 | 2026-07-13 | Reconciled existing API documentation and stable requirement IDs for SpecSync 5.0.1 governance; runtime behavior is unchanged. |
| 2026-07-13 | CHG-0001-adopt-specsync-5-0-1-and-trust-1-0-0-governance-for-the-discord-fledge-plugin: Adopt SpecSync 5.0.1 and Trust 1.0.0 governance for the Discord Fledge plugin |
