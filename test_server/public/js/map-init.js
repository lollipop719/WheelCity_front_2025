/* ============================
   지도 초기화 및 전역 변수
   ============================ */

// 내 위치 마커 (모바일용)
let myLocationMarker = null;

// 지도 초기 설정
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(36.3734, 127.3628), // KAIST 중심좌표
    level: 4
};

var map = new kakao.maps.Map(container, options);
var places = new kakao.maps.services.Places();
var markers = [];
var currentCategory = null;

// 현재 지도 중심 좌표 저장
var currentCenter = map.getCenter();

// 지도 중심 변경 이벤트
kakao.maps.event.addListener(map, 'center_changed', function () {
    currentCenter = map.getCenter();
    console.log('지도 중심 변경됨:', currentCenter.getLat(), currentCenter.getLng());
});


/* ============================
   모바일에서 내 위치 표시 기능
   ============================ */

function initUserLocationOnMobile() {
    // 📌 모바일 판별 (userAgent + media query)
    const isMobile =
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) return; // PC에서는 실행 X

    if (!navigator.geolocation) {
        console.log("이 브라우저는 위치 정보를 지원하지 않습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const loc = new kakao.maps.LatLng(lat, lng);

            // 기존 내 위치 마커 제거
            if (myLocationMarker) {
                myLocationMarker.setMap(null);
            }

            // 내 위치 마커 생성 (스타 마커 사용)
            myLocationMarker = new kakao.maps.Marker({
                position: loc,
                map: map,
                zIndex: 20,
                image: new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                    new kakao.maps.Size(24, 35)
                )
            });

            // 지도 중심을 내 위치로 이동
            map.setCenter(loc);
            console.log("📍 모바일 내 위치 적용:", lat, lng);
        },
        function (err) {
            console.warn("위치 정보 가져오기 실패:", err);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// 실제 실행
initUserLocationOnMobile();




