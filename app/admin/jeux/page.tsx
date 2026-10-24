import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { getGames } from "@/lib/games";
import GestionJeuxClient from "./GestionJeuxClient";

export const dynamic = "force-dynamic";

export default async function AdminJeuxPage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");
  const games = await getGames();
  return <GestionJeuxClient games={games} />;
}
