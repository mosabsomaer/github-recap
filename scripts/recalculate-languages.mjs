/**
 * Recalculate language statistics from repos.json languages_breakdown
 * Aggregates byte counts across all repos and calculates percentages
 */

import fs from 'fs/promises';
import path from 'path';

const REPOS_FILE = path.join(process.cwd(), 'data', 'repos.json');
const RECAP_FILE = path.join(process.cwd(), 'data', 'analysis', 'recap2025.json');

async function main() {
  console.log('Reading repos.json...');
  const reposData = JSON.parse(await fs.readFile(REPOS_FILE, 'utf-8'));

  // Sum up all language bytes across all repos
  const languageBytes = {};

  for (const repoId of Object.keys(reposData)) {
    const repo = reposData[repoId];
    const breakdown = repo.languages_breakdown;

    if (breakdown && typeof breakdown === 'object') {
      for (const [lang, bytes] of Object.entries(breakdown)) {
        languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
      }
    }
  }

  // Calculate total bytes
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  console.log(`Total bytes across all languages: ${totalBytes.toLocaleString()}`);

  // Sort languages by bytes descending
  const sortedLanguages = Object.entries(languageBytes)
    .sort(([, a], [, b]) => b - a);

  // Create distribution (raw byte counts)
  const distribution = Object.fromEntries(sortedLanguages);

  // Create topLanguages (top 10 with percentages rounded to integers)
  const topLanguages = sortedLanguages
    .slice(0, 10)
    .map(([language, bytes]) => ({
      language,
      count: bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
    }));

  // Determine language of the year
  const languageOfYear = topLanguages[0]?.language || 'Unknown';

  // Create languageDonut (top 10 + "Other")
  const top10Bytes = sortedLanguages.slice(0, 10).reduce((sum, [, b]) => sum + b, 0);
  const otherBytes = totalBytes - top10Bytes;

  const languageDonut = topLanguages.map(({ language, percentage }) => ({
    language,
    percentage,
  }));

  if (otherBytes > 0) {
    languageDonut.push({
      language: 'Other',
      percentage: Math.round((otherBytes / totalBytes) * 100),
    });
  }

  // Read existing recap and update
  console.log('Reading recap2025.json...');
  const recap = JSON.parse(await fs.readFile(RECAP_FILE, 'utf-8'));

  // Update languages section
  recap.languages = {
    distribution,
    topLanguages,
    languageOfYear,
  };

  // Update charts.languageDonut
  recap.charts.languageDonut = languageDonut;

  // Update generatedAt
  recap.generatedAt = new Date().toISOString();

  // Write back
  await fs.writeFile(RECAP_FILE, JSON.stringify(recap, null, 2));
  console.log('\nUpdated recap2025.json successfully!');

  // Print summary
  console.log('\n=== Language Statistics ===');
  console.log(`Language of the Year: ${languageOfYear}`);
  console.log('\nTop 10 Languages:');
  for (const { language, count, percentage } of topLanguages) {
    console.log(`  ${language}: ${count.toLocaleString()} bytes (${percentage}%)`);
  }
}

main().catch(console.error);
