// Companies Toby has founded / worked at — shown as a logo strip in the hero.
// Drop logo files into /public/logos and fill in logo + intrinsic w/h here.
// logo: path under /public/logos, or null to render a text wordmark fallback
// until a clean asset is added. svg: bypass the image optimizer (it rejects
// SVGs unless dangerouslyAllowSVG is enabled).
export type Company = {
  name: string;
  logo: string | null;
  w?: number;
  h?: number;
  svg?: boolean;
  // true when the logo image already includes the company name (a full
  // wordmark), so we don't render the name text beside it. Leave false/unset
  // for icon-only marks so the name is shown next to the icon.
  wordmark?: boolean;
  // true for monochrome white-on-transparent logos: inverts to dark so the
  // mark is visible on the light background.
  invert?: boolean;
};

// TODO: add remaining companies + logo assets from Toby.
export const companies: Company[] = [
  { name: "Oparo", logo: "/logos/oparo.png", w: 8390, h: 1623, wordmark: true, invert: true },
  { name: "Sprift", logo: "/logos/sprift.png", w: 1500, h: 571, wordmark: true },
  { name: "Milne Builders", logo: "/logos/milne-builders.png", w: 307, h: 164, wordmark: true },
];
