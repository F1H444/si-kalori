import React from "react";
import BrutalHero from "./hero";
import CaraKerja from "./how";
import Features from "./fitur";
import TargetAudienceSection from "./target";
import FaqSection from "./faq";

const page = () => {
  return (
    <>
      <BrutalHero />
      <CaraKerja />
      <Features />
      <TargetAudienceSection />
      <FaqSection />
    </>
  );
};

export default page;
