"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Todaykwh() {
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [todaykwh, setTodaykwh] = React.useState(0);

  React.useEffect(() => {
    const fetchTodayKwh = async () => {
      try {
        const response = await fetch(
          "https://power-dashboard-backend.onrender.com/today-consumption"
        );
        const result = await response.json();

        if (result.success) {
          setTodaykwh(result.data.kwh);
        } else {
          console.error("Failed to fetch today's kWh:", result.error);
        }
      } catch (error) {
        console.error("Error fetching today's kWh:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchTodayKwh();
  }, []);

  return (
    <Card className="w-64 ml-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-xl">
          Today's Unit Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <span className="text-xl font-medium text-foreground">
              {initialLoading ? "Loading..." : todaykwh.toFixed(4)}
            </span>
            <span className="text-lg text-muted-foreground">Unit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
