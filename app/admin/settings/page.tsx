"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Upload, Info, PenTool } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
// settings from API
import type { InstituteSettings } from "@/data/types";

const TABS = [
  { key: "info", label: "Institute Information" },
  { key: "social", label: "Social Media" },
  { key: "website", label: "Website" },
  { key: "signatures", label: "Signatures" },
];

const URL_FIELDS: { key: keyof InstituteSettings; label: string }[] = [
  { key: "facebook", label: "Facebook URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "linkedin", label: "LinkedIn URL" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("info");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<InstituteSettings>({ instituteName: "", phone: "", email: "", address: "", website: "", facebook: "", instagram: "", youtube: "", linkedin: "", footerText: "", secretarySignatureUrl: "", controllerSignatureUrl: "", stampUrl: "" });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof InstituteSettings, string>>>({});

  useEffect(() => { fetch("/api/settings", { cache: "no-store" }).then(r=>r.json()).then(j=>{ if(j.success) { const d=j.data; setForm({ instituteName: d.instituteName||"", phone: d.phone||"", email: d.email||"", address: d.address||"", website: d.website||"", facebook: d.facebook||"", instagram: d.instagram||"", youtube: d.youtube||"", linkedin: d.linkedin||"", footerText: d.footerText||"", secretarySignatureUrl: d.secretarySignatureUrl||"", controllerSignatureUrl: d.controllerSignatureUrl||"", stampUrl: d.stampUrl||"" }); } }).finally(()=>setLoading(false)); }, []);

  function update(key: keyof InstituteSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSave() {
    const next: Partial<Record<keyof InstituteSettings, string>> = {};
    if (!form.instituteName.trim()) next.instituteName = "Institute name is required.";
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (form.website && !/^https?:\/\/.+/.test(form.website))
      next.website = "Enter a valid URL (https://...).";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      try {
        const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const j = await res.json();
        if (j.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
        else { setErrors({ instituteName: j.error || "Failed" }); }
      } catch { setErrors({ instituteName: "Network error" }); }
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your institute profile, social links and website content."
        actions={
          saved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Settings saved (demo)
            </span>
          ) : null
        }
      />

      <Card className="p-0">
        <div className="px-5 pt-3">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div className="p-5">
          {tab === "info" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Institute Name" required error={errors.instituteName}>
                  <TextInput
                    value={form.instituteName}
                    error={errors.instituteName}
                    onChange={(e) => update("instituteName", e.target.value)}
                    placeholder="Rama Coaching Center"
                  />
                </Field>
              </div>
              <Field label="Phone" required error={errors.phone}>
                <TextInput
                  value={form.phone}
                  error={errors.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 0000000000"
                />
              </Field>
              <Field label="Email" required error={errors.email}>
                <TextInput
                  type="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="info@example.com"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" required error={errors.address}>
                  <TextInput
                    value={form.address}
                    error={errors.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Street, City, State, PIN"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Website" error={errors.website}>
                  <TextInput
                    value={form.website}
                    error={errors.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === "social" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {URL_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <TextInput
                    type="url"
                    value={form[f.key] as string}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={`https://${f.key}.com/...`}
                  />
                </Field>
              ))}
            </div>
          )}

          {tab === "website" && (
            <div className="space-y-4">
              <Field label="Footer Text">
                <TextArea
                  rows={3}
                  value={form.footerText}
                  onChange={(e) => update("footerText", e.target.value)}
                  placeholder="© Your Institute. All Rights Reserved."
                />
              </Field>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Logo / Favicon
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <input
                    type="file"
                    disabled
                    className="block w-full cursor-not-allowed text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-slate-500"
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Info className="h-3.5 w-3.5" />
                  Upload disabled in frontend demo
                </p>
              </div>
            </div>
          )}

          {tab === "signatures" && (
            <div className="space-y-6">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">Ye signatures Certificate aur Marksheet pe ayenge. Marksheet me sirf <strong>Secretary</strong> ka signature dikhega, Certificate me <strong>Secretary + Controller</strong> dono. PNG transparent best hai.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="h-4 w-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Secretary Signature</label>
                  </div>
                  <ImageUploadField label="" value={form.secretarySignatureUrl || ""} onChange={(url) => setForm(prev => ({ ...prev, secretarySignatureUrl: url }))} />
                  <p className="text-xs text-slate-500 mt-1">Marksheet + Certificate dono me dikhega</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="h-4 w-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Controller Of Examination Signature</label>
                  </div>
                  <ImageUploadField label="" value={form.controllerSignatureUrl || ""} onChange={(url) => setForm(prev => ({ ...prev, controllerSignatureUrl: url }))} />
                  <p className="text-xs text-slate-500 mt-1">Sirf Certificate me dikhega (Marksheet me nahi)</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Stamp (Optional)</label>
                <ImageUploadField label="" value={form.stampUrl || ""} onChange={(url) => setForm(prev => ({ ...prev, stampUrl: url }))} />
                <p className="text-xs text-slate-500 mt-1">Certificate ke beech me watermark ke liye</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Save Changes
            </button>
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Settings saved (demo)
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
