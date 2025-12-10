/**
 * Type definitions for GitHub Recap
 */

export interface RateLimit {
  remaining: number;
  reset: Date | null;
  limit: number;
}

export interface RateLimitResponse {
  core: { remaining: number; limit: number; reset: number };
  search: { remaining: number; limit: number; reset: number };
  graphql: { remaining: number; limit: number; reset: number };
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  _lastUpdated?: string;
}

export interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: string;
  default_branch: string;
  languages_breakdown?: Record<string, number>;
  commit_count?: number | null;
  owner_login?: string;
  owner_id?: number;
  _lastUpdated?: string;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface UserContributions {
  userId: number;
  username: string;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  totalContributions: number;
  reposContributedTo: number;
  calendar: ContributionWeek[];
  _lastUpdated?: string;
}

export interface SyncStateData {
  users: {
    lastSync: string | null;
    currentPage: number;
    totalFetched: number;
    totalCount: number | null;
    complete: boolean;
  };
  repos: {
    lastSync: string | null;
    usersProcessed: string[];
    currentUserIndex: number;
    totalFetched: number;
    complete: boolean;
  };
  contributions: {
    lastSync: string | null;
    usersProcessed: string[];
    currentUserIndex: number;
    complete: boolean;
  };
}

export interface SyncOptions {
  force?: boolean;
  limit?: number;
}

export interface SyncStats {
  users: {
    count: number;
    lastSync: string | null;
    currentPage: number;
    totalFetched: number;
    totalCount: number | null;
    complete: boolean;
  };
  repos: {
    count: number;
    lastSync: string | null;
    usersProcessed: string[];
    currentUserIndex: number;
    totalFetched: number;
    complete: boolean;
  };
  contributions: {
    count: number;
    lastSync: string | null;
    usersProcessed: string[];
    currentUserIndex: number;
    complete: boolean;
  };
}
