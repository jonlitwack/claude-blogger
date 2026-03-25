import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { listEssays, saveEssay } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getConfig(session.user.githubUsername);
  if (!config) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const essays = await listEssays(
    session.accessToken,
    config.owner,
    config.repo,
    config.contentPath
  );
  return NextResponse.json(essays);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getConfig(session.user.githubUsername);
  if (!config) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const { slug, title, date, body, sha, image } = await req.json();

  if (!slug || !title || !body) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const essayDate = date || new Date().toISOString();

  await saveEssay(
    session.accessToken,
    config.owner,
    config.repo,
    config.contentPath,
    slug,
    title,
    essayDate,
    body,
    sha,
    image
  );

  return NextResponse.json({ ok: true });
}
