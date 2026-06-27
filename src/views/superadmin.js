import { supabase } from '../lib/supabase.js';
import { signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { mountNav, ICONS } from '../components/nav.js';

export async function renderSuperadmin(shell, profile) {
  shell.innerHTML = `
<div class="sa-wrap">
  <div class="sa-body">
    <!-- Stats -->
    <div class="sa-stats" id="saStats">
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatTotal">—</div><div class="sa-stat-lbl">Empresas totales</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-green" id="saStatActive">—</div><div class="sa-stat-lbl">Activas</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-yellow" id="saStatPending">—</div><div class="sa-stat-lbl">Pendientes</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatWorkers">—</div><div class="sa-stat-lbl">Trabajadores</div></div>
    </div>

    <div id="saTabPending" class="sa-tab-panel active">
      <div id="saPendingList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
    <div id="saTabAll" class="sa-tab-panel">
      <div id="saAllList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
  </div>
</div>`;

  injectSuperadminStyles();

  function switchTab(key) {
    shell.querySelectorAll('.sa-tab-panel').forEach(p => p.classList.remove('active'));
    shell.querySelector(`#saTab${key.charAt(0).toUpperCase() + key.slice(1)}`).classList.add('active');
    nav.setActive(key);
  }

  const nav = mountNav(shell.querySelector('.sa-wrap'), {
    user: { name: profile.full_name || 'Superadmin', roleLabel: 'Superadmin' },
    items: [
      { key: 'pending', icon: ICONS.clock,    label: 'Pendientes',       onClick: () => switchTab('pending') },
      { key: 'all',     icon: ICONS.building, label: 'Todas las empresas', onClick: () => switchTab('all') },
    ],
    onLogout: async () => { await signOut(); navigate('/login'); },
  });

  await loadStats(shell);
  await loadCompanies(shell);
}

async function loadStats(shell) {
  const { data: companies } = await supabase.from('companies').select('id, status');
  const { count: workerCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'worker');

  if (companies) {
    shell.querySelector('#saStatTotal').textContent = companies.length;
    shell.querySelector('#saStatActive').textContent = companies.filter(c => c.status === 'active').length;
    shell.querySelector('#saStatPending').textContent = companies.filter(c => c.status === 'pending').length;
    shell.querySelector('#saStatWorkers').textContent = workerCount ?? '—';
  }
}

async function loadCompanies(shell) {
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, ruc, contact_email, status, created_at')
    .order('created_at', { ascending: false });

  if (!companies) return;

  const pending = companies.filter(c => c.status === 'pending');
  const all = companies;

  renderCompanyList(shell.querySelector('#saPendingList'), pending, shell);
  renderCompanyList(shell.querySelector('#saAllList'), all, shell);
}

function renderCompanyList(container, companies, shell) {
  if (companies.length === 0) {
    container.innerHTML = '<div class="sa-empty">No hay empresas en esta categoría.</div>';
    return;
  }

  container.innerHTML = companies.map(c => `
    <div class="sa-company-row" data-id="${c.id}">
      <div class="sa-company-info">
        <div class="sa-company-name">${c.name}</div>
        <div class="sa-company-meta">RUC ${c.ruc} &middot; ${c.contact_email} &middot; ${new Date(c.created_at).toLocaleDateString('es-PE')}</div>
      </div>
      <div class="sa-company-actions">
        <span class="sa-status sa-status-${c.status}">${statusLabel(c.status)}</span>
        ${c.status === 'pending' ? `<button class="sa-action-btn sa-approve" data-id="${c.id}">Aprobar</button>` : ''}
        ${c.status === 'active' ? `<button class="sa-action-btn sa-suspend" data-id="${c.id}">Suspender</button>` : ''}
        ${c.status === 'suspended' ? `<button class="sa-action-btn sa-approve" data-id="${c.id}">Reactivar</button>` : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.sa-approve').forEach(btn => {
    btn.addEventListener('click', () => updateCompanyStatus(btn.dataset.id, 'active', shell));
  });
  container.querySelectorAll('.sa-suspend').forEach(btn => {
    btn.addEventListener('click', () => updateCompanyStatus(btn.dataset.id, 'suspended', shell));
  });
}

async function updateCompanyStatus(id, status, shell) {
  await supabase.from('companies').update({ status }).eq('id', id);
  await loadStats(shell);
  await loadCompanies(shell);
}

function statusLabel(s) {
  return { pending: 'Pendiente', active: 'Activa', suspended: 'Suspendida' }[s] || s;
}

function injectSuperadminStyles() {
  if (document.getElementById('saStyles')) return;
  const style = document.createElement('style');
  style.id = 'saStyles';
  style.textContent = `
    .sa-wrap { min-height:100vh;background:var(--bg); }
    .sa-body { max-width:960px;margin:0 auto;padding:28px 24px; }
    .sa-stats { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px; }
    .sa-stat-card { background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .sa-stat-val { font-size:32px;font-weight:900;color:var(--navy); }
    .sa-stat-val.sa-green { color:var(--green); }
    .sa-stat-val.sa-yellow { color:#d97706; }
    .sa-stat-lbl { font-size:12px;color:var(--slate);margin-top:4px;font-weight:600; }
    .sa-tab-panel { display:none; }
    .sa-tab-panel.active { display:block; }
    .sa-company-list { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .sa-company-row { display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:12px; }
    .sa-company-row:last-child { border-bottom:none; }
    .sa-company-name { font-size:14px;font-weight:700;color:var(--navy);margin-bottom:3px; }
    .sa-company-meta { font-size:12px;color:var(--slate); }
    .sa-company-actions { display:flex;align-items:center;gap:10px;flex-shrink:0; }
    .sa-status { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px; }
    .sa-status-pending { background:#fefce8;color:#92400e; }
    .sa-status-active { background:var(--green-light);color:var(--green); }
    .sa-status-suspended { background:#fef2f2;color:#dc2626; }
    .sa-action-btn { padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;transition:opacity .15s; }
    .sa-action-btn:hover { opacity:.8; }
    .sa-approve { background:var(--green);color:#fff; }
    .sa-suspend { background:#fef2f2;color:#dc2626;border:1px solid #fecaca; }
    .sa-loading,.sa-empty { padding:32px;text-align:center;font-size:14px;color:var(--slate); }
    @media(max-width:600px){ .sa-company-row{flex-direction:column;align-items:flex-start;} }
  `;
  document.head.appendChild(style);
}
