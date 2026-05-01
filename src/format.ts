interface WorkflowRun {
  name: string;
  html_url: string;
  head_branch: string;
  head_sha: string;
  run_number: number;
  actor: { login: string; avatar_url: string };
  created_at: string;
}

interface Repository {
  full_name: string;
  html_url: string;
}

export interface DiscordEmbed {
  embeds: Array<{
    title: string;
    url: string;
    color: number;
    description: string;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp: string;
    footer: { text: string; icon_url?: string };
  }>;
}

export function formatFailureEmbed(run: WorkflowRun, repo: Repository): DiscordEmbed {
  const shortSha = run.head_sha.slice(0, 7);

  return {
    embeds: [
      {
        title: `CI Failed: ${run.name} #${run.run_number}`,
        url: run.html_url,
        color: 0xed4245, // Discord red
        description: `Workflow **${run.name}** failed in [${repo.full_name}](${repo.html_url})`,
        fields: [
          { name: "Branch", value: `\`${run.head_branch}\``, inline: true },
          { name: "Commit", value: `\`${shortSha}\``, inline: true },
          { name: "Triggered by", value: run.actor.login, inline: true },
        ],
        timestamp: run.created_at,
        footer: {
          text: repo.full_name,
        },
      },
    ],
  };
}
