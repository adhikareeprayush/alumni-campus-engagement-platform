/**
 * Fictional product & institution names for demo / production-neutral deployments.
 * Adjust here to white-label the app.
 */
export const BRAND = {
  siteName: "SummitLink",
  institutionFull: "Meridian Valley Technical University",
  institutionShort: "MVTU",
  /** Used in analytics “abroad” metric (alumni where country ≠ this value). */
  homeCountry: "United States",
  tagline: "Alumni, careers, and campus life—connected.",
  seoDescription:
    "SummitLink is the alumni and career hub for Meridian Valley Technical University: verified directory, jobs, events, announcements, and analytics for staff.",
  footerLine: "SummitLink · Meridian Valley Technical University",
} as const;

export type BrandConfig = typeof BRAND;
