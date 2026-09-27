"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Award, Clock, Users, BookOpen, Check, ArrowRight, CreditCard, Trophy } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

function formatPrice(fees: string) {
  if (!fees) return "₹0";
  const num = parseInt(String(fees).replace(/[^0-9]/g, "") || "0", 10);
  if (isNaN(num) || num === 0) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

const courseIcons: Record<number, React.ReactNode> = {
  1: <BookOpen className="w-14 h-14" />,
  2: <CreditCard className="w-14 h-14" />,
  3: <Trophy className="w-14 h-14" />,
  4: <Award className="w-14 h-14" />,
  5: <GraduationCap className="w-14 h-14" />,
  6: <Award className="w-14 h-14" />,
};

const fallbackCourses = [
  { id: 1, title: "Basic Computer Course", duration: "3 Months", students: "1200+", level: "Foundation", price: "₹3,200", description: "Learn fundamental computer skills including Windows, MS Office, Internet usage, and basic operations. Course fee ₹3,000 + Reg ₹200.", features: ["Windows Operating System", "Microsoft Office Suite", "Internet & Email", "Basic Computer Hardware", "Authorized Certificate"] },
  { id: 2, title: "CCC — Course on Computer Concepts", duration: "3 Months", students: "850+", level: "Certification", price: "₹3,000", description: "NIELIT certified IT literacy course for government & corporate jobs. Course fee ₹2,500 + Reg ₹500.", features: ["NIELIT Exam Syllabus", "Computer Fundamentals", "Spreadsheet & Presentations", "Digital Financial Services", "Online Mock Tests"] },
  { id: 3, title: "ADCA — Advanced Diploma in Computer Applications", duration: "12 Months", students: "1500+", level: "Diploma", price: "₹7,400", description: "Comprehensive diploma program covering office automation, programming, web design & accounting. Course fee ₹7,200 + Reg ₹200.", features: ["Office Automation", "Web Design Basics", "Tally & Financial Accounting", "Programming Fundamentals", "Diploma Certificate & Project"] },
  { id: 4, title: "Tally Prime with GST", duration: "3 Months", students: "900+", level: "Accounting", price: "₹3,200", description: "Master Tally Prime accounting software, GST taxation, inventory, and business reports. Course fee ₹3,000 + Reg ₹200.", features: ["Tally Prime Fundamentals", "GST Billing & Filing", "Inventory & Stock Control", "Payroll Management", "Live Industry Case Studies"] },
  { id: 5, title: "DCA — Diploma in Computer Applications", duration: "6 Months", students: "780+", level: "Diploma", price: "₹5,500", description: "6-month diploma covering computing, office packages, internet applications, and graphics.", features: ["Computer Hardware Basics", "MS Office Complete", "Internet & Cyber Security", "Graphic Fundamentals", "Project & Certification"] },
  { id: 6, title: "Web Development", duration: "6 Months", students: "420+", level: "Development", price: "₹14,500", description: "HTML, CSS, JavaScript and modern frameworks to build responsive websites and applications.", features: ["HTML5 & CSS3", "JavaScript & ES6", "React Framework", "Responsive Web Design", "Live Project Deployment"] },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>(fallbackCourses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Background refresh — show fallback instantly, no 3s spinner
    fetch("/api/courses?limit=50")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data.length) {
          setCourses(j.data.map((c: any) => ({
            id: c.id,
            title: c.name,
            duration: c.duration,
            students: "500+",
            level: c.category || "Beginner",
            price: c.fees,
            description: c.description,
            imageUrl: c.imageUrl || "",
            features: ["Government Certificate", "Expert Faculty", "Practical Training", "Placement Support"],
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-semibold text-white mb-3">Our Courses</h1>
          <p className="text-base text-red-100 mb-6">Industry-Relevant Computer Education Programs</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { val: "345+", label: "Courses Available" },
              { val: "4987+", label: "Students Enrolled" },
              { val: "95%", label: "Placement Rate" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 px-6 py-3 rounded">
                <div className="text-2xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-red-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-5 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 mr-1">Filter by:</span>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium">All Courses</button>
            {["Beginner", "Intermediate", "Advanced", "Diploma"].map((f) => (
              <button key={f} className="px-3 py-1.5 bg-white text-gray-600 rounded text-xs border border-gray-200 hover:bg-red-50 hover:text-red-600 transition-colors">{f}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md shadow-gray-300/60 overflow-hidden hover:shadow-xl hover:shadow-gray-400/40 transition-all duration-200 border border-gray-200 flex flex-col">
                <div className="w-full h-44 bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white overflow-hidden">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    courseIcons[Number(String(course.id).slice(-1)) % 6 + 1] || <BookOpen className="w-14 h-14" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-gray-800 mb-1.5">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.students}</span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {course.features.slice(0, 3).map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="line-clamp-1">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xl font-bold text-red-600">{formatPrice(course.price)}</div>
                      <div className="text-[11px] text-gray-400">Course Fee</div>
                    </div>
                    <Link href={`/courses/${course.id}`} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1.5 transition-colors">
                      Enroll Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Why Choose Our Courses?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: GraduationCap, color: "text-red-600", title: "Expert Faculty", desc: "Learn from industry professionals" },
              { icon: BookOpen, color: "text-blue-600", title: "Updated Curriculum", desc: "Industry-aligned course content" },
              { icon: Award, color: "text-green-600", title: "Certification", desc: "Government recognized certificates" },
              { icon: Users, color: "text-yellow-600", title: "Placement Support", desc: "Career guidance and job assistance" },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-100">
                <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-3`} />
                <h3 className="font-medium text-gray-800 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
