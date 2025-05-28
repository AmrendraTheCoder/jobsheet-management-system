"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const initialForm = {
  job_date: "",
  description: "",
  sheet: "",
  plate: "",
  size: "",
  sq_inch: "",
  paper_sheet: "",
  imp: "",
  rate: "",
  printing: "",
  uv: "",
  baking: "",
  file: null,
};

interface JobSheetFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingSheet: any;
}

export default function JobSheetFormModal({
  open,
  onClose,
  onSubmit,
  editingSheet,
}: JobSheetFormModalProps) {
  const [form, setForm] = useState<any>(initialForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (editingSheet) {
      setForm({
        ...editingSheet,
        job_date: editingSheet.job_date
          ? editingSheet.job_date.slice(0, 10)
          : "",
        file: null,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingSheet, open]);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let res;
    if (form.file) {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "file" && value instanceof File) {
            formData.append("file", value);
          } else if (key !== "file" && typeof value === "string") {
            formData.append(key, value);
          }
        }
      });
      if (editingSheet && editingSheet.id)
        formData.append("id", editingSheet.id.toString());
      res = await fetch("/api/job-sheet", {
        method: editingSheet ? "PUT" : "POST",
        body: formData,
      });
    } else {
      const body = editingSheet ? { ...form, id: editingSheet.id } : form;
      res = await fetch("/api/job-sheet", {
        method: editingSheet ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Error");
    } else {
      onSubmit();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingSheet ? "Edit Job Sheet" : "Add Job Sheet"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="grid grid-cols-2 gap-4 py-2"
        >
          <input
            name="job_date"
            type="date"
            value={form.job_date}
            onChange={handleChange}
            className="border p-2"
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border p-2"
            required
          />
          <input
            name="sheet"
            type="number"
            placeholder="Sheet"
            value={form.sheet}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="plate"
            type="number"
            placeholder="Plate"
            value={form.plate}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="size"
            placeholder="Size"
            value={form.size}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="sq_inch"
            type="number"
            step="0.01"
            placeholder="Sq inch"
            value={form.sq_inch}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="paper_sheet"
            type="number"
            placeholder="Paper Sheet"
            value={form.paper_sheet}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="imp"
            type="number"
            placeholder="Imp."
            value={form.imp}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="rate"
            type="number"
            step="0.01"
            placeholder="Rate"
            value={form.rate}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="printing"
            type="number"
            step="0.01"
            placeholder="Printing"
            value={form.printing}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="uv"
            type="number"
            step="0.01"
            placeholder="UV"
            value={form.uv}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="baking"
            type="number"
            step="0.01"
            placeholder="Baking"
            value={form.baking}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="file"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleChange}
            className="border p-2 col-span-2"
          />
          {error && <div className="col-span-2 text-red-600">{error}</div>}
          <DialogFooter className="col-span-2 flex gap-2 mt-2">
            <Button
              type="submit"
              className="bg-blue-600 text-white"
              disabled={loading}
            >
              {editingSheet ? "Update" : "Add"} Job Sheet
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
