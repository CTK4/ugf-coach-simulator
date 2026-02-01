import { nanoid } from "nanoid";
import { AppState, OwnerArchetype, Team, TeamBranding } from "./types";

export const RELOCATION_OPTIONS = [
  "San Francisco Goldrush",
  "Portland Cascades",
  "Austin Outlaws",
  "Louisville Stallions",
  "Oklahoma City Frontiers",
  "Toronto Vanguard",
  "Mexico City Azteca"
] as const;

type TeamSeed = {
  id: string;
  name: string;
  city: string;
  conf: "AC" | "NC";
  div: "EAST" | "SOUTH" | "NORTH" | "WEST";
  owner: OwnerArchetype;
  branding?: TeamBranding;
};

export const TEAM_SEEDS: TeamSeed[] = [
  // AC EAST
  { id:"ac-nyb", city:"New York", name:"Bluebirds", conf:"AC", div:"EAST", owner:"MEDIA_BARON" },
  { id:"ac-bos", city:"Boston", name:"Harbormen", conf:"AC", div:"EAST", owner:"LEGACY_HEIR" },
  { id:"ac-phi", city:"Philadelphia", name:"Founders", conf:"AC", div:"EAST", owner:"INDUSTRIALIST" },
  { id:"ac-bal", city:"Baltimore", name:"Admirals", conf:"AC", div:"EAST", owner:"PRIVATE_EQUITY" },
  // AC SOUTH
  { id:"ac-mia", city:"Miami", name:"Tide", conf:"AC", div:"SOUTH", owner:"GLOBALIST" },
  { id:"ac-orl", city:"Orlando", name:"Kingdom", conf:"AC", div:"SOUTH", owner:"MEDIA_BARON" },
  { id:"ac-tam", city:"Tampa Bay", name:"Corsairs", conf:"AC", div:"SOUTH", owner:"MAVERICK" },
  { id:"ac-jax", city:"Jacksonville", name:"Fleet", conf:"AC", div:"SOUTH", owner:"LOCAL_MAGNATE" },
  // AC NORTH
  { id:"ac-pit", city:"Pittsburgh", name:"Ironclads", conf:"AC", div:"NORTH", owner:"INDUSTRIALIST" },
  { id:"ac-cle", city:"Cleveland", name:"Forge", conf:"AC", div:"NORTH", owner:"PRIVATE_EQUITY" },
  { id:"ac-det", city:"Detroit", name:"Assembly", conf:"AC", div:"NORTH", owner:"INDUSTRIALIST" },
  { id:"ac-buf", city:"Buffalo", name:"Northwind", conf:"AC", div:"NORTH", owner:"LOCAL_MAGNATE" },
  // AC WEST
  { id:"ac-hou", city:"Houston", name:"Launch", conf:"AC", div:"WEST", owner:"TECHNOCRAT",
    branding: { colors:["#0b0b0f","#ff6a00","#ffffff"], logoHint:"Stylized upward vector intersecting a ring (launch trajectory)", tone:"Acceleration, innovation, inevitability" } },
  { id:"ac-dal", city:"Dallas", name:"Imperials", conf:"AC", div:"WEST", owner:"LEGACY_HEIR",
    branding: { colors:["#0a1a3a","#d6b24a","#0b0b0f"], logoHint:"Angular crown integrated with a lone star", tone:"Authority, entitlement, scale" } },
  { id:"ac-den", city:"Denver", name:"Summit", conf:"AC", div:"WEST", owner:"TECHNOCRAT" },
  { id:"ac-phx", city:"Phoenix", name:"Scorch", conf:"AC", div:"WEST", owner:"GLOBALIST" },

  // NC EAST
  { id:"nc-was", city:"Washington", name:"Sentinels", conf:"NC", div:"EAST", owner:"LEGACY_HEIR" },
  { id:"nc-njp", city:"New Jersey", name:"Palisades", conf:"NC", div:"EAST", owner:"PRIVATE_EQUITY" },
  { id:"nc-cha", city:"Charlotte", name:"Crown", conf:"NC", div:"EAST", owner:"LOCAL_MAGNATE" },
  { id:"nc-atl", city:"Atlanta", name:"Monarchs", conf:"NC", div:"EAST", owner:"MEDIA_BARON" },

  // NC SOUTH
  { id:"nc-nol", city:"New Orleans", name:"Voodoo", conf:"NC", div:"SOUTH", owner:"MAVERICK",
    branding: { colors:["#2a0b5a","#caa24a","#000000"], logoHint:"Crescent moon formed by broken sigils", tone:"Mystique, intimidation, chaos" } },
  { id:"nc-nas", city:"Nashville", name:"Sound", conf:"NC", div:"SOUTH", owner:"MEDIA_BARON" },
  { id:"nc-sat", city:"San Antonio", name:"Alamo Guard", conf:"NC", div:"SOUTH", owner:"LOCAL_MAGNATE" },
  { id:"nc-mem", city:"Memphis", name:"River Kings", conf:"NC", div:"SOUTH", owner:"PRIVATE_EQUITY" },

  // NC NORTH
  { id:"nc-chi", city:"Chicago", name:"Union", conf:"NC", div:"NORTH", owner:"INDUSTRIALIST",
    branding: { colors:["#5a646f","#ff2b2b","#f4efe6"], logoHint:"Interlocking vertical bars forming a U", tone:"Collective strength, industrial power" } },
  { id:"nc-mil", city:"Milwaukee", name:"Northshore", conf:"NC", div:"NORTH", owner:"LEGACY_HEIR" },
  { id:"nc-stl", city:"St. Louis", name:"Archons", conf:"NC", div:"NORTH", owner:"LOCAL_MAGNATE" },
  { id:"nc-ind", city:"Indianapolis", name:"Crossroads", conf:"NC", div:"NORTH", owner:"TECHNOCRAT" },

  // NC WEST
  { id:"nc-lax", city:"Los Angeles", name:"Stars", conf:"NC", div:"WEST", owner:"MEDIA_BARON",
    branding: { colors:["#0b0b0f","#d9c27a","#f7f7ff"], logoHint:"Fractured five-point star with negative space core", tone:"Spotlight, pressure, spectacle" } },
  { id:"nc-sea", city:"Seattle", name:"Evergreens", conf:"NC", div:"WEST", owner:"TECHNOCRAT",
    branding: { colors:["#0b3b2f","#aab6c4","#f3f7ff"], logoHint:"Abstract evergreen reduced to stacked chevrons", tone:"Longevity, composure, quiet dominance" } },
  { id:"nc-lv", city:"Las Vegas", name:"Syndicate", conf:"NC", div:"WEST", owner:"MAVERICK" },
  { id:"nc-sd", city:"San Diego", name:"Armada", conf:"NC", div:"WEST", owner:"GLOBALIST" },
];

