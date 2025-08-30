"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Fragment, useState } from "react";
import { useSignIn, useVerifyCode } from "@/services/auth";
import { Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";

const PhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
});

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const { mutate: signIn, isPending: isSigningIn } = useSignIn();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneSubmit = (values: { phoneNumber: string }) => {
    signIn(
      { phoneNumber: values.phoneNumber },
      {
        onSuccess: () => {
          setStep("otp");
          setPhoneNumber(values.phoneNumber);
        },
        // onError: (error) => {
        //   console.error("Sign-in error:", error);
        // },
      }
    );
  };

  const handleOTPSubmit = (values: { otp: string }) => {
    verifyCode(
      { phoneNumber, code: values.otp },
      {
        onSuccess: () => {
          router.push("/home");
        },
        onError: (error) => {
          console.error("OTP verification error:", error);
        },
      }
    );
  };

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
        <title>Admin | Login</title>
        <meta
          name="description"
          content="Login to your Aqua Observer Admin account"
        />
      </Helmet>
      <div className="flex min-w-screen min-h-screen bg-white from-blue-50 to-blue-100">
        {/* Welcome Section */}
        <div className="w-[25vw] flex flex-col justify-center items-center bg-stone-100 border-blue-100 border-r text-white text-center px-8">
          <h1 className="text-2xl font-medium mb-2 text-stone-800">
            Hi, Welcome back!
          </h1>
          <p className="text-lg text-stone-500">
            {step === "phone"
              ? "Enter your phone number to get started with Aqua Observer Admin."
              : "Enter the OTP sent to your phone to continue."}
          </p>
          <Image
            src="/login-image.png"
            alt="Login Illustration"
            width={360}
            height={250}
            className="mt-6"
          />
        </div>

        {/* Login Form Section */}
        <div className="w-[75vw] flex justify-center items-center">
          <Card className="w-full max-w-md border-none shadow-none border-blue-200 rounded-xl bg-white">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-bold text-left text-blue-900">
                {step === "phone" ? "Sign in to your account" : "Verify OTP"}
              </h2>
              {step === "otp" && (
                <p className="text-sm text-gray-600 mt-1">
                  We've sent a 6-digit code to +91 {phoneNumber}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0 mt-0">
              {step === "phone" ? (
                <Formik
                  initialValues={{ phoneNumber: "" }}
                  validationSchema={PhoneSchema}
                  onSubmit={handlePhoneSubmit}
                >
                  {({}) => (
                    <Form className="space-y-2">
                      <div>
                        <Label htmlFor="phoneNumber" className="text-slate-600">
                          Phone Number
                        </Label>
                        <div className="relative mt-2">
                          <span className="absolute inset-y-0 left-0 text-sm flex items-center pl-3 text-gray-500">
                            +91
                          </span>
                          <Field
                            as={Input}
                            id="phoneNumber"
                            name="phoneNumber"
                            type="text"
                            placeholder="Enter your phone number"
                            className="pl-10 rounded-sm h-12"
                          />
                        </div>
                        <ErrorMessage
                          name="phoneNumber"
                          component="p"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-6 bg-blue-900 hover:bg-blue-700 text-white font-semibold rounded-md transition-all cursor-pointer h-12"
                        disabled={isSigningIn}
                      >
                        {isSigningIn ? (
                          <>
                            <Loader className="animate-spin h-5 w-5 text-white" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Formik
                  initialValues={{ otp: "" }}
                  validationSchema={OTPSchema}
                  onSubmit={handleOTPSubmit}
                >
                  {({ setFieldValue, values, errors, touched }) => (
                    <Form className="space-y-6">
                      <div>
                        <Label htmlFor="otp" className="text-slate-600">
                          Enter OTP
                        </Label>
                        <div className="mt-2 flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={values.otp}
                            onChange={(value) => setFieldValue("otp", value)}
                            containerClassName="group flex items-center has-disabled:opacity-30"
                            autoFocus
                          >
                            <InputOTPGroup className="gap-3">
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
                            <InputOTPSeparator className="mx-2" />
                            <InputOTPGroup className="gap-3">
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
                        {errors.otp && touched.otp && (
                          <p className="text-red-500 text-xs mt-2 text-center">
                            {errors.otp}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-3">
                        <Button
                          type="submit"
                          className="w-full bg-blue-900 hover:bg-blue-700 text-white font-semibold rounded-md transition-all cursor-pointer h-12"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader className="animate-spin h-5 w-5 text-white" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <span>Verify OTP</span>
                          )}
                        </Button>

                        <div className="flex items-center justify-between text-sm">
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            className="text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                          >
                            Resend OTP
                          </button>
                          <button
                            type="button"
                            onClick={handleChangePhone}
                            className="text-gray-600 hover:text-gray-800 underline underline-offset-2 cursor-pointer"
                          >
                            Change phone number
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  );
}
