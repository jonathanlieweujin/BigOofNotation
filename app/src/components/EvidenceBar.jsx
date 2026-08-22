import React from "react";
import { CONFIDENCE_TIERS, EVIDENCE_WEIGHTS } from "../HardCodedData";
import "../styles/EvidenceBar.css";

/* 7.5: how each evidence type contributed to the confidence score, with the
   action threshold drawn as a vertical rule. The point is that a reviewer can
   see how close to the bar it landed, not just the final number.

   Max 3 coloured segments; anything beyond folds into "Other" because three
   categorical colours is the validated ceiling on this surface. */

const SEGMENT_COLOURS = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)"];
const OTHER_COLOUR = "var(--ink-muted)";

export default function EvidenceBar({ evidence, score, tier }) {
  const threshold = CONFIDENCE_TIERS.HIGH.min;

  // Heaviest first, so the biggest contributor reads at the start of the bar.
  // `e.weight` (set per-account in HardCodedData.js) may include a bonus on
  // top of the type's base weight, so it takes precedence over the lookup.
  const sorted = [...evidence]
    .map((e) => ({ ...EVIDENCE_WEIGHTS[e.type], ...e }))
    .sort((x, y) => y.weight - x.weight);

  const segments = sorted.slice(0, 3).map((s, i) => ({
    label: s.label,
    weight: s.weight,
    colour: SEGMENT_COLOURS[i],
  }));

  const rest = sorted.slice(3);
  if (rest.length) {
    segments.push({
      label: `Other (${rest.length})`,
      weight: rest.reduce((sum, r) => sum + r.weight, 0),
      colour: OTHER_COLOUR,
    });
  }

  // Scale so the threshold always sits at a readable place on the track, even
  // when the score overshoots it.
  const scaleMax = Math.max(score, threshold) * 1.25;
  const pct = (n) => `${(n / scaleMax) * 100}%`;
  const cleared = score >= threshold;

  return (
    <div className="ebar">
      <div className="ebar-track">
        {segments.map((s, i) => (
          <div
            key={i}
            className="ebar-seg"
            style={{ width: pct(s.weight), background: s.colour }}
            title={`${s.label}: ${s.weight}`}
          />
        ))}

        {/* The threshold rule: the whole reason this chart exists. */}
        <div
          className="ebar-threshold"
          style={{ left: pct(threshold) }}
          title={`Action threshold: ${threshold}`}
        >
          <span className="ebar-threshold-label">Threshold {threshold}</span>
        </div>
      </div>

      <div className="ebar-legend">
        {segments.map((s, i) => (
          <span className="ebar-legend-item" key={i}>
            <span className="swatch" style={{ background: s.colour }} />
            {s.label}
            <span className="muted"> ({s.weight})</span>
          </span>
        ))}
      </div>

      <p className="ebar-verdict">
        Score <strong>{score}</strong> of {threshold} needed.{" "}
        {cleared
          ? `Cleared the bar, tier: ${tier.label}.`
          : `Short by ${threshold - score}, so no customer contact.`}
      </p>
    </div>
  );
}
