
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const { user, loading, login } = useAuth();
  const [pharmacyId, setPharmacyId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyId.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      await login(pharmacyId, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pharmacy-50 to-pharmacy-200 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-pharmacy-900">
              Pharmaseek Admin Portal
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to manage your pharmacy products
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pharmacyId">Pharmacy ID</Label>
                <Input
                  id="pharmacyId"
                  placeholder="Enter your pharmacy ID"
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-pharmacy-600 hover:bg-pharmacy-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>Pharmacy ID: PHARM123, Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
