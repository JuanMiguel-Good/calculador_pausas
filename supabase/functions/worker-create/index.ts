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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller identity
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await adminClient.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!callerProfile || !["admin", "superadmin"].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: "Sin permisos" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, dni, company_id, job_position_id } = body;

    if (!name || !dni || !company_id) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin can only create workers for their own company
    if (callerProfile.role === "admin" && callerProfile.company_id !== company_id) {
      return new Response(JSON.stringify({ error: "Sin permisos para esta empresa" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get company RUC for email construction
    const { data: company, error: companyErr } = await adminClient
      .from("companies")
      .select("ruc")
      .eq("id", company_id)
      .maybeSingle();

    if (companyErr || !company) {
      return new Response(JSON.stringify({ error: "Empresa no encontrada" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = `dni_${dni}@${company.ruc}.pausas.internal`;

    // Check if worker with this DNI already exists in this company
    const { data: existing } = await adminClient
      .from("profiles")
      .select("id")
      .eq("dni", dni)
      .eq("company_id", company_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Ya existe un trabajador con este DNI en esta empresa" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user (password = DNI by default)
    const { data: { user: newUser }, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: dni,
      email_confirm: true,
    });

    if (createErr || !newUser) {
      return new Response(JSON.stringify({ error: createErr?.message || "Error al crear usuario" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create profile
    const { error: profileErr } = await adminClient.from("profiles").insert({
      id: newUser.id,
      company_id,
      role: "worker",
      full_name: name,
      dni,
    });

    if (profileErr) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(newUser.id);
      return new Response(JSON.stringify({ error: "Error al crear perfil: " + profileErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create worker assignment if job_position_id provided
    if (job_position_id) {
      await adminClient.from("worker_assignments").insert({
        worker_id: newUser.id,
        job_position_id,
        assigned_by: user.id,
      });
    }

    // Build login URL for the admin to share
    const origin = req.headers.get("Origin") || "";
    const loginUrl = `${origin}/#/login?mode=worker&ruc=${encodeURIComponent(company.ruc)}&dni=${encodeURIComponent(dni)}`;

    return new Response(JSON.stringify({ success: true, workerId: newUser.id, loginUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
