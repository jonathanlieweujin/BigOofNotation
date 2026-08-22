import React from "react";
import FRICTION from "../data/friction.json";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES, RouteEnum } from "../constants/RouteEnum";
import "../styles/Friction.css";

const money = (n) => "RM" + n.toLocaleString();

export default function Friction() {
  usePageTitle(PAGE_TITLES[RouteEnum.FRICTION]);
  const max = Math.max(...FRICTION.map((f) => f.arrAffected));
  const sorted = [...FRICTION].sort((a, b) => b.arrAffected - a.arrAffected);

  return (
    <>
      <h1 className="page-title">Issues</h1>
      {/* <p className="page-subtitle">
        Stated causes clustered across accounts, sorted by revenue at risk. One
        account is anecdote; seventeen is a defect report.
      </p> */}

      <div className="card">
        {sorted.map((f, i) => (
          <div className="friction-row" key={f.id}>
            <div className="friction-head">
              <strong>{f.cause}</strong>
              <span className="muted">
                {f.accountCount} accounts · {money(f.arrAffected)} ARR
              </span>
            </div>
            {/* Sequential ramp: ordered magnitude, three validated steps. */}
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(f.arrAffected / max) * 100}%`,
                  background: `var(--seq-${Math.min(3, 3 - i)})`,
                }}
              />
            </div>
            <p className="muted friction-trend">
              Trend: {f.trend} · first seen {f.firstSeen}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
