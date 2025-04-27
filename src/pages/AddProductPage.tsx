
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBranchesByPharmacyId, getProductsByPharmacyId, addProduct } from "@/services/productService";
import { Branch, Product, NewProductForm } from "@/types/pharmacy";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialFormState: NewProductForm = {
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  branches: [],
  alternatives: [],
};

const AddProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NewProductForm>(initialFormState);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.pharmacyId) {
      // Fetch branches for step 2
      if (step === 2) {
        setLoading(true);
        getBranchesByPharmacyId(user.pharmacyId)
          .then((data) => setBranches(data))
          .finally(() => setLoading(false));
      }

      // Fetch products for step 3
      if (step === 3) {
        setLoading(true);
        getProductsByPharmacyId(user.pharmacyId)
          .then((data) => setProducts(data))
          .finally(() => setLoading(false));
      }
    }
  }, [user?.pharmacyId, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async () => {
    if (!user?.pharmacyId) return;

    setIsSubmitting(true);
    try {
      await addProduct(
        {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          imageUrl: formData.imageUrl,
          pharmacyId: user.pharmacyId,
        },
        formData.branches,
        formData.alternatives
      );

      toast({
        title: "Product Added Successfully",
        description: `${formData.name} has been added to your inventory.`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Adding Product",
        description: "There was a problem adding the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pharmacy-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Add New Product</CardTitle>
            <CardDescription>
              Complete all steps to add a new product to your pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step indicators */}
            <div className="flex items-center justify-center mb-6">
              <div className={`step-indicator ${step === 1 ? "bg-primary" : "step-indicator-inactive"}`}>1</div>
              <div className="h-1 w-12 bg-gray-200">
                <div className={`h-1 bg-primary ${step >= 2 ? "w-full" : "w-0"}`}></div>
              </div>
              <div className={`step-indicator ${step === 2 ? "bg-primary" : "step-indicator-inactive"}`}>2</div>
              <div className="h-1 w-12 bg-gray-200">
                <div className={`h-1 bg-primary ${step >= 3 ? "w-full" : "w-0"}`}></div>
              </div>
              <div className={`step-indicator ${step === 3 ? "bg-primary" : "step-indicator-inactive"}`}>3</div>
            </div>

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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (in $) *</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    type="number"
                    step="0.01"
                    required
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyId">Pharmacy ID</Label>
                  <Input
                    id="pharmacyId"
                    value={user?.pharmacyId || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="pt-4 text-right">
                  <Button onClick={nextStep} className="flex items-center gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

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
                  <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                    {branches.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                        <Checkbox
                          id={`branch-${branch.id}`}
                          checked={formData.branches.includes(branch.id)}
                          onCheckedChange={(checked) => handleBranchChange(branch.id, !!checked)}
                        />
                        <div className="flex flex-col">
                          <Label
                            htmlFor={`branch-${branch.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {branch.name}
                          </Label>
                          <span className="text-xs text-muted-foreground">{branch.address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={prevStep} className="flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={nextStep} className="flex items-center gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alternative Products (Optional)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="searchAlternatives">Search Products</Label>
                  <Input
                    id="searchAlternatives"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for products..."
                    className="mb-4"
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
                  <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-md">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={formData.alternatives.includes(product.id)}
                          onCheckedChange={(checked) => handleAlternativeChange(product.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex flex-1 space-x-2">
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Product";
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
                  <Button variant="outline" onClick={prevStep} className="flex items-center gap-1">
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
                        Save Product
                      </>
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
