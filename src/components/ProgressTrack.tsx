import React from "react";
import { BatchStage } from "../data/types";

const STAGES: BatchStage[] = ["Allocated", "In Transit", "Received", "Distributed"];

export function ProgressTrack({ currentStage }: { currentStage: BatchStage }) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="progress-cell">
      <div className="progress-track" aria-label={`Progress stage: ${currentStage}`}>
        {STAGES.map((stage, idx) => (
          <i
            key={stage}
            className={idx <= currentIndex ? "done" : ""}
            title={stage}
          />
        ))}
      </div>
      <strong>{currentStage}</strong>
    </div>
  );
}
