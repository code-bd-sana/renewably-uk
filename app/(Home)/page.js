import AboutUs from "@/components/Home/AboutUs";
import ExperienceDifference from "@/components/Home/ExperienceDifference";
import HomeBanner from "@/components/Home/HomeBanner";
import OnboardWithRenewably from "@/components/Home/OnboardWithRenewably";
import OurCommitment from "@/components/Home/OurCommitment";
import ServicesWeHost from "@/components/Home/ServicesWeHost";
import TrustedCompliance from "@/components/Home/TrustedCompliance";
import TrustedCoverage from "@/components/Home/TrustedCoverage";

export default function Page() {
  return (
    <div>
      <HomeBanner />
      <TrustedCoverage />
      <ServicesWeHost />
      <OnboardWithRenewably />
      <ExperienceDifference />
      <AboutUs />
      <TrustedCompliance />
      <OurCommitment />
    </div>
  );
}
