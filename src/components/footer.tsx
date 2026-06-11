import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Toby Wilde</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              PropTech entrepreneur, speaker, and founder of Oparo — redefining real estate
              through technology, data, and purpose.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </h4>
            <nav className="mt-3 flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/news", label: "News" },
                { href: "/speaking", label: "Speaking" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Get in Touch
            </h4>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href="tel:02071909706" className="text-slate-500 transition-colors hover:text-slate-900">
                0207 1909 706
              </a>
              <a
                href="mailto:office@tobywilde.com"
                className="text-slate-500 transition-colors hover:text-slate-900"
              >
                office@tobywilde.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          Copyright of Toby Wilde. Not to be published without permission.
        </div>
      </div>
    </footer>
  );
}
