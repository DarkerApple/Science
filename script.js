// 전역 상수 및 변수 정의
const GLOBAL_POPULATION = 8_000_000_000; // 2025년 추정 인구
const emissionFactors = {
    water: 0.0003,
    electricity: 0.5,
    food: 2.5,
    car: 0.2
};
let climateChart; // 차트 객체를 전역 변수로 선언

// DOM이 로드된 후 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calcButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateImpact);
        console.log('Calculate button event listener added');
    } else {
        console.error('Calculate button not found');
    }
});

function calculateImpact() {
    const inputs = {
        water: parseFloat(document.getElementById('water').value) || 0,
        electricity: parseFloat(document.getElementById('electricity').value) || 0,
        food: parseFloat(document.getElementById('food').value) || 0,
        car: parseFloat(document.getElementById('car').value) || 0
    };

    if(Object.values(inputs).every(v => v === 0)) {
        showError('모든 입력값을 정확히 입력해주세요!');
        return;
    }

    const emissions = calculateEmissions(inputs);
    const projections = calculateProjections(emissions.global);
    displayResults(emissions, projections);
    updateChart(emissions, projections);
    showSolutions(getMainProblem(emissions.individual));
}

function calculateEmissions(inputs) {
    const individualEmissions = {
        water: inputs.water * emissionFactors.water * 365,
        electricity: inputs.electricity * emissionFactors.electricity * 365,
        food: inputs.food * emissionFactors.food * 365,
        car: inputs.car * emissionFactors.car * 365
    };

    const globalEmissions = {
        water: individualEmissions.water * GLOBAL_POPULATION,
        electricity: individualEmissions.electricity * GLOBAL_POPULATION,
        food: individualEmissions.food * GLOBAL_POPULATION,
        car: individualEmissions.car * GLOBAL_POPULATION
    };

    return { individual: individualEmissions, global: globalEmissions };
}

function displayResults(emissions, projections) {
    const totalIndividual = Object.values(emissions.individual).reduce((a, b) => a + b, 0);
    const totalGlobal = Object.values(emissions.global).reduce((a, b) => a + b, 0);
    
    const resultsHTML = `
        <h3>📊 연간 탄소 배출량 (1인 기준)</h3>
        ${createEmissionList(emissions.individual)}
        <hr>
        <h3>🌍 지구 전체 예상 배출량 (${GLOBAL_POPULATION.toLocaleString()}명 기준)</h3>
        ${createEmissionList(emissions.global, true)}
        <div class="comparison-box">
            ${getComparisonText(totalIndividual, totalGlobal)}
        </div>
    `;
    document.getElementById('results').innerHTML = resultsHTML;
}

function createEmissionList(data, isGlobal = false) {
    const scale = isGlobal ? 
        value => `${(value / 1e12).toLocaleString(undefined, {maximumFractionDigits:2})} 억 톤` : 
        value => `${value.toLocaleString()} kg`;

    return `
        <ul class="emission-list">
            <li>물 사용: ${scale(data.water)} CO₂</li>
            <li>전기 사용: ${scale(data.electricity)} CO₂</li>
            <li>식품 소비: ${scale(data.food)} CO₂</li>
            <li>차량 이동: ${scale(data.car)} CO₂</li>
        </ul>
    `;
}

function getComparisonText(individual, global) {
    const treesPerPerson = Math.round(individual / 22);
    const totalTrees = (treesPerPerson * GLOBAL_POPULATION).toLocaleString();
    
    return `
        <h4>🌳 상쇄에 필요한 나무의 수</h4>
        <p>1인: 연간 ${treesPerPerson}그루 → 전 세계: ${totalTrees}그루</p>
        <div class="earth-fact">
            ※ 지구 전체 숲 면적: 40억 헥타르 (1헥타르당 1,500그루)
        </div>
    `;
}

function calculateProjections(globalEmissions) {
    const totalEmission = Object.values(globalEmissions).reduce((a, b) => a + b, 0);
    const baseTemp = 1.2 + (totalEmission / 1e15 * 0.1);
    const baseSea = 0.2 + (totalEmission / 1e15 * 0.01);

    return {
        temp: Array.from({length: 50}, (_, i) => baseTemp + (0.02 * i)),
        sea: Array.from({length: 50}, (_, i) => baseSea + (0.003 * i))
    };
}

function updateChart(emissions, projections) {
    if(climateChart) climateChart.destroy();

    const ctx = document.getElementById('climateChart').getContext('2d');
    climateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 50}, (_, i) => 2025 + i),
            datasets: [{
                label: '예상 기온 상승 (°C)',
                data: projections.temp,
                borderColor: '#e74c3c',
                tension: 0.4
            },
            {
                label: '해수면 상승 (m)',
                data: projections.sea,
                borderColor: '#3498db',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '50년 기후변화 예측'
                }
            }
        }
    });
}

function showSolutions(mainCategory) {
    const solutions = {
        electricity: ['태양광 패널 설치하기', '에너지 효율 높은 가전제품 사용하기', '사용하지 않는 전기 제품 플러그 뽑기'],
        car: ['대중교통 이용하기', '전기차로 전환하기', '자동차 여럿이 같이 타기'],
        water: ['물 절약 샤워기 설치하기', '빨래할 때 물 재활용하기', '세탁량 30% 줄이기'],
        food: ['채소 위주 식단 가지기', '집에서 직접 음식 만들기', '음식 쓰레기 줄이기']
    }[mainCategory] || ['에너지 절약하기', '재활용 실천하기', '친환경 제품 사용하기'];

    const solutionsHTML = `
        <div style="margin-top: 20px; background: #ecf0f1; padding: 15px; border-radius: 10px;">
            <h4>🚨 주요 개선 방안 (${mainCategory} 분야)</h4>
            <ul>
                ${solutions.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <p>💡 작은 실천이 지구를 구합니다! 오늘부터 시작해보세요 🌱</p>
        </div>
    `;

    document.getElementById('results').innerHTML += solutionsHTML;
}

function getMainProblem(emissions) {
    return Object.entries(emissions).sort((a, b) => b[1] - a[1])[0][0];
}

function showError(message) {
    document.getElementById('results').innerHTML = `
        <div style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--danger-color')}">
            ⚠️ ${message}
        </div>
    `;
}
