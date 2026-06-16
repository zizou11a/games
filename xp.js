// ═══════════════════════════════════════════
//  Playx Core System — xp.js
//  XP · Levels · Streaks · Badges · Profile
// ═══════════════════════════════════════════

const PlayxCore = (() => {

  // ── Storage helpers ─────────────────────
  const get = k => { try { return JSON.parse(localStorage.getItem('px_' + k)); } catch { return null; } };
  const set = (k, v) => localStorage.setItem('px_' + k, JSON.stringify(v));

  // ── Level config ────────────────────────
  const LEVELS = [
    { level:1,  title:'Newbie',      xpNeeded:0,    icon:'🌱' },
    { level:2,  title:'Rookie',      xpNeeded:100,  icon:'⭐' },
    { level:3,  title:'Player',      xpNeeded:250,  icon:'🎮' },
    { level:4,  title:'Gamer',       xpNeeded:500,  icon:'🕹' },
    { level:5,  title:'Pro',         xpNeeded:900,  icon:'🔥' },
    { level:6,  title:'Expert',      xpNeeded:1400, icon:'⚡' },
    { level:7,  title:'Master',      xpNeeded:2100, icon:'💎' },
    { level:8,  title:'Champion',    xpNeeded:3000, icon:'🏆' },
    { level:9,  title:'Legend',      xpNeeded:4200, icon:'👑' },
    { level:10, title:'Mythic',      xpNeeded:6000, icon:'🌟' },
  ];

  // ── Badges ──────────────────────────────
  const BADGES = [
    { id:'first_game',   icon:'🎮', name:'First Game',      desc:'Play your first game',          secret:false },
    { id:'score_100',    icon:'💯', name:'Century',         desc:'Score 100+ in any game',        secret:false },
    { id:'score_500',    icon:'🔥', name:'On Fire',         desc:'Score 500+ in Shadow Runner',   secret:false },
    { id:'score_1000',   icon:'⚡', name:'Lightning',       desc:'Score 1000+ in Shadow Runner',  secret:true  },
    { id:'streak_3',     icon:'📅', name:'Habit Forming',   desc:'3-day login streak',            secret:false },
    { id:'streak_7',     icon:'🗓', name:'Week Warrior',    desc:'7-day login streak',            secret:false },
    { id:'streak_30',    icon:'📆', name:'Monthly Master',  desc:'30-day login streak',           secret:true  },
    { id:'quiz_done',    icon:'🧠', name:'Quiz Taker',      desc:'Complete a personality quiz',   secret:false },
    { id:'word_win',     icon:'📖', name:'Word Smith',      desc:'Win Word Blitz',                secret:false },
    { id:'word_genius',  icon:'🎯', name:'Genius',          desc:'Win Word Blitz in 2 guesses',   secret:true  },
    { id:'level_5',      icon:'🚀', name:'Pro Player',      desc:'Reach level 5',                 secret:false },
    { id:'level_10',     icon:'👑', name:'Mythic',          desc:'Reach max level',               secret:true  },
    { id:'xp_500',       icon:'💫', name:'XP Grinder',      desc:'Earn 500 total XP',             secret:false },
    { id:'xp_2000',      icon:'💎', name:'Diamond Mind',    desc:'Earn 2000 total XP',            secret:true  },
    { id:'chaos_agent',  icon:'🎪', name:'Chaos Agent',     desc:'Get Chaos Agent quiz result',   secret:false },
  ];

  // ── XP rewards ──────────────────────────
  const XP_REWARDS = {
    game_played:    10,
    game_score_100: 25,
    game_score_500: 60,
    game_score_1000:120,
    quiz_complete:  40,
    word_win:       50,
    word_win_early: 30, // bonus per guess under 4
    daily_login:    20,
    streak_bonus:   10, // per streak day
  };

  // ── Get current profile ─────────────────
  function getProfile() {
    const defaults = {
      xp: 0, totalXP: 0,
      streak: 0, lastLogin: null,
      badges: [],
      gamesPlayed: 0, quizzesDone: 0, wordsWon: 0,
      bestScores: {},
      joinDate: new Date().toISOString(),
    };
    return Object.assign({}, defaults, get('profile') || {});
  }

  function saveProfile(p) { set('profile', p); }

  // ── Level from XP ───────────────────────
  function getLevelInfo(totalXP) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpNeeded) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
        break;
      }
    }
    const xpInLevel = totalXP - current.xpNeeded;
    const xpNeeded = next ? next.xpNeeded - current.xpNeeded : 1;
    const pct = next ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;
    return { current, next, xpInLevel, xpNeeded, pct };
  }

  // ── Award XP ────────────────────────────
  function awardXP(amount, reason) {
    const p = getProfile();
    p.xp += amount;
    p.totalXP += amount;
    saveProfile(p);
    checkBadges(p);
    if (typeof onXPAwarded === 'function') onXPAwarded(amount, reason, p);
    return p;
  }

  // ── Daily login streak ──────────────────
  function checkDailyLogin() {
    const p = getProfile();
    const today = new Date().toDateString();
    if (p.lastLogin === today) return p;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (p.lastLogin === yesterday) {
      p.streak++;
    } else if (p.lastLogin !== today) {
      p.streak = 1;
    }
    p.lastLogin = today;
    const xpGain = XP_REWARDS.daily_login + (p.streak * XP_REWARDS.streak_bonus);
    p.xp += xpGain;
    p.totalXP += xpGain;
    saveProfile(p);
    checkBadges(p);
    return { profile: p, xpGain, isNew: true };
  }

  // ── Badge unlock ────────────────────────
  function unlockBadge(id) {
    const p = getProfile();
    if (p.badges.includes(id)) return false;
    p.badges.push(id);
    saveProfile(p);
    const badge = BADGES.find(b => b.id === id);
    if (badge && typeof onBadgeUnlocked === 'function') onBadgeUnlocked(badge);
    return badge;
  }

  function checkBadges(p) {
    if (p.gamesPlayed >= 1)    unlockBadge('first_game');
    if (p.totalXP >= 500)      unlockBadge('xp_500');
    if (p.totalXP >= 2000)     unlockBadge('xp_2000');
    if (p.streak >= 3)         unlockBadge('streak_3');
    if (p.streak >= 7)         unlockBadge('streak_7');
    if (p.streak >= 30)        unlockBadge('streak_30');
    if (p.quizzesDone >= 1)    unlockBadge('quiz_done');
    if (p.wordsWon >= 1)       unlockBadge('word_win');
    const li = getLevelInfo(p.totalXP);
    if (li.current.level >= 5)  unlockBadge('level_5');
    if (li.current.level >= 10) unlockBadge('level_10');
  }

  // ── Track game score ────────────────────
  function trackGameScore(game, score) {
    const p = getProfile();
    p.gamesPlayed = (p.gamesPlayed || 0) + 1;
    p.bestScores = p.bestScores || {};
    if (!p.bestScores[game] || score > p.bestScores[game]) p.bestScores[game] = score;
    let xpGain = XP_REWARDS.game_played;
    if (score >= 100)  { xpGain += XP_REWARDS.game_score_100;  unlockBadge('score_100'); }
    if (score >= 500)  { xpGain += XP_REWARDS.game_score_500;  unlockBadge('score_500'); }
    if (score >= 1000) { xpGain += XP_REWARDS.game_score_1000; unlockBadge('score_1000'); }
    p.xp += xpGain; p.totalXP += xpGain;
    saveProfile(p);
    checkBadges(p);
    return { profile: p, xpGain };
  }

  function trackQuizDone(resultType) {
    const p = getProfile();
    p.quizzesDone = (p.quizzesDone || 0) + 1;
    const xpGain = XP_REWARDS.quiz_complete;
    p.xp += xpGain; p.totalXP += xpGain;
    saveProfile(p);
    checkBadges(p);
    if (resultType === 'M') unlockBadge('chaos_agent');
    return { profile: p, xpGain };
  }

  function trackWordWin(guesses) {
    const p = getProfile();
    p.wordsWon = (p.wordsWon || 0) + 1;
    let xpGain = XP_REWARDS.word_win;
    if (guesses <= 2) { xpGain += XP_REWARDS.word_win_early * 3; unlockBadge('word_genius'); }
    else if (guesses <= 3) xpGain += XP_REWARDS.word_win_early * 2;
    else if (guesses <= 4) xpGain += XP_REWARDS.word_win_early;
    p.xp += xpGain; p.totalXP += xpGain;
    saveProfile(p);
    checkBadges(p);
    unlockBadge('word_win');
    return { profile: p, xpGain };
  }

  return {
    getProfile, saveProfile, getLevelInfo, awardXP,
    checkDailyLogin, unlockBadge, checkBadges,
    trackGameScore, trackQuizDone, trackWordWin,
    LEVELS, BADGES, XP_REWARDS,
  };
})();
