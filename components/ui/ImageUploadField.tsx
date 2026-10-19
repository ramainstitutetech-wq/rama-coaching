"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  value: string;         // current imageUrl (could be data URL or http URL)
  onChange: (url: string) => void;
  label?: string;
  /**
   * Upload the file to the server (/api/upload) and keep only the returned URL.
   * When false (default) the file is inlined as a base64 data URL.
   */
  uploadToServer?: boolean;
  /** Preview fit — use "contain" to keep the whole image visible (signatures, stamps). */
  previewFit?: "cover" | "contain";
}

const MAX_SIZE_MB = 5;

// Convert file to base64 data URL
function toDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// Upload file to the server and return its public URL
async function uploadToStorage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.success || !j?.data?.url) {
    throw new Error(j?.error || "Upload failed. Please try again.");
  }
  return j.data.url as string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Course Image",
  uploadToServer = false,
  previewFit = "cover",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "url">(
    !uploadToServer && value && !value.startsWith("data:") ? "url" : "upload"
  );
  const [urlInput, setUrlInput] = useState(
    value && !value.startsWith("data:") ? value : ""
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleFile(file: File) {
    setStatus(null);
    if (!file.type.startsWith("image/")) {
      setStatus({ ok: false, message: "Please select an image file (PNG, JPG, WEBP)." });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus({ ok: false, message: `Image must be under ${MAX_SIZE_MB} MB.` });
      return;
    }
    setUploading(true);
    try {
      const url = uploadToServer ? await uploadToStorage(file) : await toDataURL(file);
      onChange(url);
      setUrlInput(url.startsWith("data:") ? "" : url);
      setStatus({ ok: true, message: "Uploaded successfully." });
    } catch (e) {
      setStatus({ ok: false, message: e instanceof Error ? e.message : "Upload failed. Please try again." });
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function applyUrl() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setStatus({ ok: true, message: "Image URL added." });
    }
  }

  function clear() {
    onChange("");
    setUrlInput("");
    setStatus(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const hasImage = !!value?.trim();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      {/* Tab switcher */}
      <div className="flex rounded border border-slate-200 overflow-hidden w-fit">
        <button type="button" onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${tab === "upload" ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          <Upload className="h-3.5 w-3.5" /> Upload File
        </button>
        <button type="button" onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${tab === "url" ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          <LinkIcon className="h-3.5 w-3.5" /> Image URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer py-5 transition-colors ${
            dragOver ? "border-navy bg-navy/5" : "border-slate-300 hover:border-navy hover:bg-slate-50"
          }`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-navy" />
              Uploading…
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-600">Click or drag image here</p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP — max {MAX_SIZE_MB} MB</p>
            </>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            onKeyDown={e => e.key === "Enter" && applyUrl()}
          />
          <button type="button" onClick={applyUrl}
            className="rounded-lg bg-navy px-3 py-2 text-xs font-medium text-white hover:bg-navy-deep transition-colors">
            Apply
          </button>
        </div>
      )}

      {/* Upload status */}
      {status ? (
        <p className={`flex items-start gap-1.5 text-xs font-medium ${status.ok ? "text-emerald-600" : "text-red-600"}`}>
          {status.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          {status.message}
        </p>
      ) : null}

      {/* Preview */}
      {hasImage && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt="Preview" className={`w-full h-40 ${previewFit === "contain" ? "object-contain p-2" : "object-cover"}`}
            onError={e => { (e.currentTarget as HTMLImageElement).src = ""; }} />
          <button type="button" onClick={clear}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
            title="Remove image">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">
            <ImageIcon className="h-3 w-3" />
            {value.startsWith("data:") ? "Uploaded file" : "Image URL"}
          </div>
        </div>
      )}
    </div>
  );
}
