import axios from "axios";
import { config } from "dotenv";

config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubUserRepos {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

export function getGitHubAuthURL(): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
redirect_uri: `${process.env.BACKEND_URL}/api/auth/oauth/github/callback`,
    scope: "user:email,read:user",
    state: crypto.randomUUID(), // You might want to store this for validation
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to exchange code for token");
  }
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch GitHub user");
  }
}

export async function getGitHubUserRepos(
  accessToken: string,
  username: string,
): Promise<GitHubUserRepos[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          sort: "updated",
          per_page: 10,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch GitHub repositories");
  }
}
