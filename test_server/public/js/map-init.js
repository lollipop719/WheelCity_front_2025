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

