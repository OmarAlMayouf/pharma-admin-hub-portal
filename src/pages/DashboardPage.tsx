import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  getBranchesByPharmacyId,
  getProductsByPharmacyId,
} from "@/services/appwrite";
import { Input } from "@/components/ui/input";
import { cleanStreetName, isPharmacyOpen } from "@/constants/datapulling";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  PlusCircle,
  Trash2,
  Edit,
  LogOut,
  LayoutDashboard,
  Building2,
  Search,
  Paperclip,
  FileCode,
  FilePlus2,
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const { pharmacy, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [productsLength, setProductLength] = useState(0);
  const [branchesLength, setBranchesLength] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchloading, setBranchLoading] = useState(false);
  const [productloading, setProductLoading] = useState(false);
  const { toast } = useToast();
  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!pharmacy?.id) return;

    const fetchData = async () => {
      try {
        setBranchLoading(true);
        const branchData = await getBranchesByPharmacyId(pharmacy.id);
        setBranches(branchData);
        setBranchesLength(branchData.length);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data.",
        });
      } finally {
        setBranchLoading(false);
      }
    };

    const fetchData2 = async () => {
      try {
        setProductLoading(true);
        const productData = await getProductsByPharmacyId(pharmacy.id);
        setProductLength(productData.length);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data.",
        });
      } finally {
        setProductLoading(false);
      }
    };

    fetchData();
    fetchData2();
  }, [pharmacy?.id]);

  const allProducts = [
    { name: "Product A", searches: 120 },
    { name: "Product B", searches: 95 },
    { name: "Product C", searches: 210 },
    { name: "Product D", searches: 35 },
    { name: "Product E", searches: 75 },
    { name: "Product F", searches: 180 },
    { name: "Product G", searches: 60 },
  ];

  const topN = 7;

  const topProducts = allProducts.slice(0, topN);

  function centerHighest(products) {
    const sorted = [...products].sort((a, b) => b.searches - a.searches);
    const middle = [];
    const left = [];
    const right = [];

    sorted.forEach((product, index) => {
      if (index % 2 === 0) {
        right.push(product);
      } else {
        left.unshift(product);
      }
    });

    return [...left, ...right];
  }

  if (isLoading) {
    return (
      <div className="min-h-screen dark-gradient flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!pharmacy) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen dark-gradient">
      <header className="glass-effect">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Pharmaseek Admin Portal
            </h1>
            <p className="text-gray-400">
              {pharmacy?.name} (ID: {pharmacy?.id})
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
          <p className="text-gray-400">
            Manage your pharmacy products and branches
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Inventory Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Products Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-yellow-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <LayoutDashboard className="h-5 w-5" />
                    Total Products
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Number of products currently in your inventory
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
                <CardFooter>
                  <p className="text-3xl font-bold text-white">
                    {productloading ? "Loading..." : productsLength}
                  </p>
                </CardFooter>
              </Card>

              {/* Total Branches Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-purple-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <LayoutDashboard className="h-5 w-5" />
                    Total Branches
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Number of branches in your pharmacy network
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
                <CardFooter>
                  <p className="text-3xl font-bold text-white">
                    {branchloading ? "Loading..." : branchesLength}
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Product Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Product management cards */}

              {/* Bulk Add Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-violet-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-violet-400">
                    <FilePlus2 className="h-5 w-5" />
                    Bulk Add Product
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload a CSV file to add multiple products at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Upload a CSV file containing product details to add them in
                    bulk to your pharmacy inventory.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-violet-700 text-white"
                    onClick={() => {}}
                  >
                    Bulk Add Products
                  </Button>
                </CardFooter>
              </Card>

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
                    className="w-full bg-gray-800 hover:bg-emerald-700 text-white"
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
                    Select and delete one or multiple products from your
                    pharmacy catalog.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-rose-700 text-white"
                    onClick={() => navigate("/delete-product")}
                  >
                    Delete Products
                  </Button>
                </CardFooter>
              </Card>

              {/* Modify Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-sky-500 transition-all hover:scale-105 duration-200 ease-in-out flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-400">
                    <Edit className="h-5 w-5" />
                    Modify Product
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update existing product information
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500">
                    Change product details, branch availability, or alternative
                    products.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800  hover:bg-sky-700 text-white"
                    onClick={() => navigate("/modify-product")}
                  >
                    Modify Products
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Branch Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-emerald-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Building2 className="h-5 w-5" />
                    Add Branch
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Add a new branch to your pharmacy network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Create a new branch with location details, working hours,
                    and contact information.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-emerald-700 text-white"
                    onClick={() => navigate("/add-branch")}
                  >
                    Add New Branch
                  </Button>
                </CardFooter>
              </Card>

              {/* Delete Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-rose-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-rose-400">
                    <Trash2 className="h-5 w-5" />
                    Delete Branch
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Remove branches from your network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Select and delete one or multiple branches from your
                    pharmacy network.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-rose-700 text-white"
                    onClick={() => navigate("/delete-branch")}
                  >
                    Delete Branches
                  </Button>
                </CardFooter>
              </Card>

              {/* Modify Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-sky-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-400">
                    <Edit className="h-5 w-5" />
                    Modify Branch
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update existing branch information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Update branch details, location information, or working
                    hours.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-sky-700 text-white"
                    onClick={() => navigate("/modify-branch")}
                  >
                    Modify Branches
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Most Searched Products
            </h3>
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={centerHighest(topProducts)}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  barCategoryGap="15%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    tickLine={{ stroke: "#4B5563" }}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    tickLine={{ stroke: "#4B5563" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderColor: "#374151",
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: "#F9FAFB" }}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Bar
                    dataKey="searches"
                    fill="#f43f5e"
                    radius={[10, 10, 0, 0]}
                    stroke="#f43f5e"
                    barSize={105}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Branches Status
            </h3>
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>

                {branchloading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <p>No branches found matching your search.</p>
                  </div>
                ) : (
                  <div
                    className=" max-h-96 overflow-y-auto border border-gray-800 rounded-md"
                    style={{ scrollbarColor: "#374151 #1f2937" }}
                  >
                    {filteredBranches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center p-3 border-t border-gray-800 hover:bg-gray-800/50"
                        onClick={() => {}}
                      >
                        <div className="ml-3 flex-1">
                          <div className="font-medium">{branch.name}</div>
                          <div className="font-normal text-sm text-gray-500">
                            {branch.borough} - {cleanStreetName(branch.street)}{" "}
                            - {branch.city}
                          </div>
                        </div>
                        <span
                          className={`ml-4 text-sm font-semibold ${
                            isPharmacyOpen(branch.working_hours) === "Opened"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {isPharmacyOpen(branch.working_hours) === "Opened"
                            ? "Opened"
                            : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
