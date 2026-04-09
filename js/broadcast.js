// ============================================================
// 廣播系統 - 接收管理員廣播 + 通知
// ============================================================

const Broadcast = {
  messages: [],
  lastTimestamp: null,
  unreadCount: 0,
  pollTimer: null,

  init() {
    const saved = localStorage.getItem('lepoint_broadcasts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.messages = parsed.messages || [];
        this.lastTimestamp = parsed.lastTimestamp || null;
      } catch {}
    }
    this.startPolling();
  },

  startPolling() {
    const poll = () => {
      if (document.hidden) return;
      this.fetchBroadcasts();
    };
    poll();
    const interval = 5000 + Math.random() * 3000;
    this.pollTimer = setInterval(poll, interval);
  },

  async fetchBroadcasts() {
    try {
      const params = {
        action: 'getBroadcasts',
        since: this.lastTimestamp || ''
      };
      const data = await API.get('getBroadcasts', params, 0);
      if (data && data.broadcasts && data.broadcasts.length > 0) {
        data.broadcasts.forEach(b => {
          const exists = this.messages.some(m => m.broadcastId === b.broadcastId);
          if (!exists) {
            this.messages.push(b);
            this.unreadCount++;
            this.showNotification(b);
          }
        });
        if (this.messages.length > 50) {
          this.messages = this.messages.slice(-50);
        }
        const last = data.broadcasts[data.broadcasts.length - 1];
        this.lastTimestamp = last.timestamp;
        this.save();
        this.updateBadge();
      }
    } catch {}
  },

  save() {
    try {
      localStorage.setItem('lepoint_broadcasts', JSON.stringify({
        messages: this.messages,
        lastTimestamp: this.lastTimestamp
      }));
    } catch {}
  },

  showNotification(msg) {
    AudioEngine.notification();
    const bar = document.getElementById('notification-bar');
    if (!bar) return;
    const icon = msg.type === 'image' ? '📷' : msg.type === 'location' ? '📍' : '📢';
    bar.innerHTML = `<span>${icon} ${msg.content.substring(0, 60)}</span>`;
    bar.classList.add('show');
    setTimeout(() => bar.classList.remove('show'), 8000);
  },

  updateBadge() {
    const badge = document.getElementById('broadcast-badge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  },

  openMessages() {
    this.unreadCount = 0;
    this.updateBadge();
    const panel = document.getElementById('message-panel');
    if (!panel) return;

    let html = `<div class="top-bar" style="position:sticky;top:0;z-index:10;">
      <button class="top-bar-back" onclick="Broadcast.closeMessages()">←</button>
      <div class="top-bar-title">📢 系統通知</div>
      <div style="width:40px;"></div>
    </div>`;

    if (this.messages.length === 0) {
      html += '<div style="text-align:center;color:#999;padding:60px 20px"><div style="font-size:48px;margin-bottom:12px">📭</div><div>目前沒有訊息</div><div style="font-size:12px;margin-top:8px">管理員發送的廣播會顯示在這裡</div></div>';
    } else {
      html += '<div style="padding:16px;">';
      [...this.messages].reverse().forEach(m => {
        const icon = m.type === 'image' ? '📷' : m.type === 'location' ? '📍' : '📢';
        const time = new Date(m.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        html += `<div style="background:white;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <div style="font-size:13px;color:#999;margin-bottom:6px">${icon} ${time}</div>
          <div style="font-size:14px;line-height:1.6">${m.content}</div>
        </div>`;
      });
      html += '</div>';
    }

    panel.innerHTML = html;
    panel.classList.add('show');
  },

  closeMessages() {
    const panel = document.getElementById('message-panel');
    if (panel) panel.classList.remove('show');
  }
};
