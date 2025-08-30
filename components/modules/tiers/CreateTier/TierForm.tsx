import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

export default function TierForm({
  formik,
  onClose,
  isPending = false,
}: {
  formik: any;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="w-[45vw] p-6 border-r border-gray-100">
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
            rows={4}
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
            rows={4}
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
                Creating...
              </>
            ) : (
              "Create Tier"
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}
