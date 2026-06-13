import type { Metadata } from "next";
import { container } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Speaking",
};

const conferences = [
  {
    year: "2025",
    event: "UK Construction Week Conference",
    topic:
      "Driving Efficiency & Affordability: The Role of Technology in Constructing Homes",
    url: "https://www.ukconstructionweek.com/",
  },
  {
    year: "2025",
    event: "Housing Innovation Show",
    topic:
      "Housing Affordability and the Role of Technology — Why the Housing Crisis Won't Be Solved by Innovation Alone",
    url: "https://housinginnovationshow.co.uk/",
  },
  {
    year: "2022",
    event: "Partners in Property Live Conference, Solihull",
    topic: "Social Impact Panel — Social and Supported Housing",
    url: undefined as string | undefined,
  },
  {
    year: "2021",
    event: "The Property Investor Show, Excel London",
    topic: "PropTech and Property Data Panel",
    url: "https://propertyinvestor.co.uk/",
  },
  {
    year: "2021",
    event: "The Property Investor Show",
    topic: "PropTech Founders Panel Debate",
    url: "https://propertyinvestor.co.uk/",
  },
  {
    year: "2020",
    event: "Global Family Office Summit",
    topic:
      "Next-Generation Family Office Leaders — Custodians of Legacy or Entrepreneurs to Modernise and Grow Wealth?",
    url: undefined as string | undefined,
  },
];

const podcasts = [
  {
    year: "2025",
    show: "LifeProven Podcast",
    topic: "Scaling Supported Housing",
    url: "https://www.lifeproven.co.uk/podcast/social-impact-investor-of-the-year-how-oparo-social-delivers-supported-housing-at-scale",
  },
  {
    year: "2024",
    show: "The RODCAST",
    topic: "Navigating the Complex World of Supported Housing",
    url: "https://shows.acast.com/rodcast/episodes/supported-living-toby-wilde",
  },
  {
    year: "2022",
    show: "The Supported Living Property Podcast",
    topic: "Using Institutional Finance in Supported Living",
    url: undefined as string | undefined,
  },
  {
    year: "2022",
    show: "Will Mallard — My Property World Conversations",
    topic: "Competitive Dealmaking in UK Property",
    url: undefined as string | undefined,
  },
  {
    year: "2021",
    show: "Property People Podcast with Saam Lowni",
    topic: "Founding the First REACT Investment House in the UK",
    url: "https://www.youtube.com/watch?v=obhPBhLQ_V8",
  },
  {
    year: "2021",
    show: "Property Sisters — 2021 Property Predictions",
    topic: "PropTech and the Future of Property Investment",
    url: undefined as string | undefined,
  },
  {
    year: "2020",
    show: "The Return Podcast with Anna Harper",
    topic: "PropTech Myths",
    url: "https://creators.spotify.com/pod/profile/anna-clare-harper/episodes/Proptech-myths-with-Toby-Wilde--Founder-of-Oparo--one-of-the-first-algorithm-driven-real-estate-investment-companies-in-the-UK-eh3i7r",
  },
  {
    year: "2020",
    show: "Focus On Why Podcast",
    topic: "Evolution of Data in Real Estate",
    url: undefined as string | undefined,
  },
  {
    year: "2019",
    show: "The Return Podcast with Anna Harper",
    topic: "Using Data and Algorithms to Drive Better Investment Decisions",
    url: undefined as string | undefined,
  },
  {
    year: "2019",
    show: "Venture Property Podcast",
    topic: "PropTech and Real Estate Innovation",
    url: undefined as string | undefined,
  },
];

const topics = [
  "Property Technology (PropTech)",
  "Real Estate Investment",
  "Development",
  "Property Strategies",
  "Family Offices",
  "Entrepreneurialism",
  "Resilience",
  "Real Estate Economics / Policy",
];

export default function SpeakingPage() {
  return (
    <>
      <section className="border-b border-slate-200">
        <div className={`${container} py-16 sm:py-20`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Events &amp; Panels
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Speaking
          </h1>
          <p className="mt-4 max-w-xl text-slate-500">
            Toby is a very experienced and well known speaker, regularly taking part at
            Real Estate, Technology and Family Office events.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className={`${container} space-y-20`}>
          {/* Overview + Topics */}
          <div className="grid gap-x-16 gap-y-10 lg:grid-cols-2">
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                Toby considers public speaking events, panel contributions and roundtables in
                the U.K. and across Europe.
              </p>
              <p>
                Toby offers this service for free for most events, as he is a big believer in
                self improvement and the sharing of knowledge and ideas.
              </p>
              <p>
                When a fee is appropriate, particularly for commercial events such as
                continued professional development, education courses, Television or Radio,
                Toby requests the consideration be donated to a charity of his choice.
              </p>
              <p className="font-medium text-slate-700">
                For availability email:{" "}
                <a
                  href="mailto:office@tobywilde.com"
                  className="text-slate-900 underline underline-offset-2"
                >
                  Office@TobyWilde.com
                </a>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Speaking Topics
              </h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Conferences & Panels */}
          <div className="border-t border-slate-200 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Conferences &amp; Panels
            </h2>
            <div className="mt-6 divide-y divide-slate-200">
              {conferences.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-10"
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-slate-400">
                    {item.year}
                  </span>
                  <div className="sm:flex-1">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                      >
                        {item.event} &rarr;
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-900">{item.event}</p>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500 sm:flex-1">
                    {item.topic}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Podcasts */}
          <div className="border-t border-slate-200 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Podcast Appearances
            </h2>
            <div className="mt-6 divide-y divide-slate-200">
              {podcasts.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-10"
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-slate-400">
                    {item.year}
                  </span>
                  <div className="sm:flex-1">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                      >
                        {item.show} &rarr;
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-900">{item.show}</p>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500 sm:flex-1">
                    {item.topic}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-slate-50 p-8 text-center sm:p-12">
            <h3 className="text-lg font-bold text-slate-900">
              Interested in booking Toby for an event?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Available for keynotes, panels, and podcast appearances on PropTech, social
              housing, and data-driven investment.
            </p>
            <a
              href="mailto:office@tobywilde.com"
              className="mt-6 inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
