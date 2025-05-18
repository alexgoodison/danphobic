"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

interface MethodChartProps {
  report: LogAnalysisReport;
}

export default function MethodChart({ report }: MethodChartProps) {
  const data = React.useMemo(() => {
    return Object.entries(report.method_counts).map(([method, count]) => ({
      method,
      count,
    }));
  }, [report.method_counts]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>HTTP Methods Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
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
