import fs from "node:fs";
import path from "node:path";
import { AppState } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_PATH = path.join(DATA_DIR, "state.json");

export function readState(): AppState {
  if (!fs.existsSync(STATE_PATH)) {
    throw new Error("State not initialized. Run /api/init once.");
  }
  const raw = fs.readFileSync(STATE_PATH, "utf-8");
  return JSON.parse(raw) as AppState;
}

export function writeState(state: AppState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export function resetState() {
  if (fs.existsSync(STATE_PATH)) fs.unlinkSync(STATE_PATH);
}
