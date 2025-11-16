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
		
		// 블로그 탭 선택 시 - 이미 매장 선택 시 자동으로 크롤링되므로 여기서는 처리하지 않음
		// if (tabName === 'blog') {
		// 	console.log('ℹ️ 블로그 탭 선택됨 (크롤링은 매장 선택 시 자동 실행됨)');
		// }
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


// 리뷰 폼 전송 → JSON 생성 후 서버에 저장
if (reviewForm) {
	reviewForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		const payload = {
			_id: 'dummy_review_id',
			shop_id: 'dummy_shop_id',
			user_id: 'dummy_user_id',

			// enter는 네/아니오지만, 답을 안 했으면 null 로 둘 수 있게 그대로 유지
			enter: reviewState.enter === null ? null : !!reviewState.enter,
			alone: reviewState.alone,   // true / false / null

			curb: !!reviewState.curb,
			ramp: !!reviewState.ramp,

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
				
				// 리뷰 목록에 추가
				if (data && data.review) {
					await addReview(data.review);
				}
				
				// 리뷰 탭으로 자동 전환
				const reviewTab = document.querySelector('[data-tab="review"]');
				if (reviewTab) {
					reviewTab.click();
				}
				
				closeReviewModal();
				
				// 폼 초기화
				reviewForm.reset();
				reviewState.enter = null;
				reviewState.alone = null;
				reviewState.curb = null;
				reviewState.ramp = null;
				reviewState.comfort = null;
				document.querySelectorAll('.review-choice').forEach(b => b.classList.remove('selected'));
				if (reviewSectionAlone) reviewSectionAlone.style.display = 'none';
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

// ===== 리뷰 목록 표시 =====
const reviewListContainer = document.getElementById('reviewListContainer');
const reviewEmptyText = document.querySelector('.review-empty-text');

// 임시 리뷰 저장소 (서버에서 가져올 때까지)
let currentPlaceReviews = [];

// 사용자 정보 가져오기
async function getCurrentUser() {
	try {
		const res = await fetch('/api/me');
		const data = await res.json();
		return data.user || null;
	} catch (err) {
		console.error('사용자 정보 가져오기 실패:', err);
		return null;
	}
}

// 리뷰 목록 렌더링
function renderReviews() {
	if (!reviewListContainer) return;

	if (currentPlaceReviews.length === 0) {
		if (reviewEmptyText) reviewEmptyText.style.display = 'block';
		reviewListContainer.innerHTML = '';
		return;
	}

	if (reviewEmptyText) reviewEmptyText.style.display = 'none';

	const reviewsHtml = currentPlaceReviews.map((review, index) => {
		const userName = review.user_name || '익명';
		const userInitial = userName.charAt(0).toUpperCase();
		const reviewText = review.review_text || '';
		const photos = review.photo_urls || [];
		
		// 사진 HTML
		const photosHtml = photos.length > 0 
			? `<div class="review-item-photos">
				${photos.map(url => `<img src="${url}" alt="리뷰 사진" class="review-item-photo">`).join('')}
			</div>`
			: '';

		return `
			<div class="review-item" data-review-id="${review._id || index}">
				<div class="review-item-left">
					<div class="review-profile-image">${userInitial}</div>
				</div>
				<div class="review-item-right">
					<div class="review-user-name">${userName}</div>
					${photosHtml}
					${reviewText ? `<div class="review-item-text">${reviewText}</div>` : ''}
					<div class="review-item-actions">
						<button class="review-action-btn" data-action="like" data-review-id="${review._id || index}">
							<svg viewBox="0 0 24 24">
								<path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
							</svg>
							<span class="review-action-count">0</span>
						</button>
						<button class="review-action-btn" data-action="dislike" data-review-id="${review._id || index}">
							<svg viewBox="0 0 24 24" style="transform: rotate(180deg);">
								<path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
							</svg>
							<span class="review-action-count">0</span>
						</button>
					</div>
				</div>
			</div>
		`;
	}).join('');

	reviewListContainer.innerHTML = `<div class="review-list">${reviewsHtml}</div>`;

	// 추천/비추천 버튼 이벤트 리스너 추가
	document.querySelectorAll('.review-action-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const action = this.dataset.action;
			const reviewId = this.dataset.reviewId;
			
			// 같은 리뷰의 다른 액션 버튼들
			const reviewItem = this.closest('.review-item');
			const allActionBtns = reviewItem.querySelectorAll('.review-action-btn');
			
			// 이미 활성화된 버튼을 다시 클릭하면 취소
			if (this.classList.contains('active')) {
				this.classList.remove('active');
			} else {
				// 다른 버튼 비활성화
				allActionBtns.forEach(b => b.classList.remove('active'));
				// 현재 버튼 활성화
				this.classList.add('active');
			}
			
			console.log(`리뷰 ${reviewId}에 ${action} 액션`);
		});
	});
}

// 리뷰 추가 (저장 후 호출)
async function addReview(review) {
	const user = await getCurrentUser();
	const reviewWithUser = {
		...review,
		user_name: user ? (user.name || user.email || '익명') : '익명'
	};
	currentPlaceReviews.push(reviewWithUser);
	renderReviews();
}

// 리뷰 목록 초기화
function clearReviews() {
	currentPlaceReviews = [];
	renderReviews();
}