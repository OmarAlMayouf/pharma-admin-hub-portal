import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProductsByPharmacyId,
  getBranchesByPharmacyId,
  getProductBranches,
  getAlternativeProducts,
  updateProduct,
} from "@/services/productService";
import { Product, Branch, NewProductForm } from "@/types/pharmacy";
import { ArrowLeft, ArrowRight, Edit, Save, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialFormState: NewProductForm = {
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  branches: [],
  alternatives: [],
};

const ModifyProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0); // 0: product selection, 1-3: editing steps
  const [formData, setFormData] = useState<NewProductForm>(initialFormState);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [alternativeProducts, setAlternativeProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAltTerm, setSearchAltTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products on init
  useEffect(() => {
    if (user?.pharmacyId) {
      setLoading(true);
      getProductsByPharmacyId(user.pharmacyId)
        .then((fetchedProducts) => {
          setProducts(fetchedProducts);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?.pharmacyId]);

  // Load branches when needed
  useEffect(() => {
    if (step === 2 && user?.pharmacyId) {
      setLoading(true);
      getBranchesByPharmacyId(user.pharmacyId)
        .then((data) => setBranches(data))
        .finally(() => setLoading(false));
    }
  }, [step, user?.pharmacyId]);

  // Load alternative products when needed
  useEffect(() => {
    if (step === 3 && user?.pharmacyId) {
      setLoading(true);
      getProductsByPharmacyId(user.pharmacyId).then((fetchedProducts) => {
        setAlternativeProducts(
          fetchedProducts.filter((p) => p.id !== selectedProduct?.id)
        );
        setLoading(false);
      });
    }
  }, [step, user?.pharmacyId, selectedProduct?.id]);

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);

    try {
      // Get product branch availability
      const branchIds = await getProductBranches(product.id);

      // Get alternative products
      const alternativeIds = await getAlternativeProducts(product.id);

      // Initialize form with product data
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        imageUrl: product.imageUrl,
        branches: branchIds,
        alternatives: alternativeIds,
      });

      setStep(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (branchId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      branches: checked
        ? [...prev.branches, branchId]
        : prev.branches.filter((id) => id !== branchId),
    }));
  };

  const handleAlternativeChange = (productId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: checked
        ? [...prev.alternatives, productId]
        : prev.alternatives.filter((id) => id !== productId),
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Required Field Missing",
          description: "Product name is required.",
        });
        return;
      }
      if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
        toast({
          variant: "destructive",
          title: "Invalid Price",
          description: "Please enter a valid price.",
        });
        return;
      }
      if (!formData.imageUrl.trim()) {
        toast({
          variant: "destructive",
          title: "Required Field Missing",
          description: "Image URL is required.",
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !user?.pharmacyId) return;

    setIsSubmitting(true);
    try {
      await updateProduct(
        selectedProduct.id,
        {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          imageUrl: formData.imageUrl,
        },
        formData.branches,
        formData.alternatives
      );

      toast({
        title: "Product Updated Successfully",
        description: `${formData.name} has been updated in your inventory.`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Updating Product",
        description:
          "There was a problem updating the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered products for selection
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered alternative products
  const filteredAlternatives = alternativeProducts.filter((product) =>
    product.name.toLowerCase().includes(searchAltTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen dark-gradient py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Modify Product</CardTitle>
            <CardDescription>Update existing product details</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 ? (
              <>
                {/* Product Selection Step */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for a product to modify..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <p>No products found matching your search.</p>
                    </div>
                  ) : (
                    <div
                      className=" max-h-96 overflow-y-auto border border-gray-800 rounded-md"
                      style={{ scrollbarColor: "#374151 #1f2937" }}
                    >
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center p-3 border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100?text=Product";
                              }}
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {product.description}
                            </div>
                          </div>
                          <div className="font-medium">
                            {product.price.toFixed(2)} SAR
                          </div>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Step indicators - Only show when in edit mode */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`step-indicator ${
                      step === 1
                        ? "bg-gray-700 rounded-xl py-1 px-2"
                        : "step-indicator-inactive py-1 px-2 bg-gray-500 rounded-xl"
                    }`}
                  >
                    1
                  </div>
                  <div className="h-1 w-12 bg-gray-200">
                    <div
                      className={`h-1 bg-primary ${
                        step >= 2 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`step-indicator ${
                      step === 2
                        ? "bg-gray-700 rounded-xl py-1 px-2"
                        : "step-indicator-inactive py-1 px-2 bg-gray-500 rounded-xl"
                    }`}
                  >
                    2
                  </div>
                  <div className="h-1 w-12 bg-gray-200">
                    <div
                      className={`h-1 bg-primary ${
                        step >= 3 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`step-indicator ${
                      step === 3
                        ? "bg-gray-700 rounded-xl py-1 px-2"
                        : "step-indicator-inactive py-1 px-2 bg-gray-500 rounded-xl"
                    }`}
                  >
                    3
                  </div>
                </div>

                {/* Step 1: Product Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Product Details</h3>

                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        required
                        className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (in SAR) *</Label>
                      <Input
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        type="number"
                        step="0.01"
                        required
                        className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                        rows={3}
                        className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL *</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                        required
                        className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pharmacyId">Pharmacy ID</Label>
                      <Input
                        id="pharmacyId"
                        value={user?.pharmacyId || ""}
                        disabled
                        className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setStep(0)}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Selection
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Branch Availability */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Branch Availability</h3>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : branches.length === 0 ? (
                      <div className="py-8 text-center">
                        <p>No branches found for your pharmacy.</p>
                      </div>
                    ) : (
                      <div
                        className="max-h-96 overflow-y-auto border border-gray-800 rounded-md"
                        style={{ scrollbarColor: "#374151 #1f2937" }}
                      >
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-2 p-3 border-t border-gray-800 hover:bg-gray-800/50"
                          >
                            <Checkbox
                              id={`branch-${branch.id}`}
                              checked={formData.branches.includes(branch.id)}
                              onCheckedChange={(checked) =>
                                handleBranchChange(branch.id, !!checked)
                              }
                            />
                            <div className="flex flex-col">
                              <Label
                                htmlFor={`branch-${branch.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {branch.name}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {branch.address}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Alternative Products */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Alternative Products (Optional)
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="searchAlternatives">
                        Search Products
                      </Label>
                      <Input
                        id="searchAlternatives"
                        value={searchAltTerm}
                        onChange={(e) => setSearchAltTerm(e.target.value)}
                        placeholder="Search for products..."
                        className="mb-4 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                      />
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredAlternatives.length === 0 ? (
                      <div className="py-8 text-center">
                        <p>No products found matching your search.</p>
                      </div>
                    ) : (
                      <div
                        className="max-h-64 overflow-y-auto border border-gray-800 rounded-md"
                        style={{ scrollbarColor: "#374151 #1f2937" }}
                      >
                        {filteredAlternatives.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 space-x-2 p-3 border-t border-gray-800 hover:bg-gray-800/50"
                          >
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={formData.alternatives.includes(
                                product.id
                              )}
                              onCheckedChange={(checked) =>
                                handleAlternativeChange(product.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div className="flex flex-1 space-x-2">
                              <div className="w-10 h-10 rounded-md overflow-hidden">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://placehold.co/100x100?text=Product";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Label
                                  htmlFor={`product-${product.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {product.name}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Update Product
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModifyProductPage;
