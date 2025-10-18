"use client";

import Image from "next/image";
import { useGetResources } from "@/services/resources";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SupabaseImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>, signedUrl: string) => void;
}

export const SignedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  onClick = undefined,
}: SupabaseImageProps) => {
  const { data, isLoading, error } = useGetResources(src);

  const signedUrl = data?.imageUrl || null;

  if (isLoading) {
    return <Skeleton className={className} style={{ width, height }} />;
  }

  if (error || !signedUrl) {
    return (
      <div
        className={cn(
          "bg-gray-300 flex items-center justify-center text-gray-500 text-sm",
          className
        )}
        style={{ width, height }}
      >
        Failed to load
      </div>
    );
  }

  return (
    <Image
      src={signedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onClick={onClick ? (e) => onClick(e, signedUrl) : undefined}
    />
  );
};
