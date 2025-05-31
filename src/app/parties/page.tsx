"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Banknote,
  TrendingUp,
  TrendingDown,
  Search,
  IndianRupee,
  ShoppingCart,
  Receipt,
  CreditCard,
  History,
  BarChart3,
  PieChart,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Pie,
} from "recharts";
import { PartyTransactionManagement } from "@/components/party-transaction-management";

interface Party {
  id: number;
  name: string;
  balance: number;
  created_at: string;
  total_orders?: number;
  total_amount_paid?: number;
  last_transaction_date?: string;
}

interface Transaction {
  id: number;
  party_id: number;
  party_name: string;
  type: "payment" | "order" | "adjustment";
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
}

export default function PartiesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [parties, setParties] = useState<Party[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [deletePartyId, setDeletePartyId] = useState<number | null>(null);
  const [newPartyName, setNewPartyName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const SECURE_PASSWORD = "admin@123";

  // Load data from API instead of mock data
  useEffect(() => {
    if (isAuthenticated) {
      loadPartiesData();
    }
  }, [isAuthenticated]);

  const loadPartiesData = async () => {
    setIsLoading(true);
    try {
      // Fetch parties
      const partiesResponse = await fetch("/api/parties");
      if (partiesResponse.ok) {
        const partiesData = await partiesResponse.json();
        setParties(partiesData);
      }

      // Fetch transactions
      const transactionsResponse = await fetch("/api/parties/transactions");
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage?.getItem("partiesAuth");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECURE_PASSWORD) {
      setIsAuthenticated(true);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("partiesAuth", "true");
      }
      setError(null);
    } else {
      setError("Incorrect password!");
    }
  };

  const handleAddParty = async () => {
    if (!newPartyName.trim()) {
      setError("Party name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPartyName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add party");
      }

      setShowAddDialog(false);
      setNewPartyName("");
      setError(null);
      await loadPartiesData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParty = async () => {
    if (!editingParty || !editingParty.name.trim()) {
      setError("Party name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/parties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingParty),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update party");
      }

      setShowEditDialog(false);
      setEditingParty(null);
      setError(null);
      await loadPartiesData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParty = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parties?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete party");
      }

      setDeletePartyId(null);
      await loadPartiesData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedParty || !paymentAmount) {
      setError("Please fill all required fields");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/parties/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: selectedParty.id,
          type: "payment",
          amount: amount,
          description: paymentDescription || `Payment received - ₹${amount}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add payment");
      }

      setShowPaymentDialog(false);
      setSelectedParty(null);
      setPaymentAmount("");
      setPaymentDescription("");
      setError(null);
      await loadPartiesData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrder = async () => {
    if (!selectedParty || !orderAmount) {
      setError("Please fill all required fields");
      return;
    }

    const amount = parseFloat(orderAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/parties/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: selectedParty.id,
          type: "order",
          amount: amount,
          description: orderDescription || `Order - ₹${amount}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add order");
      }

      setShowOrderDialog(false);
      setSelectedParty(null);
      setOrderAmount("");
      setOrderDescription("");
      setError(null);
      await loadPartiesData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add order");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate derived data from transactions
  const orderTransactions = transactions.filter((t) => t.type === "order");
  const paymentTransactions = transactions.filter((t) => t.type === "payment");

  const totalBalance = parties.reduce(
    (sum, party) => sum + (party.balance || 0),
    0
  );
  const partiesInDebt = parties.filter((party) => party.balance > 0).length;
  const partiesInCredit = parties.filter((party) => party.balance < 0).length;

  // Calculate totals from transactions instead of separate orders
  const totalOrders = orderTransactions.length;
  const totalRevenue = paymentTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const totalOrderValue = orderTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  // Chart data
  const balanceChartData = parties.map((party) => ({
    name: party.name.substring(0, 10) + (party.name.length > 10 ? "..." : ""),
    balance: party.balance,
    orders: party.total_orders || 0,
  }));

  const pieChartData = [
    { name: "Outstanding", value: partiesInDebt, color: "#ef4444" },
    { name: "Advance", value: partiesInCredit, color: "#22c55e" },
    {
      name: "Settled",
      value: parties.filter((p) => p.balance === 0).length,
      color: "#6b7280",
    },
  ];

  const recentTransactions = transactions
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // Add this function to get party-specific statistics
  const getPartyStats = (partyId: number) => {
    const partyTransactions = transactions.filter(
      (t) => t.party_id === partyId
    );
    const partyOrders = partyTransactions.filter((t) => t.type === "order");
    const partyPayments = partyTransactions.filter((t) => t.type === "payment");

    return {
      totalOrders: partyOrders.length,
      totalOrderValue: partyOrders.reduce((sum, t) => sum + t.amount, 0),
      totalPayments: partyPayments.reduce((sum, t) => sum + t.amount, 0),
      lastTransactionDate:
        partyTransactions.length > 0
          ? Math.max(
              ...partyTransactions.map((t) => new Date(t.created_at).getTime())
            )
          : null,
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Party Balance Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="mt-1"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full">
                Access Party Management
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              Party Balance Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage parties, track orders, and handle payments
            </p>
          </div>
          <Button onClick={() => router.push("/admin/job-sheet-form")}>
            Back to Job Sheets
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="transaction-mgmt">Transaction Mgmt</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Updated Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Parties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {parties.length}
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Net Outstanding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ₹{Math.abs(totalBalance).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalBalance >= 0 ? "In Favor" : "Outstanding"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {totalOrders}
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{totalOrderValue.toFixed(2)} value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    From {paymentTransactions.length} payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Party Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Outstanding:</span>
                      <span className="font-medium">{partiesInDebt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Advance:</span>
                      <span className="font-medium">{partiesInCredit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-semibold mb-2">Add Payment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Record payment received from party
                  </p>
                  <Select
                    onValueChange={(value) => {
                      const party = parties.find(
                        (p) => p.id.toString() === value
                      );
                      if (party) {
                        setSelectedParty(party);
                        setShowPaymentDialog(true);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Party" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="font-semibold mb-2">New Order</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create order and deduct from balance
                  </p>
                  <Select
                    onValueChange={(value) => {
                      const party = parties.find(
                        (p) => p.id.toString() === value
                      );
                      if (party) {
                        setSelectedParty(party);
                        setShowOrderDialog(true);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Party" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="font-semibold mb-2">Add Party</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Register new party for business
                  </p>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Party
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "payment"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "order"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {transaction.type === "payment" ? (
                            <CreditCard className="w-4 h-4" />
                          ) : transaction.type === "order" ? (
                            <ShoppingCart className="w-4 h-4" />
                          ) : (
                            <Receipt className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.party_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "payment"
                              ? "text-green-600"
                              : transaction.type === "order"
                                ? "text-blue-600"
                                : "text-orange-600"
                          }`}
                        >
                          {transaction.type === "payment"
                            ? "+"
                            : transaction.type === "order"
                              ? "-"
                              : "±"}
                          ₹{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            transaction.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parties" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Parties</CardTitle>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search parties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Party
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredParties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {parties.length === 0
                      ? "No parties found. Add your first party to get started."
                      : "No parties match your search criteria."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Party Name</TableHead>
                        <TableHead>Current Balance</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Order Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Transaction</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParties.map((party) => {
                        const stats = getPartyStats(party.id);
                        return (
                          <TableRow key={party.id}>
                            <TableCell className="font-medium">
                              {party.name}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  party.balance > 0
                                    ? "text-red-600"
                                    : party.balance < 0
                                      ? "text-green-600"
                                      : "text-gray-600"
                                }`}
                              >
                                ₹{Math.abs(party.balance).toFixed(2)}
                                {party.balance > 0
                                  ? " (Owe us)"
                                  : party.balance < 0
                                    ? " (We owe)"
                                    : ""}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {stats.totalOrders}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-blue-600">
                                ₹{stats.totalOrderValue.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  party.balance > 0
                                    ? "destructive"
                                    : party.balance < 0
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {party.balance > 0
                                  ? "Outstanding"
                                  : party.balance < 0
                                    ? "Advance"
                                    : "Settled"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {stats.lastTransactionDate
                                ? new Date(
                                    stats.lastTransactionDate
                                  ).toLocaleDateString()
                                : "No transactions"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedParty(party);
                                    setShowPaymentDialog(true);
                                  }}
                                  title="Add Payment"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedParty(party);
                                    setShowOrderDialog(true);
                                  }}
                                  title="Create Order"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingParty(party);
                                    setShowEditDialog(true);
                                  }}
                                  title="Edit Party"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletePartyId(party.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Party"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  All Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.party_name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "payment"
                                  ? "default"
                                  : transaction.type === "order"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {transaction.type.charAt(0).toUpperCase() +
                                transaction.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                transaction.amount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.amount >= 0 ? "+" : ""}₹
                              {Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${
                                transaction.balance_after > 0
                                  ? "text-red-600"
                                  : transaction.balance_after < 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                              }`}
                            >
                              ₹{Math.abs(transaction.balance_after).toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transaction-mgmt" className="space-y-6">
            <PartyTransactionManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Party Balance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={balanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `₹${value}`,
                          name === "balance" ? "Balance" : "Orders",
                        ]}
                      />
                      <Bar dataKey="balance" fill="#3b82f6" name="balance" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Party Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Top Outstanding Parties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parties
                      .filter((p) => p.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 5)
                      .map((party) => (
                        <div
                          key={party.id}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">{party.name}</span>
                          <span className="text-red-600 font-semibold">
                            ₹{party.balance.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Advance Parties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parties
                      .filter((p) => p.balance < 0)
                      .sort((a, b) => a.balance - b.balance)
                      .slice(0, 5)
                      .map((party) => (
                        <div
                          key={party.id}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">{party.name}</span>
                          <span className="text-green-600 font-semibold">
                            ₹{Math.abs(party.balance).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-semibold">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Value:</span>
                      <span className="font-semibold text-blue-600">
                        ₹{totalOrderValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold text-green-600">
                        ₹{totalRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Outstanding:</span>
                      <span
                        className={`font-semibold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ₹{Math.abs(totalBalance).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Parties:</span>
                      <span className="font-semibold">
                        {parties.filter((p) => p.balance !== 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Party Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Create a new party for business transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-party-name">Party Name</Label>
                <Input
                  id="new-party-name"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  placeholder="Enter party name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPartyName.trim()) {
                      handleAddParty();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewPartyName("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddParty} disabled={!newPartyName.trim()}>
                Add Party
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Party Dialog */}
        <Dialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingParty(null);
              setError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Party</DialogTitle>
              <DialogDescription>
                Update party details and balance.
              </DialogDescription>
            </DialogHeader>
            {editingParty && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-party-name">Party Name</Label>
                  <Input
                    id="edit-party-name"
                    value={editingParty.name}
                    onChange={(e) =>
                      setEditingParty({ ...editingParty, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-party-balance">Current Balance</Label>
                  <Input
                    id="edit-party-balance"
                    type="number"
                    step="0.01"
                    value={editingParty.balance || 0}
                    onChange={(e) =>
                      setEditingParty({
                        ...editingParty,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Positive = Party owes you, Negative = You owe party
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingParty(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateParty}
                disabled={!editingParty?.name.trim()}
              >
                Update Party
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Add Payment
              </DialogTitle>
              <DialogDescription>
                Record payment received from {selectedParty?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Balance</Label>
                <div
                  className={`text-lg font-semibold ${
                    (selectedParty?.balance || 0) > 0
                      ? "text-red-600"
                      : (selectedParty?.balance || 0) < 0
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  ₹{Math.abs(selectedParty?.balance || 0).toFixed(2)}
                  {(selectedParty?.balance || 0) > 0
                    ? " (They owe you)"
                    : (selectedParty?.balance || 0) < 0
                      ? " (You owe them)"
                      : " (Settled)"}
                </div>
              </div>
              <div>
                <Label htmlFor="payment-amount">Payment Amount</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount received"
                />
              </div>
              <div>
                <Label htmlFor="payment-description">
                  Description (Optional)
                </Label>
                <Input
                  id="payment-description"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Payment description"
                />
              </div>
              {paymentAmount && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>New Balance after payment:</strong> ₹
                    {(
                      (selectedParty?.balance || 0) +
                      parseFloat(paymentAmount || "0")
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setSelectedParty(null);
                  setPaymentAmount("");
                  setPaymentDescription("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Order Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Create Order
              </DialogTitle>
              <DialogDescription>
                Create new order for {selectedParty?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Balance</Label>
                <div
                  className={`text-lg font-semibold ${
                    (selectedParty?.balance || 0) > 0
                      ? "text-red-600"
                      : (selectedParty?.balance || 0) < 0
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  ₹{Math.abs(selectedParty?.balance || 0).toFixed(2)}
                  {(selectedParty?.balance || 0) > 0
                    ? " (They owe you)"
                    : (selectedParty?.balance || 0) < 0
                      ? " (You owe them)"
                      : " (Settled)"}
                </div>
              </div>
              <div>
                <Label htmlFor="order-amount">Order Amount</Label>
                <Input
                  id="order-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="Enter order amount"
                />
              </div>
              <div>
                <Label htmlFor="order-description">Order Description</Label>
                <Input
                  id="order-description"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  placeholder="Describe the order"
                />
              </div>
              {orderAmount && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Balance after order:</strong> ₹
                    {(
                      (selectedParty?.balance || 0) -
                      parseFloat(orderAmount || "0")
                    ).toFixed(2)}
                  </p>
                  {(selectedParty?.balance || 0) -
                    parseFloat(orderAmount || "0") <
                    0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ This will create an outstanding balance
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowOrderDialog(false);
                  setSelectedParty(null);
                  setOrderAmount("");
                  setOrderDescription("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddOrder}
                disabled={!orderAmount || parseFloat(orderAmount) <= 0}
              >
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deletePartyId}
          onOpenChange={() => setDeletePartyId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Party</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this party? This will also
                delete all related transactions and orders. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deletePartyId && handleDeleteParty(deletePartyId)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
