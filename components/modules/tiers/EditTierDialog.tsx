import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as yup from "yup";
import { useUpdateTier } from "@/services/tiers";
import { useGetModules } from "@/services/modules";
import TierModulesList from "@/components/modules/tiers/TierModulesList";
import { Loader } from "lucide-react";

interface EditTierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tierData: {
    id: string;
    tier: string;
    title: { en: string; bn: string };
    description: { en: string; bn: string };
  } | null;
}

const validationSchema = yup.object({
  titleEn: yup.string().required("English title is required"),
  titleBn: yup.string().required("Bengali title is required"),
  descEn: yup.string().required("English description is required"),
  descBn: yup.string().required("Bengali description is required"),
});

export default function EditTierDialog({
  isOpen,
  onClose,
  tierData,
}: EditTierDialogProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetModules(tierData?.tier || "");
  const { mutate: updateTier, isPending } = useUpdateTier();

  const [modules, setModules] = useState<any[]>([]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      titleEn: tierData?.title.en || "",
      titleBn: tierData?.title.bn || "",
      descEn: tierData?.description.en || "",
      descBn: tierData?.description.bn || "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (!tierData) return;

      const hasModuleUpdated =
        JSON.stringify(modules) !== JSON.stringify(data?.result || []);

      updateTier(
        {
          tier: {
            id: tierData.id,
            title: { en: values.titleEn, bn: values.titleBn },
            description: { en: values.descEn, bn: values.descBn },
          },
          ...(hasModuleUpdated && { modules }),
        },
        {
          onSuccess: () => onClose(),
          onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tiers"] });
            onClose();
          },
        }
      );
    },
  });

  useEffect(() => {
    if (tierData) {
      formik.setValues({
        titleEn: tierData.title.en,
        titleBn: tierData.title.bn,
        descEn: tierData.description.en,
        descBn: tierData.description.bn,
      });
    }
  }, [tierData]);

  // Fetch modules when tierData changes
  useEffect(() => {
    if (tierData) {
      // Replace with your actual fetch logic if needed
      // For now, assume modules are fetched via useGetModules
      setModules(data?.result || []);
    }
  }, [tierData, data]);

  // Remove module handler
  const handleRemoveModule = (moduleId: string) => {
    setModules(() => {
      const target = modules.find((m) => m.id === moduleId);
      const updated = { ...target, isActive: false };
      return modules.map((m) => (m.id === moduleId ? updated : m));
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] min-w-[90vw] p-0 gap-0"
        aria-describedby="tier-detail-dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle>Edit Tier</DialogTitle>
        </DialogHeader>
        <div className="h-[75vh] flex gap-0">
          {/* Left: Form */}
          <div className="w-[45vw] px-6 py-6 ">
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-4 flex flex-col h-full"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title (English)
                </label>
                <Input
                  name="titleEn"
                  value={formik.values.titleEn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter English title"
                />
                {formik.touched.titleEn && formik.errors.titleEn && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.titleEn}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title (Bengali)
                </label>
                <Input
                  name="titleBn"
                  value={formik.values.titleBn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="বাংলা শিরোনাম লিখুন"
                />
                {formik.touched.titleBn && formik.errors.titleBn && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.titleBn}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (English)
                </label>
                <Textarea
                  name="descEn"
                  value={formik.values.descEn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter English description"
                  rows={3}
                />
                {formik.touched.descEn && formik.errors.descEn && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.descEn}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (Bengali)
                </label>
                <Textarea
                  name="descBn"
                  value={formik.values.descBn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="বাংলা বর্ণনা লিখুন"
                  rows={3}
                />
                {formik.touched.descBn && formik.errors.descBn && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.descBn}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-auto">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={!formik.isValid || formik.isSubmitting || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>

          {/* Right: Modules List */}
          <div className="flex-1">
            <TierModulesList
              isLoading={isLoading}
              modules={modules}
              onModuleRemove={handleRemoveModule}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
