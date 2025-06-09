// 高德地图配置文件
const config = {
    // API密钥配置
    amapKey: '1bd27163e674d34347e9ab8bfae19ecc',  // ← 在这里替换成你的实际API密钥
    
    // 地图初始配置
    mapConfig: {
        zoom: 11,           // 初始缩放级别
        resizeEnable: true, // 允许地图自适应容器大小
        center: [116.397428, 39.90923]  // 默认中心点（北京）
    },
    
    // API插件配置
    plugins: [
        'AMap.Geocoder',      // 地理编码
        'AMap.AutoComplete',  // 地点自动完成
        'AMap.Driving',       // 驾车路线规划
        'AMap.Walking',       // 步行路线规划
        'AMap.Transfer',      // 公交路线规划
        'AMap.Riding',        // 骑行路线规划
        'AMap.Weather',       // 天气查询
        'AMap.ToolBar',       // 工具条控件
        'AMap.Scale'          // 比例尺控件
    ]
};

// 确保配置在不同环境中可用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;  // Node.js环境
} else {
    window.mapConfig = config;  // 浏览器环境
}