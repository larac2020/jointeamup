import { Link } from "@tanstack/react-router";
import { Bell, MessageSquare, Search, User, Zap } from "lucide-react";

const navItems = [
  { to: "/feed", label: "Feed" },
  { to: "/search", label: "Search" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm shadow-blaze">
            <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-2xl tracking-wide">TeamUp</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground md:hidden">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-magenta" />
          </Link>
          <Link to="/messages" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-magenta px-1 text-[10px] font-bold text-magenta-foreground">3</span>
          </Link>
          <Link
            to="/profile/$id"
            params={{ id: "a1" }}
            className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-warm text-primary-foreground shadow-sm hover:opacity-90"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
