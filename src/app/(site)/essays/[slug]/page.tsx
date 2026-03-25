import Link from "next/link";
import { getFirstSiteConfig } from "@/lib/config";
import { listEssays, getEssayWithHtml } from "@/lib/github";

export const revalidate = 60;

export async function generateStaticParams() {
  const site = await getFirstSiteConfig();
  if (!site?.token) return [];
  const essays = await listEssays(
    site.token,
    site.config.owner,
    site.config.repo,
    site.config.contentPath
  );
  return essays.map((essay) => ({ slug: essay.slug }));
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getFirstSiteConfig();

  if (!site?.token) {
    return (
      <div className="container">
        <p>Site not configured. Visit <a href="/setup">/setup</a> to get started.</p>
      </div>
    );
  }

  const essay = await getEssayWithHtml(
    site.token,
    site.config.owner,
    site.config.repo,
    site.config.contentPath,
    slug
  );

  const contentLabel = site.config.contentLabel || "Essays";

  return (
    <article className="container essay">
      {essay.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={essay.image}
          alt={essay.title}
          className="essay-hero"
        />
      )}
      <h1>{essay.title}</h1>
      <time className="essay-meta">
        {new Date(essay.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          timeZone: "UTC",
        })}
      </time>
      <hr />
      <div
        className="essay-body"
        dangerouslySetInnerHTML={{ __html: essay.contentHtml }}
      />
      <Link href="/" className="back-link">
        ← All {contentLabel.toLowerCase()}
      </Link>
    </article>
  );
}
