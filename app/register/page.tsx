"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Lock, Eye, EyeOff, Upload, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, FileText, Image as ImageIcon } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

interface CourseOpt { id: string; name: string }

const STEPS = [
  { id: 1, label: "Basic Details", desc: "Name, DOB, Contact" },
  { id: 2, label: "Education & ID", desc: "Qualification, Aadhaar" },
  { id: 3, label: "Create Password", desc: "Login password" },
  { id: 4, label: "Documents", desc: "Optional uploads" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string}|null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [parentName, setParentName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("General");
  const [religion, setReligion] = useState("");
  const [visibleMark, setVisibleMark] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cityName, setCityName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batch, setBatch] = useState("Morning-A");

  // Step 2
  const [qualification, setQualification] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [apaarId, setApaarId] = useState("");

  // Step 3
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 4 - files
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState("");
  const [marksheetUrl, setMarksheetUrl] = useState("");
  const [marksheet10Url, setMarksheet10Url] = useState("");
  const [marksheet12Url, setMarksheet12Url] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses?limit=100").then(r=>r.json()).then(j=>{
      if(j.success) setCourses(j.data.map((c:any)=>({id:c.id, name:c.name})));
    }).finally(()=>setLoadingCourses(false));
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, setter: (v:string)=>void, key: string) {
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method:"POST", body: fd }).then(r=>r.json());
      if(res.success) setter(res.data.url);
      else setMsg({type:"err", text: res.error || "Upload failed"});
    } catch { setMsg({type:"err", text:"Upload error"}); }
    setUploading(null);
  }

  function validateStep(s: number) {
    if(s===1){
      if(!fullName.trim() || !email.trim() || !phone.trim() || !courseId) return "Name, Email, Phone, Course required";
      if(!motherName.trim()) return "Mother's Name is required";
      if(!religion) return "Religion is required";
      if(!visibleMark.trim()) return "Visible Mark is required";
      if(!address.trim() || !cityName.trim()) return "Address and City are required";
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Invalid email";
      if(phone.length < 10) return "Invalid phone";
    }
    if(s===2){
      if(aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber.replace(/\s/g,""))) return "Aadhaar must be 12 digits";
    }
    if(s===3){
      if(!password || password.length < 6) return "Password min 6 chars";
      if(password !== confirmPassword) return "Passwords do not match";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if(err){ setMsg({type:"err", text: err}); return; }
    setMsg(null);
    setStep(s=>Math.min(4, s+1));
  }
  function prev(){ setMsg(null); setStep(s=>Math.max(1, s-1)); }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    const err = validateStep(3);
    if(err){ setMsg({type:"err", text: err}); setStep(3); return; }
    // Also validate step 1 required new fields before final submit
    const err1 = validateStep(1);
    if(err1){ setMsg({type:"err", text: err1}); setStep(1); return; }
    setSubmitting(true);
    setMsg(null);
    try {
      const combinedAddress = [address, cityName].filter(Boolean).join(", ");
      const res = await fetch("/api/register", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          fullName, parentName, motherName, dob, gender, category, religion, visibleMark,
          phone, email, address: combinedAddress, addressLine1: address, cityName, courseId, batch,
          qualification, passingYear, aadhaarNumber: aadhaarNumber.replace(/\s/g,""), apaarId,
          password, confirmPassword,
          aadhaarCardUrl, marksheetUrl: marksheet10Url || marksheetUrl, marksheet10Url, marksheet12Url, photoUrl, signatureUrl, thumbUrl,
        }),
      }).then(r=>r.json());
      if(!res.success){ setMsg({type:"err", text: res.error || "Registration failed"}); }
      else { setSuccess(true); }
    } catch { setMsg({type:"err", text:"Network error"}); }
    setSubmitting(false);
  }

  if(success){
    return (
      <>
        <SiteNav />
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Registration Submitted!</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">Your registration request has been sent to the admin. Once the admin activates your account, a welcome email with your login credentials will be sent to <strong>{email}</strong>.</p>
            <p className="text-xs text-slate-500 mt-3">Status: <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending Approval</span></p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/" className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm">Back to Home</Link>
              <Link href="/login" className="px-5 py-2.5 rounded-lg bg-[#1F3354] text-white text-sm">Go to Login</Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <section className="bg-[#1F3354] py-8 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-2xl font-bold">Student Registration</h1>
          <p className="text-slate-300 text-sm mt-1">Create your student account — admin approval ke baad login active hoga</p>
        </div>
      </section>

      <section className="py-8 px-4 bg-slate-50 min-h-[70vh]">
        <div className="max-w-3xl mx-auto">
          {/* Step indicator */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx)=>(
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${step >= s.id ? "bg-[#1F3354] text-white border-[#1F3354]" : "bg-white text-slate-400 border-slate-200"}`}>{step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}</div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-semibold ${step >= s.id ? "text-[#1F3354]" : "text-slate-400"}`}>{s.label}</p>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                  {idx < STEPS.length-1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-[#1F3354]" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          {msg && <div className={`mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${msg.type==="ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{msg.type==="ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{msg.text}</div>}

          <form onSubmit={(e)=>e.preventDefault()} onKeyDown={(e)=>{ if(e.key==="Enter") e.preventDefault(); }} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Step 1 — Applicant & Personal Details (2.1 - 2.10, 7.6) */}
            {step===1 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><User className="w-4 h-4 text-[#1F3354]" /> Applicant Details <span className="text-xs font-normal text-slate-500">— 2.1 to 2.10</span></h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">2.1 Applicant&apos;s full name / आवेदक का पूरा नाम *</label>
                    <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">2.2.1 Father&apos;s Name / पिता का नाम *</label>
                    <input value={parentName} onChange={e=>setParentName(e.target.value)} placeholder="Father's name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">2.2.2 Mother&apos;s Name / माता का नाम *</label>
                    <input value={motherName} onChange={e=>setMotherName(e.target.value)} placeholder="Mother's name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 2.4 Date of Birth / जन्म दिनांक *</label>
                    <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">2.3 Gender / लिंग *</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">2.6 Category / वर्ग *</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                      <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">2.10 Religion / धर्म *</label>
                    <select value={religion} onChange={e=>setReligion(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                      <option value="">Select</option><option>Hindu</option><option>Muslim</option><option>Sikh</option><option>Christian</option><option>Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">7.6 Visible Distinguishing Mark / स्पष्ट पहचान चिन्ह *</label>
                    <input value={visibleMark} onChange={e=>setVisibleMark(e.target.value)} placeholder="e.g. Mole on right cheek" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                    <p className="text-[11px] text-slate-500 mt-1">Image should not be blurred or smudged.</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700">3. Contact Details / संपर्क विवरण</h4>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Mobile Number / मोबाइल नंबर *</label>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address / ईमेल पता *</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@gmail.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700">4. Permanent Address Details / स्थायी पता विवरण</h4>
                  <div>
                    <label className="text-sm font-medium">4.1 Address / पता *</label>
                    <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="House No, Street, Locality, Area, Landmark" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354] resize-none" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">4.2 City Name / शहर का नाम *</label>
                      <input value={cityName} onChange={e=>setCityName(e.target.value)} placeholder="City" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1F3354]" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Batch</label>
                      <select value={batch} onChange={e=>setBatch(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                        <option>Morning-A</option><option>Morning-B</option><option>Evening-A</option><option>Evening-B</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Course *</label>
                    <select value={courseId} onChange={e=>setCourseId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                      <option value="">{loadingCourses ? "Loading..." : "Select Course"}</option>
                      {courses.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step===2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#1F3354]" /> Education & Identification</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Qualification</label>
                    <select value={qualification} onChange={e=>setQualification(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                      <option value="">Select</option>
                      <option>10th</option><option>12th</option><option>Graduate</option><option>Post Graduate</option><option>Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Passing Year</label>
                    <input value={passingYear} onChange={e=>setPassingYear(e.target.value)} placeholder="e.g. 2023" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Aadhaar Number</label>
                    <input value={aadhaarNumber} onChange={e=>setAadhaarNumber(e.target.value)} placeholder="12 digits" maxLength={12} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">APAAR ID</label>
                    <input value={apaarId} onChange={e=>setApaarId(e.target.value)} placeholder="APAAR ID" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step===3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Lock className="w-4 h-4 text-[#1F3354]" /> Create Password</h3>
                <p className="text-xs text-slate-500">Ye password aap Student Portal login ke liye use karenge. Admin ke approve ke baad email me bhi ayega.</p>
                <div>
                  <label className="text-sm font-medium">Create Password *</label>
                  <div className="relative mt-1">
                    <input type={showPass ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#1F3354]" />
                    <button type="button" tabIndex={-1} aria-label={showPass ? "Hide password" : "Show password"} onMouseDown={(e)=>e.preventDefault()} onClick={()=>setShowPass(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer flex items-center justify-center z-10">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <div className="relative mt-1">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#1F3354]" />
                    <button type="button" tabIndex={-1} aria-label={showConfirm ? "Hide password" : "Show password"} onMouseDown={(e)=>e.preventDefault()} onClick={()=>setShowConfirm(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer flex items-center justify-center z-10">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
              </div>
            )}

            {step===4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1F3354]" /> Document Upload (Optional)</h3>
                <p className="text-xs text-slate-500">Bina upload ke bhi submit kar sakte hain. Baad me admin documents view kar sakta hai.</p>
                {[
                  { key:"aadhaarCard", label:"Aadhaar Card", setter:setAadhaarCardUrl, value:aadhaarCardUrl, icon: FileText },
                  { key:"marksheet10", label:"10th Marksheet", setter:setMarksheet10Url, value:marksheet10Url, icon: GraduationCap },
                  { key:"marksheet12", label:"12th Marksheet", setter:setMarksheet12Url, value:marksheet12Url, icon: GraduationCap },
                  { key:"photo", label:"Photo", setter:setPhotoUrl, value:photoUrl, icon: ImageIcon },
                  { key:"signature", label:"Signature", setter:setSignatureUrl, value:signatureUrl, icon: FileText },
                  { key:"thumb", label:"Thumb Impression", setter:setThumbUrl, value:thumbUrl, icon: FileText },
                ].map(f=>{
                  const Icon=f.icon;
                  const isImage = f.value && /\.(jpg|jpeg|png|webp)$/i.test(f.value);
                  return (
                    <div key={f.key} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {isImage ? <img src={f.value} alt={f.label} className="w-full h-full object-cover" /> : <Icon className="w-4 h-4 text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{f.label}</p>
                        <p className="text-xs text-slate-500 truncate">{f.value ? "Uploaded ✓ " + f.value.split("/").pop() : "Optional — no file"}</p>
                        {isImage && <img src={f.value} alt="preview" className="mt-2 h-16 w-16 rounded border object-cover" />}
                      </div>
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-slate-50">
                        <Upload className="w-3 h-3" /> {uploading===f.key ? "Uploading…" : f.value ? "Change" : "Upload"}
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e)=>handleFile(e, f.setter, f.key)} />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step>1 ? <button type="button" onClick={prev} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"><ArrowLeft className="w-4 h-4" /> Previous</button> : <span />}
              {step<4 ? <button type="button" onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-[#1F3354] text-white px-5 py-2 text-sm hover:bg-[#162640]">Next <ArrowRight className="w-4 h-4" /></button>
              : <button type="button" onClick={(e)=>handleSubmit(e as any)} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">{submitting ? <><span className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</> : <><CheckCircle2 className="w-4 h-4" /> Submit Registration</>}</button>}
            </div>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">Already have account? <Link href="/login" className="text-[#1F3354] font-medium hover:underline">Login</Link></p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
