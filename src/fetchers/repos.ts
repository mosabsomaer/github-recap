/**
 * Repository Fetcher - Syncs repos for all Libyan users
 * Optimized: Only fetches repos with 2025 activity (skips old repos + their languages)
 */

import type { GitHubClient } from '../github-client.js';
import type { SyncState } from '../sync-state.js';
import type { SyncOptions, GitHubRepo } from '../types.js';

// Only fetch repos updated in 2025
const CUTOFF_DATE = new Date('2025-01-01');

export async function syncRepos(
  client: GitHubClient,
  state: SyncState,
  options: SyncOptions = {}
): Promise<GitHubRepo[] | void> {
  const { limit = Infinity } = options;
  const syncState = state.getRepoSyncState();
  const users = state.getAllUsers();

  if (users.length === 0) {
    console.log('❌ No users found. Run "sync users" first.');
    return;
  }

  if (syncState.complete && !options.force) {
    console.log('✅ Repos already synced. Use --force to re-sync.');
    return;
  }

  console.log(`📦 Syncing repositories for ${users.length} users...`);
  console.log(`📅 Only fetching repos with activity in 2025+\n`);

  const processedSet = new Set(syncState.usersProcessed || []);
  const startIndex = syncState.currentUserIndex || 0;
  let totalFetched = syncState.totalFetched || 0;
  let skippedOld = 0;

  for (let i = startIndex; i < users.length && totalFetched < limit; i++) {
    const user = users[i];

    if (processedSet.has(user.login)) {
      console.log(`⏭️  Skipping ${user.login} (already processed)`);
      continue;
    }

    try {
      console.log(
        `📁 [${i + 1}/${users.length}] Fetching repos for ${user.login}...`
      );

      let page = 1;
      let hasMore = true;
      let userRepoCount = 0;
      let userSkipped = 0;

      while (hasMore) {
        const repos = await client.getUserRepos(user.login, page, 100);

        if (!repos || repos.length === 0) {
          hasMore = false;
          break;
        }

        let foundOldRepo = false;

        // Filter for 2025 repos first
        const repos2025 = repos.filter(repo => {
          const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : null;
          const is2025 = pushedAt && pushedAt >= CUTOFF_DATE;

          if (!is2025) {
            userSkipped++;
            skippedOld++;
            foundOldRepo = true;
          }

          return is2025;
        });

        // Batch fetch languages and commit counts for all 2025 repos
        if (repos2025.length > 0) {
          try {
            const details = await client.getReposDetails(
              repos2025.map(r => ({ owner: user.login, name: r.name }))
            );

            // Merge details back into repos
            for (let i = 0; i < repos2025.length; i++) {
              const repo = repos2025[i];
              const detail = details[i];

              state.addRepo({
                ...repo,
                languages_breakdown: detail.languages,
                commit_count: detail.commitCount,
                owner_login: user.login,
                owner_id: user.id,
              });
              userRepoCount++;
              totalFetched++;
            }
          } catch (err) {
            console.error(`   ⚠️  Error fetching details for batch, skipping...`);
          }
        }

        // Since repos are sorted by updated desc, if we found old repos
        // and got less than a full page, we can stop
        if (repos.length < 100 || (foundOldRepo && userRepoCount === 0)) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (userSkipped > 0) {
        console.log(`   ✓ ${userRepoCount} repos (skipped ${userSkipped} pre-2025)`);
      } else {
        console.log(`   ✓ ${userRepoCount} repos`);
      }

      // Mark user as processed
      processedSet.add(user.login);

      // Save progress every 5 users
      if ((i + 1) % 5 === 0 || i === users.length - 1) {
        state.updateRepoSyncState({
          usersProcessed: Array.from(processedSet),
          currentUserIndex: i + 1,
          totalFetched,
        });
        await state.saveRepos();
        await state.saveState();
        console.log(
          `💾 Progress saved (${totalFetched} repos from ${processedSet.size} users, ${skippedOld} skipped)\n`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error fetching repos for ${user.login}: ${message}`);

      // Save progress
      state.updateRepoSyncState({
        usersProcessed: Array.from(processedSet),
        currentUserIndex: i,
        totalFetched,
      });
      await state.saveRepos();
      await state.saveState();

      if (message.includes('rate limit')) {
        console.log('⏳ Rate limited. Progress saved. Run again to continue.');
        return;
      }
    }
  }

  // Mark complete
  state.updateRepoSyncState({
    complete: true,
    usersProcessed: Array.from(processedSet),
    currentUserIndex: users.length,
    totalFetched,
    lastSync: new Date().toISOString(),
  });
  await state.saveRepos();
  await state.saveState();

  console.log(
    `\n✅ Repo sync complete! ${totalFetched} repos from ${processedSet.size} users (${skippedOld} old repos skipped).`
  );
  return state.getAllRepos();
}
