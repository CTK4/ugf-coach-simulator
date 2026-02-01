import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { List, ListRow } from "@/components/List";

async function getState() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/state` : "http://localhost:3000/api/state", { cache: "no-store" });
  return res.json();
}

export default async function LeaguePage() {
  const state = await getState();
  const teams = Object.values(state.teams) as any[];
  const byConf = (c: string) => teams.filter(t => t.conf === c).sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title="UGF League" subtitle="Conferences · Divisions · Owners" />
      <div className="p-4 space-y-4">
        <List title="American Conference (AC)">
          {byConf("AC").slice(0, 16).map(t => (
            <ListRow key={t.id}
              left={<div><div className="text-sm font-medium">{t.name}</div><div className="text-xs text-muted">{t.div} · Owner: {t.owner}</div></div>}
              right={<span className="chip">{t.record.w}-{t.record.l}</span>}
            />
          ))}
        </List>
        <List title="National Conference (NC)">
          {byConf("NC").slice(0, 16).map(t => (
            <ListRow key={t.id}
              left={<div><div className="text-sm font-medium">{t.name}</div><div className="text-xs text-muted">{t.div} · Owner: {t.owner}</div></div>}
              right={<span className="chip">{t.record.w}-{t.record.l}</span>}
            />
          ))}
        </List>
      </div>
    </div>
  );
}
