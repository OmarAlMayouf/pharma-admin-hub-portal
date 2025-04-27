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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  getProductsByPharmacyId,
  deleteProducts,
} from "@/services/productService";
import { Product } from "@/types/pharmacy";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeleteProductPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;

    setIsDeleting(true);
    try {
      await deleteProducts(selectedProducts);

      setProducts((prev) =>
        prev.filter((product) => !selectedProducts.includes(product.id))
      );

      toast({
        title: "Products Deleted Successfully",
        description: `${selectedProducts.length} product(s) have been removed from your inventory.`,
      });

      setSelectedProducts([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete products. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen dark-gradient py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Delete Products
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select products to remove from your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-1"
                      disabled={selectedProducts.length === 0 || isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the selected product(s) from your inventory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteProducts}>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="grid grid-cols-[40px_auto_100px_100px] gap-4 p-3 bg-gray-900/50 font-medium text-sm text-gray-300">
                    <div>
                      <Checkbox
                        checked={
                          filteredProducts.length > 0 &&
                          selectedProducts.length === filteredProducts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                    <div>Product</div>
                    <div className="text-right">Price</div>
                    <div></div>
                  </div>

                  <div
                    className="max-h-96 overflow-y-auto"
                    style={{ scrollbarColor: "#374151 #1f2937" }}
                  >
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-[40px_auto_100px_100px] gap-4 items-center p-3 border-t border-gray-800 hover:bg-gray-800/50"
                      >
                        <div>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) =>
                              handleSelectProduct(product.id, !!checked)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3">
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
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-sm">
                              {product.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-medium">
                          {product.price.toFixed(2)} SAR
                        </div>
                        <div className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete this product?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete "{product.name}" from your
                                  inventory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setSelectedProducts([product.id]);
                                    handleDeleteProducts();
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeleteProductPage;
