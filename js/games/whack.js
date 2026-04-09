// ============================================================
// 城市快打 - 打地鼠
// ============================================================

const WhackGame = {
  holes: [],
  score: 0,
  combo: 0,
  maxCombo: 0,
  spawnTimer: null,
  spawnInterval: 1000,

  TARGETS: ['😀','🤪','🤩','🥳','😎','🤓'],
  RARE: '🌟',
  DANGER: '💀',

  init(game) {
    this.game = game;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.spawnInterval = 1000;
    this.holes = Array(9).fill(null);

    this.renderBoard();
    this.startSpawning();
  },

  renderBoard() {
    const canvas = this.game.canvas;
    canvas.style.display = 'none';
    let container = document.getElementById('whack-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'whack-container';
      canvas.parentElement.appendChild(container);
    }

    container.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px;width:100%;max-width:360px;margin:0 auto;';

    container.innerHTML = this.holes.map((h, i) => `
      <div class="whack-hole" data-idx="${i}" onclick="WhackGame.hit(${i})"
        style="aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;
        font-size:40px;background:${h ? '#fff3e0' : '#f5f5f5'};box-shadow:inset 0 4px 8px rgba(0,0,0,0.1);
        cursor:pointer;transition:background 0.1s;user-select:none;">
        ${h ? h.emoji : ''}
      </div>
    `).join('');
  },

  startSpawning() {
    const spawn = () => {
      if (!this.game.running) return;

      const emptyHoles = this.holes.map((h, i) => h === null ? i : -1).filter(i => i >= 0);
      if (emptyHoles.length > 0) {
        const idx = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
        const rand = Math.random();
        let emoji, points, duration;

        if (rand < 0.05) {
          emoji = this.RARE; points = 50; duration = 1200;
        } else if (rand < 0.20) {
          emoji = this.DANGER; points = -30; duration = 1800;
        } else {
          emoji = this.TARGETS[Math.floor(Math.random() * this.TARGETS.length)];
          points = 10; duration = 1800;
        }

        this.holes[idx] = { emoji, points, timer: setTimeout(() => {
          this.holes[idx] = null;
          this.renderBoard();
        }, duration)};

        this.renderBoard();
      }

      this.spawnInterval = Math.max(400, this.spawnInterval - 5);
      this.spawnTimer = setTimeout(spawn, this.spawnInterval);
    };

    this.spawnTimer = setTimeout(spawn, 500);
  },

  hit(idx) {
    const target = this.holes[idx];
    if (!target) return;

    clearTimeout(target.timer);

    if (target.emoji === this.DANGER) {
      this.score = Math.max(0, this.score + target.points);
      this.combo = 0;
      AudioEngine.penalty();
      this.showEffect(idx, '✕', '#f44336');
    } else {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const bonus = Math.min(this.combo * 2, 20);
      this.score += target.points + bonus;
      AudioEngine.whackHit();
      AudioEngine.comboHit(this.combo);
      this.showEffect(idx, '+' + (target.points + bonus), '#4caf50');
    }

    this.holes[idx] = null;
    this.game.score = this.score;
    this.game.combo = this.combo;
    this.game.maxCombo = this.maxCombo;
    this.game.updateHUD();
    this.renderBoard();
  },

  showEffect(idx, text, color) {
    const container = document.getElementById('whack-container');
    if (!container) return;
    const hole = container.children[idx];
    if (!hole) return;
    const eff = document.createElement('div');
    eff.style.cssText = `position:absolute;color:${color};font-weight:900;font-size:18px;pointer-events:none;animation:fadeIn 0.3s ease;`;
    eff.textContent = text;
    hole.style.position = 'relative';
    hole.appendChild(eff);
    setTimeout(() => eff.remove(), 600);
  },

  update() {},
  render() {},

  cleanup() {
    if (this.spawnTimer) clearTimeout(this.spawnTimer);
    this.holes.forEach(h => { if (h && h.timer) clearTimeout(h.timer); });
    const container = document.getElementById('whack-container');
    if (container) container.remove();
    if (this.game.canvas) this.game.canvas.style.display = 'block';
  }
};
