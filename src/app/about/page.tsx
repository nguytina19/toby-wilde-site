import type { Metadata } from "next";
import Image from "next/image";
import { container } from "@/lib/layout";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-slate-200">
        <div className={`${container} py-16 sm:py-20`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Background
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About Toby Wilde
          </h1>
          <p className="mt-4 max-w-xl text-slate-500">
            PropTech entrepreneur, speaker, and founder of Oparo.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className={container}>
          <div className="flex max-w-5xl flex-col items-start gap-10 md:flex-row md:gap-14">
            <div className="w-full shrink-0 md:w-64 lg:w-72">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src="/toby.jpg"
                  alt="Toby Wilde"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 288px"
                  priority
                />
              </div>
            </div>

            <div className="space-y-6 text-base leading-relaxed text-slate-600">
              <p className="text-lg leading-relaxed text-slate-700">
                Toby Wilde, Founder of Oparo Group, is passionate about construction and
                the building of lasting, well-serviced communities.
              </p>

              <p>
                He has an established track record in this space coming from the
                multi-generational Milne real estate family, who have delivered thousands
                of homes for Local Authorities and Housing Associations and in particular
                in the Supported, Sheltered and Retirement Community spaces in the Thames
                Valley.
              </p>

              <p>
                The family also founded one of the U.K.&rsquo;s first real estate funds
                under the BES scheme of the 1980s which was sold in the mid-nineties to a
                PLC.
              </p>

              <p>
                Having gained vital experience as both a developer and a development
                consultant, Toby used those fine-tuned skills to be one of the Founding
                Partners of Sprift.com, a revolutionary property data aggregating platform
                and one of the U.K.&rsquo;s best known PropTech businesses.
              </p>

              <p>
                In 2019 he founded the Oparo Group, which was the first algorithm driven
                real estate investment company in the U.K. which then focused upon Social
                Impact. Oparo was the culmination of Toby&rsquo;s passion for construction
                and his dedication to make a difference to people&rsquo;s lives by
                delivering world class social housing projects designed about communities
                and their development.
              </p>

              <p>
                Toby has previously volunteered with Ruskin Mill, the special education
                needs trust, and the Sophie Hayes Foundation for survivors of human
                trafficking.
              </p>

              <p>
                Toby is proud of the fact that Oparo Social, with its Housing Association
                Partners, has to date delivered over a hundred and thirty homes for
                vulnerable adults in London.
              </p>

              <p>
                Across his career, Toby has completed 30+ property developments, with his work
                shortlisted across 24 industry award categories.
              </p>

              <p className="font-medium text-slate-700">
                A regular speaker at events and writer on PropTech, real estate and real
                estate economics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
