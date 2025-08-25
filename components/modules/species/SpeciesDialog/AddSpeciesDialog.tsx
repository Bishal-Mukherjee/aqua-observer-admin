"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CloudUpload,
  X,
  Plus,
  MapPin,
  Eye,
  Save,
  AlertCircle,
  PawPrint,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeciesFormData {
  commonName: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  geographicDistribution: string[];
  identificationFeatures: string[];
  image: File | null;
}

const CATEGORIES = [
  { value: "BIRD", label: "Bird" },
  { value: "MAMMAL", label: "Mammal" },
  { value: "REPTILE", label: "Reptile" },
];

const CONSERVATION_STATUS = [
  {
    value: "CRITICALLY_ENDANGERED",
    label: "Critically Endangered",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "ENDANGERED",
    label: "Endangered",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "VULNERABLE",
    label: "Vulnerable",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "NEAR_THREATENED",
    label: "Near Threatened",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "LEAST_CONCERN",
    label: "Least Concern",
    color: "bg-green-100 text-green-800",
  },
];

const HABITAT_OPTIONS = [
  "RIVERS",
  "WETLANDS",
  "COASTAL_AREAS",
  "MANGROVES",
  "ESTUARIES",
  "FRESHWATER_LAKES",
  "MARINE",
];

const GEOGRAPHIC_REGIONS = [
  "WEST_BENGAL",
  "BIHAR",
  "ODISHA",
  "JHARKHAND",
  "ASSAM",
  "TRIPURA",
  "MIZORAM",
];

// Validation schema using Yup
const validationSchema = Yup.object({
  commonName: Yup.string()
    .required("Common name is required")
    .min(2, "Common name must be at least 2 characters")
    .max(100, "Common name must be less than 100 characters"),
  scientificName: Yup.string().nullable(),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      CATEGORIES.map((category) => category.value),
      "Invalid category"
    ),
  conservationStatus: Yup.string()
    .required("Conservation status is required")
    .oneOf(
      CONSERVATION_STATUS.map((status) => status.value),
      "Invalid conservation status"
    ),
  habitat: Yup.array()
    .of(Yup.string())
    .min(1, "At least one habitat is required"),
  geographicDistribution: Yup.array()
    .of(Yup.string())
    .min(1, "At least one geographic region is required"),
  identificationFeatures: Yup.array().of(Yup.string()),
  image: Yup.mixed().nullable(),
});

