import React from "react";
import { APP_NAME, DEMO_USER } from "../HardCodedData";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES, RouteEnum } from "../constants/RouteEnum";

export default function Account({ onSignOut }) {
  usePageTitle(PAGE_TITLES[RouteEnum.ACCOUNT]);
  return (
    <>
      <h1 className="page-title">Account</h1>
      {/* <p className="page-subtitle">Single role, no teams, no permissions.</p> */}

      <div className="card">
        <h2>Signed in as</h2>
        <p>{DEMO_USER.name}</p>
        <p className="muted">{DEMO_USER.username}</p>
        <p className="muted">{DEMO_USER.email}</p>
      </div>

      <div className="card">
        <h2>About</h2>
        <p className="muted">
          {APP_NAME}, demo build. Data is hardcoded in{" "}
          <code>src/HardCodedData.js</code>.
        </p>
      </div>

      {/* <button className="btn btn--secondary" onClick={onSignOut}>
        Sign out
      </button> */}
    </>
  );
}
