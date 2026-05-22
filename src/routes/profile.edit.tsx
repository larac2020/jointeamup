import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/lib/profiles.functions";
import { experienceLevels, prPresets } from "@/lib/types";
import { ImageCropperModal } from "@/components/ImageCropperModal";
import { fileToDataUrl } from "@/lib/image-utils";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Edit profile — TeamUp" }] }),
  component: EditProfile,
});

const SPORTS = ["HYROX", "HYROX Doubles", "Turf Games", "CrossFit", "DEKA", "Spartan", "Running", "Rowing", "Triathlon"];

function EditProfile() {
  const { session, profile, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const updateFn = useServerFn(updateProfile);

  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [fromLoc, setFromLoc] = useState("");
  const [livesIn, setLivesIn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [superpower, setSuperpower] = useState("");
  const [kryptonite, setKryptonite] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [gyms, setGyms] = useState<string[]>([]);
  const [comps, setComps] = useState<string[]>([]);
  const [prs, setPrs] = useState<{ name: string; value: string }[]>([]);
  const [gymInput, setGymInput] = useState("");
  const [compInput, setCompInput] = useState("");
  const [prName, setPrName] = useState("");
  const [prValue, setPrValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Cropper state — when an image is picked we open the modal first.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"avatar" | "photo" | null>(null);

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const pickFile = async (file: File, target: "avatar" | "photo") => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Max 15MB"); return; }
    if (target === "photo" && photos.length >= 4) { toast.error("Up to 4 extra photos (5 total)"); return; }
    const src = await fileToDataUrl(file);
    setCropSrc(src);
    setCropTarget(target);
  };

  const uploadBlob = async (blob: Blob, kind: "avatar" | "photo") => {
    if (!session) return;
    const setBusy = kind === "avatar" ? setUploading : setUploadingPhoto;
    setBusy(true);
    try {
      const path = `${session.user.id}/${kind}-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      if (kind === "avatar") setAvatarUrl(data.publicUrl);
      else setPhotos((cur) => [...cur, data.publicUrl]);
      toast.success("Photo uploaded — don't forget to save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setCropSrc(null);
      setCropTarget(null);
    }
  };

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? "");
    setNickname(profile.nickname ?? "");
    setAge(profile.age ? String(profile.age) : "");
    setFromLoc(profile.from_location ?? "");
    setLivesIn(profile.lives_in ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setSuperpower(profile.superpower ?? "");
    setKryptonite(profile.kryptonite ?? "");
    setSports(profile.sports ?? []);
    setGyms(profile.gyms ?? []);
    setComps(profile.competitions ?? []);
    setPrs(profile.prs ?? []);
    setBio(profile.bio ?? "");
    setExperience(profile.experience ?? "");
    setLookingFor(profile.looking_for ?? "");
    setPhotos(profile.photos ?? []);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          first_name: firstName.trim(),
          nickname: nickname.trim() || null,
          age: age ? Number(age) : null,
          from_location: fromLoc.trim() || null,
          lives_in: livesIn.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          superpower: superpower.trim() || null,
          kryptonite: kryptonite.trim() || null,
          sports,
          gyms,
          competitions: comps,
          prs,
          bio: bio.trim() || null,
          experience: experience.trim() || null,
          looking_for: lookingFor.trim() || null,
          photos,
          onboarded: true,
        },
      }),
    onSuccess: async () => {
      await refresh();
      toast.success("Profile saved");
      if (session) navigate({ to: "/profile/$id", params: { id: session.user.id } });
    },
    onError: (e: any) => toast.error("Couldn't save", { description: e?.message }),
  });

  if (loading || !session) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/profile/$id" params={{ id: session.user.id }} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
        </Link>
        <h1 className="mt-3 font-display text-5xl tracking-wide">Edit profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your athlete card — keep it sharp.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!firstName.trim()) { toast.error("First name is required"); return; }
            if (sports.length === 0) { toast.error("Pick at least one sport"); return; }
            mutation.mutate();
          }}
          className="mt-6 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-muted-foreground">No photo</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f, "avatar"); e.target.value = ""; }}
              />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-accent disabled:opacity-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {avatarUrl && (
                <button type="button" onClick={() => setAvatarUrl("")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive">
                  Remove
                </button>
              )}
            </div>
          </div>

          <Group label={`Photo gallery (${photos.length}/4 extra)`}>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/80 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f, "photo"); e.target.value = ""; }}
                  />
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                    Add
                  </button>
                </>
              )}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Up to 4 extra photos appear in your scrollable gallery alongside your main photo.</p>
          </Group>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name *" value={firstName} onChange={setFirstName} />
            <Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Sledgehammer" />
            <Field label="Age" value={age} onChange={setAge} type="number" />
            <Field label="From" value={fromLoc} onChange={setFromLoc} placeholder="Paris, FR" />
            <Field label="Lives in" value={livesIn} onChange={setLivesIn} placeholder="Berlin, DE" />
            <Field label="Superpower" value={superpower} onChange={setSuperpower} placeholder="Sled push" />
            <Field label="Kryptonite" value={kryptonite} onChange={setKryptonite} placeholder="Wall balls" />
          </div>

          <Group label={`Bio (${bio.length}/600)`}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 600))}
              rows={4}
              placeholder="A couple sentences about you, your training, your goals…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
            />
          </Group>

          <Group label="Experience level">
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((lvl) => {
                const on = experience === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperience(on ? "" : lvl)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      on ? "bg-cool text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label={`Looking for (${lookingFor.length}/280)`}>
            <textarea
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value.slice(0, 280))}
              rows={2}
              placeholder="Doubles partner for HYROX Berlin, mixed team, weekend training crew…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
            />
          </Group>




          <Group label="Sports *">
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => {
                const on = sports.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSports(on ? sports.filter((x) => x !== s) : [...sports, s])}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      on ? "bg-warm text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label="Gyms">
            <TagList items={gyms} onRemove={(i) => setGyms(gyms.filter((_, idx) => idx !== i))} />
            <AddRow
              value={gymInput}
              setValue={setGymInput}
              placeholder="CrossFit Mitte"
              onAdd={() => { if (gymInput.trim()) { setGyms([...gyms, gymInput.trim()]); setGymInput(""); } }}
            />
          </Group>

          <Group label="Competitions completed">
            <TagList items={comps} onRemove={(i) => setComps(comps.filter((_, idx) => idx !== i))} />
            <AddRow
              value={compInput}
              setValue={setCompInput}
              placeholder="HYROX Berlin 2024"
              onAdd={() => { if (compInput.trim()) { setComps([...comps, compInput.trim()]); setCompInput(""); } }}
            />
          </Group>

          <Group label="Personal bests">
            <div className="space-y-2">
              {prs.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                  <span className="flex-1 text-sm font-semibold">{p.name}</span>
                  <span className="font-display text-lg tracking-wide">{p.value}</span>
                  <button type="button" onClick={() => setPrs(prs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick add — pick a movement, then enter your result</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prPresets.filter((preset) => !prs.some((p) => p.name === preset)).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrName(preset)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                    prName === preset ? "bg-warm text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={prName} onChange={(e) => setPrName(e.target.value)} placeholder="Lift / distance" className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
              <input value={prValue} onChange={(e) => setPrValue(e.target.value)} placeholder="Result" className="w-32 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
              <button
                type="button"
                onClick={() => {
                  if (prName.trim() && prValue.trim()) {
                    setPrs([...prs, { name: prName.trim(), value: prValue.trim() }]);
                    setPrName(""); setPrValue("");
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </Group>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-warm px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
      />
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TagList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {items.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {t}
          <button type="button" onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function AddRow({ value, setValue, placeholder, onAdd }: { value: string; setValue: (v: string) => void; placeholder: string; onAdd: () => void }) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
      />
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
