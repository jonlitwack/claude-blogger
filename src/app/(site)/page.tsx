import Link from "next/link";
import { getFirstSiteConfig } from "@/lib/config";
import { listEssaysWithMeta } from "@/lib/github";

export const revalidate = 60;

export default async function Home() {
  const site = await getFirstSiteConfig();

  if (!site?.config) {
    return (
      <div className="container">
        <section className="intro">
          <p className="tagline">
            Welcome to Claude Blogger. Visit <a href="/setup">/setup</a> to get started.
          </p>
        </section>
      </div>
    );
  }

  const { config, token } = site;

  let essays: { slug: string; title: string; date: string }[] = [];
  if (token) {
    try {
      essays = await listEssaysWithMeta(
        token,
        config.owner,
        config.repo,
        config.contentPath
      );
    } catch {
      // If we can't fetch, show empty
    }
  }

  return (
    <div className="container">
      <section className="intro">
        <p className="tagline">{config.siteDescription}</p>
      </section>
      <ul className="essay-list">
        {essays.map((essay) => (
          <li key={essay.slug}>
            <Link href={`/essays/${essay.slug}`}>
              <span className="essay-title">{essay.title}</span>
              <span className="essay-date">
                {new Date(essay.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  timeZone: "UTC",
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
