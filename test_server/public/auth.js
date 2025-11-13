// public/auth.js
// 로그인 버튼 UI + 자체 회원가입/로그인 + 카카오 로그인 (팝업 + 상단 유저 메뉴)

const KAKAO_JS_KEY = '01785b9a288ab46417b78a3790ac85c5'; // 서버 시작 전 반드시 확인하기!
const KAKAO_REDIRECT_URI = 'https://test.sbserver.store/auth/kakao/callback';  // 서버 시작 전 반드시 확인하기!

(function () {
  // ===== 상단 우측 영역 생성 =====
  const userBox = document.createElement('div');
  userBox.className = 'user-box';
  userBox.innerHTML = `
    <button class="btn" id="loginOpen">로그인</button>
    <div class="user-menu" id="userMenu" style="display:none;">
      <button class="user-pill" id="userMenuToggle">
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

  // ===== 모달 마크업 삽입 (슬라이드업 대신 중앙 카드) =====
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

  const modal = document.getElementById('loginBackdrop');
  const sheet = document.getElementById('loginSheet');
  const modalClose = document.getElementById('modalClose');

  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const formLogin = document.getElementById('formLogin');
  const formSignup = document.getElementById('formSignup');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  let currentUser = null;

  // ===== 모달 열고/닫기 =====
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

  // ===== 유저 메뉴 토글 =====
  userMenuToggle.addEventListener('click', () => {
    userMenuPanel.classList.toggle('open');
  });
  // 모달/유저메뉴 외 영역 클릭 시 메뉴 닫기
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
      }
    } catch {
      // 에러 시에는 그냥 로그인 안 된 상태처럼 보이게 둡니다.
      loginOpenBtn.style.display = 'inline-flex';
      userMenu.style.display = 'none';
      userMenuPanel.classList.remove('open');
    }
  }

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

  // ===== 로그아웃 =====
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    refreshWho();
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
