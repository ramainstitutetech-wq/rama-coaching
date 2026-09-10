export type StudentStatus = "active" | "completed" | "pending" | "inactive";

export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  admissionDate: string;
  status: StudentStatus;
  avatarColor: string;
  photoUrl?: string;
}

export type CertificateType = "excellence" | "marksheet";
export type CertificateStatus = "issued" | "pending" | "revoked";

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentName: string;
  rollNumber: string;
  course: string;
  type: CertificateType;
  issueDate: string;
  status: CertificateStatus;
  isSentToStudent?: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  fees: string;
  category: string;
  accent: string;
  imageUrl?: string;
  status: "active" | "inactive";
}

export interface Testimonial {
  id: string;
  studentName: string;
  course: string;
  review: string;
  rating: number;
  published: boolean;
  avatarColor: string;
}

export interface Banner {
  id: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  accent: string;
}

export interface Achievement {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
}

export type NoticePriority = "low" | "normal" | "high";

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: NoticePriority;
  published: boolean;
}

export type MessageStatus = "read" | "unread";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: MessageStatus;
}

export type FranchiseStatus = "pending" | "contacted" | "approved" | "rejected";

export interface FranchiseApplication {
  id: string;
  name: string;
  ownerName?: string;
  instituteName?: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  message: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  documentUrl?: string;
  documentName?: string;
  date: string;
  status: FranchiseStatus;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface FranchiseCertificate {
  id: string;
  applicationId: string;
  certificateNumber: string;
  ownerName: string;
  instituteName: string;
  city: string;
  state: string;
  duration: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  status: "issued" | "revoked";
}

export interface MockTestQuestion {
  id: string;
  questionText: string;
  questionTextHi?: string;   // Hindi translation of the question
  options: string[];          // exactly 4
  optionsHi?: string[];       // Hindi translations of options (exactly 4)
  correctOption: number;      // 0-indexed
  explanation: string;
  explanationHi?: string;     // Hindi translation of explanation
  marks: number;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  subject: string;
  courseCategory: string;
  isFree: boolean;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: MockTestQuestion[];
  status: "active" | "inactive";
  attemptLimit: number;
}

export interface InstituteSettings {
  instituteName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  footerText: string;
  secretarySignatureUrl?: string;
  controllerSignatureUrl?: string;
  stampUrl?: string;
}
