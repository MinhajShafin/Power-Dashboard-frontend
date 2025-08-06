"use client";

import { TodayCost } from "@/components/TodayCost";
import { ChartAreaInteractive } from "./Main_chart";
import { DeviceControl } from "@/components/DeviceControl";
import { UnitkwhChart } from "@/components/UnitkwhChart";
import { UnitMoneyChart } from "@/components/UnitMoneyChart";
import React, { useEffect, useState } from "react";
import { Todaykwh } from "@/components/Todaykwh";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <App />
        <div className="flex justify-between">
          <Todaykwh />
          <TodayCost />
          <DeviceControl />
        </div>
        <ChartAreaInteractive />
        <div className="flex justify-between">
          <UnitkwhChart />
          <UnitMoneyChart />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [blink, setBlink] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("wss://toda-backend-tr28.onrender.com");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);

        setData(newData);
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      } catch (err) {
        console.error("❌ Error parsing message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setWsConnected(false);
    };

    return () => ws.close();
  }, []);

  const handleUserManualDownload = () => {
    const link = document.createElement("a");
    link.href = "/user-manual.pdf";
    link.download = "user-manual.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInstallationGuideDownload = () => {
    const link = document.createElement("a");
    link.href = "/Project_Setup_Guide.pdf";
    link.download = "Project_Setup_Guide.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const blinkClass = blink
    ? "opacity-0 transition-opacity duration-150"
    : "opacity-100 transition-opacity duration-150";

  return (
    <div className="font-sans p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Power Monitoring Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="flex items-center gap-2">
            <button
              onClick={handleUserManualDownload}
              className="px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md"
            >
              User Manual
            </button>
            <button
              onClick={handleInstallationGuideDownload}
              className="px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md"
            >
              Installation Guide
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                wsConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-muted-foreground">
              {wsConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xl">
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Time
            </div>
            <div className={`font-semibold text-foreground ${blinkClass}`}>
              {new Date(data.time).toLocaleTimeString()}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Current
            </div>
            <div className="font-semibold text-foreground">
              {data.current} mA
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Voltage
            </div>
            <div className="font-semibold text-foreground">
              {data.voltage} V
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Power
            </div>
            <div className="font-semibold text-foreground">{data.power} W</div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Waiting for data...</p>
      )}
    </div>
  );
}
