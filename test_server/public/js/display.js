// 영업시간 파싱 및 영업중/종료 판단
function parseBusinessStatus(hoursInfo) {
	var now = new Date();
	var currentHour = now.getHours();
	var currentMinute = now.getMinutes();
	var currentTime = currentHour * 60 + currentMinute; // 분 단위로 변환
	
	// 기본값
	var result = {
		status: '정보 없음',
		hours: hoursInfo,
		isOpen: null
	};
	
	if (!hoursInfo || hoursInfo === '영업 시간 정보 없음') {
		return result;
	}
	
	// "영업 중 · 22:00에 영업 종료" 형식 파싱
	if (hoursInfo.includes('영업 중')) {
		result.status = '영업중';
		result.isOpen = true;
		
		// "22:00에 영업 종료" 추출
		var match = hoursInfo.match(/(\d{1,2}):(\d{2})에 영업 종료/);
		if (match) {
			result.hours = match[0];
		} else {
			result.hours = hoursInfo.replace('영업 중', '').replace('·', '').trim();
		}
	} 
	// "영업 종료 · 09:00에 영업 시작" 형식 파싱
	else if (hoursInfo.includes('영업 종료')) {
		result.status = '영업종료';
		result.isOpen = false;
		
		var match = hoursInfo.match(/(\d{1,2}):(\d{2})에 영업 시작/);
		if (match) {
			result.hours = match[0];
		} else {
			result.hours = hoursInfo.replace('영업 종료', '').replace('·', '').trim();
		}
	}
	// "휴무" 또는 "정기휴무" 형식
	else if (hoursInfo.includes('휴무')) {
		result.status = '휴무';
		result.isOpen = false;
		result.hours = hoursInfo;
	}
	// 시간 정보만 있는 경우 (예: "09:00 - 22:00")
	else if (hoursInfo.match(/(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/)) {
		var timeMatch = hoursInfo.match(/(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/);
		if (timeMatch) {
			var openHour = parseInt(timeMatch[1]);
			var openMinute = parseInt(timeMatch[2]);
			var closeHour = parseInt(timeMatch[3]);
			var closeMinute = parseInt(timeMatch[4]);
			
			var openTime = openHour * 60 + openMinute;
			var closeTime = closeHour * 60 + closeMinute;
			
			// 자정 넘어가는 경우 처리 (예: 23:00 - 01:00)
			if (closeTime < openTime) {
				closeTime += 24 * 60;
				if (currentTime < openTime) {
					currentTime += 24 * 60;
				}
			}
			
			if (currentTime >= openTime && currentTime < closeTime) {
				result.status = '영업중';
				result.isOpen = true;
				result.hours = String(closeHour).padStart(2, '0') + ':' + String(closeMinute).padStart(2, '0') + '에 영업 종료';
			} else {
				result.status = '영업종료';
				result.isOpen = false;
				result.hours = String(openHour).padStart(2, '0') + ':' + String(openMinute).padStart(2, '0') + '에 영업 시작';
			}
		}
	}
	// 기타 형식
	else {
		result.status = '정보 확인';
		result.hours = hoursInfo;
		result.isOpen = null;
	}
	
	return result;
}

// 접근성 정보 생성 함수 (일관성 있게 랜덤 생성)
function generateAccessibilityInfo(place) {
	// place의 고유한 값(이름+주소)을 기반으로 시드 생성
	var seed = 0;
	var name = place.place_name || '';
	var address = place.address_name || '';
	for (var i = 0; i < name.length; i++) {
		seed += name.charCodeAt(i);
	}
	for (var i = 0; i < address.length; i++) {
		seed += address.charCodeAt(i);
	}
	
	// 간단한 랜덤 함수 (시드 기반)
	var random = function() {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
	
	// 접근성 옵션들
	var options = ['경사로', '주차장', '낮은 문턱', '화장실', '점자블럭'];
	var selectedOptions = [];
	
	// 1-3개의 옵션 랜덤 선택
	var numOptions = Math.floor(random() * 3) + 1;
	var attempts = 0;
	while (selectedOptions.length < numOptions && attempts < 10) {
		var option = options[Math.floor(random() * options.length)];
		if (selectedOptions.indexOf(option) === -1) {
			selectedOptions.push(option);
		}
		attempts++;
	}
	
	// 최소 1개는 선택되도록 보장
	if (selectedOptions.length === 0) {
		selectedOptions.push(options[Math.floor(random() * options.length)]);
	}
	
	// verified 여부 (50% 확률)
	var isVerified = random() < 0.5;
	
	return {
		info: selectedOptions.join('·'),
		verified: isVerified
	};
}

// 영업시간 파싱 및 영업중 판단 함수
function parseBusinessStatus(hoursInfo) {
	var now = new Date();
	var currentHour = now.getHours();
	var currentMinute = now.getMinutes();
	var currentTime = currentHour * 60 + currentMinute; // 분 단위로 변환
	
	// 기본값
	var result = {
		status: '영업 정보 없음',
		hours: hoursInfo,
		isOpen: false
	};
	
	// "영업 중 · 22:00에 영업 종료" 패턴
	if (hoursInfo.includes('영업 중')) {
		result.status = '영업중';
		result.isOpen = true;
		
		// "22:00에 영업 종료" 추출
		var match = hoursInfo.match(/(\d{1,2}):(\d{2})에 영업 종료/);
		if (match) {
			result.hours = match[0];
		} else {
			result.hours = hoursInfo.replace('영업 중', '').replace(/^[\s·]+/, '').trim();
		}
	}
	// "영업 종료" 또는 "휴무" 패턴
	else if (hoursInfo.includes('영업 종료') || hoursInfo.includes('휴무')) {
		result.status = '영업종료';
		result.isOpen = false;
		
		// "09:00에 영업 시작" 추출
		var match = hoursInfo.match(/(\d{1,2}):(\d{2})에 영업 시작/);
		if (match) {
			result.hours = match[0];
		} else {
			result.hours = hoursInfo.replace('영업 종료', '').replace(/^[\s·]+/, '').trim();
		}
	}
	// "08:00 ~ 22:00" 같은 시간 범위 패턴
	else if (hoursInfo.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/)) {
		var match = hoursInfo.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
		var openHour = parseInt(match[1]);
		var openMinute = parseInt(match[2]);
		var closeHour = parseInt(match[3]);
		var closeMinute = parseInt(match[4]);
		
		var openTime = openHour * 60 + openMinute;
		var closeTime = closeHour * 60 + closeMinute;
		
		// 자정 넘어가는 경우 처리
		if (closeTime < openTime) {
			closeTime += 24 * 60;
			if (currentTime < openTime) {
				currentTime += 24 * 60;
			}
		}
		
		if (currentTime >= openTime && currentTime < closeTime) {
			result.status = '영업중';
			result.isOpen = true;
			result.hours = closeHour + ':' + (closeMinute < 10 ? '0' : '') + closeMinute + '에 영업 종료';
		} else {
			result.status = '영업종료';
			result.isOpen = false;
			result.hours = openHour + ':' + (openMinute < 10 ? '0' : '') + openMinute + '에 영업 시작';
		}
	}
	// 정보 없음
	else if (hoursInfo === '영업 시간 정보 없음' || !hoursInfo) {
		result.status = '영업 정보 없음';
		result.hours = '';
		result.isOpen = false;
	}
	
	return result;
}

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
		// 크롤링한 영업시간 정보 사용
		var hours = place.businessHours || '영업 시간 정보 없음';
		var status = '영업중'; // 기본값
		
		// 영업시간에서 상태 추출 (예: "영업 중 · 22:00에 영업 종료")
		if (hours.includes('영업 중')) {
			status = '영업중';
		} else if (hours.includes('영업 종료') || hours.includes('휴무')) {
			status = '영업종료';
		} else if (hours === '영업 시간 정보 없음') {
			status = '정보 없음';
		}
		
		// 접근성 정보 생성 및 저장
		var accessibilityInfo = generateAccessibilityInfo(place);
		place.accessibilityInfo = accessibilityInfo.info;
		place.accessibilityVerified = accessibilityInfo.verified;
		
		// 리뷰 개수 생성 및 저장 (일관성 있게)
		if (!place.reviewCount) {
			var seed = 0;
			var name = place.place_name || '';
			for (var i = 0; i < name.length; i++) {
				seed += name.charCodeAt(i);
			}
			var reviewSeed = (seed * 9301 + 49297) % 233280;
			var reviewRandom = reviewSeed / 233280;
			place.reviewCount = Math.floor(reviewRandom * 1500) + 50;
		}
		var reviewText = place.reviewCount >= 1000 ? '리뷰 999+' : '리뷰 ' + place.reviewCount;
		
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
							<span>${reviewText}</span>
							<div class="result-accessibility">
								<img src="/img/physical-disability.svg" alt="접근성" style="width: 16px; height: 16px; opacity: 0.8;" />
								<span>${accessibilityInfo.info || '접근성 정보 없음'}</span>
								${accessibilityInfo.verified ? '<img src="/img/check-green.png" alt="확인" style="width: 16px; height: 16px; margin-left: 2px;" />' : ''}
							</div>
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

// 블로그 리뷰 가져오기 및 표시 (특정 매장 선택 시 자동 실행)
async function loadBlogReviews(placeId) {
	const blogContainer = document.getElementById('tab-blog');
	
	// 이미 크롤링된 경우 중복 실행 방지
	if (blogContainer.dataset.loaded === placeId) {
		console.log('ℹ️ 이미 로드된 블로그 리뷰 (중복 크롤링 방지)');
		return;
	}
	
	console.log('📝 블로그 리뷰 크롤링 시작 - Place ID:', placeId);
	console.log('ℹ️ 이 크롤링은 매장 선택 시 자동으로 실행됩니다.');
	
	blogContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">블로그 리뷰를 불러오는 중...</div>';
	
	try {
		// 상대 경로 사용 (현재 페이지와 같은 호스트:포트로 요청)
		const response = await fetch('/api/crawl/blog-reviews', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ placeId })
		});
		
		if (!response.ok) {
			throw new Error('블로그 리뷰를 불러올 수 없습니다.');
		}
		
		const result = await response.json();
		console.log('✅ 블로그 리뷰 크롤링 완료 - 발견된 리뷰 수:', result.reviews?.length || 0);
		
		// 블로그 리뷰 표시
		displayBlogReviews(result.reviews || []);
		
		// 로드 완료 표시 (중복 크롤링 방지)
		blogContainer.dataset.loaded = placeId;
		
	} catch (error) {
		console.error('❌ 블로그 리뷰 로딩 실패:', error);
		blogContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #f44;">블로그 리뷰를 불러오는데 실패했습니다.</div>';
	}
}

