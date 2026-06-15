"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  X,
  Plus,
  MapPin,
  Eye,
  Save,
  AlertCircle,
  Edit2,
  Link as LinkIcon,
  ExternalLink,
  Loader,
  Upload,
  Image,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import validateUrl from "@/lib/validate-links";
import { useUpdateSpecies } from "@/services/species";
import { toast } from "sonner";

interface SpeciesFormData {
  commonName: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  geographicDistribution: string[];
  identificationFeatures: string[];
  image: string;
  ageGroup: string;
  isActive: boolean;
}

interface EditSpeciesDialogProps {
  species: any;
  onClose: () => void;
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
  image: Yup.string(),
  ageGroup: Yup.string().required("Age group is required"),
});

export const EditSpeciesDialog = ({
  species,
  onClose,
}: EditSpeciesDialogProps) => {
  const queryClient = useQueryClient();
  const { mutate: updateSpecies, isPending: isUpdating } = useUpdateSpecies();
  const { uploadFile, isLoading: isUploading } = useFileUpload();

  const [isOpen, setIsOpen] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [imageMethod, setImageMethod] = useState<"upload" | "link">("link");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isValidatingImageUrl, setIsValidatingImageUrl] = useState(false);

  const formik = useFormik<SpeciesFormData>({
    initialValues: {
      commonName: "",
      scientificName: "",
      category: "",
      conservationStatus: "",
      habitat: [],
      geographicDistribution: [],
      identificationFeatures: [],
      image: "",
      ageGroup: "",
      isActive: false,
    },
    validationSchema,
    onSubmit: (values) => {
      updateSpecies(
        {
          id: species.id,
          scientificName: values.scientificName,
          category: values.category,
          conservationStatus: values.conservationStatus,
          habitat: values.habitat,
          regionDistribution: values.geographicDistribution,
          identificationFeatures: values.identificationFeatures,
          image: values.image,
          ageGroup: values.ageGroup,
          isActive: values.isActive,
        },
        {
          onSuccess: () => {
            toast.success("Species updated successfully");
          },
          onError: () => {
            toast.error("Error updating species");
          },
          onSettled: () => {
            handleClose();
            queryClient.invalidateQueries({ queryKey: ["species"] });
          },
        }
      );
    },
  });

  // Populate form with species data when dialog opens
  useEffect(() => {
    if (species) {
      formik.setValues({
        commonName: species.label?.en || "",
        scientificName: species.scientificName || "",
        category: species.category || "",
        conservationStatus: species.conservationStatus || "",
        habitat: species.habitat || [],
        geographicDistribution: species.regionDistribution || [],
        identificationFeatures: species.identificationFeatures || [],
        image: species.image || "",
        ageGroup: species.ageGroup || "",
        isActive: species.isActive,
      });

      // Set existing image preview
      //   if (species.image) {
      //     formik.setFieldValue("image", species.image);
      //   }
    }
  }, [species, isOpen]);

  // Handle file upload
  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    formik.setFieldValue("image", "");
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const uploadedFile = await uploadFile(
        "platform-assets",
        "species",
        file
      );
      if (uploadedFile?.publicURL) {
        formik.setFieldValue("image", uploadedFile.publicURL);
      }
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
      const result = await validateUrl(value);
      if (result.valid) {
        formik.setFieldValue("image", value);
        formik.setFieldError("image", "");
      } else {
        formik.setFieldError("image", result.error || "Invalid URL");
      }
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
    setIsOpen(false);
    onClose();
  };

  const getFieldError = (fieldName: keyof SpeciesFormData) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? String(formik.errors[fieldName])
      : undefined;
  };

  const isFieldInvalid = (fieldName: keyof SpeciesFormData) => {
    return formik.touched[fieldName] && !!formik.errors[fieldName];
  };

  if (!species) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(vallue) => {
        if (!vallue) handleClose();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 rounded-full cursor-pointer bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[75vw] max-w-[90vw] p-0">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-medium flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Species Profile
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh] py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6 px-6">
              {/* <div className="space-y-2">
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
              </div> */}

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
                {formik.values.ageGroup && (
                  <p className="text-xs text-gray-600 ml-1">
                    {formik.values.ageGroup === "duo"
                      ? `For ${
                          formik.values.commonName || "species"
                        } submissions for 'Adult' and 'Subadult' will be made`
                      : `For ${
                          formik.values.commonName || "species"
                        } submissions for 'Adult Male', 'Adult Female', 'Subadult' will be made`}
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
                  {typeof formik.values.image === "string" &&
                    formik.values.image && (
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
                          {!formik.values.image && isUploading ? (
                            <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                          ) : (
                            <Image className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <Link
                            href={formik.values.image}
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
                            Click to upload thumbnail image
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
                    value={
                      typeof formik.values.image === "string"
                        ? formik.values.image
                        : ""
                    }
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
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
              disabled={isUpdating || !formik.isValid}
            >
              {isUpdating ? (
                <Loader className="animate-spin w-4 h-4 text-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update Species
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
