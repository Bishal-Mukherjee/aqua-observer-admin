"use client";

import React from "react";
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
import { BadgeX, CheckCircle } from "lucide-react";

interface TierData {
  id: string;
  tier: string;
  title: {
    en: string;
    bn: string;
  };
  isActive: boolean;
}

interface TierStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "activate" | "deactivate" | null;
  tierData: TierData | null;
}

const TierStatusDialog: React.FC<TierStatusDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  tierData,
}) => {
  const isActivating = action === "activate";
  const isDeactivating = action === "deactivate";

  const getTitle = () => {
    if (isActivating) return "Activate Tier";
    if (isDeactivating) return "Deactivate Tier";
    return "Update Tier Status";
  };

  const getDescription = () => {
    if (isActivating) {
      return `Are you sure you want to activate "${tierData?.title.en}"? This will make the tier available for use.`;
    }
    if (isDeactivating) {
      return `Are you sure you want to deactivate "${tierData?.title.en}"? This action cannot be undone and will make the tier unavailable for new assignments.`;
    }
    return "Are you sure you want to update this tier's status?";
  };

  const getIcon = () => {
    if (isActivating) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (isDeactivating) {
      return <BadgeX className="h-5 w-5 text-red-600" />;
    }
    return null;
  };

  const getActionButtonText = () => {
    if (isActivating) return "Yes, Activate Tier";
    if (isDeactivating) return "Yes, Deactivate Tier";
    return "Confirm";
  };

  const getActionButtonClass = () => {
    if (isActivating) return "bg-green-600 hover:bg-green-700";
    if (isDeactivating) return "bg-red-600 hover:bg-red-700";
    return "bg-blue-600 hover:bg-blue-700";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={getActionButtonClass()}
          >
            {getActionButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TierStatusDialog;
