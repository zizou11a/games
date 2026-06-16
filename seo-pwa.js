// ═══════════════════════════════════════════
//  Playx SEO + PWA + Loading — seo-pwa.js
//  Inject into every page
// ═══════════════════════════════════════════

(function() {

  // ── Page meta configs ───────────────────
  const PAGE_META = {
    'playx.html': {
      title:       'Playx — Play. Quiz. Challenge.',
      description: 'Free HTML5 games, daily challenges, and viral personality quizzes. No downloads. No sign-ups. Play now!',
      keywords:    'free games, html5 games, personality quiz, word game, daily challenge, browser games',
      ogImage:     'https://playx.io/og/home.png',
      type:        'website',
    },
    'games.html': {
      title:       'All Games — Playx',
      description: '340+ free HTML5 games. Arcade, puzzle, action, word games — all playable instantly in your browser.',
      keywords:    'free browser games, html5 games, arcade games, puzzle games, play online',
      ogImage:     'https://playx.io/og/games.png',
      type:        'website',
    },
    'shadow-runner.html': {
      title:       'Shadow Runner — Endless Arcade Game | Playx',
      description: 'Dodge obstacles and run as far as you can in Shadow Runner. Free arcade game, no download needed. Beat your high score!',
      keywords:    'shadow runner, endless runner game, arcade game, free browser game, high score',
      ogImage:     'https://playx.io/og/shadow-runner.png',
      type:        'game',
    },
    'quiz.html': {
      title:       'What Type of Gamer Are You? — Personality Quiz | Playx',
      description: 'Take our viral gaming personality quiz — are you a Speedrunner, Lore Master, Completionist, or Chaos Agent? 2.4M results shared!',
      keywords:    'gamer personality quiz, what type of gamer, gaming quiz, personality test',
      ogImage:     'https://playx.io/og/quiz.png',
      type:        'article',
    },
    'word-blitz.html': {
      title:       'Word Blitz — Daily Word Challenge | Playx',
      description: "Guess today's 5-letter word in 6 tries. Everyone gets the same word. Share your result and compete globally!",
      keywords:    'word blitz, daily word game, wordle alternative, word puzzle, 5 letter word',
      ogImage:     'https://playx.io/og/word-blitz.png',
      type:        'game',
    },
    'leaderboard.html': {
      title:       'Global Leaderboard — Playx',
      description: 'See who tops the charts on Playx. Compete with players worldwide in Shadow Runner, Word Blitz, and more.',
      keywords:    'game leaderboard, top players, high scores, global ranking, playx',
      ogImage:     'https://playx.io/og/leaderboard.png',
      type:        'website',
    },
  };

  const page = window.location.pathname.split('/').pop() || 'playx.html';
  const meta = PAGE_META[page] || PAGE_META['playx.html'];

  // ── Inject SEO tags ─────────────────────
  function injectMeta(name, content, prop) {
    const el = document.createElement('meta');
    if (prop) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  }

  // Title
  document.title = meta.title;

  // Basic SEO
  injectMeta('description',         meta.description);
  injectMeta('keywords',            meta.keywords);
  injectMeta('author',              'Playx');
  injectMeta('robots',              'index, follow');
  injectMeta('viewport',            'width=device-width, initial-scale=1.0');

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  injectMeta('og:title',            meta.title,       true);
  injectMeta('og:description',      meta.description, true);
  injectMeta('og:image',            meta.ogImage,     true);
  injectMeta('og:type',             meta.type,        true);
  injectMeta('og:url',              window.location.href, true);
  injectMeta('og:site_name',        'Playx',          true);
  injectMeta('og:locale',           'en_US',          true);

  // Twitter Card
  injectMeta('twitter:card',        'summary_large_image');
  injectMeta('twitter:title',       meta.title);
  injectMeta('twitter:description', meta.description);
  injectMeta('twitter:image',       meta.ogImage);
  injectMeta('twitter:site',        '@playxgames');

  // Canonical
  const canonical = document.createElement('link');
  canonical.rel  = 'canonical';
  canonical.href = `https://playx.io/${page}`;
  document.head.appendChild(canonical);

  // PWA manifest + theme
  const manifestLink = document.createElement('link');
  manifestLink.rel  = 'manifest';
  manifestLink.href = 'manifest.json';
  document.head.appendChild(manifestLink);

  const themeColor = document.createElement('meta');
  themeColor.name    = 'theme-color';
  themeColor.content = '#080b14';
  document.head.appendChild(themeColor);

  // Apple PWA tags
  injectMeta('apple-mobile-web-app-capable',          'yes');
  injectMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  injectMeta('apple-mobile-web-app-title',            'Playx');

  // JSON-LD Structured Data
  const schema = {
    '@context': 'https://schema.org',
    '@type':    meta.type === 'game' ? 'VideoGame' : 'WebSite',
    'name':     meta.title,
    'description': meta.description,
    'url':      `https://playx.io/${page}`,
    'image':    meta.ogImage,
    'author':   { '@type': 'Organization', 'name': 'Playx' },
    ...(meta.type === 'game' ? {
      'genre':          ['Arcade', 'Casual'],
      'playMode':       'SinglePlayer',
      'gamePlatform':   'Web Browser',
      'applicationCategory': 'Game',
    } : {}),
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(schema);
  document.head.appendChild(ldScript);

  // ── Register Service Worker ─────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          // Check for updates every 60s
          setInterval(() => reg.update(), 60000);
        })
        .catch(() => {});
    });
  }

  // ── Loading Screen ──────────────────────
  const loadStyle = document.createElement('style');
  loadStyle.textContent = `
    #px-loader {
      position: fixed; inset: 0; z-index: 99999;
      background: #080b14;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 20px;
      transition: opacity .4s ease, visibility .4s ease;
    }
    #px-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
    .px-loader-logo {
      font-family: 'Syne', 'DM Sans', sans-serif;
      font-size: 36px; font-weight: 800;
      background: linear-gradient(90deg, #60a5fa, #3b82f6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: logoBreath 1.2s ease-in-out infinite alternate;
    }
    @keyframes logoBreath {
      from { opacity: .6; transform: scale(.97); }
      to   { opacity: 1;  transform: scale(1);   }
    }
    .px-loader-logo span { color: #f97316; -webkit-text-fill-color: #f97316; }
    .px-loader-bar-wrap {
      width: 160px; height: 3px;
      background: #1e2a40; border-radius: 2px; overflow: hidden;
    }
    .px-loader-bar {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 2px;
      animation: loaderFill 1s cubic-bezier(.4,0,.2,1) forwards;
    }
    @keyframes loaderFill { to { width: 100%; } }
    .px-loader-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px; color: #4b5563;
      letter-spacing: 1px; text-transform: uppercase;
    }

    /* Install banner */
    #px-install-banner {
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%) translateY(100px);
      z-index: 9990;
      background: #0f1420; border: 1px solid #1e2a40;
      border-radius: 14px; padding: 14px 20px;
      display: flex; align-items: center; gap: 14px;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      transition: transform .4s cubic-bezier(.4,0,.2,1);
      max-width: calc(100vw - 32px); width: 380px;
    }
    #px-install-banner.show { transform: translateX(-50%) translateY(0); }
    .pib-icon { font-size: 32px; flex-shrink: 0; }
    .pib-title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .pib-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .pib-btns  { display: flex; gap: 8px; margin-top: 10px; }
    .pib-install {
      padding: 7px 16px; border-radius: 8px;
      background: #3b82f6; color: #fff;
      font-size: 13px; font-weight: 700; cursor: pointer;
      border: none; font-family: 'DM Sans', sans-serif; transition: all .2s;
    }
    .pib-install:hover { background: #2563eb; }
    .pib-dismiss {
      padding: 7px 12px; border-radius: 8px;
      background: transparent; color: #94a3b8;
      font-size: 13px; cursor: pointer;
      border: 1px solid #1e2a40; font-family: 'DM Sans', sans-serif; transition: all .2s;
    }
    .pib-dismiss:hover { color: #e2e8f0; }
    .pib-close {
      position: absolute; top: 10px; right: 12px;
      background: none; border: none; color: #4b5563;
      cursor: pointer; font-size: 16px; line-height: 1;
    }
  `;
  document.head.appendChild(loadStyle);

  // Create loader
  const loader = document.createElement('div');
  loader.id = 'px-loader';
  loader.innerHTML = `
    <div class="px-loader-logo">Play<span>x</span></div>
    <div class="px-loader-bar-wrap"><div class="px-loader-bar"></div></div>
    <div class="px-loader-sub">Loading...</div>
  `;
  document.body.insertBefore(loader, document.body.firstChild);

  // Hide loader when page ready
  function hideLoader() {
    setTimeout(() => {
      document.getElementById('px-loader')?.classList.add('hidden');
    }, 600);
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  // ── PWA Install Banner ──────────────────
  let deferredPrompt = null;
  const dismissed = localStorage.getItem('px_install_dismissed');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!dismissed) {
      setTimeout(showInstallBanner, 8000); // show after 8s
    }
  });

  function showInstallBanner() {
    if (!deferredPrompt) return;
    const banner = document.createElement('div');
    banner.id = 'px-install-banner';
    banner.innerHTML = `
      <button class="pib-close" id="pib-close">✕</button>
      <div class="pib-icon">🎮</div>
      <div>
        <div class="pib-title">Install Playx App</div>
        <div class="pib-sub">Play offline · Faster loading · App icon on home screen</div>
        <div class="pib-btns">
          <button class="pib-install" id="pib-install">Install Free</button>
          <button class="pib-dismiss" id="pib-dismiss">Not now</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));

    document.getElementById('pib-install').addEventListener('click', async () => {
      banner.classList.remove('show');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') {
        showXPToast?.(50, 'App Installed!', 'Welcome to Playx! +50 XP bonus 🎉', '📱');
      }
    });
    document.getElementById('pib-dismiss').addEventListener('click', () => {
      banner.classList.remove('show');
      localStorage.setItem('px_install_dismissed', '1');
    });
    document.getElementById('pib-close').addEventListener('click', () => {
      banner.classList.remove('show');
    });
  }

  // iOS install hint
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone;
  if (isIOS && !isStandalone && !dismissed) {
    setTimeout(() => {
      const banner = document.createElement('div');
      banner.id = 'px-install-banner';
      banner.innerHTML = `
        <div class="pib-icon">📱</div>
        <div>
          <div class="pib-title">Add Playx to Home Screen</div>
          <div class="pib-sub">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for the best experience</div>
          <div class="pib-btns"><button class="pib-dismiss" id="pib-dismiss-ios">Got it</button></div>
        </div>
      `;
      document.body.appendChild(banner);
      requestAnimationFrame(() => banner.classList.add('show'));
      document.getElementById('pib-dismiss-ios').addEventListener('click', () => {
        banner.classList.remove('show');
        localStorage.setItem('px_install_dismissed', '1');
      });
    }, 10000);
  }

})();
