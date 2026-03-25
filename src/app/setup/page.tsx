"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Repo {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  description: string | null;
  updated_at: string | null;
}

type Step = "auth" | "repo" | "config" | "done";

export default function SetupPage() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>("auth");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Config form state
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [contentPath, setContentPath] = useState("content/essays");
  const [imagePath, setImagePath] = useState("public/images");
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [contentLabel, setContentLabel] = useState("Essays");
  const [aboutBody, setAboutBody] = useState("");

  // Auto-advance to repo step when authenticated
  useEffect(() => {
    if (status === "authenticated" && step === "auth") {
      setStep("repo");
      // Pre-fill author name from GitHub
      if (session?.user?.name) {
        setAuthorName(session.user.name);
      }
    }
  }, [status, step, session]);

  // Fetch repos when on repo step
  useEffect(() => {
    if (step === "repo" && status === "authenticated") {
      fetch("/api/repos")
        .then((r) => r.json())
        .then(setRepos)
        .catch(() => setError("Failed to load repositories"));
    }
  }, [step, status]);

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  function selectRepo(repo: Repo) {
    setSelectedRepo(repo);
    setSiteName(repo.name);
    setSiteDescription(repo.description || "A personal blog powered by Claude Blogger");
    setStep("config");
  }

  async function saveConfig() {
    if (!selectedRepo) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.full_name.split("/")[0],
          repo: selectedRepo.name,
          branch: selectedRepo.default_branch,
          contentPath,
          imagePath,
          siteName,
          siteDescription,
          authorName,
          authorEmail,
          authorLinks: [],
          contentLabel,
          aboutBody,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save configuration");
        setSaving(false);
        return;
      }

      // Store the access token for public page rendering
      await fetch("/api/config/token", {
        method: "POST",
      });

      // Set setup_complete cookie
      document.cookie = "setup_complete=1; path=/; max-age=31536000; SameSite=Lax";

      setStep("done");
    } catch {
      setError("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  // Styles
  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--night)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem 1.5rem",
  };

  const card: React.CSSProperties = {
    maxWidth: 520,
    width: "100%",
  };

  const heading: React.CSSProperties = {
    fontFamily: "var(--font-serif)",
    fontWeight: 300,
    fontSize: "1.5rem",
    color: "var(--ice)",
    marginBottom: "0.5rem",
  };

  const subtitle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontWeight: 300,
    fontSize: "0.85rem",
    color: "var(--muted)",
    marginBottom: "2rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--rule)",
    border: "1px solid var(--rule)",
    borderRadius: 6,
    color: "var(--ice)",
    fontFamily: "var(--font-mono)",
    fontWeight: 300,
    fontSize: "0.85rem",
    padding: "0.6rem 0.85rem",
    outline: "none",
    marginBottom: "1rem",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontWeight: 400,
    fontSize: "0.75rem",
    color: "var(--muted)",
    display: "block",
    marginBottom: "0.35rem",
  };

  const btnPrimary: React.CSSProperties = {
    background: "none",
    border: "1px solid var(--cyan)",
    color: "var(--cyan)",
    fontFamily: "var(--font-mono)",
    fontWeight: 400,
    fontSize: "0.85rem",
    padding: "0.6rem 1.5rem",
    borderRadius: 4,
    cursor: "pointer",
  };

  const repoItem: React.CSSProperties = {
    padding: "0.75rem 0",
    borderTop: "1px solid var(--rule)",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.8rem",
    color: "#e55",
    marginBottom: "1rem",
  };

  // Step: Auth
  if (step === "auth" || status === "loading") {
    return (
      <div style={shell}>
        <div style={card}>
          <h1 style={heading}>Welcome to Claude Blogger</h1>
          <p style={subtitle}>
            Sign in with GitHub to get started. This connects your account
            so you can publish to your repositories.
          </p>
          <button style={btnPrimary} onClick={() => signIn("github")}>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  // Step: Select repo
  if (step === "repo") {
    return (
      <div style={shell}>
        <div style={card}>
          <h1 style={heading}>Select a repository</h1>
          <p style={subtitle}>
            Choose the repo where your blog content will live.
            Your Markdown files will be committed here.
          </p>
          <input
            style={inputStyle}
            placeholder="Search repositories..."
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <div>
            {filteredRepos.map((repo) => (
              <div
                key={repo.full_name}
                style={repoItem}
                onClick={() => selectRepo(repo)}
                onMouseEnter={(e) => {
                  const el = e.currentTarget.querySelector(".repo-name") as HTMLElement | null;
                  if (el) el.style.color = "var(--cyan)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget.querySelector(".repo-name") as HTMLElement | null;
                  if (el) el.style.color = "var(--ice)";
                }}
              >
                <div
                  className="repo-name"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1rem",
                    color: "var(--ice)",
                    transition: "color 0.15s",
                  }}
                >
                  {repo.name}
                  {repo.private && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                      private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {repo.description}
                  </div>
                )}
              </div>
            ))}
            {repos.length === 0 && !error && (
              <p style={{ ...subtitle, marginBottom: 0 }}>Loading repositories...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step: Configure
  if (step === "config") {
    return (
      <div style={shell}>
        <div style={card}>
          <h1 style={heading}>Configure your blog</h1>
          <p style={subtitle}>
            Customize your site. You can change these settings later.
          </p>

          {error && <p style={errorStyle}>{error}</p>}

          <label style={labelStyle}>Site name</label>
          <input
            style={inputStyle}
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="My Blog"
          />

          <label style={labelStyle}>Site description</label>
          <input
            style={inputStyle}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="A personal blog about..."
          />

          <label style={labelStyle}>Content label</label>
          <input
            style={inputStyle}
            value={contentLabel}
            onChange={(e) => setContentLabel(e.target.value)}
            placeholder="Essays, Posts, Articles..."
          />

          <label style={labelStyle}>Content path in repo</label>
          <input
            style={inputStyle}
            value={contentPath}
            onChange={(e) => setContentPath(e.target.value)}
            placeholder="content/essays"
          />

          <label style={labelStyle}>Image path in repo</label>
          <input
            style={inputStyle}
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
            placeholder="public/images"
          />

          <label style={labelStyle}>Author name</label>
          <input
            style={inputStyle}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
          />

          <label style={labelStyle}>Author email (optional)</label>
          <input
            style={inputStyle}
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label style={labelStyle}>About page (Markdown, optional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "var(--font-mono)" }}
            value={aboutBody}
            onChange={(e) => setAboutBody(e.target.value)}
            placeholder="Write a short bio in Markdown..."
          />

          <div style={{ marginTop: "1rem" }}>
            <button
              style={{
                ...btnPrimary,
                opacity: saving ? 0.5 : 1,
                cursor: saving ? "default" : "pointer",
              }}
              onClick={saveConfig}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Start Writing"}
            </button>
            <button
              style={{
                ...btnPrimary,
                borderColor: "var(--rule)",
                color: "var(--muted)",
                marginLeft: "0.75rem",
              }}
              onClick={() => setStep("repo")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step: Done
  return (
    <div style={shell}>
      <div style={card}>
        <h1 style={heading}>You&apos;re all set!</h1>
        <p style={subtitle}>
          Your blog is configured and ready to go.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/write" style={btnPrimary}>
            Start Writing
          </Link>
          <Link
            href="/"
            style={{
              ...btnPrimary,
              borderColor: "var(--rule)",
              color: "var(--muted)",
            }}
          >
            View Site
          </Link>
        </div>
      </div>
    </div>
  );
}
