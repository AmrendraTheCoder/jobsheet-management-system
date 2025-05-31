"use client";

import { useState, useEffect } from "react";
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
  Send,
  Building2,
  CheckCircle,
  AlertCircle,
  User,
  Layers,
  Banknote,
  Plus,
  Calculator,
  Printer,
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
  party_id?: number;
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
  gsm: string;
  paper_type_id?: number;
  job_type: string;
  paper_provided_by_party?: boolean;
  paper_type?: string | null;
  paper_size?: string | null;
  paper_gsm?: number | null;
}

interface Party {
  id: number;
  name: string;
  balance: number;
  phone?: string;
  email?: string;
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
  gsm: "",
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

export default function EnhancedJobSheetForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobSheetData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // New states for enhanced functionality
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

  // Load initial data
  useEffect(() => {
    fetchParties();
    fetchPaperTypes();
  }, []);

  // Fetch parties from database
  const fetchParties = async () => {
    try {
      const response = await fetch("/api/parties");
      if (response.ok) {
        const result = await response.json();
        // Handle both array response and object with data property
        const partiesData = Array.isArray(result)
          ? result
          : result.data || result;
        setParties(partiesData || []);

        if (partiesData.length === 0) {
          console.log("No parties found in database");
        }
      } else {
        console.error("Failed to fetch parties:", response.status);
        setParties([]);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
      setParties([]);
    }
  };

  // Fetch paper types from database
  const fetchPaperTypes = async () => {
    try {
      const response = await fetch("/api/paper-types");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPaperTypes(result.data || []);

          if (result.data.length === 0) {
            console.log("No paper types found in database");
          }
        } else {
          console.log("Paper types API returned unsuccessful response");
          setPaperTypes([]);
        }
      } else {
        console.log(
          "Paper types API not available or returned error:",
          response.status
        );
        setPaperTypes([]);
      }
    } catch (error) {
      console.error("Error fetching paper types:", error);
      // Continue without paper types if API doesn't exist
      setPaperTypes([]);
    }
  };

  const updateFormData = (field: keyof JobSheetData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add new party
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
        // API returns the new party object directly
        // Update parties list
        await fetchParties();
        // Select the new party
        setSelectedParty(newParty);
        updateFormData("party_name", newParty.name);
        updateFormData("party_id", newParty.id.toString());
        // Reset form
        setNewPartyName("");
        setNewPartyBalance("");
        setShowNewPartyDialog(false);

        // Show success message
        setSubmitStatus({
          type: "success",
          message: `Party "${newParty.name}" has been created successfully!`,
        });
      } else {
        // Handle error response
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Failed to create party:", response.status, errorData);
        setSubmitStatus({
          type: "error",
          message: `Failed to create party: ${errorData.error || "Unknown error"}`,
        });
      }
    } catch (error: any) {
      console.error("Error adding new party:", error);
      setSubmitStatus({
        type: "error",
        message: `Network error: ${error.message || "Unknown error"}`,
      });
    }
  };

  // Add new paper type
  const handleAddNewPaperType = async () => {
    if (!newPaperType.name.trim()) return;

    try {
      const response = await fetch("/api/paper-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPaperType.name.trim(),
          gsm: parseInt(newPaperType.gsm) || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update paper types list
          await fetchPaperTypes();
          // Select the new paper type
          updateFormData("paper_type_id", result.data.id.toString());
          // Set GSM if provided
          if (result.data.gsm) {
            updateFormData("gsm", result.data.gsm.toString());
          }
          // Clear form and close dialog
          setNewPaperType({ name: "", gsm: "" });
          setShowNewPaperTypeDialog(false);
        }
      }
    } catch (error) {
      console.error("Error adding new paper type:", error);
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
    if (value.includes("*")) {
      const dimensions = value.split("*");
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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
    const totalAmount =
      parseFloat(printingCost) +
      parseFloat(formData.uv || "0") +
      parseFloat(formData.baking || "0");

    const submissionData = {
      ...formData,
      printing: printingCost,
      party_id: selectedParty?.id || null,
      paper_type_id: formData.paper_type_id
        ? parseInt(formData.paper_type_id.toString())
        : null,
      job_type: formData.job_type || "single-single",
      gsm: formData.gsm ? parseInt(formData.gsm) : null,
      paper_provided_by_party: paperProvidedByParty,
      paper_type: paperProvidedByParty ? paperType : null,
      paper_size: paperProvidedByParty ? paperSize : null,
      paper_gsm: paperProvidedByParty && paperGSM ? parseInt(paperGSM) : null,
    };

    console.log("Submitting job sheet data:", submissionData);

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

  const isStepValid = validateStep(currentStep);

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
              { step: 3, label: "Costing", icon: Calculator },
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

        {/* Form Card */}
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
                  <Calculator className="w-5 h-5" /> Cost Breakdown
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
                    <div className="mt-1">
                      <Select
                        value={selectedParty?.id.toString() || ""}
                        onValueChange={(value) => {
                          if (value === "new") {
                            setShowNewPartyDialog(true);
                          } else {
                            const party = parties.find(
                              (p) => p.id.toString() === value
                            );
                            if (party) {
                              setSelectedParty(party);
                              updateFormData("party_name", party.name);
                              updateFormData("party_id", party.id.toString());
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-gray-500">
                          <SelectValue placeholder="Select a party or create new" />
                        </SelectTrigger>
                        <SelectContent>
                          {parties.map((party) => (
                            <SelectItem
                              key={party.id}
                              value={party.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {party.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Balance: ₹{party.balance.toFixed(2)}
                                  {party.phone && ` • ${party.phone}`}
                                </span>
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
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Current Balance:</strong> ₹
                          {selectedParty.balance.toFixed(2)}
                        </p>
                        {selectedParty.phone && (
                          <p className="text-sm text-blue-600">
                            Phone: {selectedParty.phone}
                          </p>
                        )}
                        {selectedParty.email && (
                          <p className="text-sm text-blue-600">
                            Email: {selectedParty.email}
                          </p>
                        )}
                      </div>
                    )}
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
              </div>
            )}

            {/* Step 2: Production Specifications */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="job_type"
                      className="text-gray-700 font-medium"
                    >
                      Job Type *
                    </Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) =>
                        updateFormData("job_type", value)
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-single">
                          Single-Single
                        </SelectItem>
                        <SelectItem value="front-back">Front-Back</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      value={formData.size}
                      onValueChange={handleSizeChange}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
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
                      placeholder="Auto-calculated from size"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="paper_type"
                      className="text-gray-700 font-medium"
                    >
                      Paper Type *
                    </Label>
                    <Select
                      value={formData.paper_type_id?.toString() || ""}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setShowNewPaperTypeDialog(true);
                        } else {
                          updateFormData("paper_type_id", value);
                          // Find selected paper type to update GSM if available
                          const selectedType = paperTypes.find(
                            (type) => type.id.toString() === value
                          );
                          if (selectedType) {
                            updateFormData("gsm", selectedType.gsm.toString());
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} ({type.gsm} GSM)
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
                  <div>
                    <Label htmlFor="gsm" className="text-gray-700 font-medium">
                      GSM *
                    </Label>
                    <Select
                      value={formData.gsm}
                      onValueChange={(value) => updateFormData("gsm", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-4">
                    Paper Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paper-provided">
                        Paper Provided by Party
                      </Label>
                      <Select
                        value={paperProvidedByParty ? "yes" : "no"}
                        onValueChange={(value) =>
                          setPaperProvidedByParty(value === "yes")
                        }
                      >
                        <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paperProvidedByParty && (
                      <>
                        <div>
                          <Label htmlFor="paper-type">Paper Type</Label>
                          <Select
                            value={paperType}
                            onValueChange={setPaperType}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
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

                        <div>
                          <Label htmlFor="paper-size">Paper Size</Label>
                          <Select
                            value={paperSize}
                            onValueChange={setPaperSize}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
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

                        <div>
                          <Label htmlFor="paper-gsm">Paper GSM</Label>
                          <Select value={paperGSM} onValueChange={setPaperGSM}>
                            <SelectTrigger className="border-gray-300 focus:border-gray-500 mt-1">
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
                      </>
                    )}
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
                      htmlFor="printing_calculated"
                      className="text-gray-700 font-medium"
                    >
                      Printing Cost (Calculated)
                    </Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="printing_calculated"
                        type="text"
                        value={`₹${calculatePrintingCost()}`}
                        className="border-gray-300 focus:border-gray-500 pl-10 bg-gray-50"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.job_type === "front-back"
                        ? "Rate × Impressions ÷ 2"
                        : "Rate × Impressions"}
                    </p>
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
                        ₹{calculatePrintingCost()}
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
                            parseFloat(calculatePrintingCost()) +
                            parseFloat(formData.uv || "0") +
                            parseFloat(formData.baking || "0")
                          ).toFixed(2)}
                        </span>
                      </div>
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
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Job Type:
                          </span>
                          <span className="text-gray-900">
                            {formData.job_type === "front-back"
                              ? "Front-Back"
                              : "Single-Single"}
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
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            GSM:
                          </span>
                          <span className="text-gray-900">
                            {formData.gsm || "0"}
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
                          ₹{calculatePrintingCost()}
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
                            parseFloat(calculatePrintingCost()) +
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
                      • The job sheet will be saved and party balance will be
                      updated
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
                    This will save the job sheet and update party balance
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

      {/* New Party Dialog */}
      <Dialog open={showNewPartyDialog} onOpenChange={setShowNewPartyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Party</DialogTitle>
            <DialogDescription>
              Create a new party to add to the job sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-party-name">Party Name *</Label>
              <Input
                id="new-party-name"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Enter party name"
              />
            </div>
            <div>
              <Label htmlFor="new-party-balance">Initial Balance</Label>
              <Input
                id="new-party-balance"
                type="number"
                step="0.01"
                value={newPartyBalance}
                onChange={(e) => setNewPartyBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewPartyDialog(false);
                setNewPartyName("");
                setNewPartyBalance("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewParty} disabled={!newPartyName.trim()}>
              Add Party
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Paper Type Dialog */}
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
            <div>
              <Label htmlFor="new-paper-type-name">Paper Type Name *</Label>
              <Input
                id="new-paper-type-name"
                value={newPaperType.name}
                onChange={(e) =>
                  setNewPaperType({ ...newPaperType, name: e.target.value })
                }
                placeholder="e.g., Matte, Glossy, Art Paper"
              />
            </div>
            <div>
              <Label htmlFor="new-paper-type-gsm">GSM</Label>
              <Input
                id="new-paper-type-gsm"
                type="number"
                value={newPaperType.gsm}
                onChange={(e) =>
                  setNewPaperType({ ...newPaperType, gsm: e.target.value })
                }
                placeholder="e.g., 150"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewPaperTypeDialog(false);
                setNewPaperType({ name: "", gsm: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewPaperType}
              disabled={!newPaperType.name.trim()}
            >
              Add Paper Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
