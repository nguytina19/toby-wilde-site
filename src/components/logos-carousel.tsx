"use client";

import * as React from "react";
import Image from "next/image";
import { press, type PressOutlet } from "@/data/press";
import styles from "./logos-carousel.module.css";

// Curated slides: clean wordmarks first, the heavier "box" logos grouped
// together on the second slide so every frame stays visually even.
// Equal-count slides (6 each) so every logo cross-fades in a fixed grid
// slot — keeps the motion position-stable instead of jumping horizontally.
// Ranked by recognisability/prestige: flagship names on the first slide,
// descending to specialist trade titles on the last.
const SLIDE_NAMES: string[][] = [
  ["Financial Times", "The Times", "Deloitte", "University of Oxford", "The Independent", "CoStar"],
  [
    "Yahoo Finance",
    "Ordnance Survey",
    "Business Reporter",
    "Proactive",
    "MarketScreener",
    "Property Week",
  ],
  [
    "Inside Housing",
    "Manila Times",
    "Estate Agent Today",
    "IPE Real Assets",
    "PropTech Connect",
    "Property Industry Eye",
  ],
  [
    "Development Finance Today",
    "Bridging & Commercial Magazine",
    "Housing Digital",
    "Blue Bricks Magazine",
    "UKT News",
    "Housing Technology Magazine",
  ],
];

const COLS = 6;

const SLIDES: PressOutlet[][] = SLIDE_NAMES.map((names) =>
  names.map((n) => press.find((p) => p.name === n)).filter(Boolean) as PressOutlet[],
);

const INTERVAL_MS = 3200;
const STAGGER = 0.09;

function LogoMark({ pub }: { pub: PressOutlet }) {
  if (!pub.logo) {
    return (
      <span className="text-base font-semibold tracking-tight text-slate-400">{pub.name}</span>
    );
  }
  return (
    <Image
      src={pub.logo}
      alt={pub.name}
      width={pub.w}
      height={pub.h}
      unoptimized={pub.svg}
      className="h-8 w-auto max-w-[150px] object-contain grayscale"
      style={pub.scale ? { transform: `scale(${pub.scale})` } : undefined}
    />
  );
}

function Slide({
  logos,
  state,
  animate,
}: {
  logos: PressOutlet[];
  state: "enter" | "exit";
  animate: boolean;
}) {
  return (
    <div
      className="grid w-full items-center gap-x-8"
      style={{ gridArea: "1 / 1", gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {logos.map((pub, i) => (
        <div
          key={pub.name}
          className={`${styles.logo} flex items-center justify-center`}
          data-state={state}
          data-animate={animate}
          style={{ "--delay": `${i * STAGGER}s` } as React.CSSProperties}
        >
          <LogoMark pub={pub} />
        </div>
      ))}
    </div>
  );
}

function StaticLogos() {
  return (
    <div className="grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 md:grid-cols-5">
      {press.map((pub) => (
        <div key={pub.name} className="flex h-8 items-center">
          <LogoMark pub={pub} />
        </div>
      ))}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function AnimatedCarousel() {
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(false);

  const current = SLIDES[index];
  const next = SLIDES[(index + 1) % SLIDES.length];

  React.useEffect(() => {
    const id = setTimeout(() => setAnimate(true), 700);
    return () => clearTimeout(id);
  }, []);

  React.useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [animate]);

  return (
    <div className="grid w-full">
      <Slide key={`${index}-exit`} logos={current} state="exit" animate={animate} />
      {animate && <Slide key={`${index}-enter`} logos={next} state="enter" animate />}
    </div>
  );
}

export function LogosCarousel() {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <StaticLogos />;
  }

  return (
    <>
      <div className="md:hidden">
        <StaticLogos />
      </div>
      <div className="hidden md:block">
        <AnimatedCarousel />
      </div>
    </>
  );
}
