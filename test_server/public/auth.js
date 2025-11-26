// public/auth.js
// 로그인 버튼 UI + 자체 회원가입/로그인 + 카카오 로그인 (팝업 + 상단 유저 메뉴)

const KAKAO_JS_KEY = '01785b9a288ab46417b78a3790ac85c5'; // 서버 시작 전 반드시 확인하기!
// 로컬 개발용: http://localhost:3000/auth/kakao/callback
// 프로덕션용: https://wheelcity.sbserver.store/auth/kakao/callback
// 수동으로 설정 - 환경에 맞게 변경하세요
const KAKAO_REDIRECT_URI = 'https://wheelcity.sbserver.store/auth/kakao/callback';

(function () {
  // ===== 상단 우측 영역 생성 =====
  const userBox = document.createElement('div');
  userBox.className = 'user-box';
  userBox.innerHTML = `
    <button class="btn kakao-login-btn" id="loginOpen">
      <img src="/img/kakao_login_medium.png" alt="카카오로 계속하기" />
    </button>
    <div class="user-menu" id="userMenu" style="display:none;">
      <button class="user-pill" id="userMenuToggle">
        <img class="user-pill-photo" id="userPillPhoto" src="" alt="" />
        <span class="user-name-pill" id="whoami"></span>
        <span class="caret">▾</span>
      </button>
      <div class="user-menu-panel" id="userMenuPanel">
        <div class="user-menu-main">
          <div class="user-name" id="menuName"></div>
          <div class="user-email" id="menuEmail"></div>
          <div class="user-provider" id="menuProvider"></div>
        </div>
        <button class="user-logout" id="logoutMenuBtn">로그아웃</button>
      </div>
    </div>
  `;
  document.body.appendChild(userBox);

  // ===== 로그인 모달 마크업 삽입 (슬라이드업 대신 중앙 카드) =====
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'loginBackdrop';
  backdrop.innerHTML = `
    <div class="modal-sheet" id="loginSheet" role="dialog" aria-modal="true">
      <div class="modal-header">
        <button class="close" id="modalClose">✕</button>
      </div>
      <div class="modal-body">
        <button id="kakaoLoginBtn" class="kakao-btn">
          <img src="/img/kakao_login_medium.png" alt="카카오로 계속하기" />
        </button>
        <div class="hint">카카오 로그인 사용 시 카카오의 개인정보처리방침이 적용됩니다.</div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  // ===== 마이페이지 모달 삽입 =====
  const mypageBackdrop = document.createElement('div');
  mypageBackdrop.className = 'mypage-backdrop';
  mypageBackdrop.id = 'mypageBackdrop';
  mypageBackdrop.innerHTML = `
    <div class="mypage-sheet" id="mypageSheet">
      <div class="mypage-header">
        <div class="mypage-title">마이페이지</div>
        <button class="mypage-close" id="mypageClose">✕</button>
      </div>

      <div class="mypage-profile-box">
        <img id="mypageProfileImage" class="mypage-profile-photo" src="" alt="프로필 이미지" />
        <div class="mypage-profile-name" id="mypageProfileName"></div>
      </div>

      <div class="mypage-body">
        <section class="mypage-score-card">
          <div class="mypage-score-row">
            <div class="mypage-score-label">휠스코어</div>
            <div class="mypage-score-value">
              <span id="mypageScoreValue">0.0</span><span class="mypage-score-unit">m</span>
            </div>
          </div>
          <div class="mypage-score-bar-bg">
            <div class="mypage-score-bar-fill" id="mypageScoreBar"></div>
          </div>
          <div class="mypage-score-desc" id="mypageScoreDesc">
            당신이 작성한 리뷰가 0.0m의 배리어를 없애는 데 기여했어요.
          </div>
          <div class="mypage-score-hint">리뷰를 작성할수록 휠스코어가 올라가요.</div>
        </section>

        <section class="mypage-maxheight-card">
          <div class="mypage-maxheight-title">내가 넘을 수 있는 턱 높이</div>
          <div class="mypage-maxheight-value">
            <span id="mypageMaxHeightCm">0</span><span class="unit">cm</span>
          </div>
          <div class="mypage-maxheight-desc">
            설정한 높이까지는 휠체어로 넘어갈 수 있어요.
          </div>
        </section>

        <section>
          <div class="mypage-section-title">내가 쓴 리뷰</div>
          <ul class="mypage-review-list" id="mypageReviewList">
            <li class="mypage-review-empty">아직 작성한 리뷰가 없습니다.</li>
          </ul>
        </section>
      </div>

      <div class="mypage-footer">
        <button class="mypage-btn-secondary" id="mypageEditProfileBtn">회원정보 수정</button>
        <button class="mypage-btn-primary" id="mypageLogoutBtn">로그아웃</button>
      </div>
    </div>
  `;
  document.body.appendChild(mypageBackdrop);

  // ===== 회원 정보 수정 (최대 턱 높이 설정) 모달 삽입 =====
  const heightBackdrop = document.createElement('div');
  heightBackdrop.className = 'height-backdrop';
  heightBackdrop.id = 'heightBackdrop';
  heightBackdrop.innerHTML = `
    <div class="height-sheet" id="heightSheet" role="dialog" aria-modal="true">
      <div class="height-header">
        <h2>회원 정보 수정</h2>
        <button class="height-close" id="heightClose">✕</button>
      </div>
      <div class="height-body">
        <label class="height-label">
          내가 넘을 수 있는 턱의 최대 높이
          <span class="height-sub">(1cm 단위)</span>
        </label>
        <div class="height-input-row">
          <input type="number" id="maxHeightInput" min="0" step="1" value="0" />
          <span class="height-unit">cm</span>
        </div>
        <p class="height-hint">
          이 값은 접근성 추천과 리뷰 작성 시 참고 정보로 사용돼요. 저장하지 않으면 기본값 0cm가 유지됩니다.
        </p>
        <button class="height-save" id="heightSaveBtn">저장하기</button>
      </div>
    </div>
  `;
  document.body.appendChild(heightBackdrop);

  // ===== 엘리먼트 참조 =====
  const loginOpenBtn = document.getElementById('loginOpen');
  const userMenu = document.getElementById('userMenu');
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userMenuPanel = document.getElementById('userMenuPanel');
  const logoutBtn = document.getElementById('logoutMenuBtn');

  const who = document.getElementById('whoami');
  const menuName = document.getElementById('menuName');
  const menuEmail = document.getElementById('menuEmail');
  const menuProvider = document.getElementById('menuProvider');
  const userPillPhoto = document.getElementById('userPillPhoto');

  const modal = document.getElementById('loginBackdrop');
  const sheet = document.getElementById('loginSheet');
  const modalClose = document.getElementById('modalClose');

  // 마이페이지 엘리먼트
  const mypageBackdropEl = document.getElementById('mypageBackdrop');
  const mypageSheet = document.getElementById('mypageSheet');
  const mypageClose = document.getElementById('mypageClose');
  const mypageScoreValue = document.getElementById('mypageScoreValue');
  const mypageScoreBar = document.getElementById('mypageScoreBar');
  const mypageReviewList = document.getElementById('mypageReviewList');
  const mypageEditProfileBtn = document.getElementById('mypageEditProfileBtn');
  const mypageLogoutBtn = document.getElementById('mypageLogoutBtn');
  const mypageProfileImage = document.getElementById('mypageProfileImage');
  const mypageProfileName = document.getElementById('mypageProfileName');
  const mypageScoreDesc = document.getElementById('mypageScoreDesc');

  // 회원 정보 수정(최대 턱 높이) 모달 엘리먼트
  const heightSheet = document.getElementById('heightSheet');
  const heightClose = document.getElementById('heightClose');
  const maxHeightInput = document.getElementById('maxHeightInput');
  const heightSaveBtn = document.getElementById('heightSaveBtn');

  let currentUser = null;

  // ===== 로그인 모달 열고/닫기 =====
  function openModal() {
    modal.style.display = 'flex';          // 중앙 정렬 위해 flex
    requestAnimationFrame(() => sheet.classList.add('open'));
  }
  function closeModal() {
    sheet.classList.remove('open');
    setTimeout(() => { modal.style.display = 'none'; }, 250);
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ===== 휠스코어 업데이트 함수 =====
  const MAX_SCORE_M = 100; // 휠스코어 바의 최대값 (100m)
  
  function updateMypageScore(scoreM) {
    if (!mypageScoreValue || !mypageScoreBar || !mypageScoreDesc) return;
    
    // 숫자 표시: 소수점 첫째자리까지
    const scoreDisplay = (scoreM || 0).toFixed(1);
    mypageScoreValue.textContent = scoreDisplay;

    // 설명 문장 업데이트
    mypageScoreDesc.textContent =
      `당신이 작성한 리뷰가 ${scoreDisplay}m의 배리어를 없애는 데 기여했어요.`;

    // 바 길이: 0~MAX_SCORE_M 구간을 0~100%로 매핑 (최소 5% 표시)
    const percent = Math.max(5, Math.min(100, ((scoreM || 0) / MAX_SCORE_M) * 100));
    mypageScoreBar.style.width = percent + '%';
  }

  // ===== 마이페이지 열고/닫기 =====
  async function openMypage() {
    if (!currentUser) return;

    // 상단 프로필 정보
    const displayName = currentUser.name || currentUser.email || '사용자';
    mypageProfileName.textContent = displayName;
    if (currentUser.profileImage) {
      mypageProfileImage.src = currentUser.profileImage;
      mypageProfileImage.style.display = 'block';
    } else {
      mypageProfileImage.style.display = 'none';
    }

    // 백엔드에서 실제 휠스코어 가져오기
    const kakaoId = currentUser.kakaoId || currentUser.kakao_id;
    let scoreM = 0.0;
    let maxHeight = 0;

    try {
      if (kakaoId && window.ReviewAPI && window.ReviewAPI.getOrCreateUserByKakao) {
        const userInfo = await window.ReviewAPI.getOrCreateUserByKakao(
          kakaoId,
          currentUser.email,
          currentUser.name
        );

        scoreM = userInfo.user?.review_score ?? 0.0;
        maxHeight = userInfo.user?.max_height_cm ?? 0;
      }
    } catch (error) {
      console.error('휠스코어 가져오기 실패:', error);
      scoreM = 0.0;
      maxHeight = 0;
    }


    // 점수 업데이트
    updateMypageScore(scoreM);

    // 최대 턱 높이 값 UI 업데이트
    const maxHeightEl = document.getElementById('mypageMaxHeightCm');
    if (maxHeightEl) {
      maxHeightEl.textContent = maxHeight;
    }

    // 사용자 리뷰 가져오기
    try {
      if (kakaoId && window.ReviewAPI && window.ReviewAPI.getOrCreateUserByKakao) {
        const userInfo = await window.ReviewAPI.getOrCreateUserByKakao(
          kakaoId,
          currentUser.email,
          currentUser.name
        );
        const userId = userInfo.user_id;
        
        if (userId && window.ReviewAPI.getReviewsByUser) {
          const reviewsData = await window.ReviewAPI.getReviewsByUser(userId);
          const reviews = reviewsData.items || [];
          
          if (reviews.length > 0) {
            // Fetch shop info for each review
            const reviewsWithShopInfo = await Promise.all(
              reviews.map(async (review) => {
                let shopInfo = { name: '알 수 없는 매장', image: null };
                try {
                  // shop_id might be ObjectId or string
                  const shopId = review.shop_id || review.shopId;
                  if (shopId && window.ReviewAPI && window.ReviewAPI.getShop) {
                    // Convert ObjectId to string if needed
                    const shopIdStr = typeof shopId === 'object' && shopId.$oid ? shopId.$oid : String(shopId);
                    const shop = await window.ReviewAPI.getShop(shopIdStr);
                    shopInfo = {
                      name: shop.name || '알 수 없는 매장',
                      image: shop.image || shop.photo_url || null
                    };
                  }
                } catch (err) {
                  console.warn('[MYPAGE] Failed to fetch shop info for review:', err);
                }
                return { ...review, shopInfo };
              })
            );
            
            let html = '';
            reviewsWithShopInfo.forEach(review => {
              const reviewDate = review.created_at ? new Date(review.created_at).toLocaleDateString('ko-KR') : '';
              const reviewText = review.review_text || '';
              const photos = review.photo_urls || [];
              const shopName = review.shopInfo?.name || '알 수 없는 매장';
              const shopImage = review.shopInfo?.image;
              
              // Color coding for review features
              const getFeatureClass = (value, type) => {
                if (value === null || value === undefined) return '';
                if (type === 'enter') {
                  return value ? 'mypage-review-tag-good' : 'mypage-review-tag-bad';
                }
                if (type === 'comfort') {
                  return value ? 'mypage-review-tag-good' : 'mypage-review-tag-bad';
                }
                if (type === 'alone') {
                  return value ? 'mypage-review-tag-good' : 'mypage-review-tag-warning';
                }
                return 'mypage-review-tag-neutral';
              };
              
              html += `
                <li class="mypage-review-item">
                  <div class="mypage-review-header">
                    <div class="mypage-review-shop-info">
                      ${shopImage ? `<img src="${shopImage}" alt="${shopName}" class="mypage-review-shop-image" onerror="this.style.display='none'">` : ''}
                      <span class="mypage-review-shop-name">${shopName}</span>
                    </div>
                    <span class="mypage-review-date">${reviewDate}</span>
                  </div>
                  ${reviewText ? `<div class="mypage-review-text">${reviewText}</div>` : ''}
                  ${photos.length > 0 ? `
                    <div class="mypage-review-photos">
                      ${photos.map(url => `<img src="${url}" alt="리뷰 사진" class="mypage-review-photo" />`).join('')}
                    </div>
                  ` : ''}
                  <div class="mypage-review-features">
                    ${review.enter !== null ? `<span class="mypage-review-tag ${getFeatureClass(review.enter, 'enter')}">${review.enter ? '✓ 입장 가능' : '✗ 입장 불가'}</span>` : ''}
                    ${review.alone !== null ? `<span class="mypage-review-tag ${getFeatureClass(review.alone, 'alone')}">${review.alone ? '✓ 혼자 가능' : '✗ 도움 필요'}</span>` : ''}
                    ${review.ramp ? '<span class="mypage-review-tag mypage-review-tag-good">경사로</span>' : ''}
                    ${review.curb ? '<span class="mypage-review-tag mypage-review-tag-warning">턱</span>' : ''}
                    ${review.comfort !== null ? `<span class="mypage-review-tag ${getFeatureClass(review.comfort, 'comfort')}">${review.comfort ? '✓ 편함' : '✗ 불편함'}</span>` : ''}
                  </div>
                </li>
              `;
            });
            mypageReviewList.innerHTML = html;
          } else {
            mypageReviewList.innerHTML = `
              <li class="mypage-review-empty">아직 작성한 리뷰가 없습니다.</li>
            `;
          }
        } else {
          mypageReviewList.innerHTML = `
            <li class="mypage-review-empty">아직 작성한 리뷰가 없습니다.</li>
          `;
        }
      } else {
        mypageReviewList.innerHTML = `
          <li class="mypage-review-empty">아직 작성한 리뷰가 없습니다.</li>
        `;
      }
    } catch (error) {
      console.error('[MYPAGE REVIEW ERROR] 리뷰 가져오기 실패:', error);
      console.error('[MYPAGE REVIEW ERROR] 에러 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Show more specific error message
      let errorMsg = '리뷰를 불러오는데 실패했습니다.';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMsg = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else if (error.message.includes('404')) {
        errorMsg = '사용자 정보를 찾을 수 없습니다.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMsg = '인증 오류가 발생했습니다. API 키를 확인해주세요.';
      } else if (error.message) {
        errorMsg = `오류: ${error.message}`;
      }
      
      mypageReviewList.innerHTML = `
        <li class="mypage-review-empty">${errorMsg}</li>
      `;
    }

    mypageBackdropEl.style.display = 'flex';
  }

  // window에 노출하여 다른 파일에서 호출 가능하도록
  window.updateMypageScore = updateMypageScore;

  function closeMypage() {
    mypageBackdropEl.style.display = 'none';
  }

  mypageClose.addEventListener('click', closeMypage);
  mypageBackdropEl.addEventListener('click', (e) => {
    if (e.target === mypageBackdropEl) closeMypage();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMypage();
    }
  });

  // 기존 작은 드롭다운 대신, 이름 pill을 누르면 마이페이지 열기
  userMenuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openMypage();
  });

  // 바깥 클릭 시 기존 드롭다운을 닫는 로직
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenuPanel.classList.remove('open');
    }
  });

  // ===== 최대 턱 높이 설정 모달 열고/닫기 =====
  async function openHeightModal() {
    try {
      // 1) 세션에서 현재 로그인 유저 가져오기
      const meRes = await fetch('/session/me');
      const meData = await meRes.json();
      const sessionUser = meData.user;

      if (!sessionUser) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 2) Kakao ID 얻기
      const kakaoId = sessionUser.kakaoId || sessionUser.kakao_id;
      if (!kakaoId) {
        alert('카카오 로그인 후 이용해 주세요.');
        return;
      }

      // 3) 백엔드 user 보장 + 현재 max_height_cm 가져오기
      let maxHeight = 0;
      if (window.ReviewAPI && typeof window.ReviewAPI.getOrCreateUserByKakao === 'function') {
        const userInfo = await window.ReviewAPI.getOrCreateUserByKakao(
          kakaoId,
          sessionUser.email,
          sessionUser.name
        );
        maxHeight = userInfo.user?.max_height_cm ?? 0;
      }

      // 4) 인풋에 현재 값 세팅
      maxHeightInput.value = String(maxHeight);

      // 모달 표시
      heightBackdrop.style.display = 'flex';
      requestAnimationFrame(() => {
        heightSheet.classList.add('open');
      });
    } catch (e) {
      console.error('openHeightModal error:', e);
      alert('회원 정보를 불러오지 못했습니다.');
    }
  }


  function closeHeightModal() {
    heightSheet.classList.remove('open');
    setTimeout(() => {
      heightBackdrop.style.display = 'none';
    }, 200);
  }

  heightClose.addEventListener('click', closeHeightModal);
  heightBackdrop.addEventListener('click', (e) => {
    if (e.target === heightBackdrop) closeHeightModal();
  });

// 최대 턱 높이 저장
heightSaveBtn.addEventListener('click', async () => {
  const raw = maxHeightInput.value;
  const n = Number(raw);

  if (!Number.isFinite(n) || n < 0) {
    alert('0 이상의 숫자를 입력해 주세요.');
    return;
  }

  const cm = Math.round(n); // 1cm 단위 반올림
  maxHeightInput.value = String(cm);

  try {
    // 1) 세션에서 현재 로그인 유저 가져오기
    const meRes = await fetch('/session/me');
    const meData = await meRes.json();
    const sessionUser = meData.user;

    if (!sessionUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const kakaoId = sessionUser.kakaoId || sessionUser.kakao_id;
    if (!kakaoId) {
      alert('카카오 로그인 후 이용해 주세요.');
      return;
    }

    // 2) 백엔드에 user가 반드시 존재하도록 보장 + user_id 얻기
    if (!window.ReviewAPI || typeof window.ReviewAPI.getOrCreateUserByKakao !== 'function') {
      console.error('ReviewAPI.getOrCreateUserByKakao 가 없습니다.');
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }

    const userInfo = await window.ReviewAPI.getOrCreateUserByKakao(
      kakaoId,
      sessionUser.email,
      sessionUser.name
    );

    const backendAuthId = userInfo.user.auth_id;

    // 3) ReviewAPI 가 쓰는 백엔드 base URL 재사용
    const API_BASE = API_BASE_URL; 

    // 4) /users/me 로 PATCH 요청 보내기
    const resp = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Id': backendAuthId,
      },
      body: JSON.stringify({ max_height_cm: cm }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('max_height_cm update failed:', resp.status, errBody);
      alert('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    alert('저장되었습니다.');

    // 마이페이지 열려있다면 표시값도 갱신
    const maxHeightEl = document.getElementById('mypageMaxHeightCm');
    if (maxHeightEl) {
      maxHeightEl.textContent = cm;
    }

    closeHeightModal();
  } catch (e) {
    console.error('max_height_cm update error:', e);
    alert('서버와 통신 중 오류가 발생했습니다.');
  }
});



  // ===== 로그인 상태 반영 =====
  async function refreshWho() {
    try {
      const r = await fetch('/session/me');
      const j = await r.json();
      currentUser = j.user || null;

      if (currentUser && currentUser.profileImage) {
        userPillPhoto.src = currentUser.profileImage;
        userPillPhoto.style.display = 'block';
      } else {
        userPillPhoto.style.display = 'none';
      }

      if (currentUser) {
        const displayName = currentUser.name || currentUser.email || '사용자';
        const providerText =
          currentUser.provider === 'kakao'
            ? '카카오 계정으로 로그인 중'
            : '이메일 계정으로 로그인 중';

        who.textContent = displayName + '님';
        menuName.textContent = displayName;
        menuEmail.textContent = currentUser.email || '';
        menuProvider.textContent = providerText;

        loginOpenBtn.style.display = 'none';
        userMenu.style.display = 'inline-flex';
      } else {
        who.textContent = '';
        menuName.textContent = '';
        menuEmail.textContent = '';
        menuProvider.textContent = '';

        loginOpenBtn.style.display = 'inline-flex';
        userMenu.style.display = 'none';
        userMenuPanel.classList.remove('open');
        closeMypage();
      }
    } catch {
      loginOpenBtn.style.display = 'inline-flex';
      userMenu.style.display = 'none';
      userMenuPanel.classList.remove('open');
      closeMypage();
    }
  }

  // ===== 공통 로그아웃 함수 =====
  async function doLogout() {
    try {
      await fetch('/session/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      closeMypage();
      refreshWho();
    }
  }

  // 기존 작은 메뉴의 로그아웃 버튼
  logoutBtn.addEventListener('click', doLogout);
  // 마이페이지 하단 로그아웃 버튼
  mypageLogoutBtn.addEventListener('click', doLogout);

  // 회원정보 수정 버튼 → 최대 턱 높이 설정 모달 열기
  mypageEditProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openHeightModal();
  });


  // ===== Kakao OAuth (JS SDK → authorize 리다이렉트) =====
  function initKakao() {
    if (!window.Kakao) return;
    try {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
    } catch (e) { /* ignore */ }
  }

  function doKakaoLogin() {
    initKakao();
    const back = encodeURIComponent(location.pathname + location.search);
    window.Kakao.Auth.authorize({
      redirectUri: KAKAO_REDIRECT_URI, // 서버 시작 전 반드시 확인하기! 예: http://localhost:3000/auth/kakao/callback
      state: back
    });
  }

  // 우상단 카카오 로그인 버튼 클릭 시 바로 카카오 로그인으로 연결
  loginOpenBtn.addEventListener('click', function (e) {
    e.preventDefault();
    doKakaoLogin();
  });

  // 모달 내 카카오 로그인 버튼 클릭 시
  const kakaoLoginBtn = document.getElementById('kakaoLoginBtn');
  if (kakaoLoginBtn) {
    kakaoLoginBtn.addEventListener('click', function () {
      doKakaoLogin();
    });
  }

  // ===== 초기 상태 =====
  refreshWho();

  // 카카오 로그인 실패 시 모달 열기
  if (new URLSearchParams(location.search).get('loginError') === 'kakao') {
    openModal();
  }
})();
