// "use client";

// import { SetStateAction, useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   FileText,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   TrendingUp,
//   Users,
//   Printer,
//   LogOut,
//   Eye,
//   Edit,
//   MessageSquare,
//   Download,
//   Building2,
//   IndianRupee,
//   Receipt,
//   Send,
//   Mail,
//   Phone,
//   UserCircle,
//   Calendar,
//   Star,
//   Award,
//   Target,
//   Activity,
//   PieChart,
//   BarChart3,
//   Zap,
//   Filter,
//   Search,
//   X,
//   Plus,
//   ArrowUpDown,
//   Bell,
//   Home,
//   Menu,
//   Trash2,
//   LineChart,
//   Settings,
//   FileDown,
// } from "lucide-react";

// // Import our custom hooks and types
// import { useQuotations } from "@/hooks/useQuotations";
// import {
//   QuotationRequest,
//   QuotationNote,
//   DashboardStats,
//   ChartData,
//   Notification,
// } from "@/types/database";

// export default function EnhancedAdminDashboard() {
//   // Use our custom hook for database operations
//   const {
//     quotations,
//     notes,
//     loading,
//     error,
//     updateQuotationStatus,
//     updateQuotationPrice,
//     addNote,
//     generateInvoice,
//     deleteQuotation,
//   } = useQuotations();

//   // Mock notifications (you can create a separate hook for this later)
//   const [notifications, setNotifications] = useState<Notification[]>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("admin-notifications");
//       if (saved) {
//         return JSON.parse(saved);
//       }
//     }
//     return [
//       {
//         id: "1",
//         title: "New Quotation Request",
//         message: "A new quotation request has been submitted",
//         type: "info",
//         timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//         read: false,
//       },
//       {
//         id: "2",
//         title: "Payment Received",
//         message: "Payment received for recent order",
//         type: "success",
//         timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
//         read: false,
//       },
//     ];
//   });
//   const [stats, setStats] = useState<DashboardStats>({
//     totalQuotations: 0,
//     pendingQuotations: 0,
//     completedQuotations: 0,
//     inProgressQuotations: 0,
//     cancelledQuotations: 0,
//     totalRevenue: 0,
//     avgOrderValue: 0,
//     thisMonthQuotations: 0,
//     lastMonthQuotations: 0,
//     revenueGrowth: 0,
//     conversionRate: 0,
//   });

//   const [chartData, setChartData] = useState<ChartData[]>([]);
//   const [selectedQuotation, setSelectedQuotation] =
//     useState<QuotationRequest | null>(null);
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newNote, setNewNote] = useState("");
//   const [editingPrice, setEditingPrice] = useState<string | null>(null);
//   const [newPrice, setNewPrice] = useState("");
//   const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
//     null
//   );
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showReportsModal, setShowReportsModal] = useState(false);
//   const [deletePasscode, setDeletePasscode] = useState("");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [quotationToDelete, setQuotationToDelete] = useState<string | null>(
//     null
//   );

//   // Calculate dashboard statistics from real data
//   useEffect(() => {
//     if (quotations.length > 0) {
//       calculateStats(quotations);
//       generateChartData();
//     }
//   }, [quotations]);

//   const formatDate = (
//     dateString: string | null,
//     options?: Intl.DateTimeFormatOptions
//   ) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString(
//       "en-US",
//       options || {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//       }
//     );
//   };

//   const formatTime = (dateString: string | null) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const calculateStats = (data: QuotationRequest[]) => {
//     const now = new Date();
//     const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

//     const totalQuotations = data.length;
//     const pendingQuotations = data.filter((q) => q.status === "pending").length;
//     const completedQuotations = data.filter(
//       (q) => q.status === "completed"
//     ).length;
//     const inProgressQuotations = data.filter(
//       (q) => q.status === "in-progress"
//     ).length;
//     const cancelledQuotations = data.filter(
//       (q) => q.status === "cancelled"
//     ).length;

//     const totalRevenue = data
//       .filter((q) => q.final_price && q.status === "completed")
//       .reduce((sum, q) => sum + (q.final_price || 0), 0);

//     const avgOrderValue =
//       completedQuotations > 0 ? totalRevenue / completedQuotations : 0;

//     const thisMonthQuotations = data.filter(
//       (q) => q.created_at && new Date(q.created_at) >= thisMonth
//     ).length;

//     const lastMonthQuotations = data.filter(
//       (q) =>
//         q.created_at &&
//         new Date(q.created_at) >= lastMonth &&
//         new Date(q.created_at) <= endOfLastMonth
//     ).length;

//     const revenueGrowth =
//       lastMonthQuotations > 0
//         ? ((thisMonthQuotations - lastMonthQuotations) / lastMonthQuotations) *
//           100
//         : 0;

//     const conversionRate =
//       totalQuotations > 0 ? (completedQuotations / totalQuotations) * 100 : 0;

//     setStats({
//       totalQuotations,
//       pendingQuotations,
//       completedQuotations,
//       inProgressQuotations,
//       cancelledQuotations,
//       totalRevenue,
//       avgOrderValue,
//       thisMonthQuotations,
//       lastMonthQuotations,
//       revenueGrowth,
//       conversionRate,
//     });
//   };

//   const generateChartData = () => {
//     const months = [];
//     const now = new Date();
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
//       const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//       const monthQuotations = quotations.filter((q) => {
//         if (!q.created_at) return false;
//         const createdDate = new Date(q.created_at);
//         return createdDate >= monthStart && createdDate <= monthEnd;
//       });

//       const monthRevenue = monthQuotations
//         .filter((q) => q.final_price && q.status === "completed")
//         .reduce((sum, q) => sum + (q.final_price || 0), 0);

//       months.push({
//         month: date.toLocaleDateString("en-US", { month: "short" }),
//         quotations: monthQuotations.length,
//         revenue: monthRevenue,
//       });
//     }
//     setChartData(months);
//   };

//   // Helper functions remain the same
//   const getStatusBadge = (status: string | null) => {
//     const statusConfig = {
//       pending: {
//         color: "bg-yellow-50 text-yellow-700 border-yellow-200",
//         icon: Clock,
//       },
//       "in-progress": {
//         color: "bg-blue-50 text-blue-700 border-blue-200",
//         icon: Activity,
//       },
//       completed: {
//         color: "bg-green-50 text-green-700 border-green-200",
//         icon: CheckCircle,
//       },
//       cancelled: {
//         color: "bg-red-50 text-red-700 border-red-200",
//         icon: AlertCircle,
//       },
//     };
//     const config =
//       statusConfig[(status || "pending") as keyof typeof statusConfig] ||
//       statusConfig.pending;
//     const Icon = config.icon;
//     return (
//       <Badge className={`${config.color} border font-medium`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {(status || "pending").charAt(0).toUpperCase() +
//           (status || "pending").slice(1)}
//       </Badge>
//     );
//   };

//   const getPriorityBadge = (priority: string | null) => {
//     const priorityConfig = {
//       low: { color: "bg-gray-50 text-gray-600", icon: ArrowUpDown },
//       normal: { color: "bg-blue-50 text-blue-600", icon: Target },
//       high: { color: "bg-orange-50 text-orange-600", icon: Zap },
//       urgent: { color: "bg-red-50 text-red-600", icon: AlertCircle },
//     };
//     const config =
//       priorityConfig[(priority || "normal") as keyof typeof priorityConfig] ||
//       priorityConfig.normal;
//     const Icon = config.icon;
//     return (
//       <Badge className={`${config.color} border font-medium`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {(priority || "normal").charAt(0).toUpperCase() +
//           (priority || "normal").slice(1)}
//       </Badge>
//     );
//   };

//   const filteredQuotations = quotations.filter((q) => {
//     const matchesStatus =
//       statusFilter === "all" || (q.status || "pending") === statusFilter;
//     const matchesSearch =
//       searchTerm === "" ||
//       q.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       q.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       q.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       q.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   // Updated handler functions to use database operations
//   const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
//     try {
//       await updateQuotationStatus(quotationId, newStatus);
//     } catch (error) {
//       alert("Failed to update status. Please try again.");
//     }
//   };

//   const handlePriceUpdate = async (quotationId: string, price: string) => {
//     const numPrice = parseFloat(price);
//     if (isNaN(numPrice)) {
//       alert("Please enter a valid price");
//       return;
//     }

