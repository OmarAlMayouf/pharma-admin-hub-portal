import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Edit, Save, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewProductForm } from "@/types/pharmacy";
import { cleanStreetName } from "@/constants/datapulling";

import {
  getBranchesByPharmacyId,
  getProductsByPharmacyId,
  modifyProduct,
  getProductsExceptThisByPharmacyId,
  getProductAvailability,
  getProductAlternatives,
} from "@/services/appwrite";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialFormState: NewProductForm = {
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  url: "",
  branches: [],
  alternatives: [],
};

const ModifyBranchPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<NewProductForm>(initialFormState);
  const [productID, setProductID] = useState("");
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pharmacy?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (step === 0) {
          const productData = await getProductsByPharmacyId(pharmacy.id);
          setProducts(productData);
        }
        if (step === 2) {
          const branchData = await getBranchesByPharmacyId(pharmacy.id);
          setBranches(branchData);
          const availableBranches = await getProductAvailability(productID);

          setFormData((prev) => ({
            ...prev,
            branches: availableBranches,
          }));
        }
        if (step === 3) {
          const productData = await getProductsExceptThisByPharmacyId(
            pharmacy.id,
            productID
          );
          setProducts(productData);
          const availableAlternatives = await getProductAlternatives(productID);

          setFormData((prev) => ({
            ...prev,
            alternatives: availableAlternatives,
          }));
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pharmacy?.id, step]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      branches: checked
        ? [...prev.branches, branchId]
        : prev.branches.filter((id) => id !== branchId),
    }));
  };

  const handleAlternativeToggle = (productId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: checked
        ? [...prev.alternatives, productId]
        : prev.alternatives.filter((id) => id !== productId),
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        !formData.name.trim() ||
        !formData.description.trim() ||
        !formData.price.trim() ||
        isNaN(+formData.price)
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
        });
        return;
      }
    }
    if (step === 2) {
      if (formData.branches.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least one branch.",
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!pharmacy?.id) return;
    setIsSubmitting(true);
    try {
      await modifyProduct(
        formData.name,
        parseFloat(formData.price),
        formData.description,
        formData.imageUrl || null,
        formData.url || null,
        formData.branches,
        formData.alternatives,
        productID
      );
      toast({
        title: "Success",
        description: "Product Modified successfully!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleSelectProduct(product: any): void {
    setProductID(product?.$id);
    setFormData({
      name: product.name || "",
      price: product.price ? product.price.toString() : "",
      description: product.description || "",
      imageUrl: product.image || "",
      url: product.url || "",
      branches: product.branches || [],
      alternatives: product.alternatives || [],
    });
    setStep(1);
  }

  return (
    <div className="min-h-screen dark-gradient py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Modify Product</CardTitle>
            <CardDescription>
              Follow the steps to modify an existing product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-8 w-8 flex items-center justify-center rounded-full text-white ${
                    step === num ? "bg-primary" : "bg-gray-600"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Step Content */}
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
                    <div className="py-8 text-center text-gray-400">
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
                              src={
                                product.image || "https://placehold.co/100x100"
                              }
                              alt={product.name || "Product Image"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100?text=Product";
                              }}
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="font-medium">{product.name}</div>
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
              step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (SAR) *</Label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter description"
                      style={{ scrollbarColor: "#374151 #1f2937" }}
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Optional image link"
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Product URL</Label>
                    <Input
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="Optional product link"
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pharmacyId">Pharmacy ID</Label>
                    <Input
                      id="pharmacyId"
                      value={pharmacy?.id || ""}
                      disabled
                      className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button onClick={nextStep}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Branch Availability</h3>

                {loading ? (
                  <p className="text-center py-8">Loading branches...</p>
                ) : (
                  <>
                    {branches.length > 0 && (
                      <div className="flex justify-end mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allBranchIds = branches.map(
                              (branch) => branch.$id
                            );
                            const allSelected = allBranchIds.every((id) =>
                              formData.branches.includes(id)
                            );

                            setFormData((prev) => ({
                              ...prev,
                              branches: allSelected ? [] : allBranchIds,
                            }));
                          }}
                        >
                          {formData.branches.length === branches.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                    )}

                    <div
                      className="max-h-96 overflow-y-auto"
                      style={{ scrollbarColor: "#374151 #1f2937" }}
                    >
                      {branches.length === 0 ? (
                        <p>No branches found.</p>
                      ) : (
                        branches.map((branch) => (
                          <div
                            key={branch?.$id}
                            className="flex items-center space-x-2 p-3 border-t border-gray-800 hover:bg-gray-800/50"
                          >
                            <Checkbox
                              checked={formData.branches.includes(branch?.$id)}
                              onCheckedChange={(checked) =>
                                handleBranchToggle(branch?.$id, !!checked)
                              }
                            />
                            <div>
                              <p className="font-medium">{branch.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cleanStreetName(branch.street)}, {branch.city}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button onClick={nextStep}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Alternative Products (Optional)
                </h3>

                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/50 border-gray-700 mb-4"
                />

                {loading ? (
                  <p className="text-center py-8">Loading products...</p>
                ) : (
                  <>
                    {filteredProducts.length > 0 && (
                      <div className="flex justify-end mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allProductIds = filteredProducts.map(
                              (product) => product.$id
                            );
                            const allSelected = allProductIds.every((id) =>
                              formData.alternatives.includes(id)
                            );

                            setFormData((prev) => ({
                              ...prev,
                              alternatives: allSelected ? [] : allProductIds,
                            }));
                          }}
                        >
                          {formData.alternatives.length ===
                          filteredProducts.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                    )}
                    <div
                      className="max-h-96 overflow-y-auto"
                      style={{ scrollbarColor: "#374151 #1f2937" }}
                    >
                      {filteredProducts.map((product) => (
                        <div
                          key={product?.$id}
                          className="flex items-center space-x-2 p-3 border-t border-gray-800 hover:bg-gray-800/50"
                        >
                          <Checkbox
                            checked={formData.alternatives.includes(
                              product?.$id
                            )}
                            onCheckedChange={(checked) =>
                              handleAlternativeToggle(product?.$id, !!checked)
                            }
                          />
                          <div className="flex items-center space-x-2">
                            <img
                              src={
                                product.image ||
                                "https://placehold.co/100x100?text=Product"
                              }
                              alt={product.name}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                SAR {product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" /> Save Product
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModifyBranchPage;