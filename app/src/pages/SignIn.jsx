import React, { useState } from "react";
import { APP_NAME, APP_TAGLINE, checkLogin } from "../HardCodedData";
import Logo from "../components/Logo";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/RouteEnum";
import "../styles/SignIn.css";

export default function SignIn({ onSignIn }) {
  usePageTitle(PAGE_TITLES.SIGN_IN);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (checkLogin(username, password)) {
      setError("");
      onSignIn();
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="signin-wrap">
      <form className="signin-card card" onSubmit={submit}>
        <div className="signin-brand">
          <Logo />
          <span className="signin-name">{APP_NAME}</span>
        </div>
        <p className="signin-tagline">{APP_TAGLINE}</p>

        <label className="signin-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="signin-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />

        <label className="signin-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="signin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn signin-submit" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
