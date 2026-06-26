import{s as c,a as p,g as u,n as l}from"./index-D5YiH_BL.js";async function b(e){e.innerHTML=`
<div class="lv-wrap">
  <div class="lv-card">
    <div class="lv-logo">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="var(--blue)" stroke-width="2"/>
      </svg>
      <span>PausasLab</span>
    </div>
    <h1 class="lv-title">Iniciar sesión</h1>
    <p class="lv-sub">Ingresa con tu DNI o correo electrónico</p>

    <div class="lv-field">
      <label class="lv-label">DNI o correo electrónico</label>
      <input class="lv-input" id="lvIdentifier" type="text" inputmode="text"
        placeholder="12345678 o tu@empresa.com" autocomplete="username">
    </div>
    <div class="lv-field">
      <label class="lv-label">Contraseña <span class="lv-hint">(tu DNI)</span></label>
      <input class="lv-input" id="lvPassword" type="password"
        placeholder="••••••••" autocomplete="current-password">
    </div>

    <div id="lvError" class="lv-error" style="display:none"></div>
    <button class="lv-btn-primary" id="lvSubmit">Ingresar</button>

    <div class="lv-footer">
      ¿Tu empresa aún no está registrada?
      <button class="lv-link" onclick="location.hash='/register'">Registrar empresa</button>
    </div>
  </div>
</div>`,f(),v(e)}function v(e){const n=e.querySelector("#lvSubmit"),i=e.querySelector("#lvError");function o(r){i.textContent=r,i.style.display=""}async function s(){i.style.display="none",n.disabled=!0,n.textContent="Ingresando…";try{const r=e.querySelector("#lvIdentifier").value.trim(),t=e.querySelector("#lvPassword").value;if(!r){o("Ingresa tu DNI o correo electrónico.");return}if(!t){o("Ingresa tu DNI como contraseña.");return}if(!/^\d{8}$/.test(r)&&!r.includes("@")){o("Ingresa un DNI de 8 dígitos o un correo electrónico válido.");return}await c(r,t);const{data:{user:d}}=await p.auth.getUser(),a=d?await u(d.id):null;if(!a){o("No se encontró un perfil para este usuario.");return}a.role==="superadmin"?l("/superadmin"):a.role==="admin"?l("/admin"):l("/worker")}catch(r){const t=r.message||"";t.includes("Invalid login")||t.includes("invalid_credentials")?o("Credenciales incorrectas. Verifica tu DNI/correo y contraseña."):o(t||"Error al iniciar sesión.")}finally{n.disabled=!1,n.textContent="Ingresar"}}n.addEventListener("click",s),e.querySelectorAll(".lv-input").forEach(r=>{r.addEventListener("keydown",t=>{t.key==="Enter"&&s()})})}function f(){if(document.getElementById("lvStyles"))return;const e=document.createElement("style");e.id="lvStyles",e.textContent=`
    .lv-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg); }
    .lv-card { background:#fff;border-radius:20px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.1); }
    .lv-logo { display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:28px; }
    .lv-logo span { font-size:18px;font-weight:800;color:var(--navy); }
    .lv-title { font-size:24px;font-weight:800;color:var(--navy);text-align:center;margin-bottom:8px; }
    .lv-sub { font-size:14px;color:var(--slate);text-align:center;margin-bottom:28px; }
    .lv-field { margin-bottom:16px; }
    .lv-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:6px; }
    .lv-hint { font-weight:400;color:var(--slate); }
    .lv-input { width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s;box-sizing:border-box; }
    .lv-input:focus { outline:none;border-color:var(--blue); }
    .lv-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:9px;padding:11px 14px;font-size:13px;margin-bottom:14px; }
    .lv-btn-primary { width:100%;padding:14px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-top:6px; }
    .lv-btn-primary:hover { background:#1d4ed8; }
    .lv-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
    .lv-footer { text-align:center;font-size:13px;color:var(--slate);margin-top:22px; }
    .lv-link { background:none;border:none;color:var(--blue);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline; }
  `,document.head.appendChild(e)}export{b as renderLogin};
