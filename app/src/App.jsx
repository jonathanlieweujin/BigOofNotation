import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import SignIn from "./pages/SignIn";
import Accounts from "./pages/Accounts";
import AccountDetail from "./pages/AccountDetail";
import Friction from "./pages/Friction";
import Impact from "./pages/Impact";
import Account from "./pages/Account";

/* Auth is a placeholder: any submit signs you in. No backend by design. */
export default function App() {
  const [signedIn, setSignedIn] = useState(
    () => sessionStorage.getItem("signedIn") === "1"
  );

  const signIn = () => {
    sessionStorage.setItem("signedIn", "1");
    setSignedIn(true);
  };

  const signOut = () => {
    sessionStorage.removeItem("signedIn");
    setSignedIn(false);
  };

  if (!signedIn) {
    return (
      <Routes>
        <Route path="*" element={<SignIn onSignIn={signIn} />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Nav onSignOut={signOut} />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/accounts" replace />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/friction" element={<Friction />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/account" element={<Account onSignOut={signOut} />} />
          <Route path="*" element={<Navigate to="/accounts" replace />} />
        </Routes>
      </main>
    </div>
  );
}
