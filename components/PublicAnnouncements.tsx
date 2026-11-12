export const dynamic = "force-dynamic";

type Announcement = {
  id: string;
  title: string;
  message: string;
  badge: string;
  discount: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export default async function PublicAnnouncements() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  try {
    const response = await fetch(
      `${url}/rest/v1/site_announcements?select=id,title,message,badge,discount,image_url,starts_at,ends_at&active=eq.true&order=created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) return null;
    const rows = await response.json() as Announcement[];
    const now = Date.now();
    const active = rows.filter(item =>
      (!item.starts_at || new Date(item.starts_at).getTime() <= now) &&
      (!item.ends_at || new Date(item.ends_at).getTime() >= now)
    );
    if (!active.length) return null;

    return (
      <aside aria-label="Annonces et promotions" className="space-y-2">
        {active.map(item => (
          <section key={item.id} className="relative overflow-hidden border-b border-[#E8B223] bg-gradient-to-r from-[#FFF0B8] via-[#FFF8E8] to-[#F7D96C] px-5 py-4 text-[#30250B]">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-5">
              <span className="rounded-full bg-[#24211B] px-3 py-1 text-xs font-black uppercase tracking-wide text-white">{item.badge || "INFO"}</span>
              <div><h2 className="text-lg font-black">{item.title}</h2><p className="text-sm">{item.message}</p></div>
              {item.discount && <strong className="text-2xl font-black text-[#A45B00]">{item.discount}</strong>}
              {item.image_url && <img src={item.image_url} alt="" loading="lazy" className="max-h-16 max-w-28 rounded-lg object-contain" />}
            </div>
          </section>
        ))}
      </aside>
    );
  } catch {
    return null;
  }
}
