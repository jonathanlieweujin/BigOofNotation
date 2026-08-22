import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IMPACT from "../data/impact.json";
import FRICTION from "../data/friction.json";
import { CONFIDENCE_TIERS } from "../HardCodedData";
import { PriorityEnum, TIER_TO_PRIORITY } from "../constants/PriorityEnum";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES, RouteEnum } from "../constants/RouteEnum";
import "../styles/Overview.css";

const money = (n) => "RM" + n.toLocaleString();

const TIER_ORDER = ["HIGH", "MEDIUM", "LOW"];

/* Priority dropdown options: "All" plus one per tier, cheapest labelling
   ("Bad"/"Neutral"/"Good") over the raw tier ids. */
const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All priorities" },
  ...TIER_ORDER.map((tier) => ({ value: tier, label: PriorityEnum[TIER_TO_PRIORITY[tier]] })),
];

const COST_SORT_OPTIONS = [
  { value: "lowest", label: "Lowest Cost" },
  { value: "highest", label: "Highest Cost" },
];

export default function Overview() {
  usePageTitle(PAGE_TITLES[RouteEnum.OVERVIEW]);
  const [priority, setPriority] = useState("ALL");
  const [costSort, setCostSort] = useState("lowest");

  const actionsShown = useMemo(() => {
    const base =
      priority === "ALL" ? IMPACT.action_breakdown : IMPACT.action_breakdown_by_tier[priority];
    return costSort === "lowest" ? base : [...base].reverse();
  }, [priority, costSort]);

  const maxActionCount = Math.max(...actionsShown.map((a) => a.count), 1);
  const tierTotal = TIER_ORDER.reduce((sum, t) => sum + IMPACT.tier_counts[t], 0);
  const topFriction = [...FRICTION].sort((a, b) => b.arrAffected - a.arrAffected).slice(0, 3);

  return (
    <>
      <h1 className="page-title">Overview</h1>

      <div className="kpi-row">
        <div className="card kpi">
          <p className="muted">Accounts at risk</p>
          <p className="kpi-value">{IMPACT.accounts_at_risk}</p>
        </div>
        <div className="card kpi">
          <p className="muted">Revenue at risk</p>
          <p className="kpi-value">{money(IMPACT.revenue_at_risk)}</p>
        </div>
        <div className="card kpi">
          <p className="muted">Interventions recommended</p>
          <p className="kpi-value">{IMPACT.interventions_recommended}</p>
        </div>
        <div className="card kpi">
          <p className="muted">Under observation</p>
          <p className="kpi-value">{IMPACT.accounts_under_observation}</p>
        </div>
      </div>

      {/* Confidence tier split: how urgent, not just how many. */}
      <div className="card">
        <h2 className="tier-heading">Confidence tiers</h2>
        <div className="tier-bar">
          {TIER_ORDER.map((t) => {
            const def = CONFIDENCE_TIERS[t];
            const count = IMPACT.tier_counts[t];
            const pct = (count / tierTotal) * 100;
            return (
              <span
                key={t}
                className={`tier-seg tier-seg--${def.badge}`}
                style={{ width: `${pct}%` }}
                title={`${def.label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="tier-legend">
          {TIER_ORDER.map((t) => {
            const def = CONFIDENCE_TIERS[t];
            return (
              <span className="legend-item" key={t}>
                <span className={`swatch tier-swatch--${def.badge}`} />
                {def.label} ({IMPACT.tier_counts[t]})
              </span>
            );
          })}
        </div>
      </div>

      {/* Cheapest-first by default, in order: proves the thesis before Impact even loads. */}
      <div className="card">
        <div className="action-header">
          <h2>Recommended actions</h2>
          <div className="action-filters">
            <select
              className="action-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Filter by priority"
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="action-select"
              value={costSort}
              onChange={(e) => setCostSort(e.target.value)}
              aria-label="Sort by cost"
            >
              {COST_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {actionsShown.length === 0 ? (
          <p className="empty-state">
            No recommended actions at this priority. Low-priority accounts are logged for
            observation only, never guessed at.
          </p>
        ) : (
          actionsShown.map((a) => (
            <div className="action-row" key={a.action}>
              <span className="ov-action-label">{a.label}</span>
              <div className="action-meta">
                <span className="action-track">
                  <span
                    className="action-fill"
                    style={{ width: `${(a.count / maxActionCount) * 100}%` }}
                  />
                </span>
                <span className="action-count muted">{a.count}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>Top friction causes</h2>
        <table className="table friction-preview-table">
          <thead>
            <tr>
              <th>Cause</th>
              <th className="num">Accounts</th>
              <th className="num">ARR (RM)</th>
            </tr>
          </thead>
          <tbody>
            {topFriction.map((f) => (
              <tr key={f.id}>
                <td className="ov-action-label">{f.cause}</td>
                <td className="num muted">{f.accountCount}</td>
                <td className="num muted">{f.arrAffected.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to={RouteEnum.FRICTION} className="overview-link">
          View all friction causes →
        </Link>
      </div>
    </>
  );
}
