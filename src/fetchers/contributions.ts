/**
 * Contributions Fetcher - Syncs contribution stats for all users
 */

import type { GitHubClient } from '../github-client.js';
import type { SyncState } from '../sync-state.js';
import type { SyncOptions, UserContributions } from '../types.js';

export async function syncContributions(
  client: GitHubClient,
  state: SyncState,
  options: SyncOptions = {}
): Promise<Record<string, UserContributions> | void> {
  const { limit = Infinity } = options;
  const syncState = state.getContributionSyncState();
  const users = state.getAllUsers();

  if (users.length === 0) {
    console.log('❌ No users found. Run "sync users" first.');
    return;
  }

  if (syncState.complete && !options.force) {
    console.log('✅ Contributions already synced. Use --force to re-sync.');
    return;
  }

  console.log(`📊 Syncing contribution stats for ${users.length} users...\n`);

  const processedSet = new Set(syncState.usersProcessed || []);
  const startIndex = syncState.currentUserIndex || 0;
  let processed = 0;

  for (let i = startIndex; i < users.length && processed < limit; i++) {
    const user = users[i];

    if (processedSet.has(user.login)) {
      continue;
    }

    try {
      console.log(
        `📈 [${i + 1}/${users.length}] Fetching contributions for ${user.login}...`
      );

      // Fetch contributions for 2025 only (matching repo filter)
      const contributions = await client.getUserContributions(
        user.login,
        '2025-01-01T00:00:00Z',
        '2025-12-31T23:59:59Z'
      );

      if (contributions) {
        state.addContribution(user.login, {
          userId: user.id,
          username: user.login,
          totalCommits:
            contributions.contributionsCollection?.totalCommitContributions ||
            0,
          totalPRs:
            contributions.contributionsCollection
              ?.totalPullRequestContributions || 0,
          totalIssues:
            contributions.contributionsCollection?.totalIssueContributions || 0,
          totalReviews:
            contributions.contributionsCollection
              ?.totalPullRequestReviewContributions || 0,
          totalContributions:
            contributions.contributionsCollection?.contributionCalendar
              ?.totalContributions || 0,
          reposContributedTo:
            contributions.repositoriesContributedTo?.totalCount || 0,
          calendar:
            contributions.contributionsCollection?.contributionCalendar
              ?.weeks || [],
        });

        console.log(
          `   ✓ ${contributions.contributionsCollection?.contributionCalendar?.totalContributions || 0} contributions`
        );
      }

      processedSet.add(user.login);
      processed++;

      // Save progress every 10 users
      if (processed % 10 === 0) {
        state.updateContributionSyncState({
          usersProcessed: Array.from(processedSet),
          currentUserIndex: i + 1,
        });
        await state.saveContributions();
        await state.saveState();
        console.log(`💾 Progress saved (${processedSet.size} users)\n`);
      }

      // Small delay to avoid hitting rate limits
      await sleep(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `❌ Error fetching contributions for ${user.login}: ${message}`
      );

      // Save progress
      state.updateContributionSyncState({
        usersProcessed: Array.from(processedSet),
        currentUserIndex: i,
      });
      await state.saveContributions();
      await state.saveState();

      if (message.includes('rate limit') || message.includes('RATE_LIMITED')) {
        console.log('⏳ Rate limited. Progress saved. Run again to continue.');
        return;
      }
    }
  }

  // Mark complete
  state.updateContributionSyncState({
    complete: true,
    usersProcessed: Array.from(processedSet),
    currentUserIndex: users.length,
    lastSync: new Date().toISOString(),
  });
  await state.saveContributions();
  await state.saveState();

  console.log(
    `\n✅ Contribution sync complete! ${processedSet.size} users processed.`
  );
  return state.getAllContributions();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
