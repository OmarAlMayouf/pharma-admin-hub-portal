import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AddProductPage from "./pages/AddProductPage";
import DeleteProductPage from "./pages/DeleteProductPage";
import ModifyProductPage from "./pages/ModifyProductPage";
import AddBranchPage from "./pages/AddBranchPage";
import DeleteBranchPage from "./pages/DeleteBranchPage";
import ModifyBranchPage from "./pages/ModifyBranchPage";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { checkSession } from "./services/appwrite";
import { signOut } from "./services/appwrite";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await checkSession();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen dark-gradient flex flex-col items-center justify-center gap-4 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-emerald-500"></div>
        <Button 
          variant="outline" 
          onClick={async () => {
            await signOut();
            window.location.reload();
          }}
        >
          Force Logout
        </Button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route
                path="/"
                element={<LoginPage />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProductPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-product"
                element={
                  <ProtectedRoute>
                    <DeleteProductPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modify-product"
                element={
                  <ProtectedRoute>
                    <ModifyProductPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-branch"
                element={
                  <ProtectedRoute>
                    <AddBranchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-branch"
                element={
                  <ProtectedRoute>
                    <DeleteBranchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modify-branch"
                element={
                  <ProtectedRoute>
                    <ModifyBranchPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
