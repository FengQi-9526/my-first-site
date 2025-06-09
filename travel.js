// 验证配置是否正确加载
if (!window.mapConfig) {
    throw new Error('地图配置未加载，请检查config.js');
}

// 全局变量
let map = null;
let currentTravelMode = 'driving';

// Token计数相关
const MAX_TOKENS_PER_DAY = window.mapConfig.apiLimits.maxTokensPerDay;
let currentTokens = 0;
let totalTokens = localStorage.getItem('totalTokensToday') || 0;

// 检查是否需要重置每日计数
const lastDate = localStorage.getItem('lastTokenDate');
const today = new Date().toDateString();
if (lastDate !== today) {
    totalTokens = 0;
    localStorage.setItem('totalTokensToday', 0);
    localStorage.setItem('lastTokenDate', today);
}
  
  // 检查是否需要重置每日计数器（跨天重置）
  const today = new Date().toISOString().split('T')[0];  // 获取当前日期 YYYY-MM-DD
  const lastUsedDate = localStorage.getItem('lastUsedDate');  // 获取上次使用日期
  if (lastUsedDate !== today) {
    totalTokens = 0;  // 如果日期变化则重置计数
    localStorage.setItem('lastUsedDate', today);  // 更新最后使用日期
  }
  
  /**
   * 更新Token计数显示
   * 将当前会话和今日累计的Token数显示在界面上
   */
// 更新Token显示
function updateTokenDisplay() {
    const currentTokensElement = document.getElementById('currentTokens');
    const totalTokensElement = document.getElementById('totalTokens');
    const maxTokensElement = document.getElementById('maxTokens');
    
    // 更新数值
    currentTokensElement.textContent = currentTokens;
    totalTokensElement.textContent = totalTokens;
    maxTokensElement.textContent = MAX_TOKENS_PER_DAY;
    
    // 添加动画效果
    currentTokensElement.classList.add('token-update');
    totalTokensElement.classList.add('token-update');
    
    // 动画结束后移除类
    setTimeout(() => {
        currentTokensElement.classList.remove('token-update');
        totalTokensElement.classList.remove('token-update');
    }, 500);
    
    // 更新地图状态信息
    const mapStatus = document.getElementById('mapStatus');
    mapStatus.textContent = map ? '地图已就绪' : '地图加载中...';
}
  
  // 初始显示
  updateTokenDisplay();
  
  /**
   * 记录API调用并更新Token计数
   * @param {string} apiName - API调用名称，用于日志记录
   * @param {number} tokenCost - API调用消耗的Token数，默认为1
   */
// 记录API调用
function trackApiCall(type, count = 1) {
    // 获取特定API调用的token消耗
    const tokenCost = count * (window.mapConfig.apiLimits.tokensPerCall[type] || 1);
    
    // 检查是否超出限制
    if (totalTokens >= window.mapConfig.apiLimits.maxTokensPerDay) {
        const error = new Error('今日API调用次数已达上限，请明天再试');
        alert(error.message);
        throw error;
    }
    
    try {
        // 更新计数
        currentTokens += tokenCost;
        totalTokens = Number(totalTokens) + tokenCost;
        
        // 保存到localStorage
        localStorage.setItem('totalTokensToday', totalTokens);
        localStorage.setItem('lastTokenDate', new Date().toDateString());
        
        // 更新显示
        updateTokenDisplay();
        
        // 打印日志
        console.log(`API调用: ${type}, Token消耗: ${tokenCost}, 当前总数: ${totalTokens}`);
    } catch (error) {
        console.error('Token计数更新失败:', error);
        alert('Token计数更新失败，请刷新页面重试');
    }
}

// 初始化函数
window.onload = function() {
    // 初始化地图
    initMap();
    // 初始化地点输入框的自动完成
    setupAutocomplete('fromLocation');
    setupAutocomplete('toLocation');
    // 更新Token显示
    updateTokenDisplay();
};

