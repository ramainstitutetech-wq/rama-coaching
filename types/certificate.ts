export type DocumentType = "excellence" | "marksheet";

export type MarkRow = {
  paper: string;
  subject: string;
  theoryMax: string;
  theoryMin: string;
  practicalMax: string;
  practicalMin: string;
  total: string;
  grade: string;
};

export type CertificateData = {
  documentType: DocumentType;

  /* Unique certificate identifier — printed on the document */
  certificateNumber: string;

  /* Header meta (serial / roll / enrollment) */
  slNo: string;
  rollNo: string;
  enrollmentNo: string;

  /* Student & course (shared) */
  studentName: string;
  fatherName: string;
  courseCode: string;
  courseName: string;
  completionDate: string;
  trainingCenter: string;

  /* Certificate of Excellence only */
  centerCode: string;
  performance: string;

  /* Marksheet only */
  motherName: string;
  courseDuration: string;
  photoUrl: string;
  subjects: MarkRow[];

  /* Footer */
  dated: string;
  place: string;
};

export type CertificateErrors = Partial<Record<keyof CertificateData, string>> & {
  subjects?: string;
};
