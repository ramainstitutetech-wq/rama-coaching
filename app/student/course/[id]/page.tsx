"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, FileText, Image as ImageIcon, Presentation, Type, Clock, CheckCircle2, BookOpen, Eye, ExternalLink } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video_youtube" | "video_drive" | "pdf" | "ppt" | "text" | "image";
  fileUrl?: string;
  content?: string;
  thumbnailUrl?: string;
  duration?: string;
  order: number;
}

interface CourseDetail { id: string; name: string; description: string; duration: string; fees: string; category: string; imageUrl?: string }

function youtubeEmbed(url: string) {
  try {
    const raw = url.trim();
    const u = new URL(raw);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1).split("?")[0].split("/")[0];
    else if (u.pathname.includes("/live/")) id = u.pathname.split("/live/")[1]?.split("?")[0].split("/")[0] || "";
    else if (u.pathname.includes("/shorts/")) id = u.pathname.split("/shorts/")[1]?.split("?")[0].split("/")[0] || "";
    else if (u.searchParams.get("v")) id = u.searchParams.get("v") || "";
    else if (u.pathname.includes("/embed/")) id = u.pathname.split("/embed/")[1]?.split("?")[0].split("/")[0] || "";
    // Fallback: try to extract 11-char ID from any youtube URL
    if (!id) {
      const m = raw.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (m) id = m[1];
    }
    if (id) {
      const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
      return `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&playsinline=1${origin}`;
    }
    return raw;
  } catch {
    // Fallback regex for malformed URLs
    const m = url.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?modestbranding=1&rel=0`;
    return url;
  }
}

function driveEmbed(url: string) {
  try {
    const m = url.trim().match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    // already preview or open?id=ID
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
    return url;
  } catch { return url; }
}

function absoluteUrl(path: string) {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (typeof window !== "undefined" && path.startsWith("/")) return window.location.origin + path;
  return path;
}

const TYPE_META: Record<string, { icon: any; label: string; color: string }> = {
  video_youtube: { icon: Play, label: "Video — YouTube", color: "bg-red-50 text-red-600 border-red-200" },
  video_drive: { icon: Play, label: "Video — Drive", color: "bg-blue-50 text-blue-600 border-blue-200" },
  pdf: { icon: FileText, label: "PDF", color: "bg-rose-50 text-rose-600 border-rose-200" },
  ppt: { icon: Presentation, label: "PPT", color: "bg-orange-50 text-orange-600 border-orange-200" },
  text: { icon: Type, label: "Text", color: "bg-slate-50 text-slate-600 border-slate-200" },
  image: { icon: ImageIcon, label: "Image", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

export default function StudentCourseLearnPage() {
  const { id } = useParams() as { id: string };
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiryText, setExpiryText] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const cJ = await fetch(`/api/courses/${id}`, { cache: "no-store" }).then(r=>r.json());
        if (cJ.success) {
          setCourse({ id: cJ.data.id, name: cJ.data.name, description: cJ.data.description, duration: cJ.data.duration, fees: cJ.data.fees, category: cJ.data.category, imageUrl: cJ.data.imageUrl });
          // expiry text from course access
          const days = cJ.data.accessDays;
          if (days === 0) setExpiryText("Lifetime Access");
          else if (days) {
            // try to get per-student expiry from enrollments
            try {
              const eJ = await fetch(`/api/enrollments/my`, { cache: "no-store" }).then(r=>r.json());
              const found = eJ?.data?.find((e:any)=> String(e.courseId)===String(id));
              if (found?.expiresAt) {
                const diff = new Date(found.expiresAt).getTime() - Date.now();
                if (diff <= 0) { setExpiryText("Expired"); setIsExpired(true); }
                else {
                  const d = Math.ceil(diff/86400000);
                  if (d <=7) setExpiryText(`Expires in ${d} day${d>1?"s":""}`);
                  else if (d<=30) setExpiryText(`Expires in ${Math.ceil(d/7)} weeks`);
                  else if (d<=365) setExpiryText(`Expires in ${Math.ceil(d/30)} months`);
                  else setExpiryText(`Expires in ${Math.ceil(d/365)} years`);
                }
              } else if (days) {
                setExpiryText(`Access: ${cJ.data.accessValue} ${cJ.data.accessUnit}${cJ.data.accessValue>1?"s":""}`);
              }
            } catch { setExpiryText(days===0?"Lifetime Access":`Access: ${days} days`); }
          }
        }
        const lJ = await fetch(`/api/courses/${id}/lessons`, { cache: "no-store" }).then(r=>r.json());
        if (lJ.success) {
          setLessons(lJ.data);
          if (lJ.data.length) setActiveId(lJ.data[0].id);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  const active = lessons.find(l=>l.id===activeId) || null;

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1F3354]" /></div>;

  if (!course) return <div className="py-16 text-center"><p>Course not found</p><Link href="/student" className="text-[#1F3354] underline">Back to My Courses</Link></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/student" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1F3354] border border-slate-200 rounded-full px-3 py-1.5 bg-white">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
          <BookOpen className="h-3.5 w-3.5" /> {course.name}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-6">
        {/* Main viewer */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isExpired ? (
              <div className="p-10 text-center">
                <Clock className="w-10 h-10 mx-auto text-red-300 mb-3" />
                <p className="text-sm font-semibold text-red-700">Course Expired</p>
                <p className="text-xs text-slate-500 mt-1">Your access for this course has ended. Please contact admin to renew access.</p>
                <Link href="/student" className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#1F3354] px-4 py-2 text-sm text-white">Back to My Courses</Link>
              </div>
            ) : !active ? (
              <div className="p-10 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-700">No lessons yet</p>
                <p className="text-xs text-slate-500 mt-1">Admin will upload video / PDF / PPT soon.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 line-clamp-1">{active.title}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border ${TYPE_META[active.type]?.color}`}>{(() => { const I=TYPE_META[active.type]?.icon; return I ? <I className="h-3 w-3" /> : null })()} {TYPE_META[active.type]?.label}</span>
                      {active.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{active.duration}</span>}
                    </p>
                  </div>
                  {active.fileUrl && active.type !== "text" && (
                    <a href={active.fileUrl} target="_blank" className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50"><ExternalLink className="h-3 w-3" /> Open</a>
                  )}
                </div>

                {/* Viewer by type — fully fixed for all formats */}
                <div className={active.type.includes("video") ? "bg-black" : "bg-white"}>
                  {active.type === "video_youtube" && active.fileUrl && (
                    <div className="aspect-video bg-black">
                      <iframe
                        src={youtubeEmbed(active.fileUrl)}
                        title={active.title}
                        className="w-full h-full"
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  )}
                  {active.type === "video_drive" && active.fileUrl && (
                    <div className="aspect-video bg-black">
                      <iframe src={driveEmbed(active.fileUrl)} title={active.title} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                    </div>
                  )}
                  {active.type === "pdf" && active.fileUrl && (
                    <div className="w-full bg-white">
                      {active.fileUrl.includes("drive.google.com") ? (
                        <iframe src={driveEmbed(active.fileUrl)} title={active.title} className="w-full h-[600px] bg-white" />
                      ) : (
                        <iframe src={absoluteUrl(active.fileUrl)} title={active.title} className="w-full h-[600px] bg-white" />
                      )}
                    </div>
                  )}
                  {active.type === "ppt" && active.fileUrl && (
                    <div className="w-full bg-white">
                      {active.fileUrl.includes("drive.google.com") ? (
                        <iframe src={driveEmbed(active.fileUrl)} title={active.title} className="w-full h-[600px] bg-white" />
                      ) : active.fileUrl.startsWith("/") ? (
                        <div className="p-8 text-center">
                          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-700 font-medium">PPT Preview</p>
                          <p className="text-xs text-slate-500 mt-1">PowerPoint local files cannot be previewed here. Please download to view.</p>
                          <a href={absoluteUrl(active.fileUrl)} download target="_blank" className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1F3354] px-4 py-2 text-sm text-white">Download PPT <ExternalLink className="h-3 w-3" /></a>
                        </div>
                      ) : (
                        <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl(active.fileUrl))}`} title={active.title} className="w-full h-[600px] bg-white" />
                      )}
                    </div>
                  )}
                  {active.type === "image" && active.fileUrl && (
                    <div className="bg-white p-2">
                      <img src={absoluteUrl(active.fileUrl)} alt={active.title} className="w-full max-h-[600px] object-contain bg-white mx-auto" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                    </div>
                  )}
                  {active.type === "text" && (
                    <div className="bg-white p-6 prose prose-sm max-w-none prose-slate">
                      <div dangerouslySetInnerHTML={{ __html: active.content || "<p>No content</p>" }} />
                    </div>
                  )}
                </div>
                {/* Single fallback bar */}
                {active.type !== "text" && active.fileUrl && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {active.type === "video_youtube" ? "If 'refused to connect', video owner blocked embed — use Open" : active.type === "pdf" ? "If PDF blank, use Open/Download" : "Tip: Fullscreen karke dekho"}
                    </p>
                    <a href={absoluteUrl(active.fileUrl)} target="_blank" className="shrink-0 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"><ExternalLink className="h-3 w-3" /> {active.type.includes("video") ? "Open" : "Download / Open"}</a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Course info + Expiry */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{course.name}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{course.description}</p>
              </div>
              {expiryText && <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${isExpired ? "bg-red-50 text-red-700 border-red-200" : expiryText.includes("Lifetime") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}><Clock className="h-3 w-3" />{expiryText}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border"><Clock className="h-3 w-3" />{course.duration}</span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border"><BookOpen className="h-3 w-3" />{course.category}</span>
            </div>
            {isExpired && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">This course has expired and has been removed from your active courses. Contact admin to renew.</p>}
          </div>
        </div>

        {/* Sidebar lessons */}
        <div className="lg:sticky lg:top-4 self-start">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#1F3354]" /> Lessons <span className="text-xs font-normal text-slate-500">— {lessons.length}</span></h3>
              <span className="text-[11px] text-slate-400">{active ? `Playing ${lessons.findIndex(l=>l.id===activeId)+1}/${lessons.length}` : ""}</span>
            </div>
            {lessons.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 border flex items-center justify-center mb-2"><FileText className="w-5 h-5 text-slate-400" /></div>
                <p className="text-sm font-medium text-slate-700">No lessons yet</p>
                <p className="text-xs text-slate-500 mt-1">Admin jaldi hi is course me video / PDF add karega.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[70vh] overflow-auto">
                {lessons.map((l, idx) => {
                  const isActive = l.id === activeId;
                  const Meta = TYPE_META[l.type];
                  const Icon = Meta?.icon || FileText;
                  return (
                    <button key={l.id} onClick={()=>!isExpired && setActiveId(l.id)} disabled={isExpired} className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isActive ? "bg-[#1F3354]/5 border-l-4 border-[#1F3354]" : "border-l-4 border-transparent"}`}>
                      <span className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? "bg-[#1F3354] text-white border-[#1F3354]" : Meta.color}`}>
                        {isActive ? <Play className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`text-sm leading-snug line-clamp-2 ${isActive ? "font-semibold text-[#1F3354]" : "font-medium text-slate-800"}`}>{idx+1}. {l.title}</span>
                        <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">{Meta.label}</span>
                          {l.duration && <><span className="h-1 w-1 rounded-full bg-slate-300" />{l.duration}</>}
                        </span>
                      </span>
                      {isActive && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">YouTube & Drive links free me, PDF/PPT/Image bhi yahi se view hoga.</p>
        </div>
      </div>
    </div>
  );
}