function initMap() {
    try {
        // 使用配置中的选项初始化地图
        map = new AMap.Map('mapContainer', {
            ...window.mapConfig.mapOptions
        });

        map.on('complete', function() {
            updateTokenDisplay();
            console.log('地图初始化成功');
        });

        map.on('error', function(error) {
            console.error('地图加载错误:', error);
            document.getElementById('mapStatus').textContent = '地图加载失败，请刷新页面重试';
        });

    } catch (error) {
        console.error('地图初始化失败:', error);
        document.getElementById('mapStatus').textContent = '地图加载失败，请检查网络连接';
    }
}

    // 地图加载完成事件
    map.on('complete', function() {
      mapStatus.textContent = '地图加载完成';
      trackApiCall('初始化地图', 1);
    });

    // 地图加载失败事件
    map.on('error', function(error) {
      console.error('地图加载错误:', error);
      mapStatus.textContent = '地图加载失败，请刷新页面重试';
    });

    // 添加地图控件
    map.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
      try {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        trackApiCall('加载地图控件', 1);
      } catch (error) {
        console.error('添加地图控件失败:', error);
        mapStatus.textContent = '地图控件加载失败';
      }
    });

    // 确保所有必需的插件都已加载
    AMap.plugin([
      'AMap.Geocoder',
      'AMap.AutoComplete',
      'AMap.Driving',
      'AMap.Walking',
      'AMap.Transfer',
      'AMap.Riding',
      'AMap.Weather'
    ], function() {
      console.log('所有插件加载完成');
      mapStatus.textContent = '地图系统就绪';
    });

  } catch (error) {
    console.error('地图初始化失败:', error);
    mapStatus.textContent = '地图初始化失败，请检查网络连接';
  }
  
  /**
   * 为输入框设置地点自动完成功能
   * @param {string} inputId - 输入框的DOM ID
   */
  const setupAutocomplete = (inputId) => {
    AMap.plugin(['AMap.AutoComplete'], function() {
      const autoOptions = {
        input: inputId
      };
      const autoComplete = new AMap.AutoComplete(autoOptions);

      // 当用户选中提示项时触发
      autoComplete.on('select', function(e) {
        trackApiCall('autocomplete');
        // 更新输入框的值
        document.getElementById(inputId).value = e.poi.name;
        
        // 如果地点有详细地址，则使用详细地址
        if (e.poi.address) {
          document.getElementById(inputId).value += ` (${e.poi.address})`;
        }
        
        console.log('已选择地点:', e.poi.name, e.poi.location);
        trackApiCall('地点自动完成', 1);
      });
    });
    trackApiCall('初始化自动完成', 1);
  };
  
  // 为出发地和目的地输入框设置自动完成
  setupAutocomplete('fromLocation');
  setupAutocomplete('toLocation');
  
// 更新出行方式
function updateTravelMode(mode) {
    currentTravelMode = mode;
    const buttons = document.querySelectorAll('.transport-options button');
    buttons.forEach(button => {
        button.style.backgroundColor = button.textContent.toLowerCase().includes(mode) ? '#0056b3' : '#007bff';
    });
    
    // 如果已有起终点，重新规划路线
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    if (from && to) {
        planRoute();
    }
}
    
    // 表单验证
    if (!fromLocation || !toLocation) {
      alert('请输入出发地和目的地');
      return;
    }
    
    // 清空之前的路线
    map.clearMap();
    
    // ===================== 地理编码处理 =====================
    // 创建地理编码服务实例
    const geocoder = new AMap.Geocoder();
    
    // 获取出发地点经纬度
    geocoder.getLocation(fromLocation, function(status, result) {
      trackApiCall('地理编码(出发地)', 2);

      if (status === 'complete' && result.info === 'OK') {
        const startPoint = result.geocodes[0].location;
        console.log('出发地解析成功:', startPoint);

        // 获取目的地经纬度
        geocoder.getLocation(toLocation, function(status, result) {
          trackApiCall('地理编码(目的地)', 2);

          if (status === 'complete' && result.info === 'OK') {
            const endPoint = result.geocodes[0].location;
            console.log('目的地解析成功:', endPoint);

            // 规划路线
            planRoute(startPoint, endPoint, travelMode);

            // 同时获取天气信息并提供建议
            getWeatherAdvice(endPoint);
          } else {
            console.error('目的地解析错误:', status, result);
            alert('目的地地址解析失败，请检查地址是否正确并重试。错误信息：' + result.info);
          }
        });
      } else {
        console.error('出发地解析错误:', status, result);
        alert('出发地地址解析失败，请检查地址是否正确并重试。错误信息：' + result.info);
      }
    });
  });
  
  /**
   * 根据出发点和目的地规划路线
   * @param {Object} startPoint - 起点坐标
   * @param {Object} endPoint - 终点坐标
   * @param {string} travelMode - 出行方式：driving/walking/transit/bicycling
   */
