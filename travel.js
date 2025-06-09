// 这部分逻辑已移至AppInitializer.init()中,可以删除
// 全局变量
let map = null;
let currentTravelMode = 'driving';

// UI状态管理器
const UIManager = {
    // 更新交通方式按钮状态
    updateTravelModeButtons: function(selectedMode) {
        const buttons = document.querySelectorAll('.transport-options button');
        buttons.forEach(button => {
            const mode = button.textContent.toLowerCase();
            button.classList.remove('active');
            if (mode.includes(selectedMode)) {
                button.classList.add('active');
            }
        });
    },
    
    // 更新加载状态
    updateLoadingState: function(isLoading, element) {
        const target = document.getElementById(element);
        if (!target) return;
        
        if (isLoading) {
            target.classList.add('loading');
            target.textContent = '加载中...';
        } else {
            target.classList.remove('loading');
        }
    },
    
    // 显示错误信息
    showError: function(message, element) {
        const target = document.getElementById(element);
        if (!target) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        target.appendChild(errorDiv);
        
        // 3秒后自动移除错误信息
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    },
    
    // 更新路线信息面板
    updateRouteInfo: function(info) {
        const routeInfo = document.getElementById('routeInfo');
        if (!routeInfo) return;
        
        routeInfo.innerHTML = `
            <h3>路线详情</h3>
            <div class="route-details">
                ${info}
            </div>
        `;
    },
    
    // 清除路线信息
    clearRouteInfo: function() {
        const routeInfo = document.getElementById('routeInfo');
        if (routeInfo) {
            routeInfo.innerHTML = '';
        }
    }
};

