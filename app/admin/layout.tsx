import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
