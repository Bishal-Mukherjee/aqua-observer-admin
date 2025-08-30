import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader,
  Ban,
  Upload,
  Link as LinkIcon,
  X,
  Image,
  Video,
  ExternalLink,
} from "lucide-react";
import { useUpdateModule } from "@/services/modules";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import validateUrl from "@/lib/validate-links";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useGetTiers } from "@/services/tiers";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  tier: string;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  url: string;
  thumbnail: string;
  type: string;
  isActive: boolean;
}

interface UpdateModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module | null;
  tierOptions?: { label: string; value: string }[];
}

const validationSchema = Yup.object({
  tier: Yup.string().required("Tier selection is required"),
  titleEn: Yup.string()
    .required("English title is required")
    .min(3, "Title must be at least 3 characters"),
  titleBn: Yup.string()
    .required("Bengali title is required")
    .min(3, "Title must be at least 3 characters"),
  descEn: Yup.string()
    .required("English description is required")
    .min(10, "Description must be at least 10 characters"),
  descBn: Yup.string()
    .required("Bengali description is required")
    .min(10, "Description must be at least 10 characters"),
  thumbnail: Yup.string().url("Must be a valid URL").optional(),
  url: Yup.string()
    .url("Must be a valid URL")
    .required("Video URL is required"),
  type: Yup.string().required("Module type is required"),
  isActive: Yup.boolean(),
});

