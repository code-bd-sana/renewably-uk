import HowIBGsDelivered from "@/components/Insurance/HowIBGsDelivered";
import InsuranceBackedGuarantee from "@/components/Insurance/InsuranceBackedGuarantee";
import InsuranceBanner from "@/components/Insurance/InsuranceBanner";
import MeasuresWeHost from "@/components/Insurance/MeasuresWeHost";
import WhyIBGsEssential from "@/components/Insurance/WhyIBGsEssential";
import React from "react";

const page = () => {
  return (
    <div>
      <InsuranceBanner />
      <InsuranceBackedGuarantee />
      <WhyIBGsEssential />
      <MeasuresWeHost />
      <HowIBGsDelivered />
    </div>
  );
};

export default page;
