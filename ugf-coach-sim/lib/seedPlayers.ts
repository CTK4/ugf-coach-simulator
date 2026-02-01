import { nanoid } from "nanoid";
import { choice, mulberry32, hashSeed, randInt, clamp } from "./rng";
import { AgentProfile, AppState, PlayerProfile, Position, Personality } from "./types";

const FIRST = ["Marcus","Jalen","Tariq","DeAndre","Caleb","Noah","Evan","Darius","Keenan","Xavier","Jordan","Avery","Malik","Trevor","Sam","Drew","Cameron","Miles","Carter","Roman"];
const LAST = ["Hughes","Walker","Reed","Caldwell","Bennett","Harris","Mitchell","Foster","Sullivan","Parker","Hayes","James","Edwards","Bryant","Stone","Watts","Coleman","Price","Simmons","Howard"];

const POS: Position[] = ["QB","RB","WR","WR","TE","OT","IOL","EDGE","IDL","LB","CB","FS","SS","K","P"];

export function makeAgent(r: () => number): AgentProfile {
  const types = ["POWER_BROKER","RELATIONSHIP_MANAGER","CHAOS"] as const;
  const type = choice(r, [...types]);
  return {
    id: nanoid(10),
    name: `${choice(r, FIRST)} ${choice(r, LAST)} Agency`,
    type,
    aggression: type === "POWER_BROKER" ? randInt(r, 70, 95) : type === "CHAOS" ? randInt(r, 60, 90) : randInt(r, 35, 65),
    mediaSavvy: type === "POWER_BROKER" ? randInt(r, 70, 95) : type === "CHAOS" ? randInt(r, 55, 85) : randInt(r, 30, 70),
    relationships: {},
    grudgeMemory: {},
  };
}

export function makePersonality(r: () => number): Personality {
  return {
    AGREEABLE: randInt(r, 25, 85),
    EGO: randInt(r, 15, 90),
    FLEX: randInt(r, 20, 85),
    CALM: randInt(r, 20, 85),
    DETAIL: randInt(r, 20, 85),
  };
}

export function makePlayer(r: () => number): PlayerProfile {
  const pos = choice(r, POS);
  const age = pos === "K" || pos === "P" ? randInt(r, 22, 34) : randInt(r, 21, 33);
  const yearsPro = clamp(0, 12, age - 21);
  const base = randInt(r, 63, 83) + (pos === "QB" ? 2 : 0);
  const ratings = {
    ovr: base,
    spd: clamp(55, 95, base + randInt(r, -8, 10) + (pos === "WR" || pos === "CB" ? 5 : 0)),
    acc: clamp(55, 95, base + randInt(r, -10, 12) + (pos === "RB" || pos === "CB" ? 4 : 0)),
    agi: clamp(55, 95, base + randInt(r, -10, 12)),
    str: clamp(55, 95, base + randInt(r, -10, 12) + (pos === "OT" || pos === "IOL" || pos === "IDL" ? 6 : 0)),
    awr: clamp(55, 95, base + randInt(r, -12, 14) + (yearsPro > 5 ? 4 : 0)),
    sta: clamp(55, 95, base + randInt(r, -10, 12)),
    inj: clamp(55, 95, base + randInt(r, -12, 10)),
  };

  return {
    id: nanoid(10),
    name: `${choice(r, FIRST)} ${choice(r, LAST)}`,
    pos,
    age,
    yearsPro,
    ratings,
    personality: makePersonality(r),
    confidence: "NEUTRAL",
    agePhase: yearsPro <= 1 ? "GROWTH" : "PRIME",
    wear: 0.0,
    injuryStatus: "HEALTHY",
    loadTolerance: 60,
    trust: {},
    tags: [],
    isLeader: r() < 0.08,
  };
}

export function seedLeagueRosters(state: AppState) {
  const r = mulberry32(hashSeed(state.meta.seed));
  // Agents pool
  for (let i=0;i<24;i++) {
    const a = makeAgent(r);
    state.agents[a.id] = a;
  }
  const agentIds = Object.keys(state.agents);

  for (const team of Object.values(state.teams)) {
    const rosterSize = 48;
    for (let i=0;i<rosterSize;i++) {
      const p = makePlayer(r);
      // assign agent + basic contract
      const agentId = choice(r, agentIds);
      p.agentId = agentId;

      const isStarter = i < 22;
      const y = randInt(r, 1, 4);
      const val = (p.ratings.ovr * 250000) * (isStarter ? 1.0 : 0.6);
      const guarantees = val * (isStarter ? 0.45 : 0.25);
      p.contract = {
        years: y,
        totalValue: Math.round(val),
        guarantees: Math.round(guarantees),
        capHitThisYear: Math.round(val / y),
        guaranteedRemaining: Math.round(guarantees),
        rolePromise: isStarter ? "STARTER" : "DEPTH",
        signedAtYear: state.meta.seasonYear
      };

      state.players[p.id] = p;
      team.roster.push(p.id);
      team.tradeBlock[p.id] = "LISTENING";
    }
    // PS
    const psSize = 8;
    for (let i=0;i<psSize;i++) {
      const p = makePlayer(r);
      p.agentId = choice(r, agentIds);
      p.contract = { years: 1, totalValue: 900000, guarantees: 150000, capHitThisYear: 900000, guaranteedRemaining: 150000, rolePromise: "DEPTH", signedAtYear: state.meta.seasonYear };
      state.players[p.id] = p;
      team.practiceSquad.push(p.id);
    }
  }
}
