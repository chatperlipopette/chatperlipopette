import { NextResponse } from "next/server";
import { getPartnerById, getPartnerSessionId } from "@/lib/partner-access";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const id = await getPartnerSessionId();
    if (!id) return NextResponse.json({ active: false });
    const partner = await getPartnerById(id);
    if (!partner) return NextResponse.json({ active: false });
    return NextResponse.json({ active: true, name: partner.name || "Partenaire", discountType: partner.discount_type, discountPercent: Number(partner.discount_percent || 0) });
  } catch { return NextResponse.json({ active: false }); }
}
