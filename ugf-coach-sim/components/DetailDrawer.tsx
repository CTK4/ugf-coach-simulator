"use client";

export function DetailDrawer(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={props.onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-panel shadow-soft max-h-[82vh] overflow-auto">
        <div className="p-4 border-b border-line">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{props.title}</div>
              {props.subtitle ? <div className="text-xs text-muted mt-0.5">{props.subtitle}</div> : null}
            </div>
            <button className="btn" onClick={props.onClose}>Close</button>
          </div>
        </div>
        <div className="p-4">{props.children}</div>
      </div>
    </div>
  );
}
