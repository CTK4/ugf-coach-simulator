import { nanoid } from "nanoid";
import { choice, clamp, mulberry32, hashSeed, randInt } from "./rng";
import { AppState, FilmPlay, InstallItem, MediaTone, Narrative, PlayerProfile, Team, WeekDay } from "./types";
import { makeUSNNItem, RELOCATION_OPTIONS } from "./ugf";

/**
 * Difficulty axis multipliers. Margin-for-error tightening.
 */
export function difficultyAxes(preset: AppState["meta"]["difficulty"]) {
  if (preset === "CASUAL") return { oppIQ: 0.85, staffFriction: 0.75, mediaVol: 0.75, ownerPatience: 1.2, psych: 0.8 };
  if (preset === "HARDCORE") return { oppIQ: 1.25, staffFriction: 1.25, mediaVol: 1.35, ownerPatience: 0.85, psych: 1.25 };
  return { oppIQ: 1.0, staffFriction: 1.0, mediaVol: 1.0, ownerPatience: 1.0, psych: 1.0 };
}

export function computeInstallCLU(items: InstallItem[], ids: string[]) {
  let clu = 0;
  for (const id of ids) {
    const it = items.find(x => x.id === id);
    if (it) clu += it.clu;
  }
  return clu;
}

export function playerLoadScore(p: PlayerProfile, physicalLoad: number, cognitiveLoad: number) {
  return physicalLoad + cognitiveLoad;
}

export function loadTolerance(p: PlayerProfile) {
  // Experience + awareness + personality detail/calm; position adjustment.
  const base = 45 + (p.yearsPro * 2);
  const mental = (p.ratings.awr * 0.25) + (p.personality.DETAIL * 0.15) + (p.personality.CALM * 0.10);
  const posAdj =
    p.pos === "QB" ? 10 :
    (p.pos === "CB" || p.pos === "FS" || p.pos === "SS") ? -4 :
    (p.pos === "RB") ? -2 : 0;
  return clamp(35, 95, base + mental/10 + posAdj);
}

export function injuryRiskFromLoad(pls: number, tol: number) {
  if (pls <= tol) return { soft: 0.02, major: 0.001 };
  if (pls <= tol * 1.1) return { soft: 0.05, major: 0.003 };
  if (pls <= tol * 1.25) return { soft: 0.10, major: 0.008 };
  return { soft: 0.16, major: 0.02 };
}

export function updateMediaToneFromNarratives(state: AppState, team: Team): MediaTone {
  // Aggregate narrative state affecting this team
  let score = 0;
  for (const n of Object.values(state.narratives)) {
    if (n.triggers.includes(team.id)) score += n.momentum + n.bias * 2;
  }
  score += (team.record.w - team.record.l) * 8;
  if (score >= 30) return "POSITIVE";
  if (score <= -30) return "HOSTILE";
  return "NEUTRAL";
}

export function applyOwnerPressure(state: AppState, team: Team) {
  const axes = difficultyAxes(state.meta.difficulty);
  const mediaTone = updateMediaToneFromNarratives(state, team);
  const recordDelta = (team.record.w - team.record.l);
  // patience declines faster under hostile narratives and poor spending optics
  const spendingStrain = team.cap.flex === "CRITICAL" ? 12 : team.cap.flex === "TIGHT" ? 6 : 0;
  const tonePenalty = mediaTone === "HOSTILE" ? 14 : mediaTone === "NEUTRAL" ? 4 : -6;

  team.ownerPatience = clamp(0, 100, team.ownerPatience + axes.ownerPatience * (recordDelta > 0 ? 1 : -3) - spendingStrain - tonePenalty);
  // mood responds weekly
  team.ownerMood = clamp(-100, 100, team.ownerMood + (recordDelta * 2) - tonePenalty/2 - spendingStrain/2);
  // spending tolerance tightens when mood/patience low
  const baseTol = 60 + (team.owner === "MEDIA_BARON" || team.owner === "MAVERICK" ? 10 : 0) + (team.owner === "PRIVATE_EQUITY" ? -10 : 0);
  team.spendingTolerance = clamp(15, 90, baseTol + team.ownerMood/5);
}

