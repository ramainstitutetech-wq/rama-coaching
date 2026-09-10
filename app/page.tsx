"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, GraduationCap, Trophy, Users, Building2, FileText, HeadphonesIcon, Award, CreditCard, ArrowRight, Calendar, BookOpen, Bell, X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

const FALLBACK_COURSES = [
  { id: 1, title: "RSCIT / Basic Computer Course", desc: "Learn fundamental computer skills and operations", img: "https://lakshaygroupedu.co.in/img/a215/COURSES/1736NuswVu6kHYQs0Y9.png" },
  { id: 2, title: "Tally Prime Course", desc: "Master accounting software for business", img: "https://lakshaygroupedu.co.in/img/a215/COURSES/6YMQOiXLQMbDCxJ1504.jpg" },
  { id: 3, title: "Digital Marketing Course", desc: "Learn online marketing strategies", img: "https://lakshaygroupedu.co.in/img/a215/COURSES/3dWyZiQ3iUvKf8M1503.jpg" },
  { id: 4, title: "RSCFA Financial Accounting", desc: "Advanced financial accounting skills", img: "https://lakshaygroupedu.co.in/img/a215/COURSES/3kBn78NNbVcyS1r1477.jfif" },
  { id: 5, title: "ADCA / DCA Diploma", desc: "Comprehensive computer applications diploma", img: "https://lakshaygroupedu.co.in/img/a215/COURSES/6plD3i2vEuM1SwP1405.jpg" },
];

const GALLERY_IMAGES = [
  { src: "https://lakshaygroupedu.co.in/img/a215/CMS/215utACaRweHzNenbjPhoto.png", alt: "Gallery Photo 1" },
  { src: "https://lakshaygroupedu.co.in/img/a215/CMS/215xJEZu6s4HthncXjPhoto.jpeg", alt: "Gallery Photo 2" },
  { src: "https://lakshaygroupedu.co.in/img/a215/CMS/215QL4KNwPjkuI37PBPhoto.jpeg", alt: "Gallery Photo 3" },
  { src: "https://lakshaygroupedu.co.in/img/a215/CMS/215CDr4B1dSkA8DW6UPhoto.jpeg", alt: "Gallery Photo 4" },
];

// Hero slider images from public folder
const HERO_SLIDES = [
  { src: "/hero-banner.png",   alt: "Rama Coaching Center" },
  { src: "/hero-banner-1.png", alt: "Rama Coaching Center" },
];

// ── Hero Slider ───────────────────────────────────────────────────────────────
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = HERO_SLIDES.length;

  const go = (idx: number) => setCurrent((idx + total) % total);

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(p => (p + 1) % total), 4500);
    return () => clearInterval(timerRef.current!);
  }, []);

  return (
    <div className="relative w-full overflow-hidden select-none group">
      {/* Slides */}
      <div className="relative">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`transition-opacity duration-700 ${i === current ? "opacity-100 relative" : "opacity-0 absolute inset-0"}`}
            aria-hidden={i !== current}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[560px] object-cover"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Notice Ticker ─────────────────────────────────────────────────────────────
