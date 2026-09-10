"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from "lucide-react";

interface Props {
  value: string;         // current imageUrl (could be data URL or http URL)
  onChange: (url: string) => void;
  label?: string;
}

// Convert file to base64 data URL
function toDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function ImageUploadField({ value, onChange, label = "Course Image" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "url">(
    value && !value.startsWith("data:") ? "url" : "upload"
  );
  const [urlInput, setUrlInput] = useState(
    value && !value.startsWith("data:") ? value : ""
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }
    setUploading(true);
    try {
      const dataUrl = await toDataURL(file);
      onChange(dataUrl);
    } catch { alert("Failed to read image."); }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function applyUrl() {
    if (urlInput.trim()) onChange(urlInput.trim());
  }

  function clear() {
    onChange("");
    setUrlInput("");
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
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-navy" />
              Processing…
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-600">Click or drag image here</p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP — max 5 MB</p>
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

      {/* Preview */}
      {hasImage && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-40 object-cover"
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
