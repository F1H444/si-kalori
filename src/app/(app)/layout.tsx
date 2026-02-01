import Sidebar from "@/components/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 max-w-[100vw] overflow-hidden">
        {children}
      </main>
    </div>
  );
}
