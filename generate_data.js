const fs = require('fs');
const path = require('path');

function mergeJsonToDictionary(targetFolder, outputFilePath) {
    try {
        // 1. 대상 폴더 안의 모든 파일 목록 읽기
        const files = fs.readdirSync(targetFolder);
        // 2. 확장자가 .json인 파일만 골라내기
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
        
        // 결과를 담을 하나의 빈 객체(Dictionary) 선언
        let mergedDictionary = {};

        // 3. JSON 파일들을 하나씩 돌면서 데이터 병합
        jsonFiles.forEach(file => {
            const filePath = path.join(targetFolder, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            
            try {
                const parsedJson = JSON.parse(fileContent);
                Object.assign(mergedDictionary, parsedJson);
                console.log(`성공적으로 읽음: ${file}`);
            } catch (jsonErr) {
                console.error(`JSON 파싱 에러 (${file}):`, jsonErr.message);
            }
        });

        // 4. 합쳐진 하나의 Dictionary 객체를 파일로 저장
        // fs.writeFileSync(outputFilePath, JSON.stringify(mergedDictionary, null, 2), 'utf-8');
        // console.log(`\n🎉 하나의 Dictionary로 병합 완료! 결과 파일: ${outputFilePath}`);
        return mergedDictionary

    } catch (err) {
        console.error('폴더를 읽거나 쓰는 중 오류 발생:', err);
    }
}

function averageBy1Hour(data) {
    const groups = {};

    Object.entries(data).forEach(([timestamp, value]) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        
        // 그룹의 Key 포맷: "2026-06-30 23:00"
        const groupKey = `${year}-${month}-${day} ${hour}:00`;

        if (!groups[groupKey]) {
            groups[groupKey] = { sum: 0, count: 0 };
        }
        
        groups[groupKey].sum += parseFloat(value);
        groups[groupKey].count += 1;
    });

    const result = {};
    Object.entries(groups).forEach(([key, info]) => {
        result[key] = (info.sum / info.count).toFixed(4);
    });

    return result;
}




function averageBy30Minutes(data) {
    const groups = {};

    // 데이터 파싱 및 그룹화
    Object.entries(data).forEach(([timestamp, value]) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        
        // 30분 단위 내림 처리 (0~29분 -> 00, 30~59분 -> 30)
        const minutes = date.getMinutes() < 30 ? '00' : '30';
        
        // 그룹의 Key 포맷: "2026-06-30 23:30" 또는 "2026-06-30 23:00"
        const groupKey = `${year}-${month}-${day} ${hour}:${minutes}`;

        if (!groups[groupKey]) {
            groups[groupKey] = { sum: 0, count: 0 };
        }
        
        groups[groupKey].sum += parseFloat(value);
        groups[groupKey].count += 1;
    });

    // 평균 계산하여 최종 객체 생성
    const result = {};
    Object.entries(groups).forEach(([key, info]) => {
        // 소수점 2자리까지 고정 (필요에 따라 조절 가능)
        result[key] = (info.sum / info.count).toFixed(4); 
    });

    return result;
}

// --------------------------------------------------------
// [사용 예시] 
// 현재 경로의 'json_inputs' 폴더 안의 파일들을 'total.json'으로 합칩니다.
// 본인의 폴더명에 맞게 첫 번째 인자를 수정하세요.
// --------------------------------------------------------
const rawData = mergeJsonToDictionary('./data', './total.json');

const result = {
    "30min": averageBy30Minutes(rawData),
    "1hour": averageBy1Hour(rawData)
}
console.log("--- 결과 ---");
fs.writeFileSync('./vnd_data.json', JSON.stringify(result, null, 2), 'utf-8');
