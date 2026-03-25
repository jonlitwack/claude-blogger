import Link from "next/link";
import { notFound } from "next/navigation";
import { getFirstSiteConfig } from "@/lib/config";
import { remark } from "remark";
import html from "remark-html";

export default async function AboutPage() {
  const site = await getFirstSiteConfig();

  if (!site?.config?.aboutBody) {
    notFound();
  }

  const processed = await remark().use(html).process(site.config.aboutBody);
  const contentLabel = site.config.contentLabel || "Essays";

  return (
    <div className="container">
      <article className="essay">
        <h1>About</h1>
        <hr />
        <div
          className="essay-body"
          dangerouslySetInnerHTML={{ __html: processed.toString() }}
        />
        <Link href="/" className="back-link">
          ← {contentLabel}
        </Link>
      </article>
    </div>
  );
}
