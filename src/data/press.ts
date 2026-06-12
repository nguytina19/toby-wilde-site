// Press outlets that have featured Toby / Oparo.
// logo: path under /public/logos, or null to render a text wordmark fallback
// until a clean asset is added. w/h are the asset's intrinsic dimensions so
// next/image can reserve space (no layout shift). svg: bypass the image
// optimizer, which rejects SVGs unless dangerouslyAllowSVG is enabled.
export type PressOutlet = {
  name: string;
  logo: string | null;
  w?: number;
  h?: number;
  svg?: boolean;
};

export const press: PressOutlet[] = [
  { name: "The Times", logo: "/logos/the-times.svg", w: 3758, h: 450, svg: true },
  { name: "The Independent", logo: null },
  { name: "Property Week", logo: null },
  { name: "Blue Bricks Magazine", logo: "/logos/blue-bricks.png", w: 295, h: 84 },
  { name: "Housing Technology Magazine", logo: "/logos/housing-technology.png", w: 1498, h: 723 },
  { name: "Bridging & Commercial Magazine", logo: "/logos/bridging-commercial.svg", w: 625, h: 44, svg: true },
  { name: "Property Industry Eye", logo: "/logos/property-industry-eye.png", w: 481, h: 150 },
];
