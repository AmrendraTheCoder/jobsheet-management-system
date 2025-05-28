export interface JobSheet {
  id: number;
  job_date: string | null;
  party_name: string | null; // Added this
  description: string | null;
  sheet: number | null;
  plate: number | null;
  size: string | null;
  sq_inch: number | null;
  paper_sheet: number | null;
  imp: number | null;
  rate: number | null;
  printing: number | null;
  uv: number | null;
  baking: number | null;
  // file_url: string | null; // Remove this line
  created_at?: string;
  updated_at?: string;
}

export interface JobSheetNote {
  id: string;
  job_sheet_id: number;
  note: string;
  created_at: string;
  author: string;
}

export interface JobSheetStats {
  totalJobSheets: number;
  totalRevenue: number;
  avgJobValue: number;
  thisMonthJobs: number;
  lastMonthJobs: number;
  revenueGrowth: number;
  totalSheets: number;
  totalImpressions: number;
}

export interface JobSheetChartData {
  month: string;
  jobs: number;
  revenue: number;
  sheets: number;
}

export interface JobSheetNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}