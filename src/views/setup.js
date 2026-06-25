import { supabase } from '../lib/supabase.js';
import { navigate } from '../lib/router.js';

export function renderSetup(shell) {
  shell.innerHTML = `
<div class="sv-wrap">
  <div class="sv-card">
    <div class="sv-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--navy)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1 class="sv-title">Configuración inicial</h1>
    <p class="sv-sub">Crea la cuenta de superadministrador. Esto solo puede hacerse una vez.</p>

    <div class="sv-field">
      <label class="sv-label">Nombre completo</label>
      <input class="sv-input" id="svName" type="text" placeholder="Nombre del superadmin">
    </div>
    <div class="sv-field">
      <label class="sv-label">Correo electrónico</label>
      <input class="sv-input" id="svEmail" type="email" placeholder="superadmin@pausas.internal" autocomplete="email">
    </div>
    <div class="sv-field">
      <label class="sv-label">Contraseña</label>
      <input class="sv-input" id="svPass" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
    </div>

    <div id="svError" class="sv-error" style="display:none"></div>
    <div id="svSuccess" class="sv-success-msg" style="display:none">Superadmin creado correctamente. Redirigiendo…</div>
    <button class="sv-btn-primary" id="svSubmit">Crear superadmin</button>
  </div>
</div>`;

  injectSetupStyles();

  const submitBtn = shell.querySelector('#svSubmit');
  const errorEl = shell.querySelector('#svError');
  const successEl = shell.querySelector('#svSuccess');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = '';
  }

  submitBtn.addEventListener('click', async () => {
    errorEl.style.display = 'none';

    const fullName = shell.querySelector('#svName').value.trim();
    const email = shell.querySelector('#svEmail').value.trim();
    const password = shell.querySelector('#svPass').value;

    if (!fullName) return showError('Ingresa el nombre completo.');
    if (!email.includes('@')) return showError('Ingresa un correo válido.');
    if (password.length < 8) return showError('La contraseña debe tener al menos 8 caracteres.');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando…';

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wfmuvdioqscurgvdzddu.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbXV2ZGlvcXNjdXJndmR6ZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNTEzMTksImV4cCI6MjA5NzkyNzMxOX0.-F7hg34iIbYLVT4NTDNjFaNeYhN5YzjkxdiEqw1Tp5s';
      const res = await fetch(`${supabaseUrl}/functions/v1/setup-superadmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);

      successEl.style.display = '';
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showError(err.message || 'Error al crear el superadmin.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear superadmin';
    }
  });
}

function injectSetupStyles() {
  if (document.getElementById('svStyles')) return;
  const style = document.createElement('style');
  style.id = 'svStyles';
  style.textContent = `
    .sv-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg); }
    .sv-card { background:#fff;border-radius:20px;padding:40px 32px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.1);text-align:center; }
    .sv-icon { width:72px;height:72px;background:#e8edf3;border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }
    .sv-title { font-size:22px;font-weight:800;color:var(--navy);margin-bottom:8px; }
    .sv-sub { font-size:13px;color:var(--slate);margin-bottom:28px;line-height:1.6; }
    .sv-field { text-align:left;margin-bottom:14px; }
    .sv-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:5px; }
    .sv-input { width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:9px;font-size:14px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s;box-sizing:border-box; }
    .sv-input:focus { outline:none;border-color:var(--blue); }
    .sv-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px;text-align:left; }
    .sv-success-msg { background:#ecfdf5;border:1px solid #a7f3d0;color:#059669;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px;text-align:left; }
    .sv-btn-primary { width:100%;padding:14px;background:var(--navy);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s; }
    .sv-btn-primary:hover { background:#1e3a5f; }
    .sv-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
  `;
  document.head.appendChild(style);
}
