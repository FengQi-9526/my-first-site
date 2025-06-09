let map;
let currentRoute;

function initMap() {
    map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        center: [116.397428, 39.90923],  // 设置地图中心点
        zoom: 10,
    });
}

function updateTravelMode(mode) {
    // 当前的旅行模式更新逻辑保持不变，选择不同的路线规划
}

function getRoute() {
    let from = document.getElementById('fromLocation').value;
    let to = document.getElementById('toLocation').value;

    if (!from || !to) {
        alert('请输入起点和终点');
        return;
    }

    let fromGeo = new AMap.Geocoder();
    let toGeo = new AMap.Geocoder();

    fromGeo.getLocation(from, function(status, result) {
        if (status === 'complete' && result.geocodes.length) {
            let startPoint = result.geocodes[0].location;
            toGeo.getLocation(to, function(status, result) {
                if (status === 'complete' && result.geocodes.length) {
                    let endPoint = result.geocodes[0].location;
                    // 获取路径
                    requestRoute(startPoint, endPoint);
                }
            });
        }
    });
}

// 请求路线规划数据
function requestRoute(startPoint, endPoint) {
    let url = `https://restapi.amap.com/v3/direction/driving?key=YOUR_API_KEY&origin=${startPoint.lng},${startPoint.lat}&destination=${endPoint.lng},${endPoint.lat}&extensions=all`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.route && data.route.paths.length > 0) {
                let path = data.route.paths[0];
                let polyline = path.steps.map(step => step.polyline).join('|');
                let points = polyline.split('|').map(p => p.split(',').map(Number));

                // 绘制路线
                let line = new AMap.Polyline({
                    path: points,
                    strokeColor: '#0091ff',
                    strokeWeight: 5,
                    strokeOpacity: 0.7,
                });
                line.setMap(map);
                map.setFitView();
            } else {
                alert('未找到路线');
            }
        })
        .catch(error => {
            console.error('获取路线失败：', error);
            alert('获取路线失败');
        });
}

window.onload = function() {
    initMap();

    let buttons = document.querySelectorAll('.transport-options button');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            updateTravelMode(event.target.textContent.toLowerCase());
        });
    });

    document.getElementById('getRouteButton').addEventListener('click', getRoute);
};
