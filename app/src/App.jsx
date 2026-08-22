import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import SignIn from "./pages/SignIn";
import Overview from "./pages/Overview";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Friction from "./pages/Friction";
import Impact from "./pages/Impact";
import Account from "./pages/Account";
import { RouteEnum } from "./constants/RouteEnum";
import { supabase } from "./supabaseClient";

/* Auth is real now, backed by Supabase. `session` is undefined while we're
   still checking (avoids a flash of the sign-in page on refresh), null when
   signed out, and the Supabase session object when signed in. */
export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (session === undefined) {
    return null; /* still checking for an existing session */
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<SignIn />} />
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
            element={<Navigate to={RouteEnum.OVERVIEW} replace />}
          />
          <Route path={RouteEnum.OVERVIEW} element={<Overview />} />
          <Route path={RouteEnum.CUSTOMERS} element={<Customers />} />
          <Route path={RouteEnum.CUSTOMER_DETAIL} element={<CustomerDetail />} />
          <Route path={RouteEnum.FRICTION} element={<Friction />} />
          <Route path={RouteEnum.IMPACT} element={<Impact />} />
          <Route
            path={RouteEnum.ACCOUNT}
            element={<Account user={session.user} onSignOut={signOut} />}
          />
          <Route
            path="*"
            element={<Navigate to={RouteEnum.OVERVIEW} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
