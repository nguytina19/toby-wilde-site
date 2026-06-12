import Link from "next/link";
import { container } from "@/lib/layout";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className={`${container} py-12`}>
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
              <a
                href="https://www.linkedin.com/in/tobywilde/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Toby Wilde on LinkedIn"
                className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                LinkedIn
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
