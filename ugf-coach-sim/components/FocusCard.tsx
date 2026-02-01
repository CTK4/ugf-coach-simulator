"use client";
export function FocusCard(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-sm font-semibold">{props.title}</div>
      {props.subtitle ? <div className="text-xs text-muted mt-0.5">{props.subtitle}</div> : null}
      <div className="mt-3">{props.children}</div>
    </div>
  );
}
