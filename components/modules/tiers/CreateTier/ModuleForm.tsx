import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Link as LinkIcon,
  X,
  Image,
  Loader,
  Video,
} from "lucide-react";
import { isEmpty } from "lodash";
import { cn } from "@/lib/utils";
import validateUrl from "@/lib/validate-links";
import { useFileUpload } from "@/hooks/useFileUpload";

const moduleValidationSchema = yup.object({
  tier: yup.string().when("showTierSelect", {
    is: true,
    then: (schema) => schema.required("Tier selection is required"),
    otherwise: (schema) => schema.optional(),
  }),
  titleEn: yup.string().required("English title is required"),
  titleBn: yup.string().required("Bengali title is required"),
  descEn: yup.string().required("English description is required"),
  descBn: yup.string().required("Bengali description is required"),
});

const fileUploadSchema = yup.object({
  url: yup.string().url("Please enter a valid URL").required("URL is required"),
  thumbnail: yup.string().url("Please enter a valid URL").optional(),
  type: yup.string().required("Module type is required"),
});

export default function ModuleForm({
  tierOptions = [],
  modules,
  setModules,
  showTierSelect = false,
  onSubmit,
}: {
  tierOptions?: { label: string; value: string }[];
  modules: any[];
  setModules: React.Dispatch<React.SetStateAction<any[]>>;
  showTierSelect?: boolean;
  onSubmit?: () => void;
}) {
  const { uploadFile, isLoading: isUploading } = useFileUpload();

  const [currentStep, setCurrentStep] = useState(1);
  const [thumbnailMethod, setThumbnailMethod] = useState<"upload" | "link">(
    "upload",
  );
  const [urlMethod, setUrlMethod] = useState<"upload" | "link">("upload");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [urlFile, setUrlFile] = useState<File | null>(null);
  const [showModuleList, setShowModuleList] = useState(false);

  // Add loading states for URL validation
  const [isValidatingThumbnailUrl, setIsValidatingThumbnailUrl] =
    useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  const moduleFormik = useFormik({
    initialValues: {
      tier: "",
      titleEn: "",
      titleBn: "",
      descEn: "",
      descBn: "",
    },
    validationSchema: moduleValidationSchema,
    onSubmit: (values) => {
      const newModule = {
        ...(showTierSelect ? { tier: values.tier } : {}),
        title: { en: values.titleEn, bn: values.titleBn },
        description: { en: values.descEn, bn: values.descBn },
      };
      setModules((prev) => [...prev, newModule]);
      moduleFormik.resetForm();
      setCurrentStep(1);
    },
  });

  const fileFormik = useFormik({
    initialValues: {
      url: "",
      thumbnail: "",
      type: "NORMAL",
    },
    validationSchema: fileUploadSchema,
    onSubmit: (values) => {
      const completeModule = {
        ...(showTierSelect ? { tier: moduleFormik.values.tier } : {}),
        title: {
          en: moduleFormik.values.titleEn,
          bn: moduleFormik.values.titleBn,
        },
        description: {
          en: moduleFormik.values.descEn,
          bn: moduleFormik.values.descBn,
        },
        url: values.url,
        thumbnail: values.thumbnail || null,
        type: values.type,
      };

      setModules((prev) => [...prev, completeModule]);

      moduleFormik.resetForm();
      fileFormik.resetForm();
      setCurrentStep(1);
      setThumbnailFile(null);
      setUrlFile(null);
    },
  });

  // Handle thumbnail URL validation
  const handleThumbnailUrlChange = async (value: string) => {
    if (!value.trim()) {
      fileFormik.setFieldValue("thumbnail", "");
      fileFormik.setFieldError("thumbnail", "");
      return;
    }

    setIsValidatingThumbnailUrl(true);

    try {
      const result = await validateUrl(value);

      if (result.valid) {
        fileFormik.setFieldValue("thumbnail", value);
        fileFormik.setFieldError("thumbnail", "");
      } else {
        fileFormik.setFieldError("thumbnail", result.error || "Invalid URL");
      }
    } catch (error) {
      fileFormik.setFieldError("thumbnail", "Error validating URL");
    } finally {
      setIsValidatingThumbnailUrl(false);
    }
  };

  // Handle module URL validation
  const handleUrlChange = async (value: string) => {
    if (!value.trim()) {
      fileFormik.setFieldValue("url", "");
      fileFormik.setFieldError("url", "URL is required");
      return;
    }

    setIsValidatingUrl(true);

    try {
      const result = await validateUrl(value);

      if (result.valid) {
        fileFormik.setFieldValue("url", value);
        fileFormik.setFieldError("url", "");
      } else {
        fileFormik.setFieldError("url", result.error || "Invalid URL");
      }
    } catch (error) {
      fileFormik.setFieldError("url", "Error validating URL");
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeModule = (index: number) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThumbnailFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const uploadedFile = await uploadFile(
        "training-modules",
        "thumbnails",
        file,
      );
      if (uploadedFile?.publicURL) {
        fileFormik.setFieldValue("thumbnail", uploadedFile.publicURL);
      }
    }
  };

  const handleUrlFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUrlFile(file);
      const uploadedFile = await uploadFile(
        "training-modules",
        "modules",
        file,
      );
      if (uploadedFile?.publicURL) {
        fileFormik.setFieldValue("url", uploadedFile.publicURL);
      }
    }
  };

  const removeThumbnailFile = () => {
    setThumbnailFile(null);
    fileFormik.setFieldValue("thumbnail", "");
  };

  const removeUrlFile = () => {
    setUrlFile(null);
    fileFormik.setFieldValue("url", "");
  };

  return (
    <div className="flex-1 border-gray-100 flex flex-col pb-2">
      {/* Header */}
      {!showTierSelect && (
        <div className="px-6 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Manage Modules</div>
            <div
              className={cn(
                "text-xs text-gray-500 cursor-pointer hover:bg-slate-100 p-2 rounded-md",
                {
                  "opacity-50 cursor-not-allowed hover:bg-transparent":
                    isEmpty(modules),
                },
              )}
              onClick={() => {
                if (!isEmpty(modules)) {
                  setShowModuleList(!showModuleList);
                }
              }}
              role="button"
            >
              {modules.length} module
              {modules.length !== 1 ? "s" : ""} added
            </div>
          </div>
        </div>
      )}

      {showModuleList ? (
        <>
          {/* Added Modules List */}
          {modules.length > 0 && (
            <div className="mt-4 border-gray-100 px-4">
              <div className="flex items-center gap-2 mb-4">
                <div
                  role="button"
                  className="bg-gray-100 p-1 rounded-full border cursor-pointer"
                  onClick={() => setShowModuleList(!showModuleList)}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </div>
                <h4 className="text-sm font-medium">
                  Added Modules ({modules.length})
                </h4>
              </div>

              <ScrollArea className="pr-4 h-[calc(75vh-120px)] pt-0">
                {modules.map((module, index) => (
                  <div
                    className="flex items-start justify-between mt-2 bg-gray-50 p-4 rounded-lg"
                    key={`module-${index}`}
                  >
                    <div className="space-y-1">
                      {module.tier && (
                        <p className="text-sm text-gray-600 bg-gray-200 p-1 px-2 max-w-max rounded-lg">
                          {module.tier.includes("TIER_")
                            ? module.tier.split("_").join(" ")
                            : module.tier}
                        </p>
                      )}

                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {module.title.en}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {module.title.bn}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {module.description.en}
                        </div>
                        <div className="flex items-center mt-2 space-x-4">
                          {module.thumbnail && (
                            <Link href={module.thumbnail} target="_blank">
                              <div className="flex items-center text-xs text-blue-600">
                                <Image className="w-3 h-3 mr-1" />
                                Thumbnail
                              </div>
                            </Link>
                          )}
                          <Link href={module.url} target="_blank">
                            <div className="flex items-center text-xs text-green-600">
                              <LinkIcon className="w-3 h-3 mr-1" />
                              URL Added
                            </div>
                          </Link>
                          <div className="flex items-center text-xs text-purple-600">
                            <span className="w-2 h-2 rounded-full bg-purple-600 mr-1"></span>
                            {module.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModule(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <ScrollBar />
              </ScrollArea>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Stepper */}
          <div
            className={cn("px-6 py-4 border-b border-gray-100", {
              showTierSelect: "py-0",
            })}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span className="text-sm font-medium">Module Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span className="text-sm font-medium">File Upload</span>
              </div>

              {showTierSelect && (
                <div className="ml-auto flex items-center gap-1">
                  <div
                    className={cn(
                      "text-xs text-gray-500 cursor-pointer hover:bg-slate-100 p-2 rounded-md",
                      {
                        "opacity-50 cursor-not-allowed hover:bg-transparent":
                          isEmpty(modules),
                      },
                    )}
                    onClick={() => {
                      if (!isEmpty(modules)) {
                        setShowModuleList(!showModuleList);
                      }
                    }}
                    role="button"
                  >
                    {modules.length} module
                    {modules.length !== 1 ? "s" : ""} added
                  </div>

                  <Button
                    className="cursor-pointer"
                    onClick={onSubmit}
                    disabled={isEmpty(modules)}
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 overflow-y-auto">
            {currentStep === 1 && (
              <form
                onSubmit={moduleFormik.handleSubmit}
                className="h-full space-y-4 flex flex-col p-2"
              >
                {showTierSelect && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Tier <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={moduleFormik.values.tier}
                      onValueChange={(value) =>
                        moduleFormik.setFieldValue("tier", value)
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {tierOptions
                          ?.sort((a, b) => a.value.localeCompare(b.value))
                          .map((tierOption) => (
                            <SelectItem
                              key={tierOption.value}
                              value={tierOption.value}
                            >
                              {tierOption.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {moduleFormik.touched.tier && moduleFormik.errors.tier && (
                      <div className="text-xs text-red-600 mt-1">
                        {moduleFormik.errors.tier}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Module Title (English)
                  </label>
                  <Input
                    name="titleEn"
                    value={moduleFormik.values.titleEn}
                    onChange={moduleFormik.handleChange}
                    onBlur={moduleFormik.handleBlur}
                    placeholder="Enter module title in English"
                  />
                  {moduleFormik.touched.titleEn &&
                    moduleFormik.errors.titleEn && (
                      <div className="text-xs text-red-600 mt-1">
                        {moduleFormik.errors.titleEn}
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Module Title (Bengali)
                  </label>
                  <Input
                    name="titleBn"
                    value={moduleFormik.values.titleBn}
                    onChange={moduleFormik.handleChange}
                    onBlur={moduleFormik.handleBlur}
                    placeholder="মডিউল শিরোনাম বাংলায় লিখুন"
                  />
                  {moduleFormik.touched.titleBn &&
                    moduleFormik.errors.titleBn && (
                      <div className="text-xs text-red-600 mt-1">
                        {moduleFormik.errors.titleBn}
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Module Description (English)
                  </label>
                  <Textarea
                    name="descEn"
                    value={moduleFormik.values.descEn}
                    onChange={moduleFormik.handleChange}
                    onBlur={moduleFormik.handleBlur}
                    placeholder="Enter module description in English"
                    rows={3}
                  />
                  {moduleFormik.touched.descEn &&
                    moduleFormik.errors.descEn && (
                      <div className="text-xs text-red-600 mt-1">
                        {moduleFormik.errors.descEn}
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Module Description (Bengali)
                  </label>
                  <Textarea
                    name="descBn"
                    value={moduleFormik.values.descBn}
                    onChange={moduleFormik.handleChange}
                    onBlur={moduleFormik.handleBlur}
                    placeholder="মডিউল বর্ণনা বাংলায় লিখুন"
                    rows={3}
                  />
                  {moduleFormik.touched.descBn &&
                    moduleFormik.errors.descBn && (
                      <div className="text-xs text-red-600 mt-1">
                        {moduleFormik.errors.descBn}
                      </div>
                    )}
                </div>

                <div className="flex justify-end mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextStep}
                    disabled={!moduleFormik.isValid}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form
                onSubmit={fileFormik.handleSubmit}
                className="h-full space-y-4 flex flex-col p-2"
              >
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thumbnail (Optional)
                  </label>

                  {/* Method Selection */}
                  <div className="flex space-x-2 mb-3">
                    <Button
                      type="button"
                      variant={
                        thumbnailMethod === "upload" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setThumbnailMethod("upload")}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={
                        thumbnailMethod === "link" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setThumbnailMethod("link")}
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Add Link
                    </Button>
                  </div>

                  {thumbnailMethod === "upload" ? (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {thumbnailFile ? (
                          <div className="flex items-center justify-between bg-gray-50 pl-2 rounded">
                            <Link
                              href={fileFormik.values.thumbnail}
                              target="_blank"
                              className={cn({
                                "pointer-events-none":
                                  !fileFormik.values.thumbnail && isUploading,
                              })}
                            >
                              <div className="flex items-center">
                                {!fileFormik.values.thumbnail && isUploading ? (
                                  <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                                ) : (
                                  <Image className="w-4 h-4 mr-2 text-gray-500" />
                                )}
                                <span className="text-sm text-blue-600">
                                  {thumbnailFile.name}
                                </span>
                              </div>
                            </Link>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeThumbnailFile}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailFileChange}
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <label
                              htmlFor="thumbnail-upload"
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
                        name="thumbnail"
                        value={fileFormik.values.thumbnail}
                        onChange={(e) =>
                          handleThumbnailUrlChange(e.target.value)
                        }
                        onBlur={fileFormik.handleBlur}
                        placeholder="https://example.com/thumbnail.jpg"
                        disabled={isValidatingThumbnailUrl}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {fileFormik.values.thumbnail && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              fileFormik.setFieldValue("thumbnail", "");
                              fileFormik.setFieldError("thumbnail", "");
                            }}
                            disabled={isValidatingThumbnailUrl}
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </Button>
                        )}
                        {isValidatingThumbnailUrl && (
                          <Loader className="animate-spin w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  )}

                  {fileFormik.touched.thumbnail &&
                    fileFormik.errors.thumbnail && (
                      <div className="text-xs text-red-600 mt-1">
                        {fileFormik.errors.thumbnail}
                      </div>
                    )}
                </div>

                {/* URL Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Module URL <span className="text-red-500">*</span>
                  </label>

                  {/* Method Selection */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={urlMethod === "upload" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUrlMethod("upload")}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={urlMethod === "link" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUrlMethod("link")}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Add Link
                      </Button>
                    </div>

                    <Select
                      value={fileFormik.values.type}
                      onValueChange={(value) =>
                        fileFormik.setFieldValue("type", value)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">NORMAL</SelectItem>
                        <SelectItem value="VR">VR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {urlMethod === "upload" ? (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {urlFile ? (
                          <div className="flex items-center justify-between bg-gray-50 pl-2 rounded">
                            <Link
                              href={fileFormik.values.url}
                              target="_blank"
                              className={cn({
                                "pointer-events-none":
                                  !fileFormik.values.url && isUploading,
                              })}
                            >
                              <div className="flex items-center">
                                {!fileFormik.values.url && isUploading ? (
                                  <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                                ) : (
                                  <Video className="w-4 h-4 mr-2 text-gray-500" />
                                )}
                                <span className="text-sm text-blue-600">
                                  {urlFile.name}
                                </span>
                              </div>
                            </Link>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeUrlFile}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              onChange={handleUrlFileChange}
                              className="hidden"
                              id="url-upload"
                            />
                            <label
                              htmlFor="url-upload"
                              className="cursor-pointer"
                            >
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload module file
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                MP4 type up to 200MB
                              </p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        name="url"
                        value={fileFormik.values.url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onBlur={fileFormik.handleBlur}
                        placeholder="https://example.com/module-file.mp4"
                        disabled={isValidatingUrl}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {fileFormik.values.url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              fileFormik.setFieldValue("url", "");
                              fileFormik.setFieldError(
                                "url",
                                "URL is required",
                              );
                            }}
                            disabled={isValidatingUrl}
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </Button>
                        )}
                        {isValidatingUrl && (
                          <Loader className="animate-spin w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  )}

                  {fileFormik.touched.url && fileFormik.errors.url && (
                    <div className="text-xs text-red-600 mt-1">
                      {fileFormik.errors.url}
                    </div>
                  )}
                  {fileFormik.touched.type && fileFormik.errors.type && (
                    <div className="text-xs text-red-600 mt-1">
                      {fileFormik.errors.type}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !fileFormik.isValid ||
                      !moduleFormik.isValid ||
                      isValidatingThumbnailUrl ||
                      isValidatingUrl
                    }
                  >
                    Add Module
                  </Button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
