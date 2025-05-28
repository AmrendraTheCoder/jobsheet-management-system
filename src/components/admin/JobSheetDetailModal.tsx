"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Calendar,
  Layers,
  DollarSign,
  Download,
  Edit,
  Save,
  X,
  MessageSquare,
  Settings,
  BarChart3,
  FileImage,
  Calculator,
  User,
} from "lucide-react";
import { JobSheet, JobSheetNote } from "@/types/jobsheet";

interface JobSheetDetailModalProps {
  jobSheet: JobSheet;
  notes: JobSheetNote[];
  onClose: () => void;
  updateJobSheet: (
    id: number,
    updates: Partial<JobSheet>
  ) => Promise<{ success: boolean; error?: string }>;
  addNote: (
    jobSheetId: number,
    note: string
  ) => Promise<{ success: boolean; error?: string }>;
  generateReport: (
    jobSheetId: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function JobSheetDetailModal({
  jobSheet,
  notes,
  onClose,
  updateJobSheet,
  addNote,
  generateReport,
}: JobSheetDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSheet, setEditedSheet] = useState<Partial<JobSheet>>(jobSheet);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const jobSheetNotes = notes.filter(
    (note) => note.job_sheet_id === jobSheet.id
  );

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalCost = () => {
    return (
      (editedSheet.printing || 0) +
      (editedSheet.uv || 0) +
      (editedSheet.baking || 0)
    );
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Convert string values to appropriate types
    const updates: any = { ...editedSheet };

    // Convert numeric fields
    const numericFields = ["sheet", "plate", "paper_sheet", "imp"];
    const floatFields = ["sq_inch", "rate", "printing", "uv", "baking"];

    numericFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = updates[field]
          ? parseInt(updates[field].toString())
          : null;
      }
    });

    floatFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = updates[field]
          ? parseFloat(updates[field].toString())
          : null;
      }
    });

    const result = await updateJobSheet(jobSheet.id, updates);

    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
      // Update the jobSheet object with new values
      Object.assign(jobSheet, updates);
    } else {
      alert(`Failed to update job sheet: ${result.error}`);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsLoading(true);
    const result = await addNote(jobSheet.id, newNote.trim());
    setIsLoading(false);

    if (result.success) {
      setNewNote("");
    } else {
      alert(`Failed to add note: ${result.error}`);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    const result = await generateReport(jobSheet.id);
    setIsLoading(false);

    if (!result.success) {
      alert(`Failed to generate report: ${result.error}`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <span>Job Sheet #{jobSheet.id}</span>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Created on {formatDate(jobSheet.job_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedSheet(jobSheet);
                    }}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Production
            </TabsTrigger>
            <TabsTrigger value="costing" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Costing
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes ({jobSheetNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job_date" className="text-sm font-medium">
                    Job Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="job_date"
                      type="date"
                      value={editedSheet.job_date || ""}
                      onChange={(e) =>
                        setEditedSheet({
                          ...editedSheet,
                          job_date: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(jobSheet.job_date)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="party_name" className="text-sm font-medium">
                    Party Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="party_name"
                      value={editedSheet.party_name || ""}
                      onChange={(e) =>
                        setEditedSheet({
                          ...editedSheet,
                          party_name: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="Enter party/client name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{jobSheet.party_name || "No party name"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedSheet.description || ""}
                      onChange={(e) =>
                        setEditedSheet({
                          ...editedSheet,
                          description: e.target.value,
                        })
                      }
                      className="mt-1"
                      rows={4}
                      placeholder="Describe the job details..."
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded min-h-[100px]">
                      <p className="text-sm">
                        {jobSheet.description || "No description provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="size" className="text-sm font-medium">
                    Size
                  </Label>
                  {isEditing ? (
                    <Input
                      id="size"
                      value={editedSheet.size || ""}
                      onChange={(e) =>
                        setEditedSheet({ ...editedSheet, size: e.target.value })
                      }
                      className="mt-1"
                      placeholder="e.g., A4, 8.5x11"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span>{jobSheet.size || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Job Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Party:</span>
                      <span className="font-semibold text-blue-900">
                        {jobSheet.party_name || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Cost:</span>
                      <span className="font-semibold text-blue-900">
                        {formatCurrency(getTotalCost())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Sheets:</span>
                      <span className="text-blue-900">
                        {jobSheet.sheet || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Impressions:</span>
                      <span className="text-blue-900">
                        {jobSheet.imp?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="sheet" className="text-sm font-medium">
                  Sheets *
                </Label>
                {isEditing ? (
                  <Input
                    id="sheet"
                    type="number"
                    min="1"
                    value={editedSheet.sheet || ""}
                    onChange={(e) =>
                      setEditedSheet({
                        ...editedSheet,
                        sheet: parseInt(e.target.value) || null,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {jobSheet.sheet?.toLocaleString() || 0}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="plate" className="text-sm font-medium">
                  Plates *
                </Label>
                {isEditing ? (
                  <Input
                    id="plate"
                    type="number"
                    min="1"
                    value={editedSheet.plate || ""}
                    onChange={(e) =>
                      setEditedSheet({
                        ...editedSheet,
                        plate: parseInt(e.target.value) || null,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {jobSheet.plate?.toLocaleString() || 0}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="sq_inch" className="text-sm font-medium">
                  Square Inches *
                </Label>
                {isEditing ? (
                  <Input
                    id="sq_inch"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedSheet.sq_inch || ""}
                    onChange={(e) =>
                      setEditedSheet({
                        ...editedSheet,
                        sq_inch: parseFloat(e.target.value) || null,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {jobSheet.sq_inch?.toFixed(2) || "0.00"} sq in
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="paper_sheet" className="text-sm font-medium">
                  Paper Sheets *
                </Label>
                {isEditing ? (
                  <Input
                    id="paper_sheet"
                    type="number"
                    min="1"
                    value={editedSheet.paper_sheet || ""}
                    onChange={(e) =>
                      setEditedSheet({
                        ...editedSheet,
                        paper_sheet: parseInt(e.target.value) || null,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {jobSheet.paper_sheet?.toLocaleString() || 0}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="imp" className="text-sm font-medium">
                  Impressions *
                </Label>
                {isEditing ? (
                  <Input
                    id="imp"
                    type="number"
                    min="1"
                    value={editedSheet.imp || ""}
                    onChange={(e) =>
                      setEditedSheet({
                        ...editedSheet,
                        imp: parseInt(e.target.value) || null,
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {jobSheet.imp?.toLocaleString() || 0}
                  </div>
                )}
              </div>
            </div>

            {/* Production Metrics */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Efficiency</h4>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {jobSheet.sheet && jobSheet.imp
                    ? (jobSheet.imp / jobSheet.sheet).toFixed(1)
                    : "0"}
                </div>
                <p className="text-sm text-purple-700">Impressions per sheet</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Coverage</h4>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {jobSheet.paper_sheet && jobSheet.sheet
                    ? ((jobSheet.sheet / jobSheet.paper_sheet) * 100).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-sm text-green-700">Sheet utilization</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Area Total</h4>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {jobSheet.sq_inch && jobSheet.sheet
                    ? (jobSheet.sq_inch * jobSheet.sheet).toFixed(0)
                    : "0"}
                </div>
                <p className="text-sm text-orange-700">Total square inches</p>
              </div>
            </div>
          </TabsContent>

          {/* Costing Tab */}
          <TabsContent value="costing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rate" className="text-sm font-medium">
                    Rate per Unit *
                  </Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedSheet.rate || ""}
                        onChange={(e) =>
                          setEditedSheet({
                            ...editedSheet,
                            rate: parseFloat(e.target.value) || null,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {formatCurrency(jobSheet.rate || 0)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="printing" className="text-sm font-medium">
                    Printing Cost *
                  </Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="printing"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedSheet.printing || ""}
                        onChange={(e) =>
                          setEditedSheet({
                            ...editedSheet,
                            printing: parseFloat(e.target.value) || null,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {formatCurrency(jobSheet.printing || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="uv" className="text-sm font-medium">
                    UV Coating Cost
                  </Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="uv"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedSheet.uv || ""}
                        onChange={(e) =>
                          setEditedSheet({
                            ...editedSheet,
                            uv: parseFloat(e.target.value) || null,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {formatCurrency(jobSheet.uv || 0)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="baking" className="text-sm font-medium">
                    Baking Cost
                  </Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="baking"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedSheet.baking || ""}
                        onChange={(e) =>
                          setEditedSheet({
                            ...editedSheet,
                            baking: parseFloat(e.target.value) || null,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {formatCurrency(jobSheet.baking || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <Separator />
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                Cost Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Printing Cost:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        editedSheet.printing || jobSheet.printing || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">UV Coating:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(editedSheet.uv || jobSheet.uv || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Baking:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        editedSheet.baking || jobSheet.baking || 0
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(getTotalCost())}
                    </p>
                    {jobSheet.imp && getTotalCost() > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatCurrency(getTotalCost() / jobSheet.imp)} per
                        impression
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {/* Add New Note */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <Label
                htmlFor="new-note"
                className="text-sm font-medium mb-2 block"
              >
                Add New Note
              </Label>
              <div className="flex gap-3">
                <Textarea
                  id="new-note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this job sheet..."
                  className="flex-1"
                  rows={3}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isLoading}
                  className="self-end"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {jobSheetNotes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No notes yet</p>
                  <p className="text-sm">
                    Add the first note to track progress and updates
                  </p>
                </div>
              ) : (
                jobSheetNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-white border rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {note.created_at || "Admin"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}