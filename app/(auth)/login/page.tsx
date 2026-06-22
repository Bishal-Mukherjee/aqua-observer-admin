"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Fragment, useState } from "react";
import { useSignIn, useVerifyCode } from "@/services/auth";
import { Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "@/constants/constants";
import { formatPhoneNumber } from "@/lib/strings";

const PhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
});

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
  rememberMe: Yup.boolean(),
});

export default function LoginPage() {
  const router = useRouter();

  const { mutate: signIn, isPending: isSigningIn } = useSignIn();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const phoneFormik = useFormik({
    initialValues: { phoneNumber: "" },
    validationSchema: PhoneSchema,
    onSubmit: ({ phoneNumber }) => {
      signIn(
        { phoneNumber },
        {
          onSuccess: () => {
            setStep("otp");
            setPhoneNumber(phoneNumber);
          },
        }
      );
    },
  });

  const otpFormik = useFormik({
    initialValues: { otp: "", rememberMe: false },
    validationSchema: OTPSchema,
    onSubmit: ({ otp, rememberMe }) => {
      verifyCode(
        { phoneNumber, code: otp, rememberMe },
        {
          onSuccess: () => {
            router.push("/home");
          },
          onError: (error) => {
            console.error("OTP verification error:", error);
          },
        }
      );
    },
  });

  const handleResendOTP = () => {
    signIn(
      { phoneNumber },
      {
        onSuccess: () => {
          console.log("OTP resent successfully");
        },
        onError: (error) => {
          console.error("Error resending OTP:", error);
        },
      }
    );
  };

  const handleChangePhone = () => {
    setStep("phone");
    setPhoneNumber("");
  };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Login</title>
        <meta
          name="description"
          content="Login to your RUDRA App Admin account"
        />
      </Helmet>
      <div className="w-full min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="w-full flex flex-col justify-center items-center px-4">
          <Card className="w-full max-w-md rounded-2xl bg-white/80 border-none backdrop-blur-sm">
            <CardHeader className="pb-4 pt-8 px-8">
              <h2 className="text-xl font-semibold text-center text-slate-800">
                {step === "phone" ? "Welcome Back" : "Verify Code"}
              </h2>
              <p className="text-sm text-slate-500 text-center">
                {step === "phone" ? (
                  "Enter your phone number to continue"
                ) : (
                  <span>
                    We've sent a 6-digit code to{" "}
                    <span className="font-mono text-slate-800 ml-1">
                      {formatPhoneNumber(phoneNumber)}
                    </span>
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {step === "phone" ? (
                <form
                  className="space-y-5"
                  onSubmit={phoneFormik.handleSubmit}
                  noValidate
                >
                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-slate-700"
                    >
                      Phone Number
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 text-sm flex items-center pl-4 text-slate-500 font-medium">
                        +91
                      </span>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        placeholder="Enter your phone number"
                        className="pl-12 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        value={phoneFormik.values.phoneNumber}
                        onChange={phoneFormik.handleChange}
                        onBlur={phoneFormik.handleBlur}
                      />
                    </div>
                    {phoneFormik.touched.phoneNumber &&
                      phoneFormik.errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-2">
                          {phoneFormik.errors.phoneNumber}
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-3 text-white font-medium rounded-xl transition-all duration-200 h-12 shadow-md hover:shadow-lg"
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin h-5 w-5" />
                        Sending...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  className="space-y-6"
                  onSubmit={otpFormik.handleSubmit}
                  noValidate
                >
                  <div>
                    <Label
                      htmlFor="otp"
                      className="text-sm font-medium text-slate-700 block text-center mb-3"
                    >
                      Enter Verification Code
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpFormik.values.otp}
                        onChange={(value) =>
                          otpFormik.setFieldValue("otp", value)
                        }
                        containerClassName="group flex items-center gap-4 has-disabled:opacity-30"
                        autoFocus
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot
                            index={0}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                          <InputOTPSlot
                            index={1}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                          <InputOTPSlot
                            index={2}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                        </InputOTPGroup>
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot
                            index={3}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                          <InputOTPSlot
                            index={4}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                          <InputOTPSlot
                            index={5}
                            className="rounded-md border-2 border-gray-300 focus:border-blue-500 h-12 w-12 text-lg font-semibold"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {otpFormik.touched.otp && otpFormik.errors.otp && (
                      <p className="text-red-500 text-xs mt-3 text-center">
                        {otpFormik.errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center space-x-2 py-2">
                    <Checkbox
                      id="rememberMe"
                      checked={otpFormik.values.rememberMe}
                      onCheckedChange={(checked) =>
                        otpFormik.setFieldValue("rememberMe", checked)
                      }
                      className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm text-slate-600 cursor-pointer font-normal"
                    >
                      Keep me signed in
                    </Label>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full text-white font-medium rounded-xl transition-all duration-200 h-12 shadow-md hover:shadow-lg"
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-2">
                          <Loader className="animate-spin h-5 w-5" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-6 text-sm pt-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Resend Code
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleChangePhone}
                        className="text-slate-600 hover:text-slate-700 font-medium transition-colors"
                      >
                        Change Number
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400 mt-8">
            © 2026 {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </Fragment>
  );
}
