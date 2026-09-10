"use client";

import Link from "next/link";
import { ArrowLeft, Copy, CheckCircle2, Smartphone } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { useState } from "react";

const UPI_ID = "8299121689@ybl";
const UPI_NAME = "Rama Coaching Center";
const UPI_PHONE = "8299121689";

export default function PaymentPage() {
  const [copied, setCopied] = useState(false);

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="bg-[#1F3354] py-10 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Online Payment</h1>
        <p className="text-slate-300 text-sm mt-2">Pay your fees securely via UPI</p>
      </section>

      <section className="py-12 px-4">
        <div className="mx-auto max-w-lg">

          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Top accent */}
            <div className="h-2 bg-gradient-to-r from-[#b91c1c] to-[#1F3354]" />

            <div className="p-6 sm:p-8 flex flex-col items-center gap-6">

              {/* Institute info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img src="/logo.jpeg" alt="Rama Coaching" className="h-10 w-10 rounded-lg object-contain border" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{UPI_NAME}</p>
                    <p className="text-xs text-slate-500">And Computer Education Center</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Scan QR to Pay</p>
                <div className="rounded-2xl border-4 border-slate-100 p-2 shadow-md bg-white">
                  <img
                    src="/UPI.jpeg"
                    alt="UPI QR Code — Rama Coaching Center"
                    className="h-52 w-52 object-contain rounded-xl"
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Scan with any UPI app — PhonePe, GPay, Paytm, BHIM
                </p>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">OR PAY USING UPI ID</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* UPI ID */}
              <div className="w-full">
                <p className="text-xs text-slate-500 mb-2 text-center">UPI ID</p>
                <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
                  <Smartphone className="h-5 w-5 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-slate-800 select-all tracking-wide">
                    {UPI_ID}
                  </span>
                  <button
                    type="button"
                    onClick={copyUPI}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : "bg-[#1F3354] text-white hover:bg-[#162640]"
                    }`}
                  >
                    {copied ? (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">Payment Instructions</p>
                <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
                  <li>• After payment, please share the screenshot on WhatsApp: <span className="font-semibold">{UPI_PHONE}</span></li>
                  <li>• Mention your <span className="font-semibold">Full Name</span> and <span className="font-semibold">Roll Number</span> while sending</li>
                  <li>• Payment confirmation will be sent within 24 hours</li>
                  <li>• For any issue, contact us at <span className="font-semibold">{UPI_PHONE}</span></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center">
                <p className="text-xs text-slate-400">Need help? Call or WhatsApp us</p>
                <a
                  href={`tel:${UPI_PHONE}`}
                  className="mt-1 inline-block text-sm font-semibold text-[#1F3354] hover:underline"
                >
                  📞 {UPI_PHONE}
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
