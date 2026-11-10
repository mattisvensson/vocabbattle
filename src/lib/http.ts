import { GameError } from "./game";

export function errorResponse(e: unknown) {
  if (e instanceof GameError) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "unknown" }, { status: 500 });
}
