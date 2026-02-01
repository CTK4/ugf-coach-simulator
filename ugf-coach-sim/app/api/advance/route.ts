import { NextResponse } from "next/server";
import { readState, writeState } from "@/lib/persist";
import { advanceDay } from "@/lib/sim";
import { WeekDay } from "@/lib/types";

export async function POST(req: Request) {
  const { day } = await req.json() as { day: WeekDay };
  const state = readState();
  advanceDay(state, day);
  writeState(state);
  return NextResponse.json({ ok: true });
}
