// 전역 검색 결과 저장소 (웹사이트 정보 매칭용)
let globalSearchResults = [];

//자동완성(검색 추천) 기능
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");

let suggestDebounceTimer = null;
let lastSuggestRequestId = 0;   // 오래된 응답 무시용
let suggestionsEnabled = true;   // 추천 표시 여부 플래그

// 현재 입력창 값이 특정 query와 동일하고 비어있지 않은지 확인
function isActiveQuery(query) {
  if (!searchInput) return true;
  const current = searchInput.value.trim();
  return current.length > 0 && current === query.trim();
}

// 추천 리스트 지우기 & 숨기기
function clearSuggestions() {
  if (!searchSuggestions) return;
  searchSuggestions.innerHTML = "";
  searchSuggestions.style.display = "none";
}

// 지도 중심과 장소 사이의 거리(m) 계산
function getDistanceFromCenter(place) {
  try {
    if (typeof map === "undefined" || !map.getCenter) {
      return Number.POSITIVE_INFINITY;
    }

    const center = map.getCenter();
    const lat1 = center.getLat();
    const lon1 = center.getLng();

    const lat2 = parseFloat(place.y);
    const lon2 = parseFloat(place.x);

    if (isNaN(lat2) || isNaN(lon2)) {
      return Number.POSITIVE_INFINITY;
    }

    const R = 6371000; // m
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  } catch (e) {
    return Number.POSITIVE_INFINITY;
  }
}

// 1순위: place_name 안에서 query 위치 (앞에 있을수록)
// 2순위: 지도 중심에서의 거리(가까울수록)
function sortPlacesForSuggestions(places, query) {
  return places.slice().sort((a, b) => {
    const nameA = a.place_name || "";
    const nameB = b.place_name || "";

    const idxA = nameA.indexOf(query);
    const idxB = nameB.indexOf(query);

    const posA = idxA === -1 ? 9999 : idxA;
    const posB = idxB === -1 ? 9999 : idxB;

    if (posA !== posB) {
      return posA - posB; // 검색어가 더 앞에 나오는 이름 우선
    }

    const distA = getDistanceFromCenter(a);
    const distB = getDistanceFromCenter(b);
    return distA - distB; // 가까울수록 위로
  });
}

// 추천 리스트 렌더링
function renderSuggestions(placesData, queryForSort) {
  // 엔터 이후 비활성화된 상태면, 절대 다시 안 띄우기
  if (!suggestionsEnabled) {
    clearSuggestions();
    return;
  }

  if (!searchSuggestions) return;

  searchSuggestions.innerHTML = "";

  const sorted = sortPlacesForSuggestions(placesData, queryForSort);

  sorted.forEach((place) => {
    const li = document.createElement("li");

    const distance = getDistanceFromCenter(place);
    let distanceLabel = "";
    if (isFinite(distance)) {
      if (distance < 1000) {
        distanceLabel = `${Math.round(distance)}m`;
      } else {
        distanceLabel = `${(distance / 1000).toFixed(1)}km`;
      }
    }

    li.innerHTML = `
      <div class="suggestion-top">
        <span class="place-name">${place.place_name}</span>
        ${
          distanceLabel
            ? `<span class="place-distance">${distanceLabel}</span>`
            : ""
        }
      </div>
      ${
        place.road_address_name
          ? `<span class="place-address">${place.road_address_name}</span>`
          : place.address_name
          ? `<span class="place-address">${place.address_name}</span>`
          : ""
      }
    `;

    li.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = place.place_name;
      }
      clearSuggestions();

      const searchBtn = document.getElementById("searchBtn");
      if (searchBtn) {
        searchBtn.click();
      } else if (typeof searchPlaces === "function") {
        searchPlaces(place.place_name, null);
      }
    });

    searchSuggestions.appendChild(li);
  });

  searchSuggestions.style.display = sorted.length ? "block" : "none";
}


/**
 * 실제 kakao API 호출
 * 1차: keywordSearch 로 후보 가져오기
 * 2차: categorySearch("CE7")로 근처 카페들 가져와서 이름에 query 포함된 애들만 뽑기
 *   → 있으면 그 “근처 카페들”만 거리순으로 추천
 *   → 없으면 1차 keyword 결과(전국) 사용
 */
