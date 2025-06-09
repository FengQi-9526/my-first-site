// 初始化地图
let map;
let driving;  // 驾车路线规划
let transit;  // 公交路线规划
let walking;  // 步行路线规划
let riding;   // 骑行路线规划

let currentRoute;  // 当前的路线规划

// 初始化地图
function initMap() {
    map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        center: [116.397428, 39.90923],  // 设置地图中心点
        zoom: 10,  // 设置地图缩放级别
    });

    driving = new AMap.Driving({
        map: map,
        panel: 'routeInfo',  // 路线信息显示面板
    });

    transit = new AMap.Transit({
        map: map,
        panel: 'routeInfo',
    });

    walking = new AMap.Walking({
        map: map,
        panel: 'routeInfo',
    });

    riding = new AMap.Riding({
        map: map,
        panel: 'routeInfo',
    });

    // 显示加载状态
    document.getElementById('mapStatus').textContent = '地图加载完成';
}

// 更新交通方式
function updateTravelMode(mode) {
    // 移除之前的路线规划
    if (currentRoute) {
        currentRoute.clear();
    }

    // 设置新的路线规划
    switch (mode) {
        case 'driving':
            currentRoute = driving;
            break;
        case 'transit':
            currentRoute = transit;
            break;
        case 'walking':
            currentRoute = walking;
            break;
        case 'riding':
            currentRoute = riding;
            break;
        default:
            currentRoute = driving;
            break;
    }

    // 更新按钮样式
    let buttons = document.querySelectorAll('.transport-options button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
}

// 获取路线规划
function getRoute() {
    let from = document.getElementById('fromLocation').value;
    let to = document.getElementById('toLocation').value;

    if (!from || !to) {
        alert('请输入起点和终点');
        return;
    }

    // 获取起点和终点的坐标
    let fromGeo = new AMap.Geocoder();
    let toGeo = new AMap.Geocoder();

    fromGeo.getLocation(from, function(status, result) {
        if (status === 'complete' && result.geocodes.length) {
            let startPoint = result.geocodes[0].location;
            toGeo.getLocation(to, function(status, result) {
                if (status === 'complete' && result.geocodes.length) {
                    let endPoint = result.geocodes[0].location;
                    currentRoute.search(startPoint, endPoint);
                }
            });
        }
    });
}

// 获取天气信息
function getWeather(location) {
    let weatherService = new AMap.Weather();
    weatherService.getLive(location, function(result) {
        if (result.status === 'complete') {
            let weather = result.liveData.weather;
            let temperature = result.liveData.temperature;
            let advice = '';
            if (weather.includes('晴')) {
                advice = `今天天气晴，温度大约 ${temperature}°C，适合穿轻便衣物。`;
            } else if (weather.includes('雨')) {
                advice = `今天有雨，温度大约 ${temperature}°C，记得带伞。`;
            } else {
                advice = `今天天气为 ${weather}，温度大约 ${temperature}°C，适合穿舒适的衣物。`;
            }
            document.getElementById('weatherAdvice').textContent = advice;
        }
    });
}

// 页面加载完成后初始化地图
window.onload = function() {
    initMap();

    // 绑定交通方式按钮点击事件
    let buttons = document.querySelectorAll('.transport-options button');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            updateTravelMode(event.target.textContent.toLowerCase());
        });
    });

    // 绑定路线规划按钮点击事件
    document.getElementById('getRouteButton').addEventListener('click', getRoute);
};
