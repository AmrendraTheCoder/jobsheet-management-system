"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

// ========== EXISTING AUTH ACTIONS ==========
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// ========== ADMIN AUTH ACTIONS ==========
export const adminAuthAction = async (formData: FormData) => {
  const passcode = formData.get("passcode")?.toString();

  if (passcode === "12345") {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    cookieStore.set("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return redirect("/admin");
  } else {
    return encodedRedirect("error", "/admin", "Invalid passcode");
  }
};

export const adminLogoutAction = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  cookieStore.delete("admin-auth");
  return redirect("/admin");
};

// ========== QUOTATION ACTIONS ==========
export const submitQuotationAction = async (formData: any) => {
  console.log("=== submitQuotationAction called ===");
  console.log("Received formData:", JSON.stringify(formData, null, 2));
  
  const supabase = await createClient();

  try {
    // Handle both FormData and object format
    const getValue = (key: string) => {
      if (formData && typeof formData.get === 'function') {
        return formData.get(key)?.toString();
      } else if (formData && typeof formData === 'object') {
        return formData[key];
      }
      return null;
    };

    // Helper function to handle empty strings and convert to null
    const getNullableValue = (key: string) => {
      const value = getValue(key);
      return value && value.trim() !== '' && value !== 'none' ? value : null;
    };

    const quotationData = {
      client_name: getValue("clientName") || "",
      client_email: getValue("clientEmail") || "",
      client_phone: getNullableValue("clientPhone"),
      company_name: getNullableValue("companyName"),
      project_title: getValue("projectTitle") || "",
      project_description: getNullableValue("projectDescription"),
      print_type: getValue("printType") || "",
      paper_type: getValue("paperType") || "",
      paper_size: getValue("paperSize") || "",
      quantity: parseInt(getValue("quantity") || "0"),
      pages: parseInt(getValue("pages") || "1"),
      color_type: getValue("colorType") || "",
      // Handle finishing options - convert "none" to null
      binding_type: getValue("bindingType") === "none" ? null : getValue("bindingType"),
      lamination: getValue("lamination") === "none" ? null : getValue("lamination"),
      folding: getValue("folding") === "none" ? null : getValue("folding"),
      cutting: getValue("cutting") || "standard",
      status: "pending",
      priority: "normal",
    };

    console.log("Processed quotation data:", JSON.stringify(quotationData, null, 2));

    // Enhanced validation with specific field checking
    const requiredFields = [
      { key: 'client_name', value: quotationData.client_name },
      { key: 'client_email', value: quotationData.client_email },
      { key: 'project_title', value: quotationData.project_title },
      { key: 'print_type', value: quotationData.print_type },
      { key: 'paper_type', value: quotationData.paper_type },
      { key: 'paper_size', value: quotationData.paper_size },
      { key: 'color_type', value: quotationData.color_type },
      { key: 'quantity', value: quotationData.quantity }
    ];

    console.log("Checking required fields:", requiredFields);

    const missingFields = requiredFields.filter(field => 
      !field.value || 
      (typeof field.value === 'string' && field.value.trim() === '') ||
      (typeof field.value === 'number' && field.value <= 0)
    );

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return { 
        success: false, 
        error: `Missing required fields: ${missingFields.map(f => f.key).join(', ')}` 
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quotationData.client_email)) {
      return { 
        success: false, 
        error: "Invalid email format" 
      };
    }

    console.log("About to insert into database...");

    const { data, error } = await supabase
      .from("quotation_requests")
      .insert([quotationData])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("Quotation submitted successfully:", data);
    return { success: true, data, message: "Quotation submitted successfully!" };

  } catch (err: any) {
    console.error("Exception in submitQuotationAction:", err);
    return { 
      success: false, 
      error: err.message || "Unknown error occurred" 
    };
  }
};

