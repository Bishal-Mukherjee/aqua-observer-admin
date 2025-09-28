"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isEmpty } from "lodash";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Phone,
  Mail,
  UserPlus,
  Briefcase,
  Save,
  Loader,
  BadgeAlert,
  BadgeCheck,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PhoneVerificationDialog from "./PhoneVerificationDialog";
import { useCreateUser } from "@/services/users";
import { useGetDistricts } from "@/services/region";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface UserCreateData {
  name: string;
  phoneNumber: string;
  age: string;
  gender: "MALE" | "FEMALE" | "";
  email: string;
  occupation: string;
  role: "SIGHTER" | "SUB_ADMIN" | "DFO";
  district?: string; // <-- Add district
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .length(10, "Phone number must be exactly 10 digits"),

  age: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(18, "Age must be at least 18")
    .max(120, "Age must be less than 120"),

  gender: Yup.string()
    .nullable()
    .oneOf(["MALE", "FEMALE", ""], "Invalid gender"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .nullable(),

  role: Yup.string()
    .required("Role is required")
    .oneOf(["SIGHTER", "SUB_ADMIN", "DFO"], "Invalid role"),
  occupation: Yup.string()
    .max(50, "Occupation must be less than 50 characters")
    .nullable(),

  district: Yup.string().when("role", {
    is: "DFO",
    then: (schema) => schema.required("District is required for DFO"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const formatGenderDisplay = (gender: string) => {
  const displayMap: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
  };
  return displayMap[gender] || gender;
};

export default function UserCreateDialog() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data } = useGetDistricts();
  const { mutate: createUser, isPending } = useCreateUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const isDialogOpen = isOpen || searchParams.get("action") === "add";

  const districtOptions: Array<{ value: string; label: { en: string } }> =
    data?.result?.sort(
      (a: { label: { en: string } }, b: { label: { en: string } }) =>
        a.label.en.localeCompare(b.label.en)
    ) || [];

  const formik = useFormik<UserCreateData>({
    initialValues: {
      name: "",
      phoneNumber: "",
      age: "",
      gender: "",
      email: "",
      occupation: "",
      role: "SIGHTER",
      district: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isPhoneVerified) {
        toast.error("Phone number must be verified before creating user");
        return;
      }

      const userData = {
        ...values,
        phoneNumber: `+91${values.phoneNumber}`,
        age: values.age ? Number(values.age) : undefined,
        gender: values.gender || undefined,
        email: values.email || undefined,
        occupation: values.occupation || undefined,
        district: values.role === "DFO" ? values.district : undefined, // Only send district for DFO
      };

      createUser(userData, {
        onSuccess: () => {
          toast.success("User created successfully");
          handleClose();
        },
        onError: () => {
          toast.error("Error creating user");
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        },
      });
    },
  });

  // Reset phone verification when phone number changes
  useEffect(() => {
    if (formik.values.phoneNumber && formik.touched.phoneNumber) {
      setIsPhoneVerified(false);
    }
  }, [formik.values.phoneNumber]);

  const handleVerificationIconClick = () => {
    if (!isPhoneVerified && formik.values.phoneNumber) {
      if (!formik.errors.phoneNumber) {
        setIsVerificationOpen(true);
      } else {
        toast.error("Please enter a valid phone number first");
      }
    }
  };

  const handleVerificationComplete = () => {
    setIsPhoneVerified(true);
    setIsVerificationOpen(false);
  };

  const handleClose = () => {
    formik.resetForm();
    setIsPhoneVerified(false);
    setIsOpen(false);
  };

  // Check if phone number is valid for showing verification icon
  const isPhoneNumberValid =
    formik.values.phoneNumber && !formik.errors.phoneNumber;

  // Check if form is valid for submission
  const canSave =
    formik.isValid &&
    isPhoneVerified &&
    formik.values.name &&
    formik.values.phoneNumber &&
    formik.values.role;

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(value) => {
          if (!value) {
            if (searchParams.get("action") === "add") {
              router.push("/users");
            }
            setIsOpen(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="cursor-pointer" onClick={() => setIsOpen(true)}>
            <UserPlus className="h-5 w-5" />
            Create User
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-w-lg min-w-2xl px-5"
          aria-describedby="user-create"
        >
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={formik.handleSubmit} className="space-y-4 pr-4">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name <span className="text-red-500">*</span>
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
                      <p className="text-xs text-red-600 mt-1">
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
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="relative flex-1 flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">
                      +91
                    </div>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter phone number"
                      className={cn(
                        "rounded-l-none pr-10",
                        formik.touched.phoneNumber &&
                          formik.errors.phoneNumber &&
                          "border-red-500"
                      )}
                    />
                    {isPhoneNumberValid && (
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
                    )}
                  </div>
                </div>
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="text-xs text-red-600 mt-1">
                    {formik.errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Gender and Age */}
              <div className="grid grid-cols-2 gap-6">
                {/* Gender */}
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-gray-700"
                  >
                    Gender
                  </Label>
                  <div className="flex items-center gap-3 w-full">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <Select
                        value={formik.values.gender}
                        onValueChange={(value) =>
                          formik.setFieldValue("gender", value)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            formik.touched.gender &&
                              formik.errors.gender &&
                              "border-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formik.touched.gender && formik.errors.gender && (
                        <p className="text-xs text-red-600 mt-1">
                          {formik.errors.gender}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label
                    htmlFor="age"
                    className="text-sm font-medium text-gray-700"
                  >
                    Age
                  </Label>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formik.values.age}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter age"
                        min="13"
                        max="120"
                        className={cn(
                          "flex-1",
                          formik.touched.age &&
                            formik.errors.age &&
                            "border-red-500"
                        )}
                      />
                      {formik.touched.age && formik.errors.age && (
                        <p className="text-xs text-red-600 mt-1">
                          {formik.errors.age}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Role <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <Select
                      value={formik.values.role}
                      onValueChange={(value) =>
                        formik.setFieldValue("role", value)
                      }
                      disabled={searchParams.get("role") ? true : false}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          formik.touched.role &&
                            formik.errors.role &&
                            "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="SIGHTER">Sighter</SelectItem>
                          <SelectItem value="SUB_ADMIN">Sub Admin</SelectItem>
                          <SelectItem value="DFO">DFO</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formik.touched.role && formik.errors.role && (
                      <p className="text-xs text-red-600 mt-1">
                        {formik.errors.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* District (only for DFO) */}
              {formik.values.role === "DFO" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="district"
                    className="text-sm font-medium text-gray-700"
                  >
                    District <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <Select
                        value={formik.values.district}
                        onValueChange={(value) => {
                          console.log("Selected district:", value);
                          formik.setFieldValue("district", value);
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            formik.touched.district &&
                              formik.errors.district &&
                              "border-red-500"
                          )}
                          disabled={isEmpty(districtOptions)}
                        >
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          <SelectGroup>
                            {districtOptions?.map((district) => (
                              <SelectItem
                                key={district.value}
                                value={district.value}
                              >
                                {district.label.en}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formik.touched.district && formik.errors.district && (
                        <p className="text-xs text-red-600 mt-1">
                          {formik.errors.district}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                      <p className="text-xs text-red-600 mt-1">
                        {formik.errors.email}
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
                      <p className="text-xs text-red-600 mt-1">
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
                  {!isPhoneVerified && formik.values.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <BadgeAlert className="h-4 w-4 text-amber-600" />
                      <p className="text-xs text-amber-600 font-medium">
                        Phone number must be verified before creating user
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create User
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <ScrollBar />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <PhoneVerificationDialog
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        phoneNumber={`+91${formik.values.phoneNumber}`}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
}