export default function UpdateModuleDialog({
  isOpen,
  onClose,
  module,
}: UpdateModuleDialogProps) {
  const queryClient = useQueryClient();

  const { data: tierData } = useGetTiers();
  const { mutate: updateModule, isPending } = useUpdateModule();
  const { uploadFile, isLoading: isUploading } = useFileUpload();
  const [showDeactivateAlert, setShowDeactivateAlert] = useState(false);

  // TODO: add 'ONBOARDING' tier to DB
  const tierOptions = [
    { label: "ONBOARDING", value: "ONBOARDING" },
    ...(tierData?.result?.map((t: { tier: string }) => ({
      label: t.tier.split("_").join(" "),
      value: t.tier,
    })) || []),
  ];

  // File upload states
  const [thumbnailMethod, setThumbnailMethod] = useState<"upload" | "link">(
    "link"
  );
  const [urlMethod, setUrlMethod] = useState<"upload" | "link">("link");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [urlFile, setUrlFile] = useState<File | null>(null);

  // URL validation states
  const [isValidatingThumbnailUrl, setIsValidatingThumbnailUrl] =
    useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  const formik = useFormik({
    initialValues: {
      tier: "",
      titleEn: "",
      titleBn: "",
      descEn: "",
      descBn: "",
      thumbnail: "",
      url: "",
      type: "",
      isActive: true,
    },
    validationSchema,
    onSubmit: (values) => {
      if (!module) return;
      updateModule(
        {
          id: module.id,
          tier: values.tier,
          title: { en: values.titleEn, bn: values.titleBn },
          description: { en: values.descEn, bn: values.descBn },
          url: values.url,
          thumbnail: values.thumbnail,
          type: values.type,
          isActive: values.isActive,
        },
        {
          onSuccess: () => {
            toast.success("Module updated successfully");
            onClose();
          },
          onError: () => {
            toast.error("Failed to update module");
          },
          onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["modules"] });
          },
        }
      );
    },
  });

  // Handle thumbnail URL validation
  const handleThumbnailUrlChange = async (value: string) => {
    if (!value.trim()) {
      formik.setFieldValue("thumbnail", "");
      formik.setFieldError("thumbnail", "");
      return;
    }

    setIsValidatingThumbnailUrl(true);

    try {
      const result = await validateUrl(value);

      if (result.valid) {
        formik.setFieldValue("thumbnail", value);
        formik.setFieldError("thumbnail", "");
      } else {
        formik.setFieldError("thumbnail", result.error || "Invalid URL");
      }
    } catch (error) {
      formik.setFieldError("thumbnail", "Error validating URL");
    } finally {
      setIsValidatingThumbnailUrl(false);
    }
  };

  // Handle module URL validation
  const handleUrlChange = async (value: string) => {
    if (!value.trim()) {
      formik.setFieldValue("url", "");
      formik.setFieldError("url", "URL is required");
      return;
    }

    setIsValidatingUrl(true);

    try {
      const result = await validateUrl(value);

      if (result.valid) {
        formik.setFieldValue("url", value);
        formik.setFieldError("url", "");
      } else {
        formik.setFieldError("url", result.error || "Invalid URL");
      }
    } catch (error) {
      formik.setFieldError("url", "Error validating URL");
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Handle thumbnail file upload
  const handleThumbnailFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    formik.setFieldValue("thumbnail", "");
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const uploadedFile = await uploadFile("aqua-observer-bucket", file);
      if (uploadedFile?.publicURL) {
        formik.setFieldValue("thumbnail", uploadedFile.publicURL);
      }
    }
  };

  // Handle URL file upload
  const handleUrlFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    formik.setFieldValue("url", "");
    const file = event.target.files?.[0];
    if (file) {
      setUrlFile(file);
      const uploadedFile = await uploadFile("aqua-observer-bucket", file);
      if (uploadedFile?.publicURL) {
        formik.setFieldValue("url", uploadedFile.publicURL);
      }
    }
  };

  // Remove thumbnail file
  const removeThumbnailFile = () => {
    setThumbnailFile(null);
    formik.setFieldValue("thumbnail", "");
  };

  // Remove URL file
  const removeUrlFile = () => {
    setUrlFile(null);
    formik.setFieldValue("url", "");
  };

  // Reset form when module changes
  useEffect(() => {
    if (module) {
      formik.setValues({
        tier: module.tier,
        titleEn: module.title.en,
        titleBn: module.title.bn,
        descEn: module.description.en,
        descBn: module.description.bn,
        thumbnail: module.thumbnail,
        url: module.url,
        type: module.type,
        isActive: module.isActive,
      });
      // Reset file states
      setThumbnailFile(null);
      setUrlFile(null);
    }
  }, [module]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setShowDeactivateAlert(false);
      setThumbnailFile(null);
      setUrlFile(null);
    }
  }, [isOpen]);

  const handleDeactivateConfirm = () => {
    if (module?.id) {
      updateModule(
        {
          id: module.id,
          tier: module.tier,
          title: { en: module.title.en, bn: module.title.bn },
          description: { en: module.description.en, bn: module.description.bn },
          url: module.url,
          thumbnail: module.thumbnail,
          type: module.type,
          isActive: false,
        },
        {
          onSuccess: () => {
            toast.success("Module deactivated successfully");
            onClose();
          },
          onError: () => {
            toast.error("Failed to deactivate module");
          },
          onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["modules"] });
          },
        }
      );
    }
    setShowDeactivateAlert(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-[80vw] p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4 pr-12">
            <DialogTitle>Update Training Module</DialogTitle>
            {module?.isActive && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setShowDeactivateAlert(true)}
                disabled={isPending}
                size="sm"
              >
                {isPending ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    Deactivate Module
                  </>
                )}
              </Button>
            )}
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)]">
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-4 px-6 py-4 pt-0"
            >
              {/* Tier Selection */}
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Tier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formik.values.tier}
                  onValueChange={(value) => formik.setFieldValue("tier", value)}
                  defaultValue={formik.values.tier}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions
                      ?.sort((a: { value: string }, b: { value: string }) =>
                        a.value.localeCompare(b.value)
                      )
                      .map((tierOption: { label: string; value: string }) => (
                        <SelectItem
                          key={tierOption.value}
                          value={tierOption.value}
                        >
                          {tierOption.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formik.touched.tier && formik.errors.tier && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.tier}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Title (English)
                  </Label>
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
                  <Label className="block text-sm font-medium mb-1">
                    Title (Bengali)
                  </Label>
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
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Description (English)
                </Label>
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
                <Label className="block text-sm font-medium mb-1">
                  Description (Bengali)
                </Label>
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

              {/* Thumbnail Upload */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Thumbnail (Optional)
                </Label>

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
                    variant={thumbnailMethod === "link" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setThumbnailMethod("link")}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Add Link
                  </Button>
                  <div className="flex items-center gap-1 ml-auto">
                    {formik.values.thumbnail === module?.thumbnail && (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <Link
                          href={formik.values.thumbnail}
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

                {thumbnailMethod === "upload" ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {thumbnailFile ? (
                        <div className="flex items-center justify-between bg-gray-50 pl-2 rounded">
                          <div className="flex items-center">
                            {!formik.values.thumbnail && isUploading ? (
                              <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                            ) : (
                              <Image className="w-4 h-4 mr-2 text-gray-500" />
                            )}
                            <Link
                              href={formik.values.thumbnail}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn("text-sm text-blue-600", {
                                "pointer-events-none text-gray-500":
                                  !formik.values.thumbnail,
                              })}
                            >
                              {thumbnailFile.name}
                            </Link>
                          </div>
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
                      value={formik.values.thumbnail}
                      onChange={(e) => handleThumbnailUrlChange(e.target.value)}
                      onBlur={formik.handleBlur}
                      placeholder="https://example.com/thumbnail.jpg"
                      disabled={isValidatingThumbnailUrl}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {formik.values.thumbnail && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            formik.setFieldValue("thumbnail", "");
                            formik.setFieldError("thumbnail", "");
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

                {formik.touched.thumbnail && formik.errors.thumbnail && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.thumbnail}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Video URL <span className="text-red-500">*</span>
                </Label>

                {/* Method Selection and Type Selection */}
                <div className="mb-3 flex items-center">
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

                  <div className="flex items-center gap-1 ml-auto mr-4">
                    {formik.values.url === module?.url && (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <Link
                          href={formik.values.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600"
                        >
                          View
                        </Link>
                      </>
                    )}
                  </div>

                  <Select
                    value={formik.values.type}
                    onValueChange={(value) =>
                      formik.setFieldValue("type", value)
                    }
                  >
                    <SelectTrigger className="w-[200px] h-8">
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
                          <div className="flex items-center">
                            {!formik.values.url && isUploading ? (
                              <Loader className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                            ) : (
                              <Video className="w-4 h-4 mr-2 text-gray-500" />
                            )}
                            <Link
                              href={formik.values.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn("text-sm text-blue-600", {
                                "pointer-events-none text-gray-500":
                                  !formik.values.url,
                              })}
                            >
                              {urlFile.name}
                            </Link>
                          </div>
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
                      value={formik.values.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      onBlur={formik.handleBlur}
                      placeholder="https://example.com/module-file.mp4"
                      disabled={isValidatingUrl}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {formik.values.url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            formik.setFieldValue("url", "");
                            formik.setFieldError("url", "URL is required");
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

                {formik.touched.url && formik.errors.url && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.url}
                  </div>
                )}
                {formik.touched.type && formik.errors.type && (
                  <div className="text-xs text-red-600 mt-1">
                    {formik.errors.type}
                  </div>
                )}
              </div>

              {!module?.isActive && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formik.values.isActive}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active Status
                  </Label>
                </div>
              )}

              <DialogFooter className="flex justify-end">
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    type="button"
                    className="cursor-pointer"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={
                      !formik.isValid ||
                      isPending ||
                      isValidatingThumbnailUrl ||
                      isValidatingUrl
                    }
                  >
                    {isPending ? (
                      <>
                        <Loader className="animate-spin mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      "Update Module"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>

            <ScrollBar />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeactivateAlert}
        onOpenChange={setShowDeactivateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              Deactivate Training Module
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this training module? This
              will make it unavailable to users. You can reactivate it later
              using the Active Status toggle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
