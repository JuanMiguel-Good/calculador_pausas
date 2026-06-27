const LOGO_URL = 'https://lh3.googleusercontent.com/d/1lPIBXS7f08d3bYuHqVMPX2P37bVJ7yw6';

const ICONS = {
  briefcase: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="2"/></svg>`,
  users:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  chart:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  calendar:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/></svg>`,
  history:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><polyline points="12 7 12 12 15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/></svg>`,
  clock:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><polyline points="12 7 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  building:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 21h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 21V7l8-4 8 4v14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 21v-4h6v4" stroke="currentColor" stroke-width="2"/></svg>`,
  logout:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export { ICONS };

// mountNav(wrapEl, { items, user, onLogout })
// items: [{ key, icon (svg string), label, onClick }]
// user:  { name, roleLabel }
// Returns: { setActive(key) }
export function mountNav(wrapEl, { items, user, onLogout }) {
  injectNavStyles();

  const initCollapsed = localStorage.getItem('nvs_collapsed') === 'true';

  wrapEl.classList.add('nvs-layout');

  // ── Mobile topbar ──────────────────────────────────────────────
  const top = document.createElement('div');
  top.className = 'nvs-top';
  top.innerHTML = `
    <button class="nvs-hamburger" title="Menú">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>
    <img class="nvs-top-logo" src="${LOGO_URL}" alt="Good Solutions" />
    <span class="nvs-top-user">${user.name || ''}</span>
  `;

  // ── Sidebar ────────────────────────────────────────────────────
  const side = document.createElement('aside');
  side.className = 'nvs-side' + (initCollapsed ? ' collapsed' : '');
  side.innerHTML = `
    <div class="nvs-head">
      <img class="nvs-logo" src="${LOGO_URL}" alt="Good Solutions" />
      <button class="nvs-collapse-btn" title="Colapsar menú">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="nvs-user-block">
      <div class="nvs-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
      <div class="nvs-user-info">
        <div class="nvs-user-name">${user.name || ''}</div>
        <div class="nvs-user-role">${user.roleLabel || ''}</div>
      </div>
    </div>
    <nav class="nvs-nav-items">
      ${items.map((item, i) => `
        <button class="nvs-item${i === 0 ? ' active' : ''}" data-key="${item.key}" title="${item.label}">
          <span class="nvs-item-icon">${item.icon}</span>
          <span class="nvs-item-label">${item.label}</span>
        </button>`).join('')}
    </nav>
    <div class="nvs-nav-footer">
      <button class="nvs-item nvs-logout-btn" title="Salir">
        <span class="nvs-item-icon">${ICONS.logout}</span>
        <span class="nvs-item-label">Salir</span>
      </button>
    </div>
  `;

  // ── Backdrop (mobile) ──────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'nvs-backdrop';

  // Insert: top → side → backdrop → [original content]
  wrapEl.prepend(backdrop);
  wrapEl.prepend(side);
  wrapEl.prepend(top);

  // Add nvs-main to all original content children
  Array.from(wrapEl.children).forEach(el => {
    if (!el.classList.contains('nvs-top') &&
        !el.classList.contains('nvs-side') &&
        !el.classList.contains('nvs-backdrop')) {
      el.classList.add('nvs-main');
    }
  });

  // ── Events ────────────────────────────────────────────────────
  top.querySelector('.nvs-hamburger').addEventListener('click', () => {
    side.classList.add('open');
    backdrop.classList.add('visible');
  });

  backdrop.addEventListener('click', () => {
    side.classList.remove('open');
    backdrop.classList.remove('visible');
  });

  side.querySelector('.nvs-collapse-btn').addEventListener('click', () => {
    const now = side.classList.toggle('collapsed');
    localStorage.setItem('nvs_collapsed', String(now));
  });

  side.querySelector('.nvs-nav-items').addEventListener('click', e => {
    const btn = e.target.closest('[data-key]');
    if (!btn) return;
    setActive(btn.dataset.key);
    items.find(i => i.key === btn.dataset.key)?.onClick();
    side.classList.remove('open');
    backdrop.classList.remove('visible');
  });

  side.querySelector('.nvs-logout-btn').addEventListener('click', async () => {
    side.classList.remove('open');
    backdrop.classList.remove('visible');
    await onLogout();
  });

  function setActive(key) {
    side.querySelectorAll('.nvs-item[data-key]').forEach(b => {
      b.classList.toggle('active', b.dataset.key === key);
    });
  }

  return { setActive };
}

function injectNavStyles() {
  if (document.getElementById('nvsStyles')) return;
  const s = document.createElement('style');
  s.id = 'nvsStyles';
  s.textContent = `
/* ── Layout ── */
.nvs-layout { display: flex; min-height: 100vh; }
.nvs-main { flex: 1; min-width: 0; }

/* ── Mobile topbar ── */
.nvs-top {
  display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px;
  background: var(--navy); z-index: 100; align-items: center; gap: 12px;
  padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.nvs-hamburger {
  background: none; border: none; color: #fff; cursor: pointer;
  padding: 8px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; transition: background .15s; flex-shrink: 0;
}
.nvs-hamburger:hover { background: rgba(255,255,255,0.1); }
.nvs-top-logo { height: 26px; mix-blend-mode: screen; flex-shrink: 0; }
.nvs-top-user {
  flex: 1; text-align: right; font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Backdrop ── */
.nvs-backdrop {
  display: none; position: fixed; inset: 0;
  background: rgba(10,20,40,0.6); z-index: 150;
}
.nvs-backdrop.visible { display: block; }

/* ── Sidebar ── */
.nvs-side {
  background: var(--navy); width: 220px; flex-shrink: 0;
  display: flex; flex-direction: column; position: sticky; top: 0;
  height: 100vh; transition: width .25s ease; overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.nvs-side.collapsed { width: 64px; }

/* Head */
.nvs-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px; height: 64px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.nvs-side.collapsed .nvs-head { justify-content: center; padding: 0; }
.nvs-logo { height: 30px; mix-blend-mode: screen; }
.nvs-side.collapsed .nvs-logo { display: none; }

.nvs-collapse-btn {
  background: none; border: none; color: rgba(255,255,255,0.75); cursor: pointer;
  width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center; transition: all .15s; flex-shrink: 0;
}
.nvs-collapse-btn:hover { color: #fff; background: rgba(255,255,255,0.15); }
.nvs-side.collapsed .nvs-collapse-btn svg { transform: rotate(180deg); }

/* User block */
.nvs-user-block {
  display: flex; align-items: center; gap: 10px;
  padding: 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.nvs-side.collapsed .nvs-user-block { justify-content: center; padding: 14px 0; }
.nvs-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.15); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800;
}
.nvs-user-info { min-width: 0; overflow: hidden; }
.nvs-user-name { font-size: 12px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nvs-user-role { font-size: 11px; color: rgba(255,255,255,0.5); white-space: nowrap; }
.nvs-side.collapsed .nvs-user-info { display: none; }

/* Nav items */
.nvs-nav-items { flex: 1; padding: 8px; overflow-y: auto; }
.nvs-nav-footer {
  padding: 8px; flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.nvs-item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; border: none; background: transparent; cursor: pointer;
  border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.65); text-align: left; transition: background .15s, color .15s;
  white-space: nowrap;
}
.nvs-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nvs-item.active { background: rgba(255,255,255,0.13); color: #fff; }
.nvs-item-icon {
  width: 20px; height: 20px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.nvs-side.collapsed .nvs-item { justify-content: center; padding: 10px 0; }
.nvs-side.collapsed .nvs-item-label { display: none; }
.nvs-logout-btn { color: rgba(255,255,255,0.45); }
.nvs-logout-btn:hover { color: #fc8181; background: rgba(220,38,38,0.12); }

/* ── Mobile overrides ── */
@media (max-width: 767px) {
  .nvs-top { display: flex; }
  .nvs-layout { display: block; }
  .nvs-main { padding-top: 56px !important; }
  .nvs-side {
    position: fixed; top: 0; left: 0; bottom: 0; height: 100vh; z-index: 200;
    width: 280px !important; transform: translateX(-100%);
    transition: transform .25s ease; border-right: none;
  }
  .nvs-side.open { transform: translateX(0); }
  .nvs-collapse-btn { display: none !important; }
  .nvs-side .nvs-head { justify-content: flex-start !important; padding: 0 14px !important; }
  .nvs-side .nvs-logo { display: block !important; }
  .nvs-side .nvs-user-block { justify-content: flex-start !important; padding: 14px !important; }
  .nvs-side .nvs-user-info { display: block !important; }
  .nvs-side .nvs-item { justify-content: flex-start !important; padding: 10px 8px !important; min-width: 0 !important; }
  .nvs-side .nvs-item-label { display: block !important; }
}
  `;
  document.head.appendChild(s);
}
