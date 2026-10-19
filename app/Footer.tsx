import Link from "next/link";

const contacts = [
  {
    label: "E-mail",
    detail: "Écrivez-nous",
    href: "mailto:chatperlipopette31@outlook.fr",
    icon: "✉️",
  },
  {
    label: "Téléphone",
    detail: "07 68 49 45 25",
    href: "tel:+33768494525",
    icon: "☎️",
  },
  {
    label: "Instagram",
    detail: "@chat_perlipopette31",
    href: "https://www.instagram.com/chat_perlipopette31/",
    icon: "📸",
  },
  {
    label: "Snapchat",
    detail: "chaperlipo31",
    href: "https://www.snapchat.com/add/chaperlipo31",
    icon: "👻",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#24211B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="text-2xl font-black text-[#F7D96C] hover:underline">
              Chat'Perlipopette
            </Link>
            <p className="mt-3 max-w-sm leading-6 text-white/75">
              Le plaisir de découvrir et de partager des jeux de société.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Contact et réseaux</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith("https://") ? "_blank" : undefined}
                  rel={contact.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-[#F7D96C] hover:bg-white/10"
                >
                  <span aria-hidden="true" className="text-2xl">{contact.icon}</span>
                  <span className="min-w-0">
                    <span className="block font-bold">{contact.label}</span>
                    <span className="block break-all text-sm text-white/70">{contact.detail}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/15 pt-5 text-center text-sm text-white/60">
          © {new Date().getFullYear()} Chat'Perlipopette · Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
