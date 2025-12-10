/**
 * User Fetcher - Syncs Libyan GitHub users
 */

import type { GitHubClient } from '../github-client.js';
import type { SyncState } from '../sync-state.js';
import type { GitHubUser, SyncOptions } from '../types.js';

// Location queries to find Libyan developers
// "Libya" catches most, but we also search major cities for those who don't include "Libya"
const LOCATION_QUERIES = [
  'Libya',
  'Tripoli',
  'Benghazi',
  'Misrata',
  'طرابلس', // Tripoli in Arabic
  'ليبيا', // Libya in Arabic
];

export async function syncUsers(
  client: GitHubClient,
  state: SyncState,
  options: SyncOptions = {}
): Promise<GitHubUser[] | void> {
  const { limit = Infinity } = options;
  const syncState = state.getUserSyncState();

  if (syncState.complete) {
    console.log('✅ Users already synced. Use --force to re-sync.');
    if (!options.force) return;
    state.updateUserSyncState({
      complete: false,
      currentPage: 1,
      totalFetched: 0,
    });
  }

  console.log('🔍 Searching for GitHub users in Libya...\n');

  const seenUserIds = new Set<number>();
  // Load existing users to avoid duplicates
  for (const user of state.getAllUsers()) {
    seenUserIds.add(user.id);
  }

  let totalFetched = syncState.totalFetched || 0;

  // Search API: 30 requests/min, 1000 results max per query
  const perPage = 100;
  const maxResults = 1000;

  for (const locationQuery of LOCATION_QUERIES) {
    console.log(`\n🌍 Searching for location: "${locationQuery}"...`);

    let page = 1;
    let hasMore = true;

    while (hasMore && totalFetched < limit) {
      try {
        console.log(`📄 Fetching page ${page}...`);

        const searchResult = await client.searchUsers(
          locationQuery,
          page,
          perPage,
        );

        if (page === 1) {
          console.log(`📊 Found ${searchResult.total_count} total users\n`);
        }

        if (!searchResult.items || searchResult.items.length === 0) {
          hasMore = false;
          break;
        }

        // Fetch detailed info for each user
        for (const user of searchResult.items) {
          if (totalFetched >= limit) break;

          // Skip if we've already seen this user (from another location query)
          if (seenUserIds.has(user.id)) {
            console.log(`  ⏭️  Skipping ${user.login} (duplicate)`);
            continue;
          }

          try {
            // Check if we already have fresh data
            const existing = state.getUser(user.id);
            const isStale = !existing || isDataStale(existing._lastUpdated, 24);

            if (isStale) {
              console.log(`  👤 Fetching ${user.login}...`);
              const detailedUser = await client.getUser(user.login);
              state.addUser(detailedUser);
            } else {
              console.log(`  ⏭️  Skipping ${user.login} (fresh data)`);
            }

            seenUserIds.add(user.id);
            totalFetched++;

            // Save progress every 10 users
            if (totalFetched % 10 === 0) {
              state.updateUserSyncState({ currentPage: page, totalFetched });
              await state.saveUsers();
              await state.saveState();
              console.log(`  💾 Progress saved (${totalFetched} users)\n`);
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`  ❌ Error fetching ${user.login}: ${message}`);
          }
        }

        // Check if we've hit the limit or no more pages
        if (
          searchResult.items.length < perPage ||
          page * perPage >= maxResults
        ) {
          hasMore = false;
        } else {
          page++;
          // Search API has stricter rate limit (30/min), so pause between pages
          await sleep(2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ Error on page ${page}: ${message}`);

        // Save progress before exiting
        state.updateUserSyncState({ currentPage: page, totalFetched });
        await state.saveUsers();
        await state.saveState();

        if (message.includes('rate limit')) {
          console.log('⏳ Rate limited. Progress saved. Run again to continue.');
          return;
        }
        throw err;
      }
    }
  }

  // Mark complete
  state.updateUserSyncState({
    complete: true,
    currentPage: 1,
    totalFetched,
    lastSync: new Date().toISOString(),
  });
  await state.saveUsers();
  await state.saveState();

  console.log(`\n✅ User sync complete! ${totalFetched} users fetched.`);
  return state.getAllUsers();
}

function isDataStale(lastUpdated: string | undefined, hours = 24): boolean {
  if (!lastUpdated) return true;
  const age = Date.now() - new Date(lastUpdated).getTime();
  return age > hours * 60 * 60 * 1000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
