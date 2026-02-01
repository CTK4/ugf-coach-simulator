export type DifficultyPreset = "CASUAL" | "STANDARD" | "HARDCORE";
export type LegendFrequency = "OFF" | "RARE" | "NORMAL";
export type MediaTone = "POSITIVE" | "NEUTRAL" | "HOSTILE";
export type LockerRoomMood = "UNIFIED" | "UNEASY" | "FRACTURED";

export type CapPhilosophy = "STARS_SCRUBS" | "BALANCED_CORE" | "ROOKIE_WAVE" | "WIN_NOW_PUSH";

export type OwnerArchetype =
  | "INDUSTRIALIST"
  | "MEDIA_BARON"
  | "TECHNOCRAT"
  | "LEGACY_HEIR"
  | "PRIVATE_EQUITY"
  | "LOCAL_MAGNATE"
  | "MAVERICK"
  | "GLOBALIST";

export type Position =
  | "QB" | "RB" | "FB" | "WR" | "TE"
  | "OT" | "IOL"
  | "EDGE" | "IDL" | "LB"
  | "CB" | "FS" | "SS"
  | "K" | "P";

export type PersonalityAxis = "AGREEABLE" | "EGO" | "FLEX" | "CALM" | "DETAIL";
export type Personality = Record<PersonalityAxis, number>; // 0-100

export type ConfidenceState = "CONFIDENT" | "NEUTRAL" | "PRESSING";
export type AgePhase = "GROWTH" | "PRIME" | "LATE_PRIME" | "DECLINE" | "ENDGAME";

export type TeamNeed = "QB" | "OL" | "DL" | "LB" | "CB" | "WR" | "RB" | "TE" | "S" | "K";

export type PlayFamily = "RUN" | "PASS" | "RPO" | "PLAY_ACTION" | "SCREEN" | "BLITZ" | "ZONE" | "MAN" | "ST";

export type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type InstallItemType = "CONCEPT" | "TAG" | "PROTECTION" | "COVERAGE_RULE" | "FORMATION";

export interface InstallItem {
  id: string;
  type: InstallItemType;
  name: string;
  clu: number; // cognitive load units
  family: PlayFamily;
}

export interface PlayerRatings {
  ovr: number; // 0-100
  spd: number;
  acc: number;
  agi: number;
  str: number;
  awr: number;
  sta: number;
  inj: number; // durability proxy
}

export interface Contract {
  years: number;
  totalValue: number;
  guarantees: number;
  capHitThisYear: number;
  guaranteedRemaining: number;
  rolePromise?: "STARTER" | "ROTATIONAL" | "DEPTH" | "FEATURE";
  signedAtYear: number;
}

export type AgentType = "POWER_BROKER" | "RELATIONSHIP_MANAGER" | "CHAOS";
export interface AgentProfile {
  id: string;
  name: string;
  type: AgentType;
  aggression: number; // 0-100
  mediaSavvy: number; // 0-100
  relationships: Record<string, number>; // teamId -> -100..100
  grudgeMemory: Record<string, number>; // teamId -> 0..100
}

export interface PlayerProfile {
  id: string;
  name: string;
  pos: Position;
  age: number;
  yearsPro: number;
  ratings: PlayerRatings;
  personality: Personality;
  confidence: ConfidenceState;
  agePhase: AgePhase;
  wear: number; // Career Wear Index (CWI) ~ 0..5+
  injuryStatus: "HEALTHY" | "QUESTIONABLE" | "OUT";
  loadTolerance: number; // 0..100
  trust: Record<string, number>; // coach/staff id -> -100..100
  agentId?: string;
  contract?: Contract;
  tags?: string[];
  isLeader?: boolean;
}

export interface TeamBranding {
  colors: [string, string, string];
  logoHint: string;
  tone: string;
}

export interface Team {
  id: string;
  name: string;
  conf: "AC" | "NC";
  div: "EAST" | "SOUTH" | "NORTH" | "WEST";
  city: string;
  branding?: TeamBranding;
  owner: OwnerArchetype;

  record: { w: number; l: number; t: number };
  cap: { space: number; dead: number; future: number; flex: "COMFORTABLE" | "TIGHT" | "CRITICAL" };

  capPhilosophy: CapPhilosophy;
  ownerMood: number; // -100..100
  ownerPatience: number; // 0..100
  spendingTolerance: number; // 0..100

  roster: string[]; // player ids
  practiceSquad: string[];
  tradeBlock: Record<string, "AVAILABLE" | "LISTENING" | "UNTOUCHABLE">;

  lockerRoomMood: LockerRoomMood;
  factions: {
    veterans: number; // -100..100
    young: number;
    stars: number;
    schemeLoyalists: number;
    disaffected: number;
  };

  scheme: {
    offense: string; // label
    defense: string; // label
    languageComplexity: number; // 0..100
    installed: string[]; // install item ids
  };

  staff: {
    hcId: string;
    ocId: string;
    dcId: string;
    stId: string;
    gmId: string;
    playCaller: { offense: "HC" | "OC" | "SHARED"; defense: "HC" | "DC" | "SHARED"; };
    tension: { oc: number; dc: number }; // 0..100
  };

  tradeReputation: {
    profile: "BALANCED" | "AGGRESSIVE_BUILDER" | "ASSET_HOARDER" | "CONTRACT_DUMPER" | "SHORT_TERM_GAMBLER";
    score: number; // 0..100 cheese pressure
  };

  relocation: {
    threatLevel: number; // 0..100
    marketPressure: number; // 0..100
    candidate?: string; // relocation option label
  };
}

export interface Narrative {
  id: string;
  title: string;
  momentum: number; // -100..100
  bias: number; // -50..50
  state: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "HOSTILE";
  triggers: string[];
  effects: { repMod: number; trustDecayMod: number; ownerPatienceMod: number; };
}

export interface FilmPlay {
  id: string;
  week: number;
  opponentTeamId: string;
  down: number;
  dist: number;
  yardLine: number;
  callOffense: string;
  callDefense: string;
  result: string;
  gradeDelta: number; // -10..+10
  why?: string;
  timestamp: number;
}

export interface WeekPlan {
  week: number;
  opponentTeamId: string;
  mediaTone: MediaTone;
  dayNotes: Record<WeekDay, string[]>;
  installs: { items: string[]; intensity: "LOW" | "MED" | "HIGH"; };
  practiceEmphasis: "TECHNIQUE" | "CONDITIONING" | "INSTALL" | "RECOVERY";
  delegation: { offense: "HC" | "OC" | "SHARED"; defense: "HC" | "DC" | "SHARED"; st: "HC" | "ST"; };
  snapCountPlan: Record<string, "FULL" | "LIMITED" | "PITCH_COUNT">; // playerId -> plan
}

export interface USNNItem {
  id: string;
  ts: number;
  category: "LEAGUE" | "TEAM" | "INJURY" | "CONTRACT" | "TRADE" | "DRAFT" | "PRESS";
  headline: string;
  detail?: string;
  tone: MediaTone;
  teamId?: string;
}

export interface AppState {
  meta: {
    saveVersion: number;
    seasonYear: number;
    week: number;
    phase: "REG" | "OFFSEASON";
    userTeamId: string;
    difficulty: DifficultyPreset;
    legendFrequency: LegendFrequency;
    seed: string;
  };
  teams: Record<string, Team>;
  players: Record<string, PlayerProfile>;
  agents: Record<string, AgentProfile>;
  installs: Record<string, InstallItem>;
  weekPlan: WeekPlan;
  narratives: Record<string, Narrative>;
  film: FilmPlay[];
  usnn: USNNItem[];
}
