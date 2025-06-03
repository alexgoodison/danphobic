"use client";

import { LogEntry } from "@/types";
import { ChartAreaInteractive } from "./chart-area-interactive";
import DataTable from "./data-table";
import { SectionCards } from "./section-cards";
import { useState, useMemo } from "react";
import { IconFilter, IconChevronDown } from "@tabler/icons-react";

type OverviewProps = {
  logEntries: LogEntry[];
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;
const STATUS_CODES = [
  { value: "2xx", label: "2xx (Success)" },
  { value: "3xx", label: "3xx (Redirect)" },
  { value: "4xx", label: "4xx (Client Error)" },
  { value: "5xx", label: "5xx (Server Error)" },
] as const;

export default function Overview({ logEntries }: OverviewProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedStatusCodes, setSelectedStatusCodes] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return logEntries.filter((entry) => {
      // Date filtering
      const entryDate = new Date(entry.datetime);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const dateFilter =
        !startDate && !endDate
          ? true
          : start && end
          ? entryDate >= start && entryDate <= end
          : start
          ? entryDate >= start
          : end
          ? entryDate <= end
          : true;

      // Method filtering
      const methodFilter =
        selectedMethods.length === 0 || selectedMethods.includes(entry.method.toUpperCase());

      // Status code filtering
      const statusFilter =
        selectedStatusCodes.length === 0 ||
        selectedStatusCodes.some((code) => {
          const status = entry.status.toString();
          return code.startsWith(status[0]);
        });

      return dateFilter && methodFilter && statusFilter;
    });
  }, [logEntries, startDate, endDate, selectedMethods, selectedStatusCodes]);

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const toggleStatusCode = (code: string) => {
    setSelectedStatusCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const activeFiltersCount = [
    startDate || endDate,
    selectedMethods.length > 0,
    selectedStatusCodes.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              <IconFilter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {activeFiltersCount}
                </span>
              )}
              <IconChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${
                  isFiltersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Collapsible Filter Section */}
            <div
              className={`mt-0 grid transition-all duration-200 ease-in-out border shadow rounded-xl px-4 pb-2 ${
                isFiltersOpen
                  ? "mt-3 grid-rows-[1fr] opacity-100 pb-4"
                  : "grid-rows-[0fr] opacity-0"
              }`}>
              <div className="overflow-hidden">
                <div className="flex flex-col gap-6 pt-4">
                  {/* Date Range Filters */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* HTTP Methods Filter */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">HTTP Methods</label>
                    <div className="flex flex-wrap gap-2">
                      {HTTP_METHODS.map((method) => (
                        <button
                          key={method}
                          onClick={() => toggleMethod(method)}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            selectedMethods.includes(method)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}>
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Codes Filter */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Status Codes</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_CODES.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => toggleStatusCode(value)}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            selectedStatusCodes.includes(value)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SectionCards data={filteredEntries} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={filteredEntries} />
          </div>
          <DataTable data={filteredEntries} />
        </div>
      </div>
    </div>
  );
}
