document.getElementById("travelForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const from = document.getElementById("fromLocation").value;
  const to = document.getElementById("toLocation").value;
  const time = document.getElementById("travelTime").value;

  // 显示简单路线建议（此处为模拟）
  document.getElementById("routeSuggestion").textContent = `建议从 ${from} 出发，前往 ${to}，出发时间为 ${time || "未指定"}`;

  // 查询目的地天气
  const weatherText = await getWeatherAdvice(to);
  document.getElementById("weatherAdvice").textContent = weatherText;
});

async function getWeatherAdvice(city) {
  const key = "1bd27163e674d34347e9ab8bfae19eccy"; // 替换为你自己的 key
  const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${key}&extensions=base`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "1" && data.lives.length > 0) {
      const weather = data.lives[0];
      const text = `目的地天气：${weather.weather}，温度 ${weather.temperature}°C，风力 ${weather.windpower} 级`;

      // 穿搭建议逻辑
      let clothing = "";
      if (weather.weather.includes("雨")) {
        clothing += "建议带伞，穿防水鞋。";
      } else if (Number(weather.temperature) < 10) {
        clothing += "建议穿外套或羽绒服。";
      } else if (Number(weather.temperature) > 28) {
        clothing += "天气炎热，穿薄款衣物。";
      } else {
        clothing += "天气适中，穿适合的衣物。";
      }

      return `${text}。${clothing}`;
    } else {
      return "未能获取天气信息，请确认城市名称是否准确（城市必须是中文，如“广州”）";
    }
  } catch (err) {
    console.error(err);
    return "查询天气时发生错误。";
  }
}
