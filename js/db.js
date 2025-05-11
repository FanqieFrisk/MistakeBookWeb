// db.js —— 本地数据管理
const STORAGE_KEY = 'mistakebook_data';
const SETTINGS_KEY = 'mistakebook_settings';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveData(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

//图片处理逻辑
function upsertItem(item) {
  const arr = getData();
  const idx = arr.findIndex(i => i.id === item.id);
  // 移除无效图片校验逻辑，直接保存原始数据
  if (item.imageData) { // 仅保留非空判断
    item.imageData = item.imageData;
  }
  if (idx >= 0) arr[idx] = item;
  else arr.push(item);
  saveData(arr);
}

// 删除（历史/分类）操作改为打 flag
function deleteFromHistory(id) {
  const arr = getData();
  const item = arr.find(i => i.id === id);
  if (item) { item.deletedFromHistory = true; saveData(arr); }
}
function deleteFromCategory(id) {
  const arr = getData();
  const item = arr.find(i => i.id === id);
  if (item) { item.deletedFromCategory = true; saveData(arr); }
}

// 取 Active 分类题目
function getItemsByCategory(cat) {
  return getData().filter(i => i.category === cat && !i.deletedFromCategory);
}

// 取历史记录（不含已标记历史删除的）
function getHistoryItems() {
  return getData().filter(i => !i.deletedFromHistory)
    .sort((a,b)=> b.timestamp.localeCompare(a.timestamp));
}

// 全部（含已移除的）
function getAllItems() {
  return getData();
}

// 搜索只搜 Active
function searchItems(keyword) {
  return getData().filter(i =>
    !i.deletedFromCategory &&
    (i.content.includes(keyword) || i.answer.includes(keyword))
  );
}

// 正确次数 & 阈值逻辑
function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { beta: false, threshold: 3 };
}
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function incrementCorrect(id) {
    const arr = getData();
    const item = arr.find(i => i.id === id);
    if (!item) return false;
    item.correctCount = (item.correctCount || 0) + 1;
    const { threshold } = getSettings();
    if (item.correctCount >= threshold) {
      item.deletedFromCategory = true;
    }
    saveData(arr);
    return item.correctCount;
  }
  
