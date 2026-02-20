"use client";

import { useEffect } from "react";

export default function HubSpotChat() {
  useEffect(() => {
    // Prevent loading multiple times if already present
    if (document.getElementById("hs-script-loader")) {
      console.log("HubSpot script already exists");

      // Try to refresh the widget if it exists (helps after navigation)
      if (window.HubSpotConversations?.widget) {
        window.HubSpotConversations.widget.refresh();
        console.log("HubSpot widget refreshed");
      }
      return;
    }

    console.log("Loading HubSpot script...");

    const script = document.createElement("script");
    script.id = "hs-script-loader";
    script.src = "//js-eu1.hs-scripts.com/49105344.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("HubSpot script loaded successfully");
      // Optional: force widget refresh after load
      if (window.HubSpotConversations?.widget) {
        window.HubSpotConversations.widget.refresh();
      }
    };

    script.onerror = (err) => {
      console.error("Failed to load HubSpot script:", err);
    };

    document.body.appendChild(script);

    // Cleanup when component unmounts (important for Next.js navigation)
    return () => {
      const existingScript = document.getElementById("hs-script-loader");
      if (existingScript) {
        existingScript.remove();
        console.log("HubSpot script removed on unmount");
      }
    };
  }, []); // Empty dependency array → runs once per mount

  return null;
}
