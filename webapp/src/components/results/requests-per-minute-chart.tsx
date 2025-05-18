"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

interface RequestsPerMinuteChartProps {
  report: LogAnalysisReport;
}

export default function RequestsPerMinuteChart({ report }: RequestsPerMinuteChartProps) {
  const data = React.useMemo(() => {
    return report.requests_per_minute.map(([timestamp, count]) => ({
      timestamp: new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      count,
    }));
  }, [report.requests_per_minute]);

  return (
    <Card className="col-span-6">
      <CardHeader>
        <CardTitle>Requests per Minute</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                angle={-30}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                label={{ value: "Time", position: "insideBottomRight" }}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
