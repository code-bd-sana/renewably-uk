import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ActivityTracker from "@/components/ActivityTracker";
import Script from "next/script";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Renewably",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={manrope.className}>
        <Toaster />
        <ActivityTracker />
        {children}
        {/* HubSpot tracking + chat script */}
        <Script
          id='hs-script-loader'
          src='//js-eu1.hs-scripts.com/49105344.js'
          strategy='afterInteractive'
          async
        />
      </body>
    </html>
  );
}
