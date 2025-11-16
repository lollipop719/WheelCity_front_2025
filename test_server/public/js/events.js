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

// ===== 리뷰 작성 모달 =====
const reviewModalBackdrop = document.getElementById('reviewModalBackdrop');
const reviewWriteBtn = document.getElementById('reviewWriteBtn');           // 리뷰 탭 버튼
const reviewWriteLinkHome = document.getElementById('reviewWriteLinkHome'); // 홈 탭 링크
const reviewModalClose = document.getElementById('reviewModalClose');
const reviewCancelBtn = document.getElementById('reviewCancelBtn');
const reviewForm = document.getElementById('reviewForm');
const reviewTextEl = document.getElementById('reviewText');
const reviewSectionAlone = document.getElementById('reviewSectionAlone');
const reviewSectionRamp = document.getElementById('reviewSectionRamp');

const reviewState = {
	enter: null,
	alone: null,
	curb: null,
	ramp: null,
	comfort: null,
};

function openReviewModal() {
	if (!reviewModalBackdrop) return;
	reviewModalBackdrop.style.display = 'flex';
}

function closeReviewModal() {
	if (!reviewModalBackdrop) return;
	reviewModalBackdrop.style.display = 'none';
}

// 모달 열기 버튼 - 로그인 확인
async function checkLoginAndOpenReviewModal() {
	try {
		const res = await fetch('/api/me');
		const data = await res.json();
		const user = data.user;
		
		if (!user) {
			alert('리뷰를 작성하려면 로그인이 필요합니다.');
			// 로그인 모달 열기 (auth.js의 openModal 함수 호출)
			const loginOpenBtn = document.getElementById('loginOpen');
			if (loginOpenBtn) {
				loginOpenBtn.click();
			}
			return;
		}
		
		openReviewModal();
	} catch (error) {
		console.error('로그인 확인 오류:', error);
		alert('로그인 상태를 확인할 수 없습니다. 다시 시도해주세요.');
	}
}

if (reviewWriteBtn) {
	reviewWriteBtn.addEventListener('click', function (e) {
		e.preventDefault();
		checkLoginAndOpenReviewModal();
	});
}
if (reviewWriteLinkHome) {
	reviewWriteLinkHome.addEventListener('click', function (e) {
		e.preventDefault();
		checkLoginAndOpenReviewModal();
	});
}

// 모달 닫기(X, 취소, 배경 클릭)
if (reviewModalClose) {
	reviewModalClose.addEventListener('click', closeReviewModal);
}
if (reviewCancelBtn) {
	reviewCancelBtn.addEventListener('click', function (e) {
		e.preventDefault();
		closeReviewModal();
	});
}
if (reviewModalBackdrop) {
	reviewModalBackdrop.addEventListener('click', function (e) {
		if (e.target === reviewModalBackdrop) {
			closeReviewModal();
		}
	});
}

// 선택 칩(있어요/없어요 등) 클릭 처리
document.querySelectorAll('.review-choice').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const field = this.dataset.field;
    const value = this.dataset.value === 'true';

    // 같은 field 의 다른 버튼들은 선택 해제
    document.querySelectorAll('.review-choice[data-field="' + field + '"]').forEach(function (b) {
      b.classList.remove('selected');
    });
    this.classList.add('selected');

    if (field in reviewState) {
      reviewState[field] = value;
    }

    // ✅ enter → alone 섹션 표시/숨김 로직만 유지
    if (field === 'enter') {
      if (value === true) {
        // 입구에 들어갈 수 있음 → 혼자/도움 질문 보이기
        if (reviewSectionAlone) reviewSectionAlone.style.display = 'block';
      } else {
        // 입구에 들어갈 수 없음 → 섹션 숨기고 alone 초기화(null)
        if (reviewSectionAlone) reviewSectionAlone.style.display = 'none';

        reviewState.alone = null;
        document
          .querySelectorAll('.review-choice[data-field="alone"]')
          .forEach(function (b) {
            b.classList.remove('selected');
          });
      }
    }
  });
});


