import { Link } from "@tanstack/react-router";

export function SearchTabs({ active }: { active: "competitions" | "athletes" }) {
  const cls = (on: boolean) => `rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${on ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`;
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1" role="tablist" aria-label="Search">
      <Link to="/feed" role="tab" aria-selected={active === "competitions"} className={cls(active === "competitions")}>Competitions</Link>
      <Link to="/athletes" role="tab" aria-selected={active === "athletes"} className={cls(active === "athletes")}>Athletes</Link>
    </div>
  );
}
