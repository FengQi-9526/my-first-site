/**
 * 出行秘书功能 - 整合高德地图API实现的路线规划和天气建议
 * 包含：地图初始化、地点自动完成、路线规划、天气查询及API调用计数功能
 */

document.addEventListener('DOMContentLoaded', function() {
  // ===================== Token计数器 =====================
  // 初始化Token计数变量
  let currentTokens = 0;  // 当前会话使用的Token数
  let totalTokens = localStorage.getItem('totalTokensToday') || 0;  // 今日累计Token数
  
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
  function updateTokenDisplay() {
    const currentTokensElement = document.getElementById('currentTokens');
    const totalTokensElement = document.getElementById('totalTokens');
    
    currentTokensElement.textContent = currentTokens;
    totalTokensElement.textContent = totalTokens;
    
    // 添加动画效果，让用户注意到数值变化
    currentTokensElement.classList.add('token-update');
    totalTokensElement.classList.add('token-update');
    
    // 动画结束后移除类，为下次变化做准备
    setTimeout(() => {
      currentTokensElement.classList.remove('token-update');
      totalTokensElement.classList.remove('token-update');
    }, 500);
  }
  
  // 初始显示
  updateTokenDisplay();
  
  /**
   * 记录API调用并更新Token计数
   * @param {string} apiName - API调用名称，用于日志记录
   * @param {number} tokenCost - API调用消耗的Token数，默认为1
   */
  function trackApiCall(apiName, tokenCost = 1) {
    currentTokens += tokenCost;  // 增加当前会话的Token数
    totalTokens = parseInt(totalTokens) + tokenCost;  // 增加今日累计Token数
    localStorage.setItem('totalTokensToday', totalTokens);  // 保存至localStorage
    console.log(`API调用: ${apiName}, Token消耗: ${tokenCost}`);  // 控制台记录
    updateTokenDisplay();  // 更新显示
  }

  // ===================== 地图初始化 =====================
  // 创建地图实例
  const map = new AMap.Map('mapContainer', {
    zoom: 12,  // 初始缩放级别
    resizeEnable: true  // 允许地图容器大小调整
  });
  trackApiCall('初始化地图', 1);  // 记录API调用
  
  // 添加地图控件（工具栏和比例尺）
  map.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
    map.addControl(new AMap.ToolBar());  // 添加工具栏
    map.addControl(new AMap.Scale());    // 添加比例尺
    trackApiCall('加载地图控件', 1);
  });
  
  /**
   * 为输入框设置地点自动完成功能
   * @param {string} inputId - 输入框的DOM ID
   */
  const setupAutocomplete = (inputId) => {
    AMap.plugin(['AMap.AutoComplete'], function() {
      const autoOptions = {
        input: inputId  // 绑定输入框元素
      };
      const autoComplete = new AMap.AutoComplete(autoOptions);
      
      // 当用户选中提示项时触发
      autoComplete.on('select', function(e) {
        console.log(e.poi);  // 记录选中的位置信息
        trackApiCall('地点自动完成', 1);
      });
    });
    trackApiCall('初始化自动完成', 1);
  };
  
  // 为出发地和目的地输入框设置自动完成
  setupAutocomplete('fromLocation');
  setupAutocomplete('toLocation');
  
  // ===================== 表单提交处理 =====================
  // 监听路线查询表单的提交事件
  document.getElementById('travelForm').addEventListener('submit', function(e) {
    e.preventDefault();  // 阻止表单默认提交行为
    
    // 重置当前查询的Token计数
    currentTokens = 0;
    updateTokenDisplay();
    
    // 获取表单输入值
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    const travelMode = document.getElementById('travelMode').value;
    const travelTime = document.getElementById('travelTime').value;
    
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
        
        // 获取目的地经纬度
        geocoder.getLocation(toLocation, function(status, result) {
          trackApiCall('地理编码(目的地)', 2);
          
          if (status === 'complete' && result.info === 'OK') {
            const endPoint = result.geocodes[0].location;
            
            // 规划路线
            planRoute(startPoint, endPoint, travelMode);
            
            // 同时获取天气信息并提供建议
            getWeatherAdvice(endPoint);
          } else {
            alert('目的地地址解析失败');
          }
        });
      } else {
        alert('出发地地址解析失败');
      }
    });
  });
  
  /**
   * 根据出发点和目的地规划路线
   * @param {Object} startPoint - 起点坐标
   * @param {Object} endPoint - 终点坐标
   * @param {string} travelMode - 出行方式：driving/walking/transit/bicycling
   */
  function planRoute(startPoint, endPoint, travelMode) {
    // 先加载Driving模块，确保随后能够加载其他出行方式模块
    AMap.plugin('AMap.Driving', function() {
      let routePlanner;
      
      // 根据不同的出行方式选择不同的路线规划服务
      switch(travelMode) {
        case 'driving':
          // 驾车路线
          routePlanner = new AMap.Driving({
            map: map,
            panel: 'routeDetails'  // 路线详情面板的容器ID
          });
          break;
        case 'walking':
          // 步行路线
          AMap.plugin('AMap.Walking', function() {
            routePlanner = new AMap.Walking({
              map: map,
              panel: 'routeDetails'
            });
          });
          break;
        case 'transit':
          // 公交路线
          AMap.plugin('AMap.Transfer', function() {
            routePlanner = new AMap.Transfer({
              map: map,
              panel: 'routeDetails'
            });
          });
          break;
        case 'bicycling':
          // 骑行路线
          AMap.plugin('AMap.Riding', function() {
            routePlanner = new AMap.Riding({
              map: map,
              panel: 'routeDetails'
            });
          });
          break;
      }
      
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
  function getWeatherAdvice(location) {
    AMap.plugin('AMap.Weather', function() {
      const weather = new AMap.Weather();
      
      // 获取实时天气
      weather.getLive(location, function(err, data) {
        trackApiCall('天气信息查询', 2);
        
        if (!err) {
          // 格式化天气信息显示
          const weatherInfo = `${data.city} 当前天气: ${data.weather}, 温度: ${data.temperature}°C, 风力: ${data.windPower}级`;
          let clothingAdvice = '穿衣建议: ';
          
          // 根据温度提供穿衣建议
          const temp = parseFloat(data.temperature);
          if (temp < 5) {
            clothingAdvice += '天气寒冷，请穿厚重的冬季服装，如羽绒服、棉服等，注意保暖。';
          } else if (temp < 12) {
            clothingAdvice += '天气较冷，建议穿毛衣、外套、夹克等保暖衣物。';
          } else if (temp < 20) {
            clothingAdvice += '天气温和，适合穿长袖衬衫、薄毛衣或轻便外套。';
          } else if (temp < 26) {
            clothingAdvice += '天气温暖，适合穿短袖T恤、衬衫、薄外套等。';
          } else {
            clothingAdvice += '天气炎热，建议穿轻薄透气的衣物，如短袖、短裤，注意防晒。';
          }
          
          // 根据天气状况补充建议
          if (data.weather.includes('雨')) {
            clothingAdvice += ' 当前有雨，请携带雨具。';
          } else if (data.weather.includes('雪')) {
            clothingAdvice += ' 当前有雪，请穿防滑鞋并注意保暖。';
          } else if (data.weather.includes('雾') || data.weather.includes('霾')) {
            clothingAdvice += ' 当前有雾/霾，建议佩戴口罩。';
          }
          
          // 更新天气和穿衣建议显示
          document.getElementById('weatherAdvice').innerHTML = weatherInfo + '<br>' + clothingAdvice;
        } else {
          document.getElementById('weatherAdvice').textContent = '无法获取天气信息';
        }
      });
    });
  }
});
