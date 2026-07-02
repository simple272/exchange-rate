/**
* 환율 데이터 JSON을 받아 독립적으로 실행 가능한 HTML 스트링을 생성하는 함수 
* (요일별 조회 타이틀 오른쪽에 라디오 버튼 배치 + 테이블 시간 표기 HH:MM 포맷 통일 버전)
* @param {Object} exchangeData - {"30min": {...}, "1hour": {...}} 형태의 데이터
* @returns {string} 완성된 HTML 문자열
*/
function generateChartHtmlString(exchangeData) {
  // 계층형 데이터를 JSON 문자열로 안전하게 변환하여 삽입
  const dataString = JSON.stringify(exchangeData, null, 2);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>시간별 환율 추이 및 환차익 시뮬레이션</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body {
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
margin: 0;
padding: 10px;
background-color: #f8f9fa;
color: #333;
-webkit-text-size-adjust: none;
}
.container {
max-width: 800px;
margin: 0 auto;
background: #ffffff;
padding: 15px;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.06);
box-sizing: border-box;
}
h2 {
text-align: center;
margin: 5px 0 10px 0;
font-size: 18px;
color: #111;
}

/* ⚙️ 컨트롤러 스타일 */
.config-panel {
background: #eef2f7;
border: 1px solid #dce4ec;
border-radius: 8px;
padding: 10px 12px;
margin-bottom: 15px;
display: flex;
align-items: center;
justify-content: space-between;
gap: 10px;
}
.config-title {
font-size: 13px;
font-weight: bold;
color: #2b3a4a;
display: flex;
align-items: center;
gap: 4px;
}
.config-input-wrapper {
display: flex;
align-items: center;
gap: 6px;
}
.config-input {
width: 50px;
padding: 6px;
border: 1px solid #cbd5e1;
border-radius: 6px;
font-size: 13px;
font-weight: bold;
text-align: center;
}
.config-btn {
background: #007AFF;
color: #fff;
border: none;
padding: 6px 12px;
border-radius: 6px;
font-size: 12px;
font-weight: bold;
cursor: pointer;
transition: background 0.15s;
}
.config-btn:hover {
background: #0056b3;
}
/* 메인 탭 스타일 */
.tabs {
display: flex;
border-bottom: 2px solid #e9ecef;
margin-bottom: 15px;
}
.tab-button {
flex: 1;
padding: 10px 4px;
background: none;
border: none;
font-size: 13px;
font-weight: 600;
color: #868e96;
cursor: pointer;
text-align: center;
transition: all 0.2s;
border-bottom: 2px solid transparent;
margin-bottom: -2px;
}
.tab-button.active {
color: #007AFF;
border-bottom: 2px solid #007AFF;
}
.tab-content {
display: none;
}
.tab-content.active {
display: block;
}

/* 서브 탭 스타일 */
.sub-tabs {
display: flex;
gap: 8px;
margin-bottom: 12px;
}
.sub-tab-button {
flex: 1;
padding: 8px;
background: #f1f3f5;
border: 1px solid #dee2e6;
border-radius: 6px;
font-size: 12px;
font-weight: 600;
color: #495057;
cursor: pointer;
transition: all 0.15s;
}
.sub-tab-button.active {
background: #007AFF;
color: #fff;
border-color: #007AFF;
}

.comparison-wrapper {
min-height: 70px; 
margin-bottom: 10px;
display: flex;
align-items: center;
}
.comparison-result {
width: 100%;
padding: 10px 12px;
border-radius: 8px;
background-color: #e8f4fd;
border-left: 4px solid #007AFF;
font-size: 13px;
font-weight: 600;
color: #0056b3;
box-sizing: border-box;
opacity: 0;
visibility: hidden;
transition: opacity 0.2s ease, visibility 0.2s;
line-height: 1.5; 
}
.comparison-result.active {
opacity: 1;
visibility: visible;
}

.filter-container {
margin-bottom: 15px;
padding: 10px;
background: #f1f3f5;
border-radius: 8px;
}
/* 📅 타이틀 일렬 정렬용 헤더 래퍼 */
.filter-header-flex {
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 10px;
flex-wrap: wrap;
gap: 8px;
}
.filter-title {
font-weight: bold;
font-size: 12px;
color: #495057;
margin-bottom: 0; 
}
/* 우측 무선 콤보 전용 콤팩트 스타일 */
.radio-combo-group {
display: flex;
gap: 4px;
}
.radio-label {
display: flex;
align-items: center;
cursor: pointer;
font-size: 11px;
font-weight: bold;
background: #e9ecef;
padding: 4px 8px;
border-radius: 6px;
border: 1px solid #cbd5e1;
color: #495057;
user-select: none;
transition: all 0.15s;
}
.radio-label input {
margin-right: 3px;
margin-top: -1px;
}
.radio-label:has(input:checked) {
background: #007AFF;
color: #fff;
border-color: #007AFF;
}

.checkbox-group {
display: flex;
flex-wrap: wrap;
gap: 6px;
}
.checkbox-label {
display: flex;
align-items: center;
user-select: none;
cursor: pointer;
font-size: 12px;
background: white;
padding: 5px 10px;
border: 1px solid #dee2e6;
border-radius: 15px;
transition: all 0.15s;
}
.checkbox-label input {
margin-right: 4px;
}
.chart-box {
position: relative;
width: 100%;
overflow-x: auto; 
-webkit-overflow-scrolling: touch; 
background: #fff;
border: 1px solid #efefef;
border-radius: 8px;
}
.chart-wrapper {
position: relative;
height: 50vh;
min-height: 280px;
max-height: 400px;
width: 100%; 
}

