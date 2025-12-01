// public/js/location.js
// 내 위치 버튼 + 방향 표시

(function () {
  // kakao 지도나 map 이 아직 준비 안 된 경우를 대비
  if (!window.kakao) return;

  const btn = document.getElementById('myLocationBtn');
  if (!btn) return;

  let myLocationOverlay = null;   // kakao.maps.CustomOverlay
  let myLocationEl = null;        // DOM element (방향 회전을 위해 보관)
  let isGettingLocation = false;  // 위치 요청 중복 방지 플래그

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

    // 이미 위치 요청 중이면 중복 요청 방지
    if (isGettingLocation) {
      console.log('위치 요청이 이미 진행 중입니다.');
      return;
    }

    isGettingLocation = true;

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        isGettingLocation = false;  // 요청 완료
        window.hasLocationSuccess = true;   // 전역 플래그 설정 (위치 가져오기 성공)
        
        const { latitude, longitude, heading } = pos.coords;

        // 오버레이(내 위치 마커) 만들고/위치 갱신
        const center = ensureOverlay(latitude, longitude);
        updateHeading(heading);

        // 지도 중심 이동
        if (window.map) {
          window.map.setCenter(center);
        }
        
        // 성공적으로 위치를 가져왔으므로 에러 메시지 표시 안 함
        console.log('✅ 현재 위치 가져오기 성공:', latitude, longitude);
      },
      function (err) {
        isGettingLocation = false;  // 요청 완료 (실패)
        
        // 이미 위치를 성공적으로 가져왔다면 에러 메시지 표시 안 함
        if (window.hasLocationSuccess) {
          console.log('위치는 이미 성공적으로 가져왔으므로 에러 메시지를 표시하지 않습니다.');
          return;
        }
        
        // 에러 타입별로 구분하여 처리
        let errorMessage = '현재 위치를 가져올 수 없어요.';
        
        switch(err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었어요. 브라우저 설정에서 위치 권한을 허용해 주세요.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없어요.';
            break;
          case err.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었어요. 다시 시도해 주세요.';
            break;
          default:
            errorMessage = '현재 위치를 가져올 수 없어요. 위치 권한이 허용되었는지 확인해 주세요.';
            break;
        }
        
        console.error('getCurrentPosition error', err);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,  // 타임아웃을 15초로 늘림
        maximumAge: 60000  // 1분 이내 캐시된 위치 허용
      }
    );
  }

  // 버튼 클릭 시 내 위치로 이동
  btn.addEventListener('click', function () {
    goToMyLocation();
  });
})();