// 블로그 리뷰를 화면에 표시
function displayBlogReviews(reviews) {
	const blogContainer = document.getElementById('tab-blog');
	
	if (!reviews || reviews.length === 0) {
		blogContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">등록된 블로그 리뷰가 없습니다.</div>';
		return;
	}
	
	let html = '<div style="display: flex; flex-direction: column;">';
	
	reviews.forEach((review, index) => {
		// 본문에서 중복된 제목 제거 (블로그명 + 제목이 본문에 포함된 경우)
		let cleanContent = review.content || '';
		if (review.title && cleanContent.includes(review.title)) {
			cleanContent = cleanContent.replace(review.title, '').trim();
		}
		if (review.blogName && cleanContent.startsWith(review.blogName)) {
			cleanContent = cleanContent.replace(review.blogName, '').trim();
		}
		// 남은 구분자 제거
		cleanContent = cleanContent.replace(/^[\s:·\-|]+/, '').trim();
		
		html += `
			<a href="${review.link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: block;">
				<div class="blog-review-item" style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; display: flex; gap: 12px;">
					<!-- 썸네일 (있으면 왼쪽에 작은 정사각형으로) -->
					${review.thumbnail ? `
						<img src="${review.thumbnail}" 
							 alt="블로그 사진" 
							 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;"
							 onerror="this.style.display='none'">
					` : ''}
					
					<!-- 텍스트 영역 -->
					<div style="flex: 1; min-width: 0;">
						<!-- 제목 (16px로 증가) -->
						${review.title ? `
							<h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #333; line-height: 1.4;">
								${review.title}
							</h4>
						` : ''}
						
						<!-- 본문 (중복 제거된) -->
						${cleanContent ? `
							<p style="margin: 0 0 6px 0; font-size: 13px; color: #666; line-height: 1.4; 
									  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; 
									  -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
								${cleanContent}
							</p>
						` : ''}
						
						<!-- 블로그명과 날짜 -->
						<div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #999;">
							${review.blogName ? `<span>${review.blogName}</span>` : ''}
							${review.date ? `<span>·</span><span>${review.date}</span>` : ''}
						</div>
					</div>
				</div>
			</a>
		`;
	});
	
	html += '</div>';
	blogContainer.innerHTML = html;
}