/* 투자 시뮬레이션 카드 스타일 */
.rank-list {
display: flex;
flex-direction: column;
gap: 12px;
}
.rank-item {
background: #fff;
border: 1px solid #e9ecef;
border-radius: 8px;
padding: 12px 15px;
display: flex;
flex-direction: column;
gap: 6px;
box-shadow: 0 1px 3px rgba(0,0,0,0.02);
cursor: pointer;
transition: background-color 0.2s, border-color 0.2s;
}
.rank-item:hover {
border-color: #007AFF;
background-color: #fcfdfe;
}
.rank-header {
display: flex;
justify-content: space-between;
align-items: center;
}
.rank-badge {
font-size: 11px;
font-weight: bold;
padding: 3px 8px;
border-radius: 10px;
background: #e8f4fd;
color: #007AFF;
}
.rank-item:nth-child(1) .rank-badge { background: #ffd700; color: #000; font-size: 12px;}
.rank-time {
font-size: 15px;
font-weight: bold;
color: #111;
}
.rank-stats {
font-size: 13px;
color: #495057;
line-height: 1.4;
}
.rank-stats span.profit {
color: #e63946;
font-weight: 600;
}
.rank-stats span.rate {
color: #007AFF;
font-weight: 600;
}

/* 데이터 신뢰도 가이드 */
.data-reliability {
background: #f8f9fa;
border: 1px solid #e9ecef;
border-radius: 6px;
padding: 6px 10px;
font-size: 11px;
color: #666;
margin-top: 4px;
}
.reliability-header {
display: flex;
justify-content: space-between;
margin-bottom: 4px;
}
.reliability-bar-bg {
width: 100%;
height: 4px;
background: #e9ecef;
border-radius: 2px;
overflow: hidden;
}
.reliability-bar-fill {
height: 100%;
background: #20c997;
border-radius: 2px;
transition: width 0.3s;
}
.reliability-warning {
color: #f59f00;
font-weight: bold;
display: inline-flex;
align-items: center;
gap: 2px;
}
/* 다중 상세 가이드 영역 */
.rank-details-group {
display: flex;
flex-direction: column;
gap: 5px;
margin-top: 2px;
}
.rank-details {
font-size: 11px;
padding: 8px 10px;
border-radius: 6px;
line-height: 1.5;
}
.rank-details.profit-focus {
color: #c92a2a;
background: #fff5f5;
border-left: 3px solid #ffc9c9;
}
.rank-details.count-focus {
color: #1c7ed6;
background: #e7f5ff;
border-left: 3px solid #a5d8ff;
}

.rank-chart-container {
display: none;
margin-top: 10px;
padding-top: 12px;
border-top: 1px dashed #dee2e6;
height: 200px;
position: relative;
}
.rank-chart-container.active {
display: block;
}
.chart-instruction {
text-align: center;
font-size: 11px;
color: #007AFF;
margin-top: -2px;
font-weight: 600;
}

/* 📅 요일별 테이블 전용 스타일 */
.table-responsive-wrapper {
width: 100%;
overflow-x: auto; 
-webkit-overflow-scrolling: touch;
border: 1px solid #dee2e6;
border-radius: 8px;
background: #fff;
}
.matrix-table {
width: max-content; 
border-collapse: collapse;
font-size: 12px; 
text-align: center;
}
.matrix-table th, .matrix-table td {
padding: 10px 12px; 
border-bottom: 1px solid #eef2f7;
border-right: 1px solid #eef2f7;
white-space: nowrap; 
min-width: 85px; 
box-sizing: border-box;
}
.matrix-table td:first-child, .matrix-table th:first-child {
position: sticky;
left: 0;
background: #f8f9fa;
font-weight: bold;
border-right: 2px solid #dee2e6;
z-index: 2;
min-width: 65px; 
}

.weekday-badge {
font-size: 10px;
font-weight: normal;
color: #868e96;
display: block;
margin-top: 2px;
}

/* 📈 변동성(상승/하락/유지) 테이블 UI 전용 스타일 */
.td-status-up {
background-color: #fff5f5 !important;
color: #e63946 !important;
font-weight: 500;
}
.td-status-down {
background-color: #f1f7fe !important;
color: #007AFF !important;
font-weight: 500;
}
.td-status-same {
background-color: #ffffff !important;
color: #868e96 !important;
}
.status-tag {
font-size: 9px;
font-weight: bold;
margin-left: 2px;
display: inline-block;
}
</style>
</head>
<body>

<div class="container">
<h2>시간별 환율 분석 시스템</h2>

<div class="config-panel">
<div class="config-title">⚙️ 단기 분석 설정</div>
<div class="config-input-wrapper">
<span>최근</span>
<input type="number" id="inputTargetCount" class="config-input" value="10" min="1" max="100">
<span>회 비교</span>
<button class="config-btn" onclick="handleTargetCountChange()">적용</button>
</div>
</div>
<div class="tabs">
<button class="tab-button active" onclick="switchTab('chart-tab')">📊 시간별 추이</button>
<button class="tab-button" onclick="switchTab('rank-tab')">💰 차익 시뮬</button>
<button class="tab-button" onclick="switchTab('weekday-tab')">📅 요일별 조회</button>
</div>

<div id="chart-tab" class="tab-content active">
<div class="comparison-wrapper">
<div id="comparisonBox" class="comparison-result"></div>
</div>

<div class="filter-container">
<div class="filter-title">💡 시간 선택 (2개 선택 시 자동비교)</div>
<div id="filterGroup" class="checkbox-group"></div>
</div>

<div class="chart-box" id="chartBox">
<div class="chart-wrapper" id="chartWrapper">
<canvas id="exchangeChart"></canvas>
</div>
</div>
</div>

<div id="rank-tab" class="tab-content">
<div class="sub-tabs">
<button id="subTabRecent" class="sub-tab-button active" onclick="switchSubTab('recent')">⏱️ 최근 <span id="textTabCount">10</span>회 분석 기준 정렬</button>
<button id="subTabTotal" class="sub-tab-button" onclick="switchSubTab('total')">📊 전체 기간 통계 기준 정렬</button>
</div>

<div class="chart-instruction">💡 카드를 누르면 상세 분석 가이드와 시뮬레이션 그래프가 펼쳐집니다.</div>
<div style="margin-bottom: 10px;"></div>
<div id="rankList" class="rank-list"></div>
</div>

<div id="weekday-tab" class="tab-content">
<div class="filter-container">
<div class="filter-header-flex">
<div class="filter-title">📅 조회할 요일 선택 (다중 선택 가능)</div>
<div class="radio-combo-group">
<label class="radio-label">
<input type="radio" name="weekdayTimeUnit" value="1hour" checked onchange="handleTimeUnitChange('1hour')"> 1시간
</label>
<label class="radio-label">
<input type="radio" name="weekdayTimeUnit" value="30min" onchange="handleTimeUnitChange('30min')"> 30분
</label>
</div>
</div>
<div id="weekdayFilterGroup" class="checkbox-group">
</div>
</div>
<div class="table-responsive-wrapper">
<table class="matrix-table" id="weekdayMatrixTable">
<thead>
<tr id="tableHeaderRow">
<th>시간</th>
</tr>
</thead>
<tbody id="tableBodyRow">
</tbody>
</table>
</div>
</div>
</div>

<script>
// 구조 개편 대응 데이터 파싱 정형화
const fullGroupedData = ${dataString};
let rawData = fullGroupedData["1hour"] || {}; 
let currentTimeUnit = '1hour'; 

let targetCount = 10; 

const datesSet = new Set();
const hoursSet = new Set(); 
const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

Object.keys(rawData).forEach(key => {
  const parts = key.split(' ');
  if(parts.length === 2) {
    const [date, hourStr] = parts;
    datesSet.add(date);
    hoursSet.add(hourStr); 
  }
});

const labelsDates = Array.from(datesSet).sort();
let allHours = Array.from(hoursSet).sort(); 
let recentNDates = labelsDates.slice(-targetCount);
let selectedWeekdays = [];

const baseWidth = document.getElementById('chartBox').clientWidth || 400;
const dynamicWidth = Math.max(labelsDates.length * 15, baseWidth);
document.getElementById('chartWrapper').style.width = dynamicWidth + 'px';

const distinctColors = [
'#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', 
'#5AC8FA', '#FFCC00', '#FF2D55', '#5856D6', '#1ABC9C', '#E67E22', '#34495E'
];

function getColorByIndex(index) {
  if (index < distinctColors.length) return distinctColors[index];
  const hue = (index * 137.5) % 360;
  return \`hsl(\${hue}, 85%, 50%)\`;
}

// 기존 차트/알림용 가독성 헬퍼 
function formatHourLabel(hourStr) {
  if(!hourStr || hourStr === '없음') return '없음';
  const parts = hourStr.split(':');
  const hInt = parseInt(parts[0], 10);
  if(parts.length < 2) return hInt + '시';
  return parseInt(parts[1], 10) === 0 ? \`\${hInt}시\` : \`\${hInt}시\${parts[1]}분\`;
}

// 📅 요청 사항: 테이블 시간 행 전용 깔끔한 정형화 표기 (00:00 포맷 유지)
function formatCleanTime(hourStr) {
  if(!hourStr) return '-';
  const parts = hourStr.split(':');
  if(parts.length < 2) return hourStr; 
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  return \`\${h}:\${m}\`;
}

const fullDatasets = allHours.map((hour, index) => {
  const color = getColorByIndex(index);
  const dataPoints = labelsDates.map(date => {
    const key = date + " " + hour;
    return rawData[key] !== undefined ? rawData[key] : null;
  });
  const backgroundColor = color.startsWith('hsl') ? color.replace('50%)', '50%, 0.1)') : color + '15';
  return {
    label: formatHourLabel(hour),
    data: dataPoints,
    borderColor: color,
    backgroundColor: backgroundColor,
    borderWidth: 2,
    pointBackgroundColor: color,
    pointRadius: 3,
    tension: 0.1,
    spanGaps: true,
    originalHour: hour
  };
});

// 탭 1 시간 필터 렌더링
const filterGroup = document.getElementById('filterGroup');
allHours.forEach(hour => {
  const label = document.createElement('label');
  label.className = 'checkbox-label';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = hour;
  checkbox.addEventListener('change', updateChartAndComparison);
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(formatHourLabel(hour))); 
  filterGroup.appendChild(label);
});

// 탭 3 요일 필터 생성
const weekdayFilterGroup = document.getElementById('weekdayFilterGroup');
dayNames.forEach(day => {
  const label = document.createElement('label');
  label.className = 'checkbox-label';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = day;
  if (selectedWeekdays.includes(day)) checkbox.checked = true;
  checkbox.addEventListener('change', () => {
    selectedWeekdays = Array.from(document.querySelectorAll('#weekdayFilterGroup input:checked')).map(cb => cb.value);
    renderWeekdayTable();
  });
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(day));
  weekdayFilterGroup.appendChild(label);
});

const ctx = document.getElementById('exchangeChart').getContext('2d');
let exchangeChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labelsDates,
    datasets: JSON.parse(JSON.stringify(fullDatasets))
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { grace: '5%', ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 }, maxRotation: 90, minRotation: 90, autoSkip: false } }
    },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10, padding: 8, font: { size: 11 } } },
      tooltip: {
        itemSort: function(a, b) { return a.datasetIndex - b.datasetIndex; },
        callbacks: {
          footer: function(context) {
            const checkedBoxes = document.querySelectorAll('#filterGroup input:checked');
            if (checkedBoxes.length !== 2) return '';

            if (context.length === 2) {
              const valA = context[0].parsed.y;
              const valB = context[1].parsed.y;
              const diff = (valB - valA).toFixed(4); 
              const absDiff = Math.round(Math.abs(diff) * 100);

              if (diff > 0) {
                return \`\\n▲ 차이: +\${absDiff}틱 (\${context[1].dataset.label}가 더 높음)\`;
              } else if (diff < 0) {
                return \`\\n▼ 차이: -\${absDiff}틱 (\${context[0].dataset.label}가 더 높음)\`;
              } else {
                return \`\\n- 두 시간대 환율 동일\`;
              }
            }
            return '';
          }
        }
      }
    }
  }
});

let calculatedSimulations = [];
let currentSortMode = 'recent'; 
let activeSubCharts = {}; 

function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

window.handleTargetCountChange = function() {
  const inputVal = parseInt(document.getElementById('inputTargetCount').value);
  if (isNaN(inputVal) || inputVal < 1) {
    alert('1 이상의 올바른 숫자를 입력해주세요.');
    return;
  }
  targetCount = inputVal;
  document.getElementById('textTabCount').innerText = targetCount; 
  recentNDates = labelsDates.slice(-targetCount); 
  Object.values(activeSubCharts).forEach(chart => chart.destroy());
  activeSubCharts = {};
  updateChartAndComparison();
  runSimulationEngine();
}

window.handleTimeUnitChange = function(unit) {
  currentTimeUnit = unit;
  renderWeekdayTable();
}

// 초기 엔진 구동 및 렌더링
updateChartAndComparison();
runSimulationEngine(); 
renderWeekdayTable();

const chartBox = document.getElementById('chartBox');
if (chartBox) {
  chartBox.scrollLeft = chartBox.scrollWidth;
}

window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if(tabId === 'weekday-tab') {
    renderWeekdayTable();
  }
}

window.switchSubTab = function(mode) {
  currentSortMode = mode;
  document.getElementById('subTabRecent').classList.toggle('active', mode === 'recent');
  document.getElementById('subTabTotal').classList.toggle('active', mode === 'total');
  Object.values(activeSubCharts).forEach(chart => chart.destroy());
  activeSubCharts = {};
  renderRankList(); 
}

function updateChartAndComparison() {
  const checkedHours = Array.from(document.querySelectorAll('#filterGroup input:checked')).map(cb => cb.value);
  const filteredDatasets = fullDatasets.filter(ds => checkedHours.includes(ds.originalHour));
  exchangeChart.data.datasets = filteredDatasets.length > 0 ? filteredDatasets : fullDatasets;
  exchangeChart.update();

  const compBox = document.getElementById('comparisonBox');
  if (checkedHours.length === 2) {
    const [hourA, hourB] = checkedHours;
    let totalAWin = 0, totalBWin = 0, totalDraw = 0;
    let recentAWin = 0, recentBWin = 0, recentDraw = 0;

    labelsDates.forEach(date => {
      const valA = rawData[\`\${date} \${hourA}\`];
      const valB = rawData[\`\${date} \${hourB}\`];
      if (valA !== undefined && valB !== undefined) {
        if (valA > valB) totalAWin++; else if (valB > valA) totalBWin++; else totalDraw++;
        if (recentNDates.includes(date)) {
          if (valA > valB) recentAWin++; else if (valB > valA) recentBWin++; else recentDraw++;
        }
      }
    });

    const labelA = formatHourLabel(hourA);
    const labelB = formatHourLabel(hourB);

    let totalText = \`<strong>\${labelA}(\${totalAWin}회)</strong> vs <strong>\${labelB}(\${totalBWin}회)</strong>, \` + (totalAWin > totalBWin ? \`<strong>\${labelA}</strong> 우세, 동일(\${totalDraw})\` : totalBWin > totalAWin ? \`<strong>\${labelB}</strong> 우세, 동일(\${totalDraw})\` : \`무승부, 동일(\${totalDraw})\`);
    let recentText = \`<strong>\${labelA}(\${recentAWin}회)</strong> vs <strong>\${labelB}(\${recentBWin}회)</strong>, \` + (recentAWin > recentBWin ? \`<strong>\${labelA}</strong> 우세, 동일(\${recentDraw})\` : recentBWin > recentAWin ? \`<strong>\${labelB}</strong> 우세, 동일(\${recentDraw})\` : \`무승부, 동일(\${recentDraw})\`);
    compBox.innerHTML = \`📊 <strong>전체 기간:</strong> \${totalText}<br>⏱️ <strong>최근 \${targetCount}회:</strong> \${recentText}\`;
    compBox.classList.add('active');
  } else {
    compBox.innerHTML = \`📊 <strong>전체 기간:</strong> <br>⏱️ <strong>최근 \${targetCount}회:</strong> \`;
    compBox.classList.add('active');
  }
}

function renderWeekdayTable() {
    const headerRow = document.getElementById('tableHeaderRow');
    const bodyRow = document.getElementById('tableBodyRow');
    
    headerRow.innerHTML = '<th>시간</th>';
    bodyRow.innerHTML = '';

    const currentSourceData = fullGroupedData[currentTimeUnit] || {};

    const activeHoursSet = new Set();
    Object.keys(currentSourceData).forEach(key => {
        const parts = key.split(' ');
        if(parts.length === 2) activeHoursSet.add(parts[1]);
    });
    const activeHours = Array.from(activeHoursSet).sort();

    const filteredDates = labelsDates.filter(dateStr => {
        const dayNum = new Date(dateStr).getDay();
        const dayName = dayNames[dayNum];
        return selectedWeekdays.includes(dayName);
    }).sort().reverse();

    if (filteredDates.length === 0) {
        bodyRow.innerHTML = \`<tr><td colspan="100%" style="padding: 30px; color: #999;">선택한 요일에 해당하는 데이터가 없습니다.</td></tr>\`;
        return;
    }

    filteredDates.forEach(dateStr => {
        const dayNum = new Date(dateStr).getDay();
        const th = document.createElement('th');
        const displayDate = dateStr.substring(5); 
        th.innerHTML = \`\${displayDate}<span class="weekday-badge">(\${dayNames[dayNum]})</span>\`;
        headerRow.appendChild(th);
    });

    // 💡 [핵심] 현재 부모 바디(bodyRow)에 저장된 기준 시간이 있는지 확인합니다.
    const selectedBaselineHour = bodyRow.getAttribute('data-selected-hour') || null;

    // 💡 날짜별 기준 값을 담아둘 오브젝트 (특정 시간이 선택되었을 때만 사용)
    const baselineValuesPerDate = {};
    if (selectedBaselineHour) {
        filteredDates.forEach(dateStr => {
            baselineValuesPerDate[dateStr] = currentSourceData[dateStr + " " + selectedBaselineHour];
        });
    }

    activeHours.forEach((hour, hIdx) => {
        const tr = document.createElement('tr');
        const tdHour = document.createElement('td');
        
        // ⏱️ 요철 없는 HH:MM 포맷으로 렌더링
        tdHour.innerText = formatCleanTime(hour);
        
        // 스타일 및 클릭이 가능함을 알려주는 시각적 효과 추가
        tdHour.style.cursor = 'pointer';
        tdHour.style.fontWeight = 'bold';
        
        // 만약 이 시간이 현재 선택된 기준 시간이라면 하이라이트 표시
        if (hour === selectedBaselineHour) {
            tdHour.style.backgroundColor = '#e6f7ff'; 
            tdHour.innerText += ' 🎯'; // 기준점 표시 (선택 사항)
        }

        // 💡 [클릭 이벤트] 시간 셀을 누르면 발생하는 로직
        tdHour.addEventListener('click', () => {
            if (selectedBaselineHour === hour) {
                // 이미 선택된 시간을 또 누르면 -> 선택 해제 (기존 모드로 복귀)
                bodyRow.removeAttribute('data-selected-hour');
            } else {
                // 새로운 시간을 누르면 -> 해당 시간을 기준으로 세팅
                bodyRow.setAttribute('data-selected-hour', hour);
            }
            // 🔄 다시 본인 함수를 호출해 테이블을 새로고침합니다.
            renderWeekdayTable();
        });

        tr.appendChild(tdHour);

        filteredDates.forEach(dateStr => {
            const tdData = document.createElement('td');
            const key = dateStr + " " + hour; 

            if (currentSourceData[key] !== undefined) {
                const currentVal = currentSourceData[key];
                tdData.innerText = currentVal;

                // 💡 비교할 기준값(compareVal) 찾기
                let compareVal = undefined;

                if (selectedBaselineHour) {
                    // 1. 특정 시간이 선택된 상태라면 -> 그 시간의 데이터와 누적 비교
                    compareVal = baselineValuesPerDate[dateStr];
                    // 본인 시간 열은 비교 표시 제외
                    if (hour === selectedBaselineHour) compareVal = undefined; 
                } else {
                    // 2. 아무것도 선택 안 된 평소 상태 -> 직전 시간과 비교 (기존 로직)
                    if (hIdx > 0) {
                        const prevHour = activeHours[hIdx - 1];
                        compareVal = currentSourceData[dateStr + " " + prevHour];
                    }
                }

                // 💡 증감 마크 표시 로직
                if (compareVal !== undefined) {
                    const diff = Number(((currentVal - compareVal)* 100).toFixed(3)) ;
                    if (diff > 0) {
                        tdData.className = 'td-status-up';
                        tdData.innerHTML = \`\${currentVal}<span class="status-tag">▲(\${diff})</span>\`;
                    } else if (diff < 0) {
                        tdData.className = 'td-status-down';
                        tdData.innerHTML = \`\${currentVal}<span class="status-tag">▼(\${diff})</span>\`;
                    } else {
                        tdData.className = 'td-status-same';
                        tdData.innerHTML = \`\${currentVal}<span class="status-tag" style="color:#aaa;">-</span>\`;
                    }
                }

            } else {
                tdData.innerText = '-';
                tdData.className = 'empty-cell';
            }
            tr.appendChild(tdData);
        });

        bodyRow.appendChild(tr);
    });
}


function runSimulationEngine() {
  calculatedSimulations = [];
  const maxGlobalDays = labelsDates.length;
  const maxRecentDays = Math.min(targetCount, maxGlobalDays); 

  allHours.forEach((buyHour, buyIdx) => {
    const targetSellHours = allHours.slice(buyIdx + 1);
    
    if (targetSellHours.length === 0) {
      calculatedSimulations.push({ 
        buyHour, 
        isLast: true,
        sellHourMetrics: {},
        totalRate: 0, totalAvgProfit: 0, recentRate: 0, recentMedianProfit: 0,
        totalValidDays: 0, totalMissing: maxGlobalDays, totalDataFillRate: 0, maxGlobalDays,
        recentValidDays: 0, recentMissing: maxRecentDays, recentDataFillRate: 0, maxRecentDays
      });
      return;
    }

    let totalValidDays = 0, totalWins = 0, totalMaxProfitSum = 0;
    let recentValidDays = 0, recentWins = 0;
    const totalDayMaxProfits = [];
    const recentDayMaxProfits = [];

    const sellHourMetrics = {};
    targetSellHours.forEach(h => { 
      sellHourMetrics[h] = { 
        totalWinCount: 0, totalProfitSum: 0, 
        recentWinCount: 0, recentProfitSum: 0,
        totalProfits: [], recentProfits: [] ,
        totalCurrentStreak: 0, totalMaxStreak: 0,
        totalCurrentStart: null, totalMaxStart: null, totalMaxEnd: null,
        recentCurrentStreak: 0, recentMaxStreak: 0,
        recentCurrentStart: null, recentMaxStart: null, recentMaxEnd: null
      };
    });

    labelsDates.forEach(date => {
      const buyVal = rawData[\`\${date} \${buyHour}\`];
      if (buyVal === undefined) {
        targetSellHours.forEach(sellHour => {
          const m = sellHourMetrics[sellHour];
          if (m.totalCurrentStreak > m.totalMaxStreak) {
            m.totalMaxStreak = m.totalCurrentStreak; m.totalMaxStart = m.totalCurrentStart; m.totalMaxEnd = m.lastValidDate;
          }
          m.totalCurrentStreak = 0; m.totalCurrentStart = null;

          if (m.recentCurrentStreak > m.recentMaxStreak) {
            m.recentMaxStreak = m.recentCurrentStreak; m.recentMaxStart = m.recentCurrentStart; m.recentMaxEnd = m.lastValidDate;
          }
          m.recentCurrentStreak = 0; m.recentCurrentStart = null;
        });
        return; 
      }

      const availableSellHours = targetSellHours.filter(sh => rawData[\`\${date} \${sh}\`] !== undefined);
      if (availableSellHours.length === 0) return; 

      const isRecent = recentNDates.includes(date); 
      totalValidDays++;
      if (isRecent) recentValidDays++;

      targetSellHours.forEach(sellHour => {
        if (rawData[\`\${date} \${sellHour}\`] === undefined) {
          const m = sellHourMetrics[sellHour];
          if (m.totalCurrentStreak > m.totalMaxStreak) {
            m.totalMaxStreak = m.totalCurrentStreak; m.totalMaxStart = m.totalCurrentStart; m.totalMaxEnd = m.lastValidDate;
          }
          m.totalCurrentStreak = 0; m.totalCurrentStart = null;

          if (m.recentCurrentStreak > m.recentMaxStreak) {
            m.recentMaxStreak = m.recentCurrentStreak; m.recentMaxStart = m.recentCurrentStart; m.recentMaxEnd = m.lastValidDate;
          }
          m.recentCurrentStreak = 0; m.recentCurrentStart = null;
          return;
        }

        const sellVal = rawData[\`\${date} \${sellHour}\`];
        const profit = sellVal - buyVal;
        const m = sellHourMetrics[sellHour];
        if (profit > 0) {
          m.totalWinCount++;
          m.totalProfitSum += profit;
          m.totalProfits.push(Math.round(profit * 100));
          if (m.totalCurrentStreak === 0) m.totalCurrentStart = date;
          m.totalCurrentStreak++;
          m.lastValidDate = date; 
        } else {
          if (m.totalCurrentStreak > m.totalMaxStreak) {
            m.totalMaxStreak = m.totalCurrentStreak; m.totalMaxStart = m.totalCurrentStart; m.totalMaxEnd = m.lastValidDate;
          }
          m.totalCurrentStreak = 0; m.totalCurrentStart = null;
        }

        if (isRecent) {
          if (profit > 0) {
            m.recentWinCount++;
            m.recentProfitSum += profit;
            m.recentProfits.push(Math.round(profit * 100));
            if (m.recentCurrentStreak === 0) m.recentCurrentStart = date;
            m.recentCurrentStreak++;
            m.lastValidDate = date;
          } else {
            if (m.recentCurrentStreak > m.recentMaxStreak) {
              m.recentMaxStreak = m.recentCurrentStreak; m.recentMaxStart = m.recentCurrentStart; m.recentMaxEnd = m.lastValidDate;
            }
            m.recentCurrentStreak = 0; m.recentCurrentStart = null;
          }
        } else {
          if (m.recentCurrentStreak > m.recentMaxStreak) {
            m.recentMaxStreak = m.recentCurrentStreak; m.recentMaxStart = m.recentCurrentStart; m.recentMaxEnd = m.lastValidDate;
          }
          m.recentCurrentStreak = 0; m.recentCurrentStart = null;
        }
      });

      let dayMaxProfit = 0;
      let hasValidTrade = false;
      targetSellHours.forEach(sellHour => {
        if (rawData[\`\${date} \${sellHour}\`] !== undefined) {
          const profit = rawData[\`\${date} \${sellHour}\`] - buyVal;
          if (profit > dayMaxProfit) dayMaxProfit = profit;
          hasValidTrade = true;
        }
      });

      if (hasValidTrade && dayMaxProfit > 0) {
        totalWins++;
        totalMaxProfitSum += dayMaxProfit;
        totalDayMaxProfits.push(Math.round(dayMaxProfit * 100));
        if (isRecent) {
          recentWins++;
          recentDayMaxProfits.push(Math.round(dayMaxProfit * 100));
        }
      }
    });

    targetSellHours.forEach(sellHour => {
      const m = sellHourMetrics[sellHour];
      if (m.totalCurrentStreak > m.totalMaxStreak) {
        m.totalMaxStreak = m.totalCurrentStreak; m.totalMaxStart = m.totalCurrentStart; m.totalMaxEnd = m.lastValidDate;
      }
      if (m.recentCurrentStreak > m.recentMaxStreak) {
        m.recentMaxStreak = m.recentCurrentStreak; m.recentMaxStart = m.recentCurrentStart; m.recentMaxEnd = m.lastValidDate;
      }
    });

    const totalRate = totalValidDays > 0 ? ((totalWins / totalValidDays) * 100).toFixed(1) : 0;
    const totalAvgProfit = totalWins > 0 ? (totalMaxProfitSum / totalWins * 100).toFixed(0) : 0;
    const recentRate = recentValidDays > 0 ? ((recentWins / recentValidDays) * 100).toFixed(1) : 0;
    const recentMedianProfit = recentDayMaxProfits.length > 0 ? getMedian(recentDayMaxProfits).toFixed(0) : 0;

    let totalBestProfitHour = '없음', totalBestProfitVal = -1;
    let totalBestCountHour = '없음', totalBestCountVal = -1;
    Object.entries(sellHourMetrics).forEach(([h, m]) => {
      const avgProfit = m.totalWinCount > 0 ? (m.totalProfitSum / m.totalWinCount) : 0;
      if (avgProfit > totalBestProfitVal) { totalBestProfitVal = avgProfit; totalBestProfitHour = h; }
      if (m.totalWinCount > totalBestCountVal) { totalBestCountVal = m.totalWinCount; totalBestCountHour = h; }
    });

    let recentBestProfitHour = '없음', recentBestProfitVal = -1;
    let recentBestCountHour = '없음', recentBestCountVal = -1;
    Object.entries(sellHourMetrics).forEach(([h, m]) => {
      const medianProfit = m.recentProfits.length > 0 ? getMedian(m.recentProfits) : 0;
      if (medianProfit > recentBestProfitVal) { recentBestProfitVal = medianProfit; recentBestProfitHour = h; }
      if (m.recentWinCount > recentBestCountVal) { recentBestCountVal = m.recentWinCount; recentBestCountHour = h; }
    });

    const totalMissing = maxGlobalDays - totalValidDays;
    const totalDataFillRate = maxGlobalDays > 0 ? Math.round((totalValidDays / maxGlobalDays) * 100) : 0;
    const recentMissing = maxRecentDays - recentValidDays;
    const recentDataFillRate = maxRecentDays > 0 ? Math.round((recentValidDays / maxRecentDays) * 100) : 0;

    calculatedSimulations.push({
      buyHour,
      totalRate: parseFloat(totalRate),
      totalAvgProfit: parseInt(totalAvgProfit),
      recentRate: parseFloat(recentRate),
      recentMedianProfit: parseInt(recentMedianProfit),
      totalValidDays, totalMissing, totalDataFillRate, maxGlobalDays,
      recentValidDays, recentMissing, recentDataFillRate, maxRecentDays,
      totalBestProfitHour, totalBestProfitTick: Math.round(totalBestProfitVal * 100),
      totalBestCountHour, totalBestCountVal,
      recentBestProfitHour, recentBestProfitTick: Math.round(recentBestProfitVal), 
      recentBestCountHour, recentBestCountVal,
      sellHourMetrics,
      isLast: false
    });
  });

  renderRankList();
}

window.toggleCardChart = function(cardElement, buyHour) {
  const chartContainer = cardElement.querySelector('.rank-chart-container');
  if (!chartContainer) return;

  const isActive = chartContainer.classList.contains('active');
  if (isActive) {
    chartContainer.classList.remove('active');
    return;
  }

  chartContainer.classList.add('active');
  if (activeSubCharts[buyHour]) { activeSubCharts[buyHour].update(); return; }

  const dataObj = calculatedSimulations.find(item => item.buyHour === buyHour);
  if (!dataObj || !dataObj.sellHourMetrics) return;

  const labels = Object.keys(dataObj.sellHourMetrics).map(h => formatHourLabel(h));
  const countData = [];
  const profitData = [];
  const streakData = Object.values(dataObj.sellHourMetrics).map(metric => {
    return currentSortMode === 'recent' 
      ? { streak: metric.recentMaxStreak, start: metric.recentMaxStart, end: metric.recentMaxEnd }
      : { streak: metric.totalMaxStreak, start: metric.totalMaxStart, end: metric.totalMaxEnd };
  });

  Object.values(dataObj.sellHourMetrics).forEach(metric => {
    if (currentSortMode === 'recent') {
      countData.push(metric.recentWinCount);
      profitData.push(metric.recentProfits.length > 0 ? getMedian(metric.recentProfits) : 0);
    } else {
      countData.push(metric.totalWinCount);
      profitData.push(metric.totalWinCount > 0 ? Math.round((metric.totalProfitSum / metric.totalWinCount) * 100) : 0);
    }
  });

  const canvasCtx = document.getElementById(\`subChart-\${buyHour.replace(':', '_')}\`).getContext('2d');
  activeSubCharts[buyHour] = new Chart(canvasCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: '익절 기회 (회)', data: countData, backgroundColor: '#007AFF25', borderColor: '#007AFF', borderWidth: 1, yAxisID: 'yCount', order: 2 },
        { label: currentSortMode === 'recent' ? '차익 중앙값 (틱)' : '평균 차익 (틱)', data: profitData, type: 'line', borderColor: '#e63946', backgroundColor: '#e63946', borderWidth: 2, pointRadius: 3, tension: 0.1, yAxisID: 'yProfit', order: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { size: 9 } } },
        yCount: { type: 'linear', position: 'left', title: { display: true, text: '횟수', font: { size: 9 } }, ticks: { font: { size: 9 }, beginAtZero: true, stepSize: 1 } },
        yProfit: { type: 'linear', position: 'right', title: { display: true, text: '틱(Tick)', font: { size: 9 } }, grid: { drawOnChartArea: false }, ticks: { font: { size: 9 }, beginAtZero: true } }
      },
      plugins: { 
        legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 }, padding: 4 } },
        tooltip: {
          callbacks: {
            footer: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const item = streakData[index];
              if (item && item.streak > 0) {
                return \`🔥 최대 연속 성공: \${item.streak}일 연속\\n (\${item.start} ~ \${item.end})\`;
              }
              return ' 연속 성공 기록 없음';
            }
          }
        }
      }
    }
  });
}

function renderRankList() {
  const rankListContainer = document.getElementById('rankList');
  rankListContainer.innerHTML = '';

  const displayData = [...calculatedSimulations];
  displayData.sort((a, b) => {
    if (a.isLast) return 1;
    if (b.isLast) return -1;

    if (currentSortMode === 'recent') {
      if (b.recentRate !== a.recentRate) return b.recentRate - a.recentRate;
      const aCount = a.recentBestCountVal || 0;
      const bCount = b.recentBestCountVal || 0;
      if (bCount !== aCount) return bCount - aCount;
      const aStreak = a.sellHourMetrics[a.recentBestCountHour]?.recentMaxStreak || 0;
      const bStreak = b.sellHourMetrics[b.recentBestCountHour]?.recentMaxStreak || 0;
      return bStreak - aStreak;
    } else {
      if (b.totalRate !== a.totalRate) return b.totalRate - a.totalRate;
      const aCount = a.totalBestCountVal || 0;
      const bCount = b.totalBestCountVal || 0;
      if (bCount !== aCount) return bCount - aCount;
      const aStreak = a.sellHourMetrics[a.totalBestCountHour]?.totalMaxStreak || 0;
      const bStreak = b.sellHourMetrics[b.totalBestCountHour]?.totalMaxStreak || 0;
      return bStreak - aStreak;
    }
  });

  displayData.forEach((res, idx) => {
    const card = document.createElement('div');
    card.className = 'rank-item';

    const labelBuy = formatHourLabel(res.buyHour);

    if (res.isLast) {
      card.style.cursor = 'default';
      card.innerHTML = \`
<div class="rank-header">
<span class="rank-time" style="color: #868e96;">📥 \${labelBuy} 매수</span>
<span class="rank-badge" style="background:#e9ecef; color:#868e96;">제외</span>
</div>
<div class="rank-stats" style="color: #868e96;">당일 이 시간 이후에 비교 가능한 데이터가 없습니다.</div>\`;
    } else {
      card.setAttribute('onclick', \`toggleCardChart(this, '\${res.buyHour}')\`);
      let statsHtml = '', detailsHtml = '';
      const reliabilityHtml = currentSortMode === 'recent' 
? \`
<div class="data-reliability">
<div class="reliability-header">
<span>📋 유효 데이터: <strong>\${res.recentValidDays}일</strong> / 총 \${res.maxRecentDays}일 (누락: \${res.recentMissing}일)</span>
<span>참여율 \${res.recentDataFillRate}% \${res.recentValidDays < 3 ? '<span class="reliability-warning">⚠️ 표본부족 경고</span>' : ''}</span>
</div>
<div class="reliability-bar-bg">
<div class="reliability-bar-fill" style="width: \${res.recentDataFillRate}%; background: \${res.recentValidDays < 3 ? '#ff9f43' : '#20c997'};"></div>
</div>
</div>\`
: \`
<div class="data-reliability">
<div class="reliability-header">
<span>📋 유효 데이터: <strong>\${res.totalValidDays}일</strong> / 총 \${res.maxGlobalDays}일 (누락: \${res.totalMissing}일)</span>
<span>참여율 \${res.totalDataFillRate}% \${res.totalValidDays < 5 ? '<span class="reliability-warning">⚠️ 표본부족</span>' : ''}</span>
</div>
<div class="reliability-bar-bg">
<div class="reliability-bar-fill" style="width: \${res.totalDataFillRate}%;"></div>
</div>
</div>\`;

      if (currentSortMode === 'recent') {
        statsHtml = \`
⏱️ 최근 \${targetCount}회 익절 확률: <span class="rate">\${res.recentRate}%</span><br>
📈 익절 성공시 **차익 중앙값(Median)**: <span class="profit">+\${res.recentMedianProfit} 틱</span>\`;
        const pMetric = res.sellHourMetrics[res.recentBestProfitHour] || {};
        const cMetric = res.sellHourMetrics[res.recentBestCountHour] || {};
        const pStreakText = pMetric.recentMaxStreak > 0 ? \` (최대 \${pMetric.recentMaxStreak}일 연속: \${pMetric.recentMaxStart}~\${pMetric.recentMaxEnd})\` : '';
        const cStreakText = cMetric.recentMaxStreak > 0 ? \` (최대 \${cMetric.recentMaxStreak}일 연속: \${cMetric.recentMaxStart}~\${cMetric.recentMaxEnd})\` : '';

        detailsHtml = \`
<div class="rank-details-group">
<div class="rank-details profit-focus">
🎯 <strong>[최고수익] 주로 \${formatHourLabel(res.recentBestProfitHour)} 매도</strong>할 때 기대 차익 최대 (+\${res.recentBestProfitTick}틱)\${pStreakText}
</div>
<div class="rank-details count-focus">
🛡️ <strong>[최다익절] 주로 \${formatHourLabel(res.recentBestCountHour)} 매도</strong>할 때 확률 최고 (\${res.recentBestCountVal}회 성공)\${cStreakText}
</div>
</div>\`;
      } else {
        statsHtml = \`
📊 전체 기간 익절 확률: <span class="rate" style="color:#34C759;">\${res.totalRate}%</span><br>
📈 익절 성공시 평균 최고 차익: <span class="profit">+\${res.totalAvgProfit} 틱</span>\`;
        const pMetric = res.sellHourMetrics[res.totalBestProfitHour] || {};
        const cMetric = res.sellHourMetrics[res.totalBestCountHour] || {};
        
        // 🛠️ 오류 수정: totalBestProfitHour/CountHour에 맞는 연속 기록(pMetric, cMetric)을 사용하도록 매핑 변경
        const pStreakText = pMetric.totalMaxStreak > 0 ? \` (최대 \${pMetric.totalMaxStreak}일 연속: \${pMetric.totalMaxStart}~\${pMetric.totalMaxEnd})\` : '';
        const cStreakText = cMetric.totalMaxStreak > 0 ? \` (최대 \${cMetric.totalMaxStreak}일 연속: \${cMetric.totalMaxStart}~\${cMetric.totalMaxEnd})\` : '';

        detailsHtml = \`
<div class="rank-details-group">
<div class="rank-details profit-focus">
🎯 <strong>[최고수익] 주로 \${formatHourLabel(res.totalBestProfitHour)} 매도</strong>할 때 최대 이익 (평균 +\${res.totalBestProfitTick}틱)\${pStreakText}
</div>
<div class="rank-details count-focus">
🛡️ <strong>[최다익절] 주로 \${formatHourLabel(res.totalBestCountHour)} 매도</strong>할 때 확률 최고 (\${res.totalBestCountVal}회 성공)\${cStreakText}
</div>
</div>\`;
      }

      const canvasId = \`subChart-\${res.buyHour.replace(':', '_')}\`;

      card.innerHTML = \`
<div class="rank-header">
<span class="rank-time">📥 <strong>\${labelBuy}</strong> 매수 (\${currentSortMode === 'recent' ? '단기' : '장기'})</span>
<span class="rank-badge" style="\${currentSortMode === 'total' ? 'background:#34C759; color:#fff;' : ''}">\${idx + 1}위</span>
</div>
<div class="rank-stats">\${statsHtml}</div>
\${detailsHtml}
\${reliabilityHtml}
<div class="rank-chart-container" onclick="event.stopPropagation();">
<canvas id="\${canvasId}"></canvas>
</div>\`;
    }
    rankListContainer.appendChild(card);
  });
}
</script>

</body>
</html>`;
}


const fs = require('fs');
const file = './vnd_data.json';
try {
    const fileContent = fs.readFileSync(file, 'utf-8');
    const exchangeData = JSON.parse(fileContent);
    console.log(`성공적으로 읽음: ${file}`);
    const html = generateChartHtmlString(exchangeData)
    fs.writeFileSync('./index.html', html, 'utf-8');
    console.log('사이트 생성 완료')
} catch (jsonErr) {
    console.error(`JSON 파싱 에러 (${file}):`, jsonErr.message);
}



