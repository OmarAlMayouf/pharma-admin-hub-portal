import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteBranches, getBranchesByPharmacyId } from "@/services/appwrite";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const DeleteBranchPage: React.FC = () => {
  const { pharmacy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!pharmacy?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const branchData = await getBranchesByPharmacyId(pharmacy.id);
        setBranches(branchData);
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
  }, [pharmacy?.id]);

  const handleSelectBranch = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranches((prev) => [...prev, branchId]);
    } else {
      setSelectedBranches((prev) => prev.filter((id) => id !== branchId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBranches(filteredBranches.map((branch) => branch?.$id));
    } else {
      setSelectedBranches([]);
    }
  };

  const handleDeleteBranches = async () => {
    if (selectedBranches.length === 0) return;

    setIsDeleting(true);
    try {
      await deleteBranches(selectedBranches);

      setBranches((prev) =>
        prev.filter((branch) => !selectedBranches.includes(branch?.$id))
      );

      toast({
        title: "Branches Deleted Successfully",
        description: `${selectedBranches.length} branch(s) have been removed from your system.`,
      });

      setSelectedBranches([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete branches. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              Delete Branches
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select branches to remove from your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search branches..."
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
                      disabled={selectedBranches.length === 0 || isDeleting}
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
                        delete the selected branch(s) from your system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteBranches}>
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
              ) : filteredBranches.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <p>No branches found matching your search.</p>
                </div>
              ) : (
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="grid grid-cols-[40px_auto_100px] gap-4 p-3 bg-gray-900/50 font-medium text-sm text-gray-300">
                    <div>
                      <Checkbox
                        checked={
                          filteredBranches.length > 0 &&
                          selectedBranches.length === filteredBranches.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                    <div>Branch</div>
                    <div></div>
                  </div>

                  <div
                    className="max-h-96 overflow-y-auto"
                    style={{ scrollbarColor: "#374151 #1f2937" }}
                  >
                    {filteredBranches.map((branch) => (
                      <div
                        key={branch?.$id}
                        className="grid grid-cols-[40px_auto_100px] gap-4 items-center p-3 border-t border-gray-800 hover:bg-gray-800/50"
                      >
                        <div>
                          <Checkbox
                            checked={selectedBranches.includes(branch?.$id)}
                            onCheckedChange={(checked) =>
                              handleSelectBranch(branch?.$id, !!checked)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{branch.name}</p>
                          </div>
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
                                  Delete this branch?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete "{branch.name}" from your
                                  system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setSelectedBranches([branch?.$id]);
                                    handleDeleteBranches();
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

export default DeleteBranchPage;
