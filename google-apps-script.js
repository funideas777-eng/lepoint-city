// ============================================================
// 樂點城市冒險 - Google Apps Script 後端
// ============================================================

const SPREADSHEET_ID = '';  // 建立後填入
const DRIVE_FOLDER_ID = ''; // 建立後填入
const ADMIN_PASSWORD = '11201120';

// ========== 路由 ==========
function doGet(e) {
  const action = e.parameter.action;
  const handlers = {
    getTeams: handleGetTeams,
    getPlayer: handleGetPlayer,
    getGameScores: handleGetGameScores,
    getTeamRankings: handleGetTeamRankings,
    getBroadcasts: handleGetBroadcasts,
    getGameLocations: handleGetGameLocations,
    getUnlocks: handleGetUnlocks,
    getConfig: handleGetConfig,
    getDashboard: handleGetDashboard,
    getChat: handleGetChat,
    getTeamLocations: handleGetTeamLocations,
    getPlayerTasks: handleGetPlayerTasks
  };

  const handler = handlers[action];
  if (!handler) return jsonResponse({ error: 'Unknown action: ' + action });

  try {
    return jsonResponse(handler(e.parameter));
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch { return jsonResponse({ error: 'Invalid JSON' }); }

  const action = body.action;
  const handlers = {
    register: handleRegister,
    unlockGame: handleUnlockGame,
    submitScore: handleSubmitScore,
    uploadPhoto: handleUploadPhoto,
    broadcast: handleBroadcast,
    verifyPhoto: handleVerifyPhoto,
    addManualPoints: handleAddManualPoints,
    recalcTeamPoints: handleRecalcTeamPoints,
    sendChat: handleSendChat,
    updateLocation: handleUpdateLocation
  };

  const handler = handlers[action];
  if (!handler) return jsonResponse({ error: 'Unknown action: ' + action });

  try {
    return jsonResponse(handler(body));
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== 工具 ==========
function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function getCache() {
  return CacheService.getScriptCache();
}

// ========== GET 處理 ==========
function handleGetTeams(params) {
  const cache = getCache();
  const cached = cache.get('teams');
  if (cached) return JSON.parse(cached);

  const sheet = getSheet('Teams');
  const data = sheet.getDataRange().getValues();
  const teams = data.slice(1).map(r => ({
    teamId: r[0], teamName: r[1], teamEmoji: r[2], totalPoints: r[3] || 0
  }));

  cache.put('teams', JSON.stringify({ teams }), 60);
  return { teams };
}

function handleGetPlayer(params) {
  const sheet = getSheet('Players');
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === params.playerId);
  if (!row) return { error: 'Player not found' };
  return { player: { playerId: row[0], name: row[1], teamId: row[2], registeredAt: row[3] }};
}

function handleGetGameScores(params) {
  const gameId = params.gameId;
  const limit = parseInt(params.limit) || 20;

  const cache = getCache();
  const cacheKey = 'scores_' + gameId;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const sheet = getSheet('GameScores');
  const data = sheet.getDataRange().getValues();
  const scores = data.slice(1)
    .filter(r => r[3] === gameId)
    .map(r => ({ playerId: r[0], playerName: r[1], teamId: r[2], gameId: r[3], score: r[4], timestamp: r[5] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const result = { scores };
  cache.put(cacheKey, JSON.stringify(result), 5);
  return result;
}

function handleGetTeamRankings(params) {
  const cache = getCache();
  const cached = cache.get('rankings');
  if (cached) return JSON.parse(cached);

  const sheet = getSheet('Teams');
  const data = sheet.getDataRange().getValues();
  const rankings = data.slice(1)
    .map(r => ({ teamId: r[0], teamName: r[1], teamEmoji: r[2], totalPoints: r[3] || 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const result = { rankings };
  cache.put('rankings', JSON.stringify(result), 10);
  return result;
}

function handleGetBroadcasts(params) {
  const since = params.since || '';
  const sheet = getSheet('Broadcasts');
  const data = sheet.getDataRange().getValues();
  let broadcasts = data.slice(1).map(r => ({
    broadcastId: r[0], type: r[1], content: r[2], timestamp: r[3]
  }));

  if (since) broadcasts = broadcasts.filter(b => b.timestamp > since);
  broadcasts.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
  return { broadcasts: broadcasts.slice(-20) };
}

function handleGetGameLocations(params) {
  return {
    locations: [
      { gameId: 'memory', lat: 25.006861, lng: 121.202694, radius: 25 },
      { gameId: 'whack', lat: 25.007000, lng: 121.202889, radius: 25 },
      { gameId: 'quiz', lat: 25.006917, lng: 121.202500, radius: 25 },
      { gameId: 'snake', lat: 25.006389, lng: 121.202556, radius: 25 }
    ]
  };
}

function handleGetUnlocks(params) {
  const playerId = params.playerId;
  const sheet = getSheet('GameUnlocks');
  const data = sheet.getDataRange().getValues();
  const unlocks = data.slice(1)
    .filter(r => r[0] === playerId)
    .map(r => ({ gameId: r[1], unlockedAt: r[2] }));
  return { unlocks };
}

function handleGetConfig(params) {
  return { eventName: '樂點城市冒險', eventDate: '2026-04-18', eventTime: '10:00-16:00' };
}

function handleGetDashboard(params) {
  if (params.password !== ADMIN_PASSWORD) return { error: 'Unauthorized' };
  const players = getSheet('Players').getLastRow() - 1;
  const plays = getSheet('GameScores').getLastRow() - 1;
  const unlocks = getSheet('GameUnlocks').getLastRow() - 1;
  return { totalPlayers: Math.max(0, players), totalPlays: Math.max(0, plays), totalUnlocks: Math.max(0, unlocks) };
}

function handleGetChat(params) {
  const channel = params.channel || 'world';
  const teamId = params.teamId;
  const since = params.since || '';

  const sheet = getSheet('Chat');
  if (!sheet) return { messages: [] };
  const data = sheet.getDataRange().getValues();

  let messages = data.slice(1).map(r => ({
    msgId: r[0], channel: r[1], teamId: r[2], playerId: r[3],
    playerName: r[4], teamName: r[5], teamEmoji: r[6],
    content: r[7], timestamp: r[8]
  }));

  if (channel === 'team') {
    messages = messages.filter(m => m.channel === 'team' && String(m.teamId) === String(teamId));
  } else {
    messages = messages.filter(m => m.channel === 'world');
  }

  if (since) messages = messages.filter(m => m.timestamp > since);
  return { messages: messages.slice(-50) };
}

function handleGetTeamLocations(params) {
  const teamId = params.teamId;
  const sheet = getSheet('PlayerLocations');
  if (!sheet) return { locations: [] };
  const data = sheet.getDataRange().getValues();
  const now = new Date().getTime();
  const locations = data.slice(1)
    .filter(r => String(r[2]) === String(teamId) && (now - new Date(r[4]).getTime()) < 120000)
    .map(r => ({ playerId: r[0], playerName: r[1], teamId: r[2], lat: r[3], lng: r[4], timestamp: r[5] }));
  return { locations };
}

function handleGetPlayerTasks(params) {
  const playerId = params.playerId;
  const unlockSheet = getSheet('GameUnlocks');
  const scoreSheet = getSheet('GameScores');

  const unlockData = unlockSheet.getDataRange().getValues();
  const scoreData = scoreSheet.getDataRange().getValues();

  const unlocked = new Set(unlockData.slice(1).filter(r => r[0] === playerId).map(r => r[1]));
  const played = new Set(scoreData.slice(1).filter(r => r[0] === playerId).map(r => r[3]));

  const tasks = ['memory', 'whack', 'quiz', 'snake'].map(gid => ({
    gameId: gid,
    unlocked: unlocked.has(gid),
    played: played.has(gid)
  }));

  return { tasks };
}

// ========== POST 處理 ==========
function handleRegister(body) {
  const sheet = getSheet('Players');
  sheet.appendRow([body.playerId, body.name, body.teamId, new Date().toISOString()]);
  getCache().remove('teams');
  return { success: true };
}

function handleUnlockGame(body) {
  const sheet = getSheet('GameUnlocks');
  sheet.appendRow([body.playerId, body.gameId, new Date().toISOString(), body.lat || '', body.lng || '']);
  return { success: true };
}

function handleSubmitScore(body) {
  const sheet = getSheet('GameScores');
  sheet.appendRow([body.playerId, body.playerName, body.teamId, body.gameId, body.score, new Date().toISOString()]);

  getCache().remove('scores_' + body.gameId);
  getCache().remove('rankings');

  updateGameBonusForGame(body.gameId);
  return { success: true };
}

function updateGameBonusForGame(gameId) {
  const scoreSheet = getSheet('GameScores');
  const scoreData = scoreSheet.getDataRange().getValues();

  const gameScores = scoreData.slice(1).filter(r => r[3] === gameId);
  const teamBest = {};
  gameScores.forEach(r => {
    const tid = r[2];
    const score = r[4];
    if (!teamBest[tid] || score > teamBest[tid]) teamBest[tid] = score;
  });

  const sorted = Object.entries(teamBest).sort((a, b) => b[1] - a[1]);
  const bonusPoints = [300, 200, 100];

  const pointsSheet = getSheet('TeamPoints');
  const pointsData = pointsSheet.getDataRange().getValues();

  // 移除舊的遊戲獎勵
  for (let i = pointsData.length - 1; i >= 1; i--) {
    if (pointsData[i][1] === 'game_bonus_' + gameId) {
      pointsSheet.deleteRow(i + 1);
    }
  }

  // 加入新的
  sorted.slice(0, 3).forEach(([tid, score], idx) => {
    pointsSheet.appendRow([parseInt(tid), 'game_bonus_' + gameId, bonusPoints[idx], `${gameId} 第${idx + 1}名`, new Date().toISOString()]);
  });

  recalcAllTeamPoints();
}

function recalcAllTeamPoints() {
  const pointsSheet = getSheet('TeamPoints');
  const pointsData = pointsSheet.getDataRange().getValues();

  const teamTotals = {};
  pointsData.slice(1).forEach(r => {
    const tid = r[0];
    teamTotals[tid] = (teamTotals[tid] || 0) + (r[2] || 0);
  });

  const teamSheet = getSheet('Teams');
  const teamData = teamSheet.getDataRange().getValues();
  for (let i = 1; i < teamData.length; i++) {
    const tid = teamData[i][0];
    teamSheet.getRange(i + 1, 4).setValue(teamTotals[tid] || 0);
  }

  getCache().remove('teams');
  getCache().remove('rankings');
}

function handleUploadPhoto(body) {
  try {
    const blob = Utilities.newBlob(Utilities.base64Decode(body.photoData), 'image/jpeg', 'photo_' + Date.now() + '.jpg');
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = 'https://drive.google.com/uc?id=' + file.getId();
    return { success: true, photoUrl: url };
  } catch (e) {
    return { error: e.message };
  }
}

function handleBroadcast(body) {
  if (body.password !== ADMIN_PASSWORD) return { error: 'Unauthorized' };
  const sheet = getSheet('Broadcasts');
  sheet.appendRow([Date.now(), body.type || 'text', body.content, new Date().toISOString()]);
  return { success: true };
}

function handleVerifyPhoto(body) {
  if (body.password !== ADMIN_PASSWORD) return { error: 'Unauthorized' };
  return { success: true };
}

function handleAddManualPoints(body) {
  if (body.password !== ADMIN_PASSWORD) return { error: 'Unauthorized' };
  const sheet = getSheet('TeamPoints');
  sheet.appendRow([body.teamId, 'manual', body.points, body.detail || '', new Date().toISOString()]);
  recalcAllTeamPoints();
  return { success: true };
}

function handleRecalcTeamPoints(body) {
  if (body.password !== ADMIN_PASSWORD) return { error: 'Unauthorized' };
  recalcAllTeamPoints();
  return { success: true };
}

function handleSendChat(body) {
  const sheet = getSheet('Chat');
  sheet.appendRow([
    Date.now(), body.channel, body.teamId, body.playerId,
    body.playerName, body.teamName, body.teamEmoji,
    body.content, new Date().toISOString()
  ]);
  return { success: true };
}

function handleUpdateLocation(body) {
  const sheet = getSheet('PlayerLocations');
  const data = sheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.playerId) {
      sheet.getRange(i + 1, 4).setValue(body.lat);
      sheet.getRange(i + 1, 5).setValue(body.lng);
      sheet.getRange(i + 1, 6).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([body.playerId, body.playerName, body.teamId, body.lat, body.lng, new Date().toISOString()]);
  }

  return { success: true };
}

// ========== 初始化試算表 ==========
function initSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheets = {
    'Teams': ['teamId', 'teamName', 'teamEmoji', 'totalPoints'],
    'Players': ['playerId', 'name', 'teamId', 'registeredAt'],
    'GameScores': ['playerId', 'playerName', 'teamId', 'gameId', 'score', 'timestamp'],
    'GameUnlocks': ['playerId', 'gameId', 'unlockedAt', 'lat', 'lng'],
    'TeamPoints': ['teamId', 'source', 'points', 'detail', 'timestamp'],
    'Broadcasts': ['broadcastId', 'type', 'content', 'timestamp'],
    'Config': ['key', 'value'],
    'Chat': ['msgId', 'channel', 'teamId', 'playerId', 'playerName', 'teamName', 'teamEmoji', 'content', 'timestamp'],
    'PlayerLocations': ['playerId', 'playerName', 'teamId', 'lat', 'lng', 'timestamp']
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (!existing[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  });

  // 建立 10 隊
  const teamSheet = ss.getSheetByName('Teams');
  if (teamSheet.getLastRow() <= 1) {
    const teams = [
      [1, '閃電隊', '⚡', 0],
      [2, '火焰隊', '🔥', 0],
      [3, '星辰隊', '⭐', 0],
      [4, '海浪隊', '🌊', 0],
      [5, '旋風隊', '🌪️', 0],
      [6, '鑽石隊', '💎', 0],
      [7, '火箭隊', '🚀', 0],
      [8, '雷霆隊', '🌩️', 0],
      [9, '彩虹隊', '🌈', 0],
      [10, '極光隊', '✨', 0]
    ];
    teamSheet.getRange(2, 1, teams.length, 4).setValues(teams);
  }

  Logger.log('初始化完成！');
}
