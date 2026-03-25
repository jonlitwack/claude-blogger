import Link from "next/link";
import { getFirstSiteConfig } from "@/lib/config";

export default async function Header() {
  const site = await getFirstSiteConfig();
  const siteName = site?.config?.siteName || "Claude Blogger";
  const contentLabel = site?.config?.contentLabel || "Writing";
  const showAbout = !!site?.config?.aboutBody;

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="wordmark">
          {siteName}
        </Link>
        <nav className="header-nav">
          <Link href="/">{contentLabel}</Link>
          {showAbout && <Link href="/about">About</Link>}
        </nav>
      </div>
    </header>
  );
}
