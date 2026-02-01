import { NextResponse } from "next/server";
import { readState, writeState } from "@/lib/persist";

export async function GET() {
  const state = readState();
  return NextResponse.json(state);
}

export async function POST(req: Request) {
  const patch = await req.json();
  const state = readState();
  // shallow merge for small updates; complex mutations use dedicated endpoints.
  const next = { ...state, ...patch };
  writeState(next as any);
  return NextResponse.json({ ok: true });
}