// 리뷰 폼 전송 → 이미지 업로드 후 서버에 저장
if (reviewForm) {
	reviewForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		// 현재 선택된 장소 정보 확인
		if (!window.currentPlace) {
			alert('장소 정보를 찾을 수 없습니다. 다시 시도해주세요.');
			return;
		}

		// 제출 버튼 비활성화 및 로딩 표시
		const submitBtn = document.getElementById('reviewSubmitBtn');
		const originalBtnText = submitBtn ? submitBtn.textContent : '저장하기';
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = '제출 중...';
		}

		try {
			// Step 0: Check login and get user info
			console.log('로그인 상태 확인 중...');
			const userRes = await fetch('/api/me');
			const userData = await userRes.json();
			const user = userData.user;
			
			if (!user) {
				throw new Error('로그인이 필요합니다. 리뷰를 작성하려면 먼저 로그인해주세요.');
			}
			
			// Get Kakao ID from session
			const kakaoId = user.kakaoId || user.kakao_id;
			if (!kakaoId) {
				throw new Error('Kakao 로그인이 필요합니다. Kakao로 로그인해주세요.');
			}
			
			console.log('Kakao ID:', kakaoId);
			
			// Step 1: Get or create user in backend
			console.log('백엔드에서 사용자 정보 가져오는 중...');
			const userInfo = await window.ReviewAPI.getOrCreateUserByKakao(
				kakaoId,
				user.email,
				user.name
			);
			const userId = userInfo.user_id;
			
			if (!userId) {
				throw new Error('사용자 ID를 가져올 수 없습니다.');
			}
			console.log('사용자 ID:', userId);
			if (userInfo.created) {
				console.log('새 사용자가 생성되었습니다.');
			}

			// Step 2: Get or create shop
			console.log('매장 정보 가져오는 중...');
			const shop = await window.ReviewAPI.getOrCreateShop(window.currentPlace);
			const shopId = shop._id || shop.id;
			
			if (!shopId) {
				throw new Error('매장 ID를 가져올 수 없습니다.');
			}
			console.log('매장 ID:', shopId);

			// Step 3: Get image files
			const photoInput = document.getElementById('reviewPhotos');
			const imageFiles = photoInput && photoInput.files ? Array.from(photoInput.files) : [];

			// Step 4: Prepare review data
			const reviewData = {
				user_id: userId,
				enter: reviewState.enter === null ? null : Boolean(reviewState.enter),
				alone: reviewState.alone === null ? null : Boolean(reviewState.alone),
				curb: Boolean(reviewState.curb),
				ramp: Boolean(reviewState.ramp),
				comfort: reviewState.comfort === null ? null : Boolean(reviewState.comfort),
				review_text: (reviewTextEl && reviewTextEl.value.trim()) || '',
			};

			console.log('리뷰 데이터:', reviewData);
			console.log('이미지 파일 개수:', imageFiles.length);

			// Step 5: Submit review with images
			const result = await window.ReviewService.submitReviewWithImages(shopId, reviewData, imageFiles);
			
			console.log('리뷰 저장 완료:', result);
			alert('리뷰가 저장되었습니다.');
			
			// 폼 초기화
			reviewForm.reset();
			Object.keys(reviewState).forEach(key => {
				reviewState[key] = key === 'curb' || key === 'ramp' ? false : null;
			});
			document.querySelectorAll('.review-choice').forEach(btn => {
				btn.classList.remove('selected');
			});
			if (reviewSectionAlone) reviewSectionAlone.style.display = 'none';
			
			closeReviewModal();
		} catch (err) {
			console.error('리뷰 제출 오류:', err);
			alert('리뷰 전송 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
		} finally {
			// 제출 버튼 다시 활성화
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalBtnText;
			}
		}
	});
}

// 리뷰 작성 모달 끝