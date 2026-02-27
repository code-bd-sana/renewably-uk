import NewsDetails from "@/components/Home/NewsDetails";
import React from "react";

const page = async ({ params }) => {
  const resolvedParams = await params;

  return (
    <div>
      <NewsDetails id={resolvedParams?.id} subId={resolvedParams?.id} />
    </div>
  );
};

export default page;
