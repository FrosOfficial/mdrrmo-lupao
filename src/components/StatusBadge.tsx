import React from "react";

export function StatusBadge({
  status,
  size = "md",
}: {
  status: string;
  size?: "sm" | "md" | "lg";
}) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`status-pill status-${normalized} status-size-${size}`}>
      {status}
    </span>
  );
}
