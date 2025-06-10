// API配置
const WEATHER_API_KEY = '3823d604764f436f84846255a290ff88';
const WEATHER_API_URL = 'https://devapi.qweather.com/v7/weather/now';

// 获取天气数据
async function getWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert('请输入城市名称');
        return;
    }

    try {
        const response = await fetch(`${WEATHER_API_URL}?location=${city}&key=${WEATHER_API_KEY}`);
        const data = await response.json();
        
        if (data.code === '200') {
            const weather = data.now;
            const weatherInfo = `
                <p><strong>城市：</strong>${city}</p>
                <p><strong>温度：</strong>${weather.temp}°C</p>
                <p><strong>天气：</strong>${weather.text}</p>
                <img src="https://qweather-pic.oss-cn-beijing.aliyuncs.com/${weather.icon}.png" alt="天气图标" />
            `;

            // 生成穿搭建议
            const advice = giveClothingAdvice(weather.text, weather.temp);
            document.getElementById('weatherInfo').innerHTML = weatherInfo + `<p><strong>穿搭建议：</strong>${advice}</p>`;
        } else {
            alert('获取天气失败，请检查城市名称或稍后重试');
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