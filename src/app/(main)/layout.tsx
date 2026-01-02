import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar/>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer/>
    </>
  );
}
