// 전역 검색 결과 저장소 (웹사이트 정보 매칭용)
let globalSearchResults = [];

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
		
		// 각 장소의 ID 출력
		data.forEach((place, idx) => {
			console.log(`${idx + 1}. ${place.place_name} - ID: ${place.id}`);
		});
		
		if (status === kakao.maps.services.Status.OK) {
			console.log('검색 성공! 결과 수:', data.length);
			
			// 크롤링 API로 추가 정보 가져오기 (영업시간, 전화번호, 웹사이트 등)
			console.log('[크롤링] 기본 정보 크롤링 시작 (영업시간, 전화번호, 웹사이트)...');
			enrichPlacesData(data).then(enrichedData => {
				console.log('[크롤링] 기본 정보 크롤링 완료');
				
				// 전역 변수에 검색 결과 저장
				globalSearchResults = enrichedData;
				
				displayResults(enrichedData);
				displayMarkers(enrichedData);
				
				// 웹사이트 정보 백그라운드 크롤링 시작 (병렬)
				console.log('[크롤링] 웹사이트 정보 백그라운드 크롤링 시작...');
				enrichWebsiteData(enrichedData);
			});
			
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

// 크롤링 API로 장소 정보 보강
async function enrichPlacesData(places) {
	console.log('크롤링 API로 정보 수집 시작...');
	
	// 각 장소에 대해 크롤링 시도 (비동기로 병렬 처리)
	const enrichPromises = places.map(async (place) => {
		try {
			// 크롤링 API 호출
			const response = await fetch('/api/crawl/place', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					placeName: place.place_name,
					placeUrl: place.place_url
				})
			});
			
			if (response.ok) {
				const crawledData = await response.json();
				console.log(`[${place.place_name}] 크롤링 성공:`, crawledData);
				
				// 크롤링한 데이터를 place 객체에 병합
				return {
					...place,
					businessHours: crawledData.businessHours || '영업 시간 정보 없음',
					crawledPhone: crawledData.phoneNumber,
					crawledAddress: crawledData.address
				};
			} else {
				console.log(`[${place.place_name}] 크롤링 API 응답 실패`);
				return place;
			}
		} catch (error) {
			// 크롤링 실패 시 원본 데이터 반환
			console.log(`[${place.place_name}] 크롤링 실패, 원본 데이터 사용:`, error);
			return place;
		}
	});
	
	// 모든 크롤링이 완료될 때까지 대기 (최대 5초)
	const timeoutPromise = new Promise(resolve => {
		setTimeout(() => resolve(places), 5000);
	});
	
	const enrichedPlaces = await Promise.race([
		Promise.all(enrichPromises),
		timeoutPromise
	]);
	
	console.log('크롤링 완료:', enrichedPlaces);
	return enrichedPlaces;
}

// 웹사이트 정보 백그라운드 크롤링 (비동기)
async function enrichWebsiteData(places) {
	console.log('[웹사이트] 크롤링 시작 - 총', places.length, '개 매장');
	
	// 각 장소에 대해 웹사이트 크롤링 (병렬)
	const websitePromises = places.map(async (place) => {
		if (!place.id) {
			console.log(`[${place.place_name}] Place ID 없음, 스킵`);
			return;
		}
		
		try {
			const response = await fetch('/api/crawl/website', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ placeId: place.id })
			});
			
			if (response.ok) {
				const result = await response.json();
				if (result.website) {
					place.website = result.website;
					console.log(`[OK] [${place.place_name}] 웹사이트: ${result.website}`);
				} else {
					console.log(`[INFO] [${place.place_name}] 웹사이트 정보 없음`);
				}
			}
		} catch (error) {
			console.error(`[ERROR] [${place.place_name}] 웹사이트 크롤링 실패:`, error);
		}
	});
	
	// 모든 크롤링 완료 대기 (백그라운드로 진행)
	await Promise.all(websitePromises);
	console.log('[웹사이트] 크롤링 완료');
}


