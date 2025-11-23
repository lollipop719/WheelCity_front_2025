// public/js/location.js
// 내 위치 버튼 + 방향 표시

(function () {
  // kakao 지도나 map 이 아직 준비 안 된 경우를 대비
  if (!window.kakao) return;

  const btn = document.getElementById('myLocationBtn');
  if (!btn) return;

  let myLocationOverlay = null;   // kakao.maps.CustomOverlay
  let myLocationEl = null;        // DOM element (방향 회전을 위해 보관)

  function ensureOverlay(lat, lng) {
    const pos = new kakao.maps.LatLng(lat, lng);

    if (!myLocationOverlay) {
      // DOM 생성
      myLocationEl = document.createElement('div');
      myLocationEl.className = 'my-location-marker';
      myLocationEl.innerHTML = '<div class="my-location-marker-inner"></div>';

      myLocationOverlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: myLocationEl,
        yAnchor: 0.5,
        xAnchor: 0.5
      });
      myLocationOverlay.setMap(window.map);
    } else {
      myLocationOverlay.setPosition(pos);
    }

    return pos;
  }

  function updateHeading(heading) {
    if (!myLocationEl) return;

    // heading 이 숫자이고 0 이상일 때만 회전 적용
    if (typeof heading === 'number' && heading >= 0) {
      myLocationEl.style.transform = 'rotate(' + heading + 'deg)';
    } else {
      myLocationEl.style.transform = 'rotate(0deg)';
    }
  }

  function goToMyLocation() {
    if (!navigator.geolocation) {
      alert('현재 브라우저에서는 위치 정보를 사용할 수 없어요.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const { latitude, longitude, heading } = pos.coords;

        // 오버레이(내 위치 마커) 만들고/위치 갱신
        const center = ensureOverlay(latitude, longitude);
        updateHeading(heading);

        // 지도 중심 이동
        if (window.map) {
          window.map.setCenter(center);
        }
      },
      function (err) {
        console.error('getCurrentPosition error', err);
        alert('현재 위치를 가져올 수 없어요. 위치 권한이 허용되었는지 확인해 주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // 버튼 클릭 시 내 위치로 이동
  btn.addEventListener('click', function () {
    goToMyLocation();
  });
})();
