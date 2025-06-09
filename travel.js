let map;
let driving;
let transit;
let walking;
let riding;
let currentRoute;

function initMap() {
    map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        center: [116.397428, 39.90923],  // 设置地图中心点
        zoom: 10,
    });

    // 初始化路线规划服务
    driving = new AMap.Driving({
        map: map,
        panel: 'routeInfo',
    });

    transit = new AMap.Transit({
        map: map,
        panel: 'routeInfo',
    });

    walking = new AMap.Walking({
        map: map,
        panel: 'routeInfo',
    });

    riding = new AMap.Riding({
        map: map,
        panel: 'routeInfo',
    });

    document.getElementById('mapStatus').textContent = '地图加载完成';
}

function updateTravelMode(mode) {
    if (currentRoute) {
        currentRoute.clear();
    }

    switch (mode) {
        case 'driving':
            currentRoute = driving;
            break;
        case 'transit':
            currentRoute = transit;
            break;
        case 'walking':
            currentRoute = walking;
            break;
        case 'riding':
            currentRoute = riding;
            break;
        default:
            currentRoute = driving;
            break;
    }

    let buttons = document.querySelectorAll('.transport-options button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
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
                    currentRoute.search(startPoint, endPoint);
                }
            });
        }
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
