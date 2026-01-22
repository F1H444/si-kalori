import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Generate Link
    // We use generateLink type 'recovery'
    // redirectTo should point to our new Update Password page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/update-password`;

    console.log("DEBUG: Generating recovery link with redirectTo:", redirectTo);

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("DEBUG: Supabase Admin Error:", error);
      return NextResponse.json(
        { error: `Gagal membuat link reset password: ${error.message}` },
        { status: 400 }
      );
    }

    const { properties } = data;
    const recoveryLink = properties.action_link;

    console.log("DEBUG: Recovery link generated successfully");
    console.log("DEBUG: Target Email:", email);
    console.log("DEBUG: Link:", recoveryLink);

    // 2. Send Email via EmailJS (Server-side)
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey && privateKey) {
        try {
            const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    accessToken: privateKey,
                    template_params: {
                        to_email: email,
                        from_name: "SiKalori",
                        reset_link: recoveryLink,
                    }
                })
            });

            if (!emailRes.ok) {
                const emailError = await emailRes.text();
                console.error("EmailJS Error:", emailError);
            }
        } catch (emailErr) {
             console.error("EmailJS Exception:", emailErr);
        }
    }

    return NextResponse.json({ message: "Link reset password telah dikirim." });
  } catch (err: any) {
    console.error("Handler Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
