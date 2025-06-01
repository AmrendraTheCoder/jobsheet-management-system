"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { submitJobSheetAction } from "@/app/actions";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Package,
  ArrowRight,
  ArrowLeft,
  Send,
  UserPlus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobSheetData {
  job_date: string;
  party_name: string;
  party_id?: number | null;
  description: string;
  plate: string;
  size: string;
  sq_inch: string;
  paper_sheet: string;
  imp: string;
  rate: string;
  printing: string;
  uv: string;
  baking: string;
  paper_type_id?: number | null;
  job_type?: string | null;
  gsm?: number | null;
  paper_provided_by_party?: boolean;
  paper_type?: string | null;
  paper_size?: string | null;
  paper_gsm?: number | null;
}

interface Party {
  id: number;
  name: string;
  balance: number;
}

interface PaperType {
  id: number;
  name: string;
  gsm: number;
}

const initialFormData: JobSheetData = {
  job_date: new Date().toISOString().split("T")[0],
  party_name: "",
  description: "",
  plate: "",
  size: "",
  sq_inch: "",
  paper_sheet: "",
  imp: "",
  rate: "",
  printing: "",
  uv: "",
  baking: "",
  job_type: "single-single",
};

const paperSizes = [
  "14*22",
  "15*25",
  "18*23",
  "18*25",
  "19*25",
  "20*30",
  "20*29",
  "18*28",
  "19*26",
  "22*28",
  "25*35",
];

const paperGSMs = [
  70, 80, 90, 100, 110, 115, 120, 125, 130, 150, 170, 200, 210, 220, 230, 250,
  260, 270, 280, 300, 330,
];

const steps = [
  {
    id: 1,
    title: "Basic Info",
    icon: User,
    description: "Job date, party, and description",
  },
  {
    id: 2,
    title: "Job Details",
    icon: FileText,
    description: "Plate, size, and printing specs",
  },
  {
    id: 3,
    title: "Paper & Costs",
    icon: Package,
    description: "Paper type and cost calculation",
  },
  {
    id: 4,
    title: "Review",
    icon: CheckCircle,
    description: "Final review and submission",
  },
];

