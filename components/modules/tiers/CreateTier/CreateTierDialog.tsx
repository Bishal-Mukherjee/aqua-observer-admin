import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as yup from "yup";
import { Plus } from "lucide-react";
import TierForm from "@/components/modules/tiers/CreateTier/TierForm";
import ModuleForm from "@/components/modules/tiers/CreateTier/ModuleForm";
import { useCreateTier } from "@/services/tiers";
import { toast } from "sonner";

const validationSchema = yup.object({
  titleEn: yup.string().required("English title is required"),
  titleBn: yup.string().required("Bengali title is required"),
  descEn: yup.string().required("English description is required"),
  descBn: yup.string().required("Bengali description is required"),
});

export default function CreateTierDialog() {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modules, setModules] = useState<any[]>([]);

  const { mutate: createTier, isPending } = useCreateTier();

  const formik = useFormik({
    initialValues: {
      titleEn: "",
      titleBn: "",
      descEn: "",
      descBn: "",
    },
    validationSchema,
    onSubmit: (values) => {
      createTier(
        {
          tier: {
            title: { en: values.titleEn, bn: values.titleBn },
            description: { en: values.descEn, bn: values.descBn },
          },
          modules: modules,
        },
        {
          onSuccess: () => {
            toast.success("Tier created successfully!");
            setIsOpen(false);
          },
          onError: () => {
            toast.error("Failed to create tier.");
          },
          onSettled: () => {
            formik.resetForm();
            queryClient.invalidateQueries({ queryKey: ["tiers"] });
          },
        }
      );
    },
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DialogTrigger asChild>
        <Button className="ml-4 flex items-center cursor-pointer" size="sm">
          <Plus /> Add New Tier
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] min-w-[90vw] p-0 gap-0"
        aria-describedby="create-tier-dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle>Create New Tier</DialogTitle>
        </DialogHeader>
        <div className="h-[calc(90vh-72px)] flex gap-0">
          {/* Left: Tier Form */}
          <TierForm
            formik={formik}
            onClose={handleClose}
            isPending={isPending}
          />
          {/* Right: Module Management */}
          <ModuleForm modules={modules} setModules={setModules} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
