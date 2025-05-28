"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import custom hooks and types
import { useJobSheets } from "@/hooks/useJobSheets";
import {
  JobSheet,
  JobSheetNote,
  JobSheetStats,
  JobSheetChartData,
  JobSheetNotification,
} from "@/types/jobsheet";
// Import modular components
import JobSheetDashboardNavbar from "./admin/JobSheetDashboardNavbar";
import JobSheetDashboardStats from "./admin/JobSheetDashboardStats";
import JobSheetsTable from "./admin/JobSheetsTable";
import JobSheetDetailModal from "./admin/JobSheetDetailModal";

export default function JobSheetAdminDashboard() {
  // Use custom hook for database operations
  const {
    jobSheets,
    notes,
    loading,
    error,
    updateJobSheet,
    deleteJobSheet,
    addNote,
    generateReport,
  } = useJobSheets();

  // State for notifications
  const [notifications, setNotifications] = useState<JobSheetNotification[]>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("jobsheet-admin-notifications");
        if (saved) {
          return JSON.parse(saved);
        }
      }
      return [
        {
          id: "1",
          title: "New Job Sheet Created",
          message: "A new production job sheet has been created",
          type: "info",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
        },
        {
          id: "2",
          title: "Production Complete",
          message: "Job sheet #123 production completed successfully",
          type: "success",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          read: false,
        },
      ];
    }
  );

  // Dashboard statistics state
  const [stats, setStats] = useState<JobSheetStats>({
    totalJobSheets: 0,
    totalRevenue: 0,
    avgJobValue: 0,
    thisMonthJobs: 0,
    lastMonthJobs: 0,
    revenueGrowth: 0,
    totalSheets: 0,
    totalImpressions: 0,
  });

  // Chart data for analytics
  const [chartData, setChartData] = useState<JobSheetChartData[]>([]);

  // UI state
  const [selectedJobSheet, setSelectedJobSheet] = useState<JobSheet | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Calculate dashboard statistics from real data
  useEffect(() => {
    if (jobSheets.length > 0) {
      calculateStats(jobSheets);
      generateChartData();
    }
  }, [jobSheets]);

  // Function to calculate statistics
  const calculateStats = (data: JobSheet[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalJobSheets = data.length;

    const totalRevenue = data
      .filter((sheet) => sheet.printing)
      .reduce((sum, sheet) => {
        const total =
          (sheet.printing || 0) + (sheet.uv || 0) + (sheet.baking || 0);
        return sum + total;
      }, 0);

    const avgJobValue = totalJobSheets > 0 ? totalRevenue / totalJobSheets : 0;

    const thisMonthJobs = data.filter(
      (sheet) => sheet.job_date && new Date(sheet.job_date) >= thisMonth
    ).length;

    const lastMonthJobs = data.filter(
      (sheet) =>
        sheet.job_date &&
        new Date(sheet.job_date) >= lastMonth &&
        new Date(sheet.job_date) <= endOfLastMonth
    ).length;

    const revenueGrowth =
      lastMonthJobs > 0
        ? ((thisMonthJobs - lastMonthJobs) / lastMonthJobs) * 100
        : 0;

    const totalSheets = data.reduce(
      (sum, sheet) => sum + (sheet.sheet || 0),
      0
    );
    const totalImpressions = data.reduce(
      (sum, sheet) => sum + (sheet.imp || 0),
      0
    );

    setStats({
      totalJobSheets,
      totalRevenue,
      avgJobValue,
      thisMonthJobs,
      lastMonthJobs,
      revenueGrowth,
      totalSheets,
      totalImpressions,
    });
  };

  // Function to generate chart data
  const generateChartData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthJobSheets = jobSheets.filter((sheet) => {
        if (!sheet.job_date) return false;
        const jobDate = new Date(sheet.job_date);
        return jobDate >= monthStart && jobDate <= monthEnd;
      });

      const monthRevenue = monthJobSheets.reduce((sum, sheet) => {
        const total =
          (sheet.printing || 0) + (sheet.uv || 0) + (sheet.baking || 0);
        return sum + total;
      }, 0);

      const monthSheets = monthJobSheets.reduce(
        (sum, sheet) => sum + (sheet.sheet || 0),
        0
      );

      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        jobs: monthJobSheets.length,
        revenue: monthRevenue,
        sheets: monthSheets,
      });
    }
    setChartData(months);
  };

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "jobsheet-admin-notifications",
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Job Sheet Dashboard
          </h2>
          <p className="text-gray-500">
            Please wait while we fetch your production data...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Database Connection Error
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <JobSheetDashboardNavbar
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Statistics */}
        <JobSheetDashboardStats stats={stats} chartData={chartData} />

        {/* Job Sheets Table */}
        <JobSheetsTable
          jobSheets={jobSheets}
          notes={notes}
          searchTerm={searchTerm}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          updateJobSheet={updateJobSheet}
          deleteJobSheet={deleteJobSheet}
          addNote={addNote}
          generateReport={generateReport}
          setSelectedJobSheet={setSelectedJobSheet}
        />

        {/* Job Sheet Detail Modal */}
        {selectedJobSheet && (
          <JobSheetDetailModal
            jobSheet={selectedJobSheet}
            notes={notes}
            onClose={() => setSelectedJobSheet(null)}
            updateJobSheet={updateJobSheet}
            addNote={addNote}
            generateReport={generateReport}
          />
        )}
      </div>
    </div>
  );
}
