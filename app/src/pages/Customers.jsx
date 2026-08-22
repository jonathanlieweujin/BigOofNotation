import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DiagnosisMix from "../components/DiagnosisMix";
import {
  CONFIDENCE_TIERS,
  DIAGNOSES,
  ACTIONS,
  diagnosisMix,
  rankedAccounts,
} from "../HardCodedData";
import { customerPath } from "../constants/RouteEnum";
import "../styles/Customers.css";

const money = (n) => "RM" + n.toLocaleString();

const TIER_ORDER = ["HIGH", "MEDIUM", "LOW"];

export default function Customers() {
  const [diagnosis, setDiagnosis] = useState(null);
  const [tier, setTier] = useState(null);
  const [query, setQuery] = useState("");

  const all = useMemo(() => rankedAccounts(), []);
  const mix = useMemo(() => diagnosisMix(), []);

  const shown = all.filter((a) => {
    if (diagnosis && a.diagnosis !== diagnosis) return false;
    if (tier && a.tier !== tier) return false;
    if (query && !a.name.toLowerCase().includes(query.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  const observing = all.filter((a) => a.tier === "LOW").length;
  const isFiltered = Boolean(diagnosis || tier || query);

  return (
    <>
      <h1 className="page-title">Customers</h1>
      {/* <p className="page-subtitle">
        Ranked by expected value of intervening, not raw churn score.
      </p> */}

      <div className="filter-row">
        <input
          className="filter-search"
          placeholder="Search customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search customer"
        />

        <div className="tier-filters">
          {TIER_ORDER.map((t) => {
            const def = CONFIDENCE_TIERS[t];
            const on = tier === t;
            return (
              <button
                key={t}
                className={"chip-btn" + (on ? " chip-btn--on" : "")}
                onClick={() => setTier(on ? null : t)}
                aria-pressed={on}
              >
                {def.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="queue-row">
        <div className="card queue-card">
          {shown.length === 0 ? (
            /* Fail-safe made visible: say what is happening, never a blank table. */
            <p className="empty-state">
              No customers match this filter.
              {observing > 0 && ` ${observing} under observation.`}
            </p>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>LTV</th>
                    <th>Diagnosis</th>
                    <th>Confidence</th>
                    <th>Recommended action</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((a) => {
                    const t = CONFIDENCE_TIERS[a.tier];
                    const action = a.recommended
                      ? ACTIONS[a.recommended]
                      : null;
                    return (
                      <tr key={a.id}>
                        <td>
                          <Link to={customerPath(a.id)}>{a.name}</Link>
                        </td>
                        <td>{money(a.ltv)}</td>
                        <td>{DIAGNOSES[a.diagnosis].label}</td>
                        <td>
                          {/* Colour always paired with its label, never colour alone. */}
                          <span className={`badge badge--${t.badge}`}>
                            {t.label}
                          </span>
                        </td>
                        <td>
                          {action ? (
                            action.label
                          ) : (
                            <span className="muted">
                              No action, under observation
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {isFiltered && (
                <p className="result-count muted">
                  Showing {shown.length} of {all.length} customers
                </p>
              )}
            </>
          )}
        </div>

        <aside className="queue-side">
          <DiagnosisMix mix={mix} active={diagnosis} onSelect={setDiagnosis} />
        </aside>
      </div>
    </>
  );
}
