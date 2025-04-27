import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  PlusCircle,
  Trash2,
  Edit,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen dark-gradient">
      <header className="glass-effect">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Pharmaseek Admin Portal
            </h1>
            <p className="text-gray-400">
              {user?.pharmacyName} (ID: {user?.pharmacyId})
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </h2>
          <p className="text-gray-400">Manage your pharmacy products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Product Card */}
          <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-emerald-500 transition-all hover:scale-105 duration-200 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <PlusCircle className="h-5 w-5" />
                Add Product
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add a new product to your pharmacy inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Create a new product with details, branch availability, and
                alternative products.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => navigate("/add-product")}
              >
                Add New Product
              </Button>
            </CardFooter>
          </Card>

          {/* Delete Product Card */}
          <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-rose-500 transition-all hover:scale-105 duration-200 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-400">
                <Trash2 className="h-5 w-5" />
                Delete Product
              </CardTitle>
              <CardDescription className="text-gray-400">
                Remove products from your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Select and delete one or multiple products from your pharmacy
                catalog.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => navigate("/delete-product")}
              >
                Delete Products
              </Button>
            </CardFooter>
          </Card>

          {/* Modify Product Card */}
          <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-sky-500 transition-all hover:scale-105 duration-200 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-400">
                <Edit className="h-5 w-5" />
                Modify Product
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update existing product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Change product details, branch availability, or alternative
                products.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white"
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
