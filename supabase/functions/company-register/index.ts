import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { companyName, ruc, contactEmail, adminName, adminDni } = await req.json();

    if (!companyName || !ruc || !contactEmail || !adminName || !adminDni) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for duplicate RUC
    const { data: existing } = await adminClient
      .from("companies")
      .select("id")
      .eq("ruc", ruc)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Ya existe una empresa registrada con ese RUC" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user (email_confirm: true bypasses confirmation email)
    const { data: { user }, error: createErr } = await adminClient.auth.admin.createUser({
      email: contactEmail,
      password: adminDni,
      email_confirm: true,
    });

    if (createErr || !user) {
      return new Response(JSON.stringify({ error: createErr?.message || "Error al crear usuario" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert company
    const { data: company, error: companyErr } = await adminClient
      .from("companies")
      .insert({ name: companyName, ruc, contact_email: contactEmail, status: "pending" })
      .select()
      .maybeSingle();

    if (companyErr || !company) {
      await adminClient.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ error: companyErr?.message || "Error al crear empresa" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert admin profile
    const { error: profileErr } = await adminClient.from("profiles").insert({
      id: user.id,
      company_id: company.id,
      role: "admin",
      full_name: adminName,
      dni: adminDni,
    });

    if (profileErr) {
      await adminClient.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ error: "Error al crear perfil: " + profileErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
