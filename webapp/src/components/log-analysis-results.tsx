import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogEntry } from "@/types";

interface LogAnalysisResultsProps {
  logs: LogEntry[];
}

export function LogAnalysisResults({ logs }: LogAnalysisResultsProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>User Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(log.datetime).toLocaleString()}</TableCell>
              <TableCell>{log.method}</TableCell>
              <TableCell>{log.path}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{log.remote_addr}</TableCell>
              <TableCell className="max-w-[200px] truncate">{log.http_user_agent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
