// 高德地图配置文件
const config = {
    // API密钥配置
    amapKey: 'a5fe731067256974fd20e6bb3e49bc63',

    plugins: [
        'AMap.ToolBar',        // 工具条
        'AMap.Scale',         // 比例尺
        'AMap.Geocoder',      // 地理编码
        'AMap.AutoComplete',   // 地点自动完成
        'AMap.Driving',       // 驾车路线规划
        'AMap.Walking',       // 步行路线规划
        'AMap.Transit',       // 公交路线规划
        'AMap.Riding',        // 骑行路线规划
        'AMap.Weather'        // 天气查询
    ],

    mapOptions: {
        zoom: 12,             // 初始缩放级别
        resizeEnable: true,   // 允许改变地图大小
        viewMode: '2D',       // 地图模式
        center: [116.397428, 39.90923]  // 默认中心点（北京）
    },

    apiLimits: {
        maxTokensPerDay: 1000,  // 每日最大调用次数
        tokensPerCall: {        // 每次调用消耗的token数
            autocomplete: 1,     // 地点自动完成
            geocoder: 1,        // 地理编码
            routing: 2,         // 路线规划
            weather: 1          // 天气查询
        }
    },

    securityDomains: [
        'fengqi-first-site.netlify.app'  // 已添加到白名单的域名
    ]
};

// 确保配置在不同环境中可用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;  // Node.js环境
} else {
    window.mapConfig = config;  // 浏览器环境
}

// 验证配置是否加载
console.log('地图配置已加载');