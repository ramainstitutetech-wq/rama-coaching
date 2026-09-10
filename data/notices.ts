import type { Notice } from "./types";

export const notices: Notice[] = [
  { id: "n-01", title: "New Batch Starting — ADCA", description: "Fresh ADCA batch begins on 5 September 2026. Seats are limited, enroll early.", date: "29 Aug 2026", priority: "high", published: true },
  { id: "n-02", title: "Holiday Notice — Festive Break", description: "Institute will remain closed on 2 October 2026 for Gandhi Jayanti.", date: "28 Aug 2026", priority: "normal", published: true },
  { id: "n-03", title: "Tally Prime Workshop", description: "Free GST workshop for existing students every Saturday, 2 PM onwards.", date: "25 Aug 2026", priority: "normal", published: true },
  { id: "n-04", title: "Exam Form Last Date", description: "NIELIT CCC exam form submission closes on 10 September 2026.", date: "22 Aug 2026", priority: "high", published: false },
  { id: "n-05", title: "Lab Maintenance", description: "Computer lab will be upgraded next week; timings may vary.", date: "18 Aug 2026", priority: "low", published: true },
];
