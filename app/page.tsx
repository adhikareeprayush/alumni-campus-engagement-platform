import { getPublicHomeStats } from "@/lib/data/public-stats";
import { HomeMarketing } from "@/components/landing/HomeMarketing";

/** Avoid querying the DB during `next build` (CI often has no DB / DNS). Stats load per request instead. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getPublicHomeStats();
  return <HomeMarketing stats={stats} />;
}
