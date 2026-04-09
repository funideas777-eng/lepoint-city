// ============================================================
// 知識問答 - 限時問答
// ============================================================

const QuizGame = {
  questions: [],
  currentIdx: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  questionTimer: null,
  timePerQ: 8,
  timeLeft: 0,
  answered: false,
  totalQuestions: 15,

  init(game) {
    this.game = game;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.currentIdx = 0;

    this.questions = this.shuffle([...CONFIG.QUIZ_QUESTIONS]).slice(0, this.totalQuestions);

    const canvas = game.canvas;
    canvas.style.display = 'none';
    let container = document.getElementById('quiz-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'quiz-container';
      container.style.cssText = 'padding:16px;width:100%;max-width:400px;margin:0 auto;';
      canvas.parentElement.appendChild(container);
    }

    this.showQuestion();
  },

  showQuestion() {
    if (this.currentIdx >= this.questions.length) {
      this.game.running = false;
      return;
    }

    this.answered = false;
    this.timeLeft = this.timePerQ;
    const q = this.questions[this.currentIdx];
    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:12px;color:var(--text-light)">第 ${this.currentIdx + 1} / ${this.questions.length} 題</div>
        <div id="quiz-timer" style="font-size:24px;font-weight:900;color:var(--primary);margin:8px 0;">${this.timeLeft}</div>
        <div style="height:4px;background:#eee;border-radius:2px;overflow:hidden;margin-bottom:16px;">
          <div id="quiz-bar" style="height:100%;background:var(--primary);width:100%;transition:width 1s linear;"></div>
        </div>
      </div>
      <div style="font-size:16px;font-weight:700;margin-bottom:20px;line-height:1.6;text-align:center;">${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${q.options.map((opt, i) => `
          <button class="quiz-opt" data-idx="${i}" onclick="QuizGame.answer(${i})"
            style="padding:14px 16px;border-radius:12px;border:2px solid #e0e0e0;background:white;
            font-size:14px;text-align:left;cursor:pointer;transition:all 0.2s;">
            ${['A','B','C','D'][i]}. ${opt}
          </button>
        `).join('')}
      </div>
      ${this.streak >= 3 ? `<div style="text-align:center;margin-top:12px;font-size:13px;color:var(--primary);font-weight:600;">🔥 連對 ${this.streak} 題！</div>` : ''}
    `;

    this.startTimer();
  },

  startTimer() {
    if (this.questionTimer) clearInterval(this.questionTimer);
    this.questionTimer = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.getElementById('quiz-timer');
      const barEl = document.getElementById('quiz-bar');
      if (timerEl) timerEl.textContent = this.timeLeft;
      if (barEl) barEl.style.width = (this.timeLeft / this.timePerQ * 100) + '%';

      if (this.timeLeft <= 3 && timerEl) timerEl.style.color = '#f44336';

      if (this.timeLeft <= 0) {
        clearInterval(this.questionTimer);
        if (!this.answered) this.answer(-1);
      }
    }, 1000);
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;
    clearInterval(this.questionTimer);

    const q = this.questions[this.currentIdx];
    const correct = idx === q.answer;
    const buttons = document.querySelectorAll('.quiz-opt');

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) {
        btn.style.background = '#e8f5e9';
        btn.style.borderColor = '#4caf50';
        btn.style.color = '#2e7d32';
      }
      if (i === idx && !correct) {
        btn.style.background = '#ffebee';
        btn.style.borderColor = '#f44336';
        btn.style.color = '#c62828';
      }
    });

    if (correct) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      const speedBonus = Math.ceil(this.timeLeft * 5);
      const streakBonus = Math.min(this.streak * 10, 50);
      const pts = 20 + speedBonus + streakBonus;
      this.score += pts;
      AudioEngine.quizCorrect();
    } else {
      this.streak = 0;
      AudioEngine.quizWrong();
    }

    this.game.score = this.score;
    this.game.combo = this.streak;
    this.game.maxCombo = this.maxStreak;
    this.game.updateHUD();

    this.currentIdx++;
    setTimeout(() => this.showQuestion(), 1200);
  },

  update() {},
  render() {},

  cleanup() {
    if (this.questionTimer) clearInterval(this.questionTimer);
    const container = document.getElementById('quiz-container');
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
