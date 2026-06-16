// ═══════════════════════════════════════════
//  Playx Auth UI — auth-ui.js
//  Login modal · User menu · Syncs with DB
// ═══════════════════════════════════════════

function PlayxAuthUI() {

  // ── Styles ──────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Auth button in nav */
    .px-auth-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      border: 1px solid #3b82f6; background: rgba(59,130,246,0.1);
      color: #60a5fa; transition: all .2s; font-family: 'DM Sans', sans-serif;
    }
    .px-auth-btn:hover { background: #3b82f6; color: #fff; }

    /* User chip */
    .px-user-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 12px 5px 5px; border-radius: 20px;
      border: 1px solid #1e2a40; background: #0f1420;
      cursor: pointer; transition: all .15s; position: relative;
    }
    .px-user-chip:hover { border-color: #3b82f6; }
    .px-user-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg,#3b82f6,#8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; overflow: hidden; flex-shrink: 0;
    }
    .px-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .px-user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Dropdown */
    .px-user-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #0f1420; border: 1px solid #1e2a40;
      border-radius: 12px; padding: 8px; min-width: 200px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      opacity: 0; pointer-events: none; transform: translateY(-8px);
      transition: all .2s; z-index: 200;
    }
    .px-user-dropdown.open { opacity: 1; pointer-events: all; transform: translateY(0); }
    .px-dd-header { padding: 10px 10px 12px; border-bottom: 1px solid #1e2a40; margin-bottom: 8px; }
    .px-dd-name { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .px-dd-email { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .px-dd-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 8px; cursor: pointer;
      font-size: 13px; color: #94a3b8; transition: all .15s;
      font-family: 'DM Sans', sans-serif;
    }
    .px-dd-item:hover { background: #161d2e; color: #e2e8f0; }
    .px-dd-item.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
    .px-dd-divider { height: 1px; background: #1e2a40; margin: 6px 0; }

    /* Login modal */
    .px-login-bg {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(8,11,20,0.9); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .25s;
    }
    .px-login-bg.open { opacity: 1; pointer-events: all; }
    .px-login-card {
      background: #0f1420; border: 1px solid #1e2a40;
      border-radius: 20px; padding: 40px 36px; width: 100%;
      max-width: 400px; text-align: center;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      animation: loginIn .25s ease;
    }
    @keyframes loginIn { from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1} }
    .px-login-logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 24px; }
    .px-login-logo span { color: #f97316; }
    .px-login-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #e2e8f0; margin-bottom: 8px; }
    .px-login-sub { font-size: 14px; color: #94a3b8; margin-bottom: 28px; line-height: 1.6; }
    .px-perks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; text-align: left; }
    .px-perk { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #94a3b8; }
    .px-perk-icon { width: 30px; height: 30px; border-radius: 8px; background: #161d2e; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
    .px-google-btn {
      width: 100%; padding: 13px; border-radius: 10px;
      background: #fff; color: #1a1a1a;
      font-size: 15px; font-weight: 700; cursor: pointer; border: none;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: all .2s; font-family: 'DM Sans', sans-serif; margin-bottom: 12px;
    }
    .px-google-btn:hover { background: #f0f0f0; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,255,255,0.1); }
    .px-guest-btn {
      width: 100%; padding: 11px; border-radius: 10px;
      background: transparent; color: #94a3b8;
      font-size: 13px; font-weight: 600; cursor: pointer;
      border: 1px solid #1e2a40; transition: all .2s;
      font-family: 'DM Sans', sans-serif;
    }
    .px-guest-btn:hover { border-color: #94a3b8; color: #e2e8f0; }
    .px-login-close {
      position: absolute; top: 16px; right: 16px;
      width: 30px; height: 30px; border-radius: 8px;
      border: 1px solid #1e2a40; background: #161d2e;
      color: #94a3b8; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .px-login-close:hover { border-color: #ef4444; color: #ef4444; }
    .px-login-card { position: relative; }
    .px-privacy { font-size: 11px; color: #4b5563; margin-top: 14px; }

    /* Welcome toast */
    .px-welcome {
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%) translateY(-20px);
      background: #0f1420; border: 1px solid #10b981;
      border-radius: 12px; padding: 14px 24px;
      display: flex; align-items: center; gap: 12px;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 8px 32px rgba(16,185,129,0.2);
      opacity: 0; pointer-events: none; transition: all .3s; z-index: 9998;
      white-space: nowrap;
    }
    .px-welcome.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .px-welcome-icon { font-size: 24px; }
    .px-welcome-title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .px-welcome-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  `;
  document.head.appendChild(style);

  // ── Handle OAuth redirect ────────────────
  PlayxDB.Auth.handleRedirect();

  // ── Inject into nav ─────────────────────
  const nav = document.querySelector('nav .nav-right, nav');
  if (!nav) return;

  const authWrap = document.createElement('div');
  authWrap.id = 'px-auth-wrap';
  authWrap.style.cssText = 'display:flex;align-items:center;gap:8px';

  // Check login state
  const isLoggedIn = PlayxDB.Auth.isLoggedIn();
  const user = PlayxDB.Auth.getCurrentUser();

  if (isLoggedIn && user) {
    renderUserChip(authWrap, user);
  } else {
    const loginBtn = document.createElement('button');
    loginBtn.className = 'px-auth-btn';
    loginBtn.innerHTML = '🔑 Sign In';
    loginBtn.addEventListener('click', openLoginModal);
    authWrap.appendChild(loginBtn);
  }

  // Append to nav-right if exists, else nav
  const navRight = document.querySelector('.nav-right');
  if (navRight) navRight.prepend(authWrap);
  else nav.appendChild(authWrap);

  // ── User chip + dropdown ─────────────────
  function renderUserChip(container, user) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';
    const avatar = user.user_metadata?.avatar_url || null;
    const chip = document.createElement('div');
    chip.className = 'px-user-chip';
    chip.innerHTML = `
      <div class="px-user-avatar">${avatar ? `<img src="${avatar}" alt="">` : '🎮'}</div>
      <div class="px-user-name">${name}</div>
      <div class="px-user-dropdown" id="px-dropdown">
        <div class="px-dd-header">
          <div class="px-dd-name">${name}</div>
          <div class="px-dd-email">${user.email || ''}</div>
        </div>
        <div class="px-dd-item" id="dd-profile">👤 My Profile</div>
        <div class="px-dd-item" id="dd-scores">🏆 My Scores</div>
        <div class="px-dd-item" id="dd-badges">🏅 My Badges</div>
        <div class="px-dd-divider"></div>
        <div class="px-dd-item danger" id="dd-signout">🚪 Sign Out</div>
      </div>
    `;
    container.appendChild(chip);

    chip.addEventListener('click', e => {
      const dd = document.getElementById('px-dropdown');
      dd.classList.toggle('open');
      e.stopPropagation();
    });
    document.addEventListener('click', () => {
      document.getElementById('px-dropdown')?.classList.remove('open');
    });

    document.getElementById('dd-profile')?.addEventListener('click', () => {
      document.getElementById('px-profile-btn')?.click();
    });
    document.getElementById('dd-badges')?.addEventListener('click', () => {
      document.getElementById('px-badges-btn')?.click();
    });
    document.getElementById('dd-signout')?.addEventListener('click', async () => {
      await PlayxDB.Auth.signOut();
    });

    // Sync profile to DB
    PlayxDB.Profiles.syncFromLocal(user.id).catch(() => {});
  }

  // ── Login Modal ──────────────────────────
  const loginBg = document.createElement('div');
  loginBg.className = 'px-login-bg';
  loginBg.id = 'px-login-bg';
  loginBg.innerHTML = `
    <div class="px-login-card">
      <button class="px-login-close" id="px-login-close">✕</button>
      <div class="px-login-logo">Play<span>x</span></div>
      <div class="px-login-title">Join the Game</div>
      <div class="px-login-sub">Sign in to save your progress, compete globally, and unlock exclusive badges.</div>
      <div class="px-perks">
        <div class="px-perk"><div class="px-perk-icon">🏆</div><span>Compete on the global leaderboard</span></div>
        <div class="px-perk"><div class="px-perk-icon">🔥</div><span>Save your streaks and XP forever</span></div>
        <div class="px-perk"><div class="px-perk-icon">🏅</div><span>Unlock badges across all games</span></div>
        <div class="px-perk"><div class="px-perk-icon">📱</div><span>Play on any device, progress syncs</span></div>
      </div>
      <button class="px-google-btn" id="px-google-signin">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
        Continue with Google
      </button>
      <button class="px-guest-btn" id="px-guest-play">Continue as Guest</button>
      <div class="px-privacy">🔒 We never post without your permission</div>
    </div>
  `;
  document.body.appendChild(loginBg);

  // Welcome toast
  document.body.insertAdjacentHTML('beforeend', `
    <div class="px-welcome" id="px-welcome">
      <div class="px-welcome-icon">👋</div>
      <div>
        <div class="px-welcome-title" id="px-welcome-title">Welcome back!</div>
        <div class="px-welcome-sub" id="px-welcome-sub">Your progress is saved</div>
      </div>
    </div>
  `);

  function openLoginModal() {
    document.getElementById('px-login-bg').classList.add('open');
  }
  window.openLoginModal = openLoginModal;

  document.getElementById('px-login-close').addEventListener('click', () => {
    loginBg.classList.remove('open');
  });
  loginBg.addEventListener('click', e => {
    if (e.target === loginBg) loginBg.classList.remove('open');
  });
  document.getElementById('px-google-signin').addEventListener('click', () => {
    PlayxDB.Auth.signInWithGoogle();
  });
  document.getElementById('px-guest-play').addEventListener('click', () => {
    loginBg.classList.remove('open');
  });

  // Show welcome if just logged in
  if (isLoggedIn && user) {
    const name = user.user_metadata?.full_name?.split(' ')[0] || 'Player';
    const w = document.getElementById('px-welcome');
    document.getElementById('px-welcome-title').textContent = `Welcome back, ${name}!`;
    document.getElementById('px-welcome-sub').textContent   = 'Your XP and streak are saved ✅';
    setTimeout(() => { w.classList.add('show'); setTimeout(() => w.classList.remove('show'), 3000); }, 800);
  }

  // Expose for other scripts
  window.PlayxAuthUI = { openLoginModal };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PlayxAuthUI);
} else {
  PlayxAuthUI();
}
