import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ActivityTracker from "@/components/ActivityTracker";
import Script from "next/script";
import HubSpotChat from "@/components/HubSpotChat";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Renewably UK - Powering Renewable",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={manrope.className}>
        <Toaster />
        <ActivityTracker />
        {children}

        {/* <Script
          id='hs-script-loader'
          src='//js-eu1.hs-scripts.com/49105344.js'
          strategy='afterInteractive'
          async
        /> */}
        {/* HubSpot debug: logs presence and attempts a reload if available */}
        {/* <Script id='hs-debug' strategy='afterInteractive'>
          {`(function(){try{console.log('hs-debug: waiting for HubSpotConversations');function check(){if(window.HubSpotConversations){console.log('hs-debug: HubSpotConversations found', window.HubSpotConversations);try{if(typeof window.HubSpotConversations.resetAndReloadWidget==='function'){window.HubSpotConversations.resetAndReloadWidget();console.log('hs-debug: resetAndReloadWidget called');}else{console.log('hs-debug: resetAndReloadWidget not available');}}catch(e){console.error('hs-debug: error calling reset',e);} }else{console.log('hs-debug: not yet initialized, retrying');setTimeout(check,500);} }check();}catch(e){console.error('hs-debug init error',e);} })();`}
        </Script> */}
        {/* HubSpot tracking + chat script */}
        <HubSpotChat />
      </body>
    </html>
  );
}
