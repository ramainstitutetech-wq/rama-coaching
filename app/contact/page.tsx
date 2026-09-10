"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, Check } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `[${formData.subject}] ${formData.message}`,
        }),
      });
      const j = await res.json();
      if (j.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert(j.error || "Failed to send message");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">Contact Us</h1>
          <p className="text-base text-red-100 mb-6">Get in Touch with Rama Coaching Center</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { val: "24/7", label: "Support Available" },
              { val: "Quick", label: "Response Time" },
              { val: "Free", label: "Consultation" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 px-6 py-3 rounded">
                <div className="text-xl font-semibold text-white">{s.val}</div>
                <div className="text-xs text-red-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Phone, color: "bg-red-50 text-red-600", title: "Phone", content: <Link href="tel:08299121689" className="text-red-600 hover:text-red-700 text-sm">08299121689</Link>, sub: "Mon–Sat, 9AM–6PM" },
              { icon: Mail, color: "bg-blue-50 text-blue-600", title: "Email", content: <Link href="mailto:info@ramacoaching.com" className="text-red-600 hover:text-red-700 text-sm">info@ramacoaching.com</Link>, sub: "Reply within 24 hours" },
              { icon: MapPin, color: "bg-green-50 text-green-600", title: "Address", content: <p className="text-gray-600 text-sm">UPHC, Andauli Puliya, Ghazipur Rd, Fatehpur, UP 212601</p>, sub: "" },
              { icon: Clock, color: "bg-yellow-50 text-yellow-600", title: "Working Hours", content: <p className="text-gray-600 text-sm">Mon–Sat: 9:00 AM – 6:00 PM</p>, sub: "Sunday: Closed" },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">{item.title}</h3>
                {item.content}
                {item.sub && <p className="text-xs text-gray-400 mt-1">{item.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Send us a Message</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded px-4 py-3 mb-6 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">Message sent. We'll get back to you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your phone number"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                  <select name="subject" value={formData.subject} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-white">
                    <option value="">Select a subject</option>
                    <option value="course-inquiry">Course Inquiry</option>
                    <option value="admission">Admission Query</option>
                    <option value="franchise">Franchise Inquiry</option>
                    <option value="certification">Certificate Verification</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Type your message here..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                ) : (
                  <><Send className="w-4 h-4" />Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">Find Us on Map</h2>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-80 sm:h-[420px]">
            <iframe
              src="https://maps.google.com/maps?q=VQXR%2BVH+Fatehpur,+Uttar+Pradesh&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rama Coaching Center Location"
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            <p className="text-sm text-gray-500">
              UPHC, Andauli Puliya, Ghazipur Rd, Radha Nagar, Harihar Ganj, Fatehpur, UP 212601
            </p>
            <a
              href="https://maps.google.com/?q=UPHC,+Andauli+Puliya,+Ghazipur+Rd,+Radha+Nagar,+Harihar+Ganj,+Fatehpur,+Uttar+Pradesh+212601"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-600 hover:text-red-700 whitespace-nowrap transition-colors"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: "What courses do you offer?", a: "We offer RSCIT, Tally Prime, Digital Marketing, RSCFA Accounting, ADCA/DCA Diploma, and Graphic Design courses." },
              { q: "How do I get admitted?", a: "Visit our center or call us at 08299121689. You can also fill the contact form above and we will guide you through the process." },
              { q: "Do you provide placement assistance?", a: "Yes, we provide career guidance and job placement support to all our students after course completion." },
              { q: "Are the certificates government recognized?", a: "Yes, all certificates issued by Rama Coaching Center are government recognized and verifiable online." },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
