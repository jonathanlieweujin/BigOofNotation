/* Route paths and nav labels. Enum key maps to the path.
   Change a path here and every link, route, and redirect follows. */

export const RouteEnum = {
  OVERVIEW: "/overview",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  FRICTION: "/friction",
  IMPACT: "/impact",
  ACCOUNT: "/account",
};

/* Labels shown in the left nav, in display order. */
export const NAV_ITEMS = [
  { to: RouteEnum.OVERVIEW, label: "Overview" },
  { to: RouteEnum.CUSTOMERS, label: "Customers" },
  { to: RouteEnum.FRICTION, label: "Issues" },
  { to: RouteEnum.IMPACT, label: "Results" },
  { to: RouteEnum.ACCOUNT, label: "Account" },
];

/* Browser tab titles, rendered as "Re-Engage | <suffix>". */
export const PAGE_TITLES = {
  SIGN_IN: "Log-In",
  [RouteEnum.OVERVIEW]: "Overview",
  [RouteEnum.CUSTOMERS]: "Customers",
  [RouteEnum.FRICTION]: "Issues",
  [RouteEnum.IMPACT]: "Results",
  [RouteEnum.ACCOUNT]: "Account",
};

/* Build a detail path for one customer. */
export const customerPath = (id) => `${RouteEnum.CUSTOMERS}/${id}`;

export default RouteEnum;
