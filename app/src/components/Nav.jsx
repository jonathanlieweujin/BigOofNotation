import React from "react";
import { NavLink } from "react-router-dom";
import { APP_NAME } from "../HardCodedData";
import { NAV_ITEMS } from "../constants/RouteEnum";
import "../styles/Nav.css";

export default function Nav({ onSignOut }) {
  return (
    <nav className="app-nav">
      {/* Replace the mark with the real logo later. */}
      <div className="nav-brand">
        <span className="nav-logo" aria-hidden="true" />
        <span className="nav-brand-name">{APP_NAME}</span>
      </div>

      <ul className="nav-list">
        {NAV_ITEMS.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button className="btn btn--secondary nav-signout" onClick={onSignOut}>
        Sign out
      </button>
    </nav>
  );
}
