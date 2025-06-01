import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminAuthAction } from "@/app/actions";
import {
  Lock,
  FileText,
  TrendingUp,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";
import { cookies } from "next/headers";
import JobSheetAdminDashboard from "@/components/job-sheet-admin-dashboard";

export default async function AdminJobSheetPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Access comprehensive job sheet management and analytics dashboard.
          </p>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="w-full max-w-lg shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Secure Access Required
                </CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  Enter your admin credentials to access the job sheet
                  management dashboard
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={adminAuthAction as any} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="passcode"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Admin Passcode
                  </Label>
                  <Input
                    id="passcode"
                    name="passcode"
                    type="password"
                    placeholder="Enter your admin passcode"
                    required
                    className="h-12 text-center text-lg tracking-wider border-2 focus:border-primary transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-dashed border-2 hover:border-primary/30 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Job Sheet Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive job sheet analytics, detailed reporting, and
                workflow management
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 hover:border-primary/30 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Performance Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time performance metrics, financial insights, and business
                intelligence
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 hover:border-primary/30 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Advanced Reports
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Interactive dashboards, data visualization, and comprehensive
                reporting tools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">
                  Security & Privacy
                </h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  This admin dashboard is protected by enterprise-grade security
                  measures. All access attempts are logged and monitored for
                  compliance and security purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      {/* Dashboard Container */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r mt-3 from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="text-primary" />
            Job Sheet Analytics Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Real-time insights and comprehensive reporting for your printing
            business
          </p>
        </CardHeader>
        <CardContent className="">
          <JobSheetAdminDashboard />
        </CardContent>
      </Card>
    </div>
  );
}
