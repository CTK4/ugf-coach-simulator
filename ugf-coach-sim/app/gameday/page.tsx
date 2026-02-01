"use client";

import { useEffect, useMemo, useState } from "react";
import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { DetailDrawer } from "@/components/DetailDrawer";
import { List, ListRow } from "@/components/List";
import { FocusCard } from "@/components/FocusCard";

type Play = { id: string; alias: string; family: "RUN"|"PASS"|"ST"; detail: string; risk: "LOW"|"MED"|"HIGH"; };

const PLAYS: Play[] = [
  { id:"p-run-oz", alias:"OZ", family:"RUN", detail:"Outside Zone (wide track) · Read: edge leverage · Cutback late", risk:"LOW" },
  { id:"p-pass-flood", alias:"Flood", family:"PASS", detail:"Flood concept · High/low on flat defender · Alert shot vs Cover-3", risk:"MED" },
  { id:"p-pass-mesh", alias:"Mesh", family:"PASS", detail:"Mesh · Crossers vs man · Sit route vs zone windows", risk:"MED" },
  { id:"p-st-punt", alias:"Punt", family:"ST", detail:"Directional punt emphasis · Coverage integrity priority", risk:"LOW" },
];

export default function GameDayPage() {
  const [state, setState] = useState<any>(null);
  const [selected, setSelected] = useState<Play | null>(null);
  const [down, setDown] = useState(1);
  const [dist, setDist] = useState(10);
  const [yardLine, setYardLine] = useState(25);
  const [last, setLast] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/state").then(r => r.json()).then(setState);
  }, []);

  const team = state?.teams?.[state?.meta?.userTeamId];
  const opp = state?.teams?.[state?.weekPlan?.opponentTeamId];

  const defenseCall = useMemo(() => {
    // minimal “CPU responds” stub
    if (!selected) return "Base";
    if (selected.family === "RUN") return "Gap-Fit + 2-High";
    if (selected.family === "PASS") return "Split-Safety (disguise)";
    return "ST Safe";
  }, [selected]);

  async function runSnapNow() {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch("/api/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ down, dist, yardLine, offenseCall: selected.alias, defenseCall }),
      });
      const out = await res.json();
      setLast(out);
      // advance situation
      const yd = out.yardDelta ?? 0;
      const newY = Math.max(1, Math.min(99, yardLine + yd));
      setYardLine(newY);

      // basic down/distance progression
      let newDist = dist - yd;
      if (yd >= dist) {
        setDown(1); setDist(10); // first down
      } else {
        setDown(Math.min(4, down + 1));
        setDist(Math.max(1, newDist));
      }
      // refresh state for wire + film
      const s = await fetch("/api/state").then(r=>r.json());
      setState(s);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title="Game Day" subtitle={team && opp ? `Week ${state.meta.week} · ${team.name} vs ${opp.name}` : "Loading…"} />
      <div className="p-4 space-y-4">
        <div className="card p-4">
          <div className="grid grid-cols-3 gap-3">
            <div><div className="k">Down</div><div className="text-lg font-semibold">{down}</div></div>
            <div><div className="k">To Go</div><div className="text-lg font-semibold">{dist}</div></div>
            <div className="text-right"><div className="k">Yard Line</div><div className="text-lg font-semibold">{yardLine}</div></div>
          </div>
          {last ? (
            <div className="mt-3 text-sm">
              <span className="text-muted">Last:</span> <span className="font-semibold">{last.film?.result ?? "—"}</span>
              <div className="text-xs text-muted mt-1">{last.film?.why ?? ""}</div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-muted">Select a play to expand details, then run a snap. Each snap is logged to Film Room.</div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <FocusCard title="Offense" subtitle={team ? `Caller: ${team.staff.playCaller.offense}` : ""}>
            <div className="text-xs text-muted">Tap a play to expand the full call. Pre-snap edits slot in here later.</div>
          </FocusCard>
          <FocusCard title="Defense" subtitle={opp ? `Tendencies: ${opp.scheme.defense}` : ""}>
            <div className="text-xs text-muted">CPU responds based on opponent identity + scouting layer (stubbed).</div>
          </FocusCard>
          <FocusCard title="Game Management" subtitle="Clock/TO/4th down hooks ready">
            <div className="text-xs text-muted">This build focuses on play expand + snap resolver + film log.</div>
          </FocusCard>
        </div>

        <List title="Play Call (Alias → Expand)">
          {PLAYS.map(p => (
            <ListRow
              key={p.id}
              onClick={() => setSelected(p)}
              left={
                <div>
                  <div className="text-sm font-medium">{p.alias} <span className="text-xs text-muted">· {p.family}</span></div>
                  <div className="text-xs text-muted mt-0.5">{p.detail}</div>
                </div>
              }
              right={<span className={"chip " + (p.risk === "HIGH" ? "border-bad text-bad" : p.risk === "MED" ? "border-warn text-warn" : "border-good text-good")}>{p.risk}</span>}
            />
          ))}
        </List>

        <div className="card p-4">
          <div className="text-sm font-semibold">Film Room</div>
          <div className="text-xs text-muted mt-1">Every snap is stored with result, grade delta, and “why it failed.”</div>
          <a className="btn mt-3 w-full" href="/filmroom">Open Film</a>
        </div>
      </div>

      <DetailDrawer
        open={!!selected}
        title={selected ? `Play: ${selected.alias}` : ""}
        subtitle={selected ? `${selected.family} · Risk ${selected.risk}` : ""}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-3">
            <div className="card p-3">
              <div className="text-xs text-muted">Expanded Call</div>
              <div className="text-sm mt-1">{selected.detail}</div>
              <div className="text-xs text-muted mt-2">Defense Look (projected)</div>
              <div className="text-sm">{defenseCall}</div>
            </div>
            <button className="btnPrimary w-full disabled:opacity-60" disabled={busy} onClick={runSnapNow}>
              {busy ? "Running…" : "Run Snap"}
            </button>
            <div className="text-xs text-muted">Outcome resolves with collision + grade + film log (current stub). Next: route/coverage micro-resolver.</div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
