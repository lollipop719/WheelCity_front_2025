// 지도 초기화 및 전역 변수
var container = document.getElementById('map');
var options = {
	center: new kakao.maps.LatLng(36.3734, 127.3628), //KAIST 중심좌표
	level: 4
};

var map = new kakao.maps.Map(container, options);
var places = new kakao.maps.services.Places();
var markers = [];
var currentCategory = null;

// 현재 지도 중심 좌표를 저장하는 전역 변수
var currentCenter = map.getCenter();

// 지도 중심이 변경될 때마다 currentCenter 변수 업데이트
kakao.maps.event.addListener(map, 'center_changed', function() {
	currentCenter = map.getCenter();
	console.log('지도 중심 변경됨:', currentCenter.getLat(), currentCenter.getLng());
});





