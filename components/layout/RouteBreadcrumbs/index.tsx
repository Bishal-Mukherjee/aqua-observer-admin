"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SKIP_SEGMENTS = ["member-programs", "submissions"];

export default function RouteBreadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      return [{ label: "Home", href: "/home", isLast: true }];
    }

    const breadcrumbs = [{ label: "Home", href: "/home", isLast: false }];

    // Filter out skipped segments but preserve their children
    const filteredSegments: { segment: string; originalIndex: number }[] = [];
    pathSegments.forEach((segment, index) => {
      if (!SKIP_SEGMENTS.includes(segment)) {
        filteredSegments.push({ segment, originalIndex: index });
      }
    });

    filteredSegments.forEach((item, index) => {
      // Build href using original path structure (including skipped segments)
      const href =
        "/" + pathSegments.slice(0, item.originalIndex + 1).join("/");
      const label =
        (item.segment.charAt(0).toUpperCase() + item.segment.slice(1))?.replace(
          /-/g,
          " "
        ) || "Unknown";

      breadcrumbs.push({
        label,
        href,
        isLast: index === filteredSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="capitalize cursor-default">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={breadcrumb.href}
                  className="capitalize hover:text-primary transition-colors"
                >
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
