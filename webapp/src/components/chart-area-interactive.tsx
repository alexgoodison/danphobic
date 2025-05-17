"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  {
    date: "2024-04-01",
    "2xx": 1200,
    "4xx": 45,
    "5xx": 5,
    avgResponseTime: 120,
  },
  {
    date: "2024-04-02",
    "2xx": 1150,
    "4xx": 50,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-03",
    "2xx": 1300,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-04-04",
    "2xx": 1400,
    "4xx": 55,
    "5xx": 4,
    avgResponseTime: 125,
  },
  {
    date: "2024-04-05",
    "2xx": 1500,
    "4xx": 60,
    "5xx": 6,
    avgResponseTime: 130,
  },
  {
    date: "2024-04-06",
    "2xx": 1450,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 122,
  },
  {
    date: "2024-04-07",
    "2xx": 1350,
    "4xx": 42,
    "5xx": 2,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-08",
    "2xx": 1600,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-04-09",
    "2xx": 1250,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-04-10",
    "2xx": 1400,
    "4xx": 52,
    "5xx": 4,
    avgResponseTime: 120,
  },
  {
    date: "2024-04-11",
    "2xx": 1550,
    "4xx": 58,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-04-12",
    "2xx": 1450,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-13",
    "2xx": 1500,
    "4xx": 62,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-04-14",
    "2xx": 1300,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-04-15",
    "2xx": 1250,
    "4xx": 35,
    "5xx": 1,
    avgResponseTime: 112,
  },
  {
    date: "2024-04-16",
    "2xx": 1350,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-17",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-04-18",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-04-19",
    "2xx": 1400,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-04-20",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-04-21",
    "2xx": 1300,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-22",
    "2xx": 1400,
    "4xx": 45,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-04-23",
    "2xx": 1350,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-04-24",
    "2xx": 1500,
    "4xx": 58,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-04-25",
    "2xx": 1450,
    "4xx": 52,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-04-26",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-04-27",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-04-28",
    "2xx": 1300,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-04-29",
    "2xx": 1450,
    "4xx": 55,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-04-30",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 6,
    avgResponseTime: 130,
  },
  {
    date: "2024-05-01",
    "2xx": 1350,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-05-02",
    "2xx": 1500,
    "4xx": 60,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-05-03",
    "2xx": 1450,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-05-04",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-05-05",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-05-06",
    "2xx": 1700,
    "4xx": 75,
    "5xx": 7,
    avgResponseTime: 135,
  },
  {
    date: "2024-05-07",
    "2xx": 1550,
    "4xx": 60,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-05-08",
    "2xx": 1300,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-05-09",
    "2xx": 1400,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-05-10",
    "2xx": 1500,
    "4xx": 62,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-05-11",
    "2xx": 1550,
    "4xx": 58,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-05-12",
    "2xx": 1350,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-05-13",
    "2xx": 1350,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-05-14",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-05-15",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-05-16",
    "2xx": 1500,
    "4xx": 62,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-05-17",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-05-18",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-05-19",
    "2xx": 1450,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-05-20",
    "2xx": 1350,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-05-21",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-05-22",
    "2xx": 1200,
    "4xx": 35,
    "5xx": 1,
    avgResponseTime: 112,
  },
  {
    date: "2024-05-23",
    "2xx": 1450,
    "4xx": 58,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-05-24",
    "2xx": 1500,
    "4xx": 55,
    "5xx": 4,
    avgResponseTime: 120,
  },
  {
    date: "2024-05-25",
    "2xx": 1400,
    "4xx": 52,
    "5xx": 4,
    avgResponseTime: 118,
  },
  {
    date: "2024-05-26",
    "2xx": 1400,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 115,
  },
  {
    date: "2024-05-27",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-05-28",
    "2xx": 1450,
    "4xx": 48,
    "5xx": 3,
    avgResponseTime: 120,
  },
  {
    date: "2024-05-29",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-05-30",
    "2xx": 1500,
    "4xx": 60,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-05-31",
    "2xx": 1350,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-01",
    "2xx": 1350,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-02",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-03",
    "2xx": 1250,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-04",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-05",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-06",
    "2xx": 1500,
    "4xx": 58,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-06-07",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-08",
    "2xx": 1550,
    "4xx": 62,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-09",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-10",
    "2xx": 1350,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-11",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-12",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-06-13",
    "2xx": 1200,
    "4xx": 38,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-14",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-15",
    "2xx": 1550,
    "4xx": 65,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-16",
    "2xx": 1550,
    "4xx": 62,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-17",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-06-18",
    "2xx": 1250,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-19",
    "2xx": 1500,
    "4xx": 60,
    "5xx": 5,
    avgResponseTime: 125,
  },
  {
    date: "2024-06-20",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-21",
    "2xx": 1350,
    "4xx": 45,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-22",
    "2xx": 1550,
    "4xx": 58,
    "5xx": 4,
    avgResponseTime: 122,
  },
  {
    date: "2024-06-23",
    "2xx": 1650,
    "4xx": 70,
    "5xx": 6,
    avgResponseTime: 132,
  },
  {
    date: "2024-06-24",
    "2xx": 1300,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-25",
    "2xx": 1300,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-26",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-27",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
  {
    date: "2024-06-28",
    "2xx": 1300,
    "4xx": 42,
    "5xx": 3,
    avgResponseTime: 118,
  },
  {
    date: "2024-06-29",
    "2xx": 1250,
    "4xx": 40,
    "5xx": 2,
    avgResponseTime: 115,
  },
  {
    date: "2024-06-30",
    "2xx": 1600,
    "4xx": 68,
    "5xx": 5,
    avgResponseTime: 128,
  },
];

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

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [metric, setMetric] = React.useState("2xx");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

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
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fill2xx" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-2xx)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-2xx)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fill4xx" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-4xx)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-4xx)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fill5xx" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-5xx)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-5xx)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillAvgResponseTime"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-avgResponseTime)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-avgResponseTime)"
                  stopOpacity={0.1}
                />
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
