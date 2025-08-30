import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader, Plus } from "lucide-react";
import ModuleForm from "@/components/modules/tiers/CreateTier/ModuleForm";
import { useGetTiers } from "@/services/tiers";
import { useCreateModules } from "@/services/modules";

export default function CreateModuleDialog() {
  const queryClient = useQueryClient();

  const { data: tierData } = useGetTiers();

  // TODO: add 'ONBOARDING' tier to DB
  const tiers = [
    { label: "ONBOARDING", value: "ONBOARDING" },
    ...(tierData?.result?.map((t: { tier: string }) => ({
      label: t.tier.split("_").join(" "),
      value: t.tier,
    })) || []),
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSubmissionDialog, setShowSubmissionDialog] =
    useState<boolean>(false);
  const [modules, setModules] = useState<any[]>([]);

  const { mutate: createModules, isPending } = useCreateModules();

  const handleSubmitClick = () => {
    if (modules.length === 0) {
      toast.error("Please add at least one module before submitting");
      return;
    }
    setShowSubmissionDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowSubmissionDialog(false);

      createModules(modules, {
        onSuccess: () => {
          toast.success(
            `${modules.length} module${
              modules.length !== 1 ? "s" : ""
            } created successfully`
          );
        },
        onError: (error) => {
          console.error("Error creating modules:", error);
          toast.error("Failed to create modules");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["modules"] });
          setIsOpen(false);
          setModules([]);
        },
      });
    } catch (error) {
      toast.error("Failed to create modules");
    }
  };

  const handleCancelSubmit = () => {
    setShowSubmissionDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <DialogTrigger asChild>
          <Button className="ml-4 flex items-center cursor-pointer" size="sm">
            <Plus /> Add New Modules
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-h-[90vh] min-w-[90vw] p-0 gap-0"
          aria-describedby="create-tier-dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle>Add New Modules</DialogTitle>
          </DialogHeader>
          <div className="h-[80vh] flex gap-0">
            <div className="flex-1 border-gray-100 flex flex-col">
              <ModuleForm
                modules={modules}
                setModules={setModules}
                showTierSelect
                tierOptions={tiers}
                onSubmit={handleSubmitClick}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Confirmation Dialog */}
      <Dialog
        open={showSubmissionDialog}
        onOpenChange={setShowSubmissionDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Module Submission</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {modules.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to submit {modules.length} module
                  {modules.length !== 1 ? "s" : ""}? This action cannot be
                  undone.
                </p>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Modules to be created:</p>
                  <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                    {modules.map((module, index) => (
                      <p key={index} className="text-xs text-gray-600 py-1">
                        • {module.title?.en || "Untitled Module"}
                        {module.tier &&
                          ` (${module.tier?.split("_").join(" ")})`}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={handleCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleConfirmSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit {modules.length} Module
                  {modules.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
