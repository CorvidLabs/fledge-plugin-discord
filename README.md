# fledge-plugin-ci-discord

Discord webhook plugin for CI failure notifications. Receives GitHub Actions webhook events and posts formatted failure alerts to Discord channels.

## How It Works

1. GitHub Actions sends a webhook on workflow run completion
2. This service filters for failures only
3. Posts a formatted embed to your Discord channel via webhook

## Setup

### 1. Create a Discord Webhook

1. Go to your Discord server → Channel Settings → Integrations → Webhooks
2. Create a new webhook, copy the URL

### 2. Configure GitHub Webhook

1. Go to your repo → Settings → Webhooks → Add webhook
2. **Payload URL**: Your deployed instance URL (e.g., `https://your-server.com/webhook/github`)
3. **Content type**: `application/json`
4. **Secret**: Generate a secret and set it as `GITHUB_WEBHOOK_SECRET` env var
5. **Events**: Select "Workflow runs"

### 3. Deploy

```bash
bun install
cp .env.example .env
# Edit .env with your Discord webhook URL and GitHub secret
bun run start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Discord webhook URL for posting notifications |
| `GITHUB_WEBHOOK_SECRET` | Secret for verifying GitHub webhook signatures |
| `PORT` | Server port (default: 3100) |

## Development

```bash
bun install
bun run dev      # Start with hot reload
bun test         # Run tests
```

## License

MIT
