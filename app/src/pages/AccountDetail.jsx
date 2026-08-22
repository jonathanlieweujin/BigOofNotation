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
import "../styles/AccountDetail.css";

export default function AccountDetail() {
  const { id } = useParams();
  const a = getAccount(id);

  if (!a) {
    return (
      <>
        <h1 className="page-title">Account not found</h1>
        <Link to="/accounts">Back to accounts</Link>
      </>
    );
  }

  const diagnosis = DIAGNOSES[a.diagnosis];
  const need = NEED_STATES[diagnosis.needState];
  const tier = CONFIDENCE_TIERS[a.tier];
  const action = a.recommended ? ACTIONS[a.recommended] : null;

  return (
    <>
      <Link to="/accounts" className="back-link">
        ← Accounts
      </Link>
      <h1 className="page-title">{a.name}</h1>

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
        <p className="hint">
          Every signal that fired, and its weight. All evidence is self-reported,
          and text-only input has no way to falsify a stated cause.
        </p>
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
