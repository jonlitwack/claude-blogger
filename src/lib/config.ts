export interface BlogConfig {
  owner: string;
  repo: string;
  branch: string;
  contentPath: string;
  imagePath: string;
  siteName: string;
  siteDescription: string;
  authorName: string;
  authorEmail: string;
  authorLinks: { label: string; url: string }[];
  contentLabel: string;
  aboutBody: string;
}

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

function configKey(githubUsername: string): string {
  return `config:${githubUsername}`;
}

export async function getConfig(
  githubUsername: string
): Promise<BlogConfig | null> {
  if (!isKvConfigured()) return null;
  const kv = await getKv();
  return kv.get<BlogConfig>(configKey(githubUsername));
}

export async function setConfig(
  githubUsername: string,
  config: BlogConfig
): Promise<void> {
  if (!isKvConfigured()) {
    throw new Error("Vercel KV is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.");
  }
  const kv = await getKv();
  await kv.set(configKey(githubUsername), config);
}

export async function hasConfig(githubUsername: string): Promise<boolean> {
  if (!isKvConfigured()) return false;
  const kv = await getKv();
  return (await kv.exists(configKey(githubUsername))) === 1;
}

export async function getFirstSiteConfig(): Promise<{
  username: string;
  config: BlogConfig;
  token: string | null;
} | null> {
  if (!isKvConfigured()) return null;
  const kv = await getKv();
  const keys = await kv.keys("config:*");
  if (keys.length === 0) return null;
  const username = keys[0].replace("config:", "");
  const config = await kv.get<BlogConfig>(`config:${username}`);
  const token = await kv.get<string>(`token:${username}`);
  if (!config) return null;
  return { username, config, token };
}

export const defaultConfig: BlogConfig = {
  owner: "",
  repo: "",
  branch: "main",
  contentPath: "content/essays",
  imagePath: "public/images",
  siteName: "My Blog",
  siteDescription: "A personal blog powered by Claude Blogger",
  authorName: "",
  authorEmail: "",
  authorLinks: [],
  contentLabel: "Essays",
  aboutBody: "",
};
