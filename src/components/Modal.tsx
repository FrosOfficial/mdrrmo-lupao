import React, { ReactNode } from "react";
import { Icon } from "./Icon";

export function Modal({
  title,
  eyebrow = "FIELD OPERATIONS",
  children,
  onClose,
  maxWidth = 620,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        style={{ maxWidth: `${maxWidth}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
