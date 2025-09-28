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
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function ActionAlert({
  action,
  isLoading,
  onClose,
  onConfirm,
}: {
  action: "validate" | "invalidate" | null;
  isLoading: boolean;
  onClose?: () => void;
  onConfirm: () => void;
}) {
  const title = action === "validate" ? "Validate Report" : "Invalidate Report";
  const content =
    action === "validate"
      ? "Are you sure you want to validate this report? The report will be marked as valid and included in active data."
      : "Are you sure you want to invalidate this report? The report will be marked as invalid and removed from active data.";
  return (
    <AlertDialog open={!!action} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {action === "validate" && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {action === "invalidate" && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn("bg-red-600 hover:bg-red-700", {
              "bg-green-600 hover:bg-green-700": action === "validate",
            })}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
