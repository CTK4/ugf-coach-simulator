"use client";

import { useEffect, useState } from "react";
import { USNNItem } from "@/lib/types";

function toneDot(tone: USNNItem["tone"]) {
  if (tone === "POSITIVE") return "bg-good";
  if (tone === "HOSTILE") return "bg-bad";
  return "bg-warn";
}

export function USNNFeed(props: { teamId?: string }) {
  const [items, setItems] = useState<USNNItem[]>([]);
  useEffect(() => {
    fetch("/api/state").then(r => r.json()).then(s => {
      const list: USNNItem[] = s.usnn ?? [];
      setItems(props.teamId ? list.filter(x => !x.teamId || x.teamId === props.teamId) : list);
    });
  }, [props.teamId]);

  return (
    <div className="card p-3">
      <div className="text-sm font-semibold">USNN Wire</div>
      <div className="mt-2 space-y-2">
        {items.slice(0, 8).map(it => (
          <div key={it.id} className="flex gap-2">
            <div className={`mt-1 h-2 w-2 rounded-full ${toneDot(it.tone)}`} />
            <div className="min-w-0">
              <div className="text-sm leading-snug">{it.headline}</div>
              {it.detail ? <div className="text-xs text-muted mt-0.5">{it.detail}</div> : null}
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-xs text-muted">No wire items yet.</div> : null}
      </div>
    </div>
  );
}
