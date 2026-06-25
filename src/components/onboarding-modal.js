export function createOnboardingModalHTML() {
  return `
<div id="onboardingModal" class="obm-overlay" style="display:none" role="dialog" aria-modal="true">
  <div class="obm-backdrop" onclick="window.closeOnboarding()">
    <div class="obm-card" onclick="event.stopPropagation()">
      <div class="obm-slides">

        <!-- Slide 1 -->
        <div class="obm-slide active" data-slide="0">
          <div class="obm-icon-wrap obm-icon-blue">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </div>
          <div class="obm-badge">Sistema de alertas</div>
          <h2 class="obm-title">Pausas activas en tiempo real</h2>
          <p class="obm-body">
            El sistema registra cada puesto de trabajo con su programa de pausas
            calculado según la normativa peruana RM 546-2026-MINSA, y envía alertas
            automáticas a cada trabajador a la hora exacta que le corresponde.
          </p>
          <div class="obm-demo-row">
            <div class="obm-demo-pill yellow">Cálculo automático por puesto</div>
            <div class="obm-demo-pill blue">Alertas en tiempo real</div>
            <div class="obm-demo-pill green">Registro de cumplimiento</div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="obm-slide" data-slide="1">
          <div class="obm-icon-wrap obm-icon-green">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="obm-badge obm-badge-green">Beneficios</div>
          <h2 class="obm-title">Lo que tu empresa gana</h2>
          <ul class="obm-list">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span><strong>Cumplimiento legal</strong> — respaldo documentado ante SUNAFIL</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span><strong>Menos lesiones</strong> — reducción de enfermedades músculo-esqueléticas</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span><strong>Reportes automáticos</strong> — historial de cumplimiento por trabajador</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span><strong>Sin instalación</strong> — funciona desde el navegador de cada trabajador</span>
            </li>
          </ul>
        </div>

        <!-- Slide 3 -->
        <div class="obm-slide" data-slide="2">
          <div class="obm-icon-wrap obm-icon-navy">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/>
              <path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="obm-badge obm-badge-navy">Primeros pasos</div>
          <h2 class="obm-title">Tres pasos para comenzar</h2>
          <div class="obm-steps">
            <div class="obm-step">
              <div class="obm-step-num">1</div>
              <div>
                <div class="obm-step-title">Registra tu empresa</div>
                <div class="obm-step-sub">Llena el formulario gratuito. Revisamos tu solicitud en menos de 24 horas.</div>
              </div>
            </div>
            <div class="obm-step">
              <div class="obm-step-num">2</div>
              <div>
                <div class="obm-step-title">Configura los puestos</div>
                <div class="obm-step-sub">El administrador usa esta misma calculadora y guarda el resultado para cada puesto.</div>
              </div>
            </div>
            <div class="obm-step">
              <div class="obm-step-num">3</div>
              <div>
                <div class="obm-step-title">Los trabajadores activan alertas</div>
                <div class="obm-step-sub">Cada trabajador entra con su DNI y activa las alertas para el día.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Dots navigation -->
      <div class="obm-dots">
        <button class="obm-dot active" onclick="window.goOnboardingSlide(0)" aria-label="Slide 1"></button>
        <button class="obm-dot" onclick="window.goOnboardingSlide(1)" aria-label="Slide 2"></button>
        <button class="obm-dot" onclick="window.goOnboardingSlide(2)" aria-label="Slide 3"></button>
      </div>

      <!-- Footer CTA -->
      <div class="obm-footer">
        <div id="obmNavRow" class="obm-nav-row">
          <button class="obm-btn-secondary" id="obmBackBtn" onclick="window.goOnboardingSlide(window._obmSlide-1)" style="display:none">Anterior</button>
          <button class="obm-btn-primary" id="obmNextBtn" onclick="window.goOnboardingSlide(window._obmSlide+1)">Siguiente</button>
        </div>
        <div id="obmCtaRow" class="obm-cta-row" style="display:none">
          <button class="obm-btn-primary" onclick="location.hash='/register';window.closeOnboarding()">Registrar mi empresa</button>
          <button class="obm-btn-secondary" onclick="location.hash='/login';window.closeOnboarding()">Ya tengo cuenta</button>
        </div>
        <button class="obm-btn-close" onclick="window.closeOnboarding()">Ahora no</button>
      </div>
    </div>
  </div>
</div>`;
}

