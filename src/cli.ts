#!/usr/bin/env node

/**
 * GitHub Recap CLI - Smart sync tool for Libyan developer data
 */

import { Command } from 'commander';
import { config } from 'dotenv';
import { GitHubClient } from './github-client.js';
import { SyncState } from './sync-state.js';
import { syncUsers, syncRepos, syncContributions } from './fetchers/index.js';
import { analyze } from './analyze.js';

// Load environment variables
config();

const program = new Command();

program
  .name('github-recap')
  .description('Libyan Developer Ecosystem Recap - GitHub Data Collector')
  .version('1.0.0');

// Sync command
program
  .command('sync [target]')
  .description(
    'Sync data from GitHub (target: users, repos, contributions, or all)'
  )
  .option('-f, --force', 'Force re-sync even if already complete')
  .option('-l, --limit <number>', 'Limit number of items to fetch', parseInt)
  .action(async (target = 'all', options: { force?: boolean; limit?: number }) => {
    try {
      const client = new GitHubClient(process.env.GITHUB_TOKEN);
      const state = await new SyncState().load();

      // Show rate limit info
      const rateLimit = await client.getRateLimit();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 GitHub API Rate Limits:');
      console.log(`   Core:    ${rateLimit.core.remaining}/${rateLimit.core.limit}`);
      console.log(`   Search:  ${rateLimit.search.remaining}/${rateLimit.search.limit}`);
      console.log(`   GraphQL: ${rateLimit.graphql.remaining}/${rateLimit.graphql.limit}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const syncOptions = {
        force: options.force,
        limit: options.limit || Infinity,
      };

      if (target === 'all' || target === 'users') {
        await syncUsers(client, state, syncOptions);
      }

      if (target === 'all' || target === 'repos') {
        await syncRepos(client, state, syncOptions);
      }

      if (target === 'all' || target === 'contributions') {
        await syncContributions(client, state, syncOptions);
      }

      console.log('\n🎉 Sync complete!');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show current sync status')
  .action(async () => {
    try {
      const state = await new SyncState().load();
      const stats = state.getStats();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Sync Status');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('👥 Users:');
      console.log(`   Count:     ${stats.users.count}`);
      console.log(`   Complete:  ${stats.users.complete ? '✅' : '❌'}`);
      console.log(`   Last Sync: ${stats.users.lastSync || 'Never'}`);
      if (!stats.users.complete) {
        console.log(
          `   Progress:  Page ${stats.users.currentPage}, ${stats.users.totalFetched} fetched`
        );
      }
      console.log('');

      const originalRepos = state.getOriginalRepos().length;
      const forkedRepos = state.getForkedRepos().length;
      console.log('📦 Repositories:');
      console.log(`   Total:     ${stats.repos.count}`);
      console.log(`   Original:  ${originalRepos} (used for metrics)`);
      console.log(`   Forks:     ${forkedRepos} (excluded from metrics)`);
      console.log(`   Complete:  ${stats.repos.complete ? '✅' : '❌'}`);
      console.log(`   Last Sync: ${stats.repos.lastSync || 'Never'}`);
      if (!stats.repos.complete) {
        console.log(
          `   Progress:  ${stats.repos.usersProcessed?.length || 0} users processed`
        );
      }
      console.log('');

      console.log('📈 Contributions:');
      console.log(`   Count:     ${stats.contributions.count}`);
      console.log(`   Complete:  ${stats.contributions.complete ? '✅' : '❌'}`);
      console.log(`   Last Sync: ${stats.contributions.lastSync || 'Never'}`);
      if (!stats.contributions.complete) {
        console.log(
          `   Progress:  ${stats.contributions.usersProcessed?.length || 0} users processed`
        );
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Also show rate limit if token is available
      if (process.env.GITHUB_TOKEN) {
        try {
          const client = new GitHubClient(process.env.GITHUB_TOKEN);
          const rateLimit = await client.getRateLimit();
          console.log('📊 GitHub API Rate Limits:');
          console.log(
            `   Core:    ${rateLimit.core.remaining}/${rateLimit.core.limit}`
          );
          console.log(
            `   Search:  ${rateLimit.search.remaining}/${rateLimit.search.limit}`
          );
          console.log(
            `   GraphQL: ${rateLimit.graphql.remaining}/${rateLimit.graphql.limit}`
          );
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } catch {
          // Ignore rate limit fetch errors
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Generate recap2025.json with all computed metrics')
  .action(async () => {
    try {
      await analyze();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      process.exit(1);
    }
  });

// Reset command
program
  .command('reset [target]')
  .description('Reset sync state (target: users, repos, contributions, or all)')
  .action(async (target = 'all') => {
    try {
      const state = await new SyncState().load();
      await state.reset(target);
      console.log(`✅ Reset complete for: ${target}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      process.exit(1);
    }
  });

// Rate limit command
program
  .command('rate-limit')
  .description('Check GitHub API rate limit status')
  .action(async () => {
    try {
      const client = new GitHubClient(process.env.GITHUB_TOKEN);
      const rateLimit = await client.getRateLimit();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 GitHub API Rate Limits');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const formatReset = (timestamp: number): string => {
        const reset = new Date(timestamp * 1000);
        const diff = reset.getTime() - Date.now();
        const mins = Math.ceil(diff / 60000);
        return mins > 0 ? `${mins} min` : 'now';
      };

      console.log('Core API:');
      console.log(`   Remaining: ${rateLimit.core.remaining}/${rateLimit.core.limit}`);
      console.log(`   Resets in: ${formatReset(rateLimit.core.reset)}`);
      console.log('');

      console.log('Search API:');
      console.log(`   Remaining: ${rateLimit.search.remaining}/${rateLimit.search.limit}`);
      console.log(`   Resets in: ${formatReset(rateLimit.search.reset)}`);
      console.log('');

      console.log('GraphQL API:');
      console.log(`   Remaining: ${rateLimit.graphql.remaining}/${rateLimit.graphql.limit}`);
      console.log(`   Resets in: ${formatReset(rateLimit.graphql.reset)}`);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Error:', message);
      process.exit(1);
    }
  });

