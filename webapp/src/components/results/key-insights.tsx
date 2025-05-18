import { Card, CardContent } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";
import { Separator } from "@/components/ui/separator";

interface KeyInsightsProps {
  report: LogAnalysisReport;
}

export default function KeyInsights({ report }: KeyInsightsProps) {
  const points = report.summary?.split("\n").filter((point) => point.trim()) || [];

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="font-semibold">AI Insights</div>

      <Card
        style={{ height: 400 }}
        className="@container/card bg-gradient-to-t from-secondary/75 to-card flex-1 shadow-xs overflow-y-scroll">
        <CardContent>
          {points.length > 0 ? (
            <div className="flex flex-col gap-2">
              {points.map((point, index) => (
                <div key={index}>
                  <div className="text-sm text-gray-700">{point.trim()}</div>
                  {index < points.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No summary available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
