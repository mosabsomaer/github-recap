/**
 * Location Cleaner - Analyze and filter users by location
 */

import { SyncState } from './sync-state.js';

async function analyzeLocations() {
  const state = await new SyncState().load();
  const users = state.getAllUsers();

  // Collect all unique locations
  const locationMap = new Map<string, number>();

  for (const user of users) {
    const location = user.location?.trim() || 'NO_LOCATION';
    locationMap.set(location, (locationMap.get(location) || 0) + 1);
  }

  // Sort by count (most common first)
  const sorted = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Unique Locations (${sorted.length} total)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const [location, count] of sorted) {
    console.log(`[${count.toString().padStart(3)}] ${location}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total users: ${users.length}`);
}

async function removeNonLibyanUsers(patterns: string[]) {
  const state = await new SyncState().load();
  const users = state.getAllUsers();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧹 Removing Non-Libyan Users');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const patternsLower = patterns.map(p => p.toLowerCase());
  const toRemove: typeof users = [];

  for (const user of users) {
    const location = (user.location || '').toLowerCase().trim();

    // Check if location contains any of the exclusion patterns
    const shouldRemove = patternsLower.some(pattern => {
      // Exact match or contains the pattern
      return location === pattern || location.includes(pattern);
    });

    if (shouldRemove) {
      toRemove.push(user);
    }
  }

  console.log(`Found ${toRemove.length} users to remove:\n`);

  for (const user of toRemove) {
    console.log(`❌ ${user.login.padEnd(20)} | ${user.location || 'NO_LOCATION'}`);
  }

  if (toRemove.length === 0) {
    console.log('No users to remove!');
    return;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`⚠️  About to remove ${toRemove.length} users`);
  console.log(`This will also remove their repos and contributions data.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Remove users
  const toRemoveIds = new Set(toRemove.map(u => u.id));

  // Filter users
  const filteredUsers = users.filter(u => !toRemoveIds.has(u.id));

  // Update state with filtered users (convert array to Record)
  const filteredUsersRecord: Record<number, typeof users[0]> = {};
  for (const user of filteredUsers) {
    filteredUsersRecord[user.id] = user;
  }
  state.users = filteredUsersRecord;

  // Also remove their repos
  const repos = state.getAllRepos();
  const filteredRepos = repos.filter(r => !toRemoveIds.has(r.owner_id!));
  const filteredReposRecord: Record<number, typeof repos[0]> = {};
  for (const repo of filteredRepos) {
    filteredReposRecord[repo.id] = repo;
  }
  state.repos = filteredReposRecord;

  // Also remove their contributions
  const contributions = state.getAllContributions();
  const filteredContributions: Record<string, typeof contributions[string]> = {};
  for (const username in contributions) {
    const contrib = contributions[username];
    if (!toRemoveIds.has(contrib.userId)) {
      filteredContributions[username] = contrib;
    }
  }
  state.contributions = filteredContributions;

  // Save everything
  await state.saveUsers();
  await state.saveRepos();
  await state.saveContributions();
  await state.saveState();

  console.log(`\n✅ Removed ${toRemove.length} users successfully!`);
  console.log(`   Users remaining: ${filteredUsers.length}`);
  console.log(`   Repos remaining: ${filteredRepos.length}`);
  console.log(`   Contributions remaining: ${Object.keys(filteredContributions).length}`);
}

// CLI
async function main() {
  const command = process.argv[2];

  if (command === 'analyze') {
    await analyzeLocations();
  } else if (command === 'remove') {
    const patterns = process.argv.slice(3);

    if (patterns.length === 0) {
      console.error('❌ Error: Please provide location patterns to remove');
      console.error('\nUsage:');
      console.error('  npm run clean:remove -- "lebanon" "morocco" "greece"');
      console.error('  tsx src/clean-locations.ts remove "lebanon" "morocco" "greece"');
      console.error('\n⚠️  IMPORTANT: Each pattern must be in quotes!');
      console.error('  Bad:  npm run clean:remove lebanon');
      console.error('  Good: npm run clean:remove -- "lebanon"');
      process.exit(1);
    }

    console.log('⚠️  WARNING: About to remove users matching these patterns:');
    console.log(patterns.map(p => `  - "${p}"`).join('\n'));
    console.log('\n⏳ Starting in 3 seconds... (Press Ctrl+C to cancel)\n');

    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));

    await removeNonLibyanUsers(patterns);
  } else {
    console.log('Usage:');
    console.log('  npm run clean:analyze');
    console.log('  npm run clean:remove -- "pattern1" "pattern2" "pattern3"');
    console.log('\nExample:');
    console.log('  npm run clean:remove -- "lebanon" "greece" "morocco"');
  }
}

main();
