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
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Loader,
  Image,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
// Add these imports if they exist in your project
// import { useFileUpload } from "@/hooks/useFileUpload";
// import validateUrl from "@/lib/validate-links";

interface SpeciesFormData {
  label_en: string;
  label_bn: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  geographicDistribution: string[];
  identificationFeatures: string[];
  image: string;
  ageGroup: string;
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
  "COASTAL",
  "LAKES",
  "MARSHES",
  "PONDS",
  "FIELDS",
];

const GEOGRAPHIC_REGIONS = [
  "WEST_BENGAL",
  "BIHAR",
  "ODISHA",
  "JHARKHAND",
  "ASSAM",
  "TRIPURA",
  "MIZORAM",
  "UTTAR_PRADESH",
  "ANDAMAN",
  "GUJARAT",
  "RAJASTHAN",
  "MAHARASHTRA",
];

const AGE_GROUP_OPTIONS = [
  { value: "duo", label: "Duo" },
  { value: "trio", label: "Trio" },
];

// Validation schema using Yup
const validationSchema = Yup.object({
  label_en: Yup.string()
    .required("Common name is required")
    .min(2, "Common name must be at least 2 characters")
    .max(100, "Common name must be less than 100 characters"),
  label_bn: Yup.string().nullable(),
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
  image: Yup.string(),
  ageGroup: Yup.string().required("Age group is required"),
});

export const AddSpeciesDialog = () => {
  const [newFeature, setNewFeature] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [imageMethod, setImageMethod] = useState<"upload" | "link">("link");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isValidatingImageUrl, setIsValidatingImageUrl] = useState(false);
  // Uncomment if you have these hooks
  // const { uploadFile, isLoading: isUploading } = useFileUpload();

  const formik = useFormik<SpeciesFormData>({
    initialValues: {
      label_en: "",
      label_bn: "",
      scientificName: "",
      category: "",
      conservationStatus: "",
      habitat: [],
      geographicDistribution: [],
      identificationFeatures: [],
      image: "",
      ageGroup: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Species data submitted:", values);
      handleClose();
    },
  });

  // Handle file upload
  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    formik.setFieldValue("image", "");
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Uncomment and modify if you have file upload functionality
      // const uploadedFile = await uploadFile("aqua-observer-bucket", file);
      // if (uploadedFile?.publicURL) {
      //   formik.setFieldValue("image", uploadedFile.publicURL);
      // }

      // For now, create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        formik.setFieldValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove file
  const removeImageFile = () => {
    setImageFile(null);
    formik.setFieldValue("image", "");
  };

  // Validate image URL
  const handleImageUrlChange = async (value: string) => {
    if (!value.trim()) {
      formik.setFieldValue("image", "");
      formik.setFieldError("image", "");
      return;
    }
    setIsValidatingImageUrl(true);
    try {
      // Uncomment if you have URL validation
      // const result = await validateUrl(value);
      // if (result.valid) {
      //   formik.setFieldValue("image", value);
      //   formik.setFieldError("image", "");
      // } else {
      //   formik.setFieldError("image", result.error || "Invalid URL");
      // }

      // For now, just set the value
      formik.setFieldValue("image", value);
      formik.setFieldError("image", "");
    } catch {
      formik.setFieldError("image", "Error validating URL");
    } finally {
      setIsValidatingImageUrl(false);
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

  const handleClose = () => {
    formik.resetForm();
    setNewFeature("");
    setImageFile(null);
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

      <DialogContent className="min-w-[75vw] max-w-[90vw] p-0">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-medium flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              Create Species Profile
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh] py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-6 px-6">
              <div className="space-y-2">
                <Label htmlFor="label_en">Common Name*</Label>
                <Input
                  id="label_en"
                  name="label_en"
                  value={formik.values.label_en}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Indian Skimmer"
                  className={cn(isFieldInvalid("label_en") && "border-red-500")}
                />
                {getFieldError("label_en") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("label_en")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="label_bn">Common Name (Bengali)</Label>
                <Input
                  id="label_bn"
                  name="label_bn"
                  value={formik.values.label_bn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., ভারতীয় স্কিমার"
                  className={cn(isFieldInvalid("label_bn") && "border-red-500")}
                />
                {getFieldError("label_bn") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("label_bn")}
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

            {/* Category, Conservation Status, and Age Group */}
            <div className="grid grid-cols-3 gap-6 mt-4 px-6">
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
                      "w-full",
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
                      "w-full",
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

              {/* Age Group */}
              <div className="space-y-2">
                <Label>Age Group*</Label>
                <Select
                  value={formik.values.ageGroup}
                  onValueChange={(value) => {
                    formik.setFieldValue("ageGroup", value);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      isFieldInvalid("ageGroup") && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_GROUP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("ageGroup") && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("ageGroup")}
                  </p>
                )}
              </div>
            </div>

            {/* Age Group Description */}
            {formik.values.ageGroup && (
              <div className="mt-2 px-6">
                <p className="text-xs text-gray-600 ml-1">
                  {formik.values.ageGroup === "duo"
                    ? `For ${
                        formik.values.label_en || "species"
                      } submissions for 'Adult' and 'Subadult' will be made`
                    : `For ${
                        formik.values.label_en || "species"
                      } submissions for 'Adult Male', 'Adult Female', 'Subadult' will be made`}
                </p>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2 mt-4 px-6">
              <Label className="block text-sm font-medium mb-2">
                Species Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-2 mb-3">
                <Button
                  type="button"
                  variant={imageMethod === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMethod("upload")}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={imageMethod === "link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMethod("link")}
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
                <div className="flex items-center gap-1 ml-auto">
                  {formik.values.image && (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <Link
                        href={formik.values.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600"
                      >
                        View
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {imageMethod === "upload" ? (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imageFile ? (
                      <div className="flex items-center justify-between bg-gray-50 pl-2 rounded">
                        <div className="flex items-center">
                          {!formik.values.image ? (
                            <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                          ) : (
                            <Image className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <Link
                            href={formik.values.image || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("text-sm text-blue-600", {
                              "pointer-events-none text-gray-500":
                                !formik.values.image,
                            })}
                          >
                            {imageFile.name}
                          </Link>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImageFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                          id="species-image-upload"
                        />
                        <label
                          htmlFor="species-image-upload"
                          className="cursor-pointer"
                        >
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload species image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 3MB
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    name="image"
                    value={formik.values.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={isValidatingImageUrl}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {formik.values.image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          formik.setFieldValue("image", "");
                          formik.setFieldError("image", "");
                        }}
                        disabled={isValidatingImageUrl}
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </Button>
                    )}
                    {isValidatingImageUrl && (
                      <Loader className="animate-spin w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {formik.touched.image && formik.errors.image && (
                <div className="text-xs text-red-600 mt-1">
                  {formik.errors.image}
                </div>
              )}
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
                        <X className="h-2 w-2 text-black" />
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
                        <X className="h-2 w-2 text-black" />
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
                        <Button
                          onClick={() =>
                            removeFromArray("identificationFeatures", feature)
                          }
                          size={"icon"}
                          className="bg-transparent hover:bg-transparent cursor-pointer w-4 h-4 ml-2"
                        >
                          <X className="h-2 w-2 text-black" />
                        </Button>
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
