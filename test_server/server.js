// server.js
// 정적 서버 + 자체 회원/로그인 API + 카카오 로그인 콜백

const KAKAO_JS_KEY = '01785b9a288ab46417b78a3790ac85c5'; // 서버 시작 전 반드시 확인하기!
const KAKAO_REST_KEY = 'cd7557809738d1512f8d09b00fbe9afb'; // Kakao REST API 키 - 서버에서만 사용
const KAKAO_REDIRECT_URI = 'https://test.sbserver.store/auth/kakao/callback';  // 서버 시작 전 반드시 확인하기!

const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

/** 데모용 In-Memory DB (실서비스면 DB 사용) */
const users = new Map(); // email -> { email, name, passwordHash, provider, kakaoId? }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'sess',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    httpOnly: true,
    sameSite: 'lax',
  })
);

// 로그인 상태
app.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

// 회원가입
app.post('/api/signup', async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password) return res.status(400).json({ error: '필수 항목 누락' });
  if (users.has(email)) return res.status(409).json({ error: '이미 가입된 이메일' });

  const passwordHash = await bcrypt.hash(password, 10);
  users.set(email, { email, name, passwordHash, provider: 'local' });
  req.session.user = { email, name, provider: 'local' };
  res.json({ ok: true });
});

// 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const u = users.get(email);
  if (!u || u.provider !== 'local') return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  req.session.user = { email: u.email, name: u.name, provider: 'local' };
  res.json({ ok: true });
});

// 로그아웃
app.post('/api/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// ===== Kakao OAuth Callback =====
app.get('/auth/kakao/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_REST_KEY,          // ✅ REST API 키 사용
        redirect_uri: KAKAO_REDIRECT_URI,   // ✅ authorize에서 쓴 것과 동일
        code,
        // client_secret: process.env.KAKAO_CLIENT_SECRET || '',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenRes.data.access_token;

    const meRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const kakaoId = meRes.data.id;
    const kakaoAccount = meRes.data.kakao_account || {};

    // ✅ 이름 계산 로직 (프로필 닉네임 필수 동의 기준)
    let name = '카카오사용자';
    if (kakaoAccount.profile && kakaoAccount.profile.nickname) {
      name = kakaoAccount.profile.nickname;
    } else if (kakaoAccount.name) {
      name = kakaoAccount.name;
    } else if (kakaoAccount.email) {
      name = kakaoAccount.email.split('@')[0];
    }

    const email = kakaoAccount.email || `kakao_${kakaoId}@noemail.local`;

    if (!users.has(email)) {
      users.set(email, { email, name, provider: 'kakao', kakaoId });
    }
    req.session.user = { email, name, provider: 'kakao' };

    const back = state && typeof state === 'string' ? decodeURIComponent(state) : '/';
    res.redirect(back.includes('/auth') ? '/' : back);
  } catch (e) {
    console.error('Kakao OAuth Error:', e?.response?.data || e.message);
    res.redirect('/?loginError=kakao');
  }
});

// ===== 크롤링 API =====
// 장소 정보 크롤링 (선택적 기능 - puppeteer 설치 시 사용 가능)
let crawlApi = null;
try {
  crawlApi = require('./crawl_api');
  console.log('✅ 크롤링 API 로드됨 (puppeteer 사용 가능)');
} catch (e) {
  console.log('⚠️ 크롤링 API 사용 불가 (puppeteer 미설치)');
}

app.post('/api/crawl/place', async (req, res) => {
  if (!crawlApi) {
    return res.status(503).json({ error: 'Crawling service not available' });
  }
  
  const { placeName, placeUrl } = req.body;
  if (!placeName) {
    return res.status(400).json({ error: 'placeName is required' });
  }
  
  try {
    const result = await crawlApi.crawlPlaceInfo(placeName, placeUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crawl/places', async (req, res) => {
  if (!crawlApi) {
    return res.status(503).json({ error: 'Crawling service not available' });
  }
  
  const { places } = req.body;
  if (!Array.isArray(places)) {
    return res.status(400).json({ error: 'places array is required' });
  }
  
  try {
    const results = await crawlApi.crawlMultiplePlaces(places);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 정적 파일
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
