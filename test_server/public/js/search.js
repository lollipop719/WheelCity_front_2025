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
		
		// 전역 변수에 검색 결과 저장 (기본 데이터)
		globalSearchResults = data;
		
		// 즉시 화면에 표시 (크롤링 없이)
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
		
		// 백그라운드에서 크롤링 시작 (완료되면 자동 업데이트)
		console.log('[크롤링] 백그라운드 크롤링 시작...');
		enrichPlacesDataInBackground(data);
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

// 백그라운드에서 각 장소를 개별적으로 크롤링 (완료되면 즉시 화면 업데이트)
async function enrichPlacesDataInBackground(places) {
	console.log('크롤링 API로 정보 수집 시작 (개별 업데이트)...');
	
	// 각 장소에 대해 웹사이트 크롤링 (영업시간 포함)
	// place.kakao.com 페이지에서 모든 정보를 한 번에 크롤링
	places.forEach(async (place, index) => {
		if (!place.id) {
			console.log(`[${place.place_name}] Place ID 없음, 크롤링 스킵`);
			return;
		}
		
		try {
			// place.kakao.com에서 영업시간 + 웹사이트 정보 크롤링
			enrichWebsiteDataForPlace(place, index);
		} catch (error) {
			console.log(`[${place.place_name}] 크롤링 실패:`, error);
		}
	});
}

// 단일 장소의 결과 항목 업데이트
function updateResultItem(index, place) {
	const resultItem = document.querySelector(`.result-item[data-index="${index}"]`);
	if (!resultItem) return;
	
	// 영업시간 정보 업데이트
	const hoursElement = resultItem.querySelector('.result-hours');
	
	if (place.businessHours && place.businessHours !== '영업 시간 정보 없음') {
		let displayText = '';
		
		if (typeof place.businessHours === 'object' && place.businessHours.summary) {
			const summary = place.businessHours.summary;
			
			// "영업 중 · 21:00 까지" 형식 파싱
			if (summary.includes('영업 중')) {
				const timeMatch = summary.match(/(\d{1,2}:\d{2})\s*까지/);
				if (timeMatch) {
					displayText = '<span style="color: #00a86b;">영업중</span> · ' + timeMatch[1] + '에 영업 종료';
				} else {
					displayText = '<span style="color: #00a86b;">영업중</span>';
				}
			} else if (summary.includes('영업 종료')) {
				const nextOpenText = getNextOpenTime(place.businessHours);
				displayText = '<span style="color: #999;">영업종료</span> · ' + nextOpenText;
			} else if (summary.includes('휴무')) {
				const nextOpenText = getNextOpenTime(place.businessHours);
				displayText = '<span style="color: #f44;">휴무</span> · ' + nextOpenText;
			} else {
				displayText = '';
			}
		} else if (typeof place.businessHours === 'string') {
			if (place.businessHours.includes('영업 중')) {
				displayText = '<span style="color: #00a86b;">영업중</span>';
			} else if (place.businessHours.includes('영업 종료')) {
				displayText = '<span style="color: #999;">영업종료</span>';
			} else if (place.businessHours.includes('휴무')) {
				displayText = '<span style="color: #f44;">휴무</span>';
			}
		}
		
		if (displayText && hoursElement) {
			hoursElement.innerHTML = displayText;
			hoursElement.className = 'result-hours';
			hoursElement.style.display = 'block';
		}
	}
}

