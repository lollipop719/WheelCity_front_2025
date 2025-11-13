// 상세 정보 닫기 버튼
document.getElementById('placeDetailClose').addEventListener('click', function() {
	// 모든 마커 다시 표시
	markers.forEach(marker => {
		marker.setMap(map);
	});
	
	document.getElementById('placeDetail').style.display = 'none';
	document.getElementById('searchResults').style.display = 'flex';
});

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

// 리뷰 작성 버튼 클릭 이벤트
document.getElementById('reviewWriteBtn').addEventListener('click', function(e) {
	e.preventDefault();
	
	// 현재 표시중인 장소 정보 가져오기
	var placeName = document.getElementById('placeTitle').textContent;
	var placeAddress = document.getElementById('placeAddress').textContent;
	
	console.log('리뷰 작성 페이지로 이동:', placeName);
	
	// TODO: 리뷰 작성 페이지로 이동 (나중에 구현)
	// 임시로 알림 표시
	alert('리뷰 작성 페이지는 준비 중입니다.\n\n장소: ' + placeName + '\n주소: ' + placeAddress);
	
	// 실제 구현 시에는 아래와 같이 사용:
	// window.location.href = '/review/write?place=' + encodeURIComponent(placeName);
});


