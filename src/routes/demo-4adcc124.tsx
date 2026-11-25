import { createFileRoute } from "@tanstack/react-router";
import scenes from "@/assets/videos/teamup_demo_scenes.mp4.asset.json";

const videos: { title: string; url: string }[] = [
  { title: "Generated scenes", url: scenes.url },
];

export const Route = createFileRoute("/demo-4adcc124")({
  head: () => ({
    meta: [
      { title: "TeamUp demo videos" },
      { name: "description", content: "Private TeamUp demo videos." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "TeamUp demo videos" },
      { property: "og:description", content: "Private TeamUp demo videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-5xl tracking-wide">TeamUp demo</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {videos.map((v) => (
            <figure key={v.url} className="rounded-3xl border border-border bg-card p-4 shadow-card">
              <video src={v.url} controls playsInline className="w-full rounded-2xl" />
              <figcaption className="mt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">{v.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
