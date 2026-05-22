import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, MessageSquare, Plus, User, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { unreadMessageCount } from "@/lib/messages.functions";
import { unreadNotificationCount } from "@/lib/notifications.functions";

const navItems = [
  { to: "/feed", label: "Browse" },
] as const;


export function Header() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const unreadMsgFn = useServerFn(unreadMessageCount);
  const unreadNotifFn = useServerFn(unreadNotificationCount);

  const msgQ = useQuery({
    queryKey: ["unread-messages"],
    queryFn: () => unreadMsgFn(),
    enabled: !!user,
  });
  const notifQ = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: () => unreadNotifFn(),
    enabled: !!user,
  });
  const profileQ = useQuery({
    queryKey: ["header-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("avatar_url, first_name").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });



  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("header-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["unread-messages"] }),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["unread-notifications"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const unreadMsg = msgQ.data ?? 0;
  const unreadNotif = notifQ.data ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary">
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
          {user && (
            <Link
              to="/listings/new"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-warm px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95"
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Post
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">

          {user && (
            <Link
              to="/listings/new"
              aria-label="Post a listing"
              className="grid h-10 w-10 place-items-center rounded-full bg-warm text-primary-foreground shadow-blaze hover:opacity-95 md:hidden"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
            </Link>
          )}

          {user ? (
            <>
              <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadNotif > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
              </Link>
              <Link to="/messages" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
                <MessageSquare className="h-5 w-5" />
                {unreadMsg > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadMsg}
                  </span>
                )}
              </Link>
              <Link
                to="/profile/$id"
                params={{ id: user.id }}
                className="ml-1 grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground hover:opacity-90"
              >
                {profileQ.data?.avatar_url ? (
                  <img src={profileQ.data.avatar_url} alt={profileQ.data.first_name ?? "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Link>

            </>
          ) : (
            <Link to="/login" className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
