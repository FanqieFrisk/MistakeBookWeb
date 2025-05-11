// main.js —— 核心逻辑 & 视图渲染
let currentSection = 'upload-section';
let practiceCategory = '';
let practiceItems = [];
let practiceIndex = 0;

// 切换页面
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentSection = id;
  if (id === 'category-section') renderCategories();
  if (id === 'charts-section') drawAllCharts();
  if (id === 'history-section') renderHistory();
  if (id === 'practice-section') showPracticeItem();
}

// Toast 提示
function showToast(msg = '操作成功！') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = 1;
  setTimeout(() => t.style.opacity = 0, 1000);
}

// 设置按钮
document.getElementById('settings-btn').addEventListener('click', () => {
  showSection('settings-section');
});

//上传图片
document.getElementById('trigger-image-input').addEventListener('click', () => {
    document.getElementById('image-input').click();
  });

// 上传逻辑
document.getElementById('upload-btn').addEventListener('click', async () => {
  const content = document.getElementById('question-input').value.trim();
  const answer  = document.getElementById('answer-input').value.trim();
  const category= document.getElementById('category-select').value;
  const imgIn   = document.getElementById('image-input');
  if (!content || !answer || !category) {
    alert('请填写题目、答案并选择分类~');
    return;
  }
  let imageData = '';
  if (/*!document.getElementById('image-upload-wrapper').classList.contains('hidden') &&*/imgIn.files[0]) {
    imageData = await new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(imgIn.files[0]);
    });
  }
  const item = {
    id: Date.now().toString(),
    content, answer, category,
    timestamp: new Date().toISOString(),
    imageData,
    correctCount: 0,
    deletedFromCategory: false,
    deletedFromHistory: false
  };
  upsertItem(item);
  document.getElementById('question-input').value = '';
  document.getElementById('answer-input').value = '';
  imgIn.value = '';
  showToast('上传成功！');
});

// 渲染左侧分类按钮
function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';
  ['全部','语文','数学','英语','物理','化学','生物','政治','历史','地理','其他']
    .forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.classList.toggle('active', cat === practiceCategory);
      btn.onclick = () => renderCategoryItems(cat);
      list.appendChild(btn);
    });
  document.getElementById('practice-wrapper').classList.add('hidden');
// 默认显示全部分类内容
  renderCategoryItems('全部');
}

// 渲染题目 & 显示做题按钮
function renderCategoryItems(cat) {
  practiceCategory = cat;
  let items;
  if (cat === '全部') {
    items = getAllItems().filter(i => !i.deletedFromCategory);
  } else {
    items = getItemsByCategory(cat);
  }

  const ul = document.getElementById('category-items');
  ul.innerHTML = '';
  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
       .forEach(i => {
         const li = document.createElement('li');
         const imgHTML = i.imageData
           ? `<img src="${i.imageData}" class="preview" alt="预览" style="max-width:60px;max-height:60px;">`
           : '';
         li.innerHTML = `
           ${imgHTML}
           <div>
             <div>${i.content}</div>
             <small>答案：${i.answer}</small>
           </div>
           <button onclick="deleteFromCategoryHandler('${i.id}')">移除</button>
         `;
         //图片点击事件绑定
         li.querySelector('.preview')?.addEventListener('click', function() {
          const modal = document.getElementById('image-modal');
          const modalImg = document.getElementById('modal-image');
          modal.style.display = "block";
          modalImg.src = this.src;
        });
         ul.appendChild(li);
       });

  // 高亮当前按钮
  document.querySelectorAll('.btn-group button')
    .forEach(b => b.classList.toggle('active', b.textContent === cat));

  document.getElementById('practice-wrapper')
    .classList.toggle('hidden', items.length === 0);
}

// 从分类中移除
function deleteFromCategoryHandler(id) {
  if (confirm('确定要从分类中移除这道题？')) {
    deleteFromCategory(id);
    showToast('已从分类移除！');
    // 重新渲染分类列表，保证题目立即消失
    showSection('category-section');
    renderCategoryItems(practiceCategory);
  }
}

// 搜索
document.getElementById('search-input').addEventListener('input', e => {
  const results = searchItems(e.target.value.trim());
  const ul = document.getElementById('search-results');
  ul.innerHTML = '';
  results.forEach(i => {
    const li = document.createElement('li');
    const imgHTML = i.imageData
      ? `<img src="${i.imageData}" class="preview" alt="预览">`
      : '';
    li.innerHTML = `
      ${imgHTML}
      <div>${i.content}</div>
      <button onclick="deleteFromCategoryHandler('${i.id}')">移除</button>
    `;
    ul.appendChild(li);
  });
});

