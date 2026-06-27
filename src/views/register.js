import { registerCompany } from '../lib/auth.js';

export function renderRegister(shell) {
  shell.innerHTML = `
<div class="rv-wrap">
  <div class="rv-card" id="rvForm">
    <div class="rv-header">
      <button class="rv-back" onclick="location.hash='/'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver
      </button>
      <div class="rv-logo">
        <img src="/logo_blanco_good.png" alt="Good Solutions" class="rv-logo-img">
      </div>
    </div>

    <h1 class="rv-title">Registrar empresa</h1>
    <p class="rv-sub">Gratis durante el período de lanzamiento. Revisamos tu solicitud en menos de 24 horas.</p>

    <div class="rv-section-label">Datos de la empresa</div>
    <div class="rv-field">
      <label class="rv-label">Nombre de la empresa</label>
      <input class="rv-input" id="rvName" type="text" placeholder="Empresa S.A.C.">
    </div>
    <div class="rv-field">
      <label class="rv-label">RUC</label>
      <input class="rv-input" id="rvRuc" type="text" inputmode="numeric" maxlength="11" placeholder="20123456789">
    </div>

    <div class="rv-section-label" style="margin-top:20px">Administrador responsable</div>
    <div class="rv-field">
      <label class="rv-label">Nombre completo</label>
      <input class="rv-input" id="rvAdminName" type="text" placeholder="Juan Pérez García">
    </div>
    <div class="rv-field">
      <label class="rv-label">DNI del administrador</label>
      <input class="rv-input" id="rvAdminDni" type="text" inputmode="numeric" maxlength="8" placeholder="12345678">
    </div>
    <div class="rv-field">
      <label class="rv-label">Correo electrónico</label>
      <input class="rv-input" id="rvEmail" type="email" placeholder="admin@empresa.com" autocomplete="email">
    </div>
    <div class="rv-info-box">
      Tu contraseña inicial será tu DNI. Podrás cambiarla después desde tu perfil.
    </div>

    <div id="rvError" class="rv-error" style="display:none"></div>
    <button class="rv-btn-primary" id="rvSubmit">Enviar solicitud</button>

    <p class="rv-footer-note">Al registrarte aceptas usar el sistema para cumplir la RM N° 546-2026-MINSA.</p>
  </div>

  <!-- Success state -->
  <div class="rv-card rv-success" id="rvSuccess" style="display:none">
    <div class="rv-success-icon">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="1.8"/>
        <path d="M8 12l3 3 5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 class="rv-success-title">Solicitud enviada</h2>
    <p class="rv-success-body">Revisaremos tu solicitud y te notificaremos al correo registrado en menos de <strong>24 horas</strong>. Una vez aprobada podrás configurar los puestos de trabajo y agregar trabajadores.</p>
    <button class="rv-btn-primary" onclick="location.hash='/'">Volver a la calculadora</button>
  </div>
</div>`;

  injectRegisterStyles();

  const submitBtn = shell.querySelector('#rvSubmit');
  const errorEl = shell.querySelector('#rvError');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = '';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  submitBtn.addEventListener('click', async () => {
    errorEl.style.display = 'none';
    const name = shell.querySelector('#rvName').value.trim();
    const ruc = shell.querySelector('#rvRuc').value.trim();
    const adminName = shell.querySelector('#rvAdminName').value.trim();
    const adminDni = shell.querySelector('#rvAdminDni').value.trim();
    const contactEmail = shell.querySelector('#rvEmail').value.trim();

    if (!name) return showError('Ingresa el nombre de la empresa.');
    if (!/^\d{11}$/.test(ruc)) return showError('El RUC debe tener 11 dígitos.');
    if (!adminName) return showError('Ingresa el nombre del administrador.');
    if (!/^\d{8}$/.test(adminDni)) return showError('El DNI debe tener 8 dígitos.');
    if (!contactEmail.includes('@')) return showError('Ingresa un correo electrónico válido.');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    try {
      await registerCompany({ companyName: name, ruc, contactEmail, adminName, adminDni });
      shell.querySelector('#rvForm').style.display = 'none';
      shell.querySelector('#rvSuccess').style.display = '';
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered')) showError('Este correo ya está registrado. ¿Quieres iniciar sesión?');
      else showError(msg || 'Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar solicitud';
    }
  });
}

function injectRegisterStyles() {
  if (document.getElementById('rvStyles')) return;
  const style = document.createElement('style');
  style.id = 'rvStyles';
  style.textContent = `
    .rv-wrap { min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 24px;background:var(--bg); }
    .rv-card { background:#fff;border-radius:20px;padding:32px;width:100%;max-width:460px;box-shadow:0 8px 40px rgba(0,0,0,0.1); }
    .rv-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:24px; }
    .rv-back { display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--slate);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:0; }
    .rv-back:hover { color:var(--navy); }
    .rv-logo { display:flex;align-items:center; }
    .rv-logo-img { height:32px;width:auto; }
    .rv-title { font-size:22px;font-weight:800;color:var(--navy);margin-bottom:6px; }
    .rv-sub { font-size:13px;color:var(--slate);margin-bottom:24px;line-height:1.6; }
    .rv-section-label { font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--slate);margin-bottom:12px; }
    .rv-field { margin-bottom:14px; }
    .rv-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:5px; }
    .rv-input { width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:9px;font-size:14px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s;box-sizing:border-box; }
    .rv-input:focus { outline:none;border-color:var(--blue); }
    .rv-info-box { background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:14px;line-height:1.5; }
    .rv-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px; }
    .rv-btn-primary { width:100%;padding:14px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-top:4px; }
    .rv-btn-primary:hover { background:#1d4ed8; }
    .rv-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
    .rv-footer-note { font-size:11px;color:var(--slate);text-align:center;margin-top:12px;line-height:1.5; }
    .rv-success { text-align:center;padding:48px 32px; }
    .rv-success-icon { margin-bottom:16px; }
    .rv-success-title { font-size:22px;font-weight:800;color:var(--navy);margin-bottom:10px; }
    .rv-success-body { font-size:14px;color:var(--slate);line-height:1.7;margin-bottom:28px; }
  `;
  document.head.appendChild(style);
}
