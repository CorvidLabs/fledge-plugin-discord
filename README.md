# fledge-plugin-discord

Discord webhook plugin for [Fledge](https://github.com/CorvidLabs/fledge). Receives incoming webhooks from any source and posts to Discord channels.

## What It Does

1. Listens for POST requests on `/webhook`
2. Optionally verifies HMAC signatures (GitHub, GitLab, custom services)
3. Forwards the payload to Discord as a message or embed

Works with CI systems, monitoring tools, deployment pipelines, or anything that can send a webhook.

## Quick Start

```bash
bun install

export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
bun run start
```

Then POST to it:

```bash
# Plain text
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "Deploy succeeded"}'

# Discord embed format (passed through directly)
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"embeds": [{"title": "Build Complete", "color": 3066993}]}'

# Any JSON (rendered as code block)
curl -X POST http://localhost:3100/webhook \
  -H "Content-Type: application/json" \
  -d '{"status": "failed", "service": "api"}'
```

## Signature Verification

Set `WEBHOOK_SECRET` to require HMAC verification. Checks these headers (in order):

- `x-hub-signature-256` (GitHub)
- `x-signature-256`
- `x-signature`

```bash
export WEBHOOK_SECRET="your-shared-secret"
```

Without `WEBHOOK_SECRET`, all requests are accepted.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Yes | Discord webhook URL |
| `WEBHOOK_SECRET` | No | HMAC secret for signature verification |
| `PORT` | No | Server port (default: 3100) |

## Payload Handling

The plugin auto-detects the payload format:

| Payload | Discord Output |
|---------|---------------|
| `{"embeds": [...]}` or `{"content": "..."}` | Passed through as-is |
| `{"text": "..."}` | Sent as plain message |
| `{"message": "..."}` | Sent as plain message |
| Any other JSON | Rendered as a code block |

## Library Usage

You can also import the modules directly:

```typescript
import { sendDiscordWebhook } from "fledge-plugin-discord/discord";
import { formatEmbed, formatText } from "fledge-plugin-discord/format";
import { verifyHmacSignature } from "fledge-plugin-discord/verify";
```

## Development

```bash
bun install
bun run dev      # Start with hot reload
bun test         # Run tests
bun run lint     # Lint
```

## License

MIT