export function mountOnboardingModal() {
  if (document.getElementById('obmStyles')) return;
  const style = document.createElement('style');
  style.id = 'obmStyles';
  style.textContent = `
    .obm-overlay { position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center; animation:obmFadeIn .2s ease; }
    @keyframes obmFadeIn{from{opacity:0}to{opacity:1}}
    .obm-backdrop { position:absolute;inset:0;background:rgba(10,20,40,0.7);display:flex;align-items:center;justify-content:center;padding:20px; }
    .obm-card { background:#fff;border-radius:20px;width:100%;max-width:440px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.35);animation:obmSlideUp .3s cubic-bezier(.4,0,.2,1); }
    @keyframes obmSlideUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}
    .obm-slides { position:relative; }
    .obm-slide { display:none;padding:28px 24px 4px; }
    .obm-slide.active { display:block; }
    .obm-icon-wrap { width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px; }
    .obm-icon-blue { background:var(--blue-light);color:var(--blue); }
    .obm-icon-green { background:var(--green-light);color:var(--green); }
    .obm-icon-navy { background:#e8edf3;color:var(--navy); }
    .obm-badge { display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:3px 10px;border-radius:20px;margin-bottom:10px;background:var(--blue-light);color:var(--blue); }
    .obm-badge-green { background:var(--green-light);color:var(--green); }
    .obm-badge-navy { background:#e8edf3;color:var(--navy); }
    .obm-title { font-size:20px;font-weight:800;color:var(--navy);margin-bottom:10px;text-align:center; }
    .obm-body { font-size:13px;color:var(--text-soft);line-height:1.7;text-align:center;margin-bottom:16px; }
    .obm-demo-row { display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:4px; }
    .obm-demo-pill { font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px; }
    .obm-demo-pill.yellow { background:#fefce8;color:#78350f;border:1px solid #fde68a; }
    .obm-demo-pill.blue { background:var(--blue-light);color:var(--blue); }
    .obm-demo-pill.green { background:var(--green-light);color:var(--green); }
    .obm-list { list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:4px; }
    .obm-list li { display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--text-soft);line-height:1.5; }
    .obm-list li svg { flex-shrink:0;margin-top:2px; }
    .obm-list li strong { color:var(--text); }
    .obm-steps { display:flex;flex-direction:column;gap:14px;margin-bottom:4px; }
    .obm-step { display:flex;gap:14px;align-items:flex-start; }
    .obm-step-num { width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0; }
    .obm-step-title { font-size:13px;font-weight:700;color:var(--navy);margin-bottom:2px; }
    .obm-step-sub { font-size:12px;color:var(--slate);line-height:1.5; }
    .obm-dots { display:flex;justify-content:center;gap:6px;padding:12px 0 8px; }
    .obm-dot { width:8px;height:8px;border-radius:50%;background:var(--border);border:none;cursor:pointer;padding:0;transition:all .2s; }
    .obm-dot.active { background:var(--blue);width:22px;border-radius:4px; }
    .obm-footer { padding:12px 20px 20px;border-top:1px solid var(--border); }
    .obm-nav-row { display:flex;gap:8px;margin-bottom:8px; }
    .obm-cta-row { display:flex;flex-direction:column;gap:8px;margin-bottom:8px; }
    .obm-btn-primary { flex:1;padding:13px 16px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s; }
    .obm-btn-primary:hover { background:#1d4ed8; }
    .obm-btn-secondary { flex:1;padding:13px 16px;background:var(--slate-light);color:var(--slate);border:2px solid var(--border);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit; }
    .obm-btn-secondary:hover { background:var(--border); }
    .obm-btn-close { width:100%;padding:8px;background:transparent;color:#94a3b8;border:none;font-size:12px;cursor:pointer;font-family:inherit; }
    .obm-btn-close:hover { color:var(--slate); }
    @media(max-width:480px){ .obm-card{border-radius:16px 16px 0 0;position:fixed;bottom:0;left:0;right:0;max-width:100%;} .obm-backdrop{align-items:flex-end;padding:0;} }
  `;
  document.head.appendChild(style);

  window._obmSlide = 0;
  window.goOnboardingSlide = function(n) {
    const slides = document.querySelectorAll('.obm-slide');
    const dots = document.querySelectorAll('.obm-dot');
    const total = slides.length;
    n = Math.max(0, Math.min(total - 1, n));
    window._obmSlide = n;
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
    const backBtn = document.getElementById('obmBackBtn');
    const nextBtn = document.getElementById('obmNextBtn');
    const navRow = document.getElementById('obmNavRow');
    const ctaRow = document.getElementById('obmCtaRow');
    if (n === total - 1) {
      navRow.style.display = 'none';
      ctaRow.style.display = 'flex';
    } else {
      navRow.style.display = 'flex';
      ctaRow.style.display = 'none';
      if (backBtn) backBtn.style.display = n > 0 ? '' : 'none';
    }
  };

  window.showOnboarding = function() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
      modal.style.display = 'flex';
      window.goOnboardingSlide(0);
    }
  };

  window.closeOnboarding = function() {
    const modal = document.getElementById('onboardingModal');
    if (modal) modal.style.display = 'none';
  };
}
