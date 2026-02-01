import { NextResponse } from "next/server";
import { readState, writeState } from "@/lib/persist";
import { runSnap } from "@/lib/sim";

export async function POST(req: Request) {
  const { down, dist, yardLine, offenseCall, defenseCall } = await req.json();
  const state = readState();
  const out = runSnap(state, { down, dist, yardLine, offenseCall, defenseCall });
  writeState(state);
  return NextResponse.json(out);
}
