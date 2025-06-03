import DataTable from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { getLogEntries } from "@/services/elastic";
import { generateElasticsearchQuery } from "@/services/gemini";
import { Suspense } from "react";
import Map from "@/components/results/map";
import KeyInsights from "@/components/results/key-insights";
import UserAgentChart from "@/components/results/user-agent-chart";
import { getLogAnalysisReport } from "@/services/analysis";
import { LogAnalysisReport } from "@/types";
import StatusCodesChart from "@/components/results/status-codes";
import MethodChart from "@/components/results/method-chart";
import RequestsPerMinuteChart from "@/components/results/requests-per-minute-chart";
import PathCountsChart from "@/components/results/path-counts-chart";
import BotVsHumanTraffic from "@/components/results/bot-vs-human-traffic";

interface PageProps {
  searchParams: {
    type?: string;
    query?: string;
    filters?: string;
  };
}

export default async function AnalyseResultsPage({ searchParams }: PageProps) {
  // const { type, query, filters } = searchParams;
  const query = "Fetch status code 200 logs";
  const type = "prompt";

  let elasticsearchQuery;

  if (type === "prompt") {
    elasticsearchQuery = await generateElasticsearchQuery(decodeURIComponent(query || ""));
  }

  // elasticsearchQuery = {
  //   bool: {
  //     must: [
  //       {
  //         range: {
  //           datetime: {
  //             gte: "2024-05-16T00:00:00.000Z",
  //             lte: "2025-05-16T23:59:59.999Z",
  //           },
  //         },
  //       },
  //     ],
  //   },
  // };

  const report: LogAnalysisReport = await getLogAnalysisReport(elasticsearchQuery);

  return (
    <div>
      <SiteHeader title="Analysis Results" />
      <div className="@container/main flex flex-1 flex-col gap-8 py-8 px-6">
        <Suspense fallback={<div>Loading results...</div>}>
          <div className="grid grid-cols-2 gap-6">
            <KeyInsights report={report} />
            <Map report={report} />
          </div>

          <div className="grid grid-cols-6 gap-6">
            <UserAgentChart report={report} />
            <StatusCodesChart report={report} />
            <MethodChart report={report} />
            <PathCountsChart report={report} />
            <RequestsPerMinuteChart report={report} />
            <BotVsHumanTraffic report={report} />
          </div>

          <DataTable className="mx-0" data={report?.logs || []} />
        </Suspense>
      </div>
    </div>
  );
}
