import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import AnnoncesAdminClient from "./AnnoncesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminAnnoncesPage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");
  return <AnnoncesAdminClient />;
}
