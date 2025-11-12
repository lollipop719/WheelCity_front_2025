// public/auth.js
// 로그인 버튼 UI + 자체 회원가입/로그인 + 카카오 로그인 (팝업 슬라이드업)

(function () {
    // ===== 상단 우측 로그인 영역 삽입 =====
    const userBox = document.createElement('div');
    userBox.className = 'user-box';
    userBox.innerHTML = `
      <span class="who" id="whoami"></span>
      <button class="btn" id="loginOpen">로그인</button>
      <button class="btn" id="logoutBtn" style="display:none;">로그아웃</button>
    `;
    document.body.appendChild(userBox);
  
    // ===== 모달 마크업 삽입 (슬라이드업 시트) =====
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
  
    // ===== 상태 & 엘리먼트 =====
    const who = document.getElementById('whoami');
    const openBtn = document.getElementById('loginOpen');
    const logoutBtn = document.getElementById('logoutBtn');
  
    const sheet = document.getElementById('loginSheet');
    const modal = document.getElementById('loginBackdrop');
    const modalClose = document.getElementById('modalClose');
  
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const formLogin = document.getElementById('formLogin');
    const formSignup = document.getElementById('formSignup');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
  
    // ===== 모달 열고/닫기 =====
    function openModal() {
      modal.style.display = 'block';
      // 살짝 딜레이 후 시트 올리기 (transition 트리거)
      requestAnimationFrame(() => sheet.classList.add('open'));
    }
    function closeModal() {
      sheet.classList.remove('open');
      setTimeout(() => { modal.style.display = 'none'; }, 280);
      loginError.textContent = '';
      signupError.textContent = '';
    }
  
    openBtn.addEventListener('click', openModal);
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
  
    // ===== 로그인 상태 =====
    async function refreshWho() {
      try {
        const r = await fetch('/api/me');
        const j = await r.json();
        if (j.user) {
          who.textContent = `${j.user.name}님`;
          openBtn.style.display = 'none';
          logoutBtn.style.display = 'inline-flex';
        } else {
          who.textContent = '';
          openBtn.style.display = 'inline-flex';
          logoutBtn.style.display = 'none';
        }
      } catch { /* ignore */ }
    }
  
    // ===== 폼 제출 =====
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault(); loginError.textContent = '';
      const fd = new FormData(formLogin);
      const body = Object.fromEntries(fd.entries());
      const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if (r.ok) { closeModal(); refreshWho(); }
      else { const j = await r.json().catch(()=>({})); loginError.textContent = j.error || '로그인 실패'; }
    });
  
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault(); signupError.textContent = '';
      const fd = new FormData(formSignup);
      const body = Object.fromEntries(fd.entries());
      const r = await fetch('/api/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if (r.ok) { closeModal(); refreshWho(); }
      else { const j = await r.json().catch(()=>({})); signupError.textContent = j.error || '회원가입 실패'; }
    });
  
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/logout', { method:'POST' });
      refreshWho();
    });
  
    // ===== Kakao OAuth (JS SDK → authorize 리다이렉트) =====
    // window.Kakao는 index.html 외부에서 로드할 예정(아래 append 지시문 참고)
    function initKakao() {
      if (!window.Kakao) return;
      try {
        // 꼭 Kakao Developers의 JavaScript 키로 초기화하세요.
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('YOUR_KAKAO_JAVASCRIPT_KEY');
        }
      } catch (e) { /* ignore */ }
    }
    document.getElementById('kakaoLoginBtn').addEventListener('click', function () {
      initKakao();
      const back = encodeURIComponent(location.pathname + location.search);
      window.Kakao.Auth.authorize({
        redirectUri: 'YOUR_REDIRECT_URI_MATCHED_IN_DASHBOARD', // 예) https://your-domain.com/auth/kakao/callback
        state: back
      });
    });
  
    // 초기 상태
    refreshWho();
  
    // 쿼리에 카카오 실패 플래그 있으면 모달 열고 안내
    if (new URLSearchParams(location.search).get('loginError') === 'kakao') {
      openModal(); tabLogin.click(); loginError.textContent = '카카오 로그인 실패. 다시 시도해 주세요.';
    }
  })();
  