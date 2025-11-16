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

// 모달 열기 버튼
if (reviewWriteBtn) {
	reviewWriteBtn.addEventListener('click', function (e) {
		e.preventDefault();
		openReviewModal();
	});
}
if (reviewWriteLinkHome) {
	reviewWriteLinkHome.addEventListener('click', function (e) {
		e.preventDefault();
		openReviewModal();
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

    // ✅ 조건부 질문 노출/숨김 로직

    // 1) 입구에 들어갈 수 있었나요? → alone 섹션
    if (field === 'enter') {
      if (value === true) {
        // 있어요 → 혼자서 들어갔나요? 보이기
        if (reviewSectionAlone) reviewSectionAlone.style.display = 'block';
      } else {
        // 없어요 → 섹션 숨기고, 선택 초기화 + JSON null
        if (reviewSectionAlone) reviewSectionAlone.style.display = 'none';

        reviewState.alone = null;
        document
          .querySelectorAll('.review-choice[data-field="alone"]')
          .forEach(function (b) {
            b.classList.remove('selected');
          });
      }
    }

    // 2) 입구에 턱이 있었나요? → ramp 섹션
    if (field === 'curb') {
      if (value === true) {
        // 턱 있어요 → 경사로 질문 보이기
        if (reviewSectionRamp) reviewSectionRamp.style.display = 'block';
      } else {
        // 턱 없어요 → 경사로 섹션 숨기고 JSON null
        if (reviewSectionRamp) reviewSectionRamp.style.display = 'none';

        reviewState.ramp = null;
        document
          .querySelectorAll('.review-choice[data-field="ramp"]')
          .forEach(function (b) {
            b.classList.remove('selected');
          });
      }
    }
  });
});


// 리뷰 폼 전송 → JSON 생성 후 서버에 저장
if (reviewForm) {
	reviewForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		const payload = {
			_id: 'dummy_review_id',
			shop_id: 'dummy_shop_id',
			user_id: 'dummy_user_id',

			// 입구는 항상 true/false 로 사용
			enter: reviewState.enter === null ? null : !!reviewState.enter,

			// 조건부 질문들은 null 허용
			alone: reviewState.alone,   // enter = false 이면 null
			curb: reviewState.curb === null ? null : !!reviewState.curb,
			ramp: reviewState.ramp,     // curb = false 이면 null

			comfort: reviewState.comfort === null ? null : !!reviewState.comfort,

			photo_urls: [],
			review_text: (reviewTextEl && reviewTextEl.value.trim()) || '',
		};


		console.log('리뷰 전송 payload:', payload);

		try {
			const res = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => null);

			if (res.ok) {
				console.log('리뷰 저장 완료:', data);
				alert('리뷰가 저장되었습니다.');
				closeReviewModal();
			} else {
				alert('리뷰 저장에 실패했습니다.');
			}
		} catch (err) {
			console.error(err);
			alert('리뷰 전송 중 오류가 발생했습니다.');
		}
	});
}

// 리뷰 작성 모달 끝