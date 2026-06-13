# 모바일 청첩장 설정 가이드

김희준 ♡ 한예빈 · 2026.10.18

---

## 0. 로컬에서 미리보기

폴더 위치에서 아래 명령 실행 후, 브라우저에서 **http://localhost:4321** 접속

```powershell
python -m http.server 4321 --directory wedding-invitation
```

> index.html을 더블클릭해도 디자인은 보이지만, **복사하기·카카오·Firebase 기능은 localhost(또는 배포 주소)에서만** 정상 동작합니다.

설정값은 모두 **`js/main.js` 맨 위 `CONFIG`** 한 곳에서 관리합니다.

---

## 1. 카카오톡 공유 + 카카오맵 (무료 Kakao 키)

카카오 키 하나로 **① 카카오톡 '청첩장 전하기' ② 정식 카카오맵** 둘 다 켜집니다.

### 발급 순서
1. https://developers.kakao.com 접속 → 카카오계정 로그인
2. 상단 **내 애플리케이션** → **애플리케이션 추가하기**
   - 앱 이름: `우리 청첩장` (자유)  /  회사명: 본인 이름 입력 → 저장
3. 생성된 앱 클릭 → 좌측 **앱 키** 메뉴 → **JavaScript 키** 복사
4. 좌측 **플랫폼** → **Web 플랫폼 등록** → 사이트 도메인에 아래 추가
   - 로컬 테스트용: `http://localhost:4321`
   - (나중에 배포하면) 배포된 실제 주소도 여기에 추가
5. 좌측 **카카오 로그인은 켤 필요 없음**. 공유(메시지)와 지도는 JS 키 + 도메인 등록만으로 동작합니다.

### 입력 위치 — `js/main.js`
```js
kakaoJsKey: '여기에_JavaScript_키_붙여넣기',
```

> 붙여넣고 새로고침하면, 하단 노란 버튼이 실제 카카오톡 공유로 바뀌고
> '오시는 길' 지도가 OpenStreetMap → 카카오맵으로 교체됩니다.

---

## 2. 방명록 실제 저장 (무료 Firebase)

하객들이 남긴 축하 메시지를 모두가 볼 수 있게 클라우드에 저장합니다.

### 설정 순서
1. https://console.firebase.google.com 접속 → **프로젝트 만들기**
   - 이름: `wedding` 등 자유 / Google 애널리틱스는 꺼도 됩니다
2. 좌측 **빌드 → Firestore Database** → **데이터베이스 만들기**
   - 위치: **asia-northeast3 (서울)** 권장
   - 시작 모드: **프로덕션 모드**로 시작 (규칙은 3단계에서 적용)
3. **규칙(Rules)** 탭에 아래를 붙여넣고 게시 — 누구나 읽기/등록만 가능, 수정·삭제 차단:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /guestbook/{doc} {
         allow read: if true;
         allow create: if request.resource.data.n is string
                       && request.resource.data.n.size() <= 20
                       && request.resource.data.m is string
                       && request.resource.data.m.size() <= 300;
         allow update, delete: if false;
       }
     }
   }
   ```
4. 좌측 상단 **⚙ 프로젝트 설정** → 하단 **내 앱** → **웹(</>) 앱 추가**
   - 앱 닉네임 입력 → 등록 → 표시되는 `firebaseConfig` 값 복사

### 입력 위치 — `js/main.js`
```js
firebase: {
  apiKey: 'AIza...',
  authDomain: 'xxxx.firebaseapp.com',
  projectId: 'xxxx',
  storageBucket: 'xxxx.appspot.com',
  messagingSenderId: '0000',
  appId: '1:0000:web:xxxx'
},
```

> 붙여넣으면 방명록이 자동으로 Firestore에 저장됩니다.
> (값이 비어 있으면 지금처럼 브라우저 임시저장으로 동작 — 시안 확인용)
> apiKey가 코드에 노출돼도 위 보안 규칙이 막아주므로 안전합니다.

---

## 3. 나중에 배포할 때

- 어디에 올리든(Netlify·GitHub Pages·Vercel 등) 이 폴더 통째로 업로드하면 됩니다.
- 배포 후 **카카오 개발자 콘솔의 사이트 도메인에 실제 주소를 꼭 추가**하세요(안 하면 공유/지도 작동 안 함).
- '청첩장 주소 복사하기'는 자동으로 현재 접속 주소를 복사하므로 별도 설정 불필요.

---

## 자주 바꾸는 항목 위치 요약
| 항목 | 파일 / 위치 |
|------|------------|
| 인사말·혼주·마지막 인사 문구 | `index.html` |
| 계좌번호 | `index.html` (마음 전하실 곳) |
| 갤러리 사진 순서/장수 | `js/main.js` 의 `CONFIG.gallery` + `assets/images/gallery/` |
| 카카오 키 / Firebase 설정 | `js/main.js` 의 `CONFIG` |
| 색상·폰트·여백 | `css/style.css` (상단 `:root` 변수) |