export const updateQuotationStatusAction = async (
  quotationId: string,
  status: string,
) => {
  const supabase = await createClient();

  const updateData: any = { status };
  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  console.log(`Updating quotation ${quotationId} status to ${status}`);

  try {
    const { error } = await supabase
      .from("quotation_requests")
      .update(updateData)
      .eq("id", quotationId);

    if (error) {
      console.error("Error updating quotation status:", error);
      return { success: false, error: error.message };
    }

    const { data, error: fetchError } = await supabase
      .from("quotation_requests")
      .select("status")
      .eq("id", quotationId)
      .single();

    if (fetchError) {
      console.error("Error verifying status update:", fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log(`Status updated successfully. New status: ${data?.status}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception in updateQuotationStatusAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const addQuotationNoteAction = async (
  quotationId: string,
  note: string,
) => {
  const supabase = await createClient();

  console.log(`Adding note to quotation ${quotationId}: ${note}`);

  try {
    const noteData = {
      quotation_id: quotationId,
      note: note,
      created_by: "Admin",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("quotation_notes")
      .insert(noteData)
      .select();

    if (error) {
      console.error("Error adding note:", error);
      return { success: false, error: error.message };
    }

    console.log("Note added successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception in addQuotationNoteAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const updateQuotationPriceAction = async (
  quotationId: string,
  finalPrice: number,
) => {
  const supabase = await createClient();

  console.log(`Updating quotation ${quotationId} final price to ${finalPrice}`);

  try {
    const { data, error } = await supabase
      .from("quotation_requests")
      .update({ 
        final_price: finalPrice,
        updated_at: new Date().toISOString() 
      })
      .eq("id", quotationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating quotation price:", error);
      return { success: false, error: error.message };
    }

    console.log("Price updated successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception in updateQuotationPriceAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const deleteQuotationAction = async (quotationId: string) => {
  const supabase = await createClient();

  console.log(`Deleting quotation ${quotationId}`);

  try {
    // First delete related notes
    const { error: notesError } = await supabase
      .from("quotation_notes")
      .delete()
      .eq("quotation_id", quotationId);

    if (notesError) {
      console.error("Error deleting quotation notes:", notesError);
      // Continue anyway, as notes might not exist
    }

    // Delete the quotation
    const { error } = await supabase
      .from("quotation_requests")
      .delete()
      .eq("id", quotationId);

    if (error) {
      console.error("Error deleting quotation:", error);
      return { success: false, error: error.message };
    }

    console.log("Quotation deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Exception in deleteQuotationAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const generateInvoiceAction = async (quotationId: string) => {
  const supabase = await createClient();

  try {
    const { data: quotation, error: quotationError } = await supabase
      .from("quotation_requests")
      .select("*")
      .eq("id", quotationId)
      .single();

    if (quotationError || !quotation) {
      return { success: false, error: "Quotation not found" };
    }

    if (!quotation.final_price) {
      return { success: false, error: "Final price not set" };
    }

    // Check if function exists, if not create a simple invoice number
    let invoiceNumber;
    try {
      const { data: generatedNumber, error: invoiceNumberError } =
        await supabase.rpc("generate_invoice_number");

      if (invoiceNumberError) {
        // Fallback to simple invoice number generation
        const timestamp = Date.now().toString().slice(-6);
        invoiceNumber = `GO-INV-${timestamp}`;
      } else {
        invoiceNumber = generatedNumber;
      }
    } catch {
      // Fallback invoice number
      const timestamp = Date.now().toString().slice(-6);
      invoiceNumber = `GO-INV-${timestamp}`;
    }

    const subtotal = quotation.final_price;
    const taxRate = 18.0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Try to create invoice record (if table exists)
    try {
      await supabase.from("invoices").insert({
        quotation_id: quotationId,
        invoice_number: invoiceNumber,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (invoiceError) {
      console.warn("Invoices table might not exist, continuing with quotation update only");
    }

    // Update quotation with invoice details
    const { error: updateError } = await supabase
      .from("quotation_requests")
      .update({
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        total_amount: totalAmount,
        tax_amount: taxAmount,
      })
      .eq("id", quotationId);

    if (updateError) {
      console.error("Error updating quotation:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, invoiceNumber };
  } catch (error: any) {
    console.error("Error in generateInvoiceAction:", error);
    return { success: false, error: "Internal server error" };
  }
};

export const downloadInvoiceAction = async (quotationId: string) => {
  const supabase = await createClient();

  try {
    const { data: quotation, error: quotationError } = await supabase
      .from("quotation_requests")
      .select("*")
      .eq("id", quotationId)
      .single();

    if (quotationError || !quotation) {
      return { success: false, error: "Quotation not found" };
    }

    if (!quotation.invoice_number) {
      return { success: false, error: "Invoice not generated yet" };
    }

    // Try to get invoice details from invoices table
    let invoice = null;
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("quotation_id", quotationId)
        .single();

      if (!invoiceError) {
        invoice = invoiceData;
      }
    } catch {
      console.warn("Invoice details not found in invoices table, using quotation data");
    }

    return {
      success: true,
      quotation,
      invoice: invoice || null,
      downloadUrl: `/api/invoice/${quotationId}/download`,
    };

  } catch (error: any) {
    console.error("Error in downloadInvoiceAction:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
};

// ========== JOB SHEET ACTIONS ==========
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


export const submitJobSheetAction = async (formData: JobSheetData) => {
  try {
    console.log("=== JOB SHEET SUBMISSION START ===");
    console.log("Form data received:", JSON.stringify(formData, null, 2));

    const supabase = await createClient();

    // Convert string values to appropriate types for database
    const jobSheetData = {
      job_date: formData.job_date || null,
      party_name: formData.party_name || null,
      description: formData.description || null,
      sheet: formData.sheet ? parseInt(formData.sheet) : null,
      plate: formData.plate ? parseInt(formData.plate) : null,
      size: formData.size || null,
      sq_inch: formData.sq_inch ? parseFloat(formData.sq_inch) : null,
      paper_sheet: formData.paper_sheet ? parseInt(formData.paper_sheet) : null,
      imp: formData.imp ? parseInt(formData.imp) : null,
      rate: formData.rate ? parseFloat(formData.rate) : null,
      printing: formData.printing ? parseFloat(formData.printing) : null,
      uv: formData.uv ? parseFloat(formData.uv) : null,
      baking: formData.baking ? parseFloat(formData.baking) : null,
    };

    console.log("Processed data for database:", JSON.stringify(jobSheetData, null, 2));

    // Enhanced validation
    const requiredFields = [
      { key: 'job_date', value: jobSheetData.job_date },
      { key: 'party_name', value: jobSheetData.party_name },
      { key: 'description', value: jobSheetData.description },
      { key: 'sheet', value: jobSheetData.sheet },
      { key: 'plate', value: jobSheetData.plate },
      { key: 'size', value: jobSheetData.size },
      { key: 'sq_inch', value: jobSheetData.sq_inch },
      { key: 'paper_sheet', value: jobSheetData.paper_sheet },
      { key: 'imp', value: jobSheetData.imp },
      { key: 'rate', value: jobSheetData.rate },
      { key: 'printing', value: jobSheetData.printing },
    ];

    const missingFields = requiredFields.filter(field =>
      field.value === null ||
      field.value === undefined ||
      (typeof field.value === 'string' && field.value.trim() === '') ||
      (typeof field.value === 'number' && isNaN(field.value))
    );

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return {
        success: false,
        error: `Missing required fields: ${missingFields.map(f => f.key).join(', ')}`
      };
    }

    // Insert into job_sheets table
    const { data, error } = await supabase
      .from("job_sheets")
      .insert([jobSheetData])
      .select()
      .single();

    if (error) {
      console.error("Database insertion error:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    console.log("Job sheet created successfully:", data);
    console.log("=== JOB SHEET SUBMISSION SUCCESS ===");

    return {
      success: true,
      data: data,
      message: "Job sheet created successfully!",
    };

  } catch (error: any) {
    console.error("=== JOB SHEET SUBMISSION ERROR ===");
    console.error("Full error:", error);
    
    return {
      success: false,
      error: `Server error: ${error.message || "Unknown error occurred"}`,
    };
  }
}

export const updateJobSheetAction = async (
  jobSheetId: number,
  updates: Partial<JobSheetData>
) => {
  const supabase = await createClient();

  console.log(`Updating job sheet ${jobSheetId}:`, updates);

  try {
    // Convert string values to appropriate types if needed
    const processedUpdates: any = {};
    
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof JobSheetData];
      
      if (key === 'sheet' || key === 'plate' || key === 'paper_sheet' || key === 'imp') {
        processedUpdates[key] = value ? parseInt(value) : null;
      } else if (key === 'sq_inch' || key === 'rate' || key === 'printing' || key === 'uv' || key === 'baking') {
        processedUpdates[key] = value ? parseFloat(value) : null;
      } else {
        processedUpdates[key] = value || null;
      }
    });

    const { data, error } = await supabase
      .from("job_sheets")
      .update(processedUpdates)
      .eq("id", jobSheetId)
      .select()
      .single();

    if (error) {
      console.error("Error updating job sheet:", error);
      return { success: false, error: error.message };
    }

    console.log("Job sheet updated successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception in updateJobSheetAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const deleteJobSheetAction = async (jobSheetId: number) => {
  const supabase = await createClient();

  console.log(`Deleting job sheet ${jobSheetId}`);

  try {
    // First delete related notes if they exist
    try {
      const { error: notesError } = await supabase
        .from("job_sheet_notes")
        .delete()
        .eq("job_sheet_id", jobSheetId);

      if (notesError) {
        console.warn("Error deleting job sheet notes:", notesError);
        // Continue anyway, as notes table might not exist or notes might not exist
      }
    } catch (notesErr) {
      console.warn("Job sheet notes table might not exist, continuing...");
    }

    // Delete the job sheet
    const { error } = await supabase
      .from("job_sheets")
      .delete()
      .eq("id", jobSheetId);

    if (error) {
      console.error("Error deleting job sheet:", error);
      return { success: false, error: error.message };
    }

    console.log("Job sheet deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Exception in deleteJobSheetAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const addJobSheetNoteAction = async (
  jobSheetId: number,
  note: string,
) => {
  const supabase = await createClient();

  console.log(`Adding note to job sheet ${jobSheetId}: ${note}`);

  try {
    const noteData = {
      job_sheet_id: jobSheetId,
      note: note,
      created_by: "Admin",
      created_at: new Date().toISOString(),
    };

    // Try to insert into job_sheet_notes table
    const { data, error } = await supabase
      .from("job_sheet_notes")
      .insert(noteData)
      .select();

    if (error) {
      console.error("Error adding job sheet note:", error);
      return { success: false, error: error.message };
    }

    console.log("Job sheet note added successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception in addJobSheetNoteAction:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const generateJobSheetReportAction = async (jobSheetId: number) => {
  const supabase = await createClient();

  try {
    const { data: jobSheet, error: jobSheetError } = await supabase
      .from("job_sheets")
      .select("*")
      .eq("id", jobSheetId)
      .single();

    if (jobSheetError || !jobSheet) {
      return { success: false, error: "Job sheet not found" };
    }

    // Generate a report number
    const timestamp = Date.now().toString().slice(-6);
    const reportNumber = `GO-JS-${jobSheetId}-${timestamp}`;

    // Calculate total cost if not already calculated
    const totalCost = (jobSheet.printing || 0) + (jobSheet.uv || 0) + (jobSheet.baking || 0);

    // Try to get notes if they exist
    let notes = [];
    try {
      const { data: notesData, error: notesError } = await supabase
        .from("job_sheet_notes")
        .select("*")
        .eq("job_sheet_id", jobSheetId)
        .order("created_at", { ascending: false });

      if (!notesError) {
        notes = notesData || [];
      }
    } catch {
      console.warn("Job sheet notes table might not exist");
    }

    return {
      success: true,
      reportNumber,
      jobSheet: {
        ...jobSheet,
        totalCost,
      },
      notes,
      downloadUrl: `/api/job-sheet-report/${jobSheetId}/download`,
    };

  } catch (error: any) {
    console.error("Error in generateJobSheetReportAction:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
};