// ============================================================
// 貪食蛇
// ============================================================

const SnakeGame = {
  snake: [],
  food: null,
  goldenFood: null,
  direction: 'right',
  nextDirection: 'right',
  score: 0,
  speed: 150,
  cellSize: 20,
  cols: 0,
  rows: 0,
  moveTimer: null,
  goldenTimer: null,
  touchStartX: 0,
  touchStartY: 0,

  FOOD_EMOJIS: ['🍎','🍊','🍋','🍇','🍓','🍒'],

  init(game) {
    this.game = game;
    this.score = 0;
    this.speed = 150;
    this.direction = 'right';
    this.nextDirection = 'right';

    const canvas = game.canvas;
    this.cols = Math.floor(canvas.width / this.cellSize);
    this.rows = Math.floor(canvas.height / this.cellSize);

    const midX = Math.floor(this.cols / 2);
    const midY = Math.floor(this.rows / 2);
    this.snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];

    this.spawnFood();
    this.setupControls(canvas);
    this.startMoving();

    this.goldenTimer = setInterval(() => {
      if (game.running && !this.goldenFood) {
        this.goldenFood = this.randomEmpty();
      }
    }, 20000);
  },

  setupControls(canvas) {
    this._touchStart = (e) => {
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
    };
    this._touchEnd = (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && this.direction !== 'left') this.nextDirection = 'right';
        else if (dx < 0 && this.direction !== 'right') this.nextDirection = 'left';
      } else {
        if (dy > 0 && this.direction !== 'up') this.nextDirection = 'down';
        else if (dy < 0 && this.direction !== 'down') this.nextDirection = 'up';
      }
    };
    canvas.addEventListener('touchstart', this._touchStart, { passive: true });
    canvas.addEventListener('touchend', this._touchEnd, { passive: true });
  },

  startMoving() {
    const move = () => {
      if (!this.game.running) return;
      this.direction = this.nextDirection;
      const head = { ...this.snake[0] };

      switch (this.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }

      if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
        this.die(); return;
      }
      if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
        this.die(); return;
      }

      this.snake.unshift(head);

      let ate = false;
      if (this.food && head.x === this.food.x && head.y === this.food.y) {
        const pts = 10 * Math.ceil(this.snake.length / 5);
        this.score += pts;
        this.spawnFood();
        ate = true;
        AudioEngine.snakeEat();
        if (this.snake.length % 5 === 0) this.speed = Math.max(60, this.speed - 10);
      } else if (this.goldenFood && head.x === this.goldenFood.x && head.y === this.goldenFood.y) {
        this.score += 50;
        this.goldenFood = null;
        ate = true;
        AudioEngine.scoreUp();
      }

      if (!ate) this.snake.pop();

      this.game.score = this.score;
      this.game.updateHUD();
      this.moveTimer = setTimeout(move, this.speed);
    };
    this.moveTimer = setTimeout(move, this.speed);
  },

  die() {
    AudioEngine.snakeDie();
    this.game.running = false;
  },

  spawnFood() {
    this.food = this.randomEmpty();
    this.food.emoji = this.FOOD_EMOJIS[Math.floor(Math.random() * this.FOOD_EMOJIS.length)];
  },

  randomEmpty() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
    } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  },

  update() {},

  render() {
    const ctx = this.game.ctx;
    const canvas = this.game.canvas;
    const cs = this.cellSize;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        ctx.strokeRect(x * cs, y * cs, cs, cs);
      }
    }

    this.snake.forEach((s, i) => {
      const alpha = 1 - (i / this.snake.length) * 0.5;
      ctx.fillStyle = i === 0 ? '#4CAF50' : `rgba(76,175,80,${alpha})`;
      ctx.fillRect(s.x * cs + 1, s.y * cs + 1, cs - 2, cs - 2);
    });

    if (this.food) {
      ctx.font = (cs - 4) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.food.emoji, this.food.x * cs + cs / 2, this.food.y * cs + cs / 2);
    }

    if (this.goldenFood) {
      ctx.font = (cs - 2) + 'px serif';
      ctx.fillText('⭐', this.goldenFood.x * cs + cs / 2, this.goldenFood.y * cs + cs / 2);
    }
  },

  cleanup() {
    if (this.moveTimer) clearTimeout(this.moveTimer);
    if (this.goldenTimer) clearInterval(this.goldenTimer);
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.removeEventListener('touchstart', this._touchStart);
      canvas.removeEventListener('touchend', this._touchEnd);
    }
  }
};
