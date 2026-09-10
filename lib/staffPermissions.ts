import type { StaffPage } from "@/lib/staff-pages";

export interface PagePermission {
  page: StaffPage;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export function hasPerm(
  permissions: PagePermission[],
  page: StaffPage,
  action: "read" | "write" | "delete"
): boolean {
  const p = permissions.find((x) => x.page === page);
  if (!p) return false;
  return p[action] === true;
}

export function getAccessiblePages(permissions: PagePermission[]): StaffPage[] {
  return permissions.filter((p) => p.read || p.write || p.delete).map((p) => p.page);
}