// 매장 상세 정보 표시
function showPlaceDetail(place, selectedMarker) {
	// 검색창 비우기
	document.getElementById('searchInput').value = '';
	
	// 탭을 홈으로 초기화
	document.querySelectorAll('.place-detail-tab').forEach(t => {
		t.classList.remove('active');
	});
	document.querySelector('.place-detail-tab[data-tab="home"]').classList.add('active');
	document.querySelectorAll('.tab-content').forEach(content => {
		content.classList.remove('active');
	});
	document.getElementById('tab-home').classList.add('active');
	
	// 디버깅: 전체 카테고리 정보 출력
	console.log('=== 매장 정보 ===');
	console.log('매장명:', place.place_name);
	console.log('매장 ID:', place.id);
	console.log('전체 카테고리:', place.category_name);
	console.log('주소:', place.address_name);
	
	// 현재 선택된 장소 정보를 전역 변수에 저장 (블로그 탭에서 사용)
	window.currentPlace = place;
	
	// 블로그 탭 초기화 (다른 매장 선택 시 이전 데이터 제거)
	const blogContainer = document.getElementById('tab-blog');
	if (blogContainer) {
		blogContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">블로그 정보 준비중</div>';
		delete blogContainer.dataset.loaded;
	}
	
	// 매장명
	document.getElementById('placeTitle').textContent = place.place_name;
	
	// 카테고리 - 조건부 표시
	var category = '카테고리 정보 없음';
	if (place.category_name) {
		var categories = place.category_name.split('>').map(c => c.trim());
		var lowestCategory = categories[categories.length - 1]; // 제일 하위 분류
		
		// 제일 하위 분류가 상호명에 포함되어 있는지 확인
		if (place.place_name.includes(lowestCategory) && categories.length > 1) {
			// 포함되어 있으면 한 단계 상위 분류 표시
			category = categories[categories.length - 2];
		} else {
			// 포함되어 있지 않으면 제일 하위 분류 표시
			category = lowestCategory;
		}
		
		console.log('카테고리 배열:', categories);
		console.log('상호명:', place.place_name);
		console.log('하위 분류:', lowestCategory);
		console.log('하위 분류 포함 여부:', place.place_name.includes(lowestCategory));
		console.log('표시할 카테고리:', category);
	}
	document.getElementById('placeCategory').textContent = category;
	
	// 리뷰 개수 표시 (검색 리스트에서 생성된 값 사용)
	var reviewCount = place.reviewCount || Math.floor(Math.random() * 1500) + 50;
	if (!place.reviewCount) {
		place.reviewCount = reviewCount;
	}
	var reviewText = reviewCount >= 1000 ? '리뷰 999+' : '리뷰 ' + reviewCount;
	document.getElementById('placeReviews').textContent = reviewText;
	
	// 주소와 전화번호 (크롤링한 정보 우선 사용)
	document.getElementById('placeAddress').textContent = 
		place.crawledAddress || place.address_name || place.road_address_name || '주소 정보 없음';
	document.getElementById('placePhone').textContent = 
		place.crawledPhone || place.phone || '전화번호 정보 없음';
	
	// 영업시간 정보 표시 및 영업중/종료 판단
	var hoursInfo = place.businessHours || '영업 시간 정보 없음';
	var businessStatus = parseBusinessStatus(hoursInfo);
	
	var statusElement = document.getElementById('placeStatus');
	var hoursElement = document.getElementById('placeHours');
	
	if (statusElement && hoursElement) {
		statusElement.textContent = businessStatus.status;
		statusElement.className = 'business-status ' + (businessStatus.isOpen ? 'open' : 'closed');
		hoursElement.textContent = businessStatus.hours;
	}
	
	// 웹사이트 정보 표시 (크롤링 예정)
	var websiteUrl = place.website || place.place_url;
	var websiteItem = document.getElementById('websiteItem');
	var websiteLink = document.getElementById('placeWebsite');
	
	if (websiteUrl && websiteUrl.includes('http')) {
		websiteItem.style.display = 'grid';
		websiteLink.href = websiteUrl;
		websiteLink.textContent = websiteUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
	} else {
		websiteItem.style.display = 'none';
	}
	
	// 접근성 정보 표시 (검색 리스트에서 생성된 정보 사용)
	var accessibilityInfo = place.accessibilityInfo || '접근성 정보 준비중';
	var accessibilityVerified = place.accessibilityVerified !== undefined ? place.accessibilityVerified : false;
	
	// 접근성 정보가 없으면 생성
	if (!place.accessibilityInfo) {
		var generatedInfo = generateAccessibilityInfo(place);
		accessibilityInfo = generatedInfo.info;
		accessibilityVerified = generatedInfo.verified;
		place.accessibilityInfo = accessibilityInfo;
		place.accessibilityVerified = accessibilityVerified;
	}
	
	var accessibilityElement = document.getElementById('placeAccessibility');
	var accessibilitySpan = accessibilityElement.querySelector('span');
	accessibilitySpan.innerHTML = accessibilityInfo + (accessibilityVerified ? ' <img src="/img/check-green.png" alt="확인" class="check-icon" />' : '');
	console.log('접근성 정보:', accessibilityInfo);
	console.log('체크 아이콘 표시:', accessibilityVerified);
	
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
	
	// 🔄 매장 선택 시 자동으로 블로그 리뷰 크롤링 시작
	if (place.id) {
		console.log('🔄 매장 선택됨 - 블로그 리뷰 크롤링 자동 시작');
		loadBlogReviews(place.id);
	}
}


