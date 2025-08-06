"use client";

import * as React from "react";
import { Activity, TrendingUp, Loader2, RefreshCw } from "lucide-react";
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

export const description = "A step area chart";

const chartConfig = {
  unit: {
    label: "Unit (kWh)",
    color: "var(--chart-1)",
    icon: Activity,
  },
};

export function UnitkwhChart() {
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch kWh data from API
  const fetchKwhData = async (isRefresh = false) => {
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
        // Extract week data and calculate daily kWh
        const weekData = result.data.week || [];

        // Calculate daily kWh based on power consumption
        const dailyKwhData = weekData.map((item, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (weekData.length - 1 - index));
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

          // Calculate daily kWh: (power in watts / 1000) * assumed hours of usage
          // Assuming average 8 hours of usage per day
          const dailyKwh = (item.power || 0) / 1000 * 8;

          return {
            day: dayName,
            unit: parseFloat(dailyKwh.toFixed(2)) // Round to 2 decimal places
          };
        });

        setChartData(dailyKwhData);
      } else {
        throw new Error("Failed to fetch kWh data");
      }
    } catch (err) {
      console.error("Error fetching kWh data:", err);
      setError(err.message);

      // Fallback to sample data on error
      setChartData([
        { day: "Mon", unit: 8.8 },
        { day: "Tue", unit: 9.6 },
        { day: "Wed", unit: 12.0 },
        { day: "Thu", unit: 12.8 },
        { day: "Fri", unit: 13.6 },
        { day: "Sat", unit: 14.4 },
        { day: "Sun", unit: 15.2 },
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
    fetchKwhData();
  }, []);

  const handleRefresh = () => {
    fetchKwhData(true);
  };

  // Show loading state
  if (loading) {
    return (
      <Card className="w-[600px] h-[420px] p-3 pt-5 flex-col">
        <CardHeader>
          <CardTitle>Unit kWh Chart - Loading</CardTitle>
          <CardDescription>Loading energy consumption data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-[600px] h-[420px] p-3 pt-5 flex-col">
        <CardHeader>
          <CardTitle>Unit kWh Chart - Error</CardTitle>
          <CardDescription>Failed to load energy consumption data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[600px] h-[420px] p-3 pt-5 flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Unit kWh Chart - Step</CardTitle>
          <CardDescription>
            Daily energy consumption for the last 7 days
          </CardDescription>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </CardHeader>
      <CardContent>
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
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="unit"
              type="step"
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
              Energy consumption over the week <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Updated in real-time from MongoDB
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