//     try {
//       await updateQuotationPrice(quotationId, numPrice);
//       setEditingPrice(null);
//       setNewPrice("");
//     } catch (error) {
//       alert("Failed to update price. Please try again.");
//     }
//   };

//   const handleAddNote = async (quotationId: string) => {
//     if (!newNote.trim()) return;

//     try {
//       await addNote(quotationId, newNote);
//       setNewNote("");
//     } catch (error) {
//       alert("Failed to add note. Please try again.");
//     }
//   };

//   const getQuotationNotes = (quotationId: string) => {
//     return notes.filter((note) => note.quotation_id === quotationId);
//   };

//   const handleGenerateInvoice = async (quotationId: string) => {
//     try {
//       const invoiceNumber = await generateInvoice(quotationId);
//       alert(`Invoice #${invoiceNumber} generated successfully!`);
//     } catch (error) {
//       alert("Failed to generate invoice. Please try again.");
//     }
//   };

//   // REPLACE your existing handleDownloadInvoice function with this modern version

//   const handleDownloadInvoice = async (
//     quotationId: SetStateAction<string | null>,
//     invoiceNumber: string | null
//   ) => {
//     setDownloadingInvoice(quotationId);

//     try {
//       // Create invoice data
//       const quotation = quotations.find((q) => q.id === quotationId);

//       if (!quotation) {
//         throw new Error("Quotation not found");
//       }

//       const invoiceData = {
//         invoiceNumber,
//         date: new Date().toLocaleDateString("en-IN"),
//         dueDate: new Date(
//           Date.now() + 30 * 24 * 60 * 60 * 1000
//         ).toLocaleDateString("en-IN"),
//         clientName: quotation.client_name,
//         clientEmail: quotation.client_email,
//         clientPhone: quotation.client_phone || "N/A",
//         companyName: quotation.company_name || "N/A",
//         projectTitle: quotation.project_title,
//         projectDescription: quotation.project_description || "N/A",
//         printType: quotation.print_type,
//         paperType: quotation.paper_type,
//         paperSize: quotation.paper_size,
//         colorType: quotation.color_type,
//         quantity: quotation.quantity,
//         pages: quotation.pages || 1,
//         bindingType: quotation.binding_type || "None",
//         lamination: quotation.lamination || "None",
//         finalPrice: quotation.final_price || 0,
//         estimatedPrice: quotation.estimated_price || 0,
//         createdAt: quotation.created_at
//           ? new Date(quotation.created_at).toLocaleDateString("en-IN")
//           : new Date().toLocaleDateString("en-IN"), // <-- FIX THIS LINE
//         priority: quotation.priority || "Normal",
//       };

//       // Calculate breakdown
//       const unitPrice = invoiceData.finalPrice / invoiceData.quantity;
//       const subtotal = invoiceData.finalPrice;
//       const taxRate = 18; // 18% GST
//       const taxAmount = (subtotal * taxRate) / 100;
//       const totalAmount = subtotal + taxAmount;

//       // Generate professional HTML invoice
//       const invoiceHTML = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Invoice #${invoiceData.invoiceNumber}</title>
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }
        
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             background: #f8f9fa;
//             padding: 20px;
//         }
        
//         .invoice-container {
//             max-width: 800px;
//             margin: 0 auto;
//             background: white;
//             border-radius: 12px;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.1);
//             overflow: hidden;
//         }
        
//         .invoice-header {
//             background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
//             color: white;
//             padding: 40px;
//             position: relative;
//         }
        
//         .invoice-header::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             right: 0;
//             width: 100px;
//             height: 100px;
//             background: rgba(255,255,255,0.1);
//             border-radius: 50%;
//             transform: translate(30px, -30px);
//         }
        
//         .company-info {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 30px;
//         }
        
//         .company-logo {
//             width: 60px;
//             height: 60px;
//             background: white;
//             border-radius: 12px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-weight: bold;
//             color: #1f2937;
//             font-size: 24px;
//         }
        
//         .company-details h1 {
//             font-size: 28px;
//             font-weight: 700;
//             margin-bottom: 8px;
//         }
        
//         .company-details p {
//             opacity: 0.9;
//             font-size: 14px;
//         }
        
//         .invoice-meta {
//             background: rgba(255,255,255,0.1);
//             padding: 20px;
//             border-radius: 8px;
//             backdrop-filter: blur(10px);
//         }
        
//         .invoice-meta h2 {
//             font-size: 32px;
//             font-weight: 300;
//             margin-bottom: 10px;
//         }
        
//         .meta-row {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 8px;
//         }
        
//         .invoice-body {
//             padding: 40px;
//         }
        
//         .billing-section {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 40px;
//             margin-bottom: 40px;
//         }
        
//         .billing-card {
//             background: #f8f9fa;
//             padding: 24px;
//             border-radius: 8px;
//             border-left: 4px solid #1f2937;
//         }
        
//         .billing-card h3 {
//             color: #1f2937;
//             font-size: 16px;
//             font-weight: 600;
//             margin-bottom: 16px;
//             text-transform: uppercase;
//             letter-spacing: 0.5px;
//         }
        
//         .billing-card p {
//             margin-bottom: 8px;
//             color: #6b7280;
//         }
        
//         .billing-card .highlight {
//             color: #1f2937;
//             font-weight: 600;
//         }
        
//         .project-section {
//             margin-bottom: 40px;
//         }
        
//         .section-title {
//             color: #1f2937;
//             font-size: 18px;
//             font-weight: 600;
//             margin-bottom: 20px;
//             padding-bottom: 10px;
//             border-bottom: 2px solid #e5e7eb;
//         }
        
//         .project-details {
//             background: #f8f9fa;
//             padding: 24px;
//             border-radius: 8px;
//             margin-bottom: 20px;
//         }
        
//         .project-title {
//             font-size: 20px;
//             font-weight: 600;
//             color: #1f2937;
//             margin-bottom: 10px;
//         }
        
//         .project-description {
//             color: #6b7280;
//             margin-bottom: 20px;
//             padding: 16px;
//             background: white;
//             border-radius: 6px;
//             border-left: 3px solid #3b82f6;
//         }
        
//         .specs-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//             gap: 16px;
//         }
        
//         .spec-item {
//             background: white;
//             padding: 16px;
//             border-radius: 6px;
//             border: 1px solid #e5e7eb;
//         }
        
//         .spec-label {
//             font-size: 12px;
//             color: #6b7280;
//             text-transform: uppercase;
//             letter-spacing: 0.5px;
//             margin-bottom: 4px;
//         }
        
//         .spec-value {
//             font-weight: 600;
//             color: #1f2937;
//             text-transform: capitalize;
//         }
        
//         .items-table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-bottom: 30px;
//             background: white;
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//         }
        
//         .items-table th {
//             background: #1f2937;
//             color: white;
//             padding: 16px;
//             text-align: left;
//             font-weight: 600;
//             text-transform: uppercase;
//             font-size: 12px;
//             letter-spacing: 0.5px;
//         }
        
//         .items-table td {
//             padding: 16px;
//             border-bottom: 1px solid #e5e7eb;
//         }
        
//         .items-table tr:last-child td {
//             border-bottom: none;
//         }
        
//         .items-table tr:nth-child(even) {
//             background: #f8f9fa;
//         }
        
//         .quantity {
//             text-align: center;
//             font-weight: 600;
//             color: #3b82f6;
//         }
        
//         .amount {
//             text-align: right;
//             font-weight: 600;
//             color: #1f2937;
//         }
        
//         .totals-section {
//             background: #f8f9fa;
//             padding: 24px;
//             border-radius: 8px;
//             margin-bottom: 30px;
//         }
        
//         .totals-table {
//             width: 100%;
//             max-width: 400px;
//             margin-left: auto;
//         }
        
//         .totals-table tr {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 12px;
//         }
        
//         .totals-table .total-row {
//             font-size: 18px;
//             font-weight: 700;
//             color: #1f2937;
//             padding-top: 12px;
//             border-top: 2px solid #1f2937;
//             margin-top: 12px;
//         }
        
//         .payment-terms {
//             background: #eff6ff;
//             border: 1px solid #3b82f6;
//             border-radius: 8px;
//             padding: 20px;
//             margin-bottom: 30px;
//         }
        
