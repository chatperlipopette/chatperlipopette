import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import PartnersAdmin from "./PartnersAdmin";
export const dynamic = "force-dynamic";
export default async function PartnersPage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");
  return <PartnersAdmin />;
}
