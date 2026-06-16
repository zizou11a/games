// ═══════════════════════════════════════════
//  Playx Profile Bar — profilebar.js
//  Injects XP bar + notifications into nav
// ═══════════════════════════════════════════

function PlayxProfileBar() {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    .px-bar {
      background: rgba(8,11,20,0.95);
      border-bottom: 1px solid #1e2a40;
      padding: 0 32px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      position: sticky;
      top: 56px;
      z-index: 99;
      gap: 16px;
    }
    .px-bar-left { display: flex; align-items: center; gap: 14px; }
    .px-level {
      display: flex; align-items: center; gap: 6px;
      background: #0f1420; border: 1px solid #1e2a40;
      border-radius: 20px; padding: 3px 10px 3px 6px;
    }
    .px-level-icon { font-size: 14px; }
    .px-level-text { font-size: 11px; font-weight: 700; color: #e2e8f0; }
    .px-level-title { font-size: 10px; color: #94a3b8; }
    .px-xp-wrap { display: flex; align-items: center; gap: 8px; }
    .px-xp-label { font-size: 11px; color: #94a3b8; white-space: nowrap; }
    .px-xp-bar { width: 120px; height: 5px; background: #1e2a40; border-radius: 3px; overflow: hidden; }
    .px-xp-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); transition: width .6s cubic-bezier(.4,0,.2,1); }
    .px-xp-num { font-size: 11px; color: #60a5fa; font-weight: 600; white-space: nowrap; }
    .px-bar-right { display: flex; align-items: center; gap: 12px; }
    .px-streak { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #f97316; font-weight: 600; }
    .px-badges-btn {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; color: #94a3b8; cursor: pointer;
      padding: 3px 10px; border-radius: 6px;
      border: 1px solid #1e2a40; background: #0f1420;
      transition: all .15s;
    }
    .px-badges-btn:hover { border-color: #3b82f6; color: #e2e8f0; }
    .px-profile-btn {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: #e2e8f0; font-weight: 600;
      cursor: pointer; padding: 3px 12px 3px 6px;
      border-radius: 20px; border: 1px solid #1e2a40;
      background: #0f1420; transition: all .15s;
    }
    .px-profile-btn:hover { border-color: #8b5cf6; }
    .px-avatar { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 11px; }

    /* XP Toast */
    .px-xp-toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: #0f1420; border: 1px solid #3b82f6;
      border-radius: 12px; padding: 12px 18px;
      display: flex; align-items: center; gap: 10px;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 8px 32px rgba(59,130,246,0.2);
      transform: translateX(120%); transition: transform .3s cubic-bezier(.4,0,.2,1);
      max-width: 280px;
    }
    .px-xp-toast.show { transform: translateX(0); }
    .px-xp-toast-icon { font-size: 24px; flex-shrink: 0; }
    .px-xp-toast-title { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .px-xp-toast-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .px-xp-amount { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #60a5fa; flex-shrink: 0; }

    /* Badge Toast */
    .px-badge-toast {
      position: fixed; bottom: 24px; left: 24px; z-index: 9999;
      background: #0f1420; border: 1px solid #f97316;
      border-radius: 12px; padding: 14px 18px;
      display: flex; align-items: center; gap: 12px;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 8px 32px rgba(249,115,22,0.2);
      transform: translateX(-120%); transition: transform .3s cubic-bezier(.4,0,.2,1);
    }
    .px-badge-toast.show { transform: translateX(0); }
    .px-badge-icon { font-size: 32px; }
    .px-badge-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #f97316; font-weight: 700; }
    .px-badge-name { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-top: 2px; }
    .px-badge-desc { font-size: 11px; color: #94a3b8; margin-top: 2px; }

    /* Level Up overlay */
    .px-levelup {
      position: fixed; inset: 0; z-index: 9998;
      background: rgba(8,11,20,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .3s;
    }
    .px-levelup.show { opacity: 1; pointer-events: all; }
    .px-levelup-card {
      background: #0f1420; border: 1px solid #8b5cf6;
      border-radius: 20px; padding: 48px 56px; text-align: center;
      box-shadow: 0 0 60px rgba(139,92,246,0.3);
      animation: luPop .4s cubic-bezier(.4,0,.2,1);
    }
    @keyframes luPop { from{transform:scale(.8);opacity:0} to{transform:scale(1);opacity:1} }
    .px-levelup-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #8b5cf6; margin-bottom: 12px; }
    .px-levelup-icon { font-size: 64px; margin-bottom: 8px; animation: spin1 .6s ease; }
    @keyframes spin1 { from{transform:rotate(-15deg) scale(.8)} to{transform:rotate(0) scale(1)} }
    .px-levelup-level { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: #e2e8f0; line-height: 1; }
    .px-levelup-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; color: #8b5cf6; margin-bottom: 16px; }
    .px-levelup-btn { margin-top: 24px; padding: 12px 32px; border-radius: 10px; background: #8b5cf6; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all .2s; }
    .px-levelup-btn:hover { background: #7c3aed; }

    /* Profile modal */
    .px-modal-bg {
      position: fixed; inset: 0; z-index: 9997;
      background: rgba(8,11,20,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .25s;
    }
    .px-modal-bg.show { opacity: 1; pointer-events: all; }
    .px-modal {
      background: #0f1420; border: 1px solid #1e2a40;
      border-radius: 20px; padding: 32px; width: 100%; max-width: 480px;
      max-height: 80vh; overflow-y: auto;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      animation: modalIn .25s ease;
    }
    @keyframes modalIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
    .px-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .px-modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #e2e8f0; }
    .px-modal-close { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #1e2a40; background: #161d2e; color: #94a3b8; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .px-modal-close:hover { border-color: #ef4444; color: #ef4444; }
    .px-profile-top { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #1e2a40; }
    .px-avatar-big { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .px-profile-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #e2e8f0; }
    .px-profile-since { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .px-stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 24px; }
    .px-stat-item { background: #161d2e; border: 1px solid #1e2a40; border-radius: 10px; padding: 12px; text-align: center; }
    .px-stat-n { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #e2e8f0; }
    .px-stat-l { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-top: 3px; }
    .px-section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
    .px-badges-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
    .px-badge-item { background: #161d2e; border: 1px solid #1e2a40; border-radius: 10px; padding: 10px 6px; text-align: center; cursor: default; position: relative; }
    .px-badge-item.earned { border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.06); }
    .px-badge-item.locked { opacity: .4; filter: grayscale(1); }
    .px-badge-item .bicon { font-size: 24px; }
    .px-badge-item .bname { font-size: 10px; color: #94a3b8; margin-top: 4px; line-height: 1.2; }
    .px-badge-item.earned .bname { color: #e2e8f0; }
    .px-xp-section { margin-bottom: 20px; }
    .px-xp-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .px-xp-big { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #60a5fa; }
    .px-xp-bar2 { height: 8px; background: #1e2a40; border-radius: 4px; overflow: hidden; }
    .px-xp-fill2 { height: 100%; border-radius: 4px; background: linear-gradient(90deg,#3b82f6,#8b5cf6); }
    @media(max-width:600px){
      .px-bar { padding: 0 16px; }
      .px-xp-wrap { display: none; }
      .px-modal { max-width: calc(100vw - 32px); }
    }
  `;
  document.head.appendChild(style);

  // Inject bar after nav
  const nav = document.querySelector('nav');
  if (!nav) return;
  const bar = document.createElement('div');
  bar.className = 'px-bar';
  bar.id = 'px-bar';
  bar.innerHTML = `
    <div class="px-bar-left">
      <div class="px-level" id="px-level">
        <div class="px-level-icon" id="px-lvl-icon">🌱</div>
        <div>
          <div class="px-level-text">Lv <span id="px-lvl-num">1</span></div>
          <div class="px-level-title" id="px-lvl-title">Newbie</div>
        </div>
      </div>
      <div class="px-xp-wrap">
        <div class="px-xp-label">XP</div>
        <div class="px-xp-bar"><div class="px-xp-fill" id="px-xp-fill" style="width:0%"></div></div>
        <div class="px-xp-num" id="px-xp-num">0 / 100</div>
      </div>
    </div>
    <div class="px-bar-right">
      <div class="px-streak" id="px-streak">🔥 0 day streak</div>
      <div class="px-badges-btn" id="px-badges-btn">🏅 <span id="px-badge-count">0</span> badges</div>
      <div class="px-profile-btn" id="px-profile-btn">
        <div class="px-avatar">🎮</div>
        <span>Profile</span>
      </div>
    </div>
  `;
  nav.insertAdjacentElement('afterend', bar);

  // Inject toasts
  document.body.insertAdjacentHTML('beforeend', `
    <div class="px-xp-toast" id="px-xp-toast">
      <div class="px-xp-toast-icon" id="px-toast-icon">⚡</div>
      <div>
        <div class="px-xp-toast-title" id="px-toast-title">XP Earned!</div>
        <div class="px-xp-toast-sub" id="px-toast-sub"></div>
      </div>
      <div class="px-xp-amount" id="px-toast-amount">+0</div>
    </div>
    <div class="px-badge-toast" id="px-badge-toast">
      <div class="px-badge-icon" id="px-bticon"></div>
      <div>
        <div class="px-badge-label">Badge Unlocked!</div>
        <div class="px-badge-name" id="px-btname"></div>
        <div class="px-badge-desc" id="px-btdesc"></div>
      </div>
    </div>
    <div class="px-levelup" id="px-levelup">
      <div class="px-levelup-card">
        <div class="px-levelup-label">Level Up!</div>
        <div class="px-levelup-icon" id="px-lu-icon">⭐</div>
        <div class="px-levelup-level">Level <span id="px-lu-num">2</span></div>
        <div class="px-levelup-title" id="px-lu-title">Rookie</div>
        <button class="px-levelup-btn" id="px-lu-btn">Keep Playing →</button>
      </div>
    </div>
    <div class="px-modal-bg" id="px-modal-bg">
      <div class="px-modal" id="px-modal"></div>
    </div>
  `);

  // Render bar
  function renderBar() {
    const p = PlayxCore.getProfile();
    const li = PlayxCore.getLevelInfo(p.totalXP);
    document.getElementById('px-lvl-icon').textContent = li.current.icon;
    document.getElementById('px-lvl-num').textContent  = li.current.level;
    document.getElementById('px-lvl-title').textContent = li.current.title;
    document.getElementById('px-xp-fill').style.width  = li.pct + '%';
    document.getElementById('px-xp-num').textContent   = li.next
      ? `${li.xpInLevel} / ${li.xpNeeded}`
      : 'MAX';
    document.getElementById('px-streak').textContent   = `🔥 ${p.streak} day streak`;
    document.getElementById('px-badge-count').textContent = p.badges.length;
  }

  // XP toast
  window.showXPToast = function(amount, title, sub, icon='⚡') {
    const t = document.getElementById('px-xp-toast');
    document.getElementById('px-toast-icon').textContent   = icon;
    document.getElementById('px-toast-title').textContent  = title;
    document.getElementById('px-toast-sub').textContent    = sub || '';
    document.getElementById('px-toast-amount').textContent = '+' + amount + ' XP';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
    renderBar();
  };

  // Badge toast
  window.onBadgeUnlocked = function(badge) {
    const t = document.getElementById('px-badge-toast');
    document.getElementById('px-bticon').textContent = badge.icon;
    document.getElementById('px-btname').textContent = badge.name;
    document.getElementById('px-btdesc').textContent = badge.desc;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  };

  // Level up overlay
  let prevLevel = PlayxCore.getLevelInfo(PlayxCore.getProfile().totalXP).current.level;
  window.onXPAwarded = function(amount, reason, profile) {
    const li = PlayxCore.getLevelInfo(profile.totalXP);
    if (li.current.level > prevLevel) {
      prevLevel = li.current.level;
      document.getElementById('px-lu-icon').textContent  = li.current.icon;
      document.getElementById('px-lu-num').textContent   = li.current.level;
      document.getElementById('px-lu-title').textContent = li.current.title;
      document.getElementById('px-levelup').classList.add('show');
    }
    renderBar();
  };
  document.getElementById('px-lu-btn').addEventListener('click', () => {
    document.getElementById('px-levelup').classList.remove('show');
  });

  // Profile modal
  function openProfile() {
    const p = PlayxCore.getProfile();
    const li = PlayxCore.getLevelInfo(p.totalXP);
    const joinDate = new Date(p.joinDate).toLocaleDateString('en-US', {month:'long', year:'numeric'});
    const modal = document.getElementById('px-modal');
    modal.innerHTML = `
      <div class="px-modal-header">
        <div class="px-modal-title">My Profile</div>
        <button class="px-modal-close" id="px-modal-close">✕</button>
      </div>
      <div class="px-profile-top">
        <div class="px-avatar-big">${li.current.icon}</div>
        <div>
          <div class="px-profile-name">${li.current.icon} ${li.current.title}</div>
          <div class="px-profile-since">Level ${li.current.level} · Playing since ${joinDate}</div>
        </div>
      </div>
      <div class="px-xp-section">
        <div class="px-xp-row">
          <div class="px-section-title">XP Progress</div>
          <div class="px-xp-big">${p.totalXP} XP total</div>
        </div>
        <div class="px-xp-bar2"><div class="px-xp-fill2" style="width:${li.pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:11px;color:#94a3b8">
          <span>Level ${li.current.level}: ${li.current.title}</span>
          <span>${li.next ? `${li.xpInLevel}/${li.xpNeeded} → Level ${li.next.level}` : 'Max Level!'}</span>
        </div>
      </div>
      <div class="px-stat-grid">
        <div class="px-stat-item"><div class="px-stat-n">${p.gamesPlayed||0}</div><div class="px-stat-l">Games Played</div></div>
        <div class="px-stat-item"><div class="px-stat-n">${p.quizzesDone||0}</div><div class="px-stat-l">Quizzes Done</div></div>
        <div class="px-stat-item"><div class="px-stat-n">${p.wordsWon||0}</div><div class="px-stat-l">Words Won</div></div>
        <div class="px-stat-item"><div class="px-stat-n">${p.streak||0}🔥</div><div class="px-stat-l">Day Streak</div></div>
        <div class="px-stat-item"><div class="px-stat-n">${p.badges.length}</div><div class="px-stat-l">Badges</div></div>
        <div class="px-stat-item"><div class="px-stat-n">${Object.values(p.bestScores||{}).reduce((a,b)=>a+b,0)}</div><div class="px-stat-l">Total Score</div></div>
      </div>
      <div class="px-section-title">Badges</div>
      <div class="px-badges-grid">
        ${PlayxCore.BADGES.filter(b => !b.secret || p.badges.includes(b.id)).map(b => `
          <div class="px-badge-item ${p.badges.includes(b.id) ? 'earned' : 'locked'}" title="${b.desc}">
            <div class="bicon">${b.icon}</div>
            <div class="bname">${b.name}</div>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('px-modal-bg').classList.add('show');
    document.getElementById('px-modal-close').addEventListener('click', () => {
      document.getElementById('px-modal-bg').classList.remove('show');
    });
  }

  document.getElementById('px-modal-bg').addEventListener('click', e => {
    if (e.target === document.getElementById('px-modal-bg'))
      document.getElementById('px-modal-bg').classList.remove('show');
  });
  document.getElementById('px-profile-btn').addEventListener('click', openProfile);
  document.getElementById('px-badges-btn').addEventListener('click', openProfile);

  // Init
  renderBar();
  const loginResult = PlayxCore.checkDailyLogin();
  if (loginResult && loginResult.isNew) {
    setTimeout(() => {
      showXPToast(loginResult.xpGain, 'Daily Login!', `${loginResult.profile.streak} day streak 🔥`, '📅');
    }, 1500);
  }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PlayxProfileBar);
} else {
  PlayxProfileBar();
}
