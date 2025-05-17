"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LogEntry } from "@/types";

export const description = "An interactive area chart";

const chartConfig = {
  "2xx": {
    label: "Successful Requests",
    color: "#0ea5e9",
  },
  "4xx": {
    label: "Client Errors",
    color: "#f59e0b",
  },
  "5xx": {
    label: "Server Errors",
    color: "#dc2626",
  },
  avgResponseTime: {
    label: "Avg Response Time (ms)",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type ChartDataProps = {
  data: LogEntry[];
};

export function ChartAreaInteractive({ data }: ChartDataProps) {
  const isMobile = useIsMobile();

  // Process log data to group by date and count status codes
  const processedData = React.useMemo(() => {
    const groupedData = new Map<
      string,
      { "2xx": number; "4xx": number; "5xx": number; totalTime: number; count: number }
    >();

    data.forEach((entry) => {
      const date = new Date(entry.datetime).toISOString().split("T")[0];
      const status = entry.status.toString();
      const statusGroup = status.startsWith("2")
        ? "2xx"
        : status.startsWith("4")
        ? "4xx"
        : status.startsWith("5")
        ? "5xx"
        : null;

      if (!statusGroup) return;

      const current = groupedData.get(date) || {
        "2xx": 0,
        "4xx": 0,
        "5xx": 0,
        totalTime: 0,
        count: 0,
      };
      current[statusGroup]++;
      current.totalTime += entry.body_bytes_sent; // Using body_bytes_sent as a proxy for response time
      current.count++;
      groupedData.set(date, current);
    });

    return Array.from(groupedData.entries())
      .map(([date, counts]) => ({
        date,
        "2xx": counts["2xx"],
        "4xx": counts["4xx"],
        "5xx": counts["5xx"],
        avgResponseTime: Math.round(counts.totalTime / counts.count),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Log Analytics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Monitor HTTP status codes and response times
          </span>
          <span className="@[540px]/card:hidden">HTTP metrics</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={processedData}>
            <defs>
              <linearGradient id="fill2xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2xx)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-2xx)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fill4xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-4xx)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-4xx)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fill5xx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-5xx)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-5xx)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAvgResponseTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-avgResponseTime)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-avgResponseTime)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="2xx"
              type="natural"
              fill="url(#fill2xx)"
              stroke="var(--color-2xx)"
              stackId="a"
            />
            <Area
              dataKey="4xx"
              type="natural"
              fill="url(#fill4xx)"
              stroke="var(--color-4xx)"
              stackId="a"
            />
            <Area
              dataKey="5xx"
              type="natural"
              fill="url(#fill5xx)"
              stroke="var(--color-5xx)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
