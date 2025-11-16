// public/auth.js
// 로그인 버튼 UI + 자체 회원가입/로그인 + 카카오 로그인 (팝업 + 상단 유저 메뉴)

const KAKAO_JS_KEY = '01785b9a288ab46417b78a3790ac85c5'; // 서버 시작 전 반드시 확인하기!
// 로컬 개발용: http://localhost:3000/auth/kakao/callback
// 프로덕션용: https://test.sbserver.store/auth/kakao/callback
// 수동으로 설정 - 환경에 맞게 변경하세요
const KAKAO_REDIRECT_URI = 'https://test.sbserver.store/auth/kakao/callback';

(function () {
  // ===== 상단 우측 영역 생성 =====
  const userBox = document.createElement('div');
  userBox.className = 'user-box';
  userBox.innerHTML = `
    <button class="btn" id="loginOpen">로그인</button>
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
        <div class="tabs">
          <button id="tabLogin" class="active">로그인</button>
          <button id="tabSignup">회원가입</button>
        </div>
        <button class="close" id="modalClose">✕</button>
      </div>
      <div class="modal-body">
        <form id="formLogin">
          <div class="field">
            <label>이메일</label>
            <input name="email" type="email" required />
          </div>
          <div class="field">
            <label>비밀번호</label>
            <input name="password" type="password" minlength="6" required />
          </div>
          <div class="error" id="loginError"></div>
          <button class="submit" type="submit">이메일로 로그인</button>
        </form>

        <form id="formSignup" style="display:none;">
          <div class="field">
            <label>이름</label>
            <input name="name" type="text" minlength="2" required />
          </div>
          <div class="field">
            <label>이메일</label>
            <input name="email" type="email" required />
          </div>
          <div class="field">
            <label>비밀번호 (6자 이상)</label>
            <input name="password" type="password" minlength="6" required />
          </div>
          <div class="error" id="signupError"></div>
          <button class="submit" type="submit">회원가입 후 로그인</button>
        </form>

        <button id="kakaoLoginBtn" class="kakao-btn">카카오로 계속하기</button>
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

  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const formLogin = document.getElementById('formLogin');
  const formSignup = document.getElementById('formSignup');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  // 마이페이지 엘리먼트
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

  let currentUser = null;

  // ===== 로그인 모달 열고/닫기 =====
  function openModal() {
    modal.style.display = 'flex';          // 중앙 정렬 위해 flex
    requestAnimationFrame(() => sheet.classList.add('open'));
  }
  function closeModal() {
    sheet.classList.remove('open');
    setTimeout(() => { modal.style.display = 'none'; }, 250);
    loginError.textContent = '';
    signupError.textContent = '';
  }

  loginOpenBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ===== 탭 전환 =====
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active'); tabSignup.classList.remove('active');
    formLogin.style.display = 'block'; formSignup.style.display = 'none';
  });
  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active'); tabLogin.classList.remove('active');
    formSignup.style.display = 'block'; formLogin.style.display = 'none';
  });

  // ===== 마이페이지 열고/닫기 =====
  function openMypage() {
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

    // TODO: 나중에 실제 휠스코어(m) 값을 API에서 받아오면 교체
    const dummyScoreM = 320.4; // float 예시

    // 숫자 표시: 소수점 첫째자리까지
    const scoreDisplay = dummyScoreM.toFixed(1); // "320.4"
    mypageScoreValue.textContent = scoreDisplay;

    // 설명 문장 업데이트
    if (mypageScoreDesc) {
      mypageScoreDesc.textContent =
        `당신이 작성한 리뷰가 ${scoreDisplay}m의 배리어를 없애는 데 기여했어요.`;
    }

    // 바 길이: 예시로 0~5000m 구간을 0~100%로 매핑
    const percent = Math.max(5, Math.min(100, (dummyScoreM / 5000) * 100));
    mypageScoreBar.style.width = percent + '%';

    // 리뷰 리스트는 나중에 API 붙이기 전까진 더미
    mypageReviewList.innerHTML = `
      <li class="mypage-review-empty">아직 작성한 리뷰가 없습니다.</li>
    `;

    mypageBackdrop.style.display = 'flex';
  }

  function closeMypage() {
    mypageBackdrop.style.display = 'none';
  }

  mypageClose.addEventListener('click', closeMypage);
  mypageBackdrop.addEventListener('click', (e) => {
    if (e.target === mypageBackdrop) closeMypage();
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

  // ===== 로그인 상태 반영 =====
  async function refreshWho() {
    try {
      const r = await fetch('/api/me');
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
      await fetch('/api/logout', { method: 'POST' });
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

  // 회원정보 수정 버튼 (지금은 알림만)
  mypageEditProfileBtn.addEventListener('click', () => {
    alert('회원정보 수정 화면은 아직 준비 중입니다.');
  });

  // ===== 폼 제출 =====
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault(); loginError.textContent = '';
    const fd = new FormData(formLogin);
    const body = Object.fromEntries(fd.entries());
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      closeModal();
      refreshWho();
    } else {
      const j = await r.json().catch(() => ({}));
      loginError.textContent = j.error || '로그인 실패';
    }
  });

  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault(); signupError.textContent = '';
    const fd = new FormData(formSignup);
    const body = Object.fromEntries(fd.entries());
    const r = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      closeModal();
      refreshWho();
    } else {
      const j = await r.json().catch(() => ({}));
      signupError.textContent = j.error || '회원가입 실패';
    }
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

  document.getElementById('kakaoLoginBtn').addEventListener('click', function () {
    initKakao();
    const back = encodeURIComponent(location.pathname + location.search);
    window.Kakao.Auth.authorize({
      redirectUri: KAKAO_REDIRECT_URI, // 서버 시작 전 반드시 확인하기! 예: http://localhost:3000/auth/kakao/callback
      state: back
    });
  });

  // ===== 초기 상태 =====
  refreshWho();

  // 카카오 로그인 실패 시 모달 열기
  if (new URLSearchParams(location.search).get('loginError') === 'kakao') {
    openModal();
    tabLogin.click();
    loginError.textContent = '카카오 로그인 실패. 다시 시도해 주세요.';
  }
})();
