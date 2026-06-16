// ═══════════════════════════════════════════
//  Playx Analytics — analytics.js
//  Google Analytics 4 + Custom Events
// ═══════════════════════════════════════════

const PlayxAnalytics = (() => {

  // ── CONFIG — Replace with your GA4 ID ──
  // 1. Go to analytics.google.com
  // 2. Create property → Web → copy Measurement ID (G-XXXXXXXXXX)
  const GA_ID = 'G-XXXXXXXXXX';

  // ── Load GA4 ────────────────────────────
  function init() {
    if (window.gtag) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, {
      page_title:    document.title,
      page_location: window.location.href,
      // Privacy-friendly settings
      anonymize_ip:             true,
      allow_google_signals:     false,
      allow_ad_personalization_signals: false,
    });

    trackPageView();
    setupAutoTracking();
  }

  // ── Page view ───────────────────────────
  function trackPageView() {
    const page = window.location.pathname.split('/').pop() || 'home';
    gtag('event', 'page_view', {
      page_title:    document.title,
      page_location: window.location.href,
      page_path:     '/' + page,
    });
    // Internal analytics
    logInternal('pageview', { page });
  }

  // ── Game events ─────────────────────────
  function trackGameStart(game) {
    gtag('event', 'game_start', { game_name: game });
    logInternal('game_start', { game });
  }

  function trackGameOver(game, score) {
    gtag('event', 'game_over', {
      game_name: game,
      score:     score,
      value:     score,
    });
    logInternal('game_over', { game, score });

    // Milestone events
    if (score >= 1000) gtag('event', 'milestone_1000', { game_name: game });
    if (score >= 500)  gtag('event', 'milestone_500',  { game_name: game });
  }

  function trackQuizComplete(quizType, result) {
    gtag('event', 'quiz_complete', {
      quiz_type:   quizType,
      quiz_result: result,
    });
    logInternal('quiz_complete', { quizType, result });
  }

  function trackWordWin(guesses, timeSeconds) {
    gtag('event', 'word_blitz_win', {
      guesses:      guesses,
      time_seconds: timeSeconds,
    });
    logInternal('word_win', { guesses, timeSeconds });
  }

  function trackShare(method, content) {
    gtag('event', 'share', {
      method:       method,
      content_type: content,
    });
  }

  function trackSignUp(method) {
    gtag('event', 'sign_up', { method });
    gtag('event', 'conversion', { send_to: `${GA_ID}/signup` });
  }

  function trackLogin(method) {
    gtag('event', 'login', { method });
  }

  function trackLevelUp(level, title) {
    gtag('event', 'level_up', {
      level_num:   level,
      level_title: title,
    });
  }

  function trackBadge(badgeId, badgeName) {
    gtag('event', 'unlock_achievement', {
      achievement_id:   badgeId,
      achievement_name: badgeName,
    });
  }

  function trackAdClick(adUnit) {
    gtag('event', 'ad_click', { ad_unit: adUnit });
  }

  function trackBlogRead(articleTitle, readPercent) {
    gtag('event', 'blog_read', {
      article_title: articleTitle,
      read_percent:  readPercent,
    });
  }

  function trackSearch(query, results) {
    gtag('event', 'search', {
      search_term:    query,
      results_count:  results,
    });
  }

  function trackInstall() {
    gtag('event', 'pwa_install');
    gtag('event', 'conversion', { send_to: `${GA_ID}/install` });
  }

  function trackProUpgrade() {
    gtag('event', 'purchase', {
      transaction_id: Date.now(),
      value:          3.00,
      currency:       'USD',
      items: [{ item_id: 'playx_pro', item_name: 'Playx Pro', price: 3.00 }],
    });
  }

  // ── Auto tracking ───────────────────────
  function setupAutoTracking() {
    // Track outbound links
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.startsWith('http') && !href.includes('playx.io')) {
        gtag('event', 'click', {
          event_category: 'outbound',
          event_label:    href,
        });
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const fired = new Set();
    window.addEventListener('scroll', () => {
      const pct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (pct > maxScroll) maxScroll = pct;
      milestones.forEach(m => {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          gtag('event', 'scroll', { percent_scrolled: m });
        }
      });
    }, { passive: true });

    // Track time on page
    const start = Date.now();
    window.addEventListener('beforeunload', () => {
      const seconds = Math.round((Date.now() - start) / 1000);
      gtag('event', 'timing_complete', {
        name:  'time_on_page',
        value: seconds,
      });
    });

    // Track blog article read progress
    if (window.location.pathname.includes('blog-post')) {
      setupArticleTracking();
    }
  }

  function setupArticleTracking() {
    const article = document.querySelector('.article-body');
    if (!article) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          trackBlogRead(document.title, Math.round(e.intersectionRatio * 100));
        }
      });
    }, { threshold: [0.25, 0.5, 0.75, 1.0] });
    observer.observe(article);
  }

  // ── Internal simple analytics ───────────
  // Stores events locally so you can see your
  // own data without needing GA dashboard
  function logInternal(event, data) {
    try {
      const logs = JSON.parse(localStorage.getItem('px_analytics') || '[]');
      logs.push({ event, data, ts: Date.now() });
      // Keep last 100 events only
      if (logs.length > 100) logs.shift();
      localStorage.setItem('px_analytics', JSON.stringify(logs));
    } catch {}
  }

  function getInternalStats() {
    try {
      const logs = JSON.parse(localStorage.getItem('px_analytics') || '[]');
      const stats = {
        pageviews:      logs.filter(l => l.event === 'pageview').length,
        gamesPlayed:    logs.filter(l => l.event === 'game_start').length,
        quizzesDone:    logs.filter(l => l.event === 'quiz_complete').length,
        wordsWon:       logs.filter(l => l.event === 'word_win').length,
        topGame:        getMostFrequent(logs.filter(l => l.event === 'game_start').map(l => l.data?.game)),
        avgScore:       Math.round(logs.filter(l => l.event === 'game_over').reduce((s,l) => s + (l.data?.score||0), 0) / Math.max(1, logs.filter(l => l.event === 'game_over').length)),
      };
      return stats;
    } catch { return {}; }
  }

  function getMostFrequent(arr) {
    if (!arr.length) return null;
    return arr.sort((a,b) => arr.filter(v=>v===a).length - arr.filter(v=>v===b).length).pop();
  }

  return {
    init,
    trackGameStart, trackGameOver,
    trackQuizComplete, trackWordWin,
    trackShare, trackSignUp, trackLogin,
    trackLevelUp, trackBadge,
    trackAdClick, trackBlogRead, trackSearch,
    trackInstall, trackProUpgrade,
    getInternalStats,
  };
})();

// Auto-init only if consent given
const consent = localStorage.getItem('px_ad_consent');
if (consent === 'true' || consent === null) {
  PlayxAnalytics.init();
}

// Expose globally
window.PlayxAnalytics = PlayxAnalytics;