// 规划路线
function planRoute() {
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    
    if (!fromLocation || !toLocation) {
        alert('请输入起点和终点');
        return;
    }

    // 地理编码服务
    const geocoder = new AMap.Geocoder();
    
    // 解析起点
    geocoder.getLocation(fromLocation, function(status, result) {
        trackApiCall('geocoder');
        if (status === 'complete' && result.info === 'OK') {
            const startPoint = result.geocodes[0].location;
            
            // 解析终点
            geocoder.getLocation(toLocation, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    const endPoint = result.geocodes[0].location;
                    
                    // 调用相应的路线规划服务
                    switch (currentTravelMode) {
                        case 'driving':
                            planDrivingRoute(startPoint, endPoint);
                            break;
                        case 'walking':
                            planWalkingRoute(startPoint, endPoint);
                            break;
                        case 'transit':
                            planTransitRoute(startPoint, endPoint);
                            break;
                        case 'riding':
                            planRidingRoute(startPoint, endPoint);
                            break;
                    }
                    
                    // 获取目的地天气
                    getWeather(endPoint);
                } else {
                    alert('目的地地址解析失败，请检查输入');
                }
            });
        } else {
            alert('出发地址解析失败，请检查输入');
        }
    });
}

function planDrivingRoute(start, end) {
    try {
        AMap.plugin('AMap.Driving', function() {
            const driving = new AMap.Driving({
                map: map,
                panel: 'routeInfo'
            });
            
            driving.search(start, end, function(status, result) {
                if (status === 'complete') {
                    trackApiCall('routing');
                    console.log('规划驾车路线成功');
                } else {
                    console.error('驾车路线规划失败:', result);
                    alert('驾车路线规划失败，请重试');
                }
            });
        });
    } catch (error) {
        console.error('驾车路线规划服务加载失败:', error);
        alert('服务加载失败，请刷新页面重试');
    }
}

function planWalkingRoute(start, end) {
    try {
        AMap.plugin('AMap.Walking', function() {
            const walking = new AMap.Walking({
                map: map,
                panel: 'routeInfo'
            });
            
            walking.search(start, end, function(status, result) {
                if (status === 'complete') {
                    trackApiCall('routing');
                    console.log('规划步行路线成功');
                } else {
                    console.error('步行路线规划失败:', result);
                    alert('步行路线规划失败，请重试');
                }
            });
        });
    } catch (error) {
        console.error('步行路线规划服务加载失败:', error);
        alert('服务加载失败，请刷新页面重试');
    }
}

function planTransitRoute(start, end) {
    try {
        AMap.plugin('AMap.Transfer', function() {
            const transfer = new AMap.Transfer({
                map: map,
                panel: 'routeInfo',
                policy: AMap.TransferPolicy.LEAST_TIME
            });
            
            transfer.search(start, end, function(status, result) {
                if (status === 'complete') {
                    trackApiCall('routing');
                    console.log('规划公交路线成功');
                } else {
                    console.error('公交路线规划失败:', result);
                    alert('公交路线规划失败，请重试');
                }
            });
        });
    } catch (error) {
        console.error('公交路线规划服务加载失败:', error);
        alert('服务加载失败，请刷新页面重试');
    }
}

