import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Loader2, X } from "lucide-react";
import { cropAndCompress, type Area } from "@/lib/image-utils";

interface Props {
  imageSrc: string;
  aspect: number; // e.g. 1 for avatar, 4/5 for portrait gallery
  title?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  maxSize?: number; // longest side in px
}

export function ImageCropperModal({ imageSrc, aspect, title = "Adjust photo", onCancel, onConfirm, maxSize = 1600 }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleConfirm = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const blob = await cropAndCompress(imageSrc, area, maxSize, 0.9);
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-xl tracking-wide">{title}</h2>
          <button onClick={onCancel} disabled={busy} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[60vh] max-h-[480px] w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            objectFit="contain"
          />
        </div>

        <div className="space-y-3 border-t border-border px-5 py-4">
          <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Zoom
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-foreground"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">Drag to reposition. Pinch / scroll to zoom. We compress to keep it crisp.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={busy} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-accent disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={busy || !area} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-warm px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Use photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
