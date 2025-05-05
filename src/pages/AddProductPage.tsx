import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewProductForm } from "@/types/pharmacy";
import { cleanStreetName } from "@/constants/datapulling";

import {
  getBranchesByPharmacyId,
  getProductsByPharmacyId,
  addProduct,
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

const AddProductPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NewProductForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof NewProductForm, string>>
  >({});
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
        if (step === 2) {
          const branchData = await getBranchesByPharmacyId(pharmacy.id);
          setBranches(branchData);
        }
        if (step === 3) {
          const productData = await getProductsByPharmacyId(pharmacy.id);
          setProducts(productData);
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

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateStepOne = () => {
    const isValidPrice = (value: string) => {
      return /^\d+(\.\d{1,2})?$/.test(value);
    };

    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required.";
    }

    if (!formData.price.trim()) {
      errors.price = "Price is required.";
    } else if (
      !isValidPrice(formData.price) ||
      isNaN(+formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      errors.price = "Enter a valid positive price (up to two decimal places).";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = "Invalid image URL.";
    }

    if (formData.url && !isValidUrl(formData.url)) {
      errors.url = "Invalid product URL.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
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
    if (step === 1 && !validateStepOne()) return;

    if (step === 2 && formData.branches.length === branches.length) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please Deselect at least one branch.",
      });
      return;
    }

    setFormErrors({});
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!pharmacy?.id) return;
    setIsSubmitting(true);
    try {
      await addProduct(
        formData.name,
        parseFloat(formData.price),
        formData.description,
        formData.imageUrl || null,
        formData.url || null,
        formData.branches,
        formData.alternatives
      );
      toast({ title: "Success", description: "Product added successfully!" });
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
            <CardTitle className="text-xl font-bold">Add New Product</CardTitle>
            <CardDescription>
              Follow the steps to add a new product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3].map((num) => (
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
            {step === 1 && (
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
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (SAR) *</Label>
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-500">{formErrors.price}</p>
                  )}
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
                  {formErrors.description && (
                    <p className="text-sm text-red-500">
                      {formErrors.description}
                    </p>
                  )}
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
                  {formErrors.imageUrl && (
                    <p className="text-sm text-red-500">
                      {formErrors.imageUrl}
                    </p>
                  )}
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
                  {formErrors.url && (
                    <p className="text-sm text-red-500">{formErrors.url}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Branch Availability</h3>
                  <h5 className="text-sm font-normal text-gray-300">
                    Select Branches that this product is NOT available in
                  </h5>
                </div>

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

export default AddProductPage;
