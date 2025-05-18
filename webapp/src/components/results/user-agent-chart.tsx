"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

interface UserAgentChartProps {
  report: LogAnalysisReport;
}

export default function UserAgentChart({ report }: UserAgentChartProps) {
  const data = React.useMemo(() => {
    return Object.entries(report.user_agent_counts).map(([name, value]) => ({
      name: name.length > 30 ? name.substring(0, 30) + "..." : name,
      value,
    }));
  }, [report.user_agent_counts]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>User Agent Distribution</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
