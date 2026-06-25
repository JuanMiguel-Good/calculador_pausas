import { supabase } from '../lib/supabase.js';
import { signIn, getActiveCompanies, getProfile } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export async function renderLogin(shell) {
  const params = new URLSearchParams(location.hash.includes('?') ? location.hash.split('?')[1] : '');
  const preRuc = params.get('ruc') || '';
  const preDni = params.get('dni') || '';
  const initialTab = (params.get('mode') === 'worker' || preDni) ? 'dni' : 'email';

  let companies = [];
  try { companies = await getActiveCompanies(); } catch (_) {}

  shell.innerHTML = `
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
    <p class="lv-sub">Administradores y trabajadores de empresas registradas</p>

    <div class="lv-tabs">
      <button class="lv-tab ${initialTab === 'email' ? 'active' : ''}" data-tab="email">Correo electrónico</button>
      <button class="lv-tab ${initialTab === 'dni' ? 'active' : ''}" data-tab="dni">DNI (trabajador)</button>
    </div>

    <!-- Email tab -->
    <div class="lv-panel ${initialTab === 'email' ? 'active' : ''}" id="lvPanelEmail">
      <div class="lv-field">
        <label class="lv-label">Correo electrónico</label>
        <input class="lv-input" id="lvEmail" type="email" placeholder="tu@empresa.com" autocomplete="email">
      </div>
      <div class="lv-field">
        <label class="lv-label">Contraseña</label>
        <input class="lv-input" id="lvPass" type="password" placeholder="••••••••" autocomplete="current-password">
      </div>
    </div>

    <!-- DNI tab -->
    <div class="lv-panel ${initialTab === 'dni' ? 'active' : ''}" id="lvPanelDni">
      <div class="lv-field">
        <label class="lv-label">Empresa</label>
        <select class="lv-input" id="lvCompany">
          <option value="">Selecciona tu empresa…</option>
          ${companies.map(c => `<option value="${c.ruc}" ${c.ruc === preRuc ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="lv-field">
        <label class="lv-label">DNI</label>
        <input class="lv-input" id="lvDni" type="text" inputmode="numeric" maxlength="8" placeholder="12345678" value="${preDni}">
      </div>
      <div class="lv-field">
        <label class="lv-label">Contraseña <span class="lv-hint">(por defecto: tu DNI)</span></label>
        <input class="lv-input" id="lvDniPass" type="password" placeholder="••••••••">
      </div>
    </div>

    <div id="lvError" class="lv-error" style="display:none"></div>
    <button class="lv-btn-primary" id="lvSubmit">Ingresar</button>

    <div class="lv-footer">
      ¿Tu empresa aún no está registrada?
      <button class="lv-link" onclick="location.hash='/register'">Registrar empresa</button>
    </div>
  </div>
</div>`;

  injectLoginStyles();
  wireLogin(shell, initialTab);
}

function wireLogin(shell, initialTab) {
  let activeTab = initialTab;

  shell.querySelectorAll('.lv-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      shell.querySelectorAll('.lv-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
      shell.querySelectorAll('.lv-panel').forEach(p => p.classList.remove('active'));
      shell.querySelector(`#lvPanel${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`).classList.add('active');
    });
  });

  const submitBtn = shell.querySelector('#lvSubmit');
  const errorEl = shell.querySelector('#lvError');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = '';
  }

  submitBtn.addEventListener('click', async () => {
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando…';

    try {
      let identifier, password, ruc = null;

      if (activeTab === 'dni') {
        ruc = shell.querySelector('#lvCompany').value;
        identifier = shell.querySelector('#lvDni').value.trim();
        password = shell.querySelector('#lvDniPass').value;
        if (!ruc) { showError('Selecciona tu empresa.'); return; }
        if (!/^\d{8}$/.test(identifier)) { showError('Ingresa un DNI válido de 8 dígitos.'); return; }
        if (!password) password = identifier; // default password = DNI
      } else {
        identifier = shell.querySelector('#lvEmail').value.trim();
        password = shell.querySelector('#lvPass').value;
        if (!identifier) { showError('Ingresa tu correo electrónico.'); return; }
        if (!password) { showError('Ingresa tu contraseña.'); return; }
      }

      await signIn(identifier, password, ruc);

      const { data: { user } } = await supabase.auth.getUser();
      const profile = user ? await getProfile(user.id) : null;

      if (!profile) { showError('No se encontró un perfil para este usuario.'); return; }

      if (profile.role === 'superadmin') navigate('/superadmin');
      else if (profile.role === 'admin') navigate('/admin');
      else navigate('/worker');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login')) showError('Credenciales incorrectas. Verifica tu DNI/correo y contraseña.');
      else showError(msg || 'Error al iniciar sesión.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ingresar';
    }
  });

  // Allow Enter key to submit
  shell.querySelectorAll('.lv-input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
  });
}

function injectLoginStyles() {
  if (document.getElementById('lvStyles')) return;
  const style = document.createElement('style');
  style.id = 'lvStyles';
  style.textContent = `
    .lv-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg); }
    .lv-card { background:#fff;border-radius:20px;padding:36px 32px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.1); }
    .lv-logo { display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:24px; }
    .lv-logo span { font-size:18px;font-weight:800;color:var(--navy); }
    .lv-title { font-size:22px;font-weight:800;color:var(--navy);text-align:center;margin-bottom:6px; }
    .lv-sub { font-size:13px;color:var(--slate);text-align:center;margin-bottom:24px; }
    .lv-tabs { display:flex;background:var(--slate-light);border-radius:10px;padding:3px;gap:3px;margin-bottom:20px; }
    .lv-tab { flex:1;padding:8px;border:none;background:transparent;border-radius:8px;font-size:12px;font-weight:600;color:var(--slate);cursor:pointer;font-family:inherit;transition:all .15s; }
    .lv-tab.active { background:#fff;color:var(--navy);box-shadow:0 1px 4px rgba(0,0,0,0.1); }
    .lv-panel { display:none; }
    .lv-panel.active { display:block; }
    .lv-field { margin-bottom:14px; }
    .lv-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:5px; }
    .lv-hint { font-weight:400;color:var(--slate); }
    .lv-input { width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:9px;font-size:14px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s;box-sizing:border-box; }
    .lv-input:focus { outline:none;border-color:var(--blue); }
    select.lv-input { cursor:pointer; }
    .lv-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px; }
    .lv-btn-primary { width:100%;padding:14px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-top:4px; }
    .lv-btn-primary:hover { background:#1d4ed8; }
    .lv-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
    .lv-footer { text-align:center;font-size:13px;color:var(--slate);margin-top:20px; }
    .lv-link { background:none;border:none;color:var(--blue);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline; }
  `;
  document.head.appendChild(style);
}
