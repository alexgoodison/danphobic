"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PathCountsChartProps {
  report: LogAnalysisReport;
}

export default function PathCountsChart({ report }: PathCountsChartProps) {
  // Convert path_counts to array and sort by count
  const pathData = Object.entries(report?.path_counts || {})
    .map(([path, count]) => ({
      path: path.length > 30 ? path.substring(0, 30) + "..." : path,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (pathData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Accessed Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No path data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Most Accessed Paths</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pathData}>
              <XAxis
                dataKey="path"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
