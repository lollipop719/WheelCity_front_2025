// server.js
// 정적 서버 + 자체 회원/로그인 API + 카카오 로그인 콜백

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
        client_id: process.env.KAKAO_REST_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET || '',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenRes.data.access_token;

    const meRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const kakaoId = meRes.data.id;
    const kakaoAccount = meRes.data.kakao_account || {};
    const email = kakaoAccount.email || `kakao_${kakaoId}@noemail.local`;
    const name =
      (kakaoAccount.profile && (kakaoAccount.profile.nickname || kakaoAccount.profile.profile_nickname)) ||
      '카카오사용자';

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

// 정적 파일
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
