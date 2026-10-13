"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Game = {
  code_barre: string;
  nom: string;
  editeur: string;
  nombre_min: number | null;
  nombre_max: number | null;
  duree: string;
  age: number | null;
  disponibilite: string;
  prix_location: number | null;
  prix_caution: number | null;
  description: string | null;
  categories?: string | null;
  image_url?: string;
};

type Props = {
  games: Game[];
};

const CATEGORIES = [
  { value: "cooperatif", label: "🤝 Coopératif" },
  { value: "ambiance", label: "😂 Ambiance" },
  { value: "strategie", label: "🧠 Stratégie" },
  { value: "enquete", label: "🔎 Enquête" },
  { value: "famille", label: "👨‍👩‍👧 Famille" },
  { value: "a deux", label: "💑 À deux" },
  { value: "cart
