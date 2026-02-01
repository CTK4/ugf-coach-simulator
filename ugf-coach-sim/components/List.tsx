"use client";

export function List(props: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      {props.title ? <div className="px-4 pt-4 pb-2 text-sm font-semibold">{props.title}</div> : null}
      <div className="px-4">{props.children}</div>
    </div>
  );
}

export function ListRow(props: { left: React.ReactNode; right?: React.ReactNode; onClick?: () => void }) {
  const Cmp: any = props.onClick ? "button" : "div";
  return (
    <Cmp onClick={props.onClick} className={"row w-full text-left " + (props.onClick ? "active:opacity-90" : "")}>
      <div className="min-w-0">{props.left}</div>
      {props.right ? <div className="text-right">{props.right}</div> : null}
    </Cmp>
  );
}
