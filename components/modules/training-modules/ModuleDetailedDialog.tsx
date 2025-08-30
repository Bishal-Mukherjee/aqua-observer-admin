import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

function getModuleTypeIcon(type: string) {
  return type === "VR" ? (
    <Eye className="h-4 w-4" />
  ) : (
    <Play className="h-4 w-4" />
  );
}

function getModuleTypeColor(type: string) {
  return type === "VR"
    ? "bg-purple-100 text-purple-800 border-purple-300"
    : "bg-blue-100 text-blue-800 border-blue-300";
}

interface ModuleData {
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
  createdAt: string;
  lastUpdatedAt: string;
}

interface ModuleDetailedDialogProps {
  isOpen: boolean;
  selectedModule: ModuleData | null;
  onClose: () => void;
}

export default function ModuleDetailedDialog({
  isOpen,
  selectedModule,
  onClose,
}: ModuleDetailedDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[50vw] min-h-[70vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3 mr-6">
            <div className="min-w-0">
              <DialogTitle className="text-lg leading-tight">
                {selectedModule?.title.en}
              </DialogTitle>
              <p className="text-sm text-gray-500 italic font-light tracking-wide mt-1">
                {selectedModule?.title.bn}
              </p>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "border-none text-sm flex-shrink-0 p-1 px-3",
                selectedModule ? getModuleTypeColor(selectedModule.type) : ""
              )}
            >
              <span className="flex items-center gap-1">
                {selectedModule && getModuleTypeIcon(selectedModule.type)}
                {selectedModule?.type}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6">
          {selectedModule && (
            <div className="space-y-4">
              <video
                src={selectedModule.url}
                controls
                className="border-2 w-full h-[20vw] border-gray-200 rounded-md"
              />
              <div className="text-center">
                <p className="text-gray-700 leading-relaxed">
                  {selectedModule.description.en}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed italic font-light tracking-wide mt-2">
                  {selectedModule.description.bn}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