//         .payment-terms h4 {
//             color: #1e40af;
//             margin-bottom: 12px;
//             font-weight: 600;
//         }
        
//         .payment-terms ul {
//             color: #1e40af;
//             padding-left: 20px;
//         }
        
//         .payment-terms li {
//             margin-bottom: 6px;
//         }
        
//         .footer {
//             background: #1f2937;
//             color: white;
//             padding: 30px 40px;
//             text-align: center;
//         }
        
//         .footer h4 {
//             margin-bottom: 16px;
//             font-size: 18px;
//         }
        
//         .footer p {
//             opacity: 0.8;
//             margin-bottom: 8px;
//         }
        
//         .thank-you {
//             background: linear-gradient(135deg, #3b82f6, #1e40af);
//             color: white;
//             padding: 20px;
//             text-align: center;
//             font-size: 18px;
//             font-weight: 600;
//             margin-bottom: 20px;
//             border-radius: 8px;
//         }
        
//         @media print {
//             body { background: white; padding: 0; }
//             .invoice-container { box-shadow: none; }
//         }
//     </style>
// </head>
// <body>
//     <div class="invoice-container">
//         <!-- Header -->
//         <div class="invoice-header">
//             <div class="company-info">
//                 <div>
//                     <div class="company-logo">GP</div>
//                 </div>
//                 <div class="company-details">
//                     <h1>GanpathiOverseas</h1>
//                     <p>Professional Printing Services</p>
//                     <p>Email: contact@ganpathioverseas.com</p>
//                     <p>Phone: +91-XXXXXXXXXX</p>
//                     <p>GST: 27XXXXX1234X1ZX</p>
//                 </div>
//             </div>
            
//             <div class="invoice-meta">
//                 <h2>INVOICE</h2>
//                 <div class="meta-row">
//                     <span>Invoice Number:</span>
//                     <strong>#${invoiceData.invoiceNumber}</strong>
//                 </div>
//                 <div class="meta-row">
//                     <span>Invoice Date:</span>
//                     <strong>${invoiceData.date}</strong>
//                 </div>
//                 <div class="meta-row">
//                     <span>Due Date:</span>
//                     <strong>${invoiceData.dueDate}</strong>
//                 </div>
//             </div>
//         </div>

//         <!-- Body -->
//         <div class="invoice-body">
//             <!-- Billing Information -->
//             <div class="billing-section">
//                 <div class="billing-card">
//                     <h3>Bill To</h3>
//                     <p class="highlight">${invoiceData.clientName}</p>
//                     <p>${invoiceData.clientEmail}</p>
//                     <p>${invoiceData.clientPhone}</p>
//                     ${invoiceData.companyName !== "N/A" ? `<p><strong>${invoiceData.companyName}</strong></p>` : ""}
//                 </div>
                
//                 <div class="billing-card">
//                     <h3>Project Details</h3>
// <p><strong>Order Date:</strong> ${invoiceData.createdAt}</p>                    <p><strong>Project ID:</strong> ${(quotation.id || "").substring(0, 8).toUpperCase()}</p>
//                     <p><strong>Status:</strong> Completed</p>
//                     <p><strong>Priority:</strong> ${quotation.priority || "Normal"}</p>
//                 </div>
//             </div>

//             <!-- Project Section -->
//             <div class="project-section">
//                 <h3 class="section-title">Project Information</h3>
                
//                 <div class="project-details">
//                     <div class="project-title">${invoiceData.projectTitle}</div>
//                     ${
//                       invoiceData.projectDescription !== "N/A"
//                         ? `
//                     <div class="project-description">
//                         <strong>Description:</strong> ${invoiceData.projectDescription}
//                     </div>
//                     `
//                         : ""
//                     }
                    
//                     <div class="specs-grid">
//                         <div class="spec-item">
//                             <div class="spec-label">Print Type</div>
//                             <div class="spec-value">${invoiceData.printType}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Paper Type</div>
//                             <div class="spec-value">${invoiceData.paperType}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Paper Size</div>
//                             <div class="spec-value">${invoiceData.paperSize}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Color Type</div>
//                             <div class="spec-value">${invoiceData.colorType}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Pages</div>
//                             <div class="spec-value">${invoiceData.pages}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Binding</div>
//                             <div class="spec-value">${invoiceData.bindingType}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Lamination</div>
//                             <div class="spec-value">${invoiceData.lamination}</div>
//                         </div>
//                         <div class="spec-item">
//                             <div class="spec-label">Quantity</div>
//                             <div class="spec-value">${invoiceData.quantity.toLocaleString()} units</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Items Table -->
//             <h3 class="section-title">Invoice Details</h3>
//             <table class="items-table">
//                 <thead>
//                     <tr>
//                         <th>Description</th>
//                         <th>Specifications</th>
//                         <th>Quantity</th>
//                         <th>Unit Price</th>
//                         <th>Amount</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td>
//                             <strong>${invoiceData.projectTitle}</strong><br>
//                             <small>${invoiceData.printType} Printing Service</small>
//                         </td>
//                         <td>
//                             ${invoiceData.paperSize} • ${invoiceData.colorType}<br>
//                             <small>${invoiceData.paperType} • ${invoiceData.pages} pages</small>
//                         </td>
//                         <td class="quantity">${invoiceData.quantity.toLocaleString()}</td>
//                         <td class="amount">₹${unitPrice.toFixed(2)}</td>
//                         <td class="amount">₹${subtotal.toLocaleString("en-IN")}</td>
//                     </tr>
//                 </tbody>
//             </table>

//             <!-- Totals -->
//             <div class="totals-section">
//                 <table class="totals-table">
//                     <tr>
//                         <td>Subtotal:</td>
//                         <td class="amount">₹${subtotal.toLocaleString("en-IN")}</td>
//                     </tr>
//                     <tr>
//                         <td>GST (${taxRate}%):</td>
//                         <td class="amount">₹${taxAmount.toLocaleString("en-IN")}</td>
//                     </tr>
//                     <tr class="total-row">
//                         <td>Total Amount:</td>
//                         <td class="amount">₹${totalAmount.toLocaleString("en-IN")}</td>
//                     </tr>
//                 </table>
//             </div>

//             <!-- Thank You -->
//             <div class="thank-you">
//                 Thank you for choosing GanpathiOverseas! 🙏
//             </div>

//             <!-- Payment Terms -->
//             <div class="payment-terms">
//                 <h4>Payment Terms & Conditions</h4>
//                 <ul>
//                     <li>Payment is due within 30 days of invoice date</li>
//                     <li>Late payments may incur additional charges</li>
//                     <li>All prices are inclusive of applicable taxes</li>
//                     <li>For any queries, please contact us at the above details</li>
//                 </ul>
//             </div>
//         </div>

//         <!-- Footer -->
//         <div class="footer">
//             <h4>GanpathiOverseas</h4>
//             <p>Professional Printing Services</p>
//             <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
//             <p>This is a computer-generated invoice and does not require a signature.</p>
//         </div>
//     </div>
// </body>
// </html>`;

//       // Create and download the HTML file
//       const blob = new Blob([invoiceHTML], { type: "text/html" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `GanpathiOverseas-Invoice-${invoiceNumber}-${new Date().toISOString().split("T")[0]}.html`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);

//       setTimeout(() => {
//         setDownloadingInvoice(null);
//         alert(
//           `Professional Invoice #${invoiceNumber} downloaded successfully!\n\nThe invoice is saved as an HTML file that can be:\n• Opened in any web browser\n• Printed directly\n• Converted to PDF\n• Shared via email`
//         );
//       }, 800);
//     } catch (error) {
//       console.error("Download error:", error);
//       setDownloadingInvoice(null);
//       alert("Failed to generate invoice. Please try again.");
//     }
//   };

//   const handleExportData = () => {
//     const headers = [
//       "ID",
//       "Client Name",
//       "Email",
//       "Phone",
//       "Company",
//       "Project Title",
//       "Print Type",
//       "Quantity",
//       "Status",
//       "Priority",
//       "Final Price",
//       "Created Date",
//     ];

//     const csvContent = [
//       headers.join(","),
//       ...quotations.map((q) =>
//         [
//           q.id,
//           `"${q.client_name}"`,
//           q.client_email,
//           q.client_phone || "",
//           `"${q.company_name || ""}"`,
//           `"${q.project_title}"`,
//           q.print_type,
//           q.quantity,
//           q.status || "pending",
//           q.priority || "normal",
//           q.final_price || "",
//           formatDate(q.created_at),
//         ].join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `quotations-export-${formatDate(new Date().toISOString()).replace(/\//g, "-")}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);

