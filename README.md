# fledge-plugin-discord

Discord webhook plugin for [Fledge](https://github.com/CorvidLabs/fledge). Send messages to Discord and receive incoming webhooks.

## Install

```bash
fledge plugins install CorvidLabs/fledge-plugin-discord
```

## Commands

### Send a message

```bash
fledge discord send "Deploy succeeded"
fledge discord send --embed "Build Complete" "All 500 tests passing"
```

### Start webhook receiver

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

## Signature Verification

Set `WEBHOOK_SECRET` to require HMAC verification. Checks headers: `x-hub-signature-256` (GitHub), `x-signature-256`, `x-signature`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Yes | Discord webhook URL |
| `WEBHOOK_SECRET` | No | HMAC secret for signature verification |
| `PORT` | No | Webhook server port (default: 3100) |

## Payload Handling

| Payload | Discord Output |
|---------|---------------|
| `{"embeds": [...]}` or `{"content": "..."}` | Passed through as-is |
| `{"text": "..."}` | Sent as plain message |
| `{"message": "..."}` | Sent as plain message |
| Any other JSON | Rendered as a code block |

## Library Usage

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
```

## License

MIT