export function relocationThreatTick(state: AppState, team: Team) {
  // No rules layer; just media/owner pressure and market dynamics.
  const axes = difficultyAxes(state.meta.difficulty);

  // Market pressure rises if team is losing, cap is critical, and media is hostile.
  const mediaTone = updateMediaToneFromNarratives(state, team);
  const losing = team.record.l - team.record.w;
  const capStress = team.cap.flex === "CRITICAL" ? 18 : team.cap.flex === "TIGHT" ? 10 : 0;
  const toneStress = mediaTone === "HOSTILE" ? 18 : mediaTone === "NEUTRAL" ? 6 : 0;

  team.relocation.marketPressure = clamp(0, 100,
    team.relocation.marketPressure + (losing > 2 ? 6 : losing > 0 ? 3 : -2) + capStress/6 + toneStress/6
  );

  // Threat level responds to low patience and rising market pressure.
  const patienceStress = (40 - team.ownerPatience);
  const threatDelta = (patienceStress > 0 ? patienceStress/8 : -1.5) + (team.relocation.marketPressure/20) - (team.ownerMood/40);
  team.relocation.threatLevel = clamp(0, 100, team.relocation.threatLevel + threatDelta * axes.mediaVol);

  if (team.relocation.threatLevel > 70 && !team.relocation.candidate) {
    team.relocation.candidate = choice(mulberry32(hashSeed(state.meta.seed + team.id + state.meta.week)), [...RELOCATION_OPTIONS]);
    state.usnn.unshift(makeUSNNItem(
      `Relocation whispers grow around ${team.name}`,
      "HOSTILE",
      "LEAGUE",
      team.id,
      `Sources mention ${team.relocation.candidate} as a potential landing spot if ownership escalates.`
    ));
  }
}

export function buildNarrative(state: AppState, id: string, title: string, teamId: string, momentum: number, bias: number): Narrative {
  return {
    id, title,
    momentum: clamp(-100, 100, momentum),
    bias: clamp(-50, 50, bias),
    state: momentum >= 35 ? "POSITIVE" : momentum <= -35 ? "HOSTILE" : momentum <= -10 ? "NEGATIVE" : "NEUTRAL",
    triggers: [teamId],
    effects: {
      repMod: momentum >= 35 ? 0.15 : momentum <= -35 ? -0.15 : 0,
      trustDecayMod: momentum <= -35 ? 0.25 : momentum >= 35 ? -0.10 : 0,
      ownerPatienceMod: momentum <= -35 ? -8 : momentum >= 35 ? 4 : 0,
    }
  };
}

export function pushOrUpdateNarrative(state: AppState, teamId: string, key: string, title: string, delta: number) {
  const id = `${teamId}:${key}`;
  const prev = state.narratives[id];
  if (!prev) {
    state.narratives[id] = buildNarrative(state, id, title, teamId, delta, 0);
    return;
  }
  prev.momentum = clamp(-100, 100, prev.momentum + delta);
  prev.state = prev.momentum >= 35 ? "POSITIVE" : prev.momentum <= -35 ? "HOSTILE" : prev.momentum <= -10 ? "NEGATIVE" : "NEUTRAL";
}

/**
 * Anti-cheese trade rep updates. Called whenever user executes a trade.
 */
export function updateTradeReputation(team: Team, kind: "HOARD_PICKS"|"DUMP_CONTRACT"|"TRADE_DOWN"|"TRADE_VETS"|"FAIR") {
  const bump = (k: number) => team.tradeReputation.score = clamp(0, 100, team.tradeReputation.score + k);
  if (kind === "FAIR") bump(-6);
  if (kind === "HOARD_PICKS") bump(10);
  if (kind === "TRADE_DOWN") bump(8);
  if (kind === "DUMP_CONTRACT") bump(12);
  if (kind === "TRADE_VETS") bump(7);

  const s = team.tradeReputation.score;
  team.tradeReputation.profile =
    s >= 70 ? "ASSET_HOARDER" :
    s >= 55 ? "CONTRACT_DUMPER" :
    s >= 40 ? "AGGRESSIVE_BUILDER" :
    s >= 25 ? "SHORT_TERM_GAMBLER" :
    "BALANCED";
}

/**
 * Draft: legend rarity + RAS layer is stubbed here for future expansion.
 * (Data structures exist; generator lives in /lib/draft.ts later.)
 */

/**
 * Aging regression (season tick) - applies attribute budget into buckets.
 */
