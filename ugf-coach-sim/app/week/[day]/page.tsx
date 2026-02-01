import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { List, ListRow } from "@/components/List";
import Link from "next/link";

async function getState() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/state` : "http://localhost:3000/api/state", { cache: "no-store" });
  return res.json();
}

export default async function WeekDayPage({ params }: { params: { day: string } }) {
  const day = params.day.toUpperCase();
  const state = await getState();
  const team = state.teams[state.meta.userTeamId];
  const opp = state.teams[state.weekPlan.opponentTeamId];
  const notes: string[] = state.weekPlan.dayNotes?.[day] ?? [];

  const titleMap: any = {
    MON: "Review & Accountability",
    TUE: "Game Planning & Personnel",
    WED: "Install Day 1 (Base)",
    THU: "Install Day 2 (Situational)",
    FRI: "Polish & Discipline",
    SAT: "Walkthrough & Messaging",
  };

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title={titleMap[day] ?? "Week Hub"} subtitle={`Week ${state.meta.week} · vs ${opp.name}`} right={
        <form action="/api/advance" method="post">
          <input type="hidden" name="day" value={day} />
        </form>
      } />
      <div className="p-4 space-y-4">
        <div className="card p-4">
          <div className="text-sm font-semibold">Context</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div><div className="k">Media Tone</div><div className="v">{state.weekPlan.mediaTone}</div></div>
            <div><div className="k">Locker Room</div><div className="v">{team.lockerRoomMood}</div></div>
            <div><div className="k">Install Intensity</div><div className="v">{state.weekPlan.installs.intensity}</div></div>
            <div><div className="k">Practice Emphasis</div><div className="v">{state.weekPlan.practiceEmphasis}</div></div>
          </div>
          {day === "MON" ? (
            <div className="mt-3">
              <Link className="btnPrimary w-full" href="/filmroom">Open Film Room</Link>
            </div>
          ) : null}
        </div>

        <List title="Today’s Tasks">
          {notes.length === 0 ? <div className="py-4 text-xs text-muted">No tasks yet. Use Film Room and staff meetings to create direction.</div> : null}
          {notes.map((n, idx) => (
            <ListRow key={idx} left={<div className="text-sm">{n}</div>} right={<span className="chip">Task</span>} />
          ))}
        </List>

        <div className="card p-4">
          <div className="text-sm font-semibold">Next</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link className="btn" href="/">Back</Link>
            <Link className="btnPrimary" href="/gameday">Game Day</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
