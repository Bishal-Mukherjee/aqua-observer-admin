"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Phone,
  MessageSquare,
  CheckCircle,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useSendCode, useVerifyCode } from "@/services/code";

interface PhoneVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;

  phoneNumber: string;
  onVerificationComplete: () => void;
}

type VerificationStep = "confirm" | "otp" | "success";

const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers"),
});

export default function PhoneVerificationDialog({
  isOpen,
  onClose,
  phoneNumber,
  onVerificationComplete,
}: PhoneVerificationDialogProps) {
  const { mutate: sendCode, isPending: isSending } = useSendCode();
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();

  const [currentStep, setCurrentStep] = useState<VerificationStep>("confirm");
  const [countdown, setCountdown] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(1);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      handleVerifyOTP(values.otp);
    },
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep("confirm");
      setCountdown(0);
      formik.resetForm();
    }
  }, [isOpen]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = () => {
    sendCode(
      { phoneNumber },
      {
        onSuccess: () => {
          setCurrentStep("otp");
          setCountdown(30); // 60
        },
        onError: (error) => {
          toast.error("Failed to send OTP");
        },
      }
    );
  };

  const handleVerifyOTP = (otpValue: string) => {
    verifyCode(
      { phoneNumber, code: otpValue },
      {
        onSuccess: () => {
          setCurrentStep("success");
          setTimeout(() => {
            onVerificationComplete();
            onClose();
          }, 1500);
        },
        onError: (error) => {
          if (totalAttempts >= 4) {
            toast.error("Maximum attempts reached");
            onClose();
            return;
          }
          toast.error("Invalid verification code");
          formik.setFieldError("otp", "Invalid OTP code");
        },
      }
    );
  };

  const handleResendOTP = () => {
    formik.resetForm();

    sendCode(
      { phoneNumber },
      {
        onSuccess: () => {
          setTotalAttempts((prev) => prev + 1);
          setCountdown(30); // 5 seconds countdown
          toast.success("Verification code resent");
        },
        onError: (error: any) => {
          toast.error("Failed to resend code");
        },
      }
    );
  };

  const handleBackToConfirm = () => {
    setCurrentStep("confirm");
    formik.resetForm();
    setCountdown(0);
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Phone Number
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We'll send a verification code to confirm your new phone number.
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">{phoneNumber}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          A 6-digit verification code will be sent via SMS
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSending}
          className="flex-1 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSendOTP}
          disabled={isSending}
          className="flex-1 cursor-pointer"
        >
          {isSending ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              Send Code
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium text-gray-900">{phoneNumber}</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
            Verification Code
          </Label>
          <InputOTP
            value={formik.values.otp}
            onChange={(value) => formik.setFieldValue("otp", value)}
            maxLength={6}
            containerClassName="gap-2"
            disabled={isVerifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {formik.touched.otp && formik.errors.otp && (
            <p className="text-sm text-red-600 text-center">
              {formik.errors.otp}
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isSending || isVerifying}
            className="text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader className="h-4 w-4 mr-1 animate-spin" />
                Resending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Code"
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackToConfirm}
          disabled={isVerifying}
          className="flex-1 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!formik.isValid || !formik.values.otp || isVerifying}
          className="flex-1 cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Phone Number Verified!
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Your phone number has been successfully verified.
        </p>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">{phoneNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center">
            {currentStep === "confirm" && "Phone Verification"}
            {currentStep === "otp" && "Enter Verification Code"}
            {currentStep === "success" && "Verification Complete"}
          </DialogTitle>
        </DialogHeader>

        {currentStep === "confirm" && renderConfirmStep()}
        {currentStep === "otp" && renderOTPStep()}
        {currentStep === "success" && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}
