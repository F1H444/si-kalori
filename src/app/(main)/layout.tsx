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
    console.log("🔍 [MainLayout] Checking admin status for user:", authUser.email);
    
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email, is_premium")
      .eq("id", authUser.id)
      .single();
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("user_id", authUser.id)
      .maybeSingle();
    
    console.log("📊 [MainLayout] Admin query result:", { 
      adminData, 
      adminError,
      userId: authUser.id 
    });
    
    const isAdminByTable = !!adminData;
    const isAdminByEmail = authUser.email?.toLowerCase() === "admin@sikalori.com";
    const isAdmin = isAdminByTable || isAdminByEmail;
    
    console.log("✅ [MainLayout] Admin detection:", {
      email: authUser.email,
      isAdminByTable,
      isAdminByEmail,
      finalIsAdmin: isAdmin
    });
      
    initialUser = {
      name: profile?.full_name || authUser.email?.split("@")[0] || "User",
      email: authUser.email || "",
      isPremium: profile?.is_premium || false,
      isAdmin: isAdmin,  // SET ADMIN STATUS
    };
    
    console.log("👤 [MainLayout] initialUser created:", initialUser);
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
