import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import DataTable from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

import { getLogEntries } from "@/services/elastic";

export default async function Page() {
  const logEntries = await getLogEntries();

  return (
    <div>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards data={logEntries} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive data={logEntries} />
            </div>
            <DataTable data={logEntries} />
          </div>
        </div>
      </div>
    </div>
  );
}
