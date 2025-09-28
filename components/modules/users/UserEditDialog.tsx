"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Save,
  Loader,
  BadgeAlert,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PhoneVerificationDialog from "./PhoneVerificationDialog";
import { useUpdateUser } from "@/services/users";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UserData {
  id: string;
  name: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE";
  role: "SIGHTER" | "SUB_ADMIN";
  tier: string;
  status: "ACTIVE" | "SUSPENDED";
  age: number;
  email: string | null;
  occupation: string | null;
  createdAt: string;
  lastActiveAt: string;
  reportingsCount: string;
  sightingsCount: string;
}

interface UserEditData {
  name: string;
  phoneNumber: string;
  email: string;
  tier: string;
  occupation: string;
}

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .nullable(),

  tier: Yup.string()
    .required("Tier level is required")
    .oneOf(
      ["TIER_1", "TIER_2", "TIER_3", "TIER_4", "TIER_5"],
      "Invalid tier level"
    ),

  occupation: Yup.string()
    .max(50, "Occupation must be less than 50 characters")
    .nullable(),
});

const getTierColor = (tierLevel: string) => {
  const colorMap: Record<string, string> = {
    TIER_1: "bg-green-100 text-green-800 border-green-300",
    TIER_2: "bg-blue-100 text-blue-800 border-blue-300",
    TIER_3: "bg-purple-100 text-purple-800 border-purple-300",
    TIER_4: "bg-orange-100 text-orange-800 border-orange-300",
    TIER_5: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[tierLevel] || "bg-gray-100 text-gray-800 border-gray-300";
};

const formatTierDisplay = (tier: string) => {
  return tier.split("_").join(" ");
};

export default function UserEditDialog({
  isOpen,
  onClose,
  userData,
}: UserEditDialogProps) {
  const queryClient = useQueryClient();
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");

  const formik = useFormik<UserEditData>({
    initialValues: {
      name: "",
      phoneNumber: "",
      email: "",
      tier: "",
      occupation: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!userData || !isPhoneVerified) return;
      updateUser(
        { id: userData.id, ...values },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            onClose();
          },
          onError: () => {
            toast.error("Error updating user data");
          },
          onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
          },
        }
      );
    },
  });

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      const initialData = {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email || "",
        tier: userData.tier,
        occupation: userData.occupation || "",
      };

      formik.setValues(initialData);
      setOriginalPhoneNumber(userData.phoneNumber);
      setIsPhoneVerified(true);
    }
  }, [userData]);

  // Check phone verification status when phone number changes
  useEffect(() => {
    const phoneChanged = formik.values.phoneNumber !== originalPhoneNumber;
    setIsPhoneVerified(!phoneChanged);
  }, [formik.values.phoneNumber, originalPhoneNumber]);

  const handleVerificationIconClick = () => {
    if (!isPhoneVerified) {
      setIsVerificationOpen(true);
    }
  };

  const handleVerificationComplete = () => {
    setIsPhoneVerified(true);
    setOriginalPhoneNumber(formik.values.phoneNumber);
    setIsVerificationOpen(false);
  };

  const handleClose = () => {
    formik.resetForm();
    setIsPhoneVerified(true);
    setOriginalPhoneNumber("");
    onClose();
  };

  // Check if form has changes
  const hasChanges = formik.dirty;
  const canSave = hasChanges && formik.isValid && isPhoneVerified;

  if (!userData) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-lg min-w-2xl px-5"
          aria-describedby="user-edit"
        >
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl">Edit User</DialogTitle>
          </DialogHeader>

          <TooltipProvider>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      id="name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter full name"
                      className={cn(
                        "flex-1",
                        formik.touched.name &&
                          formik.errors.name &&
                          "border-red-500"
                      )}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="relative flex-1">
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter phone number"
                      className={cn(
                        "pr-10",
                        formik.touched.phoneNumber &&
                          formik.errors.phoneNumber &&
                          "border-red-500"
                      )}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute right-3 top-1/2 transform -translate-y-1/2",
                            !isPhoneVerified &&
                              "cursor-pointer hover:scale-110 transition-transform"
                          )}
                          onClick={handleVerificationIconClick}
                        >
                          {isPhoneVerified ? (
                            <BadgeCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <BadgeAlert className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isPhoneVerified
                            ? "Verified"
                            : "Click to verify phone number"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {formik.touched.phoneNumber &&
                      formik.errors.phoneNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {formik.errors.phoneNumber}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter email address"
                      className={cn(
                        "flex-1",
                        formik.touched.email &&
                          formik.errors.email &&
                          "border-red-500"
                      )}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tier */}
              <div className="space-y-2">
                <Label
                  htmlFor="tier"
                  className="text-sm font-medium text-gray-700"
                >
                  Tier Level
                </Label>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <Select
                      value={formik.values.tier}
                      onValueChange={(value) =>
                        formik.setFieldValue("tier", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "flex-1",
                          formik.touched.tier &&
                            formik.errors.tier &&
                            "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select tier level">
                          {formik.values.tier && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium border-none w-[52px]",
                                getTierColor(formik.values.tier)
                              )}
                            >
                              {formatTierDisplay(formik.values.tier)}
                            </Badge>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIER_1">Tier 1</SelectItem>
                        <SelectItem value="TIER_2">Tier 2</SelectItem>
                        <SelectItem value="TIER_3">Tier 3</SelectItem>
                        <SelectItem value="TIER_4">Tier 4</SelectItem>
                        <SelectItem value="TIER_5">Tier 5</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.touched.tier && formik.errors.tier && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.tier}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <Label
                  htmlFor="occupation"
                  className="text-sm font-medium text-gray-700"
                >
                  Occupation
                </Label>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formik.values.occupation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter occupation"
                      className={cn(
                        "flex-1",
                        formik.touched.occupation &&
                          formik.errors.occupation &&
                          "border-red-500"
                      )}
                    />
                    {formik.touched.occupation && formik.errors.occupation && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.occupation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                {/* Phone verification warning */}
                <div className="flex-1">
                  {!isPhoneVerified && (
                    <div className="flex items-center gap-1">
                      <BadgeAlert className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-600 font-medium">
                        Phone number must be verified before saving
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="cursor-pointer"
                    type="submit"
                    disabled={!canSave || isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TooltipProvider>
        </DialogContent>
      </Dialog>

      <PhoneVerificationDialog
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        phoneNumber={formik.values.phoneNumber}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
}
