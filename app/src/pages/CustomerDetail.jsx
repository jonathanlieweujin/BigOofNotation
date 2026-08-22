import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ACTIONS,
  CONFIDENCE_TIERS,
  DIAGNOSES,
  EVIDENCE_WEIGHTS,
  NEED_STATES,
  getAccount,
} from "../HardCodedData";
import EvidenceBar from "../components/EvidenceBar";
import { RouteEnum } from "../constants/RouteEnum";
import usePageTitle from "../hooks/usePageTitle";
import "../styles/CustomerDetail.css";

export default function CustomerDetail() {
  const { id } = useParams();
  const a = getAccount(id);

  /* Called before the early return so the hook order stays stable. */
  usePageTitle(a ? a.name : "Customer not found");

  if (!a) {
    return (
      <>
        <h1 className="page-title">Customer not found</h1>
        <Link to={RouteEnum.CUSTOMERS}>Back to customers</Link>
      </>
    );
  }

  const diagnosis = DIAGNOSES[a.diagnosis];
  const need = NEED_STATES[diagnosis.needState];
  const tier = CONFIDENCE_TIERS[a.tier];
  const action = a.recommended ? ACTIONS[a.recommended] : null;

  return (
    <>
      <div className="detail-head">
        <Link
          to={RouteEnum.CUSTOMERS}
          className="back-btn"
          aria-label="Back to customers"
        >
          <svg viewBox="0 0 15 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.6365 2.24967C13.7567 2.12237 13.8508 1.97263 13.9132 1.80899C13.9756 1.64535 14.0052 1.47102 14.0003 1.29595C13.9953 1.12088 13.9559 0.948504 13.8843 0.788656C13.8128 0.628808 13.7104 0.484623 13.5831 0.364332C13.4558 0.244041 13.3061 0.150001 13.1424 0.0875803C12.9788 0.0251596 12.8045 -0.00441913 12.6294 0.000533336C12.4543 0.0054858 12.282 0.0448722 12.1221 0.116444C11.9623 0.188016 11.8181 0.290371 11.6978 0.417665L0.364457 12.4177C0.130408 12.6652 0 12.993 0 13.3337C0 13.6743 0.130408 14.0021 0.364457 14.2497L11.6978 26.251C11.8173 26.3811 11.9614 26.4861 12.1219 26.56C12.2823 26.6339 12.4558 26.6752 12.6324 26.6815C12.8089 26.6877 12.9849 26.6589 13.1502 26.5966C13.3154 26.5342 13.4667 26.4397 13.5951 26.3184C13.7235 26.1971 13.8266 26.0516 13.8983 25.8901C13.97 25.7287 14.0089 25.5546 14.0127 25.378C14.0166 25.2014 13.9853 25.0258 13.9207 24.8614C13.8561 24.697 13.7595 24.5471 13.6365 24.4203L3.16712 13.3337L13.6365 2.24967Z"
              fill="#EFEFEF"
            />
          </svg>
        </Link>
        <h1 className="page-title">{a.name}</h1>
      </div>

      {/* The one-sentence why, largest text on the page. */}
      <div className="card">
        <p className="why">{a.why}</p>
        <div className="why-meta">
          <span className={`badge badge--${tier.badge}`}>{tier.label}</span>
          <span className="chip">{diagnosis.label}</span>
          <span className="chip">Need: {need.label}</span>
        </div>
      </div>

      <div className="card">
        <h2>Evidence</h2>
        {/* <p className="hint">
          Every signal that fired, and its weight. All evidence is self-reported,
          and text-only input has no way to falsify a stated cause.
        </p> */}
        <EvidenceBar evidence={a.evidence} score={a.confidence} tier={tier} />

        <ul className="evidence">
          {a.evidence.map((e, i) => {
            const w = EVIDENCE_WEIGHTS[e.type];
            return (
              <li key={i}>
                <span className="evidence-weight">{w.weight}</span>
                <span>
                  <strong>{w.label}</strong>
                  <br />
                  <span className="muted">{e.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card">
        <h2>Recommended action</h2>
        {action ? (
          <>
            <p className="action-label">{action.label}</p>
            <p className="muted">
              Cost: {action.cost} · Reversible: {action.reversible}
            </p>
            <button className="btn">Execute</button>
          </>
        ) : (
          <p className="empty-state">
            No action, confidence below the threshold. Logged for observation
            only, no customer contact.
          </p>
        )}
      </div>

      {/* The differentiating block: what was ruled out, and why. */}
      <div className="card">
        <h2>Ruled out</h2>
        <ul className="rejected">
          {a.rejected.map((r, i) => (
            <li key={i}>
              <strong>{ACTIONS[r.action].label}</strong>
              <span className="muted">: {r.reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Timeline</h2>
        <ul className="timeline">
          {a.timeline.map((t, i) => (
            <li key={i}>
              <span className="muted">{t.date}</span>
              <span>{t.event}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
