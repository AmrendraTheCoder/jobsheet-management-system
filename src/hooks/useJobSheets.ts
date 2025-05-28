"use client";

import { useState, useEffect } from "react";
import { JobSheet, JobSheetNote } from "@/types/jobsheet";

export function useJobSheets() {
  const [jobSheets, setJobSheets] = useState<JobSheet[]>([]);
  const [notes, setNotes] = useState<JobSheetNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job sheets
  const fetchJobSheets = async () => {
    try {
      setLoading(true);
      console.log("Fetching job sheets...");
      
      const response = await fetch("/api/job-sheets");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Job sheets response:", data);
      
      if (data.success) {
        setJobSheets(data.data || []);
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch job sheets");
      }
    } catch (err: any) {
      console.error("Error fetching job sheets:", err);
      setError(err.message || "Failed to load job sheets");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    try {
      console.log("Fetching job sheet notes...");
      const response = await fetch("/api/job-sheet-notes");
      
      if (response.ok) {
        const data = await response.json();
        console.log("Notes response:", data);
        
        if (data.success) {
          setNotes(data.data || []);
        }
      } else {
        console.warn("Notes API not available or table doesn't exist");
      }
    } catch (err) {
      console.warn("Error fetching notes (table might not exist):", err);
      // Don't set this as an error since notes are optional
    }
  };

  // Update job sheet
  const updateJobSheet = async (id: number, updates: Partial<JobSheet>) => {
    try {
      console.log(`Updating job sheet ${id}:`, updates);
      
      const response = await fetch(`/api/job-sheets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setJobSheets((prev) =>
            prev.map((sheet) => (sheet.id === id ? { ...sheet, ...updates } : sheet))
          );
          return { success: true };
        }
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update job sheet");
    } catch (err: any) {
      console.error("Error updating job sheet:", err);
      return { success: false, error: err.message };
    }
  };

  // Delete job sheet
  const deleteJobSheet = async (id: number) => {
    try {
      console.log(`Deleting job sheet ${id}`);
      
      const response = await fetch(`/api/job-sheets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        setJobSheets((prev) => prev.filter((sheet) => sheet.id !== id));
        setNotes((prev) => prev.filter((note) => note.job_sheet_id !== id));
        return { success: true };
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete job sheet");
    } catch (err: any) {
      console.error("Error deleting job sheet:", err);
      return { success: false, error: err.message };
    }
  };

  // Add note
  const addNote = async (jobSheetId: number, noteText: string) => {
    try {
      console.log(`Adding note to job sheet ${jobSheetId}:`, noteText);
      
      const response = await fetch("/api/job-sheet-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_sheet_id: jobSheetId,
          note: noteText,
          author: "Admin",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setNotes((prev) => [...prev, data.data]);
          return { success: true };
        }
      }
      
      const errorData = await response.json();
      
      // If table doesn't exist, show a helpful message
      if (errorData.code === "TABLE_NOT_FOUND") {
        return { 
          success: false, 
          error: "Notes feature not available. Please create the job_sheet_notes table." 
        };
      }
      
      throw new Error(errorData.error || "Failed to add note");
    } catch (err: any) {
      console.error("Error adding note:", err);
      return { success: false, error: err.message };
    }
  };

  // Generate report
  const generateReport = async (jobSheetId: number) => {
    try {
      console.log(`Generating report for job sheet ${jobSheetId}`);
      
      const response = await fetch(`/api/job-sheets/${jobSheetId}/report`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // For now, just log the report data
          // Later you can implement PDF download
          console.log("Report generated:", data);
          
          // You could open a new window with report data
          // or trigger a download
          alert(`Report ${data.reportNumber} generated successfully!`);
          
          return { success: true };
        }
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate report");
    } catch (err: any) {
      console.error("Error generating report:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchJobSheets();
    fetchNotes();
  }, []);

  return {
    jobSheets,
    notes,
    loading,
    error,
    updateJobSheet,
    deleteJobSheet,
    addNote,
    generateReport,
    refetch: fetchJobSheets,
  };
}