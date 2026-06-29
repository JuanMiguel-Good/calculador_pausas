import{s as u,n as s,a as p,b as v,g}from"./index-CKszgeZc.js";function f(){const e=location.hash.slice(1),o=e.includes("?")?e.split("?")[1]:"";return new URLSearchParams(o)}async function y(e){const n=f().get("ruc");n?m(e,n):b(e)}function b(e){e.innerHTML=`
<div class="lv-wrap">
  <div class="lv-card">
    <div class="lv-logo">
      <img src="/logo_blanco_good.png" alt="Good Solutions" class="lv-logo-img">
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
</div>`,c();const o=e.querySelector("#lvSubmit"),n=e.querySelector("#lvError");function i(r){n.textContent=r,n.style.display=""}async function l(){n.style.display="none",o.disabled=!0,o.textContent="Ingresando…";try{const r=e.querySelector("#lvIdentifier").value.trim(),t=e.querySelector("#lvPassword").value;if(!r){i("Ingresa tu DNI o correo electrónico.");return}if(!t){i("Ingresa tu DNI como contraseña.");return}if(!/^\d{8}$/.test(r)&&!r.includes("@")){i("Ingresa un DNI de 8 dígitos o un correo electrónico válido.");return}await p(r,t);const{data:{user:a}}=await v.auth.getUser(),d=a?await g(a.id):null;if(!d){i("No se encontró un perfil para este usuario.");return}d.role==="superadmin"?s("/superadmin"):d.role==="admin"?s("/admin"):s("/worker")}catch(r){const t=r.message||"";i(t.includes("Invalid login")||t.includes("invalid_credentials")?"Credenciales incorrectas. Verifica tu DNI/correo y contraseña.":t||"Error al iniciar sesión.")}finally{o.disabled=!1,o.textContent="Ingresar"}}o.addEventListener("click",l),e.querySelectorAll(".lv-input").forEach(r=>{r.addEventListener("keydown",t=>{t.key==="Enter"&&l()})})}function m(e,o){e.innerHTML=`
<div class="lv-wrap">
  <div class="lv-card">
    <div class="lv-logo">
      <img src="/logo_blanco_good.png" alt="Good Solutions" class="lv-logo-img">
    </div>
    <h1 class="lv-title">Acceso trabajador</h1>
    <p class="lv-sub">Ingresa tu DNI para acceder a tu programa de pausas</p>

    <div class="lv-field">
      <label class="lv-label">DNI</label>
      <input class="lv-input lv-input-lg" id="lvDni" type="text" inputmode="numeric"
        maxlength="8" placeholder="12345678" autocomplete="username">
    </div>

    <div id="lvError" class="lv-error" style="display:none"></div>
    <button class="lv-btn-primary" id="lvSubmit">Ingresar</button>
  </div>
</div>`,c();const n=e.querySelector("#lvSubmit"),i=e.querySelector("#lvError");function l(t){i.textContent=t,i.style.display=""}async function r(){i.style.display="none",n.disabled=!0,n.textContent="Ingresando…";try{const t=e.querySelector("#lvDni").value.trim();if(!/^\d{8}$/.test(t)){l("Ingresa tu DNI de 8 dígitos.");return}await u(t,o),s("/worker")}catch(t){const a=t.message||"";l(a.includes("Invalid login")||a.includes("invalid_credentials")?"DNI no encontrado o sin acceso. Consulta con tu administrador.":a||"Error al iniciar sesión.")}finally{n.disabled=!1,n.textContent="Ingresar"}}n.addEventListener("click",r),e.querySelector("#lvDni").addEventListener("keydown",t=>{t.key==="Enter"&&r()})}function c(){if(document.getElementById("lvStyles"))return;const e=document.createElement("style");e.id="lvStyles",e.textContent=`
    .lv-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg); }
    .lv-card { background:#fff;border-radius:20px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.1); }
    .lv-logo { display:flex;align-items:center;justify-content:center;margin-bottom:28px; }
    .lv-logo-img { height:48px;width:auto; }
    .lv-title { font-size:24px;font-weight:800;color:var(--navy);text-align:center;margin-bottom:8px; }
    .lv-sub { font-size:14px;color:var(--slate);text-align:center;margin-bottom:28px; }
    .lv-field { margin-bottom:16px; }
    .lv-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:6px; }
    .lv-hint { font-weight:400;color:var(--slate); }
    .lv-input { width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s;box-sizing:border-box; }
    .lv-input-lg { font-size:22px;font-weight:700;text-align:center;letter-spacing:4px;padding:16px 14px; }
    .lv-input:focus { outline:none;border-color:var(--blue); }
    .lv-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:9px;padding:11px 14px;font-size:13px;margin-bottom:14px; }
    .lv-btn-primary { width:100%;padding:14px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-top:6px; }
    .lv-btn-primary:hover { background:#1d4ed8; }
    .lv-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
    .lv-footer { text-align:center;font-size:13px;color:var(--slate);margin-top:22px; }
    .lv-link { background:none;border:none;color:var(--blue);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline; }
  `,document.head.appendChild(e)}export{y as renderLogin};