export const AddSpeciesDialog = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const formik = useFormik<SpeciesFormData>({
    initialValues: {
      commonName: "",
      scientificName: "",
      category: "",
      conservationStatus: "",
      habitat: [],
      geographicDistribution: [],
      identificationFeatures: [],
      image: null,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Species data submitted:", values);
      //   handleClose();
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addToArray = (
    field: "habitat" | "geographicDistribution",
    value: string
  ) => {
    if (value && !formik.values[field].includes(value)) {
      formik.setFieldValue(field, [...formik.values[field], value]);
    }
  };

  const removeFromArray = (
    field: "habitat" | "geographicDistribution" | "identificationFeatures",
    value: string
  ) => {
    formik.setFieldValue(
      field,
      formik.values[field].filter((item) => item !== value)
    );
  };

  const addIdentificationFeature = () => {
    if (
      newFeature.trim() &&
      !formik.values.identificationFeatures.includes(newFeature.trim())
    ) {
      formik.setFieldValue("identificationFeatures", [
        ...formik.values.identificationFeatures,
        newFeature.trim(),
      ]);
      setNewFeature("");
    }
  };

  const handleSubmit = () => {
    console.log("Species data submitted:", formik.values);
  };

  const handleClose = () => {
    formik.resetForm();
    setImagePreview(null);
    setNewFeature("");
    setIsOpen(false);
  };

  const getFieldError = (fieldName: keyof SpeciesFormData) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? String(formik.errors[fieldName])
      : undefined;
  };

  const isFieldInvalid = (fieldName: keyof SpeciesFormData) => {
    return formik.touched[fieldName] && !!formik.errors[fieldName];
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PawPrint className="h-4 w-4" />
          <p>Add New Species</p>
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-[75vw] p-0">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-medium flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Create Species Profile
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh] py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6 px-6">
              <div className="space-y-2">
                <Label htmlFor="commonName">Common Name*</Label>
                <Input
                  id="commonName"
                  name="commonName"
                  value={formik.values.commonName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Indian Skimmer"
                  className={cn(
                    isFieldInvalid("commonName") && "border-red-500"
                  )}
                />
                {getFieldError("commonName") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("commonName")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input
                  id="scientificName"
                  name="scientificName"
                  value={formik.values.scientificName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Rynchops albicollis"
                  className={cn(
                    "italic",
                    isFieldInvalid("scientificName") && "border-red-500"
                  )}
                />
                {getFieldError("scientificName") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("scientificName")}
                  </p>
                )}
              </div>
            </div>

            {/* Category and Conservation Status */}
            <div className="grid grid-cols-2 gap-6 mt-4 px-6">
              <div className="space-y-2">
                <Label>Category*</Label>
                <Select
                  value={formik.values.category}
                  onValueChange={(value) => {
                    formik.setFieldValue("category", value);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-60",
                      isFieldInvalid("category") && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("category") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("category")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Conservation Status*</Label>
                <Select
                  value={formik.values.conservationStatus}
                  onValueChange={(value) => {
                    formik.setFieldValue("conservationStatus", value);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-60",
                      isFieldInvalid("conservationStatus") && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSERVATION_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <Badge className={cn("text-xs", status.color)}>
                          {status.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("conservationStatus") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("conservationStatus")}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2 mt-4 px-6">
              <Label>Species Image</Label>
              <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Species preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          formik.setFieldValue("image", null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                        <CloudUpload className="h-12 w-12" />
                        <p className="text-sm font-medium">
                          Click to upload species image
                        </p>
                        <p className="text-xs">PNG, JPG up to 3MB</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location & Environment */}
            <div className="space-y-2 mt-4 px-6">
              <h3 className="text-md font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Environment
              </h3>

              {/* Habitat */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Habitat*</Label>
                  <Select
                    onValueChange={(value) => addToArray("habitat", value)}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Add habitat" />
                    </SelectTrigger>
                    <SelectContent>
                      {HABITAT_OPTIONS.filter(
                        (h) => !formik.values.habitat.includes(h)
                      ).map((habitat) => (
                        <SelectItem key={habitat} value={habitat}>
                          {habitat.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formik.values.habitat.map((habitat) => (
                    <Badge
                      key={habitat}
                      variant="outline"
                      className="bg-green-50 text-green-800"
                    >
                      {habitat.replace(/_/g, " ")}
                      <Button
                        onClick={() => removeFromArray("habitat", habitat)}
                        size={"icon"}
                        className="bg-transparent hover:bg-transparent cursor-pointer w-4 h-4 ml-2"
                      >
                        <X className="h-3 w-3 text-black" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {getFieldError("habitat") && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("habitat")}
                  </p>
                )}
              </div>

              {/* Geographic Distribution */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Geographic Distribution*</Label>
                  <Select
                    onValueChange={(value) =>
                      addToArray("geographicDistribution", value)
                    }
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Add region" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEOGRAPHIC_REGIONS.filter(
                        (r) => !formik.values.geographicDistribution.includes(r)
                      ).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formik.values.geographicDistribution.map((region) => (
                    <Badge
                      key={region}
                      variant="outline"
                      className="bg-blue-50 text-blue-800"
                    >
                      {region.replace(/_/g, " ")}
                      <Button
                        onClick={() =>
                          removeFromArray("geographicDistribution", region)
                        }
                        size={"icon"}
                        className="bg-transparent hover:bg-transparent cursor-pointer w-4 h-4 ml-2"
                      >
                        <X className="h-3 w-3 text-black" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {getFieldError("geographicDistribution") && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("geographicDistribution")}
                  </p>
                )}
              </div>
            </div>

            {/* Identification Features */}
            <div className="space-y-2 mt-4 px-6">
              <h3 className="text-md font-medium flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Identification Features
              </h3>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="e.g., Black and white plumage"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addIdentificationFeature())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addIdentificationFeature}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formik.values.identificationFeatures.map(
                    (feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-50 text-purple-800"
                      >
                        {feature}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() =>
                            removeFromArray("identificationFeatures", feature)
                          }
                        />
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>

            <ScrollBar orientation="horizontal" className="mt-2" />
          </ScrollArea>

          <DialogFooter className="border-t pt-2 pb-2 px-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              <Save className="h-4 w-4" />
              Save Species
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