//     alert("Data exported successfully!");
//   };

//   const handleAddNewQuote = () => {
//     window.location.href = "/quotation";
//   };

//   const handleDeleteQuotation = async () => {
//     if (deletePasscode === "54321" && quotationToDelete) {
//       try {
//         await deleteQuotation(quotationToDelete);
//         setShowDeleteModal(false);
//         setDeletePasscode("");
//         setQuotationToDelete(null);
//         alert("Quotation deleted successfully!");
//       } catch (error) {
//         alert("Failed to delete quotation. Please try again.");
//       }
//     } else {
//       alert("Invalid passcode!");
//     }
//   };

//   // WITH THIS:
//   const markNotificationAsRead = (notificationId: string) => {
//     setNotifications((prev) => {
//       const updated = prev.map((n) =>
//         n.id === notificationId ? { ...n, read: true } : n
//       );
//       if (typeof window !== "undefined") {
//         localStorage.setItem("admin-notifications", JSON.stringify(updated));
//       }
//       return updated;
//     });
//   };

//   const unreadNotifications = notifications.filter((n) => !n.read).length;

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "success":
//         return "✅";
//       case "warning":
//         return "⚠️";
//       case "error":
//         return "❌";
//       default:
//         return "ℹ️";
//     }
//   };

//   const timeAgo = (timestamp: string) => {
//     const now = new Date();
//     const time = new Date(timestamp);
//     const diffInMinutes = Math.floor(
//       (now.getTime() - time.getTime()) / (1000 * 60)
//     );

//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//     return `${Math.floor(diffInMinutes / 1440)}d ago`;
//   };

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">
//             Loading Dashboard
//           </h2>
//           <p className="text-gray-500">
//             Please wait while we fetch your data from the database...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">
//             Database Connection Error
//           </h2>
//           <p className="text-gray-500 mb-4">{error}</p>
//           <Button onClick={() => window.location.reload()}>
//             Retry Connection
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Enhanced Navbar */}
//       <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
//                   <Building2 className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-semibold text-gray-900">
//                     GanpathiOverseas
//                   </h1>
//                   <p className="text-xs text-gray-500">Admin Dashboard</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="relative hidden md:block">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   placeholder="Search quotations..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 w-64 border-gray-200 bg-gray-50 focus:bg-white transition-colors"
//                 />
//               </div>

//               {/* Fixed Notifications */}
//               <div className="relative">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setShowNotifications(!showNotifications)}
//                   className="relative hover:bg-gray-50"
//                 >
//                   <Bell className="w-4 h-4 text-gray-600" />
//                   {unreadNotifications > 0 && (
//                     <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
//                       {unreadNotifications}
//                     </span>
//                   )}
//                 </Button>

