import Link from "next/link";

const links = [
  { href: "#masalah", label: "Masalah" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#kenapa", label: "Kenapa VokasIn" },
  { href: "#regulasi", label: "Regulasi & Dana" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="#hero" className="text-sm font-semibold tracking-tight text-foreground">
          VokasIn
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/guru"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-slime-lime-700"
        >
          Mulai coba
        </Link>
      </nav>
    </header>
  );
}
