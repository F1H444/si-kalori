import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase-server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  let initialUser = null;
  
  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email, is_premium")
      .eq("id", authUser.id)
      .single();
      
    initialUser = {
      name: profile?.full_name || authUser.email?.split("@")[0] || "User",
      email: authUser.email || "",
      isPremium: profile?.is_premium || false,
    };
  }

  return (
    <>
      <Navbar initialUser={initialUser} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer/>
    </>
  );
}
