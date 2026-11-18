import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import ChasseAdminClient from "./ChasseAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminChassePage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");
  return <ChasseAdminClient />;
}
