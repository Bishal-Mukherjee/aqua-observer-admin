import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, UserX, Loader2 } from "lucide-react";
import { useUpdateUser } from "@/services/users";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  status: "ACTIVE" | "SUSPENDED" | "ONBOARDED";
}

interface UserStatusDialogProps {
  open: boolean;
  user: User | null;
  newStatus: "ACTIVE" | "SUSPENDED" | "ONBOARDED";
  onClose: () => void;
}

const UserStatusDialog: React.FC<UserStatusDialogProps> = ({
  open,
  user,
  newStatus,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  if (!user) return null;

  const getActionMessage = (isPast = false) => {
    if (isPast) {
      switch (newStatus) {
        case "ACTIVE":
          return "reinstated";
        case "SUSPENDED":
          return "suspended";
        case "ONBOARDED":
          return "onboarded";
      }
    }

    switch (newStatus) {
      case "ACTIVE":
        return "reinstate";
      case "SUSPENDED":
        return "suspend";
      default:
        return "update";
    }
  };

  const getWarningMessage = () => {
    switch (newStatus) {
      case "ACTIVE":
        return "This user will regain access to the system and all their previous permissions.";
      case "SUSPENDED":
        return "This user will lose access to the system but their data will be preserved. This action can be reversed.";
      default:
        return "";
    }
  };

  const handleConfirm = () => {
    updateUser(
      { id: user.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Profile '${user.name}' has been ${getActionMessage(true)}.`,
          );
        },
        onError: () => {
          toast.error(`Failed to ${getActionMessage()} user '${user.name}'.`);
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Status Change
          </DialogTitle>
          <DialogDescription>
            You are about to change the status of this user. Please review the
            details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="text-left">
            <p className="text-sm text-gray-600">
              Are you sure you want to{" "}
              <span className="font-semibold">{getActionMessage()}</span> this
              user?
            </p>
          </div>

          {/* Warning Alert */}
          <Alert
            className={
              newStatus === "SUSPENDED" ? "border-red-200" : "border-amber-200"
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <span className="font-medium">Warning:</span>{" "}
              {getWarningMessage()}
            </AlertDescription>
          </Alert>

          {newStatus === "SUSPENDED" ? (
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox />
              <Label className="text-sm">
                Invalidate all related reportings/sightings?
              </Label>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox />
              <Label className="text-sm">
                Reinstate all related reportings/sightings?
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={newStatus === "SUSPENDED" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {newStatus === "SUSPENDED" ? (
                  <UserX className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirm{" "}
                {getActionMessage().charAt(0).toUpperCase() +
                  getActionMessage().slice(1)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserStatusDialog;
