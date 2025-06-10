// API配置
const WEATHER_API_KEY = '3823d604764f436f84846255a290ff88';
const WEATHER_API_BASE = 'https://devapi.qweather.com/v7';
const GEO_API_BASE = 'https://geoapi.qweather.com/v2';

// 等待页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', function() {
    // 初始化地图（默认上海）
    window.map = L.map('map').setView([31.2304, 121.4737], 12);

    // 加载地图图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.map);

    // 地图点击事件
    window.map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        updateMapMarker(lat, lng);
        getWeatherByCoords(lat, lng);
    });
});

// 定义全局标记变量
let currentMarker = null;

// 更新地图标记
function updateMapMarker(lat, lon) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("选定位置").openPopup();
}

// 获取当前位置
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 14);
            updateMapMarker(lat, lon);
            getWeatherByCoords(lat, lon);
        }, () => {
            alert("⚠️ 无法获取位置，可能是权限问题或 VPN 导致");
        });
    } else {
        alert("❌ 当前浏览器不支持定位");
    }
}

// 使用城市名获取天气
async function getWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert('请输入城市名称');
        return;
    }

    try {
        // 先获取城市的location ID
        const locationUrl = `${GEO_API_BASE}/city/lookup?location=${encodeURIComponent(city)}&key=${WEATHER_API_KEY}`;
        const locationRes = await fetch(locationUrl);
        const locationData = await locationRes.json();

        if (locationData.code === '200' && locationData.location && locationData.location.length > 0) {
            const location = locationData.location[0];
            map.setView([location.lat, location.lon], 12);
            updateMapMarker(location.lat, location.lon);
            await getWeatherByCoords(location.lat, location.lon, location.name);
        } else {
            alert('未找到该城市，请检查输入');
        }
    } catch (error) {
        console.error('查询出错:', error);
        alert('发生错误，请稍后再试');
    }
}

// 使用经纬度获取天气
async function getWeatherByCoords(lat, lon, cityName = '当前位置') {
    try {
        const weatherUrl = `${WEATHER_API_BASE}/weather/now?location=${lon},${lat}&key=${WEATHER_API_KEY}`;
        const response = await fetch(weatherUrl);
        const data = await response.json();
        
        if (data.code === '200') {
            const weather = data.now;
            const weatherInfo = `
                <h3>${cityName}</h3>
                <p><strong>温度：</strong>${weather.temp}°C</p>
                <p><strong>天气：</strong>${weather.text}</p>
                <p><strong>风向：</strong>${weather.windDir}</p>
                <p><strong>风速：</strong>${weather.windSpeed}公里/小时</p>
                <img src="https://qweather-pic.oss-cn-beijing.aliyuncs.com/${weather.icon}.png" alt="天气图标" />
            `;

            const advice = giveClothingAdvice(weather.text, weather.temp);
            document.getElementById('weatherInfo').innerHTML = weatherInfo + `<p><strong>穿搭建议：</strong>${advice}</p>`;
        } else {
            alert('获取天气失败，请稍后重试');
        }
    } catch (error) {
        console.error('天气查询出错:', error);
        alert('发生错误，请稍后再试');
    }
}

// 生成穿搭建议
function giveClothingAdvice(condition, temp) {
    let advice = '';
    
    // 温度建议
    if (temp < 10) {
        advice += '穿上厚外套，保暖！';
    } else if (temp >= 10 && temp < 20) {
        advice += '穿上长袖和外套，适合稍微寒冷的天气。';
    } else {
        advice += '天气温暖，穿轻便的衣服。';
    }

    // 天气建议
    if (condition.includes('雨') || condition.includes('雪')) {
        advice += ' 记得带伞哦！';
    } else {
        advice += ' 今天不需要带伞。';
    }

    return advice;
}

// 路线规划（预留功能）
function planRoute() {
    if (currentMarker) {
        const pos = currentMarker.getLatLng();
        alert(`🚧 当前位置: 纬度 ${pos.lat.toFixed(4)}, 经度 ${pos.lng.toFixed(4)}\n路线规划功能开发中`);
    } else {
        alert('请先在地图上选择一个位置');
    }
}