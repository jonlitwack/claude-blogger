import { getFirstSiteConfig } from "@/lib/config";

export default async function Footer() {
  const site = await getFirstSiteConfig();

  const email = site?.config?.authorEmail;
  const links = site?.config?.authorLinks || [];
  const hasContent = email || links.length > 0;

  if (!hasContent) {
    return (
      <footer className="site-footer">
        <div className="container">
          <div className="footer-links">
            Powered by{" "}
            <a
              href="https://github.com/jonlitwack/claude-blogger"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude Blogger
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-links">
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {links.map((link, i) => (
            <span key={link.url}>
              {(email || i > 0) && <span className="footer-separator">·</span>}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
