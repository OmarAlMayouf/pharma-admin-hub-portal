import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewBranchForm } from "@/types/pharmacy";
import { addBranch } from "@/services/appwrite";
import { Label } from "@/components/ui/label";

const initialFormState: NewBranchForm = {
  name: "",
  site_url: "",
  borough: "",
  street: "",
  city: "",
  latitude: undefined,
  longitude: undefined,
  rating: undefined,
  working_hours: "",
  about: "",
  location_link: "",
};

const AddBranchPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<NewBranchForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "latitude" || name === "longitude" || name === "rating"
          ? value === ""
            ? undefined
            : parseFloat(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    let formErrors: any = {};

    const urlRegex =
      /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([/\w\.-]*)*\/?$/i;

    if (!formData.name) formErrors.name = "Branch Name is required.";
    if (!formData.latitude) formErrors.latitude = "Latitude is required.";
    if (!formData.longitude) formErrors.longitude = "Longitude is required.";
    if (formData.rating && (formData.rating < 0 || formData.rating > 5))
      formErrors.rating = "Rating should be between 0 and 5.";

    if (formData.site_url && !urlRegex.test(formData.site_url)) {
      formErrors.site_url = "Website URL must be valid.";
    }

    if (formData.location_link && !urlRegex.test(formData.location_link)) {
      formErrors.location_link = "Location URL must be valid.";
    }

    return formErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) return;

    if (!pharmacy?.id) return;

    setIsSubmitting(true);
    try {
      await addBranch(
        formData.name,
        formData.latitude,
        formData.longitude,
        formData.street,
        formData.borough,
        formData.city,
        formData.site_url || null,
        formData.location_link || null,
        formData.working_hours,
        formData.rating,
        formData.about
      );
      toast({ title: "Success", description: "Branch added successfully!" });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add branch.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-200">
              <Building2 className="h-6 w-6" /> Add New Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Branch Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Latitude *</Label>
                  <Input
                    name="latitude"
                    type="number"
                    value={formData.latitude ?? ""}
                    onChange={handleInputChange}
                    placeholder="Enter latitude"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-sm">{errors.latitude}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Longitude *</Label>
                  <Input
                    name="longitude"
                    type="number"
                    value={formData.longitude ?? ""}
                    onChange={handleInputChange}
                    placeholder="Enter longitude"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-sm">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Street</Label>
                  <Input
                    name="street"
                    value={formData.street || ""}
                    onChange={handleInputChange}
                    placeholder="Enter street"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Borough</Label>
                  <Input
                    name="borough"
                    value={formData.borough || ""}
                    onChange={handleInputChange}
                    placeholder="Enter borough"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">City</Label>
                  <Input
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Website URL</Label>
                <Input
                  name="site_url"
                  value={formData.site_url || ""}
                  onChange={handleInputChange}
                  placeholder="Enter website URL ( e.g., https://example.com )"
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                />
                {errors.site_url && (
                  <p className="text-red-500 text-sm">{errors.site_url}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Location URL</Label>
                <Input
                  name="location_link"
                  value={formData.location_link || ""}
                  onChange={handleInputChange}
                  placeholder="Enter location URL ( e.g., https://example.com )"
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                />
                {errors.location_link && (
                  <p className="text-red-500 text-sm">{errors.location_link}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Working Hours</Label>
                <Textarea
                  name="working_hours"
                  value={formData.working_hours || ""}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder='e.g., ("Monday": "8AM-1AM", "Tuesday":"8AM-1AM"...)'
                  style={{ scrollbarColor: "#374151 #1f2937" }}
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Rating</Label>
                <Input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating ?? ""}
                  onChange={handleInputChange}
                  placeholder="Enter rating (0-5)"
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                />
                {errors.rating && (
                  <p className="text-red-500 text-sm">{errors.rating}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">About</Label>
                <Textarea
                  name="about"
                  value={formData.about || ""}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter branch description"
                  style={{ scrollbarColor: "#374151 #1f2937" }}
                  className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" />
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> Add Branch
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBranchPage;