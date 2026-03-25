import { Octokit } from "@octokit/rest";
import { remark } from "remark";
import html from "remark-html";

export function createOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export interface EssayFile {
  slug: string;
  title: string;
  date: string;
  image?: string;
  content: string;
  sha?: string;
}

export async function listUserRepos(accessToken: string) {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    affiliation: "owner",
  });
  return data.map((r) => ({
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    default_branch: r.default_branch,
    description: r.description,
    updated_at: r.updated_at,
  }));
}

export async function listEssays(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string
): Promise<{ slug: string; name: string }[]> {
  const octokit = createOctokit(accessToken);
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: contentPath,
    });

    if (!Array.isArray(data)) return [];

    return data
      .filter((f) => f.name.endsWith(".md"))
      .map((f) => ({
        slug: f.name.replace(/\.md$/, ""),
        name: f.name,
      }));
  } catch {
    return [];
  }
}

export async function getEssay(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string,
  slug: string
): Promise<EssayFile> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: `${contentPath}/${slug}.md`,
  });

  if (Array.isArray(data) || data.type !== "file") {
    throw new Error("Not a file");
  }

  const content = Buffer.from(data.content, "base64").toString("utf8");

  let title = slug;
  let date = "";
  let image: string | undefined;
  let body = content;

  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    body = fmMatch[2];
    const titleMatch = frontmatter.match(
      /title:\s*["']?(.+?)["']?\s*$/m
    );
    if (titleMatch) title = titleMatch[1];
    const dateMatch = frontmatter.match(/date:\s*(.+)$/m);
    if (dateMatch) date = dateMatch[1].trim();
    const imageMatch = frontmatter.match(/image:\s*["']?(.+?)["']?\s*$/m);
    if (imageMatch) image = imageMatch[1];
  }

  return { slug, title, date, image, content: body, sha: data.sha };
}

export async function getEssayWithHtml(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string,
  slug: string
): Promise<{
  title: string;
  date: string;
  image?: string;
  contentHtml: string;
}> {
  const essay = await getEssay(accessToken, owner, repo, contentPath, slug);
  const processed = await remark().use(html).process(essay.content);
  return {
    title: essay.title,
    date: essay.date,
    image: essay.image,
    contentHtml: processed.toString(),
  };
}

export async function listEssaysWithMeta(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string
): Promise<{ slug: string; title: string; date: string }[]> {
  const files = await listEssays(accessToken, owner, repo, contentPath);
  const essays = await Promise.all(
    files.map(async (f) => {
      const essay = await getEssay(accessToken, owner, repo, contentPath, f.slug);
      return { slug: f.slug, title: essay.title, date: essay.date };
    })
  );
  return essays.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function deleteEssay(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string,
  slug: string,
  sha: string
): Promise<void> {
  const octokit = createOctokit(accessToken);
  await octokit.repos.deleteFile({
    owner,
    repo,
    path: `${contentPath}/${slug}.md`,
    message: `Delete essay: ${slug}`,
    sha,
  });
}

export async function saveEssay(
  accessToken: string,
  owner: string,
  repo: string,
  contentPath: string,
  slug: string,
  title: string,
  date: string,
  body: string,
  sha?: string,
  image?: string
): Promise<void> {
  const octokit = createOctokit(accessToken);
  let frontmatter = `---\ntitle: "${title}"\ndate: ${date}\n`;
  if (image) frontmatter += `image: "${image}"\n`;
  frontmatter += `---\n\n`;
  const content = frontmatter + body;
  const encoded = Buffer.from(content).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `${contentPath}/${slug}.md`,
    message: sha ? `Update essay: ${title}` : `New essay: ${title}`,
    content: encoded,
    ...(sha ? { sha } : {}),
  });
}

export async function uploadImage(
  accessToken: string,
  owner: string,
  repo: string,
  imagePath: string,
  file: File
): Promise<string> {
  const octokit = createOctokit(accessToken);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase();
  const filename = `${timestamp}-${safeName}.${ext}`;
  const path = `${imagePath}/${filename}`;

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `Upload image: ${filename}`,
    content: base64,
  });

  return `/images/${filename}`;
}
