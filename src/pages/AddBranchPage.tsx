
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { NewBranchForm } from "@/types/pharmacy";
const branchFormSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  site_url: z
    .string()
    .optional()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL format",
    }),
  borough: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number",
  }),
  longitude: z.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number",
  }),
  rating: z.number().min(0).max(5).optional(),
  working_hours: z.string().optional(),
  about: z.string().optional(),
  location_link: z
    .string()
    .optional()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL format",
    }),
});



const AddBranchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<NewBranchForm>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: NewBranchForm) => {
    try {
      // TODO: Implement branch creation logic
      console.log("Branch data:", { ...data, pharmacyId: user?.pharmacyId });
      toast({
        title: "Branch Added Successfully",
        description: "The new branch has been added to your pharmacy.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add branch. Please try again.",
      });
    }
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

        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Building2 className="h-6 w-6" />
              Add New Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Branch Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter branch name"
                          {...field}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Latitude *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter latitude"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Longitude *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter longitude"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Street</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter street"
                            {...field}
                            className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="borough"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Borough</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter borough"
                            {...field}
                            className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            {...field}
                            className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="site_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Website URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="Enter website URL"
                          {...field}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="Enter location link (e.g., Google Maps)"
                          {...field}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="working_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Working Hours</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='e.g., {"Monday": "8AM-1AM", "Tuesday":"8AM-1AM"...}'
                          {...field}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 resize-none max-h-20"
                          style={{ scrollbarColor: "#374151 #1f2937" }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Rating</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          placeholder="Enter rating (0-5)"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">About</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter branch description"
                          {...field}
                          className="bg-gray-900/50 border-gray-700 text-gray-300/70 placeholder:text-gray-500 resize-none max-h-20"
                          style={{ scrollbarColor: "#374151 #1f2937" }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" className="w-full">
                    Add Branch
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBranchPage;
