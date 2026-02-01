"use client";

import { useEffect, useState } from "react";
import { BroadcastHeaderBar } from "@/components/BroadcastHeaderBar";
import { FocusCard } from "@/components/FocusCard";

export default function SettingsPage() {
  const [state, setState] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/state").then(r=>r.json()).then(setState); }, []);

  async function saveMeta(nextMeta: any) {
    setSaving(true);
    try {
      await fetch("/api/state", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ meta: nextMeta }) });
      const s = await fetch("/api/state").then(r=>r.json());
      setState(s);
    } finally {
      setSaving(false);
    }
  }

  if (!state) return (
    <div>
      <BroadcastHeaderBar title="Settings" subtitle="Loading…" />
      <div className="p-4"><div className="card p-4 text-xs text-muted">Loading state…</div></div>
    </div>
  );

  return (
    <div className="pb-10">
      <BroadcastHeaderBar title="Settings" subtitle="Difficulty · Legends · Seed" />
      <div className="p-4 space-y-4">
        <FocusCard title="Difficulty" subtitle="Margin for error, not stat cheating">
          <div className="grid grid-cols-3 gap-2">
            {["CASUAL","STANDARD","HARDCORE"].map(d => (
              <button key={d} className={"btn " + (state.meta.difficulty === d ? "border-accent bg-accent/20" : "")}
                onClick={() => saveMeta({ ...state.meta, difficulty: d })}
                disabled={saving}
              >
                {d}
              </button>
            ))}
          </div>
        </FocusCard>

        <FocusCard title="Legend Frequency" subtitle="Easter eggs as folklore, not gimmicks">
          <div className="grid grid-cols-3 gap-2">
            {["OFF","RARE","NORMAL"].map(l => (
              <button key={l} className={"btn " + (state.meta.legendFrequency === l ? "border-accent bg-accent/20" : "")}
                onClick={() => saveMeta({ ...state.meta, legendFrequency: l })}
                disabled={saving}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted mt-2">Legend generator stub exists; full rarity tiers + RAS reveal layer drops into /lib/draft.ts next.</div>
        </FocusCard>

        <FocusCard title="Seed" subtitle="Deterministic league generation">
          <div className="text-xs text-muted">Seed: {state.meta.seed}</div>
        </FocusCard>
      </div>
    </div>
  );
}
