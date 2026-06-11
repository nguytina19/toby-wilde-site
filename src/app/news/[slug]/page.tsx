import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/data/news";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <>
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to News
          </Link>
          <time className="mt-6 block text-sm font-medium uppercase tracking-wider text-slate-400">
            {article.date}
          </time>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {article.title}
          </h1>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-6">
          {article.image && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}
          <div className="max-w-none space-y-5">
            {article.body ? (
              <>
                {article.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "text-lg leading-relaxed text-slate-600"
                        : "text-base leading-relaxed text-slate-600"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
                {article.externalLinks && article.externalLinks.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {article.externalLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        {link.label}
                        <svg
                          className="size-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-lg leading-relaxed text-slate-600">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
