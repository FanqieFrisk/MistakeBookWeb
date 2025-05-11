// settings.js —— Beta + 阈值 + 🌙 深色模式切换功能
document.addEventListener('DOMContentLoaded', () => {
  const betaToggle = document.getElementById('beta-toggle');
  const thresholdInput = document.getElementById('threshold-input');
  const wrapper = document.getElementById('image-upload-wrapper');
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  // 增强获取设置函数
  function getSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const defaultSettings = { 
      beta: false,
      threshold: 3,
      darkMode: false,
      showTutorialPrompt: true  // 新增教程提示开关
    };
    return raw ? Object.assign(defaultSettings, JSON.parse(raw)) : defaultSettings;
  }

  const settings = getSettings();

  // Beta模式初始化设置
  betaToggle.checked = settings.beta;
  thresholdInput.value = settings.threshold;
  wrapper.classList.toggle('hidden', !settings.beta);
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  // Beta开关
  betaToggle.addEventListener('change', () => {
    settings.beta = betaToggle.checked;
    // 当开启beta时重置教程选择
    if (settings.beta) {
      localStorage.removeItem('tutorialChoiceMade');
    }
    saveSettings(settings);
    wrapper.classList.toggle('hidden', !settings.beta);
  });

  // 阈值输入
  thresholdInput.addEventListener('input', () => {
    const v = parseInt(thresholdInput.value) || 1;
    settings.threshold = v;
    saveSettings(settings);
  });

  // 深色模式开关
  darkModeToggle.addEventListener('change', () => {
    settings.darkMode = darkModeToggle.checked;
    saveSettings(settings);
    document.body.classList.toggle('dark-mode', settings.darkMode);
  });
});
