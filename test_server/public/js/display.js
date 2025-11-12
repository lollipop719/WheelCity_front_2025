// 검색 결과 표시
function displayResults(data) {
	// 디버깅: 모든 검색 결과의 카테고리 출력
	console.log('=== 검색 결과 ===');
	data.forEach((place, idx) => {
		console.log(`${idx + 1}. ${place.place_name}`);
		console.log('   카테고리:', place.category_name);
	});
	console.log('==================');
	
	var resultsHtml = '';
	data.forEach((place, index) => {
		var status = place.place_url ? '영업중' : '정보 없음';
		var hours = place.place_url ? '영업 시간 정보 없음' : '';
		var reviewCount = place.place_url ? '리뷰 정보 없음' : '';
		
		resultsHtml += `
			<div class="result-item" data-index="${index}">
				<div class="result-content">
					<div class="result-details">
						<div class="result-header">
							<div>
								<h3 class="result-name">${place.place_name}</h3>
								<div class="result-status">${status}</div>
								<div class="result-hours">${hours}</div>
							</div>
						</div>
						<div class="result-info">
							<span>${reviewCount}</span>
							<span class="accessibility-tag">접근성 정보</span>
						</div>
					</div>
					<img src="${place.place_url ? 'https://via.placeholder.com/60' : 'https://via.placeholder.com/60'}" alt="${place.place_name}" class="result-thumbnail" onerror="this.src='https://via.placeholder.com/60'">
				</div>
			</div>
		`;
	});
	document.getElementById('resultList').innerHTML = resultsHtml;

	// 결과 항목 클릭 이벤트
	document.querySelectorAll('.result-item').forEach((item, index) => {
		item.addEventListener('click', function() {
			var place = data[index];
			var position = new kakao.maps.LatLng(place.y, place.x);
			map.setCenter(position);
			map.setLevel(3);
			
			// 해당 마커 찾기
			var selectedMarker = markers[index];
			
			// 상세 정보 표시
			showPlaceDetail(place, selectedMarker);
		});
	});
}

// 매장 상세 정보 표시
function showPlaceDetail(place, selectedMarker) {
	// 검색창 비우기
	document.getElementById('searchInput').value = '';
	
	// 디버깅: 전체 카테고리 정보 출력
	console.log('=== 매장 정보 ===');
	console.log('매장명:', place.place_name);
	console.log('전체 카테고리:', place.category_name);
	console.log('주소:', place.address_name);
	
	// 매장명
	document.getElementById('placeTitle').textContent = place.place_name;
	
	// 카테고리 - 조건부 표시
	var category = '카테고리 정보 없음';
	if (place.category_name) {
		var categories = place.category_name.split('>').map(c => c.trim());
		var lowestCategory = categories[categories.length - 1]; // 제일 하위 분류
		
		// 매장명의 첫 단어 추출
		var firstWord = place.place_name.split(' ')[0];
		
		// 첫 단어와 제일 하위 분류 비교
		if (firstWord === lowestCategory && categories.length > 1) {
			// 같으면 한 단계 상위 분류 표시
			category = categories[categories.length - 2];
		} else {
			// 다르면 제일 하위 분류 표시
			category = lowestCategory;
		}
		
		console.log('카테고리 배열:', categories);
		console.log('첫 단어:', firstWord);
		console.log('하위 분류:', lowestCategory);
		console.log('표시할 카테고리:', category);
	}
	document.getElementById('placeCategory').textContent = category;
	
	// 리뷰 개수 (임시로 랜덤 생성 - 실제로는 API에서 가져와야 함)
	var reviewCount = Math.floor(Math.random() * 1500) + 50;
	var reviewText = reviewCount >= 1000 ? '리뷰 999+' : '리뷰 ' + reviewCount;
	document.getElementById('placeReviews').textContent = reviewText;
	
	// 주소와 전화번호
	document.getElementById('placeAddress').textContent = place.address_name || place.road_address_name || '주소 정보 없음';
	document.getElementById('placePhone').textContent = place.phone || '전화번호 정보 없음';
	
	// 접근성 체크 아이콘 랜덤 표시 (50% 확률)
	var showCheck = Math.random() < 0.5;
	document.getElementById('checkIcon').style.display = showCheck ? 'block' : 'none';
	console.log('체크 아이콘 표시:', showCheck);
	
	// 선택된 마커를 제외한 모든 마커 숨기기
	markers.forEach(marker => {
		if (marker.placeData && 
			marker.placeData.place_name === place.place_name && 
			marker.placeData.x === place.x && 
			marker.placeData.y === place.y) {
			marker.setMap(map); // 선택된 마커만 표시
		} else {
			marker.setMap(null); // 나머지 마커 숨기기
		}
	});
	
	// 검색 결과 패널 숨기고 상세 정보 표시
	document.getElementById('searchResults').style.display = 'none';
	document.getElementById('placeDetail').style.display = 'block';
}