function requestSuggestions(query, requestId) {
  if (typeof places === "undefined") {
    console.warn("[자동완성] places 객체가 없습니다.");
    return;
  }

  const hasMapCenter = typeof map !== "undefined" && map.getCenter;
  const center = hasMapCenter ? map.getCenter() : null;

  // 1차: 키워드 검색 (전국 검색, 위치 제한 제거)
  const keywordOptions = { size: 15 };

  places.keywordSearch(
    query,
    function (keywordData, keywordStatus) {

    	if (!suggestionsEnabled) {
      		clearSuggestions();
      		return;
    	}

      if (!isActiveQuery(query)) {
        clearSuggestions();
        return;
      }
	
      if (requestId !== lastSuggestRequestId) return; // 오래된 응답 무시

      const keywordHasData =
        keywordStatus === kakao.maps.services.Status.OK &&
        Array.isArray(keywordData) &&
        keywordData.length > 0;

      // 지도 중심 없으면 그냥 키워드 결과만 사용
      if (!hasMapCenter) {
        if (keywordHasData) {
          renderSuggestions(keywordData, query);
        } else {
          clearSuggestions();
        }
        return;
      }

      // 2차: 근처 카페(CE7) 검색해서 이름에 query 포함된 애들만 필터
      places.categorySearch(
        "CE7", // 카페
        function (catData, catStatus) {

			if (!suggestionsEnabled) {
      			clearSuggestions();
      			return;
    		}

          if (!isActiveQuery(query)) {
            clearSuggestions();
            return;
          }
			
          if (requestId !== lastSuggestRequestId) return;

          let localMatches = [];
          if (
            catStatus === kakao.maps.services.Status.OK &&
            Array.isArray(catData)
          ) {
            const lowerQuery = query.toLowerCase();
            localMatches = catData.filter((p) => {
              const name = (p.place_name || "").toLowerCase();
              return name.includes(lowerQuery);
            });
          }

          console.log(
            "[자동완성]",
            "query:", query,
            "keyword:", keywordStatus,
            "keywordLen:", keywordHasData ? keywordData.length : 0,
            "localLen:", localMatches.length
          );

          if (localMatches.length > 0) {
            // 근처 카페 중에서 이름에 query가 들어간 애들만, 거리순으로
            renderSuggestions(localMatches, query);
            return;
          }

          // 근처 매장 못 찾으면 → 키워드 결과(전국)라도 보여주자
          if (keywordHasData) {
            renderSuggestions(keywordData, query);
          } else {
            clearSuggestions();
          }
        },
        {
          location: center,
          radius: 20000, // 20km 안 카페들
          size: 15
        }
      );
    },
    keywordOptions
  );
}

// 입력 이벤트
if (searchInput) {
  // 검색창에 포커스가 들어오면 다시 추천 허용
  searchInput.addEventListener("focus", () => {
    suggestionsEnabled = true;
  });

  searchInput.addEventListener("input", (e) => {
	const raw = e.target.value;
	const query = raw.trim();

	if (!query) {
		if (typeof clearSuggestions === 'function') {
		clearSuggestions();
		} else {
		const ul = document.getElementById('searchSuggestions');
		if (ul) {
			ul.innerHTML = '';
			ul.style.display = 'none';
		}
		}
		return;
	}

    // 추천이 비활성화된 상태라면, 절대 다시 띄우지 않기
    if (!suggestionsEnabled) {
      if (typeof clearSuggestions === "function") {
        clearSuggestions();
      }
      return;
    }

    if (query.length < 1) {
      clearSuggestions();
      return;
    }

    if (suggestDebounceTimer) {
      clearTimeout(suggestDebounceTimer);
    }

    suggestDebounceTimer = setTimeout(() => {
      lastSuggestRequestId += 1;
      const requestId = lastSuggestRequestId;
      requestSuggestions(query, requestId);
    }, 200);
  });

  // (blur 리스너는 그대로 두거나, 없어도 큰 상관 없음)
  searchInput.addEventListener("blur", () => {
    setTimeout(clearSuggestions, 200);
  });



searchInput.addEventListener("keydown", (e) => {
  // 한글 IME 조합 중에는 무시
  if (e.isComposing || e.keyCode === 229) {
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();

    // 이제부터는 추천 다시 띄우지 마!
    suggestionsEnabled = false;

    // 커서 없애기
    searchInput.blur();

    // 이전 자동완성 요청 전부 무효화
    if (typeof lastSuggestRequestId === "number") {
      lastSuggestRequestId++;
    }

    // 지금 떠 있는 추천 즉시 닫기
    if (typeof clearSuggestions === "function") {
      clearSuggestions();
    }

    // 돋보기 버튼 클릭과 동일하게 검색 실행
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
      searchBtn.click();
    }
  }
});

  // 포커스 빠지면 약간 있다가 닫기 (클릭 먼저 처리되도록)
  searchInput.addEventListener("blur", () => {
    setTimeout(clearSuggestions, 200);
  });
}


