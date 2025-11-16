# 리뷰 제출 기능 구현 가이드

## 개요

이 문서는 리뷰 제출 기능의 구현 방법을 설명합니다. 사용자가 리뷰를 작성하면:
1. 매장 정보를 가져오거나 생성
2. 이미지를 AWS S3에 업로드
3. 리뷰 데이터와 이미지 URL을 백엔드에 제출

## 구현된 기능

### 1. API 서비스 (`public/js/api.js`)
- 백엔드 API와 통신하는 유틸리티 함수들
- 매장 정보 조회/생성
- S3 업로드 URL 요청
- 이미지 S3 업로드
- 리뷰 제출

### 2. 리뷰 서비스 (`public/js/reviewService.js`)
- 이미지 업로드 및 리뷰 제출을 통합 처리하는 서비스
- S3 업로드 플로우 자동화

### 3. 리뷰 폼 업데이트 (`public/js/events.js`)
- 리뷰 제출 시 자동으로 매장 정보 가져오기/생성
- 이미지 업로드 처리
- 백엔드에 리뷰 제출

## 설정 방법

### 1. 백엔드 API URL 설정

`test_server/public/js/api.js` 파일에서 백엔드 서버 URL을 설정하세요:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000'; // 백엔드 서버 URL로 변경
```

### 2. 사용자 ID 설정

현재는 `dummy_user_id`를 사용하고 있습니다. 실제 사용자 인증 시스템과 연동하려면:

`test_server/public/js/events.js` 파일의 다음 부분을 수정하세요:

```javascript
const reviewData = {
    user_id: 'dummy_user_id', // TODO: Get from session/auth
    // ...
};
```

세션 또는 인증 시스템에서 사용자 ID를 가져오도록 변경하세요.

## 작동 흐름

### 1. 장소 선택
- 사용자가 지도에서 장소를 선택하면 `showPlaceDetail()` 함수가 호출됩니다
- 선택된 장소 정보가 `window.currentPlace`에 저장됩니다

### 2. 리뷰 작성
- 사용자가 리뷰 작성 버튼을 클릭하면 리뷰 모달이 열립니다
- 사용자가 리뷰 정보를 입력하고 이미지를 선택합니다

### 3. 리뷰 제출
리뷰 제출 버튼을 클릭하면 다음 순서로 처리됩니다:

1. **매장 정보 가져오기/생성**
   - `window.currentPlace` 정보를 사용하여 백엔드에서 매장을 조회
   - 매장이 없으면 새로 생성
   - 매장 ID(`shop_id`) 획득

2. **이미지 업로드 (이미지가 있는 경우)**
   - 백엔드에 S3 업로드 URL 요청: `POST /reviews/{shop_id}/upload-urls`
   - 각 이미지 파일을 S3에 업로드: `PUT {upload_url}`
   - 업로드된 이미지의 공개 URL(`public_urls`) 획득

3. **리뷰 제출**
   - 리뷰 데이터와 이미지 URL을 백엔드에 제출: `POST /reviews/{shop_id}`
   - 제출 성공 시 모달 닫기 및 폼 초기화

## 백엔드 API 엔드포인트

### 1. 매장 생성
```
POST /shops/
Content-Type: application/json

{
  "name": "매장명",
  "location": {
    "type": "Point",
    "coordinates": [경도, 위도]
  },
  "address": "주소",
  "phone": "전화번호",
  "category": "카테고리"
}
```

### 2. S3 업로드 URL 요청
```
POST /reviews/{shop_id}/upload-urls
Content-Type: application/json

{
  "files": ["filename1.jpg", "filename2.jpg"]
}

Response:
{
  "upload_urls": [
    {
      "upload_url": "https://s3.amazonaws.com/...",
      "filename": "filename1.jpg"
    }
  ],
  "public_urls": [
    "https://s3.amazonaws.com/.../filename1.jpg"
  ]
}
```

### 3. 리뷰 제출
```
POST /reviews/{shop_id}
Content-Type: application/json

{
  "user_id": "user_id",
  "enter": true,
  "alone": false,
  "comfort": true,
  "ai_correct": {
    "ramp": true,
    "curb": false
  },
  "photo_urls": [
    "https://s3.amazonaws.com/.../image1.jpg"
  ],
  "review_text": "리뷰 내용"
}
```

## 매장 ID 처리 방법

현재 구현은 다음과 같이 작동합니다:

1. **매장 정보 요청**: 리뷰 제출 시 `getOrCreateShop()` 함수가 호출됩니다
2. **매장 생성**: 백엔드에 매장 정보를 전송하여 새 매장을 생성합니다
3. **매장 ID 획득**: 생성된 매장의 `_id` 또는 `id` 필드를 사용합니다

### 개선 방안

더 효율적인 방법으로 개선하려면:

1. **매장 조회 엔드포인트 추가**: 좌표나 이름으로 기존 매장을 조회하는 API 추가
2. **매장 캐싱**: 프론트엔드에서 매장 정보를 캐시하여 중복 요청 방지
3. **Kakao Place ID 활용**: Kakao Maps의 `place_id`를 사용하여 매장 매핑

예시:
```javascript
// 매장 조회 시도
try {
  const shop = await window.ReviewAPI.getShopByPlaceId(placeInfo.id);
  return shop;
} catch (error) {
  // 매장이 없으면 생성
  return await window.ReviewAPI.createShop(placeInfo);
}
```

## 문제 해결

### 1. CORS 오류
백엔드 서버에서 CORS를 허용하도록 설정해야 합니다.

### 2. 매장 ID를 찾을 수 없음
- 백엔드 응답에서 `_id` 또는 `id` 필드가 반환되는지 확인
- 콘솔에서 매장 정보 응답을 확인

### 3. 이미지 업로드 실패
- S3 버킷 설정 확인
- 백엔드에서 업로드 URL 생성이 올바른지 확인
- 이미지 파일 크기 제한 확인

## 참고 파일

- `test_server/public/js/api.js` - API 통신 유틸리티
- `test_server/public/js/reviewService.js` - 리뷰 서비스
- `test_server/public/js/events.js` - 리뷰 폼 이벤트 처리
- `test_server/public/js/display.js` - 장소 정보 표시 및 저장
- `C:\Users\scien\projects\wheelCityServer\wheel_city_server\test_image_flow.py` - 백엔드 테스트 예제

