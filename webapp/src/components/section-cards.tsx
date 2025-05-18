import { IconActivity, IconAlertCircle, IconClock, IconUsers } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogEntry } from "@/types";

type SectionCardsProps = {
  data: LogEntry[];
};

// Helper function to format bytes into human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))}${sizes[i]}`;
}

export function SectionCards({ data }: SectionCardsProps) {
  // Calculate statistics from log entries
  const totalRequests = data.length;
  const errorRequests = data.filter((entry) => entry.status >= 400).length;
  const errorRate = totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(1) : 0;
  const totalBytes = data.reduce((sum, entry) => sum + entry.body_bytes_sent, 0);
  const avgBytes = totalRequests > 0 ? Math.round(totalBytes / totalRequests) : 0;
  const uniqueIPs = new Set(data.map((entry) => entry.remote_addr)).size;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalRequests.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconActivity />
              {data.length > 0 ? "Active" : "No Data"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total HTTP requests <IconActivity className="size-4" />
          </div>
          <div className="text-muted-foreground">All time</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Error Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {errorRate}%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={Number(errorRate) > 5 ? "text-destructive" : ""}>
              <IconAlertCircle />
              {errorRequests} error{errorRequests === 1 ? "" : "s"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {Number(errorRate) > 5 ? "High error rate" : "Error rate within threshold"}{" "}
            <IconAlertCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">All time</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Response Size</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatBytes(avgBytes)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {formatBytes(totalBytes)} total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Average response size <IconClock className="size-4" />
          </div>
          <div className="text-muted-foreground">All time</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unique Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {uniqueIPs.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers />
              {data.length > 0 ? "Active" : "No Data"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique IP addresses <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">All time</div>
        </CardFooter>
      </Card>
    </div>
  );
}
