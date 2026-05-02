# fledge-plugin-discord

Discord webhook plugin for [Fledge](https://github.com/CorvidLabs/fledge). Send messages to Discord and receive incoming webhooks.

## Install

```bash
fledge plugins install CorvidLabs/fledge-plugin-discord
```

## Store webhook URLs securely

Avoid pasting webhook URLs into env vars and shell history. The plugin keeps URLs in the OS-native secure store:

| OS | Backend | How |
|----|---------|-----|
| macOS | Keychain | `security` CLI, login keychain |
| Linux | libsecret | `secret-tool` (GNOME Keyring / KWallet via libsecret) |
| Windows | DPAPI | PowerShell-driven, per-user encryption |
| Fallback | File | `~/.config/fledge-plugin-discord/credentials/<name>.url` (chmod `0600`) — used only if no secure backend is available |

```bash
# Prompts with masked input (URL never appears in argv, history, or stdout)
fledge discord set-url
fledge discord set-url --name prod
fledge discord set-url --name staging --from-stdin <<< "$URL"

fledge discord list-urls                       # names only
fledge discord get-url --name prod             # confirms presence (does not print URL)
fledge discord get-url --name prod --reveal    # explicitly prints the URL
fledge discord clear-url --name prod
fledge discord clear-url --all
```

Force a specific backend with `FLEDGE_DISCORD_CRED_BACKEND={keychain|secret-tool|dpapi|file}`.

URL resolution order for `send` and the webhook receiver:

1. `--webhook <url>` flag (send only)
2. `--name <name>` from the secure store
3. `DISCORD_WEBHOOK_URL` environment variable
4. `default` from the secure store

## Send a message

```bash
# Plain text
fledge discord send "Deploy succeeded"

# Pipe from stdin
git log -1 --pretty=%B | fledge discord send -

# Embed with color, fields, footer, timestamp
fledge discord send --embed \
  --color green \
  --field "Status=Passing" \
  --field "+Tests=37" \
  --field "+Plugin=discord" \
  --footer "fledge-plugin-discord" \
  --now \
  "Build Complete" "All checks green"

# Raw Discord payload
fledge discord send --json '{"content":"hi","embeds":[{"title":"X"}]}'

# Send using a stored credential
fledge discord send --name prod "Deployed to production"

# Override webhook URL inline (skips stored credentials and env)
fledge discord send --webhook https://discord.com/api/webhooks/... "Hi"

# Preview without sending
fledge discord send --dry-run --embed "Title" "Description"
```

### Send options

| Flag | Description |
|------|-------------|
| `--embed` | Send as a rich embed |
| `--json <json>` | Send raw JSON (Discord webhook payload) |
| `--webhook <url>` | Override stored credentials and `DISCORD_WEBHOOK_URL` |
| `--name <name>` | Use a named webhook URL from the secure store |
| `--color <name\|hex>` | Embed color (e.g. `red`, `#57f287`, `0x5865f2`, or named: `success`, `warning`, `error`, `info`) |
| `--field name=value` | Add an embed field (repeatable). Prefix with `+` for inline: `+name=value` |
| `--footer <text>` | Embed footer text |
| `--url <url>` | Embed URL |
| `--username <name>` | Override webhook username |
| `--avatar <url>` | Override webhook avatar |
| `--timestamp <iso>` | Embed timestamp (ISO 8601) |
| `--now` | Use the current time as the embed timestamp |
| `--dry-run` | Print payload without sending |

## Webhook receiver

```bash
fledge discord webhook
```

Listens for POST requests on `/webhook` (port 3100 by default) and forwards to Discord.

```bash
# Plain text
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "Deploy succeeded"}'

# Discord embed (passed through)
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"embeds": [{"title": "Build Complete", "color": 3066993}]}'

# Any JSON (rendered as code block)
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"status": "failed", "service": "api"}'
```

`GET /health` returns `ok` for liveness checks.

### Signature verification

Set `WEBHOOK_SECRET` to require HMAC verification. Checks headers in order: `x-hub-signature-256` (GitHub), `x-signature-256`, `x-signature`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WEBHOOK_URL` | No | Discord webhook URL (overrides stored credentials) |
| `DISCORD_WEBHOOK_NAME` | No | Named credential the webhook receiver should use (default: `default`) |
| `WEBHOOK_SECRET` | No | HMAC secret for signature verification |
| `PORT` | No | Webhook server port (default: 3100) |
| `FLEDGE_DISCORD_CRED_BACKEND` | No | Force backend: `keychain`, `secret-tool`, `dpapi`, or `file` |

## Payload handling (webhook receiver)

| Payload | Discord output |
|---------|----------------|
| `{"embeds": [...]}` or `{"content": "..."}` | Passed through as-is |
| `{"text": "..."}` | Sent as plain message |
| `{"message": "..."}` | Sent as plain message |
| Any other JSON | Rendered as a fenced code block |

## Library usage

```typescript
import {
  sendDiscordWebhook,
  formatEmbed,
  formatText,
  toDiscordMessage,
  parseColor,
  verifyHmacSignature,
} from "fledge-plugin-discord";
```

## Development

```bash
bun install
bun test            # Run tests
bun run send -- --help
bun run webhook     # Start the receiver
bun run dev         # Receiver with hot reload
```

## License

MIT
