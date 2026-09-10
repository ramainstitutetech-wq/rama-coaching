import type { Course } from "./types";

export const courses: Course[] = [
  { id: "cr-01", name: "ADCA — Advanced Diploma in Computer Applications", description: "Comprehensive program covering office automation, programming fundamentals, web basics and accounting software.", duration: "12 Months", fees: "₹18,000", category: "Diploma", accent: "#1F3354", status: "active" },
  { id: "cr-02", name: "DCA — Diploma in Computer Applications", description: "Foundation course in computers, MS Office, internet and basic graphics for beginners.", duration: "6 Months", fees: "₹9,500", category: "Diploma", accent: "#0f766e", status: "active" },
  { id: "cr-03", name: "RSCIT", description: "Rajasthan State Certificate in Information Technology — government recognized IT literacy course.", duration: "3 Months", fees: "₹3,500", category: "Certification", accent: "#b91c1c", status: "active" },
  { id: "cr-04", name: "Tally Prime with GST", description: "Hands-on accounting with Tally Prime, GST returns, inventory and payroll management.", duration: "4 Months", fees: "₹7,200", category: "Accounting", accent: "#7c3aed", status: "active" },
  { id: "cr-05", name: "Digital Marketing", description: "SEO, social media, Google Ads, email marketing and analytics for career growth.", duration: "5 Months", fees: "₹12,000", category: "Marketing", accent: "#c2410c", status: "active" },
  { id: "cr-06", name: "Web Development", description: "HTML, CSS, JavaScript and modern frameworks to build responsive websites and apps.", duration: "6 Months", fees: "₹14,500", category: "Development", accent: "#0369a1", status: "active" },
  { id: "cr-07", name: "CCC — Course on Computer Concepts", description: "NIELIT certified course covering essential computer and internet skills.", duration: "3 Months", fees: "₹3,200", category: "Certification", accent: "#a16207", status: "inactive" },
  { id: "cr-08", name: "Basic Computer Course", description: "Everyday computing: Windows, MS Office, email and safe internet usage.", duration: "2 Months", fees: "₹2,500", category: "Foundation", accent: "#15803d", status: "active" },
];
