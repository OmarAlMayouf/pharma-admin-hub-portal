import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addProducts } from "@/services/appwrite";
import {
  ArrowLeft,
  Upload,
  Save,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const BulkAddPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    data: any[];
    errors?: string[];
  }>({
    valid: false,
    message: "",
    data: [],
  });

  const [uploadStatus, setUploadStatus] = useState({
    success: 0,
    failed: 0,
    total: 0,
  });

  const sampleData = [
    {
      name: "Paracetamol 500mg",
      price: "12.50",
      description: "Pain reliever and fever reducer",
      imageUrl: "https://example.com/paracetamol.jpg",
      url: "https://pharmacy.com/paracetamol",
    },
    {
      name: "Ibuprofen 200mg",
      price: "15.75",
      description: "Non-steroidal anti-inflammatory drug (NSAID)",
      imageUrl: "https://example.com/ibuprofen.jpg",
      url: "https://pharmacy.com/ibuprofen",
    },
  ];

  const validateJson = (jsonString) => {
    try {
      if (!jsonString.trim()) {
        return { valid: false, message: "JSON data is empty", data: [] };
      }

      const data = JSON.parse(jsonString);

      if (!Array.isArray(data)) {
        return {
          valid: false,
          message: "JSON must be an array of products",
          data: [],
        };
      }

      if (data.length === 0) {
        return { valid: false, message: "JSON array is empty", data: [] };
      }

      const validationErrors = [];
      const isValidPrice = (value: string) => {
        return /^\d+(\.\d{1,2})?$/.test(value);
      };

      data.forEach((product, index) => {
        product.name = product.name?.trim();
        product.price = product.price?.trim();
        product.description = (product.description || product.about)?.trim();
        product.imageUrl = (product.imageUrl || product.img)?.trim();
        product.url = product.url?.trim();

        if (
          !product.name ||
          typeof product.name !== "string" ||
          !product.name.trim()
        ) {
          validationErrors.push(`Product ${index + 1}: Name is required`);
        }

        if (!product.price) {
          validationErrors.push(`Product ${index + 1}: Price is required`);
        } else if (
          !isValidPrice(product.price) ||
          isNaN(parseFloat(product.price)) ||
          parseFloat(product.price) <= 0
        ) {
          validationErrors.push(
            `Product ${
              index + 1
            }: Price must be a valid positive price (up to two decimal places)`
          );
        }

        const desc = product.description || product.about;
        if (!desc || typeof desc !== "string" || !desc.trim()) {
          validationErrors.push(
            `Product ${index + 1}: Description is required`
          );
        } else {
          product.description = desc;
        }

        const image = product.imageUrl || product.img;
        if (image) {
          if (typeof image !== "string" || !image.trim()) {
            validationErrors.push(`Product ${index + 1}: Image URL is invalid`);
          } else {
            try {
              new URL(image);
              product.imageUrl = image;
            } catch {
              validationErrors.push(
                `Product ${index + 1}: Image URL is invalid`
              );
            }
          }
        }

        if (product.url && typeof product.url === "string") {
          try {
            new URL(product.url);
          } catch {
            validationErrors.push(
              `Product ${index + 1}: Product URL is invalid`
            );
          }
        }
      });

      if (validationErrors.length > 0) {
        return {
          valid: false,
          message: "Validation errors:",
          errors: validationErrors,
          data: data,
        };
      }

      return {
        valid: true,
        message: `${data.length} products validated successfully`,
        data: data,
      };
    } catch (error) {
      return {
        valid: false,
        message: `Invalid JSON: ${error.message}`,
        data: [],
      };
    }
  };

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonData(value);

    if (value.trim()) {
      const result = validateJson(value);
      setValidationResult(result);
    } else {
      setValidationResult({ valid: true, message: "", data: [] });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JSON file",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (typeof content !== "string") {
        toast({
          variant: "destructive",
          title: "Invalid file content",
          description: "Please upload a valid JSON file",
        });
        return;
      }
      setJsonData(content);
      const result = validateJson(content);
      setValidationResult(result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!pharmacy?.id) return;

    if (!validationResult.valid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the validation errors before submitting",
      });
      return;
    }

    if (validationResult.data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No products to add",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStatus({
      success: 0,
      failed: 0,
      total: validationResult.data.length,
    });

    try {
      const products = validationResult.data;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < products.length; i++) {

        const product = products[i];
        try {
          await addProducts(
            product.name,
            parseFloat(product.price),
            product.description,
            product.imageUrl || null,
            product.url || null
          );
          successCount++;
        } catch (error) {
          console.error(`Error adding product ${product.name}:`, error);
          i--;
          failCount++;
        }

        const progress = Math.round(((i + 1) / products.length) * 100);
        setUploadProgress(progress);
        setUploadStatus({
          success: successCount,
          failed: failCount,
          total: products.length,
        });
      }

      toast({
        title: "Bulk Upload Complete",
        description: `Successfully added ${successCount} products. ${failCount} failed.`,
      });

      if (successCount > 0 && failCount === 0) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload products.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySampleData = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Bulk Add Products
            </CardTitle>
            <CardDescription>
              Add multiple products at once by providing JSON data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="json" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="json">JSON Input</TabsTrigger>
                <TabsTrigger value="file">File Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Paste your JSON data below
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={copySampleData}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Sample"}
                  </Button>
                </div>
                <Textarea
                  placeholder='[{"name": "Product Name""price": "10.99","description": "Product description","imageUrl": "https://example.com/image.jpg","url": "https://example.com/product"}]'
                  value={jsonData}
                  onChange={handleJsonChange}
                  rows={15}
                  style={{ scrollbarColor: "#374151 #1f2937" }}
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 font-mono text-sm resize-none"
                />
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-10 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 text-gray-300">
                    Upload a JSON file containing product data
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    File should contain an array of product objects
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="secondary" className="cursor-pointer">
                      Select File
                    </Button>
                  </label>
                  {jsonData && (
                    <p className="mt-4 text-sm text-gray-400">
                      File loaded! JSON contains {validationResult.data.length}{" "}
                      products.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {validationResult.message && (
              <Alert
                className={`mt-4 ${
                  validationResult.valid
                    ? "bg-green-900/30 text-green-300 border-green-800"
                    : "bg-red-900/30 text-red-300 border-red-800"
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    validationResult.valid ? "text-green-400" : "text-red-400"
                  }`}
                />
                <AlertTitle>
                  {validationResult.valid
                    ? "Validation Successful"
                    : "Validation Failed"}
                </AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {validationResult.message}
                  {validationResult.errors && (
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isSubmitting && (
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Uploading products...</span>
                  <span>
                    {uploadStatus.success} successful, {uploadStatus.failed}{" "}
                    failed (of {uploadStatus.total})
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/add-product")}
              className="border-gray-700"
            >
              Add Single Product
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !validationResult.valid ||
                validationResult.data.length === 0
              }
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Add Products
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BulkAddPage;
