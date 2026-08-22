import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import SignIn from "./pages/SignIn";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Friction from "./pages/Friction";
import Impact from "./pages/Impact";
import Account from "./pages/Account";
import { RouteEnum } from "./constants/RouteEnum";

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
          <Route
            path="/"
            element={<Navigate to={RouteEnum.CUSTOMERS} replace />}
          />
          <Route path={RouteEnum.CUSTOMERS} element={<Customers />} />
          <Route path={RouteEnum.CUSTOMER_DETAIL} element={<CustomerDetail />} />
          <Route path={RouteEnum.FRICTION} element={<Friction />} />
          <Route path={RouteEnum.IMPACT} element={<Impact />} />
          <Route
            path={RouteEnum.ACCOUNT}
            element={<Account onSignOut={signOut} />}
          />
          <Route
            path="*"
            element={<Navigate to={RouteEnum.CUSTOMERS} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
