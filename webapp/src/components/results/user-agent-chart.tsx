"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

// Tailwind CSS colors
const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
];

interface UserAgentChartProps {
  report: LogAnalysisReport;
}

export default function UserAgentChart({ report }: UserAgentChartProps) {
  const data = React.useMemo(() => {
    return Object.entries(report.user_agent_counts)
      .map(([name, value]) => ({
        name: name.length > 30 ? name.substring(0, 30) + "..." : name,
        value,
        fullName: name,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 user agents
  }, [report.user_agent_counts]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>User Agent Distribution</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
              <Bar dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
