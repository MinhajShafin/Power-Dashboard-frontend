"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TodayCost() {
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [todayCost, setTodayCost] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  React.useEffect(() => {
    const fetchTodayCost = async () => {
      try {
        const response = await fetch("https://power-dashboard-backend.onrender.com/today-consumption");
        const result = await response.json();

        if (result.success) {
          setTodayCost(result.data.cost);
          setLastUpdated(new Date());
        } else {
          console.error("Failed to fetch today's cost:", result.error);
        }
      } catch (error) {
        console.error("Error fetching today's cost:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    // Initial fetch
    fetchTodayCost();

    // Set up real-time polling every 30 seconds
    const interval = setInterval(fetchTodayCost, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-[600px] ml-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-xl">
          Today's Electricity Cost for AC
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <span className="text-xl font-medium text-foreground">
              {initialLoading ? "Loading..." : todayCost.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground">Taka</span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs text-muted-foreground">
            {lastUpdated && (
              <span className="ml-2 text-green-500">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
