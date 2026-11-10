export interface RepoCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export class GitHubSyncService {
  private static readonly REPO_OWNER = 'nickadesa';
  private static readonly REPO_NAME = 'AriseCity';
  private static cachedCommits: RepoCommit[] = [];
  private static lastFetchTime = 0;
  private static readonly CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

  /**
   * Fetches recent commits from the public repository
   */
  static async getRecentCommits(): Promise<RepoCommit[]> {
    const now = Date.now();
    if (this.cachedCommits.length > 0 && now - this.lastFetchTime < this.CACHE_DURATION_MS) {
      return this.cachedCommits;
    }

    try {
      const url = `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/commits?per_page=6`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        console.warn(`GitHub API returned ${res.status}, using cached/fallback commits`);
        return this.getFallbackCommits();
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        this.cachedCommits = data.map((c: any) => ({
          sha: c.sha,
          shortSha: c.sha ? c.sha.slice(0, 7) : 'head',
          message: c.commit?.message?.split('\n')[0] || 'Code update',
          author: c.commit?.author?.name || c.author?.login || 'AriseCity Dev',
          date: c.commit?.author?.date || new Date().toISOString(),
          url: c.html_url || `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/commit/${c.sha}`,
        }));
        this.lastFetchTime = now;
        return this.cachedCommits;
      }
    } catch (e) {
      console.warn('Network error while querying GitHub commits', e);
    }

    return this.getFallbackCommits();
  }

  private static getFallbackCommits(): RepoCommit[] {
    if (this.cachedCommits.length > 0) return this.cachedCommits;
    return [
      {
        sha: '833a1f1',
        shortSha: '833a1f1',
        message: 'fix: ensure npcs are properly persisted and loaded to prevent crash on cached domains',
        author: 'DAVINICK',
        date: new Date().toISOString(),
        url: `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}`,
      },
      {
        sha: 'ba8e9e4',
        shortSha: 'ba8e9e4',
        message: 'fix: resolve canvas grey screen by removing duplicate zoom scaling and auto-centering camera on mobile',
        author: 'DAVINICK',
        date: new Date(Date.now() - 3600000).toISOString(),
        url: `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}`,
      },
      {
        sha: 'b780164',
        shortSha: 'b780164',
        message: 'feat: integrate Google Gemini 3.5 & Cloudflare Workers AI with persistent studio memory',
        author: 'DAVINICK',
        date: new Date(Date.now() - 7200000).toISOString(),
        url: `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}`,
      },
    ];
  }
}
