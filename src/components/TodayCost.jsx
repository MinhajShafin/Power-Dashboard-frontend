"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiBase } from "@/lib/config";

// Tariff slabs (step-wise rates)
const tariffSlabs = [
  { limit: 75, rate: 4.5 },
  { limit: 125, rate: 5.5 },
  { limit: 100, rate: 6.5 },
  { limit: 100, rate: 8.5 },
  { limit: Infinity, rate: 11.0 },
];

// Calculate cost based on slabs
function calculateTariffCost(units) {
  let cost = 0;
  let remaining = units;

  for (let i = 0; i < tariffSlabs.length; i++) {
    if (remaining <= 0) break;

    const slab = tariffSlabs[i];
    const slabUnits = Math.min(remaining, slab.limit);
    cost += slabUnits * slab.rate;
    remaining -= slabUnits;
  }

  return cost;
}

export function TodayCost({ deviceId }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [kwh, setKwh] = useState(0);
  const [tariffCost, setTariffCost] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchTodayConsumption = async () => {
      try {
        const url = deviceId
          ? `${apiBase}/today-consumption?deviceId=${encodeURIComponent(
              deviceId
            )}`
          : `${apiBase}/today-consumption`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          const units = result.data.kwh;
          const cost = calculateTariffCost(units);

          setKwh(units);
          setTariffCost(cost);
          setLastUpdated(new Date());
        } else {
          console.error("Failed to fetch:", result.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    // Initial fetch
    fetchTodayConsumption();

    // Set up real-time polling every 30 seconds
    const interval = setInterval(fetchTodayConsumption, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [deviceId]);

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
              {initialLoading ? "Loading..." : tariffCost.toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground">Taka</span>
          </div>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Units consumed: {initialLoading ? "Loading..." : kwh.toFixed(2)} kWh
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Calculated using official tariff slabs
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
