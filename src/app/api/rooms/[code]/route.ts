import type { NextRequest } from "next/server";
import { act, getView, joinRoom } from "@/lib/game";
import { errorResponse } from "@/lib/http";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/rooms/[code]">) {
  const { code } = await ctx.params;
  try {
    return Response.json(getView(code, request.headers.get("x-player-token")));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/rooms/[code]">) {
  const { code } = await ctx.params;
  try {
    const body = await request.json();
    if (body.type === "join") return Response.json(joinRoom(code, body.name, body.avatar));
    return Response.json(act(code, request.headers.get("x-player-token"), body));
  } catch (e) {
    return errorResponse(e);
  }
}
