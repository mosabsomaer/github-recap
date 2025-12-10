/**
 * GitHub API Client with rate limit handling
 */

import type {
  RateLimit,
  RateLimitResponse,
  GitHubUser,
  GitHubSearchResult,
  GitHubRepo,
} from './types.js';

const GITHUB_API = 'https://api.github.com';
const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

export class GitHubClient {
  private token: string;
  private rateLimit: RateLimit = {
    remaining: 5000,
    reset: null,
    limit: 5000,
  };

  constructor(token: string | undefined) {
    if (!token) {
      throw new Error('GITHUB_TOKEN is required. Set it in .env file.');
    }
    this.token = token;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private updateRateLimit(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    if (remaining) {
      this.rateLimit = {
        remaining: parseInt(remaining, 10),
        reset: new Date(
          parseInt(headers.get('x-ratelimit-reset') || '0', 10) * 1000
        ),
        limit: parseInt(headers.get('x-ratelimit-limit') || '5000', 10),
      };
    }
  }

  private async waitForRateLimit(): Promise<void> {
    if (this.rateLimit.remaining < 10 && this.rateLimit.reset) {
      const waitTime = this.rateLimit.reset.getTime() - Date.now() + 1000;
      if (waitTime > 0) {
        console.log(
          `⏳ Rate limit low (${this.rateLimit.remaining} remaining). Waiting ${Math.ceil(waitTime / 1000)}s...`
        );
        await this.sleep(waitTime);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async rest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.waitForRateLimit();

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${GITHUB_API}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    this.updateRateLimit(response.headers);

    if (!response.ok) {
      if (response.status === 403 && this.rateLimit.remaining === 0) {
        console.log('🚫 Rate limit exceeded. Waiting for reset...');
        await this.waitForRateLimit();
        return this.rest<T>(endpoint, options);
      }
      const error = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async graphql<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    await this.waitForRateLimit();

    const response = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    });

    this.updateRateLimit(response.headers);

    const data = (await response.json()) as {
      data?: T;
      errors?: Array<{ type?: string; message: string }>;
    };

    if (data.errors) {
      const rateLimitError = data.errors.find((e) => e.type === 'RATE_LIMITED');
      if (rateLimitError) {
        console.log('🚫 GraphQL rate limit exceeded. Waiting 60s...');
        await this.sleep(60000);
        return this.graphql<T>(query, variables);
      }
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data as T;
  }

  async getRateLimit(): Promise<RateLimitResponse> {
    const data = await this.rest<{ resources: RateLimitResponse }>(
      '/rate_limit'
    );
    return {
      core: data.resources.core,
      search: data.resources.search,
      graphql: data.resources.graphql,
    };
  }

  async searchUsers(
    location: string,
    page = 1,
    perPage = 100
  ): Promise<GitHubSearchResult> {
    const query = encodeURIComponent(`location:${location}`);
    return this.rest<GitHubSearchResult>(
      `/search/users?q=${query}&per_page=${perPage}&page=${page}`
    );
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.rest<GitHubUser>(`/users/${username}`);
  }

  async getUserRepos(
    username: string,
    page = 1,
    perPage = 100
  ): Promise<GitHubRepo[]> {
    return this.rest<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`
    );
  }

  async getUserContributions(username: string, from?: string, to?: string): Promise<{
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalPullRequestReviewContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
            weekday: number;
          }>;
        }>;
      };
    };
    repositoriesContributedTo: { totalCount: number };
  } | null> {
    const query = `
      query($username: String!, $from: DateTime, $to: DateTime) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]) {
            totalCount
          }
        }
      }
    `;

    const data = await this.graphql<{ user: ReturnType<typeof this.getUserContributions> extends Promise<infer T> ? T : never }>(
      query,
      { username, from, to }
    );
    return data.user;
  }

  async getRepoLanguages(
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    return this.rest<Record<string, number>>(
      `/repos/${owner}/${repo}/languages`
    );
  }

  /**
   * Get commit count and languages for multiple repos in a single GraphQL query
   * More efficient than individual REST calls
   */
  async getReposDetails(repos: Array<{ owner: string; name: string }>): Promise<
    Array<{
      owner: string;
      name: string;
      languages: Record<string, number>;
      commitCount: number | null;
    }>
  > {
    // GraphQL has a query complexity limit, so batch in groups of 10
    const batchSize = 10;
    const results: Array<{
      owner: string;
      name: string;
      languages: Record<string, number>;
      commitCount: number | null;
    }> = [];

    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);

      // Build dynamic GraphQL query
      const repoQueries = batch.map((repo, idx) => `
        repo${idx}: repository(owner: "${repo.owner}", name: "${repo.name}") {
          owner { login }
          name
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
      `).join('\n');

      const query = `query { ${repoQueries} }`;

      try {
        const data = await this.graphql<Record<string, any>>(query);

        batch.forEach((repo, idx) => {
          const repoData = data[`repo${idx}`];
          if (!repoData) {
            results.push({
              owner: repo.owner,
              name: repo.name,
              languages: {},
              commitCount: null,
            });
            return;
          }

          // Parse languages
          const languages: Record<string, number> = {};
          if (repoData.languages?.edges) {
            for (const edge of repoData.languages.edges) {
              languages[edge.node.name] = edge.size;
            }
          }

          // Parse commit count
          const commitCount = repoData.defaultBranchRef?.target?.history?.totalCount || null;

          results.push({
            owner: repo.owner,
            name: repo.name,
            languages,
            commitCount,
          });
        });
      } catch (err) {
        console.error(`Error fetching batch ${i}-${i + batch.length}:`, err);
        // Add nulls for failed batch
        batch.forEach(repo => {
          results.push({
            owner: repo.owner,
            name: repo.name,
            languages: {},
            commitCount: null,
          });
        });
      }
    }

    return results;
  }
}
