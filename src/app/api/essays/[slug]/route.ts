import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { getEssay, deleteEssay } from "@/lib/github";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getConfig(session.user.githubUsername);
  if (!config) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const { slug } = await params;

  try {
    const essay = await getEssay(
      session.accessToken,
      config.owner,
      config.repo,
      config.contentPath,
      slug
    );
    return NextResponse.json(essay);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getConfig(session.user.githubUsername);
  if (!config) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const { slug } = await params;

  try {
    const essay = await getEssay(
      session.accessToken,
      config.owner,
      config.repo,
      config.contentPath,
      slug
    );
    if (!essay.sha) {
      return NextResponse.json({ error: "Missing SHA" }, { status: 400 });
    }
    await deleteEssay(
      session.accessToken,
      config.owner,
      config.repo,
      config.contentPath,
      slug,
      essay.sha
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
