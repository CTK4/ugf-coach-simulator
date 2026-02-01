import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { USNNFeed } from "@/components/USNNFeed";
import Link from "next/link";

async function getState() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/state` : "http://localhost:3000/api/state", { cache: "no-store" });
  return res.json();
}

function chip(t: string, tone: "good"|"warn"|"bad") {
  const cls = tone === "good" ? "border-good text-good" : tone === "bad" ? "border-bad text-bad" : "border-warn text-warn";
  return <span className={`chip ${cls}`}>{t}</span>;
}

export default async function HomePage() {
  let state: any;
  try { state = await getState(); } catch { state = null; }

  if (!state) {
    return (
      <div className="p-4 space-y-4">
        <BroadcastHeaderBar title="Week Hub" subtitle="State not initialized" />
        <div className="card p-4">
          <div className="text-sm font-semibold">Initialize Save</div>
          <div className="text-xs text-muted mt-1">POST /api/init to create a fresh league state.</div>
          <form action="/api/init" method="post" className="mt-3">
            <button className="btnPrimary w-full" type="submit">Initialize</button>
          </form>
        </div>
      </div>
    );
  }

  const team = state.teams[state.meta.userTeamId];
  const opp = state.teams[state.weekPlan.opponentTeamId];
  const tone = state.weekPlan.mediaTone as string;
  const mood = team.lockerRoomMood as string;

  const toneChip = tone === "POSITIVE" ? chip("Media: Positive","good") : tone === "HOSTILE" ? chip("Media: Hostile","bad") : chip("Media: Neutral","warn");
  const moodChip = mood === "UNIFIED" ? chip("Room: Unified","good") : mood === "FRACTURED" ? chip("Room: Fractured","bad") : chip("Room: Uneasy","warn");

  const days = [
    { d:"MON", label:"Mon", href:"/week/MON" },
    { d:"TUE", label:"Tue", href:"/week/TUE" },
    { d:"WED", label:"Wed", href:"/week/WED" },
    { d:"THU", label:"Thu", href:"/week/THU" },
    { d:"FRI", label:"Fri", href:"/week/FRI" },
    { d:"SAT", label:"Sat", href:"/week/SAT" },
  ];

  return (
    <div className="pb-10">
      <BroadcastHeaderBar
        title="Week Hub"
        subtitle={`Week ${state.meta.week} · ${team.name} vs ${opp.name}`}
        right={<Link className="btnPrimary" href="/gameday">Kickoff</Link>}
      />

      <div className="p-4 space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="k">Record</div>
              <div className="text-xl font-semibold">{team.record.w}-{team.record.l}-{team.record.t}</div>
            </div>
            <div className="text-right">
              <div className="k">Next Opponent</div>
              <div className="v">{opp.name}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {toneChip}
            {moodChip}
            {team.cap.flex === "CRITICAL" ? chip("Cap: Critical","bad") : team.cap.flex === "TIGHT" ? chip("Cap: Tight","warn") : chip("Cap: Comfortable","good")}
          </div>

          <div className="mt-4">
            <div className="k">Week Timeline</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {days.map(x => (
                <Link key={x.d} href={x.href} className="btn whitespace-nowrap">{x.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <USNNFeed teamId={team.id} />

        <div className="card p-4">
          <div className="text-sm font-semibold">Quick Actions</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link className="btn" href="/frontoffice">Front Office</Link>
            <Link className="btn" href="/filmroom">Film Room</Link>
            <Link className="btn" href="/league">League</Link>
            <Link className="btn" href="/settings">Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