// 历史记录
function renderHistory() {
  const ul = document.getElementById('history-list');
  ul.innerHTML = '';
  getHistoryItems().forEach(i => {
    const date = new Date(i.timestamp).toLocaleString();
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>[${i.category}]</strong> ${i.content}
        <br><small>答案：${i.answer} · ${date}</small>
      </div>
      <button onclick="deleteFromHistoryHandler('${i.id}')">删除</button>
    `;
    ul.appendChild(li);
  });
}
function deleteFromHistoryHandler(id) {
  if (confirm('确定要从历史记录中删除？')) {
    deleteFromHistory(id);
    showToast('历史记录已删除！');
    renderHistory();
  }
}

// 做题练习
document.getElementById('practice-btn').addEventListener('click', () => {
  if (practiceCategory === '全部') {
    practiceItems = getAllItems().filter(i => !i.deletedFromCategory);
  } else {
    practiceItems = getItemsByCategory(practiceCategory);
  }
  if (!practiceItems.length) {
    alert('该分类暂无题目~');
    return;
  }
  practiceIndex = 0;
  showSection('practice-section');
});

function showPracticeItem() {
  if (practiceIndex >= practiceItems.length) {
    alert('本次做题完成！');
    showSection('category-section');
    return;
  }
  const item = practiceItems[practiceIndex];
  document.getElementById('practice-question').textContent = item.content;
  const imgEl = document.getElementById('practice-image');
  imgEl.style.display = item.imageData ? 'block' : 'none';
  imgEl.src = item.imageData || '';
}

document.getElementById('practice-submit-btn').addEventListener('click', () => {
  const userAns = document.getElementById('practice-answer-input').value.trim();
  const item = practiceItems[practiceIndex];
  if (userAns === item.answer) {
    const count = incrementCorrect(item.id);
    showToast(`回答正确！已正确 ${count} 次`);
    practiceIndex++;
  } else {
    alert('回答错误，再接再厉~');
  }
  document.getElementById('practice-answer-input').value = '';
  showPracticeItem();
});

// 页面加载完成后，绑定刷新按钮
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('refresh-btn');
    btn.addEventListener('click', () => {
        location.reload();  // 重新加载当前页面
        });
});

//跳过按钮事件监听
document.getElementById('practice-skip-btn').addEventListener('click', () => {
  practiceIndex++;
  document.getElementById('practice-answer-input').value = '';
  showToast('已跳过本题');
  showPracticeItem();
});

document.addEventListener('click', function(event) {
  // 点击练习图片打开大图
  if (event.target.id === 'practice-image' && event.target.src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    modal.style.display = "block";
    modalImg.src = event.target.src;
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
  }
  
  // 点击关闭按钮或模态背景
  if (event.target.classList.contains('close') || 
      event.target.id === 'image-modal') {
    closeModal();
  }
});

// 新增 ESC 键关闭
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && document.getElementById('image-modal').style.display === 'block') {
    closeModal();
  }
});

function closeModal() {
  const modal = document.getElementById('image-modal');
  modal.style.display = "none";
  document.body.style.overflow = 'auto'; // 恢复滚动
}

document.addEventListener('DOMContentLoaded', () => {
  const settings = getSettings();
  const modal = document.getElementById('tutorial-modal');
  const tutorialChoiceMade = localStorage.getItem('tutorialChoiceMade');

  // 显示条件判断
  if (settings.showTutorialPrompt && !tutorialChoiceMade) {
    modal.style.display = 'flex';
  }

  // 处理按钮点击
  document.getElementById('go-tutorial').addEventListener('click', () => {
    if (!settings.beta) localStorage.setItem('tutorialChoiceMade', 'true');
    window.location.href = 'usage.html';
  });

  document.getElementById('close-tutorial').addEventListener('click', () => {
    if (!settings.beta) localStorage.setItem('tutorialChoiceMade', 'true');
    modal.style.display = 'none';
  });

  // 监听 beta 设置变化
  document.getElementById('beta-toggle').addEventListener('change', (e) => {
    const settings = getSettings();
    settings.beta = e.target.checked;
    if (e.target.checked) {
      localStorage.removeItem('tutorialChoiceMade'); // 开启 beta 时重置选择
    }
    saveSettings(settings);
  });
});

document.getElementById('tutorial-btn').addEventListener('click', () => {
    window.open('usage.html', '_blank');
});

  
// 页面初始显示
showSection('upload-section');
