// ═══════════════════════════════════════════
//  Playx AdSense Manager — ads.js
//  Smart ad placement · GDPR consent · 
//  Non-intrusive gaming ads
// ═══════════════════════════════════════════

const PlayxAds = (() => {

  // ── CONFIG — Replace with your AdSense ID ──
  // 1. Sign up at: https://adsense.google.com
  // 2. Add your site and wait for approval (~1-3 days)
  // 3. Replace YOUR_PUBLISHER_ID below with ca-pub-XXXXXXXXXXXXXXXX
  const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

  // Your ad slot IDs (get these from AdSense dashboard)
  const SLOTS = {
    banner_top:     'XXXXXXXXXX',  // 728x90 leaderboard
    banner_bottom:  'XXXXXXXXXX',  // 728x90 leaderboard
    sidebar:        'XXXXXXXXXX',  // 300x250 rectangle
    sidebar_large:  'XXXXXXXXXX',  // 300x600 half page
    in_article:     'XXXXXXXXXX',  // in-article native
    interstitial:   'XXXXXXXXXX',  // between games (mobile)
  };

  let adsEnabled = false;
  let consentGiven = localStorage.getItem('px_ad_consent');

  // ── Load AdSense script ─────────────────
  function loadAdSense() {
    if (document.querySelector('script[data-ad-client]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
    script.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(script);
    adsEnabled = true;
  }

  // ── Create ad unit ──────────────────────
  function createAd(slot, format = 'auto', style = '') {
    if (!adsEnabled) return createPlaceholder(format);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;overflow:hidden;' + style;
    wrap.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${PUBLISHER_ID}"
           data-ad-slot="${slot}"
           data-ad-format="${format}"
           data-full-width-responsive="true"></ins>
    `;
    // Push after DOM insertion
    setTimeout(() => {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    }, 100);
    return wrap;
  }

  // Placeholder shown before consent / approval
  function createPlaceholder(format) {
    const heights = { banner: '90px', rectangle: '250px', auto: '90px' };
    const div = document.createElement('div');
    div.style.cssText = `
      background:#0f1420;border:1px dashed #1e2a40;border-radius:10px;
      min-height:${heights[format]||'90px'};display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:4px;padding:12px;
    `;
    div.innerHTML = `
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#1e2a40">Advertisement</div>
      <div style="font-size:12px;color:#1e2a40">[ Ad loads after consent ]</div>
    `;
    return div;
  }

  // ── GDPR Consent Banner ─────────────────
  function showConsentBanner() {
    if (consentGiven !== null) {
      if (consentGiven === 'true') loadAdSense();
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      #px-consent {
        position:fixed;bottom:0;left:0;right:0;z-index:99999;
        background:#0f1420;border-top:1px solid #1e2a40;
        padding:16px 24px;display:flex;align-items:center;
        justify-content:space-between;gap:16px;flex-wrap:wrap;
        font-family:'DM Sans',sans-serif;
        box-shadow:0 -8px 32px rgba(0,0,0,0.4);
        transform:translateY(100%);transition:transform .4s cubic-bezier(.4,0,.2,1);
      }
      #px-consent.show{transform:translateY(0)}
      .consent-text{font-size:13px;color:#94a3b8;flex:1;min-width:220px;line-height:1.5}
      .consent-text strong{color:#e2e8f0}
      .consent-text a{color:#3b82f6}
      .consent-btns{display:flex;gap:8px;flex-shrink:0}
      .consent-accept{padding:9px 20px;border-radius:8px;background:#3b82f6;color:#fff;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all .2s}
      .consent-accept:hover{background:#2563eb}
      .consent-decline{padding:9px 16px;border-radius:8px;background:transparent;color:#94a3b8;font-size:13px;cursor:pointer;border:1px solid #1e2a40;font-family:'DM Sans',sans-serif;transition:all .2s}
      .consent-decline:hover{border-color:#94a3b8;color:#e2e8f0}
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'px-consent';
    banner.innerHTML = `
      <div class="consent-text">
        🍪 <strong>Playx uses cookies</strong> to show relevant ads and improve your experience. 
        Ads keep Playx free for everyone. 
        <a href="privacy.html">Privacy Policy</a>
      </div>
      <div class="consent-btns">
        <button class="consent-decline" id="consent-decline">Decline Ads</button>
        <button class="consent-accept" id="consent-accept">Accept & Continue</button>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('show'), 1500);

    document.getElementById('consent-accept').addEventListener('click', () => {
      localStorage.setItem('px_ad_consent', 'true');
      consentGiven = 'true';
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
      loadAdSense();
      renderAllAds();
    });

    document.getElementById('consent-decline').addEventListener('click', () => {
      localStorage.setItem('px_ad_consent', 'false');
      consentGiven = 'false';
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
    });
  }

  // ── Render ads into placeholders ────────
  function renderAllAds() {
    document.querySelectorAll('[data-ad-zone]').forEach(el => {
      const zone = el.dataset.adZone;
      const slot = SLOTS[zone] || SLOTS.banner_top;
      const format = el.dataset.adFormat || 'auto';
      el.innerHTML = '';
      el.appendChild(createAd(slot, format));
    });
  }

  // ── Between-game interstitial ───────────
  let lastInterstitial = 0;
  function showInterstitial(callback) {
    const now = Date.now();
    // Only show max once every 3 minutes
    if (!adsEnabled || (now - lastInterstitial) < 180000) {
      callback?.();
      return;
    }
    lastInterstitial = now;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(8,11,20,0.95);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:16px;font-family:'DM Sans',sans-serif;
    `;
    overlay.innerHTML = `
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#4b5563">Advertisement</div>
      <div style="background:#0f1420;border:1px solid #1e2a40;border-radius:12px;padding:20px;width:320px;min-height:260px;display:flex;align-items:center;justify-content:center">
        <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"
          data-ad-client="${PUBLISHER_ID}" data-ad-slot="${SLOTS.interstitial}"></ins>
      </div>
      <button id="skip-ad" style="padding:10px 24px;border-radius:8px;background:#1e2a40;color:#94a3b8;border:none;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif">
        Skip in <span id="skip-count">5</span>s →
      </button>
    `;
    document.body.appendChild(overlay);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}

    let count = 5;
    const timer = setInterval(() => {
      count--;
      const el = document.getElementById('skip-count');
      if (el) el.textContent = count;
      if (count <= 0) {
        clearInterval(timer);
        const btn = document.getElementById('skip-ad');
        if (btn) btn.textContent = 'Continue →';
        btn?.addEventListener('click', () => { overlay.remove(); callback?.(); });
      }
    }, 1000);

    document.getElementById('skip-ad').addEventListener('click', () => {
      if (count <= 0) { overlay.remove(); callback?.(); }
    });
  }

  // ── Init ────────────────────────────────
  function init() {
    showConsentBanner();
    if (consentGiven === 'true') {
      loadAdSense();
      document.addEventListener('DOMContentLoaded', renderAllAds);
    }
  }

  return { init, createAd, showInterstitial, SLOTS, PUBLISHER_ID };
})();

// Auto-init
PlayxAds.init();
