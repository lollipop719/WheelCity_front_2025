// 검색 결과창 닫기 버튼
document.addEventListener('DOMContentLoaded', function () {
	var closeBtn = document.getElementById('searchResultsClose');
	var searchResults = document.getElementById('searchResults');
	var placeDetail = document.getElementById('placeDetail');

	if (closeBtn && searchResults) {
		closeBtn.addEventListener('click', function () {
			// 검색 결과 패널 닫기
			searchResults.style.display = 'none';

			// 혹시 떠 있었을 수 있는 상세 패널도 같이 닫기
			if (placeDetail) {
				placeDetail.style.display = 'none';
			}

			// 지도 위 마커 모두 제거
			clearAllMarkersFromMap();
		});
	}
});

// 상세 정보 닫기 버튼
document.getElementById('placeDetailClose').addEventListener('click', function() {
	// 지도 위 마커 모두 제거
	clearAllMarkersFromMap();

	document.getElementById('placeDetail').style.display = 'none';
	document.getElementById('searchResults').style.display = 'none';   // 원래 flex였는데 none으로 바꿈. 검색 결과창까지 닫기로 변경함. 뒤로가기 버튼을 따로 만드는게 좋을듯.
});

// 지도 위 검색/상세 마커 전체 지우기
function clearAllMarkersFromMap() {
	if (typeof markers !== 'undefined' && Array.isArray(markers)) {
		markers.forEach(function (marker) {
			if (marker && typeof marker.setMap === 'function') {
				marker.setMap(null); // 지도에서 제거
			}
		});
	}
}

// 검색 버튼 클릭
document.getElementById('searchBtn').addEventListener('click', function() {
	var keyword = document.getElementById('searchInput').value.trim();
	console.log('검색 버튼 클릭! 키워드:', keyword);
	if (keyword) {
		console.log('키워드 검색 실행:', keyword);
		searchPlaces(keyword, null);
	} else if (currentCategory) {
		console.log('카테고리 검색 실행:', currentCategory);
		searchPlaces(null, currentCategory);
	} else {
		console.log('검색어가 없습니다.');
	}
});

// 엔터키 검색
document.getElementById('searchInput').addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		var keyword = this.value.trim();
		console.log('엔터키 입력! 키워드:', keyword);
		if (keyword) {
			console.log('키워드 검색 실행:', keyword);
			searchPlaces(keyword, null);
		} else if (currentCategory) {
			console.log('카테고리 검색 실행:', currentCategory);
			searchPlaces(null, currentCategory);
		} else {
			console.log('검색어가 없습니다.');
		}
	}
});

// 필터 버튼 클릭
document.querySelectorAll('.filter-btn').forEach(btn => {
	btn.addEventListener('click', function() {
		this.classList.toggle('active');
		// 필터링 로직은 여기에 추가 가능
		console.log('Filter:', this.dataset.filter, 'Active:', this.classList.contains('active'));
	});
});

// 탭 클릭 이벤트
document.querySelectorAll('.place-detail-tab').forEach(tab => {
	tab.addEventListener('click', function() {
		const tabName = this.dataset.tab;
		
		// 모든 탭의 active 클래스 제거
		document.querySelectorAll('.place-detail-tab').forEach(t => {
			t.classList.remove('active');
		});
		// 클릭한 탭에 active 클래스 추가
		this.classList.add('active');
		
		// 모든 탭 컨텐츠 숨기기
		document.querySelectorAll('.tab-content').forEach(content => {
			content.classList.remove('active');
		});
		// 해당 탭 컨텐츠 보이기
		const targetContent = document.getElementById('tab-' + tabName);
		if (targetContent) {
			targetContent.classList.add('active');
		}
		
		console.log('탭 선택:', tabName);
	});
});