export function agingTick(p: PlayerProfile) {
  // Position decline start D0 and k_pos
  const D0: Record<string, number> = {
    RB:28, WR:30, CB:30, FS:31, SS:32,
    TE:32, LB:32, EDGE:33,
    OT:33, IOL:33, IDL:33,
    QB:35, K:37, P:37, FB:32
  };
  const kPos: Record<string, number> = {
    RB:5.8, WR:4.2, CB:4.6, FS:3.6, SS:3.3,
    TE:3.3, LB:3.8, EDGE:3.4,
    OT:2.6, IOL:2.4, IDL:2.8,
    QB:2.0, K:1.2, P:1.2, FB:3.0
  };

  const S = 6.0, exp = 1.85;
  // EffectiveAge = Age + 2 * wear
  const effectiveAge = p.age + 2.0 * p.wear;
  const d0 = D0[p.pos] ?? 32;
  const y = Math.max(0, effectiveAge - d0);
  const curve = Math.pow(y / S, exp);
  const baseDecline = (kPos[p.pos] ?? 3.0) * curve;

  // Aging profile from tags (if present)
  const tags = new Set(p.tags ?? []);
  let mult = 1.0;
  let d0Shift = 0;
  if (tags.has("AGING_EARLY")) mult *= 1.35;
  if (tags.has("AGING_LATE")) { mult *= 0.90; d0Shift = 1; }
  if (tags.has("AGING_DURABLE")) mult *= 0.80;
  if (tags.has("AGING_OUTLIER")) mult *= 0.70;

  const declineBudget = baseDecline * mult;

  // Bucket weights
  const bucket = (() => {
    if (p.pos === "RB") return { burst:0.55, dur:0.25, contact:0.20, mentalGain:0.2, mentalCapAge:31 };
    if (p.pos === "WR" || p.pos === "CB" || p.pos === "FS" || p.pos === "SS") return { burst:0.65, dur:0.20, contact:0.15, mentalGain:0.15, mentalCapAge:32 };
    if (p.pos === "LB" || p.pos === "EDGE" || p.pos === "TE" || p.pos === "FB") return { burst:0.40, dur:0.30, contact:0.30, mentalGain:0.15, mentalCapAge:34 };
    if (p.pos === "OT" || p.pos === "IOL" || p.pos === "IDL") return { burst:0.20, dur:0.35, contact:0.45, mentalGain:0.10, mentalCapAge:35 };
    if (p.pos === "QB") return { burst:0.25, dur:0.35, contact:0.15, arm:0.25, mentalGain:0.25, mentalCapAge:36 };
    if (p.pos === "K" || p.pos === "P") return { burst:0.10, dur:0.30, contact:0.0, tech:0.60, mentalGain:0.0, mentalCapAge:0 };
    return { burst:0.40, dur:0.30, contact:0.30, mentalGain:0.10, mentalCapAge:34 };
  })();

  // Apply declines
  const dec = (v: number, amt: number) => clamp(30, 99, v - amt);
  const inc = (v: number, amt: number) => clamp(30, 99, v + amt);

  const burstAmt = declineBudget * (bucket as any).burst;
  const durAmt = declineBudget * (bucket as any).dur;
  const contactAmt = declineBudget * (bucket as any).contact;

  // Burst: acc/agi first, speed later (half)
  p.ratings.acc = dec(p.ratings.acc, burstAmt * 0.50);
  p.ratings.agi = dec(p.ratings.agi, burstAmt * 0.35);
  p.ratings.spd = dec(p.ratings.spd, burstAmt * 0.15);

  // Durability
  p.ratings.inj = dec(p.ratings.inj, durAmt * 0.60);
  p.ratings.sta = dec(p.ratings.sta, durAmt * 0.40);

  // Contact/strength
  p.ratings.str = dec(p.ratings.str, contactAmt * 0.45);

  // Mental slight gain (cap)
  if (p.age <= (bucket as any).mentalCapAge && (bucket as any).mentalGain > 0) {
    p.ratings.awr = inc(p.ratings.awr, (bucket as any).mentalGain);
  }

  // Age phase (player-facing)
  // simple mapping based on position windows
  const phase = (() => {
    const age = p.age;
    if (p.yearsPro <= 1) return "GROWTH";
    const primeEnd =
      p.pos === "RB" ? 27 :
      (p.pos === "WR" || p.pos === "CB") ? 29 :
      (p.pos === "QB") ? 34 :
      (p.pos === "K" || p.pos === "P") ? 36 :
      31;
    const latePrimeEnd = primeEnd + 2;
    const declineStart = (D0[p.pos] ?? 32);
    if (age <= primeEnd) return "PRIME";
    if (age <= latePrimeEnd) return "LATE_PRIME";
    if (age < declineStart + 4) return "DECLINE";
    return "ENDGAME";
  })();
  p.agePhase = phase as any;

  // OVR recompute as a coarse aggregate to keep UI consistent.
  const ovr = (p.ratings.spd*0.16 + p.ratings.acc*0.12 + p.ratings.agi*0.12 + p.ratings.str*0.10 + p.ratings.awr*0.20 + p.ratings.sta*0.15 + p.ratings.inj*0.15);
  p.ratings.ovr = Math.round(clamp(40, 99, ovr));
}

