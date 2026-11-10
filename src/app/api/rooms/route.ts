import { createRoom } from "@/lib/game";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json(createRoom(body.name, body.avatar));
  } catch (e) {
    return errorResponse(e);
  }
}
