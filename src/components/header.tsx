"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { container } from "@/lib/layout";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/speaking", label: "Speaking" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur-sm">
      <div className={`${container} flex h-16 items-center justify-between`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="Toby Wilde — home">
          <svg viewBox="0 0 64 64" aria-hidden="true" className="h-9 w-9 shrink-0">
            <text
              x="32"
              y="29"
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', Times, serif"
              fontSize="30"
              fontWeight="600"
              letterSpacing="-1"
              fill="#0f172a"
            >
              T
            </text>
            <text
              x="32"
              y="56"
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', Times, serif"
              fontSize="30"
              fontWeight="600"
              letterSpacing="-1"
              fill="#0f172a"
            >
              W
            </text>
          </svg>
          <span className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            Toby Wilde
          </span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 active:bg-slate-200 md:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