function planRidingRoute(start, end) {
    try {
        AMap.plugin('AMap.Riding', function() {
            const riding = new AMap.Riding({
                map: map,
                panel: 'routeInfo'
            });
            
            riding.search(start, end, function(status, result) {
                if (status === 'complete') {
                    trackApiCall('routing');
                    console.log('规划骑行路线成功');
                } else {
                    console.error('骑行路线规划失败:', result);
                    alert('骑行路线规划失败，请重试');
                }
            });
        });
    } catch (error) {
        console.error('骑行路线规划服务加载失败:', error);
        alert('服务加载失败，请刷新页面重试');
    }
}
// 删除此段代码，因为新的路线规划函数已经包含了这些功能
      
      // 如果成功创建了规划器，就开始搜索路线
      if (routePlanner) {
        routePlanner.search(
          [startPoint.lng, startPoint.lat],  // 起点坐标
          [endPoint.lng, endPoint.lat],      // 终点坐标
          function(status, result) {
            trackApiCall('路线规划', 5);  // 路线规划API成本较高
            
            if (status === 'complete') {
              // 解析并显示路线信息
              const routeInfo = result.routes[0];
              const distance = routeInfo.distance;  // 路程，单位：米
              const duration = routeInfo.time;      // 时间，单位：秒
              
              // 显示路线基本信息
              document.getElementById('routeSuggestion').innerHTML = 
                `<strong>路程:</strong> ${(distance/1000).toFixed(2)}公里<br>
                 <strong>预计用时:</strong> ${Math.floor(duration/60)}分钟<br>
                 <strong>路线详情:</strong> 请参考下方路线指引和地图`;
            } else {
              document.getElementById('routeSuggestion').textContent = '路线规划失败，请重试';
            }
          }
        );
      }
    });
  }
  
  /**
   * 获取天气信息并提供穿衣建议
   * @param {Object} location - 位置坐标
   */
// 获取天气信息
function getWeather(location) {
    try {
        AMap.plugin('AMap.Weather', function() {
            const weather = new AMap.Weather();
            
            weather.getLive(location, function(err, data) {
                if (!err) {
                    trackApiCall('weather');
                    const weatherAdvice = document.getElementById('weatherAdvice');
                    
                    // 根据天气状况给出建议
                    let advice = getWeatherAdvice(data.weather, parseFloat(data.temperature));
                    
                    weatherAdvice.innerHTML = `
                        <div class="weather-info">
                            <h3>目的地天气</h3>
                            <div class="weather-details">
                                <p><strong>温度:</strong> ${data.temperature}℃</p>
                                <p><strong>天气:</strong> ${data.weather}</p>
                                <p><strong>风力:</strong> ${data.windPower}</p>
                                <p><strong>湿度:</strong> ${data.humidity}%</p>
                            </div>
                            <div class="weather-advice">
                                <h4>出行建议</h4>
                                <p>${advice}</p>
                            </div>
                        </div>
                    `;

                    // 添加样式
                    weatherAdvice.style.backgroundColor = '#f8f9fa';
                    weatherAdvice.style.padding = '15px';
                    weatherAdvice.style.borderRadius = '4px';
                    weatherAdvice.style.marginTop = '20px';
                } else {
                    console.error('获取天气信息失败:', err);
                    document.getElementById('weatherAdvice').innerHTML = 
                        '<p class="error">天气信息获取失败，请稍后重试</p>';
                }
            });
        });
    } catch (error) {
        console.error('天气查询服务加载失败:', error);
        document.getElementById('weatherAdvice').innerHTML = 
            '<p class="error">天气服务加载失败，请刷新页面重试</p>';
    }
}

// 根据天气状况给出建议
function getWeatherAdvice(weather, temperature) {
    let advice = '';
    
    // 根据温度给出建议
    if (temperature <= 5) {
        advice += '天气寒冷，请注意保暖，穿着厚实的衣物。';
    } else if (temperature <= 15) {
        advice += '天气较凉，建议适当添加衣物。';
    } else if (temperature <= 25) {
        advice += '温度适宜，非常适合出行。';
    } else {
        advice += '天气炎热，请做好防暑准备，多补充水分。';
    }

    // 根据天气状况给出建议
    if (weather.includes('雨')) {
        advice += ' 有雨，请携带雨具，注意路面湿滑。';
    } else if (weather.includes('雪')) {
        advice += ' 有雪，注意保暖，路面可能结冰，请谨慎行驶。';
    } else if (weather.includes('雾')) {
        advice += ' 有雾，建议降低行驶速度，保持安全距离。';
    } else if (weather.includes('晴')) {
        advice += ' 天气晴好，建议带好防晒用品。';
    } else if (weather.includes('阴')) {
        advice += ' 天气阴沉，建议适当添加衣物。';
    }

    return advice;
}
});