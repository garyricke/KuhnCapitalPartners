/* ─────────────────────────────────────────────────────────────────
   KCP Contact Modal  —  contact-modal.js
   Injects CSS + modal HTML, intercepts all calendar.google.com
   clicks, and submits to Netlify Forms via fetch.
───────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── CSS ──────────────────────────────────────────────────────── */
  var CSS = `
#kcp-overlay{position:fixed;inset:0;background:rgba(1,12,28,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:9900;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .3s ease}
#kcp-overlay.kcp-open{opacity:1;pointer-events:all}
#kcp-modal{background:#fff;border-radius:20px;overflow:hidden;max-width:820px;width:100%;max-height:92vh;overflow-y:auto;display:grid;grid-template-columns:260px 1fr;box-shadow:0 40px 100px rgba(0,0,0,.55);transform:translateY(28px) scale(.95);transition:transform .38s cubic-bezier(.34,1.56,.64,1)}
#kcp-overlay.kcp-open #kcp-modal{transform:translateY(0) scale(1)}

/* ── Left panel ── */
.kcp-left{background:linear-gradient(160deg,#022C58 0%,#011525 100%);padding:44px 28px;display:flex;flex-direction:column;position:relative;overflow:hidden}
.kcp-left::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;background:radial-gradient(circle,rgba(255,185,33,.12),transparent 70%);pointer-events:none}
.kcp-left-logo{font-family:'Rubik',system-ui,sans-serif;font-weight:900;font-size:13px;color:#fff;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.kcp-left-tagline{font-size:11px;color:rgba(255,185,33,.7);letter-spacing:.08em;text-transform:uppercase;margin-bottom:36px}
.kcp-left h3{font-family:'Rubik',system-ui,sans-serif;font-weight:900;font-size:22px;color:#fff;line-height:1.2;margin-bottom:10px}
.kcp-left-sub{font-size:14px;color:rgba(255,255,255,.58);line-height:1.6;margin-bottom:36px}
.kcp-trust{display:flex;flex-direction:column;gap:14px;margin-bottom:36px;flex:1}
.kcp-trust-item{display:flex;align-items:flex-start;gap:10px}
.kcp-trust-icon{width:30px;height:30px;background:rgba(255,185,33,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.kcp-trust-icon svg{width:14px;height:14px;stroke:#FFB921;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.kcp-trust-text strong{display:block;font-size:13px;color:#fff;font-family:'Rubik',system-ui,sans-serif;font-weight:700;margin-bottom:1px}
.kcp-trust-text span{font-size:12px;color:rgba(255,255,255,.45);line-height:1.4}
.kcp-left-phone{padding-top:20px;border-top:1px solid rgba(255,255,255,.1)}
.kcp-left-phone p{font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
.kcp-left-phone a{font-family:'Rubik',system-ui,sans-serif;font-weight:700;font-size:16px;color:#FFB921;text-decoration:none}
.kcp-left-phone a:hover{color:#ffd055}

/* ── Right panel ── */
.kcp-right{padding:36px 40px;position:relative;background:#FFFFFE}
#kcp-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(2,44,88,.07);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6B7280;font-size:16px;transition:all .2s;z-index:1}
#kcp-close:hover{background:rgba(2,44,88,.13);color:#022C58}
.kcp-form-head{margin-bottom:24px}
.kcp-form-head h2{font-family:'Rubik',system-ui,sans-serif;font-weight:900;font-size:24px;color:#022C58;margin-bottom:6px}
.kcp-form-head p{font-size:14px;color:#6B7280;line-height:1.5}

/* ── Fields ── */
.kcp-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.kcp-field{margin-bottom:16px}
.kcp-field label{display:block;font-family:'Rubik',system-ui,sans-serif;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#022C58;margin-bottom:6px}
.kcp-field input,.kcp-field textarea{width:100%;background:#F4F5F7;border:2px solid transparent;border-radius:10px;padding:11px 14px;font-size:14px;color:#151515;font-family:inherit;outline:none;transition:all .2s;-webkit-appearance:none}
.kcp-field input:focus,.kcp-field textarea:focus{border-color:#022C58;background:#fff;box-shadow:0 0 0 3px rgba(2,44,88,.08)}
.kcp-field input::placeholder,.kcp-field textarea::placeholder{color:#9CA3AF}
.kcp-field input.kcp-err,.kcp-field textarea.kcp-err{border-color:#DC2626;background:#FFF5F5}
.kcp-field textarea{resize:vertical;min-height:76px;line-height:1.5}

/* ── Interest pills ── */
.kcp-pills-label{font-family:'Rubik',system-ui,sans-serif;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#022C58;margin-bottom:10px;display:block}
.kcp-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.kcp-pill{cursor:pointer;display:flex}
.kcp-pill input{position:absolute;opacity:0;width:0;height:0}
.kcp-pill-label{display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:24px;border:2px solid #E5E7EB;background:#fff;font-size:13px;font-family:'Rubik',system-ui,sans-serif;font-weight:700;color:#374151;transition:all .18s;white-space:nowrap}
.kcp-pill-label svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.kcp-pill:hover .kcp-pill-label{border-color:#022C58;color:#022C58;background:#F0F7FF}
.kcp-pill input:checked~.kcp-pill-label{background:#022C58;border-color:#022C58;color:#FFB921}
.kcp-pill input:checked~.kcp-pill-label svg{stroke:#FFB921}
.kcp-pills.kcp-err-pills .kcp-pill-label{border-color:#FCA5A5}

/* ── Submit ── */
#kcp-submit{width:100%;padding:14px;background:#022C58;color:#FFB921;font-family:'Rubik',system-ui,sans-serif;font-weight:900;font-size:14px;letter-spacing:.08em;text-transform:uppercase;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-top:4px}
#kcp-submit:hover{background:#0a3d7a;transform:translateY(-1px);box-shadow:0 6px 20px rgba(2,44,88,.25)}
#kcp-submit:disabled{opacity:.55;cursor:default;transform:none;box-shadow:none}
#kcp-submit svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.kcp-disclaimer{font-size:11px;color:#9CA3AF;text-align:center;margin-top:12px;line-height:1.5}

/* ── Inline error ── */
#kcp-form-err{display:none;background:#FEF2F2;border:1px solid #FCA5A5;color:#DC2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px}

/* ── Success state ── */
#kcp-success{display:none;padding:20px 0;text-align:center}
.kcp-success-ring{width:72px;height:72px;border-radius:50%;background:rgba(22,163,74,.1);border:2px solid rgba(22,163,74,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.kcp-success-ring svg{width:32px;height:32px;stroke:#16A34A;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
#kcp-success h3{font-family:'Rubik',system-ui,sans-serif;font-weight:900;font-size:22px;color:#022C58;margin-bottom:10px}
#kcp-success p{font-size:14px;color:#6B7280;line-height:1.6;margin-bottom:8px}
#kcp-success .kcp-success-phone{margin-top:20px;padding-top:18px;border-top:1px solid #E5E7EB;font-size:13px;color:#9CA3AF}
#kcp-success .kcp-success-phone a{color:#022C58;font-weight:700;text-decoration:none}
#kcp-success .kcp-success-phone a:hover{color:#FFB921}
.kcp-close-btn{margin-top:24px;padding:12px 32px;background:#F4F5F7;color:#022C58;font-family:'Rubik',system-ui,sans-serif;font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;border:none;border-radius:8px;cursor:pointer;transition:background .2s}
.kcp-close-btn:hover{background:#E5E7EB}

/* ── Responsive ── */
@media(max-width:680px){
  #kcp-overlay{padding:0;align-items:flex-end}
  #kcp-modal{grid-template-columns:1fr;border-radius:20px 20px 0 0;max-height:92vh}
  .kcp-left{display:none}
  .kcp-right{padding:28px 24px 32px}
}
@media(max-width:400px){.kcp-row{grid-template-columns:1fr}}
`;

  /* ── HTML ─────────────────────────────────────────────────────── */
  var HTML = `
<div id="kcp-overlay" role="dialog" aria-modal="true" aria-labelledby="kcp-modal-title">
  <div id="kcp-modal">

    <!-- LEFT PANEL -->
    <div class="kcp-left">
      <div class="kcp-left-logo">Kuhn Capital Partners</div>
      <div class="kcp-left-tagline">Independent · Fiduciary · Since 2015</div>
      <h3 id="kcp-modal-title">No pressure.<br>Just a conversation.</h3>
      <p class="kcp-left-sub">Tell us what you're thinking about. We'll respond within one business day — no sales pitch, no obligation.</p>
      <div class="kcp-trust">
        <div class="kcp-trust-item">
          <div class="kcp-trust-icon">
            <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div class="kcp-trust-text">
            <strong>Zero obligation</strong>
            <span>An intro call costs nothing. We'll tell you honestly if we're a fit.</span>
          </div>
        </div>
        <div class="kcp-trust-item">
          <div class="kcp-trust-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kcp-trust-text">
            <strong>30-minute intro call</strong>
            <span>Direct access to Robert Kuhn — not a junior associate.</span>
          </div>
        </div>
        <div class="kcp-trust-item">
          <div class="kcp-trust-icon">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="kcp-trust-text">
            <strong>Fiduciary standard</strong>
            <span>Legally obligated to act in your interest — not ours.</span>
          </div>
        </div>
        <div class="kcp-trust-item">
          <div class="kcp-trust-icon">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="kcp-trust-text">
            <strong>300+ episodes published</strong>
            <span>You already know how Robert thinks. Now let's talk.</span>
          </div>
        </div>
      </div>
      <div class="kcp-left-phone">
        <p>Prefer to call?</p>
        <a href="tel:4698955699">(469) 895-5699</a>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="kcp-right">
      <button id="kcp-close" aria-label="Close dialog">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <!-- FORM -->
      <div id="kcp-form-wrap">
        <div class="kcp-form-head">
          <h2>Let's Talk</h2>
          <p>A few quick details and we'll reach out within one business day.</p>
        </div>

        <form id="kcp-form" name="kcp-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
          <input type="hidden" name="form-name" value="kcp-contact">
          <div style="display:none" aria-hidden="true"><input name="bot-field" tabindex="-1" autocomplete="off"></div>

          <div class="kcp-row">
            <div class="kcp-field">
              <label for="kcp-fname">First name <span style="color:#DC2626">*</span></label>
              <input type="text" id="kcp-fname" name="first-name" placeholder="First" autocomplete="given-name">
            </div>
            <div class="kcp-field">
              <label for="kcp-lname">Last name <span style="color:#DC2626">*</span></label>
              <input type="text" id="kcp-lname" name="last-name" placeholder="Last" autocomplete="family-name">
            </div>
          </div>

          <div class="kcp-field">
            <label for="kcp-email">Email address <span style="color:#DC2626">*</span></label>
            <input type="email" id="kcp-email" name="email" placeholder="you@example.com" autocomplete="email">
          </div>

          <div class="kcp-field">
            <label for="kcp-phone">Phone <span style="color:#9CA3AF;font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <input type="tel" id="kcp-phone" name="phone" placeholder="(555) 000-0000" autocomplete="tel">
          </div>

          <div class="kcp-field">
            <span class="kcp-pills-label">What would you like to discuss? <span style="color:#DC2626">*</span></span>
            <div class="kcp-pills" id="kcp-pills">
              <label class="kcp-pill">
                <input type="radio" name="interest" value="Portfolio Stress Test">
                <span class="kcp-pill-label">
                  <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Portfolio Stress Test
                </span>
              </label>
              <label class="kcp-pill">
                <input type="radio" name="interest" value="Structured Notes">
                <span class="kcp-pill-label">
                  <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Structured Notes
                </span>
              </label>
              <label class="kcp-pill">
                <input type="radio" name="interest" value="Energy Tax Strategy">
                <span class="kcp-pill-label">
                  <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Energy Tax Strategy
                </span>
              </label>
              <label class="kcp-pill">
                <input type="radio" name="interest" value="Wealth Management">
                <span class="kcp-pill-label">
                  <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Wealth Management
                </span>
              </label>
              <label class="kcp-pill">
                <input type="radio" name="interest" value="General Question">
                <span class="kcp-pill-label">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Just a Question
                </span>
              </label>
            </div>
          </div>

          <div class="kcp-field">
            <label for="kcp-msg">Anything else? <span style="color:#9CA3AF;font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <textarea id="kcp-msg" name="message" placeholder="Portfolio size, current situation, specific goals — whatever's helpful…"></textarea>
          </div>

          <div id="kcp-form-err">Something went wrong — please try again or call us at <a href="tel:4698955699" style="color:#DC2626;font-weight:700">(469) 895-5699</a>.</div>

          <button type="submit" id="kcp-submit">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Send Message
          </button>

          <p class="kcp-disclaimer">We never sell or share your information. You'll hear from us within one business day.</p>
        </form>
      </div>

      <!-- SUCCESS STATE -->
      <div id="kcp-success">
        <div class="kcp-success-ring">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>Message Received!</h3>
        <p>Thank you. A member of Robert's team will reach out within one business day to set up a time that works for you.</p>
        <p style="font-size:13px;color:#9CA3AF;margin-top:4px">Keep an eye on your inbox — check spam if you don't hear from us.</p>
        <div class="kcp-success-phone">
          Need to talk sooner? Call us directly:<br>
          <a href="tel:4698955699">(469) 895-5699</a>
        </div>
        <button class="kcp-close-btn" onclick="window.kcpCloseModal()">Close</button>
      </div>

    </div><!-- /.kcp-right -->
  </div><!-- /#kcp-modal -->
</div><!-- /#kcp-overlay -->
`;

  /* ── Init ─────────────────────────────────────────────────────── */
  function init() {
    // Inject styles
    var style = document.createElement('style');
    style.id = 'kcp-modal-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    // Inject HTML
    var tmp = document.createElement('div');
    tmp.innerHTML = HTML.trim();
    document.body.appendChild(tmp.firstElementChild);

    // Close button
    document.getElementById('kcp-close').addEventListener('click', closeModal);

    // Overlay click to close
    document.getElementById('kcp-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit
    document.getElementById('kcp-form').addEventListener('submit', handleSubmit);

    // Auto-intercept ALL calendar.google.com links sitewide
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="calendar.google.com"]');
      if (link) {
        e.preventDefault();
        openModal(link);
      }
    }, true);
  }

  /* ── Open / Close ─────────────────────────────────────────────── */
  function openModal(triggerEl) {
    // Pre-select interest pill based on page/trigger context if possible
    var hint = '';
    if (triggerEl) {
      var text = (triggerEl.textContent || '').toLowerCase();
      if (/stress.test|portfolio/i.test(text)) hint = 'Portfolio Stress Test';
      else if (/structured.note|note/i.test(text)) hint = 'Structured Notes';
      else if (/energy|tax|idc|drill/i.test(text)) hint = 'Energy Tax Strategy';
      else if (/wealth|second.opinion/i.test(text)) hint = 'Wealth Management';
    }
    if (!hint) {
      // Guess from page URL
      var p = window.location.pathname;
      if (/structured-notes/.test(p)) hint = 'Structured Notes';
      else if (/energy/.test(p)) hint = 'Energy Tax Strategy';
      else if (/wealth/.test(p)) hint = 'Wealth Management';
      else if (/about|services/.test(p)) hint = 'Portfolio Stress Test';
    }
    if (hint) {
      var pills = document.querySelectorAll('#kcp-form input[name="interest"]');
      pills.forEach(function (r) { r.checked = (r.value === hint); });
    }

    document.getElementById('kcp-overlay').classList.add('kcp-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var f = document.getElementById('kcp-fname');
      if (f) f.focus();
    }, 350);
  }

  function closeModal() {
    document.getElementById('kcp-overlay').classList.remove('kcp-open');
    document.body.style.overflow = '';
  }

  /* ── Validation ───────────────────────────────────────────────── */
  function validate(form) {
    var ok = true;
    form.querySelectorAll('input.kcp-err, textarea.kcp-err').forEach(function (el) {
      el.classList.remove('kcp-err');
    });
    var pills = document.getElementById('kcp-pills');
    if (pills) pills.classList.remove('kcp-err-pills');

    var fname = form.querySelector('#kcp-fname');
    var lname = form.querySelector('#kcp-lname');
    var email = form.querySelector('#kcp-email');
    var interest = form.querySelector('input[name="interest"]:checked');

    if (!fname.value.trim()) { fname.classList.add('kcp-err'); fname.focus(); ok = false; }
    if (!lname.value.trim()) { lname.classList.add('kcp-err'); if (ok) lname.focus(); ok = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('kcp-err');
      if (ok) email.focus();
      ok = false;
    }
    if (!interest) {
      if (pills) pills.classList.add('kcp-err-pills');
      ok = false;
    }
    return ok;
  }

  /* ── Submit ───────────────────────────────────────────────────── */
  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;

    if (!validate(form)) return;

    var btn = document.getElementById('kcp-submit');
    var errEl = document.getElementById('kcp-form-err');
    btn.disabled = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/></svg> Sending…';
    errEl.style.display = 'none';

    var formData = new FormData(form);
    var encoded = new URLSearchParams(formData).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encoded
    })
      .then(function (res) {
        if (res.ok) {
          document.getElementById('kcp-form-wrap').style.display = 'none';
          document.getElementById('kcp-success').style.display = 'block';
        } else {
          throw new Error('HTTP ' + res.status);
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
        errEl.style.display = 'block';
      });
  }

  /* ── Expose globals ───────────────────────────────────────────── */
  window.openContactModal = openModal;
  window.kcpCloseModal = closeModal;

  /* ── Boot ─────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
