"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

// const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 10 minutes testing
const INACTIVITY_TIMEOUT = 10 * 3600 * 1000; // 1 hourrtrrrrrfrrrr testing
const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

export default function ActivityTracker() {
  const pathname = usePathname();
  const timerRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ===============================
     CHECK AUTH
  ================================ */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  /* ===============================
     INACTIVITY LOGIC
  ================================ */
  useEffect(() => {
    if (!isAuthenticated) return;

    const isPublicPage = PUBLIC_PATHS.includes(pathname);

    const logoutUser = async () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        console.error(e);
      }

      toast.error("Logged out due to inactivity");

      // Dispatch custom event for Navbar to listen to
      window.dispatchEvent(new CustomEvent("user-logged-out"));

      // Redirect ONLY if private page
      if (!isPublicPage) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logoutUser, INACTIVITY_TIMEOUT);
    };

    resetTimer();

    let throttleTimer = null;
    const handleActivity = () => {
      if (isLoggingOutRef.current) return;

      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        resetTimer();
        throttleTimer = null;
      }, 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, handleActivity));

    const visibilityHandler = () => {
      if (!document.hidden) resetTimer();
    };

    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      document.removeEventListener("visibilitychange", visibilityHandler);

      if (timerRef.current) clearTimeout(timerRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [pathname, isAuthenticated]);

  return null;
}
