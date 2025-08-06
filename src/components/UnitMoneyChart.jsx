"use client";

import * as React from "react";
import { TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A linear area chart";

const chartConfig = {
  taka: {
    label: "Taka",
    color: "var(--chart-1)",
  },
};

export function UnitMoneyChart() {
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch daily cost data from API
  const fetchDailyCostData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(
        "https://power-dashboard-backend.onrender.com/main-chart/data"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Extract week data and calculate daily costs
        const weekData = result.data.week || [];

        // Calculate daily cost based on power consumption (assuming 10 taka per unit)
        const dailyCostData = weekData.map((item, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (weekData.length - 1 - index));
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

          // Calculate daily cost: (power in watts / 1000) * hours * cost per unit
          // Assuming average 8 hours of AC usage per day and 10 taka per unit
          const dailyPowerKwh = (item.power || 0) / 1000 * 8;
          const dailyCost = dailyPowerKwh * 10;

          return {
            day: dayName,
            taka: Math.round(dailyCost)
          };
        });

        setChartData(dailyCostData);
      } else {
        throw new Error("Failed to fetch cost data");
      }
    } catch (err) {
      console.error("Error fetching daily cost data:", err);
      setError(err.message);
      // Fallback to sample data on error
      setChartData([
        { day: "Mon", taka: 850 },
        { day: "Tue", taka: 920 },
        { day: "Wed", taka: 1150 },
        { day: "Thu", taka: 1050 },
        { day: "Fri", taka: 1200 },
        { day: "Sat", taka: 1100 },
        { day: "Sun", taka: 980 },
      ]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    fetchDailyCostData();
  }, []);

  const handleRefresh = () => {
    fetchDailyCostData(true);
  };

  // Show loading state
  if (loading) {
    return (
      <Card className="w-[600px] h-[420px] p-3 pt-5 flex flex-col">
        <CardHeader>
          <CardTitle>Electricity Cost</CardTitle>
          <CardDescription>Loading daily cost data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && chartData.length === 0) {
    return (
      <Card className="w-[600px] h-[420px] p-3 pt-5 flex flex-col">
        <CardHeader>
          <CardTitle>Electricity Cost</CardTitle>
          <CardDescription>Error loading cost data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[600px] h-[420px] p-3 pt-5 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daily Electricity Cost</CardTitle>
          <CardDescription>
            Showing daily electricity cost for the last week (10 taka per unit)
          </CardDescription>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="taka"
              type="linear"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Daily cost based on power consumption data <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Cost calculated at 10 taka per kWh with 8h daily usage
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
