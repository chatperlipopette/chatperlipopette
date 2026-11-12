export type SitePromotion = {
  id: string;
  title: string;
  message: string;
  badge: string;
  discount: string;
  category: string;
  starts_at?: string | null;
  ends_at?: string | null;
};

export function normalizePromotionCategory(value: string | null | undefined): string {
  return (value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function promotionApplies(promotion: SitePromotion, categories: string | null | undefined): boolean {
  const target = normalizePromotionCategory(promotion.category || "tous");
  if (!target || target === "tous" || target === "toutes les categories") return true;
  return (categories || "").split(",").some((category) => normalizePromotionCategory(category) === target);
}

export function promotionPrice(price: number, promotion: SitePromotion): number {
  const raw = String(promotion.discount || "").trim().replace(",", ".");
  const percent = raw.match(/(-?\d+(?:\.\d+)?)\s*%/);
  const euro = raw.match(/-\s*(\d+(?:\.\d+)?)\s*(?:€|eur|euro|euros)\b?/i);
  let reduction = 0;
  if (percent) reduction = price * Math.min(100, Math.max(0, Math.abs(Number(percent[1])))) / 100;
  else if (euro) reduction = Math.min(price, Math.max(0, Number(euro[1])));
  else return price;
  return Math.max(0, Math.round((price - reduction) * 100) / 100);
}

export function bestPromotion(price: number, categories: string | null | undefined, promotions: SitePromotion[]): { price: number; promotion: SitePromotion | null; discount: number } {
  const applicable = promotions.filter((promotion) => promotionApplies(promotion, categories));
  let bestPrice = price;
  let best: SitePromotion | null = null;
  for (const promotion of applicable) {
    const next = promotionPrice(price, promotion);
    if (next < bestPrice) { bestPrice = next; best = promotion; }
  }
  return { price: bestPrice, promotion: best, discount: Math.round((price - bestPrice) * 100) / 100 };
}
