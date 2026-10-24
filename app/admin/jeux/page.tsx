import { redirect } from "next/navigation";

// Le gestionnaire des jeux (édition des fiches, prix et disponibilité)
// est intégré à la page catalogue d’administration.
export default function AdminJeuxPage() {
  redirect("/admin/catalogue");
}
