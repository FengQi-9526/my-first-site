window.onload = function () {
  // 初始化地图，默认中心：北京
  var map = new AMap.Map('map', {
    zoom: 12,
    center: [116.397428, 39.90923]
  });

  // 默认标记
  var marker = new AMap.Marker({
    position: [116.397428, 39.90923],
    map: map,
    title: '北京 - 默认位置'
  });

  // TODO：后续添加路线、天气、穿搭建议等功能
};
