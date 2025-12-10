/**
 * Sync State Manager - Handles resumable data fetching
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  GitHubUser,
  GitHubRepo,
  UserContributions,
  SyncStateData,
  SyncStats,
} from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'sync_state.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPOS_FILE = path.join(DATA_DIR, 'repos.json');
const CONTRIBUTIONS_FILE = path.join(DATA_DIR, 'contributions.json');

const DEFAULT_STATE: SyncStateData = {
  users: {
    lastSync: null,
    currentPage: 1,
    totalFetched: 0,
    totalCount: null,
    complete: false,
  },
  repos: {
    lastSync: null,
    usersProcessed: [],
    currentUserIndex: 0,
    totalFetched: 0,
    complete: false,
  },
  contributions: {
    lastSync: null,
    usersProcessed: [],
    currentUserIndex: 0,
    complete: false,
  },
};

export class SyncState {
  state: SyncStateData = { ...DEFAULT_STATE };
  users: Record<number, GitHubUser> = {};
  repos: Record<number, GitHubRepo> = {};
  contributions: Record<string, UserContributions> = {};

  async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  async load(): Promise<this> {
    await this.ensureDataDir();

    // Load state
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      this.state = { ...DEFAULT_STATE, ...JSON.parse(stateData) };
    } catch {
      this.state = { ...DEFAULT_STATE };
    }

    // Load users
    try {
      const usersData = await fs.readFile(USERS_FILE, 'utf-8');
      this.users = JSON.parse(usersData);
    } catch {
      this.users = {};
    }

    // Load repos
    try {
      const reposData = await fs.readFile(REPOS_FILE, 'utf-8');
      this.repos = JSON.parse(reposData);
    } catch {
      this.repos = {};
    }

    // Load contributions
    try {
      const contribData = await fs.readFile(CONTRIBUTIONS_FILE, 'utf-8');
      this.contributions = JSON.parse(contribData);
    } catch {
      this.contributions = {};
    }

    return this;
  }

  async save(): Promise<void> {
    await this.ensureDataDir();
    await Promise.all([
      fs.writeFile(STATE_FILE, JSON.stringify(this.state, null, 2)),
      fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2)),
      fs.writeFile(REPOS_FILE, JSON.stringify(this.repos, null, 2)),
      fs.writeFile(
        CONTRIBUTIONS_FILE,
        JSON.stringify(this.contributions, null, 2)
      ),
    ]);
  }

  async saveState(): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  async saveUsers(): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
  }

  async saveRepos(): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(REPOS_FILE, JSON.stringify(this.repos, null, 2));
  }

  async saveContributions(): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(
      CONTRIBUTIONS_FILE,
      JSON.stringify(this.contributions, null, 2)
    );
  }

  // User methods
  addUser(user: GitHubUser): void {
    const existing = this.users[user.id];
    this.users[user.id] = {
      ...existing,
      ...user,
      _lastUpdated: new Date().toISOString(),
    };
  }

  getUser(userId: number): GitHubUser | undefined {
    return this.users[userId];
  }

  getAllUsers(): GitHubUser[] {
    return Object.values(this.users);
  }

  getUserByUsername(username: string): GitHubUser | undefined {
    return Object.values(this.users).find((u) => u.login === username);
  }

  // Repo methods
  addRepo(repo: GitHubRepo): void {
    const existing = this.repos[repo.id];
    this.repos[repo.id] = {
      ...existing,
      ...repo,
      _lastUpdated: new Date().toISOString(),
    };
  }

  getReposByUser(username: string): GitHubRepo[] {
    return Object.values(this.repos).filter((r) => r.owner?.login === username);
  }

  getAllRepos(): GitHubRepo[] {
    return Object.values(this.repos);
  }

  // Get only original repos (not forks) - for accurate metrics
  getOriginalRepos(): GitHubRepo[] {
    return Object.values(this.repos).filter((r) => !r.fork);
  }

  // Get only forked repos
  getForkedRepos(): GitHubRepo[] {
    return Object.values(this.repos).filter((r) => r.fork);
  }

  // Contribution methods
  addContribution(username: string, data: UserContributions): void {
    this.contributions[username] = {
      ...data,
      _lastUpdated: new Date().toISOString(),
    };
  }

  getContribution(username: string): UserContributions | undefined {
    return this.contributions[username];
  }

  getAllContributions(): Record<string, UserContributions> {
    return this.contributions;
  }

  // State management
  getUserSyncState(): SyncStateData['users'] {
    return this.state.users;
  }

  updateUserSyncState(updates: Partial<SyncStateData['users']>): void {
    this.state.users = { ...this.state.users, ...updates };
  }

  getRepoSyncState(): SyncStateData['repos'] {
    return this.state.repos;
  }

  updateRepoSyncState(updates: Partial<SyncStateData['repos']>): void {
    this.state.repos = { ...this.state.repos, ...updates };
  }

  getContributionSyncState(): SyncStateData['contributions'] {
    return this.state.contributions;
  }

  updateContributionSyncState(
    updates: Partial<SyncStateData['contributions']>
  ): void {
    this.state.contributions = { ...this.state.contributions, ...updates };
  }

  // Reset
  async reset(target = 'all'): Promise<void> {
    if (target === 'all' || target === 'users') {
      this.state.users = { ...DEFAULT_STATE.users };
      this.users = {};
    }
    if (target === 'all' || target === 'repos') {
      this.state.repos = { ...DEFAULT_STATE.repos };
      this.repos = {};
    }
    if (target === 'all' || target === 'contributions') {
      this.state.contributions = { ...DEFAULT_STATE.contributions };
      this.contributions = {};
    }
    await this.save();
  }

  // Stats
  getStats(): SyncStats {
    return {
      users: {
        count: Object.keys(this.users).length,
        ...this.state.users,
      },
      repos: {
        count: Object.keys(this.repos).length,
        ...this.state.repos,
      },
      contributions: {
        count: Object.keys(this.contributions).length,
        ...this.state.contributions,
      },
    };
  }
}
