import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import Student from "@/models/Student";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";
import Testimonial from "@/models/Testimonial";
import Banner from "@/models/Banner";
import Achievement from "@/models/Achievement";
import Notice from "@/models/Notice";
import ContactMessage from "@/models/ContactMessage";
import FranchiseApplication from "@/models/FranchiseApplication";
import Settings from "@/models/Settings";

// Import seed data
import { students as seedStudents } from "@/data/students";
import { courses as seedCourses } from "@/data/courses";
import { certificates as seedCertificates } from "@/data/certificates";
import { testimonials as seedTestimonials } from "@/data/testimonials";
import { banners as seedBanners } from "@/data/banners";
import { achievements as seedAchievements } from "@/data/achievements";
import { notices as seedNotices } from "@/data/notices";
import { messages as seedMessages } from "@/data/messages";
import { franchiseApplications as seedFranchise } from "@/data/franchise";
import { instituteSettings } from "@/data/settings";

function parseDate(str: string): Date {
  if (!str) return new Date();
  // Try parsing "12 Jan 2026" or "2026-01-12" or ISO
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  // Try DD MMM YYYY
  const parts = str.split(" ");
  if (parts.length === 3) {
    const months: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const day = parseInt(parts[0], 10);
    const mon = months[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && mon !== undefined && !isNaN(year)) return new Date(year, mon, day);
  }
  return new Date();
}

export async function POST() {
  try {
    await connectDB();

    // Check if already seeded
    const existingStudents = await Student.countDocuments();
    if (existingStudents > 0) {
      return NextResponse.json({ success: false, error: "Database already seeded. Clear first." }, { status: 400 });
    }

    // 1. Admin user
    const adminHash = await hashPassword("Admin@123");
    await User.create({ name: "Admin", email: "admin@ramacoaching.com", passwordHash: adminHash, role: "admin", status: "active" });

    // 2. Courses
    const courseMap = new Map<string, string>();
    for (const c of seedCourses) {
      const doc = await Course.create({
        name: c.name, description: c.description, duration: c.duration, fees: c.fees, category: c.category, accent: c.accent, status: c.status,
      });
      courseMap.set(c.name, String(doc._id));
    }
    // Also ensure student courses exist
    for (const s of seedStudents) {
      if (!courseMap.has(s.course)) {
        const doc = await Course.create({ name: s.course, description: `${s.course} course`, duration: "6 Months", fees: "₹0", category: "General", status: "active" });
        courseMap.set(s.course, String(doc._id));
      }
    }

    // 3. Students
    const studentMap = new Map<string, string>(); // rollNumber -> _id
    for (const s of seedStudents) {
      const courseId = courseMap.get(s.course) || [...courseMap.values()][0];
      const doc = await Student.create({
        fullName: s.fullName, rollNumber: s.rollNumber, email: s.email.toLowerCase(), phone: s.phone,
        courseId, courseName: s.course, batch: s.batch, admissionDate: parseDate(s.admissionDate), status: s.status, avatarColor: s.avatarColor,
      });
      studentMap.set(s.rollNumber, String(doc._id));
    }

    // 4. Certificates
    for (const cert of seedCertificates) {
      const studentId = studentMap.get(cert.rollNumber);
      if (!studentId) continue;
      const courseId = courseMap.get(cert.course) || [...courseMap.values()][0];
      await Certificate.create({
        certificateNumber: cert.certificateNumber,
        studentId, courseId,
        documentType: cert.type, type: cert.type,
        slNo: cert.certificateNumber.slice(-3),
        rollNo: cert.rollNumber, enrollmentNo: cert.rollNumber,
        studentName: cert.studentName,
        fatherName: "Father Name",
        courseCode: cert.course.replace(/\s+/g, "").toUpperCase() + "-2026",
        courseName: cert.course,
        completionDate: parseDate(cert.issueDate),
        trainingCenter: "Rama Coaching Center, Main Branch",
        issueDate: parseDate(cert.issueDate),
        status: cert.status,
        dated: cert.issueDate,
        place: "Fatehpur",
        subjects: cert.type === "marksheet" ? [
          { paper: "1", subject: "Computer Fundamentals", theoryMax: 100, theoryMin: 40, practicalMax: 50, practicalMin: 20, total: 120, grade: "A" },
          { paper: "2", subject: "MS Office", theoryMax: 100, theoryMin: 40, practicalMax: 50, practicalMin: 20, total: 135, grade: "A+" },
        ] : [],
      });
    }

    // 5. Testimonials
    for (const t of seedTestimonials) {
      await Testimonial.create({ studentName: t.studentName, course: t.course, review: t.review, rating: t.rating, published: t.published, avatarColor: t.avatarColor });
    }

    // 6. Banners
    for (const b of seedBanners) {
      await Banner.create({ heading: b.heading, description: b.description, buttonText: b.buttonText, buttonLink: b.buttonLink, accent: b.accent, active: b.active, ordering: 0 });
    }

    // 7. Achievements
    for (const a of seedAchievements) {
      await Achievement.create({ value: a.value, label: a.label, description: a.description, icon: a.icon, status: a.status, ordering: 0 });
    }

    // 8. Notices
    for (const n of seedNotices) {
      await Notice.create({ title: n.title, description: n.description, date: parseDate(n.date), priority: n.priority, published: n.published });
    }

    // 9. Messages
    for (const m of seedMessages) {
      await ContactMessage.create({ name: m.name, email: m.email, phone: m.phone, message: m.message, status: m.status, date: parseDate(m.date) });
    }

    // 10. Franchise
    for (const f of seedFranchise) {
      await FranchiseApplication.create({ name: f.name, email: f.email, phone: f.phone, city: f.city, state: f.state, message: f.message, status: f.status, date: parseDate(f.date) });
    }

    // 11. Settings
    await Settings.create({ ...instituteSettings });

    return NextResponse.json({ success: true, message: "Database seeded successfully", counts: { students: seedStudents.length, courses: courseMap.size, certificates: seedCertificates.length } });
  } catch (e) {
    console.error("[seed]", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
      Certificate.deleteMany({}),
      Testimonial.deleteMany({}),
      Banner.deleteMany({}),
      Achievement.deleteMany({}),
      Notice.deleteMany({}),
      ContactMessage.deleteMany({}),
      FranchiseApplication.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    return NextResponse.json({ success: true, message: "Database cleared" });
  } catch (e) {
    console.error("[seed clear]", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
