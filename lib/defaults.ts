import type { CertificateData, MarkRow } from "@/types/certificate";

// ─── Course code mapping ──────────────────────────────────────────────────────
// Maps course name keywords → short code used in enrollment number & courseCode
export const COURSE_CODE_MAP: Record<string, string> = {
  "ADCA":                    "ADCA",
  "DCA":                     "DCA",
  "TALLY":                   "TY",
  "TALLY PRIME":             "TY",
  "TALLY PRIME WITH GST":    "TY",
  "TALLY ERP":               "TY",
  "TALLY ERP 9.0":           "TY",
  "TALLY ERP 9.0 WITH GST":  "TY",
  "CCC":                     "CCC",
  "CCC+":                    "CCCP",
  "O-LEVEL":                 "OL",
  "O LEVEL":                 "OL",
  "O-LEVEL — 12":            "OL",
  "O LEVEL — 12":            "OL",
  "O LEVEL - 12":            "OL",
  "O-LEVEL - 12":            "OL",
  "RSCIT":                   "RSCIT",
  "DIGITAL MARKETING":       "DM",
  "WEB DEVELOPMENT":         "WD",
  "OTHER":                   "GEN",
};

// Derive short code from a course name string (case-insensitive, partial match)
export function getCourseCode(courseName: string): string {
  const upper = courseName.toUpperCase().trim();
  // Exact match first
  if (COURSE_CODE_MAP[upper]) return COURSE_CODE_MAP[upper];
  // Partial match — longest key first to avoid "TALLY" matching before "TALLY PRIME WITH GST"
  const sortedKeys = Object.keys(COURSE_CODE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (upper.includes(key)) return COURSE_CODE_MAP[key];
  }
  // Fallback: first word(s) uppercased, max 5 chars
  return upper.replace(/\s+/g, "").slice(0, 5);
}

// Build enrollment number: e.g. "ADCA-2026-001" or "TY-2026-001"
export function buildEnrollmentNo(courseName: string, rollNumber: string): string {
  const year = new Date().getFullYear();
  const code = getCourseCode(courseName);
  const seq = rollNumber.replace(/\D/g, "").slice(-4).padStart(3, "0") || "001";
  return `${code}-${year}-${seq}`;
}

// Build course code for certificate: e.g. "ADCA-2026", "TY-2026"
export function buildCourseCode(courseName: string): string {
  const year = new Date().getFullYear();
  return `${getCourseCode(courseName)}-${year}`;
}

// ─── Course-wise subject templates ────────────────────────────────────────────
// Each subject has blank totals/grades — they will be filled by admin & auto-calculated

function sub(
  paper: string,
  subject: string,
  theoryMax = "60",
  practicalMax = "40"
): MarkRow {
  return {
    paper,
    subject,
    theoryMax,
    theoryMin:    "",
    practicalMax,
    practicalMin: "",
    total:        "",
    grade:        "",
  };
}

export const COURSE_SUBJECTS: Record<string, MarkRow[]> = {

  ADCA: [
    sub("1", "FUNDAMENTAL OF COMPUTER", "60", "40"),
    sub("2", "MS-OFFICE",               "60", "40"),
    sub("3", "DTP",                     "60", "40"),
    sub("4", "TALLY 7.2 & 9.0",         "60", "40"),
    sub("5", "INTERNET",                "60", "40"),
    sub("6", "MS WINDOWS",              "60", "40"),
  ],

  DCA: [
    sub("1", "FUNDAMENTAL OF COMPUTER", "60", "40"),
    sub("2", "MS-OFFICE",               "60", "40"),
    sub("3", "INTERNET",                "60", "40"),
    sub("4", "MS WINDOWS",              "60", "40"),
    sub("5", "TALLY 7.2 & 9.0",         "60", "40"),
  ],

  TALLY: [
    sub("1", "COMPUTER FUNDAMENTAL",    "60", "40"),
    sub("2", "RULE OF ACCOUNTING",      "60", "40"),
    sub("3", "TALLY ERP 9.0 WITH GST",  "60", "40"),
  ],

  "TALLY PRIME": [
    sub("1", "COMPUTER FUNDAMENTAL",    "60", "40"),
    sub("2", "RULE OF ACCOUNTING",      "60", "40"),
    sub("3", "TALLY PRIME WITH GST",    "60", "40"),
  ],

  "TALLY PRIME WITH GST": [
    sub("1", "COMPUTER FUNDAMENTAL",    "60", "40"),
    sub("2", "RULE OF ACCOUNTING",      "60", "40"),
    sub("3", "TALLY PRIME WITH GST",    "60", "40"),
  ],

  "TALLY ERP": [
    sub("1", "COMPUTER FUNDAMENTAL",    "60", "40"),
    sub("2", "RULE OF ACCOUNTING",      "60", "40"),
    sub("3", "TALLY ERP 9.0 WITH GST",  "60", "40"),
  ],

  CCC: [
    sub("1", "INTRODUCTION TO COMPUTER",       "50", "50"),
    sub("2", "MS-OFFICE (WORD, EXCEL, PPT)",   "50", "50"),
    sub("3", "INTERNET & E-GOVERNANCE",        "50", "50"),
  ],

  "CCC+": [
    sub("1", "INTRODUCTION TO COMPUTER",       "50", "50"),
    sub("2", "MS-OFFICE (WORD, EXCEL, PPT)",   "50", "50"),
    sub("3", "INTERNET & E-GOVERNANCE",        "50", "50"),
    sub("4", "ADVANCED SPREADSHEET",           "50", "50"),
    sub("5", "DATABASE MANAGEMENT",            "50", "50"),
  ],

  "O-LEVEL": [
    sub("1", "IT TOOLS AND BUSINESS SYSTEMS",   "60", "40"),
    sub("2", "INTERNET TECHNOLOGY & WEB DESIGN","60", "40"),
    sub("3", "PROGRAMMING & PROBLEM SOLVING",   "60", "40"),
    sub("4", "APPLICATION OF .NET TECHNOLOGY",  "60", "40"),
    sub("5", "INTRODUCTION TO ICT RESOURCES",   "60", "40"),
  ],

  RSCIT: [
    sub("1", "INTRODUCTION TO COMPUTER",     "35", "15"),
    sub("2", "MS-OFFICE",                    "35", "15"),
    sub("3", "INTERNET & EMAIL",             "35", "15"),
  ],

  "DIGITAL MARKETING": [
    sub("1", "FUNDAMENTALS OF DIGITAL MARKETING","60", "40"),
    sub("2", "SEO & SEM",                        "60", "40"),
    sub("3", "SOCIAL MEDIA MARKETING",           "60", "40"),
    sub("4", "EMAIL & CONTENT MARKETING",        "60", "40"),
  ],

  "WEB DEVELOPMENT": [
    sub("1", "HTML & CSS",             "60", "40"),
    sub("2", "JAVASCRIPT",             "60", "40"),
    sub("3", "REACT.JS / NEXT.JS",     "60", "40"),
    sub("4", "NODE.JS & EXPRESS",      "60", "40"),
    sub("5", "DATABASE (SQL/MONGODB)", "60", "40"),
  ],
};

