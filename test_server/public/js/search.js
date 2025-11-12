// 검색 함수
function searchPlaces(keyword, category) {
	console.log('=== searchPlaces 함수 실행 ===');
	console.log('키워드:', keyword);
	console.log('카테고리:', category);
	
	// 기존 마커 제거
	markers.forEach(marker => marker.setMap(null));
	markers = [];
	
	// 상세 정보 패널 숨기기
	document.getElementById('placeDetail').style.display = 'none';

	var callback = function(data, status) {
		console.log('검색 상태:', status);
		console.log('검색 데이터:', data);
		
		if (status === kakao.maps.services.Status.OK) {
			console.log('검색 성공! 결과 수:', data.length);
			displayResults(data);
			displayMarkers(data);
			
			// 검색 결과 패널 표시
			document.getElementById('searchResults').style.display = 'flex';
			
			// 지도 범위 조정
			var bounds = new kakao.maps.LatLngBounds();
			data.forEach(place => {
				bounds.extend(new kakao.maps.LatLng(place.y, place.x));
			});
			map.setBounds(bounds);
		} else if (status === kakao.maps.services.Status.ZERO_RESULT) {
			console.log('검색 결과 없음');
			document.getElementById('resultList').innerHTML = '<div style="padding: 26px; text-align: center; color: #999;">검색 결과가 없습니다.</div>';
			document.getElementById('searchResults').style.display = 'flex';
		} else if (status === kakao.maps.services.Status.ERROR) {
			console.error('검색 에러 발생!');
			document.getElementById('resultList').innerHTML = '<div style="padding: 26px; text-align: center; color: #f44;">검색 중 오류가 발생했습니다.</div>';
			document.getElementById('searchResults').style.display = 'flex';
		} else {
			console.log('기타 상태:', status);
			document.getElementById('resultList').innerHTML = '<div style="padding: 26px; text-align: center; color: #999;">검색 결과가 없습니다.</div>';
			document.getElementById('searchResults').style.display = 'flex';
		}
	};

	if (category) {
		// 카테고리 검색
		places.categorySearch(category, callback, {
			location: map.getCenter(),
			radius: 5000
		});
	} else if (keyword) {
		// 키워드 검색
		places.keywordSearch(keyword, callback, {
			location: map.getCenter(),
			radius: 5000
		});
	}
}