export function makeInitialTeams(): Record<string, Team> {
  const teams: Record<string, Team> = {};
  for (const t of TEAM_SEEDS) {
    const id = t.id;
    teams[id] = {
      id,
      name: `${t.city} ${t.name}`,
      city: t.city,
      conf: t.conf,
      div: t.div,
      owner: t.owner,
      branding: t.branding,
      record: { w: 0, l: 0, t: 0 },
      cap: { space: 42000000, dead: 0, future: 120000000, flex: "COMFORTABLE" },
      capPhilosophy: "BALANCED_CORE",
      ownerMood: 10,
      ownerPatience: 70,
      spendingTolerance: 60,
      roster: [],
      practiceSquad: [],
      tradeBlock: {},
      lockerRoomMood: "UNIFIED",
      factions: { veterans: 10, young: 10, stars: 10, schemeLoyalists: 10, disaffected: 0 },
      scheme: { offense: "West Coast", defense: "Split-Safety", languageComplexity: 45, installed: [] },
      staff: {
        hcId: `hc-${id}`,
        ocId: `oc-${id}`,
        dcId: `dc-${id}`,
        stId: `st-${id}`,
        gmId: `gm-${id}`,
        playCaller: { offense: "SHARED", defense: "SHARED" },
        tension: { oc: 10, dc: 10 },
      },
      tradeReputation: { profile: "BALANCED", score: 0 },
      relocation: { threatLevel: 0, marketPressure: 10 },
    };
  }
  return teams;
}

export function makeUSNNItem(headline: string, tone: "POSITIVE"|"NEUTRAL"|"HOSTILE", category: "LEAGUE"|"TEAM"|"INJURY"|"CONTRACT"|"TRADE"|"DRAFT"|"PRESS", teamId?: string, detail?: string) {
  return { id: nanoid(10), ts: Date.now(), category, headline, tone, teamId, detail };
}