// Get subjects for a course name (case-insensitive, partial match, fallback to ADCA)
export function getSubjectsForCourse(courseName: string): MarkRow[] {
  const upper = courseName.toUpperCase().trim();
  // Exact key match
  for (const key of Object.keys(COURSE_SUBJECTS)) {
    if (upper === key) return COURSE_SUBJECTS[key].map((s) => ({ ...s }));
  }
  // Partial match (longest key wins to avoid "CCC" matching "CCC+")
  const sorted = Object.keys(COURSE_SUBJECTS).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (upper.includes(key)) return COURSE_SUBJECTS[key].map((s) => ({ ...s }));
  }
  // Fallback — ADCA template
  return COURSE_SUBJECTS["ADCA"].map((s) => ({ ...s }));
}

// ─── Grade calculation ────────────────────────────────────────────────────────
export function calcGrade(obtainedStr: string, maxStr: string): string {
  const obtained = parseFloat(obtainedStr);
  const max      = parseFloat(maxStr);
  if (!maxStr || isNaN(obtained) || isNaN(max) || max === 0) return "";
  const pct = (obtained / max) * 100;
  if (pct >= 90) return "S";       // Outstanding
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  if (pct >= 33) return "D";
  return "F";
}

// Overall grade from all subjects
export function calcOverallGrade(subjects: MarkRow[]): string {
  const totalObtained = subjects.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
  const totalMax      = subjects.reduce((sum, s) => {
    const th = parseFloat(s.theoryMax)    || 0;
    const pr = parseFloat(s.practicalMax) || 0;
    return sum + th + pr;
  }, 0);
  return calcGrade(String(totalObtained), String(totalMax));
}

export const DEFAULT_SUBJECTS: MarkRow[] = [
  {
    paper: "1",
    subject: "FUNDAMENTAL OF COMPUTER",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "138",
    grade: "A+",
  },
  {
    paper: "2",
    subject: "MS-OFFICE",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "132",
    grade: "A",
  },
  {
    paper: "3",
    subject: "DTP",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "140",
    grade: "A+",
  },
  {
    paper: "4",
    subject: "TALLY 7.2 & 9.0",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "126",
    grade: "A",
  },
  {
    paper: "5",
    subject: "INTERNET",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "135",
    grade: "A+",
  },
  {
    paper: "6",
    subject: "MS WINDOWS",
    theoryMax: "100",
    theoryMin: "40",
    practicalMax: "50",
    practicalMin: "20",
    total: "129",
    grade: "A",
  },
];

export const SAMPLE_CERTIFICATE: CertificateData = {
  documentType: "excellence",
  certificateNumber: "RCC-2026-0001",
  slNo: "001",
  rollNo: "RCC/2026/001",
  enrollmentNo: "RAMA-2026-001",
  studentName: "Rahul Kumar",
  fatherName: "Rajesh Kumar",
  courseCode: "ADCA-2026",
  courseName: "ADVANCE DIPLOMA IN COMPUTER APPLICATION",
  completionDate: "28 August 2026",
  trainingCenter: "Rama Coaching Center, Main Branch",
  centerCode: "RCC-001",
  performance: "A+",
  motherName: "Sunita Kumari",
  courseDuration: "12 Months",
  photoUrl: "",
  subjects: DEFAULT_SUBJECTS,
  dated: "28 August 2026",
  place: "Patna",
};
