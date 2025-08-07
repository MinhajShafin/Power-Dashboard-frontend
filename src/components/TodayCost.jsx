"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TodayCost() {
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [todayCost, setTodayCost] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  // Bangladesh electricity tariff calculation function
  const calculateElectricityCost = (unitsConsumed) => {
    let cost = 0;
    let remainingUnits = unitsConsumed;

    // Bangladesh residential electricity tariff slabs (as of 2024)
    const tariffSlabs = [
      { limit: 75, rate: 4.5 },      // 0-75 units: 4.5 taka per unit
      { limit: 125, rate: 5.5 },     // 76-200 units: 5.5 taka per unit
      { limit: 100, rate: 6.5 },     // 201-300 units: 6.5 taka per unit
      { limit: 100, rate: 8.5 },     // 301-400 units: 8.5 taka per unit
      { limit: Infinity, rate: 11.0 } // 400+ units: 11.0 taka per unit
    ];

    for (const slab of tariffSlabs) {
      if (remainingUnits <= 0) break;

      const unitsInThisSlab = Math.min(remainingUnits, slab.limit);
      cost += unitsInThisSlab * slab.rate;
      remainingUnits -= unitsInThisSlab;
    }

    return cost;
  };

  React.useEffect(() => {
    const fetchTodayCost = async () => {
      try {
        const response = await fetch("https://power-dashboard-backend.onrender.com/today-consumption");
        const result = await response.json();

        if (result.success) {
          // Check if the API returns cost directly or if we need to calculate from consumption
          if (result.data.cost !== undefined) {
            // If API returns cost, use it directly
            setTodayCost(result.data.cost);
          } else if (result.data.consumption !== undefined) {
            // If API returns consumption in kWh, calculate cost using slab rates
            const calculatedCost = calculateElectricityCost(result.data.consumption);
            setTodayCost(calculatedCost);
          } else if (result.data.power !== undefined) {
            // If API returns power in watts, estimate daily consumption and calculate cost
            // Assuming the power reading represents current usage rate
            const estimatedDailyConsumption = (result.data.power / 1000) * 24; // 24 hours
            const calculatedCost = calculateElectricityCost(estimatedDailyConsumption);
            setTodayCost(calculatedCost);
          } else {
            console.error("No valid cost or consumption data found in API response");
          }
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
          Today's Electricity Cost (Bangladesh Tariff)
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
        <div className="mt-2 text-xs text-muted-foreground">
          Slab rates: 0-75@4.5 ৳ , 76-200@5.5 ৳ , 201-300@6.5 ৳ , 301-400@8.5 ৳ , 400+@11 ৳
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