// 현재 열려있는 상세 패널 업데이트
function updateOpenDetailPanel(place) {
	const placeDetail = document.getElementById('placeDetail');
	const placeTitle = document.getElementById('placeTitle');
	
	// 상세 패널이 열려있고, 현재 표시 중인 장소가 맞는지 확인
	if (!placeDetail || placeDetail.style.display === 'none') {
		return;
	}
	
	if (!placeTitle || placeTitle.textContent !== place.place_name) {
		return;
	}
	
	console.log(`[상세 패널 업데이트] ${place.place_name}의 영업시간 정보 갱신`);
	
	// 영업시간 정보 업데이트
	const hoursItem = document.getElementById('hoursItem');
	const statusElement = document.getElementById('placeStatus');
	const hoursElement = document.getElementById('placeHours');
	const hoursDetailElement = document.getElementById('hoursDetail');
	const hoursToggle = document.getElementById('hoursToggle');
	
	if (place.businessHours && typeof place.businessHours === 'object' && place.businessHours.summary) {
		// 영업 상태 표시
		const businessStatus = parseBusinessStatus(place.businessHours.summary);
		
		// 영업종료/휴무 시 다음 영업일 정보 추가
		if (!businessStatus.isOpen && place.businessHours.dailyHours) {
			const nextOpenText = getNextOpenTime(place.businessHours);
			if (nextOpenText && nextOpenText !== '영업 시작 시간 확인') {
				businessStatus.hours = nextOpenText;
			}
		}
		
		if (statusElement && hoursElement) {
			statusElement.textContent = businessStatus.status;
			statusElement.className = 'business-status ' + (businessStatus.isOpen ? 'open' : 'closed');
			hoursElement.textContent = businessStatus.hours;
		}
		
		// 요일별 상세 정보
		if (place.businessHours.dailyHours && hoursDetailElement) {
			const dailyHoursHtml = generateDailyHoursHtml(place.businessHours.dailyHours, 4);
			
			if (dailyHoursHtml) {
				hoursDetailElement.innerHTML = dailyHoursHtml;
				
				// 추가 정보
				if (place.businessHours.additionalInfo) {
					hoursDetailElement.innerHTML += '<div style="margin-top: 8px; color: #999; font-size: 12px;">' + 
						place.businessHours.additionalInfo + '</div>';
				}
				
				// 토글 버튼 활성화
				if (hoursToggle) {
					hoursToggle.style.display = 'inline';
				}
				
				// 클릭 이벤트 재등록
				const hoursMainWrapper = document.getElementById('hoursMainWrapper');
				if (hoursMainWrapper) {
					const newWrapper = hoursMainWrapper.cloneNode(true);
					hoursMainWrapper.parentNode.replaceChild(newWrapper, hoursMainWrapper);
					
					newWrapper.addEventListener('click', function() {
						const detail = document.getElementById('hoursDetail');
						const toggle = document.getElementById('hoursToggle');
						if (detail && toggle) {
							if (detail.style.display === 'none') {
								detail.style.display = 'block';
								toggle.src = '/img/image-24-1.png'; // 위쪽 화살표
							} else {
								detail.style.display = 'none';
								toggle.src = '/img/image-24-2.png'; // 아래쪽 화살표
							}
						}
					});
				}
			}
		}
		
		// 영업시간 항목 표시
		if (hoursItem) {
			hoursItem.style.display = '';
		}
	}
	
	// 웹사이트 정보 업데이트
	if (place.website) {
		const websiteItem = document.getElementById('websiteItem');
		const websiteLink = document.getElementById('placeWebsite');
		
		if (websiteItem && websiteLink) {
			websiteLink.href = place.website;
			websiteLink.textContent = place.website;
			websiteItem.style.display = '';
		}
	}
}

// 단일 장소의 웹사이트 정보 크롤링
async function enrichWebsiteDataForPlace(place, index) {
  if (!place.id) {
    console.log(`[${place.place_name}] Place ID 없음, 웹사이트 크롤링 스킵`);
    return;
  }
  
  try {
    const response = await fetch('/crawl/website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ placeId: place.id })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // 웹사이트 정보 업데이트
      if (result.website) {
        place.website = result.website;
        console.log(`[OK] [${place.place_name}] 웹사이트: ${result.website}`);
      }
      
      // 영업시간 정보 업데이트 (웹사이트 여부와 무관하게)
      if (result.businessHours) {
        place.businessHours = result.businessHours;
        console.log(`[OK] [${place.place_name}] 영업시간 업데이트:`, result.businessHours);
        
        // 검색 결과 목록 업데이트
        updateResultItem(index, place);
        
        // 현재 열려있는 상세 패널도 업데이트
        updateOpenDetailPanel(place);
      }
      
      // globalSearchResults 업데이트
      if (globalSearchResults && globalSearchResults[index]) {
        globalSearchResults[index] = place;
      }
      
      if (!result.website && !result.businessHours) {
        console.log(`[INFO] [${place.place_name}] 추가 정보 없음`);
      }
    }
  } catch (error) {
    console.error(`[ERROR] [${place.place_name}] 웹사이트 크롤링 실패:`, error);
  }
}
