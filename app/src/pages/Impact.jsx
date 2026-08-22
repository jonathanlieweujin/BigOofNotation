import React from "react";
import { DIAGNOSES, IMPACT } from "../HardCodedData";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES, RouteEnum } from "../constants/RouteEnum";
import "../styles/Impact.css";

const money = (n) => "RM" + n.toLocaleString();

export default function Impact() {
  usePageTitle(PAGE_TITLES[RouteEnum.IMPACT]);
  const net = IMPACT.retainedRevenueNet - IMPACT.concessionCost;

  return (
    <>
      <h1 className="page-title">Results</h1>
      {/* <p className="page-subtitle">
        Retained revenue reported net of what the concessions cost, so an
        intervention that cost more than the customer was worth shows up as such.
      </p> */}

      <div className="card">
        <p className="muted">Retained revenue, net of concession cost</p>
        <p className="hero">{money(net)}</p>
      </div>

      <div className="kpi-row">
        <div className="card kpi">
          <p className="muted">Interventions committed</p>
          <p className="kpi-value">{IMPACT.interventionsCommitted}</p>
        </div>
        <div className="card kpi">
          <p className="muted">Concession budget used</p>
          <p className="kpi-value">
            {money(IMPACT.concessionBudget.used)}
            <span className="muted kpi-sub">
              {" "}
              / {money(IMPACT.concessionBudget.ceiling)}
            </span>
          </p>
        </div>
        <div className="card kpi">
          <p className="muted">Under observation</p>
          <p className="kpi-value">{IMPACT.accountsUnderObservation}</p>
        </div>
      </div>

      {/* The chart that carries the thesis: matched action vs discount baseline. */}
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Matched action vs. generic discount</h2>
        {/* <p className="hint">
          Retention rate by diagnosis class. Two series, one axis.
        </p> */}

        {IMPACT.matchedVsBaseline.map((row) => (
          <div className="grouped-row" key={row.diagnosis}>
            <p className="grouped-label">{DIAGNOSES[row.diagnosis].label}</p>
            <div className="grouped-bars">
              <div className="gb-line">
                <div
                  className="gb-fill"
                  style={{ width: `${row.matched}%`, background: "var(--cat-1)" }}
                />
                <span className="gb-value">{row.matched}%</span>
              </div>
              <div className="gb-line">
                <div
                  className="gb-fill"
                  style={{ width: `${row.baseline}%`, background: "var(--cat-2)" }}
                />
                <span className="gb-value">{row.baseline}%</span>
              </div>
            </div>
          </div>
        ))}

        <div className="legend">
          <span className="legend-item">
            <span className="swatch" style={{ background: "var(--cat-1)" }} />
            Diagnosis-matched
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: "var(--cat-2)" }} />
            Generic discount
          </span>
        </div>
      </div>

      <div className="card">
        <h2>Repeat churn, same root cause</h2>
        <p className="muted">
          Before {Math.round(IMPACT.repeatChurnSameCause.before * 100)}% → after{" "}
          {Math.round(IMPACT.repeatChurnSameCause.after * 100)}%. Does fixing the
          cause stop it recurring?
        </p>
      </div>
    </>
  );
}