/**
 * Run a single snap. This is intentionally compact but extensible:
 * - play selection -> expanded details -> resolve -> grade -> film log
 */
export function runSnap(state: AppState, opts: {
  down: number;
  dist: number;
  yardLine: number;
  offenseCall: string;
  defenseCall: string;
}) {
  const team = state.teams[state.meta.userTeamId];
  const opp = state.teams[state.weekPlan.opponentTeamId];
  const rng = mulberry32(hashSeed(state.meta.seed + "snap" + state.meta.week + opts.down + opts.dist + opts.offenseCall));

  // quick offensive/defensive strength approximations from roster OVR
  const avgOvr = (ids: string[]) => {
    const ps = ids.map(id => state.players[id]).filter(Boolean);
    if (!ps.length) return 70;
    return ps.reduce((a,p)=>a+p.ratings.ovr,0)/ps.length;
  };
  const offStrength = avgOvr(team.roster.slice(0, 22));
  const defStrength = avgOvr(opp.roster.slice(0, 22));

  // Install load penalty (simple): if language complexity high and installs high intensity
  const intensity = state.weekPlan.installs.intensity;
  const clu = state.weekPlan.installs.items.map(id => state.installs[id]?.clu ?? 0).reduce((a,b)=>a+b,0);
  const cognitive = (intensity === "HIGH" ? 18 : intensity === "MED" ? 10 : 6) + Math.min(20, clu/2);
  const physical = intensity === "HIGH" ? 22 : intensity === "MED" ? 14 : 10;

  // Margin-for-error tightening (difficulty)
  const axes = difficultyAxes(state.meta.difficulty);
  const margin = clamp(0.80, 1.15, 1.0 - (team.staff.tension.oc + team.staff.tension.dc)/250 + (team.lockerRoomMood === "FRACTURED" ? -0.08 : team.lockerRoomMood === "UNEASY" ? -0.03 : 0));
  const baseP = 0.50 + ((offStrength - defStrength) / 200); // -0.15..+0.15 typical

  // Tendencies exploitation placeholder: opponent IQ reduces your effectiveness if you spam a family
  const tendencyPenalty = (axes.oppIQ - 1.0) * 0.05;

  const pSuccess = clamp(0.10, 0.85, (baseP * margin) - tendencyPenalty);

  const roll = rng();
  let result: string;
  let yd = 0;
  let why = "";
  if (roll < pSuccess) {
    yd = randInt(rng, 3, 18);
    result = `Gain ${yd}`;
    why = "Call fit the look; execution clean.";
  } else {
    const neg = rng();
    if (neg < 0.15) { yd = -randInt(rng,1,5); result = `Loss ${Math.abs(yd)}`; why = "Backfield disruption; leverage lost."; }
    else if (neg < 0.23) { yd = 0; result = "No gain"; why = "Spacing tight; timing late."; }
    else if (neg < 0.28) { yd = 0; result = "Sack"; why = "Protection breakdown; pocket collapsed."; }
    else if (neg < 0.31) { yd = 0; result = "Penalty (offense)"; why = "Technique late; holding/false start."; }
    else if (neg < 0.34) { yd = 0; result = "Turnover"; why = "Bad decision under pressure; ball security failed."; }
    else { yd = randInt(rng,0,2); result = `Short gain ${yd}`; why = "Defense sat on tendency; limited window."; }
  }

  // Grade delta: expectation-based and bounded
  const expected = pSuccess;
  const actual = result.startsWith("Gain") ? 1 : (result.startsWith("Short") ? 0.4 : (result === "No gain" ? 0.2 : (result.includes("Penalty") ? 0.05 : 0)));
  const delta = clamp(-10, 10, Math.round((actual - expected) * 18));

  const film: FilmPlay = {
    id: nanoid(10),
    week: state.meta.week,
    opponentTeamId: state.weekPlan.opponentTeamId,
    down: opts.down,
    dist: opts.dist,
    yardLine: opts.yardLine,
    callOffense: opts.offenseCall,
    callDefense: opts.defenseCall,
    result,
    gradeDelta: delta,
    why,
    timestamp: Date.now(),
  };
  state.film.unshift(film);

  // Media hook: big failures or hero plays
  if (result === "Turnover") {
    pushOrUpdateNarrative(state, team.id, "too-sloppy", "Too sloppy, too often", -12 * axes.mediaVol);
    state.usnn.unshift(makeUSNNItem(`${team.name} coughs it up again`, "HOSTILE", "TEAM", team.id, why));
  }
  if (result.startsWith("Gain 18")) {
    pushOrUpdateNarrative(state, team.id, "explosive", "Explosive when it matters", +10 * axes.mediaVol);
  }

  // Injury micro-check based on load + aging durability
  const tolAvg = team.roster.slice(0, 22).map(id => loadTolerance(state.players[id])).reduce((a,b)=>a+b,0)/Math.max(1, Math.min(22, team.roster.length));
  const pls = physical + cognitive;
  const risk = injuryRiskFromLoad(pls, tolAvg);

  const injRoll = rng();
  if (injRoll < risk.major) {
    const victimId = choice(rng, team.roster.slice(0, Math.min(15, team.roster.length)));
    const v = state.players[victimId];
    if (v) {
      v.injuryStatus = "OUT";
      state.usnn.unshift(makeUSNNItem(`${v.name} leaves the game`, "HOSTILE", "INJURY", team.id, "Major injury risk spiked under load."));
    }
  } else if (injRoll < risk.soft) {
    const victimId = choice(rng, team.roster.slice(0, Math.min(18, team.roster.length)));
    const v = state.players[victimId];
    if (v && v.injuryStatus === "HEALTHY") {
      v.injuryStatus = "QUESTIONABLE";
      state.usnn.unshift(makeUSNNItem(`${v.name} listed questionable`, "NEUTRAL", "INJURY", team.id, "Soft tissue risk elevated under install/practice load."));
    }
  }

  // Update derived summaries
  team.lockerRoomMood = team.factions.disaffected > 40 ? "FRACTURED" : team.factions.disaffected > 20 ? "UNEASY" : "UNIFIED";
  state.weekPlan.mediaTone = updateMediaToneFromNarratives(state, team);

  return { film, delta, yardDelta: yd };
}

