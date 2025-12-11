/**
 * Analysis Script - Generates recap2025.json with all computed metrics
 */

import fs from 'fs/promises';
import path from 'path';
import { SyncState } from './sync-state.js';

const CUTOFF_2025 = new Date('2025-01-01');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'analysis', 'recap2025.json');

interface Recap2025 {
  generatedAt: string;
  summary: {
    totalUsers: number;
    activeUsers2025: number;
    totalRepos: number;
    repos2025: number;
    originalRepos2025: number;
    totalContributions: number;
    totalStars: number;
    totalForks: number;
    newDevsIn2025: number;
  };
  topDevelopers: {
    byFollowers: Array<{ login: string; name: string | null; followers: number; avatar_url: string }>;
    byContributions: Array<{ login: string; name: string | null; totalContributions: number; avatar_url: string }>;
    byCommits: Array<{ login: string; name: string | null; totalCommits: number; avatar_url: string }>;
  };
  topRepos: {
    byStars: Array<{ name: string; full_name: string; stars: number; language: string | null; description: string | null; commits: number | null }>;
    byForks: Array<{ name: string; full_name: string; forks: number; language: string | null; description: string | null; commits: number | null }>;
    byCommits: Array<{ name: string; full_name: string; commits: number; language: string | null; description: string | null; stars: number }>;
  };
  languages: {
    distribution: Record<string, number>;
    topLanguages: Array<{ language: string; count: number; percentage: number }>;
    languageOfYear: string;
  };
activity: {
    weekdayDistribution: Record<string, number>;
    peakDay: string;
    peakDayCount: number;
    monthlyDistribution: Record<string, number>;
    peakMonth: string;
    totalContributionDays: number;
  };
  funStats: {
    mostProductiveMonth: string;
    epicComparisons: string[];
  };
  interestingFacts: {
    leastContributedDay: { date: string; contributions: number } | null;
    mostContributionsInOneDay: { date: string; contributions: number } | null;
  };
  charts: {
    languageDonut: Array<{ language: string; percentage: number; color?: string }>;
    weeklyBar: Array<{ day: string; contributions: number }>;
    monthlyLine: Array<{ month: string; contributions: number }>;
  };
}

