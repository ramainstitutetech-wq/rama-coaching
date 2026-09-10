"use client";

import Link from "next/link";
import { GraduationCap, Award, Users, Building2, Target, BookOpen, FileText, Check } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative py-16 bg-cover bg-center" style={{ backgroundImage: "url('https://lakshaygroupedu.co.in/assets/images/bg3.jpg')" }}>
        <div className="absolute inset-0 bg-red-700/40" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">About Rama Coaching Center</h1>
          <p className="text-lg text-red-100">Empowering Students with Quality Computer Education Since 2016</p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-5">Our Mission</h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                Rama Coaching Center And Computer Education Center is committed to providing quality computer education to students in Fatehpur, Uttar Pradesh and surrounding areas. Our mission is to bridge the digital divide by making computer education accessible and affordable for everyone.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                We believe that every student deserves the opportunity to develop essential computer skills that are crucial in today's digital world. Our courses are designed to be practical, industry-relevant, and taught by experienced instructors who are passionate about education.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { title: "Quality Education", desc: "Industry-aligned curriculum" },
                  { title: "Expert Faculty", desc: "Experienced instructors" },
                  { title: "Practical Training", desc: "Hands-on learning approach" },
                  { title: "Certification", desc: "Recognized certificates" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-7 rounded-xl">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: GraduationCap, color: "text-red-600", val: "4987+", label: "Students Trained" },
                  { icon: Building2, color: "text-blue-600", val: "55+", label: "Centers" },
                  { icon: BookOpen, color: "text-green-600", val: "345+", label: "Courses" },
                  { icon: Award, color: "text-yellow-600", val: "10+", label: "Years Experience" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-5 bg-white rounded-xl shadow-sm">
                    <s.icon className={`w-10 h-10 ${s.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-gray-800">{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Our Vision & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, color: "text-red-600", title: "Our Vision", desc: "To be the leading computer education provider in Uttar Pradesh, known for excellence in teaching and student success." },
              { icon: Users, color: "text-blue-600", title: "Student-Centric", desc: "We prioritize student success through personalized attention, mentorship, and career guidance." },
              { icon: Award, color: "text-green-600", title: "Excellence", desc: "We maintain high standards in curriculum, teaching methodology, and infrastructure to ensure quality education." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-7 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Why Choose Rama Coaching Center?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: GraduationCap, accent: "border-red-500 bg-red-50", iconColor: "text-red-600", title: "Expert Faculty", desc: "Learn from industry professionals with years of experience" },
              { icon: BookOpen, accent: "border-blue-500 bg-blue-50", iconColor: "text-blue-600", title: "Modern Curriculum", desc: "Updated course content aligned with current industry trends" },
              { icon: FileText, accent: "border-green-500 bg-green-50", iconColor: "text-green-600", title: "Certification", desc: "Government recognized certificates for better job prospects" },
              { icon: Target, accent: "border-yellow-500 bg-yellow-50", iconColor: "text-yellow-600", title: "Placement Support", desc: "Career guidance and job placement assistance" },
            ].map((item) => (
              <div key={item.title} className={`p-5 rounded-xl border-l-4 ${item.accent}`}>
                <item.icon className={`w-9 h-9 ${item.iconColor} mb-3`} />
                <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
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
