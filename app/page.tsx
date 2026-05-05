import { getPublicHomeStats } from "@/lib/data/public-stats";
import { HomeMarketing } from "@/components/landing/HomeMarketing";

export default async function HomePage() {
  const stats = await getPublicHomeStats();
  return <HomeMarketing stats={stats} />;
}
