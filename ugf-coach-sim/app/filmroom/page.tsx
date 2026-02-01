import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { List, ListRow } from "@/components/List";

async function getState() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/state` : "http://localhost:3000/api/state", { cache: "no-store" });
  return res.json();
}

export default async function FilmRoomPage() {
  const state = await getState();
  const team = state.teams[state.meta.userTeamId];
  const opp = state.teams[state.weekPlan.opponentTeamId];

  const film = (state.film ?? []).slice(0, 50);

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title="Film Room" subtitle={`Week ${state.meta.week} · vs ${opp.name}`} />
      <div className="p-4 space-y-4">
        <div className="card p-4">
          <div className="text-sm font-semibold">Filters</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip">All</span>
            <span className="chip">3rd Down</span>
            <span className="chip">Red Zone</span>
            <span className="chip">Turnovers</span>
          </div>
          <div className="text-xs text-muted mt-2">This is a playable log: each snap you run is recorded here with “why it failed” context.</div>
        </div>

        <List title="Recent Snaps">
          {film.length === 0 ? <div className="py-4 text-xs text-muted">No film yet. Run snaps on Game Day to populate the log.</div> : null}
          {film.map((p: any) => (
            <ListRow
              key={p.id}
              left={
                <div>
                  <div className="text-sm font-medium">{p.down}&{p.dist} · {p.callOffense}</div>
                  <div className="text-xs text-muted mt-0.5">{p.result} · {p.why}</div>
                </div>
              }
              right={<span className={"chip " + (p.gradeDelta >= 2 ? "border-good text-good" : p.gradeDelta <= -2 ? "border-bad text-bad" : "")}>{p.gradeDelta >= 0 ? "+" : ""}{p.gradeDelta}</span>}
            />
          ))}
        </List>
      </div>
    </div>
  );
}