const RouteManager = {
    // 当前显示的路线
    currentRoute: null,
    currentPolyline: null,
    currentMarkers: [],
    
    // 初始化
    init: function() {
        this.currentRoute = null;
        this.currentPolyline = null;
        this.currentMarkers = [];
    },
    
    // 清除当前路线
    clearRoute: function() {
        return new Promise((resolve) => {
            if (this.currentRoute) {
                // 添加淡出动画
                if (this.currentPolyline) {
                    const opacity = { value: 1 };
                    const animation = requestAnimationFrame(function animate() {
                        opacity.value -= 0.1;
                        if (opacity.value > 0) {
                            this.currentPolyline.setOptions({
                                strokeOpacity: opacity.value
                            });
                            requestAnimationFrame(animate.bind(this));
                        } else {
                            this.currentPolyline.setMap(null);
                            this.currentPolyline = null;
                            
                            // 清除路线
                            this.currentRoute.clear();
                            this.currentRoute = null;
                            
                            // 清除标记
                            this.clearMarkers();
                            
                            // 清除路线信息面板
                            UIManager.clearRouteInfo();
                            
                            resolve();
                        }
                    }.bind(this));
                } else {
                    this.currentRoute.clear();
                    this.currentRoute = null;
                    this.clearMarkers();
                    UIManager.clearRouteInfo();
                    resolve();
                }
            } else {
                resolve();
            }
        });
    },
    
    // 清除标记点
    clearMarkers: function() {
        this.currentMarkers.forEach(marker => {
            marker.setMap(null);
        });
        this.currentMarkers = [];
    },
    
    // 设置当前路线
    setRoute: async function(route) {
        await this.clearRoute();
        this.currentRoute = route;
    },
    
    // 添加路线动画
    animateRoute: function(path) {
        if (!path || path.length < 2) return;
        
        const points = path.map(point => new AMap.LngLat(point[0], point[1]));
        
        // 创建路线折线
        this.currentPolyline = new AMap.Polyline({
            path: [points[0]],
            strokeColor: window.mapConfig.customStyle.routeColors[currentTravelMode],
            strokeWeight: 6,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
        });
        
        this.currentPolyline.setMap(map);
        
        // 动画绘制路线
        let currentIndex = 1;
        const animate = () => {
            const currentPath = this.currentPolyline.getPath();
            currentPath.push(points[currentIndex]);
            this.currentPolyline.setPath(currentPath);
            
            if (currentIndex < points.length - 1) {
                currentIndex++;
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    // 获取路线配置
    getRouteOptions: function(type) {
        const baseOptions = {
            map: map,
            panel: 'routeInfo',
            autoFitView: true,
            showTraffic: window.mapConfig.routeOptions.showTraffic
        };
        
        switch(type) {
            case 'driving':
                return {
                    ...baseOptions,
                    policy: AMap.DrivingPolicy.LEAST_TIME,
                    showTraffic: true,
                    hideMarkers: false
                };
            case 'walking':
                return {
                    ...baseOptions,
                    hideMarkers: false
                };
            case 'transit':
                return {
                    ...baseOptions,
                    city: '全国',
                    policy: AMap.TransferPolicy.LEAST_TIME,
                    nightflag: true,
                    hideMarkers: false
                };
            case 'riding':
                return {
                    ...baseOptions,
                    hideMarkers: false
                };
            default:
                return baseOptions;
        }
    },
    
    // 创建标记点
    createMarker: function(position, title, type = 'normal') {
        const marker = new AMap.Marker({
            position: position,
            title: title,
            animation: 'AMAP_ANIMATION_DROP'
        });
        
        // 根据类型设置不同的图标
        if (type === 'start') {
            marker.setIcon(new AMap.Icon({
                size: new AMap.Size(25, 34),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
            }));
        } else if (type === 'end') {
            marker.setIcon(new AMap.Icon({
                size: new AMap.Size(25, 34),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
            }));
        }
        
        marker.setMap(map);
        this.currentMarkers.push(marker);
        return marker;
    }
};

// Token计数相关
const MAX_TOKENS_PER_DAY = window.mapConfig.apiLimits.maxTokensPerDay;
let currentTokens = 0;
let totalTokens = localStorage.getItem('totalTokensToday') || 0;

// 日期检查
const today = new Date().toDateString();
if (localStorage.getItem('lastTokenDate') !== today) {
    totalTokens = 0;
    localStorage.setItem('totalTokensToday', '0');
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

// 地图加载管理器
const MapLoader = {
    // 加载状态
    isLoading: false,
    isLoaded: false,
    retryCount: 0,
    maxRetries: 3,
    
    // 初始化状态
    init: function() {
        this.isLoading = false;
        this.isLoaded = false;
        this.retryCount = 0;
    },
    
    // 加载高德地图API
    loadMapScript: function() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded && window.AMap) {
                resolve();
                return;
            }
            
            if (this.isLoading) {
                let checkCount = 0;
                const checkInterval = setInterval(() => {
                    checkCount++;
                    if (this.isLoaded && window.AMap) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                    if (checkCount > 20) { // 10秒后超时
                        clearInterval(checkInterval);
                        this.isLoading = false;
                        reject(new Error('地图加载超时'));
                    }
                }, 500);
                return;
            }
            
            this.isLoading = true;
            document.getElementById('mapStatus').textContent = '正在加载地图API...';
            
            // 创建script标签
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${window.mapConfig.amapKey}&plugin=${window.mapConfig.plugins.join(',')}`;
            
            script.onload = () => {
                if (window.AMap) {
                    this.isLoaded = true;
                    this.isLoading = false;
                    console.log('高德地图API加载成功');
                    resolve();
                } else {
                    this.isLoading = false;
                    reject(new Error('AMap对象未找到'));
                }
            };
            
            script.onerror = () => {
                this.isLoading = false;
                console.error('高德地图API加载失败');
                reject(new Error('地图API加载失败'));
            };
            
            document.head.appendChild(script);
        });
    },
    
    // 初始化地图
    initMap: async function() {
        try {
            document.getElementById('mapStatus').textContent = '正在加载地图...';
            
            // 等待API加载完成
            await this.loadMapScript();
            
            // 创建地图实例
            map = new AMap.Map('mapContainer', {
                ...window.mapConfig.mapOptions,
                viewMode: '2D'
            });
            
            // 添加控件
            map.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
                map.addControl(new AMap.ToolBar());
                map.addControl(new AMap.Scale());
            });
            
            // 监听地图完成事件
            return new Promise((resolve) => {
                map.on('complete', () => {
                    document.getElementById('mapStatus').textContent = '地图已就绪';
                    console.log('地图初始化完成');
                    resolve(true);
                });
            });
            
        } catch (error) {
            console.error('地图初始化失败:', error);
            document.getElementById('mapStatus').textContent = '地图加载失败，正在重试...';
            
            // 重试机制
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`重试第${this.retryCount}次...`);
                this.init();
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
                return this.initMap();
            }
            
            document.getElementById('mapStatus').textContent = '地图加载失败，请刷新页面重试';
            return false;
        }
    }
};
// 使用新的AppInitializer替换原有初始化代码
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.init().catch(error => {
        console.error('应用启动失败:', error);
        document.getElementById('mapStatus').textContent = '应用启动失败，请刷新页面重试';
    });
});
// 这些事件处理和插件加载逻辑已移至MapLoader.initMap()中,可以删除

  } catch (error) {
    console.error('地图初始化失败:', error);
    mapStatus.textContent = '地图初始化失败，请检查网络连接';
  }
  
  /**
   * 为输入框设置地点自动完成功能
   * @param {string} inputId - 输入框的DOM ID
   */
function setupAutocomplete(inputId) {
    try {
        AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch'], function() {
            // 创建自动完成实例
            const autoOptions = {
                input: inputId,
                city: '全国'  // 设置城市，全国范围
            };
            const autoComplete = new AMap.AutoComplete(autoOptions);
            
            // 创建地点搜索实例
            const placeSearch = new AMap.PlaceSearch({
                map: map,
                pageSize: 1
            });

            // 注册选择事件
            autoComplete.on('select', function(e) {
                try {
                    trackApiCall('autocomplete');
                    
                    // 更新输入框值
                    const input = document.getElementById(inputId);
                    input.value = e.poi.name;
                    if (e.poi.address) {
                        input.value += ` (${e.poi.address})`;
                    }
                    
                    // 在地图上显示选中位置
                    if (e.poi.location) {
                        placeSearch.setCity(e.poi.adcode);
                        placeSearch.search(e.poi.name);
                    }
                    
                    // 如果两个输入框都有值，自动规划路线
                    const from = document.getElementById('fromLocation').value;
                    const to = document.getElementById('toLocation').value;
                    if (from && to) {
                        setTimeout(() => planRoute(), 500); // 稍微延迟以确保值已更新
                    }

                    console.log('地点选择成功:', e.poi.name);
                } catch (error) {
                    console.error('地点选择处理失败:', error);
                    alert('地点选择处理失败，请重试');
                }
            });

            // 添加输入事件处理
            const input = document.getElementById(inputId);
            input.addEventListener('input', function() {
                if (!this.value.trim()) {
                    // 当输入框为空时清除地图上的标记
                    placeSearch.clear();
                }
            });

            console.log(`自动完成功能已设置: ${inputId}`);
        });
    } catch (error) {
        console.error('自动完成功能设置失败:', error);
        alert('地点搜索功能初始化失败，请刷新页面重试');
    }
}
  
// 删除此段代码
function updateTravelMode(mode) {
    currentTravelMode = mode;
    
    // 更新按钮状态
    UIManager.updateTravelModeButtons(mode);
    
    // 清除当前路线
    RouteManager.clearRoute();
    
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
        UIManager.showError('请输入起点和终点', 'routeInfo');
        return;
    }

    UIManager.updateLoadingState(true, 'routeInfo');

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
        UIManager.updateLoadingState(true, 'routeInfo');
        
        AMap.plugin('AMap.Driving', function() {
            const driving = new AMap.Driving(RouteManager.getRouteOptions('driving'));
            RouteManager.setRoute(driving);
            
            // 添加起点和终点标记
            RouteManager.createMarker(start, '起点', 'start');
            RouteManager.createMarker(end, '终点', 'end');
            
            driving.search(start, end, function(status, result) {
                UIManager.updateLoadingState(false, 'routeInfo');
                
                if (status === 'complete' && result.routes && result.routes[0]) {
                    trackApiCall('routing');
                    console.log('规划驾车路线成功');
                    
                    // 添加路线动画
                    const path = result.routes[0].steps.reduce((points, step) => {
                        return points.concat(step.path);
                    }, []);
                    RouteManager.animateRoute(path);
                    
                } else {
                    console.error('驾车路线规划失败:', result);
                    UIManager.showError('驾车路线规划失败，请重试', 'routeInfo');
                }
            });
        });
    } catch (error) {
        console.error('驾车路线规划服务加载失败:', error);
        UIManager.showError('服务加载失败，请刷新页面重试', 'routeInfo');
        UIManager.updateLoadingState(false, 'routeInfo');
    }
}

function planWalkingRoute(start, end) {
    try {
        UIManager.updateLoadingState(true, 'routeInfo');
        
        AMap.plugin('AMap.Walking', function() {
            const walking = new AMap.Walking(RouteManager.getRouteOptions('walking'));
            RouteManager.setRoute(walking);
            
            // 添加起点和终点标记
            RouteManager.createMarker(start, '起点', 'start');
            RouteManager.createMarker(end, '终点', 'end');
            
            walking.search(start, end, function(status, result) {
                UIManager.updateLoadingState(false, 'routeInfo');
                
                if (status === 'complete' && result.routes && result.routes[0]) {
                    trackApiCall('routing');
                    console.log('规划步行路线成功');
                    
                    // 添加路线动画
                    const path = result.routes[0].steps.reduce((points, step) => {
                        return points.concat(step.path);
                    }, []);
                    RouteManager.animateRoute(path);
                    
                } else {
                    console.error('步行路线规划失败:', result);
                    UIManager.showError('步行路线规划失败，请重试', 'routeInfo');
                }
            });
        });
    } catch (error) {
        console.error('步行路线规划服务加载失败:', error);
        UIManager.showError('服务加载失败，请刷新页面重试', 'routeInfo');
        UIManager.updateLoadingState(false, 'routeInfo');
    }
}

function planTransitRoute(start, end) {
    try {
        UIManager.updateLoadingState(true, 'routeInfo');
        
        AMap.plugin('AMap.Transfer', function() {
            const transfer = new AMap.Transfer(RouteManager.getRouteOptions('transit'));
            RouteManager.setRoute(transfer);
            
            // 添加起点和终点标记
            RouteManager.createMarker(start, '起点', 'start');
            RouteManager.createMarker(end, '终点', 'end');
            
            transfer.search(start, end, function(status, result) {
                UIManager.updateLoadingState(false, 'routeInfo');
                
                if (status === 'complete' && result.plans && result.plans[0]) {
                    trackApiCall('routing');
                    console.log('规划公交路线成功');
                    
                    // 添加路线动画
                    const path = result.plans[0].segments.reduce((points, segment) => {
                        return points.concat(segment.transit ? segment.transit.path : segment.walking.path);
                    }, []);
                    RouteManager.animateRoute(path);
                    
                } else {
                    console.error('公交路线规划失败:', result);
                    UIManager.showError('公交路线规划失败，请重试', 'routeInfo');
                }
            });
        });
    } catch (error) {
        console.error('公交路线规划服务加载失败:', error);
        UIManager.showError('服务加载失败，请刷新页面重试', 'routeInfo');
        UIManager.updateLoadingState(false, 'routeInfo');
    }
}

function planRidingRoute(start, end) {
    try {
        UIManager.updateLoadingState(true, 'routeInfo');
        
        AMap.plugin('AMap.Riding', function() {
            const riding = new AMap.Riding(RouteManager.getRouteOptions('riding'));
            RouteManager.setRoute(riding);
            
            // 添加起点和终点标记
            RouteManager.createMarker(start, '起点', 'start');
            RouteManager.createMarker(end, '终点', 'end');
            
            riding.search(start, end, function(status, result) {
                UIManager.updateLoadingState(false, 'routeInfo');
                
                if (status === 'complete' && result.routes && result.routes[0]) {
                    trackApiCall('routing');
                    console.log('规划骑行路线成功');
                    
                    // 添加路线动画
                    const path = result.routes[0].steps.reduce((points, step) => {
                        return points.concat(step.path);
                    }, []);
                    RouteManager.animateRoute(path);
                    
                } else {
                    console.error('骑行路线规划失败:', result);
                    UIManager.showError('骑行路线规划失败，请重试', 'routeInfo');
                }
            });
        });
    } catch (error) {
        console.error('骑行路线规划服务加载失败:', error);
        UIManager.showError('服务加载失败，请刷新页面重试', 'routeInfo');
        UIManager.updateLoadingState(false, 'routeInfo');
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