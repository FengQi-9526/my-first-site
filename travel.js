async function getWeather() {
  const city = document.getElementById('city').value.trim();
  const apiKey = '3823d604764f436f84846255a290ff88'; // 替换为你自己申请的 key

  if (!city) {
    alert("请输入城市名称");
    return;
  }

  const locationApi = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${apiKey}`;
  try {
    // 第一步：获取城市ID（location）
    const locationRes = await fetch(locationApi);
    const locationData = await locationRes.json();

    if (locationData.code !== "200" || locationData.location.length === 0) {
      alert("城市名称无效，请重新输入");
      return;
    }

    const locationId = locationData.location[0].id;

    // 第二步：获取天气信息
    const weatherApi = `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${apiKey}`;
    const weatherRes = await fetch(weatherApi);
    const weatherData = await weatherRes.json();

    if (weatherData.code !== "200") {
      alert("天气信息获取失败");
      return;
    }

    const weather = weatherData.now;
    const temp = weather.temp;
    const condition = weather.text;
    const icon = weather.icon;

    const advice = giveClothingAdvice(condition, temp);

    document.getElementById('weatherInfo').innerHTML = `
      <p><strong>城市：</strong>${city}</p>
      <p><strong>温度：</strong>${temp}°C</p>
      <p><strong>天气：</strong>${condition}</p>
      <img src="https://qweather-pic.oss-cn-beijing.aliyuncs.com/icons/${icon}.png" alt="天气图标" />
      <p><strong>建议：</strong>${advice}</p>
    `;
  } catch (error) {
    console.error("发生错误：", error);
    alert("获取天气失败，请稍后再试");
  }
}

function giveClothingAdvice(condition, temp) {
  let advice = '';

  if (temp < 10) {
    advice += '天气寒冷，请穿厚外套。';
  } else if (temp < 20) {
    advice += '稍凉，建议穿长袖加外套。';
  } else {
    advice += '天气温暖，适合穿短袖。';
  }

  if (condition.includes('雨') || condition.includes('雪') || condition.includes('阴')) {
    advice += ' 记得带伞哦！';
  } else {
    advice += ' 今天不需要带伞。';
  }

  return advice;
}
