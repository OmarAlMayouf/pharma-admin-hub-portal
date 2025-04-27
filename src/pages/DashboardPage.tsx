
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pharmacy-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pharmacy-900">Pharmacy Admin Portal</h1>
            <p className="text-pharmacy-600">{user?.pharmacyName} (ID: {user?.pharmacyId})</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-pharmacy-800">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </h2>
          <p className="text-muted-foreground">Manage your pharmacy products</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Product Card */}
          <Card className="pharmacy-card border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <PlusCircle className="h-5 w-5" />
                Add Product
              </CardTitle>
              <CardDescription>
                Add a new product to your pharmacy inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create a new product with details, branch availability, and alternative products.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate("/add-product")}
              >
                Add New Product
              </Button>
            </CardFooter>
          </Card>

          {/* Delete Product Card */}
          <Card className="pharmacy-card border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="h-5 w-5" />
                Delete Product
              </CardTitle>
              <CardDescription>
                Remove products from your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Select and delete one or multiple products from your pharmacy catalog.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => navigate("/delete-product")}
              >
                Delete Products
              </Button>
            </CardFooter>
          </Card>

          {/* Modify Product Card */}
          <Card className="pharmacy-card border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Edit className="h-5 w-5" />
                Modify Product
              </CardTitle>
              <CardDescription>
                Update existing product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Change product details, branch availability, or alternative products.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => navigate("/modify-product")}
              >
                Modify Products
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
