"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Building2, Award, Users, TrendingUp, Check, Phone, Mail, MapPin,
  ArrowRight, Upload, X, FileText, Calendar, Clock,
} from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

// ─── Upload helper (base64 approach — no storage service needed) ──────────────
async function encodeFileAsDataURL(file: File): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Franchise Application Form ───────────────────────────────────────────────
function FranchiseForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name:          "",
    ownerName:     "",
    instituteName: "",
    email:         "",
    phone:         "",
    city:          "",
    state:         "",
    duration:      "",
    startDate:     "",
    endDate:       "",
    message:       "",
  });
  const [docFile,    setDocFile]    = useState<File | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const inp = "w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none";

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())          e.name          = "Applicant name is required";
    if (!form.ownerName.trim())     e.ownerName     = "Owner name is required";
    if (!form.instituteName.trim()) e.instituteName = "Institute name is required";
    if (!form.email.trim())         e.email         = "Email is required";
    if (!form.phone.trim())         e.phone         = "Phone is required";
    if (!form.city.trim())          e.city          = "City is required";
    if (!form.state.trim())         e.state         = "State is required";
    if (!form.duration.trim())      e.duration      = "Duration is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let documentUrl  = "";
      let documentName = "";

      // Encode document as base64 if provided
      if (docFile) {
        setUploading(true);
        const encoded = await encodeFileAsDataURL(docFile);
        documentUrl  = encoded.url;
        documentName = encoded.name;
        setUploading(false);
      }

      const res = await fetch("/api/franchise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, documentUrl, documentName }),
      });
      const j = await res.json();
      if (j.success) {
        setDone(true);
        setForm({ name:"", ownerName:"", instituteName:"", email:"", phone:"", city:"", state:"", duration:"", startDate:"", endDate:"", message:"" });
        setDocFile(null);
        setTimeout(() => setDone(false), 6000);
      } else {
        alert(j.error || "Submission failed");
      }
    } catch { alert("Network error. Please try again."); }
    finally { setLoading(false); setUploading(false); }
  }

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-red-600 mt-1">{errors[field]}</p> : null;

  return (
    <form onSubmit={handle} className="space-y-5">
      {done && (
        <div className="bg-green-50 border border-green-200 rounded px-4 py-3 flex items-start gap-2 text-sm text-green-800">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Application submitted successfully!</p>
            <p className="text-xs text-green-700 mt-0.5">We will review your proposal and contact you within 2–3 business days.</p>
          </div>
        </div>
      )}

      {/* Section: Applicant */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Applicant Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input placeholder="Your Full Name *" value={form.name} onChange={e => set("name", e.target.value)} className={inp} />
            <Err field="name" />
          </div>
          <div>
            <input placeholder="Owner Name *" value={form.ownerName} onChange={e => set("ownerName", e.target.value)} className={inp} />
            <Err field="ownerName" />
          </div>
          <div>
            <input type="email" placeholder="Email Address *" value={form.email} onChange={e => set("email", e.target.value)} className={inp} />
            <Err field="email" />
          </div>
          <div>
            <input placeholder="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} />
            <Err field="phone" />
          </div>
        </div>
      </div>

      {/* Section: Institute */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Institute Information</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <input placeholder="Institute / Center Name *" value={form.instituteName} onChange={e => set("instituteName", e.target.value)} className={inp} />
            <Err field="instituteName" />
          </div>
          <div>
            <input placeholder="City *" value={form.city} onChange={e => set("city", e.target.value)} className={inp} />
            <Err field="city" />
          </div>
          <div>
            <input placeholder="State *" value={form.state} onChange={e => set("state", e.target.value)} className={inp} />
            <Err field="state" />
          </div>
        </div>
      </div>

      {/* Section: Franchise Period */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Franchise Period</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <select value={form.duration} onChange={e => set("duration", e.target.value)} className={inp}>
              <option value="">Select Duration *</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
              <option value="5 Years">5 Years</option>
            </select>
            <Err field="duration" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Start Date
            </label>
            <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> End Date
            </label>
            <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inp} />
          </div>
        </div>
      </div>

      {/* Section: Documents */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Documents</p>
        <div
          className={`relative border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-colors ${
            docFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-red-400 hover:bg-red-50/30"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={e => setDocFile(e.target.files?.[0] || null)}
          />
          {docFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-800 truncate max-w-xs">{docFile.name}</span>
              <button type="button" onClick={e => { e.stopPropagation(); setDocFile(null); }} className="ml-1 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload document</p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 5 MB)</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1.5">Upload: ID proof, address proof, or any supporting document</p>
      </div>

      {/* Message */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Additional Message</p>
        <textarea
          rows={4}
          placeholder="Tell us about yourself, your experience, and why you want to open this center..."
          value={form.message}
          onChange={e => set("message", e.target.value)}
          className={inp}
        />
      </div>

      <button
        disabled={loading || uploading}
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? "Uploading document…" : loading ? "Submitting…" : (
          <><ArrowRight className="w-4 h-4" /> Submit Franchise Application</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        After submission, our team will review and contact you within 2–3 business days.
      </p>
    </form>
  );
}

export default function FranchisePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 py-14">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">Franchise Opportunity</h1>
          <p className="text-base text-red-100 mb-6">Join Our Growing Network of Computer Education Centers</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { val: "55+", label: "Active Centers" },
              { val: "50+", label: "Districts Covered" },
              { val: "100%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 px-6 py-3 rounded">
                <div className="text-2xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-red-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Why Partner With Rama Coaching Center?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Building2, color: "bg-red-50 border-red-200 text-red-600", title: "Established Brand", desc: "10+ years of trusted brand recognition in computer education" },
              { icon: Award, color: "bg-blue-50 border-blue-200 text-blue-600", title: "Proven Model", desc: "Tested business model with high success rate across UP" },
              { icon: Users, color: "bg-green-50 border-green-200 text-green-600", title: "Full Support", desc: "Complete training, marketing, and operational support" },
              { icon: TrendingUp, color: "bg-yellow-50 border-yellow-200 text-yellow-600", title: "High Returns", desc: "Lucrative business opportunity with excellent ROI potential" },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-xl border ${item.color.split(" ")[1]}`} style={{ background: "" }}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${item.color.split(" ")[0]}`}>
                  <item.icon className={`w-5 h-5 ${item.color.split(" ")[2]}`} />
                </div>
                <h3 className="font-medium text-gray-800 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Investment */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Franchise Benefits</h2>
              <div className="space-y-4">
                {[
                  { title: "Brand Recognition", desc: "Leverage our established brand name and reputation" },
                  { title: "Complete Training", desc: "Comprehensive training for center management and faculty" },
                  { title: "Marketing Support", desc: "Marketing materials, advertising strategies, and promotional support" },
                  { title: "Curriculum & Study Material", desc: "Access to updated curriculum and comprehensive study materials" },
                  { title: "Technical Support", desc: "Ongoing technical support and software assistance" },
                  { title: "Student Management System", desc: "Access to our proprietary student management and verification system" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-700 p-7 rounded-xl text-white">
              <h3 className="text-xl font-semibold mb-5">Investment Details</h3>
              <div className="space-y-3">
                {[
                  { label: "Franchise Fee", val: "₹50,000 – ₹1,00,000" },
                  { label: "Infrastructure Investment", val: "₹2,00,000 – ₹5,00,000" },
                  { label: "Expected ROI", val: "40% – 60% annually" },
                  { label: "Break-even Period", val: "6 – 12 months" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 px-4 py-3 rounded">
                    <div className="text-xs text-red-100 mb-0.5">{item.label}</div>
                    <div className="text-lg font-semibold">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Franchise Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Building2, color: "bg-red-100 text-red-600", title: "Space Requirement", desc: "Minimum 500 sq. ft. commercial space in prime location" },
              { icon: Users, color: "bg-blue-100 text-blue-600", title: "Staff Requirements", desc: "Minimum 2–3 qualified instructors and 1 administrative staff" },
              { icon: Award, color: "bg-green-100 text-green-600", title: "Infrastructure", desc: "15–20 computers, internet connection, basic furniture" },
              { icon: TrendingUp, color: "bg-yellow-100 text-yellow-600", title: "Investment Capacity", desc: "Minimum investment of ₹3–5 lakhs including franchise fee" },
              { icon: Phone, color: "bg-purple-100 text-purple-600", title: "Business Experience", desc: "Prior business or educational experience preferred" },
              { icon: Award, color: "bg-pink-100 text-pink-600", title: "Commitment", desc: "Full-time commitment to run and manage the center" },
            ].map((item) => (
              <div key={item.title} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Apply for Franchise</h2>
            <FranchiseForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-r from-red-700 to-red-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to Start Your Own Computer Education Center?</h2>
          <p className="text-base text-red-100 mb-7">Join our successful franchise network and become part of the computer education revolution</p>
          <Link href="tel:08299121689" className="inline-flex items-center px-7 py-3 bg-yellow-500 text-gray-900 rounded font-medium hover:bg-yellow-600 transition-colors">
            Call: 08299121689
          </Link>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Contact Us for Franchise Inquiry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Phone, color: "text-red-600", title: "Phone", content: <Link href="tel:08299121689" className="text-red-600 hover:text-red-700 text-sm">08299121689</Link> },
              { icon: Mail, color: "text-blue-600", title: "Email", content: <Link href="mailto:franchise@ramacoaching.com" className="text-red-600 hover:text-red-700 text-sm break-all">franchise@ramacoaching.com</Link> },
              { icon: MapPin, color: "text-green-600", title: "Address", content: <p className="text-gray-500 text-sm">Fatehpur, Uttar Pradesh 212601</p> },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-3`} />
                <h3 className="font-medium text-gray-800 mb-2">{item.title}</h3>
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
