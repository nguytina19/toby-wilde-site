// Single source of truth for page horizontal alignment. Every top-level
// section (header, hero, content sections) uses this so they share one
// consistent left/right edge and max-width. Change it here to shift the whole
// page's rhythm at once. Generous max-width hugs the edge on laptops while
// capping line length / sparseness on very large screens.
export const container = "mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16";