//                 {showNotifications && (
//                   <div className="absolute right-0 top-12 w-80 bg-white rounded-lg border border-gray-100 shadow-lg z-50">
//                     <div className="p-4 border-b border-gray-100">
//                       <div className="flex justify-between items-center">
//                         <h3 className="font-medium text-gray-900">
//                           Notifications
//                         </h3>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => {
//                             // Mark all as read
//                             setNotifications((prev) =>
//                               prev.map((n) => ({ ...n, read: true }))
//                             );
//                           }}
//                           className="text-xs text-gray-500 hover:text-gray-700"
//                         >
//                           Mark all read
//                         </Button>
//                       </div>
//                       <p className="text-sm text-gray-500">
//                         {unreadNotifications} unread
//                       </p>
//                     </div>
//                     <div className="max-h-96 overflow-y-auto">
//                       {notifications.map((notification) => (
//                         <div
//                           key={notification.id}
//                           className={`p-4 border-b border-gray-50 hover:bg-gray-25 cursor-pointer transition-colors ${
//                             !notification.read ? "bg-blue-25" : ""
//                           }`}
//                           onClick={() =>
//                             markNotificationAsRead(notification.id)
//                           }
//                         >
//                           <div className="flex items-start gap-3">
//                             <div
//                               className={`w-2 h-2 rounded-full mt-2 ${
//                                 notification.type === "success"
//                                   ? "bg-green-500"
//                                   : notification.type === "warning"
//                                     ? "bg-amber-500"
//                                     : notification.type === "error"
//                                       ? "bg-red-500"
//                                       : "bg-blue-500"
//                               }`}
//                             />
//                             <div className="flex-1">
//                               <h4 className="font-medium text-gray-900 text-sm">
//                                 {notification.title}
//                               </h4>
//                               <p className="text-gray-600 text-sm">
//                                 {notification.message}
//                               </p>
//                               <p className="text-gray-400 text-xs mt-1">
//                                 {timeAgo(notification.timestamp)}
//                               </p>
//                             </div>
//                             {!notification.read && (
//                               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="border-gray-200 hover:bg-gray-50"
//               >
//                 <LogOut className="w-4 h-4 mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="container mx-auto px-4 py-8">
//         {/* Stats Grid - Updated with real data */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <Card className="border border-gray-100 bg-white hover:shadow-sm transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//               <CardTitle className="text-sm font-medium text-gray-700">
//                 Total Quotations
//               </CardTitle>
//               <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-gray-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//               <div className="text-2xl font-semibold text-gray-900">
//                 {stats.totalQuotations}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 +{stats.thisMonthQuotations} this month
//               </p>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-100 bg-white hover:shadow-sm transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//               <CardTitle className="text-sm font-medium text-gray-700">
//                 Pending Orders
//               </CardTitle>
//               <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
//                 <Clock className="h-4 w-4 text-amber-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//               <div className="text-2xl font-semibold text-gray-900">
//                 {stats.pendingQuotations}
//               </div>
//               <p className="text-xs text-gray-500">Awaiting review</p>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-100 bg-white hover:shadow-sm transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//               <CardTitle className="text-sm font-medium text-gray-700">
//                 Total Revenue
//               </CardTitle>
//               <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
//                 <IndianRupee className="h-4 w-4 text-green-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//               <div className="text-2xl font-semibold text-gray-900">
//                 ₹{stats.totalRevenue.toLocaleString("en-IN")}
//               </div>
//               <p className="text-xs text-gray-500">
//                 {stats.revenueGrowth > 0 ? "+" : ""}
//                 {stats.revenueGrowth.toFixed(1)}% growth
//               </p>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-100 bg-white hover:shadow-sm transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//               <CardTitle className="text-sm font-medium text-gray-700">
//                 Conversion Rate
//               </CardTitle>
//               <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
//                 <Target className="h-4 w-4 text-blue-600" />
//               </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//               <div className="text-2xl font-semibold text-gray-900">
//                 {stats.conversionRate.toFixed(1)}%
//               </div>
//               <p className="text-xs text-gray-500">
//                 {stats.completedQuotations} completed
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Additional Stats Row */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                 <Activity className="w-5 h-5" />
//                 Order Status Distribution
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Pending</span>
//                   <div className="flex items-center gap-2">
//                     <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-yellow-500 transition-all duration-500"
//                         style={{
//                           width: `${stats.totalQuotations > 0 ? (stats.pendingQuotations / stats.totalQuotations) * 100 : 0}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium">
//                       {stats.pendingQuotations}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">In Progress</span>
//                   <div className="flex items-center gap-2">
//                     <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-blue-500 transition-all duration-500"
//                         style={{
//                           width: `${stats.totalQuotations > 0 ? (stats.inProgressQuotations / stats.totalQuotations) * 100 : 0}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium">
//                       {stats.inProgressQuotations}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Completed</span>
//                   <div className="flex items-center gap-2">
//                     <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-green-500 transition-all duration-500"
//                         style={{
//                           width: `${stats.totalQuotations > 0 ? (stats.completedQuotations / stats.totalQuotations) * 100 : 0}%`,
//                         }}
//                       ></div>
//                     </div>
//                     <span className="text-sm font-medium">
//                       {stats.completedQuotations}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                 <BarChart3 className="w-5 h-5" />
//                 Revenue Insights
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">
//                       Avg Order Value
//                     </span>
//                     <span className="text-lg font-semibold text-gray-900">
//                       ₹{Math.round(stats.avgOrderValue).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">This Month</span>
//                     <span className="text-lg font-semibold text-gray-900">
//                       ₹{(stats.totalRevenue * 0.3).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Growth Rate</span>
//                     <span
//                       className={`text-lg font-semibold ${
//                         stats.revenueGrowth >= 0
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {stats.revenueGrowth >= 0 ? "+" : ""}
//                       {stats.revenueGrowth.toFixed(1)}%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                 <Award className="w-5 h-5" />
//                 Quick Actions
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button
//                 className="w-full bg-gray-900 hover:bg-gray-800 text-white"
//                 onClick={handleAddNewQuote}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add New Quote
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full border-gray-300"
//                 onClick={handleExportData}
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Export Data
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full border-gray-300"
//                 onClick={() => setShowReportsModal(true)}
//               >
//                 <LineChart className="w-4 h-4 mr-2" />
//                 View Analytics
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//         {/* Enhanced Quotations Table */}
//         <Card className="border border-gray-100 bg-white">
//           <CardHeader className="border-b border-gray-100 bg-gray-25 px-6 py-4">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <Receipt className="w-4 h-4 text-gray-600" />
//                 </div>
//                 <div>
//                   <CardTitle className="text-lg text-gray-900">
//                     Quotation Requests
//                   </CardTitle>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Manage all printing quotations
//                   </p>
//                 </div>
//                 <Badge className="bg-gray-100 text-gray-700 border-0">
//                   {filteredQuotations.length}
//                 </Badge>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className="w-40 border-gray-200 bg-white">
//                     <SelectValue placeholder="Filter status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="in-progress">In Progress</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                     <SelectItem value="cancelled">Cancelled</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => window.location.reload()}
//                   className="border-gray-200"
//                 >
//                   <TrendingUp className="w-4 h-4 mr-2" />
//                   Refresh
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-gray-50 border-b-2 border-gray-200">
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Client Info
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Project
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Specifications
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Status
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Priority
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Price
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Date
//                     </TableHead>
//                     <TableHead className="font-bold text-gray-800 px-6 py-4 text-left">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredQuotations.length > 0 ? (
//                     filteredQuotations.map((quotation) => (
//                       <TableRow
//                         key={quotation.id}
//                         className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
//                       >
//                         <TableCell className="px-6 py-4">
//                           <div className="space-y-1">
//                             <div className="font-semibold text-gray-900">
//                               {quotation.client_name}
//                             </div>
//                             <div className="text-sm text-gray-600 flex items-center gap-1">
//                               <Mail className="w-3 h-3" />
//                               {quotation.client_email}
//                             </div>
//                             {quotation.client_phone && (
//                               <div className="text-xs text-gray-500 flex items-center gap-1">
//                                 <Phone className="w-3 h-3" />
//                                 {quotation.client_phone}
//                               </div>
//                             )}
//                             {quotation.company_name && (
//                               <div className="text-xs text-gray-500 flex items-center gap-1">
//                                 <Building2 className="w-3 h-3" />
//                                 {quotation.company_name}
//                               </div>
//                             )}
//                           </div>
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           <div>
//                             <div className="font-semibold text-gray-900 mb-1">
//                               {quotation.project_title}
//                             </div>
//                             {quotation.project_description && (
//                               <div className="text-xs text-gray-500 line-clamp-2">
//                                 {quotation.project_description.substring(0, 50)}
//                                 ...
//                               </div>
//                             )}
//                           </div>
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           <div className="space-y-1">
//                             <Badge variant="outline" className="text-xs">
//                               <Printer className="w-3 h-3 mr-1" />
//                               {quotation.print_type}
//                             </Badge>
//                             <div className="text-xs text-gray-600">
//                               {quotation.paper_size} • {quotation.color_type}
//                             </div>
//                             <div className="text-xs font-semibold text-gray-900">
//                               {quotation.quantity.toLocaleString()} units
//                             </div>
//                           </div>
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           {getStatusBadge(quotation.status)}
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           {getPriorityBadge(quotation.priority)}
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           {editingPrice === quotation.id ? (
//                             <div className="flex gap-1">
//                               <div className="relative">
//                                 <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
//                                 <Input
//                                   type="number"
//                                   step="0.01"
//                                   value={newPrice}
//                                   onChange={(e) => setNewPrice(e.target.value)}
//                                   className="w-24 pl-6 text-xs h-8"
//                                   placeholder="0.00"
//                                 />
//                               </div>
//                               <Button
//                                 size="sm"
//                                 onClick={() =>
//                                   handlePriceUpdate(quotation.id, newPrice)
//                                 }
//                                 className="bg-green-600 hover:bg-green-700 text-white h-8 px-2"
//                               >
//                                 <CheckCircle className="w-3 h-3" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => setEditingPrice(null)}
//                                 className="h-8 px-2"
//                               >
//                                 <X className="w-3 h-3" />
//                               </Button>
//                             </div>
//                           ) : (
//                             <div className="flex items-center gap-1">
//                               <div>
//                                 <div className="flex items-center gap-1 font-semibold text-gray-900">
//                                   <IndianRupee className="w-3 h-3" />
//                                   <span className="text-sm">
//                                     {quotation.final_price
//                                       ? quotation.final_price.toLocaleString(
//                                           "en-IN"
//                                         )
//                                       : quotation.estimated_price
//                                         ? `~${quotation.estimated_price.toLocaleString("en-IN")}`
//                                         : "TBD"}
//                                   </span>
//                                 </div>
//                                 {!quotation.final_price &&
//                                   quotation.estimated_price && (
//                                     <span className="text-xs text-gray-500">
//                                       Est.
//                                     </span>
//                                   )}
//                               </div>
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => {
//                                   setEditingPrice(quotation.id);
//                                   setNewPrice(
//                                     quotation.final_price?.toString() ||
//                                       quotation.estimated_price?.toString() ||
//                                       ""
//                                   );
//                                 }}
//                                 className="h-6 w-6 p-0"
//                               >
//                                 <Edit className="w-3 h-3" />
//                               </Button>
//                             </div>
//                           )}
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           <div className="text-sm">
//                             <div className="font-medium text-gray-900">
//                               {formatDate(quotation.created_at)}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {formatTime(quotation.created_at)}
//                             </div>
//                           </div>
//                         </TableCell>

//                         <TableCell className="px-6 py-4">
//                           <div className="flex gap-2">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => setSelectedQuotation(quotation)}
//                               className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50"
//                             >
//                               <Eye className="w-3 h-3 mr-1" />
//                               View
//                             </Button>

//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => {
//                                 setQuotationToDelete(quotation.id);
//                                 setShowDeleteModal(true);
//                               }}
//                               className="h-8 px-3 text-xs border-gray-200 text-gray-600 hover:bg-red-25 hover:text-red-600 hover:border-red-200"
//                             >
//                               <Trash2 className="w-3 h-3" />
//                             </Button>

//                             <Select
//                               value={quotation.status || "pending"}
//                               onValueChange={(value) =>
//                                 handleStatusUpdate(quotation.id, value)
//                               }
//                             >
//                               <SelectTrigger className="w-24 h-8 text-xs border-gray-200">
//                                 <SelectValue />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="pending">Pending</SelectItem>
//                                 <SelectItem value="in-progress">
//                                   In Progress
//                                 </SelectItem>
//                                 <SelectItem value="completed">
//                                   Completed
//                                 </SelectItem>
//                                 <SelectItem value="cancelled">
//                                   Cancelled
//                                 </SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center py-12 px-6">
//                         <div className="flex flex-col items-center justify-center text-gray-500">
//                           <FileText className="w-12 h-12 text-gray-300 mb-4" />
//                           <h3 className="text-lg font-semibold text-gray-600 mb-2">
//                             No quotations found
//                           </h3>
//                           <p className="text-gray-400 mb-4">
//                             {searchTerm || statusFilter !== "all"
//                               ? "Try adjusting your search or filter criteria"
//                               : "Quotations will appear here once submitted"}
//                           </p>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//         {/* Delete Confirmation Modal */}
//         {showDeleteModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg max-w-md w-full p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
//                   <Trash2 className="w-6 h-6 text-red-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">
//                     Delete Quotation
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     This action cannot be undone
//                   </p>
//                 </div>
//               </div>

//               <p className="text-gray-600 mb-4">
//                 Please enter the admin passcode to confirm deletion:
//               </p>

//               <Input
//                 type="password"
//                 placeholder="Enter passcode"
//                 value={deletePasscode}
//                 onChange={(e) => setDeletePasscode(e.target.value)}
//                 className="mb-4"
//               />

//               <div className="flex gap-2 justify-end">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setDeletePasscode("");
//                     setQuotationToDelete(null);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleDeleteQuotation}
//                   className="bg-red-600 hover:bg-red-700 text-white"
//                 >
//                   Delete
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Enhanced Analytics Modal */}
//         {showReportsModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
//               <div className="sticky top-0 bg-gray-900 text-white p-6 rounded-t-lg">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     <LineChart className="w-8 h-8" />
//                     <div>
//                       <h2 className="text-2xl font-bold">
//                         Analytics Dashboard
//                       </h2>
//                       <p className="text-gray-300">
//                         Comprehensive business insights and reports
//                       </p>
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     onClick={() => setShowReportsModal(false)}
//                     className="text-white hover:bg-white/20"
//                   >
//                     <X className="w-6 h-6" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {/* Key Metrics Row */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                   <Card className="text-center p-4">
//                     <div className="text-3xl font-bold text-blue-600">
//                       {stats.totalQuotations}
//                     </div>
//                     <div className="text-sm text-gray-600">Total Orders</div>
//                   </Card>
//                   <Card className="text-center p-4">
//                     <div className="text-3xl font-bold text-green-600">
//                       ₹{Math.round(stats.avgOrderValue).toLocaleString("en-IN")}
//                     </div>
//                     <div className="text-sm text-gray-600">Avg Order Value</div>
//                   </Card>
//                   <Card className="text-center p-4">
//                     <div className="text-3xl font-bold text-purple-600">
//                       {stats.conversionRate.toFixed(1)}%
//                     </div>
//                     <div className="text-sm text-gray-600">Conversion Rate</div>
//                   </Card>
//                   <Card className="text-center p-4">
//                     <div className="text-3xl font-bold text-orange-600">
//                       {stats.revenueGrowth.toFixed(1)}%
//                     </div>
//                     <div className="text-sm text-gray-600">Growth Rate</div>
//                   </Card>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Revenue Chart */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <BarChart3 className="w-5 h-5" />
//                         Monthly Revenue Trend
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-4">
//                         {chartData.map((month, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between"
//                           >
//                             <span className="text-sm font-medium text-gray-700">
//                               {month.month}
//                             </span>
//                             <div className="flex items-center gap-3 flex-1 ml-4">
//                               <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
//                                 <div
//                                   className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
//                                   style={{
//                                     width: `${chartData.length > 0 ? (month.revenue / Math.max(...chartData.map((d) => d.revenue))) * 100 : 0}%`,
//                                   }}
//                                 ></div>
//                               </div>
//                               <span className="text-sm font-semibold text-gray-900 w-20 text-right">
//                                 ₹{(month.revenue / 1000).toFixed(0)}K
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Order Volume Chart */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <LineChart className="w-5 h-5" />
//                         Order Volume Trend
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-4">
//                         {chartData.map((month, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between"
//                           >
//                             <span className="text-sm font-medium text-gray-700">
//                               {month.month}
//                             </span>
//                             <div className="flex items-center gap-3 flex-1 ml-4">
//                               <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
//                                 <div
//                                   className="h-full bg-gradient-to-r from-green-500 to-teal-600 rounded-full transition-all duration-1000"
//                                   style={{
//                                     width: `${chartData.length > 0 ? (month.quotations / Math.max(...chartData.map((d) => d.quotations))) * 100 : 0}%`,
//                                   }}
//                                 ></div>
//                               </div>
//                               <span className="text-sm font-semibold text-gray-900 w-12 text-right">
//                                 {month.quotations}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Client Analysis */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <Users className="w-5 h-5" />
//                         Top Clients
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {Object.entries(
//                           quotations.reduce(
//                             (acc, q) => {
//                               acc[q.client_name] =
//                                 (acc[q.client_name] || 0) + 1;
//                               return acc;
//                             },
//                             {} as Record<string, number>
//                           )
//                         )
//                           .sort(([, a], [, b]) => b - a)
//                           .slice(0, 5)
//                           .map(([name, count], index) => (
//                             <div
//                               key={name}
//                               className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
//                                   {name.charAt(0)}
//                                 </div>
//                                 <span className="font-medium text-gray-900">
//                                   {name}
//                                 </span>
//                               </div>
//                               <Badge variant="outline">{count} orders</Badge>
//                             </div>
//                           ))}
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Print Type Analysis */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <PieChart className="w-5 h-5" />
//                         Popular Print Types
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         {Object.entries(
//                           quotations.reduce(
//                             (acc, q) => {
//                               acc[q.print_type] = (acc[q.print_type] || 0) + 1;
//                               return acc;
//                             },
//                             {} as Record<string, number>
//                           )
//                         )
//                           .sort(([, a], [, b]) => b - a)
//                           .map(([type, count], index) => (
//                             <div
//                               key={type}
//                               className="flex items-center justify-between"
//                             >
//                               <span className="text-sm font-medium text-gray-700 capitalize">
//                                 {type.replace("-", " ")}
//                               </span>
//                               <div className="flex items-center gap-3 flex-1 ml-4">
//                                 <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
//                                   <div
//                                     className={`h-full rounded-full transition-all duration-1000 ${
//                                       index === 0
//                                         ? "bg-blue-500"
//                                         : index === 1
//                                           ? "bg-green-500"
//                                           : "bg-orange-500"
//                                     }`}
//                                     style={{
//                                       width: `${
//                                         Object.values(
//                                           quotations.reduce(
//                                             (acc, q) => {
//                                               acc[q.print_type] =
//                                                 (acc[q.print_type] || 0) + 1;
//                                               return acc;
//                                             },
//                                             {} as Record<string, number>
//                                           )
//                                         ).length > 0
//                                           ? (count /
//                                               Math.max(
//                                                 ...Object.values(
//                                                   quotations.reduce(
//                                                     (acc, q) => {
//                                                       acc[q.print_type] =
//                                                         (acc[q.print_type] ||
//                                                           0) + 1;
//                                                       return acc;
//                                                     },
//                                                     {} as Record<string, number>
//                                                   )
//                                                 )
//                                               )) *
//                                             100
//                                           : 0
//                                       }%`,
//                                     }}
//                                   ></div>
//                                 </div>
//                                 <span className="text-sm font-semibold text-gray-900 w-8 text-right">
//                                   {count}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 <div className="mt-6 text-center">
//                   <Button
//                     onClick={() => setShowReportsModal(false)}
//                     className="bg-gray-900 hover:bg-gray-800 text-white"
//                   >
//                     Close Analytics
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Quotation Detail Modal - Simplified for database integration */}
//         {selectedQuotation && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
//               <div className="sticky top-0 bg-gray-900 text-white p-6 rounded-t-lg">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
//                       <FileText className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <h2 className="text-2xl font-bold">Quotation Details</h2>
//                       <p className="text-gray-300">
//                         ID: {selectedQuotation.id.substring(0, 8)}
//                       </p>
//                     </div>
//                     <div className="flex gap-2">
//                       {getStatusBadge(selectedQuotation.status)}
//                       {getPriorityBadge(selectedQuotation.priority)}
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     onClick={() => setSelectedQuotation(null)}
//                     className="text-white hover:bg-white/20 rounded-full p-2"
//                   >
//                     <X className="w-6 h-6" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Client Information */}
//                   <Card className="border-gray-200">
//                     <CardHeader className="bg-gray-50 rounded-t-lg">
//                       <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                         <UserCircle className="w-5 h-5" />
//                         Client Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="pt-4">
//                       <div className="space-y-3">
//                         <div>
//                           <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                             {selectedQuotation.client_name}
//                           </h3>
//                           <div className="space-y-2">
//                             <div className="flex items-center gap-2 text-gray-600">
//                               <Mail className="w-4 h-4" />
//                               <span>{selectedQuotation.client_email}</span>
//                             </div>
//                             {selectedQuotation.client_phone && (
//                               <div className="flex items-center gap-2 text-gray-600">
//                                 <Phone className="w-4 h-4" />
//                                 <span>{selectedQuotation.client_phone}</span>
//                               </div>
//                             )}
//                             {selectedQuotation.company_name && (
//                               <div className="flex items-center gap-2 text-gray-600">
//                                 <Building2 className="w-4 h-4" />
//                                 <span>{selectedQuotation.company_name}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Project Details */}
//                   <Card className="border-gray-200">
//                     <CardHeader className="bg-gray-50 rounded-t-lg">
//                       <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                         <FileText className="w-5 h-5" />
//                         Project Details
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="pt-4">
//                       <div className="space-y-4">
//                         <div>
//                           <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                             {selectedQuotation.project_title}
//                           </h3>
//                           {selectedQuotation.project_description && (
//                             <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
//                               {selectedQuotation.project_description}
//                             </p>
//                           )}
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <div className="flex items-center gap-2 text-gray-600 mb-1">
//                               <Calendar className="w-4 h-4" />
//                               <span className="text-sm font-medium">
//                                 Created
//                               </span>
//                             </div>
//                             <p className="font-semibold text-gray-900">
//                               {formatDate(selectedQuotation.created_at)}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {formatTime(selectedQuotation.created_at)}
//                             </p>
//                           </div>
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             <div className="flex items-center gap-2 text-gray-600 mb-1">
//                               <Star className="w-4 h-4" />
//                               <span className="text-sm font-medium">
//                                 Priority
//                               </span>
//                             </div>
//                             {getPriorityBadge(selectedQuotation.priority)}
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Print Specifications */}
//                 <Card className="mt-6 border-gray-200">
//                   <CardHeader className="bg-gray-50 rounded-t-lg">
//                     <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                       <Printer className="w-5 h-5" />
//                       Print Specifications
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="pt-4">
//                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                       {[
//                         {
//                           label: "Print Type",
//                           value: selectedQuotation.print_type,
//                           icon: Printer,
//                         },
//                         {
//                           label: "Paper Type",
//                           value: selectedQuotation.paper_type,
//                           icon: FileText,
//                         },
//                         {
//                           label: "Paper Size",
//                           value: selectedQuotation.paper_size,
//                           icon: ArrowUpDown,
//                         },
//                         {
//                           label: "Color Type",
//                           value: selectedQuotation.color_type,
//                           icon: PieChart,
//                         },
//                         {
//                           label: "Quantity",
//                           value: `${selectedQuotation.quantity} units`,
//                           icon: Target,
//                         },
//                         {
//                           label: "Pages",
//                           value: selectedQuotation.pages || 1,
//                           icon: FileText,
//                         },
//                         {
//                           label: "Binding",
//                           value: selectedQuotation.binding_type || "None",
//                           icon: FileText,
//                         },
//                         {
//                           label: "Lamination",
//                           value: selectedQuotation.lamination || "None",
//                           icon: FileText,
//                         },
//                       ].map((spec, index) => (
//                         <div
//                           key={index}
//                           className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
//                         >
//                           <div className="flex items-center gap-2 text-gray-600 mb-1">
//                             <spec.icon className="w-4 h-4" />
//                             <span className="text-sm font-medium">
//                               {spec.label}
//                             </span>
//                           </div>
//                           <p className="font-semibold text-gray-900 capitalize">
//                             {spec.value.toString().replace("-", " ")}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Pricing and Notes */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//                   {/* Pricing */}
//                   <Card className="border-gray-200">
//                     <CardHeader className="bg-gray-50 rounded-t-lg">
//                       <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                         <IndianRupee className="w-5 h-5" />
//                         Pricing
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="pt-4 space-y-4">
//                       <div className="space-y-3">
//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <span className="text-sm text-gray-600">
//                             Estimated Price
//                           </span>
//                           <p className="text-lg font-semibold flex items-center text-gray-900">
//                             <IndianRupee className="w-4 h-4 mr-1" />
//                             {selectedQuotation.estimated_price?.toLocaleString(
//                               "en-IN"
//                             ) || "TBD"}
//                           </p>
//                         </div>

//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <span className="text-sm text-gray-600 font-medium">
//                             Final Price
//                           </span>
//                           <div className="flex items-center gap-2">
//                             <p className="text-xl font-bold flex items-center text-gray-900">
//                               <IndianRupee className="w-5 h-5 mr-1" />
//                               {selectedQuotation.final_price?.toLocaleString(
//                                 "en-IN"
//                               ) || "Not set"}
//                             </p>
//                             {!selectedQuotation.final_price && (
//                               <Badge
//                                 variant="outline"
//                                 className="border-gray-300 text-gray-600"
//                               >
//                                 Pending
//                               </Badge>
//                             )}
//                           </div>
//                         </div>

//                         <div className="bg-gray-50 p-3 rounded-lg">
//                           <span className="text-sm text-gray-600 font-medium">
//                             Invoice Status
//                           </span>
//                           <div className="mt-1">
//                             {selectedQuotation.invoice_number ? (
//                               <Badge className="bg-gray-900 text-white">
//                                 #{selectedQuotation.invoice_number}
//                               </Badge>
//                             ) : (
//                               <Badge
//                                 variant="outline"
//                                 className="border-gray-300 text-gray-600"
//                               >
//                                 Not generated
//                               </Badge>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Price Update Section */}
//                       {!selectedQuotation.final_price && (
//                         <div className="space-y-2">
//                           <div className="relative">
//                             <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//                             <Input
//                               type="number"
//                               step="0.01"
//                               value={newPrice}
//                               onChange={(e) => setNewPrice(e.target.value)}
//                               className="pl-8 border-gray-300"
//                               placeholder="Enter final price"
//                             />
//                           </div>
//                           <Button
//                             onClick={() =>
//                               handlePriceUpdate(selectedQuotation.id, newPrice)
//                             }
//                             disabled={!newPrice.trim()}
//                             className="w-full bg-gray-900 hover:bg-gray-800 text-white"
//                           >
//                             <CheckCircle className="w-4 h-4 mr-2" />
//                             Set Final Price
//                           </Button>
//                         </div>
//                       )}

//                       {/* Invoice Actions */}
//                       {selectedQuotation.invoice_number ? (
//                         <div className="space-y-3 mt-4">
//                           <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                             <div className="flex items-center gap-2 mb-2">
//                               <CheckCircle className="w-4 h-4 text-green-600" />
//                               <span className="text-sm font-medium text-green-800">
//                                 Invoice Generated
//                               </span>
//                             </div>
//                             <p className="text-sm text-green-700">
//                               Invoice #{selectedQuotation.invoice_number} is
//                               ready for download
//                             </p>
//                           </div>

//                           <Button
//                             onClick={() =>
//                               handleDownloadInvoice(
//                                 selectedQuotation.id,
//                                 selectedQuotation.invoice_number
//                               )
//                             }
//                             disabled={
//                               downloadingInvoice === selectedQuotation.id
//                             }
//                             className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
//                           >
//                             {downloadingInvoice === selectedQuotation.id ? (
//                               <>
//                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                 Generating Download...
//                               </>
//                             ) : (
//                               <>
//                                 <FileDown className="w-4 h-4 mr-2" />
//                                 Download Invoice
//                               </>
//                             )}
//                           </Button>

//                           {/* Quick Download Alternative */}
//                           <Button
//                             variant="outline"
//                             onClick={() => {
//                               try {
//                                 const quickContent = `INVOICE #${selectedQuotation.invoice_number}\n\nClient: ${selectedQuotation.client_name}\nProject: ${selectedQuotation.project_title}\nAmount: ₹${selectedQuotation.final_price?.toLocaleString("en-IN") || "0"}\nDate: ${new Date().toLocaleDateString("en-IN")}`;

//                                 const element = document.createElement("a");
//                                 element.setAttribute(
//                                   "href",
//                                   `data:text/plain;charset=utf-8,${encodeURIComponent(quickContent)}`
//                                 );
//                                 element.setAttribute(
//                                   "download",
//                                   `Quick-Invoice-${selectedQuotation.invoice_number}.txt`
//                                 );
//                                 element.style.display = "none";
//                                 document.body.appendChild(element);
//                                 element.click();
//                                 document.body.removeChild(element);

//                                 alert("Quick invoice downloaded!");
//                               } catch (error) {
//                                 alert(
//                                   "Download failed. Please try the main download button."
//                                 );
//                               }
//                             }}
//                             className="w-full border-gray-200 hover:bg-gray-50 transition-colors"
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             Quick Download (Simple)
//                           </Button>
//                         </div>
//                       ) : (
//                         // Show generate invoice button if no invoice exists
//                         selectedQuotation.final_price &&
//                         selectedQuotation.status === "completed" && (
//                           <Button
//                             onClick={() =>
//                               handleGenerateInvoice(selectedQuotation.id)
//                             }
//                             className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-4"
//                           >
//                             <Receipt className="w-4 h-4 mr-2" />
//                             Generate Invoice
//                           </Button>
//                         )
//                       )}
//                     </CardContent>
//                   </Card>

//                   {/* Notes Section */}
//                   <Card className="border-gray-200">
//                     <CardHeader className="bg-gray-50 rounded-t-lg">
//                       <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
//                         <MessageSquare className="w-5 h-5" />
//                         Notes & Communication
//                         <Badge className="ml-2 bg-gray-100 text-gray-700">
//                           {getQuotationNotes(selectedQuotation.id).length} Notes
//                         </Badge>
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="pt-4">
//                       <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
//                         {getQuotationNotes(selectedQuotation.id).length > 0 ? (
//                           getQuotationNotes(selectedQuotation.id).map(
//                             (note, index) => (
//                               <div
//                                 key={note.id}
//                                 className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 hover:shadow-sm transition-all duration-200"
//                               >
//                                 <p className="text-gray-900 mb-2">
//                                   {note.note}
//                                 </p>
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
//                                     <UserCircle className="w-4 h-4 text-white" />
//                                   </div>
//                                   <span className="text-xs text-gray-600 font-medium">
//                                     {note.created_by}
//                                   </span>
//                                   <span className="text-xs text-gray-400">
//                                     •{" "}
//                                     {note.created_at
//                                       ? new Date(
//                                           note.created_at
//                                         ).toLocaleString()
//                                       : "N/A"}
//                                   </span>
//                                 </div>
//                               </div>
//                             )
//                           )
//                         ) : (
//                           <div className="text-center py-8 text-gray-500">
//                             <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
//                             <p>No notes yet</p>
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex flex-col gap-3 mt-4 border-t pt-4">
//                         <Textarea
//                           placeholder="Add a note about this quotation..."
//                           value={newNote}
//                           onChange={(e) => setNewNote(e.target.value)}
//                           className="min-h-[80px] border-gray-300 resize-none"
//                           rows={3}
//                         />
//                         <Button
//                           onClick={() => handleAddNote(selectedQuotation.id)}
//                           disabled={!newNote.trim()}
//                           className="self-start bg-gray-900 hover:bg-gray-800 text-white"
//                         >
//                           <Send className="w-4 h-4 mr-2" />
//                           Add Note
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
//                   <Button
//                     onClick={() =>
//                       alert(
//                         `Sending email to ${selectedQuotation.client_email}`
//                       )
//                     }
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     <Mail className="w-4 h-4 mr-2" />
//                     Send Email
//                   </Button>
//                   <Button
//                     onClick={() =>
//                       window.open(`tel:${selectedQuotation.client_phone}`)
//                     }
//                     variant="outline"
//                     className="border-gray-300"
//                     disabled={!selectedQuotation.client_phone}
//                   >
//                     <Phone className="w-4 h-4 mr-2" />
//                     Call Client
//                   </Button>
//                   <Button
//                     onClick={() => setSelectedQuotation(null)}
//                     variant="outline"
//                     className="border-gray-300 ml-auto"
//                   >
//                     Close
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// components/admin/AdminDashboard.tsx
// components/admin/AdminDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import custom hooks and types
import { useQuotations } from "@/hooks/useQuotations";
import {
  QuotationRequest,
  QuotationNote,
  DashboardStats as DashboardStatsType,
  ChartData,
  Notification,
} from "@/types/database";

// Import modular components
import DashboardNavbar from "./admin/DashboardNavbar";
import DashboardStatsComponent from "./admin/DashboardStats";
import QuotationsTable from "./admin/QuotationsTable";
import QuotationDetailModal from "./admin/QuotationDetailModal";

export default function EnhancedAdminDashboard() {
  // Use custom hook for database operations
  const {
    quotations,
    notes,
    loading,
    error,
    updateQuotationStatus,
    updateQuotationPrice,
    addNote,
    generateInvoice,
    deleteQuotation,
  } = useQuotations();

  // State for notifications (mock data - replace with real API)
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-notifications");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      {
        id: "1",
        title: "New Quotation Request",
        message: "A new quotation request has been submitted",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
      {
        id: "2",
        title: "Payment Received",
        message: "Payment received for recent order",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
      },
    ];
  });

  // Dashboard statistics state
  const [stats, setStats] = useState<DashboardStatsType>({
    totalQuotations: 0,
    pendingQuotations: 0,
    completedQuotations: 0,
    inProgressQuotations: 0,
    cancelledQuotations: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    thisMonthQuotations: 0,
    lastMonthQuotations: 0,
    revenueGrowth: 0,
    conversionRate: 0,
  });

  // Chart data for analytics
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // UI state
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate dashboard statistics from real data
  useEffect(() => {
    if (quotations.length > 0) {
      calculateStats(quotations);
      generateChartData();
    }
  }, [quotations]);

  // Function to calculate statistics
  const calculateStats = (data: QuotationRequest[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalQuotations = data.length;
    const pendingQuotations = data.filter((q) => q.status === "pending").length;
    const completedQuotations = data.filter((q) => q.status === "completed").length;
    const inProgressQuotations = data.filter((q) => q.status === "in-progress").length;
    const cancelledQuotations = data.filter((q) => q.status === "cancelled").length;

    const totalRevenue = data
      .filter((q) => q.final_price && q.status === "completed")
      .reduce((sum, q) => sum + (q.final_price || 0), 0);

    const avgOrderValue = completedQuotations > 0 ? totalRevenue / completedQuotations : 0;

    const thisMonthQuotations = data.filter(
      (q) => q.created_at && new Date(q.created_at) >= thisMonth
    ).length;

    const lastMonthQuotations = data.filter(
      (q) =>
        q.created_at &&
        new Date(q.created_at) >= lastMonth &&
        new Date(q.created_at) <= endOfLastMonth
    ).length;

    const revenueGrowth =
      lastMonthQuotations > 0
        ? ((thisMonthQuotations - lastMonthQuotations) / lastMonthQuotations) * 100
        : 0;

    const conversionRate = totalQuotations > 0 ? (completedQuotations / totalQuotations) * 100 : 0;

    setStats({
      totalQuotations,
      pendingQuotations,
      completedQuotations,
      inProgressQuotations,
      cancelledQuotations,
      totalRevenue,
      avgOrderValue,
      thisMonthQuotations,
      lastMonthQuotations,
      revenueGrowth,
      conversionRate,
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

      const monthQuotations = quotations.filter((q) => {
        if (!q.created_at) return false;
        const createdDate = new Date(q.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      const monthRevenue = monthQuotations
        .filter((q) => q.final_price && q.status === "completed")
        .reduce((sum, q) => sum + (q.final_price || 0), 0);

      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        quotations: monthQuotations.length,
        revenue: monthRevenue,
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
        localStorage.setItem("admin-notifications", JSON.stringify(updated));
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Please wait while we fetch your data from the database...</p>
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Database Connection Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry Connection</Button>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <DashboardNavbar
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Statistics */}
        <DashboardStatsComponent stats={stats} chartData={chartData} />

        {/* Quotations Table */}
        <QuotationsTable
          quotations={quotations}
          notes={notes}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          updateQuotationStatus={updateQuotationStatus}
          updateQuotationPrice={updateQuotationPrice}
          addNote={addNote}
          generateInvoice={generateInvoice}
          deleteQuotation={deleteQuotation}
          setSelectedQuotation={setSelectedQuotation}
        />

        {/* Quotation Detail Modal */}
        {selectedQuotation && (
          <QuotationDetailModal
            quotation={selectedQuotation}
            notes={notes}
            onClose={() => setSelectedQuotation(null)}
            updateQuotationPrice={updateQuotationPrice}
            addNote={addNote}
            generateInvoice={generateInvoice}
          />
        )}
      </div>
    </div>
  );
}