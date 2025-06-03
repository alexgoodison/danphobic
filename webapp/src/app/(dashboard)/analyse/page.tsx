"use client";

import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function AnalyseLogsPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [manualFilters, setManualFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    path: "",
    method: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptSubmit = async () => {
    try {
      setIsLoading(true);
      // Encode the prompt for URL safety
      const encodedPrompt = encodeURIComponent(prompt);
      router.push(`/analyse/results?type=prompt&query=${encodedPrompt}`);
    } catch (error) {
      console.error("Error analyzing logs:", error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, any> = {};

      if (manualFilters.startDate) {
        filters.datetime = { gte: new Date(manualFilters.startDate).toISOString() };
      }
      if (manualFilters.endDate) {
        filters.datetime = {
          ...filters.datetime,
          lte: new Date(manualFilters.endDate).toISOString(),
        };
      }
      if (manualFilters.status) {
        filters.status = parseInt(manualFilters.status);
      }
      if (manualFilters.path) {
        filters.path = manualFilters.path;
      }
      if (manualFilters.method) {
        filters.method = manualFilters.method.toUpperCase();
      }

      // Encode the filters for URL safety
      const encodedFilters = encodeURIComponent(JSON.stringify(filters));
      router.push(`/analyse/results?type=manual&filters=${encodedFilters}`);
    } catch (error) {
      console.error("Error analyzing logs:", error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <SiteHeader title="Analyse Logs" />
      <div className="@container/main flex flex-1 flex-col justify-center gap-6 py-8 px-6">
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">AI-Powered Analysis</TabsTrigger>
            <TabsTrigger value="manual">Manual Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Log Analysis</CardTitle>
                <CardDescription>
                  Describe what you want to analyse in natural language, and our AI will
                  generate the appropriate query.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Analysis Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., Show me all 404 errors from the last 24 hours"
                    className="h-24"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handlePromptSubmit} disabled={isLoading}>
                  {isLoading ? "Generating Analysis..." : "Generate Analysis"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manual Filter Selection</CardTitle>
                <CardDescription>Select specific filters to analyse your logs.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      type="datetime-local"
                      id="startDate"
                      value={manualFilters.startDate}
                      onChange={(e) =>
                        setManualFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      type="datetime-local"
                      id="endDate"
                      value={manualFilters.endDate}
                      onChange={(e) =>
                        setManualFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Code</Label>
                  <Input
                    id="status"
                    placeholder="e.g., 404"
                    value={manualFilters.status}
                    onChange={(e) =>
                      setManualFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="path">Path</Label>
                  <Input
                    id="path"
                    placeholder="e.g., /api/users"
                    value={manualFilters.path}
                    onChange={(e) =>
                      setManualFilters((prev) => ({
                        ...prev,
                        path: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Input
                    id="method"
                    placeholder="e.g., GET, POST"
                    value={manualFilters.method}
                    onChange={(e) =>
                      setManualFilters((prev) => ({
                        ...prev,
                        method: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button className="w-full" onClick={handleManualSubmit} disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Apply Filters"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
