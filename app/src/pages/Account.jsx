import React from "react";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES, RouteEnum } from "../constants/RouteEnum";
import "../styles/Account.css";

export default function Account({ user, onSignOut }) {
  usePageTitle(PAGE_TITLES[RouteEnum.ACCOUNT]);

  /* Set via Supabase dashboard -> Authentication -> Users -> Raw user meta
     data, e.g. { "full_name": "Admin" }. Falls back to the email if unset. */
  const name = user.user_metadata?.full_name || user.email;

  return (
    <>
      <h1 className="page-title">Account</h1>
      {/* <p className="page-subtitle">Single role, no teams, no permissions.</p> */}

      <div className="card">
        <h2 className="account-label">Signed in as</h2>
        <p>{name}</p>
        <p className="muted">{user.email}</p>
      </div>

      {/* <div className="card">
        <h2>About</h2>
        <p className="muted">
          {APP_NAME}, demo build. Customer data comes from{" "}
          <code>src/data/diagnoses.json</code>; auth is backed by Supabase.
        </p>
      </div> */}

      {/* <button className="btn btn--secondary" onClick={onSignOut}>
        Sign out
      </button> */}
    </>
  );
}