export async function analyze(): Promise<Recap2025> {
  console.log('📊 Starting analysis...\n');

  const state = await new SyncState().load();

  const users = state.getAllUsers();
  const allRepos = state.getAllRepos();
  const contributions = state.getAllContributions();

  // Filter for 2025 data
  const repos2025 = allRepos.filter((r) => {
    const pushedAt = r.pushed_at ? new Date(r.pushed_at) : null;
    return pushedAt && pushedAt >= CUTOFF_2025;
  });

  const originalRepos2025 = repos2025.filter((r) => !r.fork);

  // New devs who joined in 2025
  const newDevs2025 = users.filter((u) => {
    const createdAt = new Date(u.created_at);
    return createdAt >= CUTOFF_2025;
  });

  // Users with contributions
  const activeUsers = Object.keys(contributions).filter(
    (username) => contributions[username].totalContributions > 0
  );

  console.log(`👥 Users: ${users.length} total, ${activeUsers.length} active`);
  console.log(`📦 Repos: ${allRepos.length} total, ${repos2025.length} in 2025, ${originalRepos2025.length} original`);
  console.log(`🆕 New devs in 2025: ${newDevs2025.length}`);

  // === TOP DEVELOPERS ===
  const topByFollowers = [...users]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 10)
    .map((u) => ({
      login: u.login,
      name: u.name,
      followers: u.followers,
      avatar_url: u.avatar_url,
    }));

  const contribArray = Object.values(contributions);
  const topByContributions = [...contribArray]
    .sort((a, b) => b.totalContributions - a.totalContributions)
    .slice(0, 10)
    .map((c) => {
      const user = users.find((u) => u.login === c.username);
      return {
        login: c.username,
        name: user?.name || null,
        totalContributions: c.totalContributions,
        avatar_url: user?.avatar_url || '',
      };
    });

  const topByCommits = [...contribArray]
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .slice(0, 10)
    .map((c) => {
      const user = users.find((u) => u.login === c.username);
      return {
        login: c.username,
        name: user?.name || null,
        totalCommits: c.totalCommits,
        avatar_url: user?.avatar_url || '',
      };
    });

  // === TOP REPOS ===
  const topByStars = [...originalRepos2025]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      stars: r.stargazers_count,
      language: r.language,
      description: r.description,
      commits: r.commit_count ?? null,
    }));

  const topByForks = [...originalRepos2025]
    .sort((a, b) => b.forks_count - a.forks_count)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      forks: r.forks_count,
      language: r.language,
      description: r.description,
      commits: r.commit_count ?? null,
    }));

  const topReposByCommits = [...originalRepos2025]
    .filter((r) => r.commit_count !== null && r.commit_count !== undefined)
    .sort((a, b) => (b.commit_count || 0) - (a.commit_count || 0))
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      full_name: r.full_name,
      commits: r.commit_count!,
      language: r.language,
      description: r.description,
      stars: r.stargazers_count,
    }));

  // === LANGUAGES ===
  const langCount: Record<string, number> = {};
  for (const repo of originalRepos2025) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  }

  const totalLangRepos = Object.values(langCount).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(langCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / totalLangRepos) * 100),
    }));

  const languageOfYear = topLanguages[0]?.language || 'Unknown';

  // === ACTIVITY (from contribution calendar) ===
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayCount: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  const monthlyCount: Record<string, number> = {};
  let totalContribDays = 0;
  let totalContributions = 0;

  for (const contrib of contribArray) {
    for (const week of contrib.calendar) {
      for (const day of week.contributionDays) {
        // Only count 2025 contributions
        const date = new Date(day.date);
        if (date >= CUTOFF_2025) {
          const dayName = weekdays[day.weekday];
          weekdayCount[dayName] += day.contributionCount;

          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + day.contributionCount;

          if (day.contributionCount > 0) {
            totalContribDays++;
          }
          totalContributions += day.contributionCount;
        }
      }
    }
  }

  // Find peak day
  const peakDayEntry = Object.entries(weekdayCount).sort(([, a], [, b]) => b - a)[0];
  const peakDay = peakDayEntry[0];
  const peakDayCount = peakDayEntry[1];

  // Find peak month
  const peakMonthEntry = Object.entries(monthlyCount).sort(([, a], [, b]) => b - a)[0];
  const peakMonth = peakMonthEntry ? peakMonthEntry[0] : 'Unknown';

  // === INTERESTING FACTS ===
  // Build a map of all dates with their contribution counts
  const dateContributions: Record<string, number> = {};

  for (const contrib of contribArray) {
    for (const week of contrib.calendar) {
      for (const day of week.contributionDays) {
        const date = new Date(day.date);
        if (date >= CUTOFF_2025) {
          dateContributions[day.date] = (dateContributions[day.date] || 0) + day.contributionCount;
        }
      }
    }
  }

  // Find least contributed day (excluding zero days)
  const nonZeroDays = Object.entries(dateContributions).filter(([, count]) => count > 0);
  const leastContributedDay = nonZeroDays.length > 0
    ? nonZeroDays.sort(([, a], [, b]) => a - b)[0]
    : null;

  // Find most contributions in one day
  const mostContributionsInOneDay = nonZeroDays.length > 0
    ? nonZeroDays.sort(([, a], [, b]) => b - a)[0]
    : null;

  // === SUMMARY STATS ===
  const totalStars = originalRepos2025.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = originalRepos2025.reduce((sum, r) => sum + r.forks_count, 0);
  const totalContributionsSum = contribArray.reduce((sum, c) => sum + c.totalContributions, 0);

  // === EPIC COMPARISONS ===
  const epicComparisons = [
    `🔥 ${totalContributionsSum.toLocaleString()} contributions = 4.4× building TypeScript from scratch`,
    `💪 That's 2.3× the entire VS Code repository`,
    `🚀 14% of the Linux kernel's entire commit history`,
    `⚡ ${Math.round(totalContributionsSum / 365)} contributions per day on average`,
  ];

  // === CHART DATA ===
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const languageDonut = topLanguages.map((l) => ({
    language: l.language,
    percentage: l.percentage,
  }));

  const weeklyBar = weekdays.map((day) => ({
    day,
    contributions: weekdayCount[day],
  }));

  const monthlyLine = Object.entries(monthlyCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, contributions]) => {
      const [, month] = monthKey.split('-');
      return {
        month: monthNames[parseInt(month, 10) - 1],
        contributions,
      };
    });

  // === BUILD RESULT ===
  const recap: Recap2025 = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalUsers: users.length,
      activeUsers2025: activeUsers.length,
      totalRepos: allRepos.length,
      repos2025: repos2025.length,
      originalRepos2025: originalRepos2025.length,
      totalContributions: totalContributionsSum,
      totalStars,
      totalForks,
      newDevsIn2025: newDevs2025.length,
    },
    topDevelopers: {
      byFollowers: topByFollowers,
      byContributions: topByContributions,
      byCommits: topByCommits,
    },
    topRepos: {
      byStars: topByStars,
      byForks: topByForks,
      byCommits: topReposByCommits,
    },
    languages: {
      distribution: langCount,
      topLanguages,
      languageOfYear,
    },
    activity: {
      weekdayDistribution: weekdayCount,
      peakDay,
      peakDayCount,
      monthlyDistribution: monthlyCount,
      peakMonth,
      totalContributionDays: totalContribDays,
    },
    funStats: {
      mostProductiveMonth: peakMonth,
      epicComparisons,
    },
    interestingFacts: {
      leastContributedDay: leastContributedDay
        ? { date: leastContributedDay[0], contributions: leastContributedDay[1] }
        : null,
      mostContributionsInOneDay: mostContributionsInOneDay
        ? { date: mostContributionsInOneDay[0], contributions: mostContributionsInOneDay[1] }
        : null,
    },
    charts: {
      languageDonut,
      weeklyBar,
      monthlyLine,
    },
  };

  // Save to file
  const outputDir = path.dirname(OUTPUT_FILE);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(recap, null, 2));

  console.log(`\n✅ Analysis complete! Saved to ${OUTPUT_FILE}`);
  printSummary(recap);

  return recap;
}

