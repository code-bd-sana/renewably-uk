import FundedProjectsSupport from "@/components/Funding/FundedProjectsSupport";
import FundingBanner from "@/components/Funding/FundingBanner";
import React from "react";

const page = () => {
  return (
    <div>
      <FundingBanner />
      <FundedProjectsSupport />
    </div>
  );
};

export default page;
