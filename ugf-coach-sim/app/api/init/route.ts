import { NextResponse } from "next/server";
import { makeInitialTeams, makeUSNNItem } from "@/lib/ugf";
import { writeState, resetState } from "@/lib/persist";
import { AppState } from "@/lib/types";
import { seedLeagueRosters } from "@/lib/seedPlayers";
import { seedInstallLibrary } from "@/lib/seedInstalls";

export async function POST() {
  resetState();

  const state: AppState = {
    meta: {
      saveVersion: 1,
      seasonYear: 1,
      week: 1,
      phase: "REG",
      userTeamId: "ac-hou", // default: Houston Launch
      difficulty: "STANDARD",
      legendFrequency: "RARE",
      seed: "UGF-SEED-001",
    },
    teams: makeInitialTeams(),
    players: {},
    agents: {},
    installs: {},
    weekPlan: {
      week: 1,
      opponentTeamId: "ac-dal",
      mediaTone: "NEUTRAL",
      dayNotes: { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] },
      installs: { items: ["ins-concept-outsidezone", "ins-concept-flood"], intensity: "MED" },
      practiceEmphasis: "INSTALL",
      delegation: { offense: "SHARED", defense: "SHARED", st: "ST" },
      snapCountPlan: {},
    },
    narratives: {},
    film: [],
    usnn: [],
  };

  seedInstallLibrary(state);
  seedLeagueRosters(state);

  state.usnn.unshift(makeUSNNItem("UGF Week 1: Opening weekend arrives", "NEUTRAL", "LEAGUE"));

  writeState(state);
  return NextResponse.json({ ok: true, userTeamId: state.meta.userTeamId });
}
