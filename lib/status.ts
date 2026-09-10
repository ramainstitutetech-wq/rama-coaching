import type {
  StudentStatus,
  CertificateStatus,
  FranchiseStatus,
  NoticePriority,
  MessageStatus,
} from "@/data/types";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const studentStatusVariant: Record<StudentStatus, BadgeVariant> = {
  active: "success",
  completed: "info",
  pending: "warning",
  inactive: "neutral",
};

export const certificateStatusVariant: Record<CertificateStatus, BadgeVariant> = {
  issued: "success",
  pending: "warning",
  revoked: "danger",
};

export const franchiseStatusVariant: Record<FranchiseStatus, BadgeVariant> = {
  pending: "warning",
  contacted: "info",
  approved: "success",
  rejected: "danger",
};

export const noticePriorityVariant: Record<NoticePriority, BadgeVariant> = {
  low: "neutral",
  normal: "info",
  high: "danger",
};

export const messageStatusVariant: Record<MessageStatus, BadgeVariant> = {
  read: "neutral",
  unread: "info",
};

export const courseStatusVariant: Record<"active" | "inactive", BadgeVariant> = {
  active: "success",
  inactive: "neutral",
};

export const mockTestStatusVariant: Record<"active" | "inactive", BadgeVariant> = {
  active: "success",
  inactive: "neutral",
};

export const boolStatusVariant = (published: boolean): BadgeVariant =>
  published ? "success" : "neutral";

export const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);
