const fs = require('fs');
const path = require('path');
    
function formatDateString(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
const date = formatDateString(process.argv[2]); // "2026-06-01"
const us_conversion_rate = 0.0038;

function readExchangeData(exchange, date) {
    const fileContent = fs.readFileSync(`exchange_data/${exchange}-${date}.json`, 'utf-8');
    return JSON.parse(fileContent);
}

const vndRates = readExchangeData("VND", date);
const usdRates = readExchangeData("USD", date);

// 2. 계산을 위해 [날짜, 값] 배열로 변환 및 정렬
const sortedVNDData = Object.entries(vndRates)
  .map(([date, val]) => [date, parseFloat(val)])
  .sort((a, b) => a[0].localeCompare(b[0]));
const sortedUSDData = Object.entries(usdRates)
  .map(([date, val]) => [date, parseFloat(val)])
  .sort((a, b) => a[0].localeCompare(b[0]));

// 3. 데이터 매핑 (날짜별로 순회)
const chart_usd = [];
const chart_raw_usd = []; 
const chart_vnd = [];
const chart_labels = [];

sortedUSDData.forEach((item, index) => {
  if (index < 19) return;
  const convertedUsd = (item[1] * us_conversion_rate).toFixed(4);
  chart_usd.push(Number(convertedUsd)); 
  chart_raw_usd.push(item[1]); 
});

sortedVNDData.forEach((item, index) => {
  if (index < 19) return;
  const date = item[0];
  const vnd = item[1];
  chart_vnd.push(vnd);
  chart_labels.push(`"${date}"`);
});

// HTML 템플릿 반환
const html = 
`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom"></script>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f6fa;
            overflow-x: hidden; 
            overflow-y: auto; 
        }
        
        .chart-container {
            position: relative; 
            width: 100vw;       
            height: 48vh;       
            margin-top: 10px;
        }

        .table-container {
            padding: 15px;
            margin-bottom: 40px;
        }

        .table-header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .table-title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .table-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            padding-left: 5px;
            border-left: 4px solid #4A4FA6;
        }

        /* 타이머 스타일 추가 */
        .refresh-timer {
            font-size: 11px;
            color: #718096;
            background-color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-variant-numeric: tabular-nums;
        }

        .selector-box {
            display: flex;
            gap: 10px;
            font-size: 13px;
        }
        .selector-box label {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            color: #555;
            font-weight: 500;
        }
        .selector-box input[type="radio"] {
            accent-color: #4A4FA6; 
            margin: 0;
            width: 15px;
            height: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            font-size: 12px; 
            text-align: center;
        }

        th {
            background-color: #f8f9fa;
            color: #333;
            padding: 12px 2px;
            font-weight: 600;
            border-bottom: 2px solid #eef0f3;
            border-right: 1px solid #eef0f3;
        }
        th:last-child { border-right: none; }

        td {
            padding: 12px 2px;
            border-bottom: 1px solid #eef0f3;
            border-right: 1px solid #eef0f3;
            color: #444;
            font-variant-numeric: tabular-nums; 
        }
        td:last-child { border-right: none; }

        .up {
            color: #d9383a !important;
            background-color: #fff5f5;
        }
        .down {
            color: #2b6cb0 !important;
            background-color: #ebf8ff;
        }
        .stable {
            color: #718096;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <canvas id="myChart"></canvas>
    </div>

    <div class="table-container">
        <div class="table-header-box">
            <div class="table-title-wrap">
                <div class="table-title">시간대별 평균 데이터 현황</div>
                <div id="timerDisplay" class="refresh-timer">30초</div>
            </div>
            <div class="selector-box">
                <label>
                    <input type="radio" name="timeUnit" value="30m" checked onchange="onChangeUnit()"> 30분 단위
                </label>
                <label>
                    <input type="radio" name="timeUnit" value="1h" onchange="onChangeUnit()"> 1시간 단위
                </label>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>시간대 범위</th>
                    <th>VND 평균</th>
                    <th>VND 중위값</th>
                    <th>USD 평균</th>
                    <th>USD 중위값</th>
                    <th>원화 평균</th>
                </tr>
            </thead>
            <tbody id="averageTableBody">
                </tbody>
        </table>
    </div>

    <script>
        const labels = [${chart_labels.join(',')}];
        const totalCnt = labels.length;
        
        const usdData = [${chart_usd.join(',')}];
        const vndData = [${chart_vnd.join(',')}];
        const rawUsdData = [${chart_raw_usd.join(',')}];
    
        // 1. Chart.js 초기화
        new Chart(document.getElementById('myChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'vnd', data: vndData, borderColor: 'green', borderDash: [5,5], borderWidth: 1.5, pointRadius: 0, fill: false },
                    { label: 'usd', data: usdData, borderColor: '#4A4FA6', borderWidth: 2.5, pointRadius: 0, fill: false }
                ]
            },
            options: {
                interaction: { mode: 'index', intersect: false },
                responsive: true,
                maintainAspectRatio: false, 
                layout: { padding: { left: 10, right: 25, top: 20, bottom: 10 } },
                elements: { point: { hitRadius: 30, hoverRadius: 6 } },
                plugins: {
                    zoom: {
                        zoom: { pinch: { enabled: true }, mode: 'x' },
                        pan: { enabled: true, mode: 'x' }
                    },
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: {
                        enabled: true,
                        position: 'nearest',
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                let value = context.parsed.y;
                                if (label === 'usd') {
                                    let rawUsd = rawUsdData[context.dataIndex];
                                    return \`\${label}: \${value} (원화: \${rawUsd})\`;
                                }
                                return \`\${label}: \${value}\`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: labels[totalCnt-15] || labels[0],
                        max: labels[totalCnt-1],
                        grid: { color: '#f0f0f0' },
                        ticks: { autoSkip: false, maxRotation: 90, minRotation: 90, font: { size: 10 } }
                    },
                    y: { grid: { color: '#f0f0f0' }, ticks: { stepSize: 0.01, font: { size: 12, weight: 'bold' }, color: '#333333' } }
                }
            }
        });

        // 2. 등락 스타일 및 화살표 포맷터 함수
        function formatValueWithTrend(current, previous, fixedCount) {
            const valStr = current.toFixed(fixedCount);
            if (previous === null) return { class: 'stable', text: valStr + ' -' };
            
            if (current > previous) {
                return { class: 'up', text: valStr + ' ▲' };
            } else if (current < previous) {
                return { class: 'down', text: valStr + ' ▼' };
            } else {
                return { class: 'stable', text: valStr + ' -' };
            }
        }

        // 3. 중위값(Median) 계산 함수
        function calculateMedian(arr) {
            if (arr.length === 0) return 0;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }

        // 4. 시간 기준 동적 그룹화 및 테이블 출력 함수
        function generateTimeGroupedTable(unitMode = '30m') {
            const tbody = document.getElementById('averageTableBody');
            let html = '';

            const groupList = [];
            const groupMap = {};

            // 1단계: 원래 순서(시간 정방향)대로 각 시간대 그룹 데이터를 임시 수집 및 계산
            for (let i = 0; i < totalCnt; i++) {
                let rawLabel = labels[i].replace(/"/g, ''); 
                let timeKey = "";

                if (rawLabel.includes(":")) {
                    let timePart = rawLabel.includes(" ") ? rawLabel.split(" ")[1] : rawLabel;
                    let parts = timePart.split(":");
                    let hour = parts[0];
                    let minute = parseInt(parts[1], 10);

                    if (unitMode === '30m') {
                        let minKey = minute < 30 ? "00분" : "30분";
                        timeKey = hour + "시 " + minKey;
                    } else {
                        timeKey = hour + "시";
                    }
                } else {
                    timeKey = rawLabel; 
                }

                if (!groupMap[timeKey]) {
                    groupMap[timeKey] = { title: timeKey, vnd: [], usd: [], rawUsd: [] };
                    groupList.push(groupMap[timeKey]);
                }

                groupMap[timeKey].vnd.push(vndData[i]);
                groupMap[timeKey].usd.push(usdData[i]);
                groupMap[timeKey].rawUsd.push(rawUsdData[i]);
            }

            // 2단계: 각 시간대별 최종 통계치(평균, 중위값) 도출 및 '이전 시간대' 대비 등락 계산
            let prevVnd = null;
            let prevMedianVnd = null; 
            let prevUsd = null;
            let prevMedianUsd = null; 
            let prevRawUsd = null;

            const finalRows = [];

            groupList.forEach(group => {
                const count = group.vnd.length;

                const sumVnd = group.vnd.reduce((a, b) => a + b, 0);
                const sumUsd = group.usd.reduce((a, b) => a + b, 0);
                const sumRawUsd = group.rawUsd.reduce((a, b) => a + b, 0);

                let avgVnd = sumVnd / count;
                let medianVnd = calculateMedian(group.vnd); 
                let avgUsd = sumUsd / count;
                let medianUsd = calculateMedian(group.usd); 
                let avgRawUsd = sumRawUsd / count;

                // 정방향 흐름 기준으로 이전 데이터와 비교해 등락 화살표 적용
                let vndRes = formatValueWithTrend(avgVnd, prevVnd, 4);
                let vndMedianRes = formatValueWithTrend(medianVnd, prevMedianVnd, 4);
                let usdRes = formatValueWithTrend(avgUsd, prevUsd, 4);
                let usdMedianRes = formatValueWithTrend(medianUsd, prevMedianUsd, 4);
                let rawUsdRes = formatValueWithTrend(avgRawUsd, prevRawUsd, 2);

                // 화면에 출력할 행 템플릿 임시 배열에 저장
                let rowHtml = '<tr>' +
                    '<td style="font-weight: bold; color: #555;">' + group.title + '</td>' +
                    '<td class="' + vndRes.class + '">' + vndRes.text + '</td>' +
                    '<td class="' + vndMedianRes.class + '">' + vndMedianRes.text + '</td>' +
                    '<td class="' + usdRes.class + '">' + usdRes.text + '</td>' +
                    '<td class="' + usdMedianRes.class + '">' + usdMedianRes.text + '</td>' +
                    '<td class="' + rawUsdRes.class + '">' + rawUsdRes.text + '</td>' +
                '</tr>';

                finalRows.push(rowHtml);

                // 등락 추적용 값 갱신
                prevVnd = avgVnd;
                prevMedianVnd = medianVnd;
                prevUsd = avgUsd;
                prevMedianUsd = medianUsd;
                prevRawUsd = avgRawUsd;
            });

            // [핵심] 3단계: 완성된 행 배열을 뒤집어서(.reverse) 최신 시간부터 보이게 노출!
            tbody.innerHTML = finalRows.reverse().join('');
        }

        function onChangeUnit() {
            const selectedUnit = document.querySelector('input[name="timeUnit"]:checked').value;
            generateTimeGroupedTable(selectedUnit);
        }

        // 초기 테이블 렌더링 실행
        generateTimeGroupedTable('30m');

        // ================= 카운트다운 및 새로고침 로직 =================
        let timeLeft = 30; // 남은 시간 (초)
        const timerElement = document.getElementById('timerDisplay');

        // 1초마다 남은 시간을 빼서 화면에 표기하고, 0초가 되면 새로고침
        setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                location.reload();
            } else {
                timerElement.innerText = \`\${timeLeft}초\`;
            }
        }, 1000);

        // 백그라운드에 있다가 돌아오면 대기시간 상관없이 즉시 새로고침
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                location.reload();
            }
        });
    </script>
</body>
</html>`

console.log(html)