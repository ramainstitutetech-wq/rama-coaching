import type { Student } from "./types";

export const students: Student[] = [
  { id: "st-01", fullName: "Rahul Kumar", rollNumber: "RCC/2026/001", email: "rahul.kumar@example.com", phone: "9876543210", course: "ADCA", batch: "Morning-A", admissionDate: "12 Jan 2026", status: "active", avatarColor: "#1F3354" },
  { id: "st-02", fullName: "Priya Sharma", rollNumber: "RCC/2026/002", email: "priya.sharma@example.com", phone: "9867543210", course: "Digital Marketing", batch: "Evening-B", admissionDate: "18 Jan 2026", status: "active", avatarColor: "#b91c1c" },
  { id: "st-03", fullName: "Amit Singh", rollNumber: "RCC/2026/003", email: "amit.singh@example.com", phone: "9856543210", course: "Tally Prime", batch: "Morning-A", admissionDate: "22 Jan 2026", status: "completed", avatarColor: "#0f766e" },
  { id: "st-04", fullName: "Sunita Verma", rollNumber: "RCC/2026/004", email: "sunita.verma@example.com", phone: "9846543210", course: "RSCIT", batch: "Weekend-C", admissionDate: "02 Feb 2026", status: "active", avatarColor: "#7c3aed" },
  { id: "st-05", fullName: "Vikash Gupta", rollNumber: "RCC/2026/005", email: "vikash.gupta@example.com", phone: "9836543210", course: "Web Development", batch: "Morning-B", admissionDate: "09 Feb 2026", status: "active", avatarColor: "#c2410c" },
  { id: "st-06", fullName: "Neha Yadav", rollNumber: "RCC/2026/006", email: "neha.yadav@example.com", phone: "9826543210", course: "DCA", batch: "Evening-A", admissionDate: "14 Feb 2026", status: "pending", avatarColor: "#0369a1" },
  { id: "st-07", fullName: "Rohit Mehta", rollNumber: "RCC/2026/007", email: "rohit.mehta@example.com", phone: "9816543210", course: "ADCA", batch: "Morning-A", admissionDate: "20 Feb 2026", status: "active", avatarColor: "#15803d" },
  { id: "st-08", fullName: "Kavita Joshi", rollNumber: "RCC/2026/008", email: "kavita.joshi@example.com", phone: "9806543210", course: "CCC", batch: "Weekend-C", admissionDate: "26 Feb 2026", status: "completed", avatarColor: "#a16207" },
  { id: "st-09", fullName: "Sandeep Rao", rollNumber: "RCC/2026/009", email: "sandeep.rao@example.com", phone: "9796543210", course: "Tally Prime", batch: "Morning-B", admissionDate: "03 Mar 2026", status: "active", avatarColor: "#be185d" },
  { id: "st-10", fullName: "Anjali Nair", rollNumber: "RCC/2026/010", email: "anjali.nair@example.com", phone: "9786543210", course: "Digital Marketing", batch: "Evening-B", admissionDate: "11 Mar 2026", status: "inactive", avatarColor: "#1d4ed8" },
  { id: "st-11", fullName: "Manoj Tiwari", rollNumber: "RCC/2026/011", email: "manoj.tiwari@example.com", phone: "9776543210", course: "Basic Computer Course", batch: "Morning-A", admissionDate: "19 Mar 2026", status: "active", avatarColor: "#4d7c0f" },
  { id: "st-12", fullName: "Pooja Saxena", rollNumber: "RCC/2026/012", email: "pooja.saxena@example.com", phone: "9766543210", course: "Web Development", batch: "Evening-A", admissionDate: "27 Mar 2026", status: "active", avatarColor: "#9333ea" },
  { id: "st-13", fullName: "Deepak Soni", rollNumber: "RCC/2026/013", email: "deepak.soni@example.com", phone: "9756543210", course: "RSCIT", batch: "Weekend-C", admissionDate: "04 Apr 2026", status: "pending", avatarColor: "#0e7490" },
  { id: "st-14", fullName: "Ritu Agarwal", rollNumber: "RCC/2026/014", email: "ritu.agarwal@example.com", phone: "9746543210", course: "DCA", batch: "Morning-B", admissionDate: "12 Apr 2026", status: "active", avatarColor: "#c2410c" },
];

export const studentCourses = Array.from(new Set(students.map((s) => s.course))).sort();
