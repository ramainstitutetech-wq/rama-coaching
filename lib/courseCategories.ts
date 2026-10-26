/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH — Course Categories
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL category usage across the app (Course model, MockTest model,
 * Course admin UI, MockTest admin UI, student portal, e-notes) must
 * reference this file. Never define categories inline elsewhere.
 *
 * To add a new category in future:
 *   1. Add it to COURSE_CATEGORIES below.
 *   2. That's it — all dropdowns, filters and type-checks update automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const COURSE_CATEGORIES = [
  "General",          // shown to ALL students (admin sets this for universal tests/notes)
  "Basic Computer",
  "CCC",
  "CCC+",
  "ADCA",
  "DCA",
  "O-Level",
  "Tally",
  "Digital Marketing",
  "RSCIT",
  "Academic",         // Class 1–12 school students
  "Other",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

// ─── Human-readable labels for UI dropdowns ──────────────────────────────────
export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  "General":          "General (All Students)",
  "Basic Computer":   "Basic Computer Course",
  "CCC":              "CCC — Course on Computer Concepts",
  "CCC+":             "CCC+",
  "ADCA":             "ADCA — Advanced Diploma",
  "DCA":              "DCA — Diploma in Computer Applications",
  "O-Level":          "O-Level (NIELIT)",
  "Tally":            "Tally Prime with GST",
  "Digital Marketing":"Digital Marketing",
  "RSCIT":            "RSCIT",
  "Academic":         "Academic (Class 1–12)",
  "Other":            "Other",
};

// ─── Legacy → Canonical mapping ───────────────────────────────────────────────
// Old courses stored values like "Diploma", "Certification", "Foundation".
// This map normalizes them so old DB records still work without migration.
export const LEGACY_CATEGORY_MAP: Record<string, CourseCategory> = {
  // Old Course admin categories
  "Diploma":        "ADCA",
  "Certification":  "CCC",
  "Foundation":     "Basic Computer",
  "Accounting":     "Tally",
  "Marketing":      "Digital Marketing",
  "Development":    "Other",

  // Possible freeform entries
  "Basic":          "Basic Computer",
  "Basics":         "Basic Computer",
  "Basic Computer Course": "Basic Computer",
  "Computer Basics":"Basic Computer",
  "Tally Prime":    "Tally",
  "Tally with GST": "Tally",
  "DM":             "Digital Marketing",
  "Web Development":"Other",
  "Web Dev":        "Other",
};

/**
 * Normalize ANY raw category string → canonical CourseCategory.
 * Safe to call on untrusted/DB data — never throws.
 *
 * Resolution order:
 *   1. Already a valid canonical category → return as-is
 *   2. Matches a legacy alias → return mapped canonical value
 *   3. Case-insensitive match against canonical list → return match
 *   4. Fallback → "General" (so student always sees at least General tests)
 */
export function normalizeCategory(raw: string | null | undefined): CourseCategory {
  if (!raw || typeof raw !== "string") return "General";
  const trimmed = raw.trim();

  // 1. Exact canonical match
  if ((COURSE_CATEGORIES as readonly string[]).includes(trimmed)) {
    return trimmed as CourseCategory;
  }

  // 2. Legacy alias match (exact)
  if (LEGACY_CATEGORY_MAP[trimmed]) {
    return LEGACY_CATEGORY_MAP[trimmed];
  }

  // 3. Case-insensitive canonical match
  const lower = trimmed.toLowerCase();
  const ciMatch = COURSE_CATEGORIES.find(c => c.toLowerCase() === lower);
  if (ciMatch) return ciMatch;

  // 4. Case-insensitive legacy match
  const legacyKey = Object.keys(LEGACY_CATEGORY_MAP).find(k => k.toLowerCase() === lower);
  if (legacyKey) return LEGACY_CATEGORY_MAP[legacyKey];

  // 5. Fallback
  return "General";
}

/**
 * Returns the display label for a category.
 * Safe to call on any string — falls back gracefully.
 */
export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat as CourseCategory] ?? cat;
}
