import { LogEntry } from "@/types";
import client from "../helpers/elasticsearch";

const index = process.env.ELASTIC_INDEX as string;

// Define the mapping for NGINX log entries
const mapping = {
  properties: {
    remote_addr: { type: "ip" as const },
    remote_user: { type: "keyword" as const },
    time_local: { type: "keyword" as const },
    request: { type: "keyword" as const },
    status: { type: "integer" as const },
    body_bytes_sent: { type: "long" as const },
    http_referer: { type: "keyword" as const },
    http_user_agent: { type: "text" as const },
    datetime: { type: "date" as const },
    method: { type: "keyword" as const },
    path: { type: "keyword" as const },
    protocol: { type: "keyword" as const },
  },
};

// Create a new log entry
export const createLogEntry = async (logEntry: Record<string, any>) => {
  return await client.index({
    index,
    document: logEntry,
    refresh: true,
  });
};

// Read log entries with optional filters
export const getLogEntries = async (
  query = { bool: { must: [] } },
  size: number = 10000
): Promise<LogEntry[]> => {
  const response = await client.search({
    index,
    query,
    size,
  });

  return response.hits.hits.map((hit) => hit._source as LogEntry);
};

// Update a log entry
export const updateLogEntry = async (id: string, updates: Record<string, any>) => {
  return await client.update({
    index,
    id,
    doc: updates,
    refresh: true,
  });
};

// Delete a log entry
export const deleteLogEntry = async (id: string) => {
  return await client.delete({
    index,
    id,
    refresh: true,
  });
};
