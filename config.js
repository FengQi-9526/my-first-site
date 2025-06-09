// 高德地图配置
window.mapConfig = {
    apiKey: '1bd27163e674d34347e9ab8bfae19ecc',  // 高德Web端JavaScript API Key

    // 插件配置
    plugins: [
        'AMap.ToolBar',        // 工具条控件
        'AMap.Scale',          // 比例尺控件
        'AMap.Geocoder',       // 地理编码服务
        'AMap.AutoComplete',   // 地点搜索服务
        'AMap.PlaceSearch',    // 地点详细信息查询
        'AMap.Driving',        // 驾车路线规划
        'AMap.Walking',        // 步行路线规划
        'AMap.Transfer',       // 公交路线规划
        'AMap.Riding',         // 骑行路线规划
        'AMap.Weather'         // 天气查询服务
    ],

    // 地图初始化配置
    mapOptions: {
        zoom: 12,              // 初始缩放级别
        center: [116.397428, 39.90923],  // 初始中心点（北京）
        resizeEnable: true,    // 是否监控地图容器尺寸变化
        viewMode: '2D',        // 地图模式
        lang: 'zh_cn',         // 地图语言
    },

    // 路线规划配置
    routeOptions: {
        showTraffic: true,     // 显示实时路况
        autoFitView: true      // 自动调整视野以显示所有标记点
    },

    // API访问限制
    apiLimits: {
        maxTokensPerDay: 1000,  // 每日最大调用次数
        tokensPerCall: {        // 每次调用消耗的token数
            autocomplete: 1,     // 地点自动完成
            geocoder: 1,        // 地理编码
            routing: 2,         // 路线规划
            weather: 1          // 天气查询
        }
    },

    // 调试选项
    debug: {
        logApiCalls: true,     // 记录API调用
        showErrors: true       // 显示详细错误信息
    },

    // 安全设置
    security: {
        allowedDomains: ['localhost', 'fengqi-first-site.netlify.app'],  // 允许的域名
        useHttps: true         // 是否使用HTTPS
    },

    // 自定义样式
    customStyle: {
        routeColors: {
            driving: '#0091ff',  // 驾车路线颜色
            walking: '#28a745',  // 步行路线颜色
            transit: '#6610f2',  // 公交路线颜色
            riding: '#fd7e14'    // 骑行路线颜色
        }
    }
};

// 验证配置加载
console.log('地图配置已加载');

// 导出配置（用于Node.js环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.mapConfig;
}
