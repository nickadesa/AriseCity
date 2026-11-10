import { callGeminiAI, callCloudflareAI, getStoredAIConfig } from './AIBrain';
import { GitHubSyncService } from './GitHubSyncService';
import { Agent, ActivityItem } from '../types/agent';

export class AutonomousAgentEngine {
  private static isRunningStandup = false;
  private static isRunningDialogue = false;
  private static lastHeartbeat = 0;
  private static readonly HEARTBEAT_INTERVAL_MS = 6 * 60 * 1000; // 6 minutes

  /**
   * Run dynamic Daily Standup on load or when prompted
   */
  static async runDailyStandup(
    agents: Agent[],
    currentGoal: string = '',
    onActivity: (activity: ActivityItem) => void,
    onSpeech: (agentId: string, text: string, icon: string) => void,
    onUpdateLogs: (agentId: string, log: string) => void
  ): Promise<void> {
    if (this.isRunningStandup) return;
    this.isRunningStandup = true;

    try {
      const recentCommits = await GitHubSyncService.getRecentCommits();
      const latestCommit = recentCommits[0] || { shortSha: 'main', message: 'Core studio optimization' };

      const config = getStoredAIConfig();
      const prompt = `You are running a 3-turn agile standup for the AriseCity dev studio.
Recent Repo Commit: [${latestCommit.shortSha}] ${latestCommit.message}
Current Studio Objective: ${currentGoal || 'Optimize 2.5D visual performance & real-time agent memory'}

Output EXACTLY 3 JSON objects in a JSON array with this format:
[
  { "agentId": "orion", "speech": "short punchy 1-line standup status", "log": "detailed terminal log", "thought": "internal architecture thought" },
  { "agentId": "nova", "speech": "short punchy 1-line standup status", "log": "detailed terminal log", "thought": "frontend canvas thought" },
  { "agentId": "cipher", "speech": "short punchy 1-line standup status", "log": "detailed terminal log", "thought": "backend workers thought" }
]
Keep each speech under 50 characters so it fits neatly in a game speech bubble. Respond strictly with JSON.`;

      let jsonStr = '';
      if (config.provider === 'gemini') {
        jsonStr = await callGeminiAI(prompt, 'You are an autonomous engineering orchestrator for AriseCity. Respond ONLY with valid JSON array.');
      } else {
        jsonStr = await callCloudflareAI('@cf/meta/llama-3.1-8b-instruct', [
          { role: 'system', content: 'You are an autonomous engineering orchestrator for AriseCity. Respond ONLY with valid JSON array.' },
          { role: 'user', content: prompt }
        ]);
      }

      // Parse JSON from response
      const match = jsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        const standupTurns = JSON.parse(match[0]);
        for (let i = 0; i < standupTurns.length; i++) {
          const turn = standupTurns[i];
          const agent = agents.find(a => a.id === turn.agentId);
          if (!agent) continue;

          // Dispatch with realistic stagger
          setTimeout(() => {
            onSpeech(turn.agentId, turn.speech, 'message-square');
            onUpdateLogs(turn.agentId, `[Standup] ${turn.log}`);
            onActivity({
              id: 'act_' + Date.now() + '_' + turn.agentId,
              timestamp: Date.now(),
              type: 'standup',
              actorId: turn.agentId,
              actorName: agent.name,
              actorRole: agent.role,
              actorColor: agent.avatarColor,
              content: turn.speech,
              details: turn.log,
              badge: 'STANDUP',
            });
          }, i * 3500);
        }
      }
    } catch (e) {
      console.warn('Autonomous standup completed with fallback routine:', e);
      // Clean fallback if API fails
      onSpeech('orion', 'Sprint backlog synced with origin/main.', 'git-branch');
      onActivity({
        id: 'act_' + Date.now(),
        timestamp: Date.now(),
        type: 'standup',
        actorId: 'orion',
        actorName: 'Orion',
        actorRole: 'lead',
        actorColor: '#6366f1',
        content: 'Sprint backlog synced with origin/main.',
        details: 'Checked recent commits on nickadesa/AriseCity. All agents ready.',
        badge: 'STANDUP',
      });
    } finally {
      this.isRunningStandup = false;
      this.lastHeartbeat = Date.now();
    }
  }

  /**
   * Spontaneous Inter-Agent Technical Dialogue
   */
  static async triggerInterAgentDialogue(
    agents: Agent[],
    onActivity: (activity: ActivityItem) => void,
    onSpeech: (agentId: string, text: string, icon: string) => void
  ): Promise<void> {
    if (this.isRunningDialogue) return;
    this.isRunningDialogue = true;

    try {
      const pairs = [
        { from: 'nova', to: 'cipher', topic: 'API WebSocket latency & buffer compression' },
        { from: 'cipher', to: 'vortex', topic: 'Cloudflare Workers AI edge deployment route' },
        { from: 'echo', to: 'nova', topic: 'Responsive touch bounds verification on canvas' },
        { from: 'orion', to: 'copilot', topic: 'Architecture review of multi-district expansion' },
      ];

      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const agentFrom = agents.find(a => a.id === pair.from);
      const agentTo = agents.find(a => a.id === pair.to);
      if (!agentFrom || !agentTo) return;

      const prompt = `Generate a realistic 2-line technical discussion between ${agentFrom.name} (${agentFrom.role}) and ${agentTo.name} (${agentTo.role}) about: ${pair.topic}.
Format strictly as JSON:
{
  "fromSpeech": "max 45 chars question/remark",
  "toSpeech": "max 45 chars response"
}`;

      const config = getStoredAIConfig();
      let resText = '';
      if (config.provider === 'gemini') {
        resText = await callGeminiAI(prompt, 'Respond ONLY with JSON object.');
      } else {
        resText = await callCloudflareAI('@cf/meta/llama-3.1-8b-instruct', [
          { role: 'user', content: prompt }
        ]);
      }

      const match = resText.match(/\{[\s\S]*\}/);
      if (match) {
        const dialog = JSON.parse(match[0]);
        // Turn 1
        onSpeech(agentFrom.id, dialog.fromSpeech, 'message-circle');
        onActivity({
          id: 'act_' + Date.now(),
          timestamp: Date.now(),
          type: 'chat',
          actorId: agentFrom.id,
          actorName: agentFrom.name,
          actorRole: agentFrom.role,
          actorColor: agentFrom.avatarColor,
          targetId: agentTo.id,
          targetName: agentTo.name,
          content: dialog.fromSpeech,
          badge: 'DEV CHAT',
        });

        // Turn 2 after 3.2s
        setTimeout(() => {
          onSpeech(agentTo.id, dialog.toSpeech, 'code');
          onActivity({
            id: 'act_' + Date.now(),
            timestamp: Date.now(),
            type: 'chat',
            actorId: agentTo.id,
            actorName: agentTo.name,
            actorRole: agentTo.role,
            actorColor: agentTo.avatarColor,
            targetId: agentFrom.id,
            targetName: agentFrom.name,
            content: dialog.toSpeech,
            badge: 'DEV CHAT',
          });
        }, 3200);
      }
    } catch (e) {
      console.warn('Inter-agent dialogue fallback:', e);
    } finally {
      this.isRunningDialogue = false;
    }
  }

  /**
   * Periodic Studio Heartbeat check
   */
  static checkHeartbeat(
    agents: Agent[],
    currentGoal: string,
    onActivity: (activity: ActivityItem) => void,
    onSpeech: (agentId: string, text: string, icon: string) => void,
    onUpdateLogs: (agentId: string, log: string) => void
  ) {
    const now = Date.now();
    if (this.lastHeartbeat === 0) {
      this.lastHeartbeat = now;
      // Trigger standup 3.5 seconds after loading the studio
      setTimeout(() => {
        this.runDailyStandup(agents, currentGoal, onActivity, onSpeech, onUpdateLogs);
      }, 3500);
      return;
    }

    if (now - this.lastHeartbeat > this.HEARTBEAT_INTERVAL_MS) {
      this.lastHeartbeat = now;
      this.triggerInterAgentDialogue(agents, onActivity, onSpeech);
    }
  }
}
