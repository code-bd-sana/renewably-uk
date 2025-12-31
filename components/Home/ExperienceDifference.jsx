import Link from "next/link";

const ExperienceDifference = () => {
  return (
    <section className="w-full bg-[#0F47A8] py-[72px]">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-white text-[24px] font-semibold mb-3">
          Experience the Difference
        </h2>

        {/* Subheading */}
        <p className="text-white/80 text-[14px] mb-8">
          Join the UK’s leading platform for the Renewably Energy Industry
        </p>

        {/* CTA Button */}
        <Link href={"/signup"}>
          <button
            className="
            bg-white
            text-[#0F47A8]
            text-[14px]
            font-medium
            px-6
            py-2.5
            rounded-[6px]
            hover:bg-[#F1F5FF]
            transition
            cursor-pointer
          "
          >
            Get Started Today
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ExperienceDifference;
