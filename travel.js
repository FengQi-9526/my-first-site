// 地图初始化（确保 DOM 渲染后执行）
let map = L.map('map').setView([31.2304, 121.4737], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);
let startMarker;

async function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude: lat, longitude: lon} = position.coords;
      map.setView([lat, lon], 14);
      if (startMarker) map.removeLayer(startMarker);
      startMarker = L.marker([lat, lon]).addTo(map).bindPopup("你在这里").openPopup();
      document.getElementById('startLocation').value = `${lat.toFixed(5)},${lon.toFixed(5)}`;
    }, () => alert("无法获取位置，检查权限"));
  } else alert("该浏览器不支持定位");
}

async function getWeather() {
  const city = document.getElementById('city').value.trim();
  const apiKey = '3823d604764f436f84846255a290ff88';
  if (!city) return alert("请输入城市");

  try {
    const locRes = await fetch(`https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(city)}&key=${apiKey}`);
    const locData = await locRes.json();
    if (locData.code !== '200' || locData.location.length === 0) {
      return alert("未找到该城市，请确认名称");
    }
    const locId = locData.location[0].id;

    const weatherRes = await fetch(`https://devapi.qweather.com/v7/weather/now?location=${locId}&key=${apiKey}`);
    const weatherData = await weatherRes.json();
    if (weatherData.code !== '200') {
      console.error(weatherData);
      return alert("天气查询失败：" + weatherData.code);
    }

    const {temp, text: condition, icon} = weatherData.now;
    document.getElementById('weatherInfo').innerHTML = `
      <p><strong>城市：</strong>${city}</p>
      <p><strong>温度：</strong>${temp}°C</p>
      <p><strong>天气：</strong>${condition}</p>
      <img src="https://qweather-pic.oss-cn-beijing.aliyuncs.com/icons/${icon}.png" alt="图标" />
      <p><strong>建议：</strong>${giveAdvice(condition, temp)}</p>
    `;
  } catch (e) {
    console.error(e);
    alert("获取天气出错");
  }
}

function giveAdvice(cond, temp) {
  let advice = temp < 10 ? '天气冷，请保暖。' :
               temp < 20 ? '微凉，穿外套比较好。' :
               '天气暖，轻装上阵。';
  if (/雨|雪|阴/.test(cond)) advice += ' 带伞哦！';
  return advice;
}
