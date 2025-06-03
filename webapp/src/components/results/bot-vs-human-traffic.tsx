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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogAnalysisReport } from "@/types";

interface BotVsHumanTrafficProps {
  report: LogAnalysisReport;
}

export default function BotVsHumanTraffic({ report }: BotVsHumanTrafficProps) {
  const data = React.useMemo(() => {
    return report.bot_vs_human_traffic.map(([timestamp, botCount, humanCount]) => ({
      timestamp: new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      botCount,
      humanCount,
    }));
  }, [report.bot_vs_human_traffic]);

  return (
    <Card className="col-span-6">
      <CardHeader>
        <CardTitle>Potential Bot vs Human Traffic</CardTitle>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="botCount"
                name="Bot Traffic"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="humanCount"
                name="Human Traffic"
                stroke="#22c55e"
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
