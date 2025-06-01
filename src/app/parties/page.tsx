"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Search,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Eye,
  EyeOff,
  Calendar,
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
import { partiesAuthAction } from "@/app/actions";

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
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [deletePartyId, setDeletePartyId] = useState<number | null>(null);
  const [newPartyName, setNewPartyName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionType, setTransactionType] = useState<"payment" | "order">(
    "payment"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const isAuth = localStorage?.getItem("partiesAuth");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPartiesData();
    }
  }, [isAuthenticated]);

  const loadPartiesData = async () => {
    setIsLoading(true);
    try {
      const [partiesResponse, transactionsResponse] = await Promise.all([
        fetch("/api/parties"),
        fetch("/api/parties/transactions"),
      ]);

      if (partiesResponse.ok) {
        const partiesData = await partiesResponse.json();
        setParties(partiesData);
      }

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("password", password);

      const result = await partiesAuthAction(formData);

      if (result.success) {
        setIsAuthenticated(true);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("partiesAuth", "true");
        }
        setPassword("");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
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
      await loadPartiesData();
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
      const response = await fetch(`/api/parties/${editingParty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingParty.name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update party");
      }

      setShowEditDialog(false);
      setEditingParty(null);
      setError(null);
      await loadPartiesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParty = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parties/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete party");
      }

      setDeletePartyId(null);
      setError(null);
      await loadPartiesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (
      !selectedParty ||
      !transactionAmount ||
      parseFloat(transactionAmount) <= 0
    ) {
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
          type: transactionType,
          amount: parseFloat(transactionAmount),
          description:
            transactionDescription || `${transactionType} transaction`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add transaction");
      }

      setShowTransactionDialog(false);
      setSelectedParty(null);
      setTransactionAmount("");
      setTransactionDescription("");
      setError(null);
      await loadPartiesData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-success";
    if (balance < 0) return "text-destructive";
    return "text-gray-600";
  };

  const getBalanceVariant = (balance: number) => {
    if (balance > 0) return "default";
    if (balance < 0) return "destructive";
    return "secondary";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function for transaction filtering
  const filteredTransactions = transactions
    .filter((transaction) => {
      if (searchTerm) {
        return (
          transaction.party_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Transaction analytics
  const transactionStats = {
    totalTransactions: transactions.length,
    totalPayments: transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0),
    totalOrders: transactions
      .filter((t) => t.type === "order")
      .reduce((sum, t) => sum + t.amount, 0),
    recentTransactions: transactions.slice(0, 10),
    monthlyTransactions: transactions.filter((t) => {
      const transactionDate = new Date(t.created_at);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    }).length,
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <Receipt className="w-4 h-4 text-success" />;
      case "order":
        return <CreditCard className="w-4 h-4 text-primary" />;
      case "adjustment":
        return <Edit className="w-4 h-4 text-warning" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "payment":
        return "text-success";
      case "order":
        return "text-primary";
      case "adjustment":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Party Management Access
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
                  placeholder="Enter access password"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col mt-6 gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Party Management
        </h1>
        <p className="text-muted-foreground">
          Manage customer accounts, balances, and transaction history.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Lock className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Parties
                </p>
                <p className="text-2xl font-bold">{parties.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(
                    parties.reduce((sum, party) => sum + party.balance, 0)
                  )}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Positive Balances
                </p>
                <p className="text-2xl font-bold text-success">
                  {parties.filter((p) => p.balance > 0).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Negative Balances
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {parties.filter((p) => p.balance < 0).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Parties
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Parties Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parties</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search parties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Party
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredParties.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {parties.length === 0
                      ? "No parties found"
                      : "No parties match your search"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parties.length === 0
                      ? "Add your first party to get started"
                      : "Try a different search term"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParties.map((party) => (
                      <TableRow key={party.id}>
                        <TableCell className="font-medium">
                          {party.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBalanceVariant(party.balance)}>
                            {formatCurrency(party.balance)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(party.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedParty(party);
                                setShowTransactionDialog(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingParty(party);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletePartyId(party.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <div className="space-y-6">
            {/* Transaction Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-bold">
                        {transactionStats.totalTransactions}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Payments
                      </p>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(transactionStats.totalPayments)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(transactionStats.totalOrders)}
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        This Month
                      </p>
                      <p className="text-2xl font-bold">
                        {transactionStats.monthlyTransactions}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {transactions.length === 0
                        ? "No transactions found"
                        : "No transactions match your search"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transactions.length === 0
                        ? "Add transactions through party management"
                        : "Try a different search term"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Balance After</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <Badge
                                variant={
                                  transaction.type === "payment"
                                    ? "default"
                                    : transaction.type === "order"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={
                                  transaction.type === "payment"
                                    ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                                    : transaction.type === "order"
                                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                      : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                                }
                              >
                                {transaction.type.charAt(0).toUpperCase() +
                                  transaction.type.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.party_name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transaction.type === "payment"
                                  ? "text-success font-semibold"
                                  : transaction.type === "order"
                                    ? "text-primary font-semibold"
                                    : "font-semibold"
                              }
                            >
                              {transaction.type === "payment" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {transaction.description || "No description"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getBalanceVariant(
                                transaction.balance_after
                              )}
                            >
                              {formatCurrency(transaction.balance_after)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
            <DialogDescription>Create a new party account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="party-name">Party Name</Label>
              <Input
                id="party-name"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="Enter party name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParty} disabled={isLoading}>
              Add Party
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Party Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Party</DialogTitle>
            <DialogDescription>Update party information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-party-name">Party Name</Label>
              <Input
                id="edit-party-name"
                value={editingParty?.name || ""}
                onChange={(e) =>
                  setEditingParty(
                    editingParty
                      ? { ...editingParty, name: e.target.value }
                      : null
                  )
                }
                placeholder="Enter party name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateParty} disabled={isLoading}>
              Update Party
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Add a payment or order transaction for {selectedParty?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transaction Type</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={
                    transactionType === "payment" ? "default" : "outline"
                  }
                  onClick={() => setTransactionType("payment")}
                  className="flex-1"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Payment
                </Button>
                <Button
                  variant={transactionType === "order" ? "default" : "outline"}
                  onClick={() => setTransactionType("order")}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Order
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransactionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTransaction} disabled={isLoading}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletePartyId !== null}
        onOpenChange={() => setDeletePartyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              party and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePartyId && handleDeleteParty(deletePartyId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
