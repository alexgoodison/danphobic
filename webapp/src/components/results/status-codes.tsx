import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

interface StatusCodesChartProps {
  report: LogAnalysisReport;
}

export default function StatusCodesChart({ report }: StatusCodesChartProps) {
  return (
    <div className="col-span-4 grid grid-cols-2 grid-rows-2 gap-6">
      <Card className="h-full flex flex-col justify-center items-center">
        <CardContent>
          <div className="flex flex-col justify-center items-center text-center gap-2">
            <div className="font-semibold">2xx Status Codes</div>
            <div className="text-emerald-600 text-7xl font-bold">
              {report.status_counts["2xx"]}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col justify-center items-center">
        <CardContent>
          <div className="flex flex-col justify-center items-center text-center gap-2">
            <div className="font-semibold">3xx Status Codes</div>
            <div className="text-gray-600 text-7xl font-bold">
              {report.status_counts["3xx"]}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col justify-center items-center">
        <CardContent>
          <div className="flex flex-col justify-center items-center text-center gap-2">
            <div className="font-semibold">4xx Status Codes</div>
            <div className="text-yellow-500 text-7xl font-bold">
              {report.status_counts["4xx"]}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col justify-center items-center">
        <CardContent>
          <div className="flex flex-col justify-center items-center text-center gap-2">
            <div className="font-semibold">5xx Status Codes</div>
            <div className="text-red-600 text-7xl font-bold">{report.status_counts["5xx"]}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