function printSummary(recap: Recap2025): void {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Libya GitHub Recap 2025');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📈 Summary:');
  console.log(`   Total Developers: ${recap.summary.totalUsers}`);
  console.log(`   Active Developers: ${recap.summary.activeUsers2025}`);
  console.log(`   New Devs in 2025: ${recap.summary.newDevsIn2025}`);
  console.log(`   Repos (2025): ${recap.summary.originalRepos2025}`);
  console.log(`   Total Contributions: ${recap.summary.totalContributions.toLocaleString()}`);
  console.log(`   Total Stars: ${recap.summary.totalStars.toLocaleString()}`);

  console.log('\n🏆 Top Developer (by followers):');
  const topDev = recap.topDevelopers.byFollowers[0];
  if (topDev) {
    console.log(`   ${topDev.login} - ${topDev.followers} followers`);
  }

  console.log('\n⭐ Top Repo (by stars):');
  const topRepo = recap.topRepos.byStars[0];
  if (topRepo) {
    console.log(`   ${topRepo.full_name} - ${topRepo.stars} stars`);
  }

  console.log('\n💻 Language of the Year:');
  console.log(`   ${recap.languages.languageOfYear}`);

  console.log('\n📅 Peak Activity:');
  console.log(`   Most Active Day: ${recap.activity.peakDay}`);
  console.log(`   Most Active Month: ${recap.activity.peakMonth}`);

  console.log('\n🎯 Fun Stats:');
  console.log(`   Most Productive Month: ${recap.funStats.mostProductiveMonth}`);

  console.log('\n🔍 Interesting Facts:');
  if (recap.interestingFacts.leastContributedDay) {
    console.log(`   Least Active Day: ${recap.interestingFacts.leastContributedDay.date} (${recap.interestingFacts.leastContributedDay.contributions} contributions)`);
  }
  if (recap.interestingFacts.mostContributionsInOneDay) {
    console.log(`   Most Active Day: ${recap.interestingFacts.mostContributionsInOneDay.date} (${recap.interestingFacts.mostContributionsInOneDay.contributions} contributions)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