function NoticeTicker() {
  const [notices, setNotices] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/notices", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (j.success && j.data.length > 0) {
          setNotices(j.data.filter((n: any) => n.published).map((n: any) => n.title));
        }
      })
      .catch(() => {});
  }, []);

  const fallback = [
    "🎓 New Batches Starting Soon — Enroll Now!",
    "📢 RSCIT, CCC, O-Level, Tally, ADCA Courses Available",
    "🏆 100% Government Recognized Certificates",
    "📞 Call us: 08299121689 | Fatehpur, UP 212601",
    "🎁 Scholarship Available — Up to 50% Fee Waiver for Deserving Students",
  ];

  const items = notices.length > 0 ? notices : fallback;
  // Duplicate items for seamless loop
  const marqueeText = [...items, ...items].join("   •   ");

  return (
    <div className="bg-[#1F3354] text-white overflow-hidden border-y border-white/10">
      <div className="flex items-center">
        {/* Left label */}
        <div className="flex items-center gap-2 bg-red-600 px-4 py-2.5 shrink-0 text-xs font-semibold whitespace-nowrap">
          <Volume2 className="w-3.5 h-3.5" />
          <span>NOTICE</span>
        </div>
        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden relative py-2.5">
          <style>{`
            @keyframes marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track { animation: marquee 30s linear infinite; white-space: nowrap; display: inline-block; }
            .marquee-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="marquee-track text-sm text-slate-200 px-4">
            {marqueeText}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState(FALLBACK_COURSES);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    fetch("/api/courses?limit=12", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data.length > 0) {
          setCourses(j.data.map((c: any, i: number) => ({
            id: c.id || i,
            title: c.name,
            desc: c.description,
            img: c.imageUrl?.trim() || FALLBACK_COURSES[i % FALLBACK_COURSES.length].img,
            fees: c.fees,
            duration: c.duration,
          })));
        }
      }).catch(() => {});
  }, []);

  // Show announcement popup on first load
  useEffect(() => {
    const timer = setTimeout(() => setShowAnnouncement(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Announcement Popup */}
      <AnnouncementPopup open={showAnnouncement} onClose={() => setShowAnnouncement(false)} />

      {/* ── Hero Image Slider ────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Notice Ticker ────────────────────────────────────────────────── */}
      <NoticeTicker />

      {/* Be Part of Us */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <img
                src="https://lakshaygroupedu.co.in/img/a215/CMS/2156zgXAoXRGxKypyfSideImg.png"
                alt="Be Part of Us"
                className="w-full h-48 md:h-64 lg:h-80 rounded-lg shadow-lg object-cover"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl sm:text-4xl font-semibold mb-4">
                <span className="text-red-700">Be Part</span> <span className="text-gray-800">of Us</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                Join our mission to provide quality computer education to students across Uttar Pradesh.
                We are committed to shaping the future of our students with practical skills and industry-relevant knowledge.
              </p>
              <Link href="/contact" className="inline-flex items-center bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
                Join Our Community <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Color Quick Action Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            <Link href="/contact" className="bg-emerald-600 p-8 text-white text-center hover:bg-emerald-700 transition-colors cursor-pointer">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium">Apply Online</h3>
              <p className="text-sm mt-2 opacity-80">Easy admission process</p>
            </Link>
            <Link href="/contact" className="bg-blue-600 p-8 text-white text-center hover:bg-blue-700 transition-colors cursor-pointer">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <HeadphonesIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium">Superfast Support</h3>
              <p className="text-sm mt-2 opacity-80">24/7 assistance available</p>
            </Link>
            <Link href="/verification" className="bg-amber-500 p-8 text-white text-center hover:bg-amber-600 transition-colors cursor-pointer">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium">Certification</h3>
              <p className="text-sm mt-2 opacity-80">Government recognized</p>
            </Link>
            <Link href="/payment" className="bg-red-600 p-8 text-white text-center hover:bg-red-700 transition-colors cursor-pointer">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium">Online Payment</h3>
              <p className="text-sm mt-2 opacity-80">Secure transactions</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-6 sm:mb-8">Why Choose Rama Coaching Center?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-stretch">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 h-full">
              {[
                { img: "https://lakshaygroupedu.co.in/assets/images/feature/07.png", alt: "Futuristic Curriculum", title: "Futuristic Curriculum", sub: "Industry-aligned courses", color: "from-red-500 to-red-600", check: "text-red-600", items: ["Updated syllabus as per industry standards", "Practical training with live projects", "Learn from industry experts"] },
                { img: "https://lakshaygroupedu.co.in/assets/images/feature/08.png", alt: "Cutting Edge Course", title: "Cutting Edge Course", sub: "Latest technologies", color: "from-blue-500 to-blue-600", check: "text-blue-600", items: ["Modern tools and software", "Hands-on practical sessions", "Real-world project experience"] },
              ].map((card) => (
                <div key={card.title} className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
                  <div className={`bg-gradient-to-r ${card.color} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <img src={card.img} alt={card.alt} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                  </div>
                  <h3 className="font-medium text-gray-800 text-center text-sm sm:text-base">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mt-1">{card.sub}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">
                    <ul className="text-left text-xs text-gray-600 space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className={`w-3.5 h-3.5 ${card.check} flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {[
                { icon: Trophy, title: "Tech Revolution", sub: "Digital transformation", color: "from-green-500 to-green-600", check: "text-green-600", items: ["Digital skills for modern era", "Cloud computing basics", "Smart technology solutions"] },
                { icon: Users, title: "Empowering Minds", sub: "Skill development", color: "from-purple-500 to-purple-600", check: "text-purple-600", items: ["Career guidance & counseling", "Soft skills development", "Personality development"] },
              ].map((card) => (
                <div key={card.title} className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
                  <div className={`bg-gradient-to-r ${card.color} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-800 text-center text-sm sm:text-base">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mt-1">{card.sub}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">
                    <ul className="text-left text-xs text-gray-600 space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className={`w-3.5 h-3.5 ${card.check} flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Public Announcements */}
            <div className="w-full h-full flex flex-col">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 sm:p-8 h-full min-h-[300px] text-white rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">Public Announcements</h3>
                    <p className="text-xs text-red-100">Latest Updates & News</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Bell, color: "text-yellow-400", title: "New Batches Starting Soon", desc: "Admissions open for RSCIT, Tally Prime, and Digital Marketing courses." },
                    { icon: Award, color: "text-green-400", title: "Scholarship Available", desc: "Merit-based scholarships available. Up to 50% fee waiver for deserving students." },
                    { icon: Calendar, color: "text-blue-300", title: "Weekend Classes", desc: "Special weekend batches for working professionals. Sat & Sun available." },
                    { icon: BookOpen, color: "text-purple-300", title: "Free Demo Classes", desc: "Attend free demo classes before enrollment. Call to schedule." },
                  ].map((item) => (
                    <div key={item.title} className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <item.icon className={`w-4 h-4 ${item.color} mt-0.5 flex-shrink-0`} />
                        <div>
                          <h4 className="font-medium text-sm mb-0.5">{item.title}</h4>
                          <p className="text-xs text-red-100 hidden md:block">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 pt-3 border-t border-white/20">
                  <Link href="/contact" className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors">
                    Contact for Details <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalogue */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-800">Pick a Course to Get Started</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="w-full h-24 sm:h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-xs sm:text-lg font-medium text-gray-800 mt-1 sm:mt-2 mb-1">{course.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-4 hidden sm:block flex-grow">{course.desc}</p>
                  <div className="mt-auto">
                    <Link href="/courses" className="block bg-red-600 hover:bg-red-700 text-white text-center py-1.5 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm transition-colors">
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Red Banner */}
      <section className="bg-red-700 py-10 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-3xl font-semibold text-white mb-4">
            Our Center focus on Institute Management / Student Verification / No.1 Computer Education
          </h2>
          <Link href="/franchise" className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded font-medium text-base sm:text-lg transition-colors mt-4">
            APPLY NOW <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Our Achievers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Our Achievers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-red-700 overflow-hidden bg-gray-200" />
                <h4 className="font-medium text-gray-800 text-sm">Student {item}</h4>
                <p className="text-xs text-gray-500">Course Graduate</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselling & Admission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-3">Free Institute Admission Counselling</h2>
            <p className="text-gray-500 mb-8">Expert Guidance for Your Education Journey</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {["Course Selection", "Fee Structure", "Batch Timings", "Placement Support"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/contact" className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-medium transition-colors">
              Get Free Counselling <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-10 text-center text-gray-800">What People Say About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Student {i}</p>
                    <p className="text-xs text-gray-500">Course Graduate</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Great learning experience at Rama Coaching Center. The faculty is very supportive and the curriculum is practical.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Our Professional Photo Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALLERY_IMAGES.map((img) => (
              <div key={img.src} className="aspect-square overflow-hidden rounded-lg">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[#1F3354] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "4987+", label: "Students Trained" },
              { val: "55+", label: "Centers" },
              { val: "345+", label: "Courses" },
              { val: "10+", label: "Years Experience" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-white">{s.val}</div>
                <div className="text-sm text-slate-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise + Verification Cards */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Franchise Card */}
            <div className="relative overflow-hidden bg-red-600 text-white" style={{ minHeight: 220 }}>
              {/* Background image */}
              <img
                src="https://lakshaygroupedu.co.in/assets/images/achive/01.png"
                alt=""
                aria-hidden="true"
                className="absolute right-0 bottom-0 h-full w-auto max-w-[55%] object-contain object-bottom opacity-20 pointer-events-none select-none"
              />
              {/* Content */}
              <div className="relative z-10 p-7 sm:p-8 flex flex-col h-full">
                <p className="text-[11px] uppercase tracking-widest text-red-200 mb-3">Grow with us</p>
                <h3 className="text-xl font-semibold leading-snug mb-2">Join Our Franchise Network</h3>
                <p className="text-sm text-red-100 leading-relaxed mb-6 max-w-xs">
                  Start your own computer education center with our proven franchise model. 55+ centers across UP.
                </p>
                <div className="mt-auto">
                  <Link href="/franchise" className="inline-flex items-center bg-white text-red-600 px-5 py-2 text-sm hover:bg-red-50 transition-colors">
                    Apply Now <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
              {/* Decorative image — visible, right side */}
              <img
                src="https://lakshaygroupedu.co.in/assets/images/achive/01.png"
                alt="Franchise"
                className="absolute right-4 bottom-0 h-[90%] w-auto max-w-[45%] object-contain object-bottom pointer-events-none select-none"
              />
            </div>

            {/* Verification Card */}
            <div className="relative overflow-hidden bg-[#1F3354] text-white" style={{ minHeight: 220 }}>
              <div className="relative z-10 p-7 sm:p-8 flex flex-col h-full">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Instant verification</p>
                <h3 className="text-xl font-semibold leading-snug mb-2">Student Verification System</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
                  Verify the authenticity of student certificates issued by our center — online, instantly.
                </p>
                <div className="mt-auto">
                  <Link href="/verification" className="inline-flex items-center bg-white text-[#1F3354] px-5 py-2 text-sm hover:bg-slate-100 transition-colors">
                    Verify Now <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
              {/* Decorative image — right side */}
              <img
                src="https://lakshaygroupedu.co.in/assets/images/achive/02.png"
                alt="Verification"
                className="absolute right-4 bottom-0 h-[90%] w-auto max-w-[45%] object-contain object-bottom pointer-events-none select-none"
              />
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ── Announcement Popup ────────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  {
    icon: Bell,
    color: "text-yellow-500",
    title: "New Batches Starting Soon",
    desc: "Admissions open for RSCIT, Tally Prime, and Digital Marketing courses. Limited seats available.",
    href: "/contact",
  },
  {
    icon: Award,
    color: "text-green-500",
    title: "Scholarship Available",
    desc: "Merit-based scholarships up to 50% fee waiver for deserving students. Apply before deadline.",
    href: "/contact",
  },
  {
    icon: Calendar,
    color: "text-blue-500",
    title: "Weekend Classes",
    desc: "Special weekend batches for working professionals. Saturday & Sunday classes now available.",
    href: "/contact",
  },
  {
    icon: BookOpen,
    color: "text-purple-500",
    title: "Free Demo Classes",
    desc: "Attend a free demo class before enrollment. Call us to schedule your session today.",
    href: "/contact",
  },
  {
    icon: Award,
    color: "text-red-500",
    title: "Certificate Verification Online",
    desc: "All Rama Coaching Center certificates can now be verified instantly on our website.",
    href: "/verification",
  },
];

function AnnouncementPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Pause on hover
  const pause = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "paused"; };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "running"; };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white shadow-xl overflow-hidden"
        style={{ borderRadius: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-[#1F3354]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Public Announcements</p>
              <p className="text-[11px] text-slate-300">Latest updates from Rama Coaching Center</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrolling area — fixed height, overflow hidden */}
        <div
          className="overflow-hidden bg-white"
          style={{ height: "320px" }}
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* CSS animation: scroll items bottom to top */}
          <style>{`
            @keyframes scrollUp {
              0%   { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            .scroll-track {
              animation: scrollUp 14s linear infinite;
            }
          `}</style>

          {/* Track — items duplicated for seamless loop */}
          <div ref={trackRef} className="scroll-track">
            {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className="flex items-start gap-3.5 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
              >
                <item.icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-red-700 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-500 shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">Click any item to learn more</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
