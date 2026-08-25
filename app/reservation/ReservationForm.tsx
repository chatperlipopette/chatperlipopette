"use client";

import { FormEvent, useState } from "react";

/* =========================================================
   URL GOOGLE APPS SCRIPT
========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwHFVFRttFhytx7CQ7Ho8Pi7topvrJAYerngds6liFmrA-5N5icXd5Euiu_mcVXAJXp/exec";

/* =========================================================
   PROPS
========================================================= */

type Props = {
  codeBarre: string;
  jeu: string;
};

/* =========================================================
   FORMULAIRE
========================================================= */

export default function ReservationForm({
  codeBarre,
  jeu,
}: Props) {

  /* =======================================================
     ÉTAT
  ======================================================= */

  const [envoi, setEnvoi] =
    useState(false);

  const [messageSucces, setMessageSucces] =
    useState(false);

  const [messageErreur, setMessageErreur] =
    useState("");

  /* =======================================================
     DATE MINIMUM
  ======================================================= */

  const aujourdHui =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =======================================================
     ENVOI
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setMessageErreur("");
    setMessageSucces(false);
    setEnvoi(true);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const dateDebut =
      String(
        formData.get(
          "date_debut"
        ) ?? ""
      );

    const dateRetour =
      String(
        formData.get(
          "date_retour"
        ) ?? ""
      );

    /* =====================================================
       VÉRIFICATION DES DATES
    ===================================================== */

    if (
      !dateDebut ||
      !dateRetour
    ) {

      setMessageErreur(
        "Merci de renseigner les deux dates."
      );

      setEnvoi(false);

      return;
    }

    if (
      dateRetour <
      dateDebut
    ) {

      setMessageErreur(
        "La date de retour doit être après la date de début."
      );

      setEnvoi(false);

      return;
    }

    /* =====================================================
       DONNÉES
    ===================================================== */

    const data = {

      code_barre:
        codeBarre,

      jeu:
        jeu,

      date_debut:
        dateDebut,

      date_retour:
        dateRetour,

      prenom:
        String(
          formData.get(
            "prenom"
          ) ?? ""
        ),

      nom:
        String(
          formData.get(
            "nom"
          ) ?? ""
        ),

      email:
        String(
          formData.get(
            "email"
          ) ?? ""
        ),

      telephone:
        String(
          formData.get(
            "telephone"
          ) ?? ""
        ),

      message:
        String(
          formData.get(
            "message"
          ) ?? ""
        ),
    };

    /* =====================================================
       ENVOI GOOGLE SHEETS
    ===================================================== */

    try {

      await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",

          mode: "no-cors",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8",
          },

          body:
            JSON.stringify(data),
        }
      );

      /* ===================================================
         SUCCÈS
      =================================================== */

      setMessageSucces(true);

      form.reset();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "Erreur réservation :",
        error
      );

      setMessageErreur(
        "Impossible d'envoyer la réservation. Veuillez réessayer."
      );

    } finally {

      setEnvoi(false);

    }
  }

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <div className="mt-8">

      {/* =================================================
          MESSAGE SUCCÈS
      ================================================= */}

      {messageSucces && (

        <div className="mb-8 rounded-2xl border-2 border-green-300 bg-green-100 p-6 text-center">

          <div className="text-5xl">
            ✅
          </div>

          <h2 className="mt-3 text-2xl font-black text-green-800">
            Demande envoyée !
          </h2>

          <p className="mt-2 text-green-700">
            Votre demande de réservation a bien été envoyée.
          </p>

          <p className="mt-2 text-sm text-green-700">
            Elle sera vérifiée avant confirmation.
          </p>

        </div>

      )}

      {/* =================================================
          MESSAGE ERREUR
      ================================================= */}

      {messageErreur && (

        <div className="mb-8 rounded-xl bg-red-100 p-5 text-center font-bold text-red-700">

          ❌ {messageErreur}

        </div>

      )}

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* =================================================
            DATES
        ================================================= */}

        <section>

          <h2 className="text-2xl font-bold text-gray-900">
            📅 Dates de location
          </h2>

          <div className="mt-4 grid gap-5 md:grid-cols-2">

            {/* DATE DÉBUT */}

            <div>

              <label
                htmlFor="date-debut"
                className="mb-2 block font-semibold text-gray-700"
              >
                Date de début
              </label>

              <input
                id="date-debut"
                name="date_debut"
                type="date"
                min={aujourdHui}
                required
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

            {/* DATE RETOUR */}

            <div>

              <label
                htmlFor="date-retour"
                className="mb-2 block font-semibold text-gray-700"
              >
                Date de retour
              </label>

              <input
                id="date-retour"
                name="date_retour"
                type="date"
                min={aujourdHui}
                required
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            IDENTITÉ
        ================================================= */}

        <section>

          <h2 className="text-2xl font-bold text-gray-900">
            👤 Vos informations
          </h2>

          <div className="mt-4 grid gap-5 md:grid-cols-2">

            {/* PRÉNOM */}

            <div>

              <label
                htmlFor="prenom"
                className="mb-2 block font-semibold text-gray-700"
              >
                Prénom
              </label>

              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                placeholder="Votre prénom"
                autoComplete="given-name"
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

            {/* NOM */}

            <div>

              <label
                htmlFor="nom"
                className="mb-2 block font-semibold text-gray-700"
              >
                Nom
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                required
                placeholder="Votre nom"
                autoComplete="family-name"
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            COORDONNÉES
        ================================================= */}

        <section>

          <h2 className="text-2xl font-bold text-gray-900">
            📞 Coordonnées
          </h2>

          <div className="mt-4 space-y-5">

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-gray-700"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="exemple@email.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

            {/* TÉLÉPHONE */}

            <div>

              <label
                htmlFor="telephone"
                className="mb-2 block font-semibold text-gray-700"
              >
                Téléphone
              </label>

              <input
                id="telephone"
                name="telephone"
                type="tel"
                required
                placeholder="06 00 00 00 00"
                autoComplete="tel"
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            MESSAGE
        ================================================= */}

        <section>

          <h2 className="text-2xl font-bold text-gray-900">
            📝 Message
          </h2>

          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Une précision concernant votre réservation ?"
            className="mt-4 w-full resize-none rounded-xl border-2 border-gray-300 bg-white p-4 outline-none focus:border-[#E8B223]"
          />

        </section>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">

          <p>
            ℹ️ Votre demande sera vérifiée avant d'être confirmée.
          </p>

          <p className="mt-2">
            La réservation n'est pas confirmée automatiquement.
          </p>

        </div>

        {/* =================================================
            BOUTON
        ================================================= */}

        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {envoi
            ? "⏳ Envoi en cours..."
            : "📅 Envoyer ma demande"}

        </button>

      </form>

    </div>
  );
}