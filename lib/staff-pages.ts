// ── Client-safe constants for staff pages ──────────────────────────────────
// This file has NO server/mongoose imports so it can be used in both
// client components and server-side models.

export const STAFF_PAGES = [
  "dashboard",
  "students",
  "certificates",
  "marksheets",
  "courses",
  "mock-tests",
  "testimonials",
  "banners",
  "achievements",
  "notices",
  "messages",
  "franchise",
  "settings",
] as const;

export type StaffPage = (typeof STAFF_PAGES)[number];

export interface IPagePermission {
  page: StaffPage;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export const PAGE_LABELS: Record<StaffPage, string> = {
  dashboard:     "Dashboard",
  students:      "Students",
  certificates:  "Certificates",
  marksheets:    "Marksheets",
  courses:       "Courses",
  "mock-tests":  "Mock Tests",
  testimonials:  "Testimonials",
  banners:       "Banners",
  achievements:  "Achievements",
  notices:       "Notices",
  messages:      "Messages",
  franchise:     "Franchise",
  settings:      "Settings",
};
