import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  getBranchesByPharmacyId,
  getProductsByPharmacyId,
  getSearchAnalytics,
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
  const [chartloading, setChartLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
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

    const fetchAnalytics = async () => {
      try {
        setChartLoading(true);
        const data = await getSearchAnalytics();
        console.log("Data:", data);
        const grouped = {};

        data.forEach((entry) => {
          const term = entry.searchTerm.toLowerCase();
          grouped[term] = (grouped[term] || 0) + 1;
        });

        const chartData = Object.entries(grouped)
          .map(([name, searches]) => ({ name, searches: Number(searches) }))
          .sort((a, b) => b.searches - a.searches)
          .slice(0, 7);

        setTopProducts(chartData);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data.",
        });
      } finally {
        setChartLoading(false);
      }
    };

    fetchAnalytics();
    fetchData();
    fetchData2();
  }, [pharmacy?.id]);

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
      <header className="glass-effect sticky top-0 z-10">
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
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </h2>
          <p className="text-gray-400">
            Manage your pharmacy products and branches
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Overview Cards and Most Searched */}
          <div className="lg:col-span-2 space-y-4">
            {/* Overview Cards */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Products Card */}
                <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-yellow-500 transition-all hover:scale-105 duration-200 ease-in-out">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <LayoutDashboard className="h-5 w-5" />
                      Total Products
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Number of products currently in your inventory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-white">
                      {productloading ? "Loading..." : productsLength}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-400">Active products</p>
                  </CardFooter>
                </Card>

                {/* Total Branches Card */}
                <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-purple-500 transition-all hover:scale-105 duration-200 ease-in-out">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-purple-400">
                      <Building2 className="h-5 w-5" />
                      Total Branches
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Number of branches in your pharmacy network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-white">
                      {branchloading ? "Loading..." : branchesLength}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-400">Active locations</p>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Most Searched Products Chart */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Most Searched Products
              </h3>
              <Card className="bg-gray-900 border border-gray-800">
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
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
                        stroke="#f43f5e"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={63}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Branch Status List */}
          <div className="flex flex-col max-h-[calc(100vh-200px)">
            <h3 className="text-lg font-medium text-white mb-4">
              Branches Status
            </h3>
            <Card className="bg-gray-900 border border-gray-800 flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                {branchloading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <p>No branches found matching your search.</p>
                  </div>
                ) : (
                  <div
                    className="max-h-[525px] overflow-y-auto"
                    style={{ scrollbarColor: "#374151 #1f2937" }}
                  >
                    {filteredBranches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center p-3 border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="ml-3 flex-1">
                          <div className="font-medium">{branch.name}</div>
                          <div className="font-normal text-sm text-gray-500">
                            {branch.borough} - {cleanStreetName(branch.street)}{" "}
                            - {branch.city}
                          </div>
                        </div>
                        <div
                          className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                            isPharmacyOpen(branch.working_hours) === "Opened"
                              ? "bg-emerald-900/30 text-emerald-400"
                              : "bg-rose-900/30 text-rose-400"
                          }`}
                        >
                          {isPharmacyOpen(branch.working_hours) === "Opened"
                            ? "Open"
                            : "Closed"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>

          {/* Product Management */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-300 mb-4 flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Product Management
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Add Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-emerald-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-emerald-400 text-sm">
                    <PlusCircle className="h-4 w-4" />
                    Add Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Add a new product to your inventory
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-emerald-700 text-white"
                    onClick={() => navigate("/add-product")}
                  >
                    Add
                  </Button>
                </CardFooter>
              </Card>

              {/* Bulk Add Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-violet-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-violet-400 text-sm">
                    <FilePlus2 className="h-4 w-4" />
                    Bulk Add
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Upload JSON to add multiple products
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-violet-700 text-white"
                    onClick={() => navigate("/bulk-add")}
                  >
                    Upload JSON
                  </Button>
                </CardFooter>
              </Card>

              {/* Modify Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-sky-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sky-400 text-sm">
                    <Edit className="h-4 w-4" />
                    Modify Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Update existing product information
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-sky-700 text-white"
                    onClick={() => navigate("/modify-product")}
                  >
                    Modify
                  </Button>
                </CardFooter>
              </Card>

              {/* Delete Product Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-rose-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-rose-400 text-sm">
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Remove products from your inventory
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-rose-700 text-white"
                    onClick={() => navigate("/delete-product")}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Branch Management */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Branch Management
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Add Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-emerald-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-emerald-400 text-sm">
                    <PlusCircle className="h-4 w-4" />
                    Add Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Add a new branch to your pharmacy network
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-emerald-700 text-white"
                    onClick={() => navigate("/add-branch")}
                  >
                    Add
                  </Button>
                </CardFooter>
              </Card>

              {/* Modify Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-sky-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sky-400 text-sm">
                    <Edit className="h-4 w-4" />
                    Modify Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Update existing branch information
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-sky-700 text-white"
                    onClick={() => navigate("/modify-branch")}
                  >
                    Modify
                  </Button>
                </CardFooter>
              </Card>

              {/* Delete Branch Card */}
              <Card className="bg-gray-900 hover:bg-gray-950 border-l-4 border-l-rose-500 transition-all hover:scale-105 duration-200 ease-in-out">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-rose-400 text-sm">
                    <Trash2 className="h-4 w-4" />
                    Delete Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500">
                  Remove branches from your network
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 hover:bg-rose-700 text-white"
                    onClick={() => navigate("/delete-branch")}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;