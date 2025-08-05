"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  return (
    <div className="flex min-w-screen min-h-screen bg-white from-blue-50 to-blue-100">
      {/* Welcome Section */}
      <div className="w-[25vw] flex flex-col justify-center items-center bg-blue-900 text-white text-center px-8">
        <h1 className="text-4xl font-medium mb-2">Welcome back!</h1>
        <p className="text-lg opacity-80">
          Sign in to continue to Aqua Observer Admin.
        </p>
      </div>
      {/* Login Form Section */}
      <div className="w-[75vw] flex justify-center items-center">
        <Card className="w-full max-w-md border-none shadow-none border-blue-200 rounded-xl bg-white">
          <CardHeader className="pb-0">
            <h2 className="text-lg font-bold text-left text-blue-900">
              Sign in to your account
            </h2>
          </CardHeader>
          <CardContent className="pt-0 mt-0">
            <Formik
              initialValues={{ phoneNumber: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(values) => {
                // Handle login logic here
                console.log(values);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-slate-600">
                      Phone Number
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0  text-sm flex items-center pl-3 text-gray-500">
                        +91
                      </span>
                      <Field
                        as={Input}
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        placeholder="Enter your phone number"
                        className="pl-10 rounded-sm"
                      />
                    </div>
                    <ErrorMessage
                      name="phoneNumber"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-slate-600 tracking-tighter"
                    >
                      Password
                    </Label>
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="mt-2 rounded-sm"
                    />
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Label className="flex items-center">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        className="h-4 w-4 rounded-sm"
                      />
                      <span className="text-sm text-gray-700">Remember me</span>
                    </Label>

                    <Label className="block mt-2 text-sm text-gray-600">
                      <a
                        href="/forgot-password"
                        className="text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4 bg-blue-900 hover:bg-blue-700 text-white font-semibold rounded-md transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
