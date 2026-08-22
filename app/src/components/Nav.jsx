import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { APP_NAME } from "../HardCodedData";
import { NAV_ITEMS } from "../constants/RouteEnum";
import "../styles/Nav.css";

export default function Nav({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  /* Close the drawer after navigating, otherwise it stays over the new page. */
  useEffect(() => setOpen(false), [pathname]);

  /* Escape closes it, same as tapping the overlay. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Top bar: only visible on narrow viewports. */}
      <div className="nav-topbar">
        <button
          className="nav-burger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 7.5C0 7.10218 0.158035 6.72064 0.43934 6.43934C0.720644 6.15804 1.10218 6 1.5 6H30.5C30.8978 6 31.2794 6.15804 31.5607 6.43934C31.842 6.72064 32 7.10218 32 7.5C32 7.89782 31.842 8.27936 31.5607 8.56066C31.2794 8.84196 30.8978 9 30.5 9H1.5C1.10218 9 0.720644 8.84196 0.43934 8.56066C0.158035 8.27936 0 7.89782 0 7.5ZM0 16C0 15.6022 0.158035 15.2206 0.43934 14.9393C0.720644 14.658 1.10218 14.5 1.5 14.5H30.5C30.8978 14.5 31.2794 14.658 31.5607 14.9393C31.842 15.2206 32 15.6022 32 16C32 16.3978 31.842 16.7794 31.5607 17.0607C31.2794 17.342 30.8978 17.5 30.5 17.5H1.5C1.10218 17.5 0.720644 17.342 0.43934 17.0607C0.158035 16.7794 0 16.3978 0 16ZM1.5 23C1.10218 23 0.720644 23.158 0.43934 23.4393C0.158035 23.7206 0 24.1022 0 24.5C0 24.8978 0.158035 25.2794 0.43934 25.5607C0.720644 25.842 1.10218 26 1.5 26H30.5C30.8978 26 31.2794 25.842 31.5607 25.5607C31.842 25.2794 32 24.8978 32 24.5C32 24.1022 31.842 23.7206 31.5607 23.4393C31.2794 23.158 30.8978 23 30.5 23H1.5Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="nav-brand">
          <Logo />
          <span className="nav-brand-name">{APP_NAME}</span>
        </div>
      </div>

      {/* Blurred scrim behind the drawer; tapping it closes the nav. */}
      {open && (
        <div
          className="nav-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={"app-nav" + (open ? " app-nav--open" : "")}>
        {/* Duplicated for the desktop sidebar, hidden in the top bar layout. */}
        <div className="nav-brand nav-brand--sidebar">
          <Logo />
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
    </>
  );
}
