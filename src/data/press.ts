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

// Ordered by recognisability: national press first (top row in the grid),
// then property-trade and specialist titles.
export const press: PressOutlet[] = [
  { name: "The Times", logo: "/logos/the-times.svg", w: 3758, h: 450, svg: true },
  { name: "Financial Times", logo: "/logos/financial-times.png", w: 798, h: 232 },
  { name: "The Independent", logo: "/logos/the-independent.png", w: 863, h: 142 },
  { name: "Deloitte", logo: "/logos/deloitte.png", w: 1272, h: 239 },
  { name: "CoStar", logo: "/logos/costar.png", w: 640, h: 173 },
  { name: "University of Oxford", logo: "/logos/university-of-oxford.png", w: 726, h: 215 },
  { name: "Ordnance Survey", logo: "/logos/ordnance-survey.png", w: 580, h: 142 },
  { name: "Proactive", logo: "/logos/proactive.png", w: 2905, h: 686 },
  { name: "Property Week", logo: "/logos/property-week.png", w: 863, h: 330 },
  { name: "Inside Housing", logo: "/logos/inside-housing.png", w: 300, h: 118 },
  { name: "Estate Agent Today", logo: "/logos/estate-agent-today-v2.png", w: 945, h: 98 },
  { name: "PropTech Connect", logo: "/logos/proptech-connect.png", w: 4966, h: 1370 },
  { name: "Property Industry Eye", logo: "/logos/property-industry-eye.png", w: 481, h: 150 },
  { name: "Development Finance Today", logo: "/logos/development-finance-today.png", w: 1418, h: 101 },
  { name: "Housing Digital", logo: "/logos/housing-digital.png", w: 428, h: 204 },
  { name: "Business Reporter", logo: "/logos/business-reporter.png", w: 631, h: 132 },
  { name: "Bridging & Commercial Magazine", logo: "/logos/bridging-commercial.svg", w: 625, h: 44, svg: true },
  { name: "Blue Bricks Magazine", logo: "/logos/blue-bricks.png", w: 295, h: 84 },
  { name: "UKT News", logo: "/logos/ukt-news.png", w: 422, h: 60 },
  { name: "Housing Technology Magazine", logo: "/logos/housing-technology.png", w: 1498, h: 723 },
  { name: "Yahoo Finance", logo: "/logos/yahoo-finance.png", w: 576, h: 212 },
  { name: "Manila Times", logo: "/logos/manila-times.png", w: 887, h: 105 },
  { name: "MarketScreener", logo: "/logos/market-screener.png", w: 800, h: 78 },
  { name: "IPE Real Assets", logo: "/logos/ipe-real-assets.png", w: 458, h: 95 },
];
