import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Edit, Save, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewBranchForm } from "@/types/pharmacy";
import { cleanStreetName } from "@/constants/datapulling";

import { getBranchesByPharmacyId, modifyBranch } from "@/services/appwrite";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
const ModifyBranchPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<NewBranchForm>(initialFormState);
  const [errors, setErrors] = useState<any>({});
  const [branches, setBranches] = useState([]);
  const [branchID, setBranchID] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pharmacy?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (step === 0) {
          const branchData = await getBranchesByPharmacyId(pharmacy.id);
          setBranches(branchData);
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

  const prevStep = () => setStep((prev) => prev - 1);

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
      await modifyBranch(
        formData.name,
        parseFloat(formData.latitude.toString()),
        parseFloat(formData.longitude.toString()),
        formData.street,
        formData.borough,
        formData.city,
        formData.site_url || null,
        formData.location_link || null,
        formData.working_hours,
        formData.rating,
        formData.about,
        branchID
      );
      toast({ title: "Success", description: "Branch modified successfully!" });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to modify branch.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleSelectBranches(branch: any): void {
    setBranchID(branch?.$id);
    setFormData({
      name: branch.name || "",
      site_url: branch.site || "",
      borough: branch.borough || "",
      street: cleanStreetName(branch.street) || "",
      city: branch.city || "",
      latitude: branch.latitude,
      longitude: branch.longitude,
      rating: branch.rating,
      working_hours: branch.working_hours || "",
      about: branch.about || "",
      location_link: branch.location_link || "",
    });
    setStep(1);
  }

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
            <CardTitle className="text-xl font-bold">Modify Branch</CardTitle>
            <CardDescription>
              Follow the steps to modify an existing branch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1].map((num) => (
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
                {/* Branch Selection Step */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for a branch to modify..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                    />
                  </div>

                  {loading ? (
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
                          className="flex items-center p-3 border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => handleSelectBranches(branch)}
                        >
                          <div className="ml-3 flex-1">
                            <div className="font-medium">{branch.name}</div>
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
                        <p className="text-red-500 text-sm">
                          {errors.latitude}
                        </p>
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
                        <p className="text-red-500 text-sm">
                          {errors.longitude}
                        </p>
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
                      <p className="text-red-500 text-sm">
                        {errors.location_link}
                      </p>
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
                          <Save className="h-4 w-4" /> Save Branch
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModifyBranchPage;