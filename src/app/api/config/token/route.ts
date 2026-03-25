import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Stores the user's OAuth access token in KV so that public pages
// (which are SSR/ISR and not behind auth) can read content from GitHub.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kv } = await import("@vercel/kv");
  await kv.set(`token:${session.user.githubUsername}`, session.accessToken);
  return NextResponse.json({ ok: true });
}
