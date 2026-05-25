"use client";
import React from "react";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="progress-steps" style={{ padding:"var(--ds-space-3) var(--ds-space-4)" }}>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: i <= currentStep ? "var(--ds-color-green-100)" : "var(--ds-color-gray-200)" }} />
            <span style={{ fontSize:9, color: i <= currentStep ? "var(--ds-color-green-200)" : "var(--ds-color-gray-300)", whiteSpace:"nowrap", fontWeight: i === currentStep ? 600 : 400 }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex:1, height:2, background: i < currentStep ? "var(--ds-color-green-200)" : "var(--ds-color-gray-200)", borderRadius:1, marginBottom:12 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
