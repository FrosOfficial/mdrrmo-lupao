import React from "react";
import { Icon } from "./Icon";

export function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">
        <Icon name={icon} />
      </div>
      <div className="metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      <div className="metric-spark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </article>
  );
}
