"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText, Users, Menu, X, MapPin, Phone, ClipboardList,
  NotebookText, BookOpen, ChevronDown, GraduationCap, Award,
  ShieldCheck, ClipboardCheck, LogOut, LayoutDashboard,
} from "lucide-react";

// ── Dropdown config ───────────────────────────────────────────────────────────
const DROPDOWN_ITEMS = [
  {
    label: "Study Material",
    items: [
      { href: "/mock-test", icon: ClipboardList, label: "Mock Tests",       desc: "Free practice tests by course" },
      { href: "/e-notes",   icon: NotebookText,  label: "E-Notes",          desc: "Study notes & PDFs" },
      { href: "/courses",   icon: BookOpen,      label: "Courses",          desc: "View all courses & fees" },
    ],
  },
  {
    label: "Student",
    items: [
      { href: "/login",        icon: GraduationCap, label: "Student Login",  desc: "Access your dashboard" },
      { href: "/verification", icon: ShieldCheck,   label: "Verification",  desc: "Verify certificates online" },
    ],
  },
];

const PLAIN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/franchise", label: "Franchise" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [student, setStudent] = useState<{ fullName: string; photoUrl?: string; avatarColor?: string; rollNumber?: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Fetch logged-in student — deduped + cached (was 2x due to StrictMode + no-store)
  useEffect(() => {
    const cached = (window as any).__meCache;
    if (cached) { if (cached.success) setStudent(cached.data); return; }
    if ((window as any).__meFetching) return;
    (window as any).__meFetching = true;
    fetch("/api/student/me")
      .then(r => r.json())
      .then(j => { (window as any).__meCache = j; if (j.success && j.data) setStudent(j.data); })
      .catch(()=>{})
      .finally(()=>{ (window as any).__meFetching = false; });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#b91c1c] text-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-900 font-medium rounded-sm text-[11px] flex items-center gap-1 whitespace-nowrap">
              <FileText className="w-3 h-3" /> Latest Announcement:
            </span>
            <span className="animate-pulse whitespace-nowrap">New Batches Starting Soon! Contact: 08299121689</span>
          </div>
          <div className="hidden md:flex items-center gap-4 whitespace-nowrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Fatehpur, UP 212601</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 08299121689</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50" ref={dropRef}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 mr-4">
            <img src="/logo.jpeg" alt="Rama Coaching Center" className="w-12 h-12 lg:w-14 lg:h-14 object-contain rounded" />
            <div className="hidden sm:block leading-tight">
              <p
                className="font-black text-transparent bg-clip-text whitespace-nowrap tracking-wide"
                style={{
                  fontSize: "clamp(15px, 1.4vw, 20px)",
                  backgroundImage: "linear-gradient(135deg, #b91c1c 0%, #1F3354 60%, #b91c1c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
                }}
              >
                Rama Coaching Center
              </p>
              <p className="text-[11px] text-gray-500 tracking-wide">And Computer Education Center</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">

            {/* Plain links */}
            {PLAIN_LINKS.map(link => (
              <Link key={link.href} href={link.href} prefetch={true}
                className={`whitespace-nowrap px-3 py-1.5 text-[13px] transition-colors rounded ${
                  isActive(link.href)
                    ? "text-red-600 font-medium"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}>
                {link.label}
              </Link>
            ))}

            {/* Dropdown groups */}
            {DROPDOWN_ITEMS.map(group => (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === group.label ? null : group.label)}
                  className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-[13px] transition-colors rounded ${
                    group.items.some(i => isActive(i.href))
                      ? "text-red-600 font-medium"
                      : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  }`}>
                  {group.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === group.label ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-50">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} prefetch={true}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${isActive(item.href) ? "bg-red-50" : ""}`}>
                          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive(item.href) ? "text-red-600" : "text-slate-400"}`} />
                          <div>
                            <p className={`text-sm font-medium ${isActive(item.href) ? "text-red-600" : "text-slate-800"}`}>{item.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Mock Test highlight pill */}
            <Link href="/mock-test" prefetch={true}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-[13px] font-medium transition-all ml-1 ${
                isActive("/mock-test")
                  ? "bg-red-600 text-white"
                  : "bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white"
              }`}>
              <ClipboardList className="h-3.5 w-3.5 shrink-0" />
              Mock Test
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-4">
            {student ? (
              <div className="relative hidden lg:block" ref={profileRef}>
                <button type="button" onClick={()=>setProfileOpen(v=>!v)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1 hover:bg-slate-50 transition-colors">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.fullName} className="h-7 w-7 rounded-full object-cover border" />
                  ) : (
                    <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background: student.avatarColor || "#1F3354"}}>
                      {student.fullName.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-700 max-w-[110px] truncate">{student.fullName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180": ""}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{student.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{student.rollNumber}</p>
                    </div>
                    <Link href="/student" onClick={()=>setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                    <Link href="/student" onClick={()=>setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><GraduationCap className="h-4 w-4" /> My Courses</Link>
                    <button onClick={async()=>{ await fetch("/api/auth/student/logout",{method:"POST"}); setStudent(null); setProfileOpen(false); window.location.href="/"; }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"><LogOut className="h-4 w-4" /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" prefetch={true}
                className="hidden lg:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded font-medium text-[13px] whitespace-nowrap transition-colors">
                <Users className="w-3.5 h-3.5" /> Student Login
              </Link>
            )}
            <button type="button" aria-label="Toggle menu" onClick={() => setOpen(v => !v)}
              className="lg:hidden p-2 rounded text-gray-700 hover:text-red-600 hover:bg-gray-100">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b shrink-0">
          <span className="text-base font-medium text-gray-800">Menu</span>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="p-2 rounded text-gray-500 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col px-4 py-3 gap-0.5">

              {/* Mock Test highlight */}
              <Link href="/mock-test" prefetch={true} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive("/mock-test") ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                }`}>
                <ClipboardList className="h-4 w-4 shrink-0" /> Free Mock Tests
              </Link>

              {/* E-Notes highlight */}
              <Link href="/e-notes" prefetch={true} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive("/e-notes") ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white"
                }`}>
                <NotebookText className="h-4 w-4 shrink-0" /> E-Notes
              </Link>

              <div className="my-2 border-t border-gray-100" />

              {/* All dropdown items flat */}
              {DROPDOWN_ITEMS.flatMap(g => g.items)
                .filter(i => i.href !== "/mock-test")
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} prefetch={true} onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm rounded transition-colors ${
                        isActive(item.href) ? "text-red-600 bg-red-50 font-medium" : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                      }`}>
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      {item.label}
                    </Link>
                  );
                })}

              <div className="my-2 border-t border-gray-100" />

              {/* Plain links */}
              {PLAIN_LINKS.map(link => (
                <Link key={link.href} href={link.href} prefetch={true} onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
                    isActive(link.href) ? "text-red-600 bg-red-50 font-medium" : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto px-4 pb-6 pt-3 border-t shrink-0">
              {student ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    {student.photoUrl ? <img src={student.photoUrl} alt={student.fullName} className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background: student.avatarColor || "#1F3354"}}>{student.fullName.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase()}</span>}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{student.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{student.rollNumber}</p>
                    </div>
                  </div>
                  <Link href="/student" prefetch={true} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 bg-[#1F3354] text-white px-4 py-2.5 rounded font-medium text-sm"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                  <button onClick={async()=>{ await fetch("/api/auth/student/logout",{method:"POST"}); setStudent(null); setOpen(false); window.location.href="/"; }} className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded font-medium text-sm"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              ) : (
                <Link href="/login" prefetch={true} onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded font-medium text-sm transition-colors">
                  <Users className="w-4 h-4" /> Student Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
