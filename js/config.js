// ============================================================
// 樂點城市冒險 - 全域設定
// ============================================================

const CONFIG = {
  EVENT_NAME: '樂點城市冒險',
  EVENT_DATE: '2026-04-18',
  EVENT_TIME: '10:00-16:00',

  // GAS API（部署後替換）
  API_URL: {
    READ:  'https://script.google.com/macros/s/AKfycbzpeQtTNq947sQKk5qtIYP6qf7vsf_2vT1tOQcmbqdIcWRYeVF9l_00ZqhpjCn2eN5-rQ/exec',
    WRITE: 'https://script.google.com/macros/s/AKfycbzpeQtTNq947sQKk5qtIYP6qf7vsf_2vT1tOQcmbqdIcWRYeVF9l_00ZqhpjCn2eN5-rQ/exec',
    PHOTO: 'https://script.google.com/macros/s/AKfycbzpeQtTNq947sQKk5qtIYP6qf7vsf_2vT1tOQcmbqdIcWRYeVF9l_00ZqhpjCn2eN5-rQ/exec',
    ADMIN: 'https://script.google.com/macros/s/AKfycbzpeQtTNq947sQKk5qtIYP6qf7vsf_2vT1tOQcmbqdIcWRYeVF9l_00ZqhpjCn2eN5-rQ/exec'
  },

  // 快取 TTL（毫秒）
  CACHE_TTL: {
    teams: 60000,
    scores: 3000,
    rankings: 3000,
    broadcasts: 0,
    gameLocations: 600000,
    config: 300000,
    chat: 0
  },

  // GPS 設定
  GPS: {
    highAccuracy: true,
    maxAge: 5000,
    timeout: 15000,
    accuracyThreshold: 50,
    unlockRadius: 25,        // 25m 內解鎖（點位較近）
    verifyRadius: 30
  },

  // 拍照
  PHOTO: { maxWidth: 1024, quality: 0.7, maxSize: 800000 },

  // 地圖中心（四點中心）
  MAP_CENTER: { lat: 25.006792, lng: 121.202660 },

  // ========== 隊伍 (10 隊) ==========
  TEAMS: [
    { id: 1,  name: '閃電隊', emoji: '⚡' },
    { id: 2,  name: '火焰隊', emoji: '🔥' },
    { id: 3,  name: '星辰隊', emoji: '⭐' },
    { id: 4,  name: '海浪隊', emoji: '🌊' },
    { id: 5,  name: '旋風隊', emoji: '🌪️' },
    { id: 6,  name: '鑽石隊', emoji: '💎' },
    { id: 7,  name: '火箭隊', emoji: '🚀' },
    { id: 8,  name: '雷霆隊', emoji: '🌩️' },
    { id: 9,  name: '彩虹隊', emoji: '🌈' },
    { id: 10, name: '極光隊', emoji: '✨' }
  ],

  // ========== 4 款小遊戲 + GPS 座標 ==========
  GAMES: [
    {
      id: 'photo',
      name: '城市拍拍',
      icon: '📸',
      type: 'photo',
      description: '到達定點後拍攝現場照片上傳，等待管理員驗證通過即得分！',
      points: 200,
      color: '#9C27B0',
      location: { lat: 25.006861, lng: 121.202694 }
    },
    {
      id: 'whack',
      name: '城市快打',
      icon: '🔨',
      type: 'game',
      description: '快速點擊冒出的目標，手速大考驗！',
      duration: 45,
      color: '#FF5722',
      location: { lat: 25.007000, lng: 121.202889 }
    },
    {
      id: 'walk',
      name: '城市漫步',
      icon: '🚶',
      type: 'walk',
      description: '累積移動 500 公尺即可完成任務，邊走邊探索城市！',
      targetDistance: 500,
      points: 200,
      color: '#2196F3',
      location: { lat: 25.006917, lng: 121.202500 }
    },
    {
      id: 'snake',
      name: '貪食蛇',
      icon: '🐍',
      type: 'game',
      description: '控制蛇吃食物，越長分越高！',
      duration: 60,
      color: '#4CAF50',
      location: { lat: 25.006389, lng: 121.202556 }
    }
  ],

  // ========== 問答題庫 ==========
  QUIZ_QUESTIONS: [
    { q: '台灣最高的建築物是？', options: ['台北101', '高雄85大樓', '新光三越', '圓山大飯店'], answer: 0 },
    { q: '台灣面積最大的縣市是？', options: ['花蓮縣', '南投縣', '台東縣', '屏東縣'], answer: 0 },
    { q: '台灣的國花是什麼？', options: ['櫻花', '梅花', '蓮花', '菊花'], answer: 1 },
    { q: '台灣有幾個直轄市？', options: ['4個', '5個', '6個', '7個'], answer: 2 },
    { q: '日月潭位於哪個縣市？', options: ['嘉義縣', '南投縣', '花蓮縣', '台中市'], answer: 1 },
    { q: '台灣最長的河流是？', options: ['大甲溪', '濁水溪', '淡水河', '高屏溪'], answer: 1 },
    { q: '台灣第一條高速公路是？', options: ['國道一號', '國道三號', '國道五號', '台61線'], answer: 0 },
    { q: '阿里山位於哪個縣市？', options: ['嘉義縣', '南投縣', '雲林縣', '台南市'], answer: 0 },
    { q: '台灣的貨幣單位是？', options: ['日圓', '美元', '新台幣', '人民幣'], answer: 2 },
    { q: '墾丁國家公園位於哪裡？', options: ['台東', '屏東', '花蓮', '高雄'], answer: 1 },
    { q: '台灣哪個城市被稱為港都？', options: ['基隆', '高雄', '台中', '台南'], answer: 1 },
    { q: '台灣最大的湖泊是？', options: ['日月潭', '澄清湖', '曾文水庫', '翡翠水庫'], answer: 0 },
    { q: '太魯閣國家公園以什麼地形聞名？', options: ['火山', '峽谷', '沙漠', '草原'], answer: 1 },
    { q: '珍珠奶茶起源於台灣的哪個城市？', options: ['台北', '台中', '台南', '高雄'], answer: 1 },
    { q: '台灣高鐵最北站是？', options: ['台北站', '南港站', '板橋站', '桃園站'], answer: 1 },
    { q: '九份老街位於哪個城市？', options: ['基隆市', '新北市', '台北市', '宜蘭縣'], answer: 1 },
    { q: '台灣的國寶魚是？', options: ['鯉魚', '櫻花鉤吻鮭', '虱目魚', '吳郭魚'], answer: 1 },
    { q: '台灣最南端的地標是？', options: ['鵝鑾鼻燈塔', '墾丁大街', '貓鼻頭', '龍磐公園'], answer: 0 },
    { q: '玉山的海拔約為幾公尺？', options: ['2952', '3492', '3952', '4952'], answer: 2 },
    { q: '台灣的國際機場代碼 TPE 是哪個機場？', options: ['松山機場', '桃園機場', '高雄機場', '台中機場'], answer: 1 }
  ]
};

// TEST MODE
const TEST_MODE = new URLSearchParams(window.location.search).has('test');

// 工具函式
function getTeamById(id) {
  return CONFIG.TEAMS.find(t => t.id === parseInt(id));
}
function getGameById(id) {
  return CONFIG.GAMES.find(g => g.id === id);
}
