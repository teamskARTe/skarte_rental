# SKARTE (스케아트) — 카메라·시네마 장비 대여 사이트

Vite + React 멀티파일 구조 버전입니다. (단일 HTML에서 전환)

## 폴더 구조

```
├── index.html              ← Vite 엔트리 (얇은 껍데기)
├── src/
│   ├── main.jsx            ← 앱 시작점
│   ├── App.jsx             ← 라우팅 + 전역 상태
│   ├── index.css           ← Tailwind + 커스텀 스타일
│   ├── lib/
│   │   ├── supabase.js     ← ★ Supabase URL/KEY 설정 위치
│   │   └── format.js       ← 가격 포맷, 카카오톡 연결
│   ├── data/defaults.js    ← 장비 87종 기본 데이터, 카테고리, 관리자 계정
│   ├── context.js          ← 전역 컨텍스트
│   ├── assets/logo.js      ← 로고 이미지
│   ├── components/         ← 공용 컴포넌트 (Nav, Footer, ImageInput...)
│   ├── features/
│   │   ├── equipment/      ← 장비 목록·카드·상세
│   │   ├── cart/           ← 장바구니
│   │   ├── rentals/        ← 대여 캘린더
│   │   ├── content/        ← 홈배너·이벤트배너·팝업공지·제조사
│   │   ├── auth/           ← 로그인·마이페이지
│   │   └── admin/          ← 관리자 페이지
│   └── pages/              ← 홈·가이드·오시는길
└── supabase/migrations/    ← DB 스키마 SQL (번호순 실행)
```

## 로컬 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 배포용 빌드 → dist/
```

## Vercel 배포 (중요 — 설정 변경 필요!)

기존 단일 HTML과 달리 빌드가 필요합니다. Vercel 프로젝트 Settings → General에서:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

GitHub에 푸시하면 Vercel이 자동으로 빌드·배포합니다.

## Supabase 연동

1. [supabase.com](https://supabase.com) → New project (리전: Seoul 권장)
2. SQL Editor에서 `supabase/migrations/0001_site_data.sql` 실행
3. Settings → API에서 URL과 anon key 복사
4. **`src/lib/supabase.js`** 상단에 붙여넣기:

```js
export const SUPABASE_URL = 'https://xxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...';
```

비워두면 localStorage(브라우저 저장)로만 동작합니다.

### ⚠️ 보안
- `anon` key는 공개 가능하지만 **service_role 키는 절대 넣지 마세요**
- 데모 단계라 쓰기 정책이 열려 있습니다. 실운영 전 Supabase Auth 연동 + 정책 잠금 권장 (SQL 파일 주석 참고)

## 관리자 데모 계정

- 이메일: `skartefilm@naver.com` / 비밀번호: `1234`
- 변경 위치: `src/data/defaults.js`의 `ADMIN_EMAIL`, `ADMIN_PW`

## 카카오톡 채널 연결

`src/lib/format.js`의 `KAKAO_URL`을 실제 카카오톡 채널 URL로 교체하세요.
