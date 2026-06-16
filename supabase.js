// ═══════════════════════════════════════════
//  Playx Backend — supabase.js
//  Auth · Leaderboard · Comments · Ratings
//  Uses Supabase (free tier)
// ═══════════════════════════════════════════

const PlayxDB = (() => {

  // ── CONFIG — replace with your Supabase project ──
  // 1. Go to supabase.com → New Project
  // 2. Settings → API → copy URL and anon key
  const SUPABASE_URL  = 'YOUR_SUPABASE_URL';
  const SUPABASE_KEY  = 'YOUR_SUPABASE_ANON_KEY';

  const headers = {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  // ── HTTP helpers ────────────────────────
  async function query(table, params = '') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function insert(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function upsert(table, body, onConflict) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': `resolution=merge-duplicates,return=representation` },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function update(table, match, body) {
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${v}`).join('&');
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  // ── Auth (Google OAuth via Supabase) ────
  const Auth = {
    async signInWithGoogle() {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/playx.html')}`, { headers });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    },

    async signOut() {
      const token = localStorage.getItem('px_access_token');
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { ...headers, 'Authorization': `Bearer ${token}` },
      });
      localStorage.removeItem('px_access_token');
      localStorage.removeItem('px_user');
      window.location.reload();
    },

    async getUser() {
      const token = localStorage.getItem('px_access_token');
      if (!token) return null;
      try {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { ...headers, 'Authorization': `Bearer ${token}` },
        });
        if (!r.ok) return null;
        const u = await r.json();
        localStorage.setItem('px_user', JSON.stringify(u));
        return u;
      } catch { return null; }
    },

    // Handle OAuth redirect (call on page load)
    handleRedirect() {
      const hash = window.location.hash;
      if (!hash.includes('access_token')) return false;
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get('access_token');
      if (token) {
        localStorage.setItem('px_access_token', token);
        window.history.replaceState({}, '', window.location.pathname);
        return true;
      }
      return false;
    },

    getCurrentUser() {
      try { return JSON.parse(localStorage.getItem('px_user')); } catch { return null; }
    },

    isLoggedIn() { return !!localStorage.getItem('px_access_token'); },
  };

  // ── Leaderboard ─────────────────────────
  const Leaderboard = {
    async getTop(game, limit = 10) {
      return query('leaderboard',
        `?game=eq.${game}&order=score.desc&limit=${limit}&select=*,profiles(username,avatar_url)`
      );
    },

    async getPlayerRank(game, userId) {
      const rows = await query('leaderboard', `?game=eq.${game}&order=score.desc&select=user_id`);
      const idx  = rows.findIndex(r => r.user_id === userId);
      return idx === -1 ? null : idx + 1;
    },

    async submitScore(game, score) {
      if (!Auth.isLoggedIn()) return null;
      const user = Auth.getCurrentUser();
      if (!user) return null;
      // Only upsert if it's a new best
      const existing = await query('leaderboard', `?game=eq.${game}&user_id=eq.${user.id}&select=score`);
      if (existing.length && existing[0].score >= score) return existing[0];
      return upsert('leaderboard', {
        user_id: user.id,
        game,
        score,
        played_at: new Date().toISOString(),
      });
    },

    async getTodayTop(game, limit = 5) {
      const today = new Date().toISOString().split('T')[0];
      return query('leaderboard',
        `?game=eq.${game}&played_at=gte.${today}&order=score.desc&limit=${limit}&select=*,profiles(username,avatar_url)`
      );
    },
  };

  // ── Profiles ────────────────────────────
  const Profiles = {
    async get(userId) {
      const rows = await query('profiles', `?user_id=eq.${userId}`);
      return rows[0] || null;
    },

    async upsert(userId, data) {
      return upsert('profiles', { user_id: userId, ...data });
    },

    async syncFromLocal(userId) {
      // Sync local XP/streak to DB
      const local = JSON.parse(localStorage.getItem('px_profile') || '{}');
      if (!local.totalXP) return;
      return upsert('profiles', {
        user_id:      userId,
        total_xp:     local.totalXP || 0,
        streak:       local.streak  || 0,
        badges:       local.badges  || [],
        games_played: local.gamesPlayed || 0,
        quizzes_done: local.quizzesDone || 0,
        words_won:    local.wordsWon    || 0,
        updated_at:   new Date().toISOString(),
      });
    },
  };

  // ── Comments ────────────────────────────
  const Comments = {
    async get(game, limit = 20) {
      return query('comments',
        `?game=eq.${game}&order=created_at.desc&limit=${limit}&select=*,profiles(username,avatar_url)`
      );
    },

    async post(game, text) {
      if (!Auth.isLoggedIn()) throw new Error('Login required');
      const user = Auth.getCurrentUser();
      return insert('comments', {
        user_id:    user.id,
        game,
        text:       text.slice(0, 500),
        created_at: new Date().toISOString(),
      });
    },
  };

  // ── Ratings ────────────────────────────
  const Ratings = {
    async get(game) {
      const rows = await query('ratings', `?game=eq.${game}&select=rating`);
      if (!rows.length) return { avg: 0, count: 0 };
      const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
      return { avg: Math.round(avg * 10) / 10, count: rows.length };
    },

    async submit(game, rating) {
      if (!Auth.isLoggedIn()) throw new Error('Login required');
      const user = Auth.getCurrentUser();
      return upsert('ratings', { user_id: user.id, game, rating });
    },
  };

  return { Auth, Leaderboard, Profiles, Comments, Ratings };
})();
