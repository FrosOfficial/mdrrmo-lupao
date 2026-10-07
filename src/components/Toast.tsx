import React from "react";
import { Icon } from "./Icon";

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <Icon name="check" size={18} />
      <span>{message}</span>
    </div>
  );
}
