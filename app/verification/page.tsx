"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Search, Check, X, FileText, Award, Calendar, User } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export default function VerificationPage() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateNumber.trim() && !rollNumber.trim()) {
      setResult({ found: false, message: "Please enter a certificate number or roll number" });
      return;
    }
    setIsSearching(true);
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (certificateNumber.trim()) params.set("certificateNumber", certificateNumber.trim());
      if (rollNumber.trim()) params.set("rollNumber", rollNumber.trim());
      const res = await fetch(`/api/verify?${params.toString()}`, { cache: "no-store" });
      const j = await res.json();
      if (j.success && j.found) {
        setResult({ found: true, studentName: j.data.studentName, course: j.data.courseName || j.data.course, certificateNumber: j.data.certificateNumber, rollNumber: j.data.rollNumber, issueDate: j.data.issueDate, validity: "Lifetime", grade: j.data.grade || "A", center: j.data.trainingCenter });
      } else {
        setResult({ found: false, message: j.error || "Certificate not found. Please check the number." });
      }
    } catch {
      setResult({ found: false, message: "Network error. Please try again." });
    } finally {
      setIsSearching(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none";

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">Certificate Verification</h1>
          <p className="text-base text-red-100 mb-6">Verify Student Certificates Instantly Online</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { val: "100%", label: "Authentic" },
              { val: "24/7", label: "Available" },
              { val: "Instant", label: "Results" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 px-6 py-3 rounded">
                <div className="text-xl font-semibold text-white">{s.val}</div>
                <div className="text-xs text-red-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">Search Certificate</h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Certificate Number</label>
                <input type="text" value={certificateNumber} onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="e.g. RCC/2026/1234" className={inputClass} />
              </div>
              <div className="text-center text-sm text-gray-400">— OR —</div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Roll Number</label>
                <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. RCC/2026/001" className={inputClass} />
              </div>
              <button type="submit" disabled={isSearching}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                {isSearching ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Searching…</>
                ) : (
                  <><Search className="w-4 h-4" />Verify Certificate</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="py-6">
          <div className="max-w-3xl mx-auto px-6">
            {result.found ? (
              <div className="bg-white rounded-xl shadow-sm border-2 border-green-400 p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-700">Certificate Verified</h3>
                    <p className="text-xs text-gray-500">This certificate is authentic and valid</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-5 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: User, label: "Student Name", val: result.studentName },
                      { icon: FileText, label: "Course", val: result.course },
                      { icon: Award, label: "Certificate Number", val: result.certificateNumber },
                      { icon: FileText, label: "Roll Number", val: result.rollNumber },
                      { icon: Calendar, label: "Issue Date", val: result.issueDate },
                      { icon: Shield, label: "Validity", val: result.validity },
                      { icon: Award, label: "Grade", val: result.grade },
                      { icon: FileText, label: "Issuing Center", val: result.center },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5">
                        <item.icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">{item.label}</div>
                          <div className="text-sm font-medium text-gray-800">{item.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">This certificate can be verified by contacting our office</p>
                  <Link href="tel:08299121689" className="inline-flex items-center px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors">
                    Contact for Verification: 08299121689
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border-2 border-red-300 p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700">Certificate Not Found</h3>
                    <p className="text-xs text-gray-500">{result.message}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">Please check the certificate number or contact our office for assistance</p>
                  <Link href="tel:08299121689" className="inline-flex items-center px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors">
                    Contact: 08299121689
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">How Certificate Verification Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, color: "bg-red-100 text-red-600", num: "1", title: "Enter Details", desc: "Enter certificate number or roll number in the search field" },
              { icon: Shield, color: "bg-blue-100 text-blue-600", num: "2", title: "Verify", desc: "Our system instantly verifies the certificate authenticity" },
              { icon: Check, color: "bg-green-100 text-green-600", num: "3", title: "Get Results", desc: "View complete certificate details and verification status" },
            ].map((s) => (
              <div key={s.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className={`w-14 h-14 ${s.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1.5">{s.num}. {s.title}</div>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important notice */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
            <h3 className="font-semibold text-yellow-800 mb-3">Important Notice</h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              {[
                "All certificates issued by Rama Coaching Center are verifiable through this system",
                "If a certificate cannot be found, please contact our office with the original document",
                "Fake certificates are a punishable offense under Indian law",
                "For bulk verification, please contact our office directly",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
