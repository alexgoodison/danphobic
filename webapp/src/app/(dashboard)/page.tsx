import Overview from "@/components/overview";
import { SiteHeader } from "@/components/site-header";
import { getLogEntries } from "@/services/elastic";

export default async function Page() {
  const logEntries = await getLogEntries();

  return (
    <div>
      <SiteHeader title="Dashboard" />
      <Overview logEntries={logEntries} />
    </div>
  );
}