// 기존 검색 기능 //
function searchPlaces(keyword, category) {
  console.log('=== searchPlaces 함수 실행 ===');
  console.log('키워드:', keyword);
  console.log('카테고리:', category);

  // 검색 시작할 때 추천창 닫기
  if (typeof clearSuggestions === 'function') {
    clearSuggestions();
  }

  // 기존 마커 제거
  if (Array.isArray(markers)) {
    markers.forEach(marker => marker.setMap(null));
  }
  markers = [];

  // 상세 정보 패널 숨기기
  const detailPanel = document.getElementById('placeDetail');
  if (detailPanel) {
    detailPanel.style.display = 'none';
  }

  const searchResultsEl = document.getElementById('searchResults');
  const resultListEl = document.getElementById('resultList');
  const center = map.getCenter();
  const originalKeyword = (keyword || '').trim();   // 🔹 원래 검색어 보관

  // 공통: 이름 정규화 (공백 제거 + 소문자)
  function normalizeName(str) {
    return (str || '').toString().replace(/\s+/g, '').toLowerCase();
  }

  // 공통: 거리 기준 정렬
  function sortByDistance(list) {
    return (list || []).slice().sort((a, b) => {
      const da = getDistanceFromCenter(a);
      const db = getDistanceFromCenter(b);
      return da - db;
    });
  }

  // 결과 없음 표시
  function showNoResult(msg) {
    if (resultListEl) {
      resultListEl.innerHTML =
        `<div style="padding: 26px; text-align: center; color: #999;">${msg}</div>`;
    }
    if (searchResultsEl) {
      searchResultsEl.style.display = 'flex';
    }
  }

  // 실제 결과 렌더링
  function showPlaces(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      showNoResult('검색 결과가 없습니다.');
      return;
    }

    const data = rawData;
    console.log('=== 검색 결과 ===');
    data.forEach((place, idx) => {
      console.log(`${idx + 1}. ${place.place_name}`);
    });

    // 전역 변수에 검색 결과 저장
    globalSearchResults = data;

    displayResults(data);
    displayMarkers(data);

    if (searchResultsEl) {
      searchResultsEl.style.display = 'flex';
    }

    // 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds();
    data.forEach(place => {
      bounds.extend(new kakao.maps.LatLng(place.y, place.x));
    });
    map.setBounds(bounds);

    console.log('[크롤링] 백그라운드 크롤링 시작...');
    enrichPlacesDataInBackground(data);
  }

  // ---------------------------
  //  키워드 검색 (근처 → 전국 → 축약)
  // ---------------------------
  function runKeywordSearch(query, triedNationwide, triedShortened) {
    console.log(
      '[runKeywordSearch] query =', query,
      'triedNationwide =', triedNationwide,
      'triedShortened =', triedShortened
    );

    const options = triedNationwide
      ? { size: 15 }                                // 전국 검색
      : { location: center, radius: 5000, size: 15 }; // 근처 5km 검색

    places.keywordSearch(query, function (data, status) {
      console.log('[keywordSearch] status =', status, 'query =', query, 'data =', data);

      // 성공: 여기서 이름 필터 + 거리 정렬까지 처리
      if (status === kakao.maps.services.Status.OK &&
          Array.isArray(data) &&
          data.length > 0) {

        let list = data.slice();

        // 1) 항상 거리순 정렬
        list = sortByDistance(list);

        // 2) 축약 검색 단계(예: query = "스타", original = "스타벅")라면
        //    → "스타벅"이 들어가는 이름을 먼저 필터링
        const normOrig = normalizeName(originalKeyword);
        const normQuery = normalizeName(query);

        const isShortenedPhase =
          triedShortened && normOrig.length > 0 && normQuery.length < normOrig.length;

        if (isShortenedPhase) {
          const filtered = list.filter(p =>
            normalizeName(p.place_name).includes(normOrig)
          );

          // 필터링 결과가 있으면 그걸 우선 사용 (스타벅스 위주)
          if (filtered.length > 0) {
            console.log('[filter] 축약 단계에서 원래 키워드 포함 매장 우선 사용');
            list = sortByDistance(filtered);
          }
        }

        showPlaces(list);
        return;
      }

      // 1단계: 근처 검색 실패 → 전국 검색
      if (!triedNationwide) {
        console.log('[fallback] 근처 결과 없음 → 전국 검색 시도');
        runKeywordSearch(query, true, triedShortened);
        return;
      }

      // 2단계: 전국 검색까지 실패, 아직 축약 검색 안 했고 글자수 2 이상이면
      //    → 마지막 글자를 뺀 키워드로 전국 검색
      if (!triedShortened && query.length >= 2) {
        const shorter = query.slice(0, -1);
        console.log('[fallback] 전국 검색도 실패 → 축약 키워드로 재검색:', shorter);
        runKeywordSearch(shorter, true, true);
        return;
      }

      // 3단계: 여기까지 왔으면 진짜로 없음
      if (status === kakao.maps.services.Status.ERROR || status == null) {
        console.error('검색 에러 발생!', status);
        showNoResult('검색 중 오류가 발생했습니다.');
      } else {
        console.log('검색 결과 없음 / 기타 상태:', status);
        showNoResult('검색 결과가 없습니다.');
      }
    }, options);
  }

  //  카테고리 검색 (원래 동작 유지)
  function categoryCallback(data, status) {
    console.log('[categorySearch] status =', status, 'data =', data);

    if (status === kakao.maps.services.Status.OK &&
        Array.isArray(data) &&
        data.length > 0) {
      // 카테고리 검색도 거리순으로만 정렬해서 보여주자
      const sorted = sortByDistance(data);
      showPlaces(sorted);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      showNoResult('검색 결과가 없습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
      console.error('검색 에러 발생!');
      showNoResult('검색 중 오류가 발생했습니다.');
    } else {
      console.log('기타 상태:', status);
      showNoResult('검색 결과가 없습니다.');
    }
  }

  //  실제 호출
  if (category) {
    places.categorySearch(category, categoryCallback, {
      location: map.getCenter(),
      radius: 5000
    });
  } else if (keyword) {
    runKeywordSearch(keyword, false, false);
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
