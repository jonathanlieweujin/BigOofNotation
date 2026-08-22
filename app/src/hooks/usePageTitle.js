import { useEffect } from "react";
import { APP_NAME } from "../HardCodedData";

/* Sets the browser tab title to "Re-Engage | <suffix>".
   Pass no suffix to show the app name alone. */
export default function usePageTitle(suffix) {
  useEffect(() => {
    document.title = suffix ? `${APP_NAME} | ${suffix}` : APP_NAME;
  }, [suffix]);
}
