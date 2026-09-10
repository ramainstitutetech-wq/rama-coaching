import type { CertificateData, CertificateErrors } from "@/types/certificate";

function requiredIf(
  errors: CertificateErrors,
  data: CertificateData,
  field: keyof CertificateData,
  label: string
) {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    errors[field] = `${label} is required.`;
  }
}

export function validateCertificate(data: CertificateData): CertificateErrors {
  const errors: CertificateErrors = {};

  requiredIf(errors, data, "studentName", "Student name");
  requiredIf(errors, data, "fatherName", "Father's name");
  requiredIf(errors, data, "courseName", "Course name");
  requiredIf(errors, data, "courseCode", "Course code");
  requiredIf(errors, data, "completionDate", "Date of completion");
  requiredIf(errors, data, "trainingCenter", "Training center");
  requiredIf(errors, data, "enrollmentNo", "Enrollment number");
  requiredIf(errors, data, "rollNo", "Roll number");
  requiredIf(errors, data, "slNo", "Sl. number");
  requiredIf(errors, data, "dated", "Dated");
  requiredIf(errors, data, "place", "Place");

  if (data.documentType === "excellence") {
    requiredIf(errors, data, "centerCode", "Center code");
    requiredIf(errors, data, "performance", "Performance");
  }

  if (data.documentType === "marksheet") {
    requiredIf(errors, data, "motherName", "Mother's name");
    requiredIf(errors, data, "courseDuration", "Course duration");

    const incomplete = data.subjects.find(
      (row) => row.total.trim() === "" || row.grade.trim() === ""
    );
    if (incomplete) {
      errors.subjects = "Every subject must have a total and a grade.";
    }
  }

  return errors;
}

export function hasErrors(errors: CertificateErrors): boolean {
  return Object.keys(errors).length > 0;
}
