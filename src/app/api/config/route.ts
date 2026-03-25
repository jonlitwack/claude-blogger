import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConfig, setConfig, BlogConfig, defaultConfig } from "@/lib/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getConfig(session.user.githubUsername);
  return NextResponse.json(config || defaultConfig);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const config: BlogConfig = {
    ...defaultConfig,
    ...body,
  };

  if (!config.owner || !config.repo) {
    return NextResponse.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  await setConfig(session.user.githubUsername, config);
  return NextResponse.json({ ok: true });
}