/**
 * Monday film tasks -> Film Room. This just seeds tasks and ensures UI has "open film room" CTA.
 */
export function ensureMondayFilmTasks(state: AppState) {
  const notes = state.weekPlan.dayNotes;
  if (!notes.MON) notes.MON = [];
  const have = new Set(notes.MON);
  const tasks = [
    "Review key moments (turning points)",
    "Audit 3rd down plan vs opponent tendencies",
    "Self-scout: top 3 tendency tells",
    "Player check-ins: confidence + workload"
  ];
  for (const t of tasks) if (!have.has(t)) notes.MON.push(t);
}

/**
 * Week advance: applies owner pressure + relocation, plus small media drift.
 */
export function advanceDay(state: AppState, day: WeekDay) {
  const team = state.teams[state.meta.userTeamId];
  if (day === "MON") ensureMondayFilmTasks(state);

  // Media drift: quotes and tone handled in UI actions; here we apply system-level effects.
  applyOwnerPressure(state, team);
  relocationThreatTick(state, team);

  // Slight narrative decay
  for (const n of Object.values(state.narratives)) {
    n.momentum = clamp(-100, 100, n.momentum * 0.96);
    n.state = n.momentum >= 35 ? "POSITIVE" : n.momentum <= -35 ? "HOSTILE" : n.momentum <= -10 ? "NEGATIVE" : "NEUTRAL";
  }
}
