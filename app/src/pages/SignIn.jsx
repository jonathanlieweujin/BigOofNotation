import React, { useState } from "react";
import { APP_NAME, APP_TAGLINE } from "../HardCodedData";
import { supabase } from "../supabaseClient";
import Logo from "../components/Logo";
import usePageTitle from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/RouteEnum";
import "../styles/SignIn.css";

export default function SignIn() {
  usePageTitle(PAGE_TITLES.SIGN_IN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("Incorrect email or password.");
    } else {
      setError("");
      /* No onSignIn() call needed: App.jsx listens to Supabase's
         onAuthStateChange and updates itself once the session lands. */
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

        <label className="signin-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="signin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <button className="btn signin-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