export default function JobSheetForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobSheetData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Enhanced states for full functionality
  const [parties, setParties] = useState<Party[]>([]);
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [paperProvidedByParty, setPaperProvidedByParty] =
    useState<boolean>(false);
  const [paperType, setPaperType] = useState<string>("");
  const [paperSize, setPaperSize] = useState<string>("");
  const [paperGSM, setPaperGSM] = useState<string>("");

  // Dialog states
  const [showNewPartyDialog, setShowNewPartyDialog] = useState(false);
  const [showNewPaperTypeDialog, setShowNewPaperTypeDialog] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyBalance, setNewPartyBalance] = useState("");
  const [newPaperType, setNewPaperType] = useState({ name: "", gsm: "" });

  useEffect(() => {
    fetchParties();
    fetchPaperTypes();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties");
      if (response.ok) {
        const result = await response.json();
        const partiesData = Array.isArray(result)
          ? result
          : result.data || result;
        setParties(partiesData || []);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const fetchPaperTypes = async () => {
    try {
      const response = await fetch("/api/paper-types");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPaperTypes(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching paper types:", error);
      setPaperTypes([]);
    }
  };

  const updateFormData = (
    field: keyof JobSheetData,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewParty = async () => {
    if (!newPartyName.trim()) return;

    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartyName.trim(),
          balance: parseFloat(newPartyBalance) || 0,
        }),
      });

      if (response.ok) {
        const newParty = await response.json();
        await fetchParties();
        setSelectedParty(newParty.data || newParty);
        updateFormData("party_name", newPartyName.trim());
        updateFormData("party_id", newParty.data?.id || newParty.id);
        setShowNewPartyDialog(false);
        setNewPartyName("");
        setNewPartyBalance("");
      }
    } catch (error) {
      console.error("Error adding party:", error);
    }
  };

  const handleAddNewPaperType = async () => {
    if (!newPaperType.name.trim()) return;

    try {
      const response = await fetch("/api/paper-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPaperType.name.trim(),
        }),
      });

      if (response.ok) {
        await fetchPaperTypes();
        setShowNewPaperTypeDialog(false);
        setNewPaperType({ name: "", gsm: "" });
      }
    } catch (error) {
      console.error("Error adding paper type:", error);
    }
  };

  const calculatePrintingCost = () => {
    const rate = parseFloat(formData.rate) || 0;
    const imp = parseFloat(formData.imp) || 0;

    if (formData.job_type === "front-back") {
      return ((rate * imp) / 2).toFixed(2);
    }
    return (rate * imp).toFixed(2);
  };

  const handleSizeChange = (value: string) => {
    updateFormData("size", value);
    if (value && value.includes("*")) {
      const [length, width] = value.split("*").map(Number);
      if (length && width) {
        updateFormData("sq_inch", (length * width).toString());
      }
    }
  };

  const nextStep = () =>
    currentStep < steps.length && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Validate required fields
    if (!selectedParty?.id && !formData.party_name) {
      setSubmitStatus({
        type: "error",
        message: "Please select a party or enter a party name.",
      });
      setIsSubmitting(false);
      return;
    }

    const printingCost = calculatePrintingCost();

    const submissionData: JobSheetData = {
      ...formData,
      printing: printingCost,
      party_id: selectedParty?.id || null,
      paper_type_id: formData.paper_type_id
        ? parseInt(formData.paper_type_id.toString())
        : null,
      job_type: formData.job_type || "single-single",
      gsm: formData.gsm ? parseInt(formData.gsm.toString()) : null,
      paper_provided_by_party: paperProvidedByParty,
      paper_type: paperProvidedByParty ? paperType : null,
      paper_size: paperProvidedByParty ? paperSize : null,
      paper_gsm: paperProvidedByParty && paperGSM ? parseInt(paperGSM) : null,
    };

    try {
      const result = await submitJobSheetAction(submissionData);

      if (result?.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Job sheet created successfully! Party balance has been updated.",
        });

        // Reset form
        setFormData(initialFormData);
        setPaperProvidedByParty(false);
        setPaperType("");
        setPaperSize("");
        setPaperGSM("");
        setCurrentStep(1);
        setSelectedParty(null);

        // Refresh parties to get updated balances
        await fetchParties();
      } else {
        setSubmitStatus({
          type: "error",
          message:
            result?.error || "Failed to submit job sheet. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitStatus({
        type: "error",
        message: `System error: ${error.message || "Unknown error occurred"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.job_date && formData.party_name && formData.description;
      case 2:
        return (
          formData.plate &&
          formData.size &&
          formData.sq_inch &&
          formData.paper_sheet &&
          formData.imp &&
          formData.paper_type_id &&
          formData.gsm &&
          formData.job_type
        );
      case 3:
        return formData.rate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted
                      ? "bg-success border-success text-white"
                      : isActive
                        ? "bg-primary border-primary text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold ${isActive ? "text-primary" : "text-gray-500"}`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-6 ${isCompleted ? "bg-success" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="job_date" className="text-sm font-medium">
            Job Date
          </Label>
          <Input
            id="job_date"
            type="date"
            value={formData.job_date}
            onChange={(e) => updateFormData("job_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Party Name</Label>
          <div className="flex gap-2">
            <Select
              value={selectedParty?.id.toString() || ""}
              onValueChange={(value) => {
                if (value === "new") {
                  setShowNewPartyDialog(true);
                } else {
                  const party = parties.find((p) => p.id.toString() === value);
                  if (party) {
                    setSelectedParty(party);
                    updateFormData("party_name", party.name);
                    updateFormData("party_id", party.id);
                  }
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a party" />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party.id} value={party.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{party.name}</span>
                      <Badge
                        variant={party.balance >= 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        ₹{party.balance.toLocaleString()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add New Party</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedParty && (
            <div className="text-sm text-gray-600">
              Current Balance:{" "}
              <Badge
                variant={selectedParty.balance >= 0 ? "default" : "destructive"}
              >
                ₹{selectedParty.balance.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Job Description
        </Label>
        <Textarea
          id="description"
          placeholder="Enter detailed job description..."
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select
            value={formData.job_type || ""}
            onValueChange={(value) => updateFormData("job_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-single">Single-Single</SelectItem>
              <SelectItem value="front-back">Front-Back</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plate">Plates</Label>
          <Input
            id="plate"
            type="number"
            min="1"
            placeholder="2"
            value={formData.plate}
            onChange={(e) => updateFormData("plate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Size</Label>
          <Select value={formData.size || ""} onValueChange={handleSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select paper size" />
            </SelectTrigger>
            <SelectContent>
              {paperSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sq_inch">Square Inches</Label>
          <Input
            id="sq_inch"
            type="number"
            step="0.01"
            min="0"
            placeholder="Auto-calculated from size"
            value={formData.sq_inch}
            onChange={(e) => updateFormData("sq_inch", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paper_sheet">Paper Sheets</Label>
          <Input
            id="paper_sheet"
            type="number"
            min="1"
            placeholder="50"
            value={formData.paper_sheet}
            onChange={(e) => updateFormData("paper_sheet", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imp">Impressions</Label>
          <Input
            id="imp"
            type="number"
            min="1"
            placeholder="2000"
            value={formData.imp}
            onChange={(e) => updateFormData("imp", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Paper Type</Label>
          <Select
            value={formData.paper_type_id?.toString() || ""}
            onValueChange={(value) => {
              if (value === "new") {
                setShowNewPaperTypeDialog(true);
              } else {
                updateFormData("paper_type_id", parseInt(value));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select paper type" />
            </SelectTrigger>
            <SelectContent>
              {paperTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <div className="flex items-center gap-2 text-blue-600">
                  <Plus className="w-4 h-4" />
                  Add New Paper Type
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>GSM</Label>
          <Select
            value={formData.gsm?.toString() || ""}
            onValueChange={(value) => updateFormData("gsm", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select GSM" />
            </SelectTrigger>
            <SelectContent>
              {paperGSMs.map((gsm) => (
                <SelectItem key={gsm} value={gsm.toString()}>
                  {gsm} GSM
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Paper provided by party section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Paper Configuration (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paper_provided_by_party"
              checked={paperProvidedByParty}
              onChange={(e) => setPaperProvidedByParty(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="paper_provided_by_party">
              Paper provided by party
            </Label>
          </div>

          {paperProvidedByParty && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Paper Type</Label>
                <Select value={paperType} onValueChange={setPaperType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "FRC",
                      "DUOLEX",
                      "SBS",
                      "ART PAPER",
                      "MAIFLITO",
                      "GUMMING",
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paper Size</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paper GSM</Label>
                <Select value={paperGSM} onValueChange={setPaperGSM}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperGSMs.map((gsm) => (
                      <SelectItem key={gsm} value={gsm.toString()}>
                        {gsm} GSM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rate">Rate per Unit</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            min="0"
            placeholder="10.00"
            value={formData.rate}
            onChange={(e) => updateFormData("rate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="printing_calculated">
            Printing Cost (Calculated)
          </Label>
          <Input
            id="printing_calculated"
            type="text"
            value={`₹${calculatePrintingCost()}`}
            className="bg-gray-50"
            readOnly
          />
          <p className="text-xs text-gray-500">
            {formData.job_type === "front-back"
              ? "Rate × Impressions ÷ 2"
              : "Rate × Impressions"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="uv">UV Coating Cost</Label>
          <Input
            id="uv"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.uv}
            onChange={(e) => updateFormData("uv", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baking">Baking Cost</Label>
          <Input
            id="baking"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.baking}
            onChange={(e) => updateFormData("baking", e.target.value)}
          />
        </div>
      </div>

      {/* Cost Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Printing Cost:</span>
            <span className="font-medium text-blue-900">
              ₹{calculatePrintingCost()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">UV:</span>
            <span className="font-medium text-blue-900">
              ₹{formData.uv || "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Baking:</span>
            <span className="font-medium text-blue-900">
              ₹{formData.baking || "0.00"}
            </span>
          </div>
          <div className="border-t border-blue-300 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-blue-800">Total Cost:</span>
              <span className="text-blue-900">
                ₹
                {(
                  parseFloat(calculatePrintingCost()) +
                  parseFloat(formData.uv || "0") +
                  parseFloat(formData.baking || "0")
                ).toFixed(2)}
              </span>
            </div>
          </div>
          {selectedParty && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Current Balance:</span>
                <span className="font-medium text-blue-900">
                  ₹{selectedParty.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-700">After This Job:</span>
                <span
                  className={`font-medium ${
                    selectedParty.balance -
                      (parseFloat(calculatePrintingCost()) +
                        parseFloat(formData.uv || "0") +
                        parseFloat(formData.baking || "0")) <
                    0
                      ? "text-red-600"
                      : "text-blue-900"
                  }`}
                >
                  ₹
                  {(
                    selectedParty.balance -
                    (parseFloat(calculatePrintingCost()) +
                      parseFloat(formData.uv || "0") +
                      parseFloat(formData.baking || "0"))
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => {
    const totalCost = (
      parseFloat(calculatePrintingCost()) +
      parseFloat(formData.uv || "0") +
      parseFloat(formData.baking || "0")
    ).toFixed(2);

    return (
      <div className="space-y-6">
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Job Sheet Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {formData.job_date}
                  </div>
                  <div>
                    <span className="font-medium">Party:</span>{" "}
                    {formData.party_name}
                  </div>
                  <div>
                    <span className="font-medium">Job Type:</span>{" "}
                    {formData.job_type === "front-back"
                      ? "Front-Back"
                      : "Single-Single"}
                  </div>
                </div>
                {formData.description && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">
                      Description:
                    </h5>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">
                  Production Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Plates:</span>{" "}
                    {formData.plate || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>{" "}
                    {formData.size || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Square Inches:</span>{" "}
                    {formData.sq_inch || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Paper Sheets:</span>{" "}
                    {formData.paper_sheet || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Impressions:</span>{" "}
                    {formData.imp || "0"}
                  </div>
                  <div>
                    <span className="font-medium">GSM:</span>{" "}
                    {formData.gsm || "0"}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-700">
                Cost Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Rate:</span> ₹
                  {formData.rate || "0.00"}
                </div>
                <div>
                  <span className="font-medium">Printing:</span> ₹
                  {calculatePrintingCost()}
                </div>
                <div>
                  <span className="font-medium">UV:</span> ₹
                  {formData.uv || "0.00"}
                </div>
                <div>
                  <span className="font-medium">Baking:</span> ₹
                  {formData.baking || "0.00"}
                </div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xl font-bold text-primary">
                  Total Cost: ₹{totalCost}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const isStepValid = validateStep(currentStep);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col mt-6 gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Create Job Sheet
        </h1>
        <p className="text-muted-foreground">
          Create a new job sheet for printing orders with step-by-step guidance.
        </p>
      </div>

      {/* Status Message */}
      {submitStatus.type && (
        <Card
          className={`border ${submitStatus.type === "success" ? "border-success bg-success/10" : "border-destructive bg-destructive/10"}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              <span
                className={
                  submitStatus.type === "success"
                    ? "text-success"
                    : "text-destructive"
                }
              >
                {submitStatus.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Main Form */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />

          <div className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {React.createElement(steps[currentStep - 1].icon, {
                  className: "w-5 h-5 text-white",
                })}
              </div>
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-white/90 text-sm mt-2 font-medium">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8">{renderCurrentStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isStepValid}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Job Sheet
              </>
            )}
          </Button>
        )}
      </div>

      {/* Add New Party Dialog */}
      <Dialog open={showNewPartyDialog} onOpenChange={setShowNewPartyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Party</DialogTitle>
            <DialogDescription>
              Create a new party for the job sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_party_name">Party Name</Label>
              <Input
                id="new_party_name"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Enter party name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_party_balance">
                Initial Balance (Optional)
              </Label>
              <Input
                id="new_party_balance"
                type="number"
                value={newPartyBalance}
                onChange={(e) => setNewPartyBalance(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPartyDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewParty}>Add Party</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Paper Type Dialog */}
      <Dialog
        open={showNewPaperTypeDialog}
        onOpenChange={setShowNewPaperTypeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Paper Type</DialogTitle>
            <DialogDescription>
              Create a new paper type for the job sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_paper_type_name">Paper Type Name</Label>
              <Input
                id="new_paper_type_name"
                value={newPaperType.name}
                onChange={(e) =>
                  setNewPaperType({ ...newPaperType, name: e.target.value })
                }
                placeholder="e.g., Matte, Glossy, Art Paper"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPaperTypeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewPaperType}>Add Paper Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
