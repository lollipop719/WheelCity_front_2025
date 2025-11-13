# 서버 시작 전 호환성 점검(API키 등 수정해야할 부분 정리)

## 1. server.js
Line 4, 5, 6
KAKAO_REST_KEY, KAKAO_JS_KEY, KAKAO_REDIRECT_URI 점검 및 필요시 수정하기

## 2. index.html
Line 458
<script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=01785b9a288ab46417b78a3790ac85c5&libraries=services"></script> 점검 및 필요시 수정하기

## 3. auth.js
Line 4, 5
KAKAO_JS_KEY, KAKAO_REDIRECT_URI 점검 및 필요시 수정하기

로컬에서 실행 시 KAKAO_REDIRECT_URI를 https://localhost:3000/auth/kakao/callback