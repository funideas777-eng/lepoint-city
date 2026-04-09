// ============================================================
// 記憶翻牌 - 配對動物卡片
// ============================================================

const MemoryGame = {
  cards: [],
  flipped: [],
  matched: 0,
  totalPairs: 0,
  score: 0,
  round: 1,
  flips: 0,
  locked: false,
  cols: 4,
  rows: 4,

  EMOJIS: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🦁','🐯','🐮','🐷','🐸','🐵','🦄','🐙','🦋'],

  init(game) {
    this.game = game;
    this.score = 0;
    this.round = 1;
    this.startRound();
  },

  startRound() {
    this.flipped = [];
    this.matched = 0;
    this.flips = 0;
    this.locked = false;

    if (this.round === 1) { this.cols = 4; this.rows = 4; }
    else { this.cols = 5; this.rows = 4; }

    this.totalPairs = (this.cols * this.rows) / 2;
    const emojis = this.shuffle([...this.EMOJIS]).slice(0, this.totalPairs);
    const deck = this.shuffle([...emojis, ...emojis]);

    this.cards = deck.map((emoji, i) => ({
      id: i, emoji, flipped: false, matched: false
    }));

    this.renderCards();
  },

  renderCards() {
    const canvas = this.game.canvas;
    canvas.style.display = 'none';
    let container = document.getElementById('memory-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'memory-container';
      canvas.parentElement.appendChild(container);
    }

    container.style.cssText = `display:grid;grid-template-columns:repeat(${this.cols},1fr);gap:8px;padding:8px;width:100%;max-width:400px;margin:0 auto;`;

    container.innerHTML = this.cards.map(c => `
      <div class="mem-card" data-id="${c.id}" onclick="MemoryGame.flipCard(${c.id})"
        style="aspect-ratio:1;border-radius:10px;font-size:${this.cols >= 5 ? '24' : '28'}px;display:flex;align-items:center;justify-content:center;
        background:${c.matched ? '#e8f5e9' : c.flipped ? 'white' : 'linear-gradient(135deg,var(--primary),var(--accent))'};
        box-shadow:0 2px 8px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.2s;user-select:none;">
        ${c.flipped || c.matched ? c.emoji : '❓'}
      </div>
    `).join('');
  },

  flipCard(id) {
    if (this.locked) return;
    const card = this.cards[id];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    this.flipped.push(card);
    this.flips++;
    this.renderCards();
    AudioEngine.cardFlip();

    if (this.flipped.length === 2) {
      this.locked = true;
      const [a, b] = this.flipped;

      if (a.emoji === b.emoji) {
        a.matched = true;
        b.matched = true;
        this.matched++;
        const bonus = Math.max(10 - Math.floor(this.flips / 2), 2);
        this.score += 20 + bonus;
        this.game.score = this.score;
        this.game.updateHUD();
        AudioEngine.cardMatch();

        this.flipped = [];
        this.locked = false;
        this.renderCards();

        if (this.matched === this.totalPairs) {
          const timeBonus = Math.floor(this.game.timeLeft * 2);
          this.score += timeBonus;
          this.game.score = this.score;
          this.game.updateHUD();

          this.round++;
          setTimeout(() => this.startRound(), 1000);
        }
      } else {
        AudioEngine.cardMiss();
        setTimeout(() => {
          a.flipped = false;
          b.flipped = false;
          this.flipped = [];
          this.locked = false;
          this.renderCards();
        }, 800);
      }
    }
  },

  update() {},
  render() {},

  cleanup() {
    const container = document.getElementById('memory-container');
    if (container) container.remove();
    if (this.game.canvas) this.game.canvas.style.display = 'block';
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
