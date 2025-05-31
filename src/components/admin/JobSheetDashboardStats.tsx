"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Calendar,
  Layers,
  Activity,
  Target,
  Banknote,
} from "lucide-react";
import { JobSheetStats, JobSheetChartData } from "@/types/jobsheet";

interface JobSheetDashboardStatsProps {
  stats: JobSheetStats;
  chartData: JobSheetChartData[];
}

export default function JobSheetDashboardStats({
  stats,
  chartData,
}: JobSheetDashboardStatsProps) {
  // Debug logging
  console.log("JobSheetDashboardStats received:", {
    stats,
    chartData,
    chartDataLength: chartData?.length,
    hasValidData: chartData?.some((d) => d.revenue > 0 || d.jobs > 0),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "↗️";
    if (growth < 0) return "↘️";
    return "➡️";
  };

  // Use provided chart data directly since parent component handles fallback
  const displayChartData = chartData || [];

  return (
    <div className="space-y-6 mt-8">
      {" "}
      {/* Added top margin */}
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Job Sheets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Job Sheets
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalJobSheets)}
            </div>
            <div className="flex items-center mt-2">
              <span
                className={`text-sm ${getGrowthColor(stats.revenueGrowth)}`}
              >
                {getGrowthIcon(stats.revenueGrowth)}{" "}
                {Math.abs(stats.revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">
                Avg: {formatCurrency(stats.avgJobValue)} per job
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Sheets Processed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sheets Processed
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalSheets)}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">
                {formatNumber(stats.totalImpressions)} impressions
              </span>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.thisMonthJobs)}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">
                vs {stats.lastMonthJobs} last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Job Value
            </CardTitle>
            <Target className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.avgJobValue)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on completed jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Production Efficiency
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalSheets > 0
                ? (stats.totalImpressions / stats.totalSheets).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-gray-500 mt-2">Impressions per sheet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getGrowthColor(stats.revenueGrowth)}`}
            >
              {stats.revenueGrowth > 0 ? "+" : ""}
              {stats.revenueGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Job sheets vs last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
