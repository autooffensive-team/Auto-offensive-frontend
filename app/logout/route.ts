import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await auth.api
    .signOut({
      headers: request.headers,
    })
    .catch(() => null);

  return NextResponse.redirect(new URL("/", request.url));
}
