// ═══════════════════════════════════════════
//  Playx Sound Engine — sounds.js
//  Web Audio API · No files needed ·
//  Generated sounds for all game events
// ═══════════════════════════════════════════

const PlayxSound = (() => {

  let ctx = null;
  let enabled = localStorage.getItem('px_sound') !== 'false';
  let masterVolume = parseFloat(localStorage.getItem('px_volume') || '0.5');

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Core synth ──────────────────────────
  function play(freq, type, duration, volume = 0.3, delay = 0) {
    if (!enabled) return;
    try {
      const c   = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type      = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      gain.gain.setValueAtTime(volume * masterVolume, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration + 0.05);
    } catch {}
  }

  function playNoise(duration, volume = 0.1) {
    if (!enabled) return;
    try {
      const c      = getCtx();
      const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
      const data   = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = c.createBufferSource();
      const gain   = c.createGain();
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(c.destination);
      gain.gain.setValueAtTime(volume * masterVolume, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      source.start();
    } catch {}
  }

  // ── Game sounds ─────────────────────────

  // Jump — short upward sweep
  function jump() {
    play(220, 'square', 0.08, 0.25);
    play(440, 'square', 0.06, 0.2, 0.06);
  }

  // Land — thud
  function land() {
    play(80, 'sine', 0.1, 0.3);
  }

  // Hit / damage — harsh buzz
  function hit() {
    play(150, 'sawtooth', 0.15, 0.3);
    play(100, 'sawtooth', 0.12, 0.2, 0.05);
    playNoise(0.08, 0.15);
  }

  // Collect crystal — bright chime
  function collect() {
    play(880,  'sine', 0.08, 0.2);
    play(1320, 'sine', 0.06, 0.15, 0.08);
    play(1760, 'sine', 0.04, 0.1,  0.14);
  }

  // Score milestone — fanfare
  function milestone() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => play(f, 'square', 0.1, 0.2, i * 0.08));
  }

  // Game over — descending sad
  function gameOver() {
    play(440, 'sawtooth', 0.2, 0.3);
    play(349, 'sawtooth', 0.2, 0.3, 0.2);
    play(262, 'sawtooth', 0.3, 0.3, 0.4);
    play(196, 'sawtooth', 0.4, 0.3, 0.65);
  }

  // ── Quiz sounds ─────────────────────────

  // Select answer — soft click
  function select() {
    play(600, 'sine', 0.05, 0.15);
  }

  // Correct answer
  function correct() {
    play(523, 'sine', 0.1, 0.25);
    play(659, 'sine', 0.1, 0.25, 0.1);
    play(784, 'sine', 0.15, 0.25, 0.2);
  }

  // Wrong answer
  function wrong() {
    play(300, 'sawtooth', 0.08, 0.2);
    play(250, 'sawtooth', 0.12, 0.2, 0.1);
  }

  // Quiz result reveal
  function reveal() {
    const melody = [523, 587, 659, 698, 784, 880];
    melody.forEach((f, i) => play(f, 'sine', 0.15, 0.2, i * 0.07));
  }

  // ── Word Blitz sounds ───────────────────

  // Type a letter — mechanical key
  function keyPress() {
    play(1200, 'square', 0.03, 0.08);
    playNoise(0.02, 0.05);
  }

  // Delete — reverse click
  function keyDelete() {
    play(800, 'square', 0.03, 0.06);
  }

  // Submit word
  function submitWord() {
    play(440, 'sine', 0.06, 0.2);
  }

  // Tile correct (green)
  function tileCorrect() {
    play(659, 'sine', 0.08, 0.2);
  }

  // Tile present (yellow)
  function tilePresent() {
    play(523, 'sine', 0.08, 0.15);
  }

  // Tile absent (gray)
  function tileAbsent() {
    play(330, 'sine', 0.06, 0.1);
  }

  // Word not found — shake sound
  function notFound() {
    play(200, 'sawtooth', 0.12, 0.2);
    play(180, 'sawtooth', 0.1,  0.15, 0.1);
  }

  // Win word blitz — victory
  function wordWin() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f,i) => play(f, 'sine', 0.12, 0.25, i * 0.1));
  }

  // ── XP & UI sounds ─────────────────────

  // XP gained — sparkle
  function xpGain() {
    play(880,  'sine', 0.06, 0.15);
    play(1100, 'sine', 0.05, 0.12, 0.06);
    play(1320, 'sine', 0.04, 0.1,  0.11);
  }

  // Level up — big fanfare
  function levelUp() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((f, i) => {
      play(f,     'square', 0.15, 0.3, i * 0.09);
      play(f * 2, 'sine',   0.08, 0.2, i * 0.09 + 0.03);
    });
  }

  // Badge unlock — magical shimmer
  function badgeUnlock() {
    [1047, 1319, 1568, 2093, 1568, 1319, 1047].forEach((f, i) =>
      play(f, 'sine', 0.1, 0.15, i * 0.06)
    );
  }

  // Button click — UI tap
  function click() {
    play(700, 'sine', 0.04, 0.1);
  }

  // Hover — very subtle
  function hover() {
    play(900, 'sine', 0.02, 0.06);
  }

  // Notification ping
  function ping() {
    play(1047, 'sine', 0.08, 0.2);
    play(1319, 'sine', 0.06, 0.15, 0.1);
  }

  // Streak — fire crackle
  function streak() {
    playNoise(0.05, 0.1);
    play(300, 'sawtooth', 0.08, 0.2);
    play(400, 'sine', 0.06, 0.15, 0.05);
  }

  // ── Sound toggle UI ─────────────────────
  function injectToggle() {
    const nav = document.querySelector('nav');
    if (!nav || document.getElementById('px-sound-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'px-sound-toggle';
    btn.style.cssText = `
      padding:6px 10px;border-radius:8px;border:1px solid #1e2a40;
      background:#0f1420;color:#94a3b8;cursor:pointer;font-size:16px;
      transition:all .2s;line-height:1;
    `;
    btn.title = enabled ? 'Mute sounds' : 'Enable sounds';
    btn.textContent = enabled ? '🔊' : '🔇';

    btn.addEventListener('click', () => {
      enabled = !enabled;
      localStorage.setItem('px_sound', enabled ? 'true' : 'false');
      btn.textContent = enabled ? '🔊' : '🔇';
      btn.title = enabled ? 'Mute sounds' : 'Enable sounds';
      if (enabled) { click(); }
    });

    // Volume slider
    const volWrap = document.createElement('div');
    volWrap.style.cssText = 'display:flex;align-items:center;gap:6px';
    const vol = document.createElement('input');
    vol.type  = 'range';
    vol.min   = '0';
    vol.max   = '1';
    vol.step  = '0.1';
    vol.value = masterVolume;
    vol.style.cssText = `
      width:60px;accent-color:#3b82f6;cursor:pointer;
      display:${enabled?'block':'none'};
    `;
    vol.addEventListener('input', () => {
      masterVolume = parseFloat(vol.value);
      localStorage.setItem('px_volume', masterVolume);
      play(880, 'sine', 0.05, 0.15);
    });
    btn.addEventListener('click', () => {
      vol.style.display = enabled ? 'block' : 'none';
    });

    volWrap.appendChild(btn);
    volWrap.appendChild(vol);

    const navRight = nav.querySelector('.nav-right') || nav;
    navRight.appendChild(volWrap);
  }

  // Auto-resume on first interaction
  document.addEventListener('click', () => {
    if (ctx?.state === 'suspended') ctx.resume();
  }, { once: true });

  // Init toggle when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

  return {
    // Control
    enable:  () => { enabled = true;  localStorage.setItem('px_sound','true');  },
    disable: () => { enabled = false; localStorage.setItem('px_sound','false'); },
    isEnabled: () => enabled,
    setVolume: v => { masterVolume = v; localStorage.setItem('px_volume', v); },

    // Game
    jump, land, hit, collect, milestone, gameOver,

    // Quiz
    select, correct, wrong, reveal,

    // Word Blitz
    keyPress, keyDelete, submitWord,
    tileCorrect, tilePresent, tileAbsent,
    notFound, wordWin,

    // UI / XP
    xpGain, levelUp, badgeUnlock,
    click, hover, ping, streak,
  };
})();

window.PlayxSound = PlayxSound;
