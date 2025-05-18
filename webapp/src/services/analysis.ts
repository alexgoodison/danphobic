import axios from "axios";
import { LogAnalysisReport } from "@/types";

const NEXT_PUBLIC_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export async function getLogAnalysisReport(query: any): Promise<LogAnalysisReport> {
  try {
    const response = await axios.post(NEXT_PUBLIC_API_ENDPOINT + "/analyse", query);
    return response.data as LogAnalysisReport;
  } catch (error) {
    console.error("Error analyzing logs:", error);
    return null;
  }
}
