// chart.js —— 图表绘制（仅统计 Active 项）
function drawAllCharts() {
    drawPieChart();
    drawLineChart();
  }
  
  function drawPieChart() {
    const data = getAllItems().filter(i => !i.deletedFromCategory);
    const counts = {};
    ['语文','数学','英语','物理','化学','生物','政治','历史','地理','其他']
      .forEach(cat => counts[cat] = 0);
    data.forEach(i => counts[i.category]++);
    new Chart(document.getElementById('pie-chart').getContext('2d'), {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts) }]
      }
    });
  }
  
  function drawLineChart() {
    const data = getAllItems().filter(i => !i.deletedFromCategory);
    const map = {};
    data.forEach(i => {
      const d = i.timestamp.slice(0,10);
      map[d] = (map[d]||0) + 1;
    });
    const dates = Object.keys(map).sort();
    const counts= dates.map(d=>map[d]);
    new Chart(document.getElementById('line-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '每日上传量',
          data: counts,
          fill: false,
          tension: 0.3
        }]
      },
      options:{ scales:{ y:{ beginAtZero:true } } }
    });
  }
  