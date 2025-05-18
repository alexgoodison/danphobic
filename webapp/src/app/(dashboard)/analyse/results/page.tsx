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

interface PageProps {
  searchParams: {
    type?: string;
    query?: string;
    filters?: string;
  };
}

const logs = [
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:13:27 +0100",
    request:
      "GET /wp-content/themes/simple-grid/assets/js/theia-sticky-sidebar.min.js HTTP/2.0",
    status: 200,
    body_bytes_sent: 1737,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:13:27",
    method: "GET",
    path: "/wp-content/themes/simple-grid/assets/js/theia-sticky-sidebar.min.js",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:13:48 +0100",
    request:
      "GET /music/nggallery/album/the-presidents-of-the-united-states-of-america HTTP/2.0",
    status: 200,
    body_bytes_sent: 10456,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:13:48",
    method: "GET",
    path: "/music/nggallery/album/the-presidents-of-the-united-states-of-america",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:14:50 +0100",
    request: "GET /wp-content/themes/simple-grid/assets/js/ResizeSensor.min.js HTTP/2.0",
    status: 200,
    body_bytes_sent: 1267,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:14:50",
    method: "GET",
    path: "/wp-content/themes/simple-grid/assets/js/ResizeSensor.min.js",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:15:32 +0100",
    request: "GET /wp-content/uploads/2021/01/f179731176.jpg HTTP/2.0",
    status: 200,
    body_bytes_sent: 1033652,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:15:32",
    method: "GET",
    path: "/wp-content/uploads/2021/01/f179731176.jpg",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:10:56 +0100",
    request: "GET /music/ HTTP/2.0",
    status: 200,
    body_bytes_sent: 10353,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:10:56",
    method: "GET",
    path: "/music/",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "84.203.1.217",
    remote_user: "-",
    time_local: "17/Apr/2025:05:13:48 +0100",
    request: "POST /wp-cron.php?doing_wp_cron=1744863228.0052878856658935546875 HTTP/1.1",
    status: 200,
    body_bytes_sent: 0,
    http_referer: "-",
    http_user_agent: "WordPress/6.8; https://website.local.lan",
    datetime: "2025-04-17T05:13:48",
    method: "POST",
    path: "/wp-cron.php?doing_wp_cron=1744863228.0052878856658935546875",
    protocol: "HTTP/1.1",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:14:09 +0100",
    request: "GET /mountains/nggallery/album/piccolo-san-bernardo-val-daosta-italy HTTP/2.0",
    status: 200,
    body_bytes_sent: 10520,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:14:09",
    method: "GET",
    path: "/mountains/nggallery/album/piccolo-san-bernardo-val-daosta-italy",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:14:29 +0100",
    request: "GET /xmlrpc.php HTTP/2.0",
    status: 405,
    body_bytes_sent: 42,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:14:29",
    method: "GET",
    path: "/xmlrpc.php",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "20.171.207.17",
    remote_user: "-",
    time_local: "17/Apr/2025:05:15:10 +0100",
    request: "GET /wp-content/uploads/2022/01/thingiverse.png HTTP/2.0",
    status: 200,
    body_bytes_sent: 18741,
    http_referer: "-",
    http_user_agent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    datetime: "2025-04-17T05:15:10",
    method: "GET",
    path: "/wp-content/uploads/2022/01/thingiverse.png",
    protocol: "HTTP/2.0",
  },
  {
    remote_addr: "84.203.1.217",
    remote_user: "-",
    time_local: "17/Apr/2025:05:15:54 +0100",
    request: "POST /wp-cron.php?doing_wp_cron=1744863354.2370080947875976562500 HTTP/1.1",
    status: 200,
    body_bytes_sent: 0,
    http_referer: "-",
    http_user_agent: "WordPress/6.8; https://website.local.lan",
    datetime: "2025-04-17T05:15:54",
    method: "POST",
    path: "/wp-cron.php?doing_wp_cron=1744863354.2370080947875976562500",
    protocol: "HTTP/1.1",
  },
];

export default async function AnalyseResultsPage({ searchParams }: PageProps) {
  // const { type, query, filters } = searchParams;

  // let elasticsearchQuery;

  // if (type === "prompt") {
  //   elasticsearchQuery = await generateElasticsearchQuery(decodeURIComponent(query || ""));
  // }

  //   console.log(elasticsearchQuery);
  //   const logs = await getLogEntries(elasticsearchQuery);
  //   console.log(JSON.stringify(logs));

  const elasticsearchQuery = {
    bool: {
      must: [
        {
          range: {
            datetime: {
              gte: "2024-05-16T00:00:00.000Z",
              lte: "2025-05-16T23:59:59.999Z",
            },
          },
        },
      ],
    },
  };

  const report: LogAnalysisReport = await getLogAnalysisReport(elasticsearchQuery);
  console.log(report.requests_per_minute);

  return (
    <div>
      <SiteHeader title="Analysis Results" />
      <div className="@container/main flex flex-1 flex-col gap-8 py-8 px-6">
        <Suspense fallback={<div>Loading results...</div>}>
          <div>Results from {logs.length} logs</div>

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
          </div>

          <DataTable className="mx-0" data={report?.logs || []} />
        </Suspense>
      </div>
    </div>
  );
}
