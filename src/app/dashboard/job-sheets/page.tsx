"use client";
import React, { useEffect, useState } from "react";
import JobSheetsTable from "@/components/job-sheets/JobSheetsTable";
import JobSheetFormModal from "@/components/job-sheets/JobSheetFormModal";
import JobSheetDetailModal from "@/components/job-sheets/JobSheetDetailModal";
import { Button } from "@/components/ui/button";

export default function JobSheetsAdminPage() {
  const [jobSheets, setJobSheets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingSheet, setEditingSheet] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [viewSheet, setViewSheet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchJobSheets = async () => {
    setLoading(true);
    const res = await fetch("/api/job-sheet");
    const data = await res.json();
    setJobSheets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobSheets();
  }, []);

  const handleAdd = () => {
    setEditingSheet(null);
    setShowFormModal(true);
  };

  const handleEdit = (sheet: any) => {
    setEditingSheet(sheet);
    setShowFormModal(true);
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Delete this job sheet?")) return;
    setLoading(true);
    await fetch("/api/job-sheet", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchJobSheets();
    setLoading(false);
  };

  const handleView = (sheet: any) => {
    setViewSheet(sheet);
    setShowDetailModal(true);
  };

  const handleFormSubmit = async () => {
    setShowFormModal(false);
    setEditingSheet(null);
    fetchJobSheets();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Job Sheets Admin</h1>
        <Button onClick={handleAdd} className="bg-blue-600 text-white">
          Add Job Sheet
        </Button>
      </div>
      <JobSheetsTable
        jobSheets={jobSheets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {showFormModal && (
        <JobSheetFormModal
          open={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
          editingSheet={editingSheet}
        />
      )}
      {showDetailModal && viewSheet && (
        <JobSheetDetailModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          sheet={viewSheet}
        />
      )}
      {loading && <div className="mt-4 text-blue-600">Loading...</div>}
    </div>
  );
}
