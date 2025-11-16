# 서버 로그 확인 방법

## 방법 1: PowerShell/CMD에서 직접 실행 (권장)

1. **새 PowerShell 창 열기**
   - `Win + X` → Windows PowerShell 선택
   
2. **서버 디렉토리로 이동**
   ```powershell
   cd C:\Users\jungj\Desktop\WheelCity\test_server
   ```

3. **서버 실행**
   ```powershell
   node server.js
   ```

4. **로그 확인**
   - 이제 이 PowerShell 창에 모든 로그가 실시간으로 출력됩니다
   - 서버 시작 시 나오는 로그:
     ```
     ✅ 블로그 리뷰 크롤링 API 로드됨
     ✅ Server is running on http://localhost:3000
     ```
   
   - 블로그 리뷰 요청 시 나오는 로그:
     ```
     📝 블로그 리뷰 크롤링 요청 - Place ID: 27240966
     [크롤링 시작] 블로그 리뷰 - Place ID: 27240966
     접속 URL: https://place.map.kakao.com/27240966#blogreview
     [크롤링 완료] 5개의 블로그 리뷰 발견
     ✅ 블로그 리뷰 크롤링 완료 - 5개 발견
     ```

5. **서버 종료**
   - `Ctrl + C` 누르기

---

## 방법 2: 브라우저 개발자 도구 콘솔 (프론트엔드 로그)

1. **브라우저에서 F12 키 누르기**

2. **Console 탭 선택**

3. **검색 시 나오는 로그**
   ```
   검색 상태: OK
   검색 데이터: Array(5)
   1. 스타벅스 유성구청점 - ID: 27240966
   2. 스타벅스 대전청사점 - ID: 1234567
   🕐 기본 정보 크롤링 시작 (영업시간, 전화번호)...
   ✅ 기본 정보 크롤링 완료
   ```

4. **블로그 탭 클릭 시 나오는 로그**
   ```
   탭 선택: blog
   🔄 블로그 탭 선택됨 - 블로그 리뷰 크롤링 요청
   📝 블로그 리뷰 크롤링 시작 - Place ID: 27240966
   ℹ️ 이 크롤링은 매장 선택 후 블로그 탭 클릭 시에만 실행됩니다.
   ✅ 블로그 리뷰 크롤링 완료 - 발견된 리뷰 수: 5
   ```

5. **Network 탭에서 API 요청 확인**
   - Network 탭 선택
   - `blog-reviews` 검색
   - 요청 클릭하면 상세 정보 확인 가능
     - Status: 200 (성공) / 404 (실패) / 503 (서비스 불가)
     - Response: 서버 응답 데이터

---

## 방법 3: 로그 파일로 저장

서버 실행 시 로그를 파일로 저장:

```powershell
node server.js > server_log.txt 2>&1
```

그러면 `server_log.txt` 파일에 모든 로그가 저장됩니다.

---

## 🔍 문제 진단 체크리스트

### 서버가 제대로 시작되었는지 확인:
```
✅ 블로그 리뷰 크롤링 API 로드됨          # OK - puppeteer 설치됨
⚠️ 블로그 리뷰 크롤링 API 사용 불가      # 문제 - puppeteer 미설치
✅ Server is running on http://localhost:3000  # 서버 실행 중
```

### API 요청이 들어왔는지 확인:
```
📝 블로그 리뷰 크롤링 요청 - Place ID: xxxxx   # 요청 받음
```

### 크롤링이 성공했는지 확인:
```
✅ 블로그 리뷰 크롤링 완료 - 5개 발견      # 성공
❌ 블로그 리뷰 크롤링 실패 - Place ID: xxxxx  # 실패
```

---

## 📸 스크린샷 예시

### 서버 로그 (PowerShell)
```
C:\Users\jungj\Desktop\WheelCity\test_server> node server.js
✅ 블로그 리뷰 크롤링 API 로드됨
✅ Server is running on http://localhost:3000
📝 블로그 리뷰 크롤링 요청 - Place ID: 27240966
[크롤링 시작] 블로그 리뷰 - Place ID: 27240966
접속 URL: https://place.map.kakao.com/27240966#blogreview
[크롤링 완료] 5개의 블로그 리뷰 발견
✅ 블로그 리뷰 크롤링 완료 - 5개 발견
```

### 브라우저 콘솔 로그
```
검색 성공! 결과 수: 5
1. 스타벅스 유성구청점 - ID: 27240966
🕐 기본 정보 크롤링 시작 (영업시간, 전화번호)...
✅ 기본 정보 크롤링 완료
=== 매장 정보 ===
매장명: 스타벅스 유성구청점
매장 ID: 27240966
🔄 블로그 탭 선택됨 - 블로그 리뷰 크롤링 요청
📝 블로그 리뷰 크롤링 시작 - Place ID: 27240966
✅ 블로그 리뷰 크롤링 완료 - 발견된 리뷰 수: 5
```

