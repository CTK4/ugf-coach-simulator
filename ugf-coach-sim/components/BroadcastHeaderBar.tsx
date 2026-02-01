"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BroadcastHeaderBar(props: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Week Hub" },
    { href: "/gameday", label: "Game Day" },
    { href: "/frontoffice", label: "Front Office" },
    { href: "/filmroom", label: "Film" },
  ];
  return (
    <div className="sticky top-0 z-50 border-b border-line bg-black/60 backdrop-blur">
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted tracking-[0.25em]">USNN</div>
          <div className="text-lg font-semibold leading-tight">{props.title}</div>
          {props.subtitle ? <div className="text-xs text-muted mt-0.5">{props.subtitle}</div> : null}
        </div>
        <div className="pt-1">{props.right}</div>
      </div>
      <div className="px-2 pb-2 overflow-x-auto">
        <div className="flex gap-2">
          {tabs.map(t => (
            <Link key={t.href} href={t.href}
              className={[
                "chip whitespace-nowrap",
                pathname === t.href ? "border-accent bg-accent/20" : "opacity-90"
              ].join(" ")}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