// Add user command
program
  .command('add-user <username>')
  .description('Manually add a GitHub user to the dataset')
  .action(async (username: string) => {
    try {
      const client = new GitHubClient(process.env.GITHUB_TOKEN);
      const state = await new SyncState().load();

      console.log(`🔍 Fetching user: ${username}...\n`);

      // Check if user already exists
      const existingUser = state.getAllUsers().find((u) => u.login === username);
      if (existingUser) {
        console.log(`⚠️  User ${username} already exists in the dataset.`);
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Name: ${existingUser.name || 'N/A'}`);
        console.log(`   Location: ${existingUser.location || 'N/A'}`);
        console.log(`   Followers: ${existingUser.followers}`);
        console.log(`\n💡 Use "sync repos --force" or "sync contributions --force" to update their data.`);
        return;
      }

      // Fetch user from GitHub
      const user = await client.getUser(username);

      // Add to state
      state.addUser(user);
      await state.saveUsers();

      console.log('✅ User added successfully!\n');
      console.log(`   Username:  ${user.login}`);
      console.log(`   Name:      ${user.name || 'N/A'}`);
      console.log(`   Location:  ${user.location || 'N/A'}`);
      console.log(`   Bio:       ${user.bio || 'N/A'}`);
      console.log(`   Followers: ${user.followers}`);
      console.log(`   Public Repos: ${user.public_repos}`);
      console.log(`   URL:       ${user.html_url}`);

      console.log('\n💡 Next steps:');
      console.log('   1. Run "npm run sync repos" to fetch their repositories');
      console.log('   2. Run "npm run sync contributions" to fetch their contributions');
      console.log('   3. Run "npm run analyze" to regenerate the analysis');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('404')) {
        console.error(`❌ User "${username}" not found on GitHub.`);
      } else {
        console.error('❌ Error:', message);
      }

      process.exit(1);
    }
  });

program.parse();
