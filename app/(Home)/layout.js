import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function HomeLayout({ children }) {
  return (
    <>
      <div className='relative z-50'>
        <Navbar />
      </div>
      <main className='relative -mt-[105px] z-10'>{children}</main>
      <Footer />
    </>
  );
}
