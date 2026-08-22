import React from "react";
import "../styles/DiagnosisMix.css";

/* 7.2: one bar per diagnosis class, sorted longest first, doubling as the
   queue filter. Horizontal because the class names are long.

   Single hue for every bar: the classes are nominal, so a value-ramp would
   double-encode bar length as colour and tell the reader nothing new. */

export default function DiagnosisMix({ mix, active, onSelect }) {
  const max = Math.max(...mix.map((m) => m.count), 1);

  return (
    <div className="dmix">
      <h2>Diagnosis mix</h2>
      <p className="hint">What is driving churn. Click to filter the queue.</p>

      {mix.map((m) => {
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            className={"dmix-row" + (isActive ? " dmix-row--active" : "")}
            onClick={() => onSelect(isActive ? null : m.id)}
            aria-pressed={isActive}
            title={`${m.label}: ${m.count} account${m.count === 1 ? "" : "s"}`}
          >
            <span className="dmix-label">
              {m.label}
              <span className="muted"> ({m.count})</span>
            </span>
            <span className="dmix-track">
              <span
                className="dmix-fill"
                style={{ width: `${(m.count / max) * 100}%` }}
              />
            </span>
          </button>
        );
      })}

      {active && (
        <button className="dmix-clear" onClick={() => onSelect(null)}>
          Clear filter
        </button>
      )}
    </div>
  );
}
