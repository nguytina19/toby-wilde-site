import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Enquiries
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-xl text-slate-500">
            For speaking engagements, press enquiries, or business opportunities.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Contact Details</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Address
                  </h3>
                  <address className="mt-1 text-lg not-italic leading-relaxed text-slate-900">
                    180 Piccadilly<br />
                    St. James&rsquo;s<br />
                    Westminster<br />
                    London W1J 9HF
                  </address>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </h3>
                  <a
                    href="tel:02071909706"
                    className="mt-1 block text-lg text-slate-900 transition-colors hover:text-slate-600"
                  >
                    0207 1909 706
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </h3>
                  <a
                    href="mailto:office@tobywilde.com"
                    className="mt-1 block text-lg text-slate-900 transition-colors hover:text-slate-600"
                  >
                    Office@TobyWilde.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-8 ring-1 ring-slate-900/5">
              <h2 className="text-xl font-bold text-slate-900">Send a Message</h2>
              <form className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-lg bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm ring-1 ring-slate-300 placeholder:text-slate-400 transition-shadow focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-lg bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm ring-1 ring-slate-300 placeholder:text-slate-400 transition-shadow focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="mt-1 block w-full rounded-lg bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm ring-1 ring-slate-300 placeholder:text-slate-400 transition-shadow focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    placeholder="Your message…"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-700"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
