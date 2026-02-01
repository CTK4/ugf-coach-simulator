"use client";

import { useEffect, useMemo, useState } from "react";
import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { List, ListRow } from "@/components/List";
import { FocusCard } from "@/components/FocusCard";
import { DetailDrawer } from "@/components/DetailDrawer";

type Tab = "ROSTER" | "FA" | "CAP" | "TRADES";

function tabBtn(active: boolean) {
  return "btn whitespace-nowrap " + (active ? "border-accent bg-accent/20" : "");
}

export default function FrontOfficePage() {
  const [state, setState] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("ROSTER");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => { fetch("/api/state").then(r=>r.json()).then(setState); }, []);
  const team = state?.teams?.[state?.meta?.userTeamId];

  const selectedPlayer = selectedPlayerId ? state?.players?.[selectedPlayerId] : null;

  const roster = useMemo(() => {
    if (!team || !state?.players) return [];
    return team.roster.slice(0, 40).map((id: string) => state.players[id]).filter(Boolean);
  }, [team, state]);

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title="Front Office" subtitle={team ? team.name : "Loading…"} />
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className={tabBtn(tab==="ROSTER")} onClick={()=>setTab("ROSTER")}>Roster Moves</button>
          <button className={tabBtn(tab==="FA")} onClick={()=>setTab("FA")}>Free Agency</button>
          <button className={tabBtn(tab==="CAP")} onClick={()=>setTab("CAP")}>Cap & Contracts</button>
          <button className={tabBtn(tab==="TRADES")} onClick={()=>setTab("TRADES")}>Trade Center</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === "CAP" ? (
          <FocusCard title="Cap Snapshot" subtitle={`Philosophy: ${team.capPhilosophy} · Owner Mood: ${team.ownerMood}`}>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="k">Cap Space</div><div className="v">${team.cap.space.toLocaleString()}</div></div>
              <div><div className="k">Effective Space</div><div className="v">${Math.max(0, team.cap.space - 6000000).toLocaleString()}</div></div>
              <div><div className="k">Dead Money</div><div className="v">${team.cap.dead.toLocaleString()}</div></div>
              <div><div className="k">Future Commit</div><div className="v">${team.cap.future.toLocaleString()}</div></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={"chip " + (team.cap.flex === "CRITICAL" ? "border-bad text-bad" : team.cap.flex === "TIGHT" ? "border-warn text-warn" : "border-good text-good")}>Flex: {team.cap.flex}</span>
              <span className="chip">Spending Tol: {team.spendingTolerance}</span>
              <span className="chip">Patience: {team.ownerPatience}</span>
            </div>
            <div className="text-xs text-muted mt-2">NFL-like cap structures under the hood; UI stays readable and consequence-driven.</div>
          </FocusCard>
        ) : null}

        {tab === "CAP" ? (
          <List title="Contracts (Tap for actions)">
            {roster.slice(0, 18).map((p: any) => (
              <ListRow
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                left={
                  <div>
                    <div className="text-sm font-medium">{p.name} <span className="text-xs text-muted">· {p.pos}</span></div>
                    <div className="text-xs text-muted mt-0.5">{p.contract?.years ?? 0}y · Cap ${p.contract?.capHitThisYear?.toLocaleString?.() ?? "—"} · Gtd ${p.contract?.guaranteedRemaining?.toLocaleString?.() ?? "—"}</div>
                  </div>
                }
                right={<span className="chip">OVR {p.ratings.ovr}</span>}
              />
            ))}
          </List>
        ) : null}

        {tab === "ROSTER" ? (
          <List title="Roster Moves">
            {roster.slice(0, 22).map((p: any) => (
              <ListRow
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                left={
                  <div>
                    <div className="text-sm font-medium">{p.name} <span className="text-xs text-muted">· {p.pos}</span></div>
                    <div className="text-xs text-muted mt-0.5">Status: {p.injuryStatus} · Trend: {p.confidence}</div>
                  </div>
                }
                right={<span className="chip">{team.tradeBlock[p.id] ?? "—"}</span>}
              />
            ))}
          </List>
        ) : null}

        {tab === "FA" ? (
          <div className="card p-4">
            <div className="text-sm font-semibold">Free Agency</div>
            <div className="text-xs text-muted mt-1">FA board + offer builder + tampering hooks are ready. This scaffold keeps market behavior in the sim engine and renders it here.</div>
            <div className="mt-3 flex gap-2">
              <span className="chip">Phase: Legal Contact</span>
              <span className="chip">Market Heat: Warm</span>
            </div>
          </div>
        ) : null}

        {tab === "TRADES" ? (
          <div className="card p-4">
            <div className="text-sm font-semibold">Trade Center</div>
            <div className="text-xs text-muted mt-1">Anti-cheese logic is active (trade reputation + escalating prices + owner/media backlash). Deal UI is next.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip">Trade Rep: {team.tradeReputation.profile}</span>
              <span className="chip">Score: {team.tradeReputation.score}</span>
            </div>
          </div>
        ) : null}
      </div>

      <DetailDrawer
        open={!!selectedPlayer}
        title={selectedPlayer ? `${selectedPlayer.name} · ${selectedPlayer.pos}` : ""}
        subtitle={selectedPlayer ? `OVR ${selectedPlayer.ratings.ovr} · Agent ${state?.agents?.[selectedPlayer.agentId]?.type ?? "—"}` : ""}
        onClose={() => setSelectedPlayerId(null)}
      >
        {selectedPlayer ? (
          <div className="space-y-3">
            <div className="card p-3">
              <div className="text-xs text-muted">Contract</div>
              <div className="text-sm mt-1">Years: {selectedPlayer.contract?.years ?? 0} · Total: ${selectedPlayer.contract?.totalValue?.toLocaleString?.() ?? "—"}</div>
              <div className="text-sm">Guarantees: ${selectedPlayer.contract?.guarantees?.toLocaleString?.() ?? "—"} · Cap: ${selectedPlayer.contract?.capHitThisYear?.toLocaleString?.() ?? "—"}</div>
              <div className="text-xs text-muted mt-2">Promise: {selectedPlayer.contract?.rolePromise ?? "None"}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="btn">Extend</button>
              <button className="btn">Restructure</button>
              <button className="btn">Release</button>
              <button className="btn">Trade Block</button>
            </div>

            <div className="text-xs text-muted">
              Actions preview cap impact + relationship + media + faction effects (next incremental build). Promises become explicit and enforceable.
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
