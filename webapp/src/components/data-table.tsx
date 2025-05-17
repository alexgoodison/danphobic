"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogEntry } from "@/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const columns = [
  { id: "datetime", label: "Date & Time" },
  { id: "remote_addr", label: "IP Address" },
  { id: "method", label: "Method" },
  { id: "path", label: "Path" },
  { id: "status", label: "Status" },
  { id: "body_bytes_sent", label: "Size" },
  { id: "http_user_agent", label: "User Agent" },
] as const;

export default function DataTable({ data }: { data: LogEntry[] }) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.id))
  );

  const toggleColumn = (columnId: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnId)) {
      newVisibleColumns.delete(columnId);
    } else {
      newVisibleColumns.add(columnId);
    }
    setVisibleColumns(newVisibleColumns);
  };

  return (
    <div className="space-y-4 mx-6">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Log Entries</h2>
          <p className="text-sm text-muted-foreground">
            A list of all log entries from your server.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.has(column.id)}
                onCheckedChange={() => toggleColumn(column.id)}>
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(
                (column) =>
                  visibleColumns.has(column.id) && (
                    <TableHead key={column.id} className="px-6">
                      {column.label}
                    </TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry, index) => (
              <TableRow key={index}>
                {columns.map(
                  (column) =>
                    visibleColumns.has(column.id) && (
                      <TableCell key={column.id} className="px-6">
                        {column.id === "body_bytes_sent"
                          ? `${entry[column.id]} bytes`
                          : entry[column.id]}
                      </TableCell>
                    )
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
