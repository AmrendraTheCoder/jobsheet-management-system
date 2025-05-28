"use client";

import { useState } from "react";
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
import { submitJobSheetAction } from "@/app/actions";
import {
  Calendar,
  FileText,
  Settings,
  DollarSign,
  Send,
  Building2,
  CheckCircle,
  AlertCircle,
  Bug,
  Database,
  Wifi,
  User,
  Layers,
  Banknote,
} from "lucide-react";

interface JobSheetData {
  job_date: string;
  party_name: string;
  description: string;
  sheet: string;
  plate: string;
  size: string;
  sq_inch: string;
  paper_sheet: string;
  imp: string;
  rate: string;
  printing: string;
  uv: string;
  baking: string;
}

const initialFormData: JobSheetData = {
  job_date: new Date().toISOString().split("T")[0],
  party_name: "",
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
};

export default function JobSheetForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobSheetData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLog((prev) => [...prev, logMessage]);
    console.log(logMessage);
  };

  const updateFormData = (field: keyof JobSheetData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    addDebugLog(`Updated ${field}: ${value}`);
  };

  const handleSizeChange = (value: string) => {
    updateFormData("size", value);
    if (value.includes("x")) {
      const dimensions = value.split("x");
      if (dimensions.length === 2) {
        const width = parseFloat(dimensions[0]);
        const height = parseFloat(dimensions[1]);
        if (!isNaN(width) && !isNaN(height)) {
          const sqInch = (width * height).toFixed(2);
          updateFormData("sq_inch", sqInch);
        }
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      addDebugLog(`Moved to step ${currentStep + 1}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      addDebugLog(`Moved to step ${currentStep - 1}`);
    }
  };

  const testDatabaseConnection = async () => {
    addDebugLog("Testing database connection...");
    try {
      const response = await fetch("/api/test-db", {
        method: "GET",
      });
      const result = await response.json();
      addDebugLog(`Database test result: ${JSON.stringify(result)}`);
    } catch (error) {
      addDebugLog(`Database connection error: ${error}`);
    }
  };

  const testMinimalSubmission = async () => {
    addDebugLog("Testing minimal submission...");
    setIsSubmitting(true);

    const minimalData = {
      job_date: new Date().toISOString().split("T")[0],
      party_name: "Test Party",
      description: "Test Job Sheet",
      sheet: "100",
      plate: "2",
      size: "A4",
      sq_inch: "93.50",
      paper_sheet: "50",
      imp: "2000",
      rate: "10.00",
      printing: "500.00",
      uv: "0.00",
      baking: "0.00",
    };

    try {
      const result = await submitJobSheetAction(minimalData);
      if (result?.success) {
        setSubmitStatus({
          type: "success",
          message: "Test submission successful!",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result?.error || "Test submission failed",
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: `Error: ${error.message || error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    addDebugLog("=== STARTING JOB SHEET SUBMISSION ===");
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const requiredFields = [
      "job_date",
      "party_name",
      "description",
      "sheet",
      "plate",
      "size",
      "sq_inch",
      "paper_sheet",
      "imp",
      "rate",
      "printing",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof JobSheetData]
    );

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      addDebugLog(`Validation failed: ${errorMsg}`);
      setSubmitStatus({ type: "error", message: errorMsg });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitJobSheetAction(formData);

      if (result?.success) {
        setSubmitStatus({
          type: "success",
          message: "Job sheet submitted successfully!",
        });
        setFormData(initialFormData);
        setCurrentStep(1);
      } else {
        setSubmitStatus({
          type: "error",
          message:
            result?.error || "Failed to submit job sheet. Please try again.",
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: `Network/System error: ${error.message || "Unknown error"}`,
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
          formData.sheet &&
          formData.plate &&
          formData.size &&
          formData.sq_inch &&
          formData.paper_sheet &&
          formData.imp
        );
      case 3:
        return formData.rate && formData.printing;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const isStepValid = validateStep(currentStep);
  const clearDebugLog = () => {
    setDebugLog([]);
    addDebugLog("Debug log cleared");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-gray-800" />
            <h1 className="text-3xl font-bold text-gray-900">
              GanpathiOverseas
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Production Job Sheet
          </h2>
          <p className="text-gray-600">Create and manage printing job sheets</p>
        </div>

        {/* Debug Controls */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Bug className="w-5 h-5" />
              Debug Controls & Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={testDatabaseConnection}
                variant="outline"
                size="sm"
                className="border-yellow-300"
              >
                <Database className="w-4 h-4 mr-2" />
                Test DB Connection
              </Button>
              <Button
                onClick={testMinimalSubmission}
                variant="outline"
                size="sm"
                className="border-yellow-300"
                disabled={isSubmitting}
              >
                <Wifi className="w-4 h-4 mr-2" />
                Test Minimal Submit
              </Button>
              <Button
                onClick={() => setShowDebug(!showDebug)}
                variant="outline"
                size="sm"
                className="border-yellow-300"
              >
                {showDebug ? "Hide" : "Show"} Debug Log
              </Button>
              <Button
                onClick={clearDebugLog}
                variant="outline"
                size="sm"
                className="border-yellow-300"
              >
                Clear Log
              </Button>
            </div>

            {showDebug && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
                {debugLog.length === 0 ? (
                  <div>No debug messages yet...</div>
                ) : (
                  debugLog.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Message */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              submitStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{submitStatus.message}</span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white rounded-lg px-6 py-3 shadow-sm border">
            {[
              { step: 1, label: "Job Details", icon: Calendar },
              { step: 2, label: "Production", icon: Settings },
              { step: 3, label: "Costing", icon: DollarSign },
              { step: 4, label: "Review", icon: Send },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                    currentStep >= step
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-8 h-0.5 ml-4 ${
                      currentStep > step ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              {currentStep === 1 && (
                <>
                  <Calendar className="w-5 h-5" /> Job Details
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Settings className="w-5 h-5" /> Production Specifications
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Banknote className="w-5 h-5" /> Cost Breakdown
                </>
              )}
              {currentStep === 4 && (
                <>
                  <Send className="w-5 h-5" /> Review & Submit
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Step 1: Job Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="job_date"
                      className="text-gray-700 font-medium"
                    >
                      Job Date *
                    </Label>
                    <Input
                      id="job_date"
                      type="date"
                      value={formData.job_date}
                      onChange={(e) =>
                        updateFormData("job_date", e.target.value)
                      }
                      className="border-gray-300 focus:border-gray-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="party_name"
                      className="text-gray-700 font-medium"
                    >
                      Party Name *
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="party_name"
                        value={formData.party_name}
                        onChange={(e) =>
                          updateFormData("party_name", e.target.value)
                        }
                        className="border-gray-300 focus:border-gray-500 pl-10"
                        placeholder="Enter party/client name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-gray-700 font-medium"
                  >
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    className="border-gray-300 focus:border-gray-500 mt-1"
                    placeholder="Describe the printing job details, materials, specifications, etc."
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-semibold">Job Information</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Please provide the job date, party name, and detailed
                    description of the printing requirements.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Production Specifications */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="sheet"
                      className="text-gray-700 font-medium"
                    >
                      Sheets *
                    </Label>
                    <Input
                      id="sheet"
                      type="number"
                      min="1"
                      value={formData.sheet}
                      onChange={(e) => updateFormData("sheet", e.target.value)}
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="plate"
                      className="text-gray-700 font-medium"
                    >
                      Plates *
                    </Label>
                    <Input
                      id="plate"
                      type="number"
                      min="1"
                      value={formData.plate}
                      onChange={(e) => updateFormData("plate", e.target.value)}
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="size" className="text-gray-700 font-medium">
                      Size *
                    </Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleSizeChange(e.target.value)}
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="A4, 8.5x11, 12x18"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="sq_inch"
                      className="text-gray-700 font-medium"
                    >
                      Square Inches *
                    </Label>
                    <Input
                      id="sq_inch"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sq_inch}
                      onChange={(e) =>
                        updateFormData("sq_inch", e.target.value)
                      }
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="93.50"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="paper_sheet"
                      className="text-gray-700 font-medium"
                    >
                      Paper Sheets *
                    </Label>
                    <Input
                      id="paper_sheet"
                      type="number"
                      min="1"
                      value={formData.paper_sheet}
                      onChange={(e) =>
                        updateFormData("paper_sheet", e.target.value)
                      }
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp" className="text-gray-700 font-medium">
                      Impressions *
                    </Label>
                    <Input
                      id="imp"
                      type="number"
                      min="1"
                      value={formData.imp}
                      onChange={(e) => updateFormData("imp", e.target.value)}
                      className="border-gray-300 focus:border-gray-500 mt-1"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Production Notes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Sheets:</strong> Total number of paper sheets used
                    </div>
                    <div>
                      <strong>Plates:</strong> Number of printing plates
                      required
                    </div>
                    <div>
                      <strong>Square Inches:</strong> Print area calculation
                    </div>
                    <div>
                      <strong>Impressions:</strong> Total print impressions made
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Cost Breakdown */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rate" className="text-gray-700 font-medium">
                      Rate per Unit *
                    </Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.rate}
                        onChange={(e) => updateFormData("rate", e.target.value)}
                        className="border-gray-300 focus:border-gray-500 pl-10"
                        placeholder="10.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="printing"
                      className="text-gray-700 font-medium"
                    >
                      Printing Cost *
                    </Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="printing"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.printing}
                        onChange={(e) =>
                          updateFormData("printing", e.target.value)
                        }
                        className="border-gray-300 focus:border-gray-500 pl-10"
                        placeholder="500.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="uv" className="text-gray-700 font-medium">
                      UV Coating Cost
                    </Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="uv"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.uv}
                        onChange={(e) => updateFormData("uv", e.target.value)}
                        className="border-gray-300 focus:border-gray-500 pl-10"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="baking"
                      className="text-gray-700 font-medium"
                    >
                      Baking Cost
                    </Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="baking"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.baking}
                        onChange={(e) =>
                          updateFormData("baking", e.target.value)
                        }
                        className="border-gray-300 focus:border-gray-500 pl-10"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Cost Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Printing Cost:</span>
                      <span className="font-medium text-blue-900">
                        ₹{formData.printing || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">UV Coating:</span>
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
                            parseFloat(formData.printing || "0") +
                            parseFloat(formData.uv || "0") +
                            parseFloat(formData.baking || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="font-semibold mb-6 text-gray-900 text-xl">
                    Job Sheet Summary
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Job Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">
                        Job Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Date:
                          </span>
                          <span className="text-gray-900">
                            {formData.job_date || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Party Name:
                          </span>
                          <span className="text-gray-900">
                            {formData.party_name || "Not specified"}
                          </span>
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

                    {/* Production Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">
                        Production Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Sheets:
                          </span>
                          <span className="text-gray-900">
                            {formData.sheet || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Plates:
                          </span>
                          <span className="text-gray-900">
                            {formData.plate || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Size:
                          </span>
                          <span className="text-gray-900">
                            {formData.size || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Square Inches:
                          </span>
                          <span className="text-gray-900">
                            {formData.sq_inch || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Paper Sheets:
                          </span>
                          <span className="text-gray-900">
                            {formData.paper_sheet || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Impressions:
                          </span>
                          <span className="text-gray-900">
                            {formData.imp || "0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Cost Breakdown
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Rate:</span>
                        <span className="text-gray-900">
                          ₹{formData.rate || "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Printing:
                        </span>
                        <span className="text-gray-900">
                          ₹{formData.printing || "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">UV:</span>
                        <span className="text-gray-900">
                          ₹{formData.uv || "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Baking:
                        </span>
                        <span className="text-gray-900">
                          ₹{formData.baking || "0.00"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t bg-blue-50 p-3 rounded">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-800">Total Job Cost:</span>
                        <span className="text-blue-900">
                          ₹
                          {(
                            parseFloat(formData.printing || "0") +
                            parseFloat(formData.uv || "0") +
                            parseFloat(formData.baking || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      • We'll review your job sheet and process the requirements
                    </p>
                    <p>• Production will begin once everything is approved</p>
                    <p>• You'll be contacted for confirmation and delivery</p>
                    <p>• Quality check will be performed before completion</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-4 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating Job Sheet...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Create Job Sheet
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    This will save the job sheet to the production database
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-300 hover:bg-gray-50 px-6 py-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 4 || !isStepValid}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2"
                >
                  Next Step
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex justify-start mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-gray-300 hover:bg-gray-50 px-6 py-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 GanpathiOverseas. Production management system.</p>
          <p className="mt-1">
            Need help? Contact support at{" "}
            <a
              href="mailto:production@ganpathioverseas.com"
              className="text-gray-700 hover:text-gray-900"
            >
              production@ganpathioverseas.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
