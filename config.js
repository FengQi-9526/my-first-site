// 高德地图配置文件
const config = {
    // 优先从环境变量获取API Key，如果不存在则使用备用值
    amapKey: typeof process !== 'undefined' && process.env.AMAP_KEY 
        ? process.env.AMAP_KEY 
        : '你的高德地图API密钥'  // 在这里替换成你的API密钥
};

// 防止config未定义错误
if (typeof config === 'undefined') {
    console.error('地图配置加载失败');
}
