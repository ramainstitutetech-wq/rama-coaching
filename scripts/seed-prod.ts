import "dotenv/config";
import { connectDB } from "../lib/db";
import { hashPassword } from "../lib/auth";
import User from "../models/User";
import Student from "../models/Student";
import Course from "../models/Course";
import Certificate from "../models/Certificate";
import Testimonial from "../models/Testimonial";
import Banner from "../models/Banner";
import Achievement from "../models/Achievement";
import Notice from "../models/Notice";
import ContactMessage from "../models/ContactMessage";
import FranchiseApplication from "../models/FranchiseApplication";
import Settings from "../models/Settings";

import { students as seedStudents } from "../data/students";
import { courses as seedCourses } from "../data/courses";
import { certificates as seedCertificates } from "../data/certificates";
import { testimonials as seedTestimonials } from "../data/testimonials";
import { banners as seedBanners } from "../data/banners";
import { achievements as seedAchievements } from "../data/achievements";
import { notices as seedNotices } from "../data/notices";
import { messages as seedMessages } from "../data/messages";
import { franchiseApplications as seedFranchise } from "../data/franchise";
import { instituteSettings } from "../data/settings";

function parseDate(str: string): Date {
  if (!str) return new Date();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
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

async function main() {
  await connectDB();
  console.log("Clearing existing data...");
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
  console.log("Cleared.");

  const adminHash = await hashPassword("Admin@123");
  await User.create({ name: "Admin", email: "admin@ramacoaching.com", passwordHash: adminHash, role: "admin", status: "active" });
  console.log("Admin created: admin@ramacoaching.com / Admin@123");

  const courseMap = new Map<string, string>();
  for (const c of seedCourses) {
    const doc = await Course.create({ name: c.name, description: c.description, duration: c.duration, fees: c.fees, category: c.category, accent: c.accent, status: c.status });
    courseMap.set(c.name, String(doc._id));
  }
  for (const s of seedStudents) {
    if (!courseMap.has(s.course)) {
      const doc = await Course.create({ name: s.course, description: `${s.course} course`, duration: "6 Months", fees: "₹0", category: "General", status: "active" });
      courseMap.set(s.course, String(doc._id));
    }
  }
  console.log(`Courses: ${courseMap.size}`);

  const studentMap = new Map<string, string>();
  const defaultStudentHash = await hashPassword("Student@123");
  for (const s of seedStudents) {
    const courseId = courseMap.get(s.course) || [...courseMap.values()][0];
    const doc = await Student.create({
      fullName: s.fullName, rollNumber: s.rollNumber, email: s.email.toLowerCase(), phone: s.phone,
      courseId, courseName: s.course, batch: s.batch, admissionDate: parseDate(s.admissionDate), status: s.status, avatarColor: s.avatarColor,
      photoUrl: "",
      passwordHash: defaultStudentHash,
    });
    studentMap.set(s.rollNumber, String(doc._id));
  }
  console.log(`Students: ${studentMap.size} (default password: Student@123)`);

  let certCount = 0;
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
      isSentToStudent: certCount % 2 === 0,
      subjects: cert.type === "marksheet" ? [
        { paper: "1", subject: "Computer Fundamentals", theoryMax: 100, theoryMin: 40, practicalMax: 50, practicalMin: 20, total: 120, grade: "A" },
        { paper: "2", subject: "MS Office", theoryMax: 100, theoryMin: 40, practicalMax: 50, practicalMin: 20, total: 135, grade: "A+" },
      ] : [],
    });
    certCount++;
  }
  console.log(`Certificates: ${certCount} (half sent to student)`);

  for (const t of seedTestimonials) await Testimonial.create({ studentName: t.studentName, course: t.course, review: t.review, rating: t.rating, published: t.published, avatarColor: t.avatarColor });
  for (const b of seedBanners) await Banner.create({ heading: b.heading, description: b.description, buttonText: b.buttonText, buttonLink: b.buttonLink, accent: b.accent, active: b.active, ordering: 0 });
  for (const a of seedAchievements) await Achievement.create({ value: a.value, label: a.label, description: a.description, icon: a.icon, status: a.status, ordering: 0 });
  for (const n of seedNotices) await Notice.create({ title: n.title, description: n.description, date: parseDate(n.date), priority: n.priority, published: n.published });
  for (const m of seedMessages) await ContactMessage.create({ name: m.name, email: m.email, phone: m.phone, message: m.message, status: m.status, date: parseDate(m.date) });
  for (const f of seedFranchise) await FranchiseApplication.create({ name: f.name, email: f.email, phone: f.phone, city: f.city, state: f.state, message: f.message, status: f.status, date: parseDate(f.date) });
  await Settings.create({ ...instituteSettings });
  console.log("Seed complete!");
  process.exit(0);
}
main().catch(e=>{console.error(e); process.exit(1)});
