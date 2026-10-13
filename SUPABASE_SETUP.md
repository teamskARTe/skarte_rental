# 스케아트 Supabase 완전 연동 가이드

이 문서 하나만 따라 하면 사이트가 클라우드(공유 DB)로 완전히 전환됩니다.
설정 전에는 각자 브라우저에만 저장되고, 설정 후에는 **관리자가 수정한 내용이 모든 방문자에게 공유**됩니다.

---

## 📋 한눈에 보기 — 필요한 것

| 항목 | 값 | 어디서 얻나 | 어디에 넣나 |
|---|---|---|---|
| **Project URL** | `https://xxxx.supabase.co` | Supabase → Settings → API | `.env` 또는 `src/lib/supabase.js` |
| **anon public key** | `eyJhbGciOi...` (긴 문자열) | Supabase → Settings → API | `.env` 또는 `src/lib/supabase.js` |

> ⚠️ **anon public** key만 사용하세요. **service_role** key는 절대 코드/사이트에 넣지 마세요 (전체 권한 노출).

---

## 1단계 — Supabase 프로젝트 만들기

1. https://supabase.com 가입 → **New project**
2. 입력:
   - Name: `skarte` (자유)
   - Database Password: 강력한 비밀번호 (메모해두기)
   - Region: **Northeast Asia (Seoul)** ← 한국 사용자에 가장 빠름
3. 생성까지 1~2분 대기

## 2단계 — 테이블 만들기

1. 좌측 메뉴 **SQL Editor** → **New query**
2. 프로젝트의 `supabase/migrations/0001_site_data.sql` 파일 내용을 전부 복사해 붙여넣기
3. 우측 하단 **Run** 클릭 → "Success" 뜨면 완료
4. (확인) 좌측 **Table Editor** 에 `site_data` 테이블이 보이면 OK

## 3단계 — 키 연결하기 (둘 중 하나 선택)

### 방법 A — .env 파일 (권장)
1. 프로젝트 루트의 `.env.example` 을 복사해 `.env` 파일 생성
2. Supabase → **Settings → API** 에서 값 복사해 채우기:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. 저장

### 방법 B — 코드에 직접 (간단)
`src/lib/supabase.js` 상단의 이 부분에 붙여넣기:
```js
const FALLBACK_URL = 'https://xxxx.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOi...';
```

## 4단계 — Vercel 배포 설정 (방법 A 사용 시 필수)

`.env`는 GitHub에 올라가지 않으므로(보안), Vercel에도 키를 등록해야 해요:
1. Vercel 프로젝트 → **Settings → Environment Variables**
2. 두 개 추가:
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
3. **Redeploy** (Deployments → 최신 배포 → ⋯ → Redeploy)

> 방법 B(코드 직접)로 했다면 이 단계는 건너뛰어도 돼요. (단, key가 GitHub에 올라가니 비공개 저장소 권장)

## 5단계 — 연동 확인

1. 사이트 접속 → 브라우저 **개발자도구(F12) → Console** 열기
2. 초록색 메시지가 보이면 성공:
   ```
   [SKARTE] Supabase 클라우드 연동 ON  https://xxxx.supabase.co
   [SKARTE] Supabase에서 N개 데이터 로드 완료
   ```
3. 관리자 로그인 → 배너/장비 수정 → 저장 → **다른 브라우저(또는 시크릿 창)** 에서 보면 같은 내용이 보임 = 공유 성공!

---

## 어떤 데이터가 공유되나

클라우드(site_data)에 저장되어 모든 방문자가 공유:
- 장비 목록 · 대여 일정 · 문의 내역(orders)
- 홈 배너 · 이벤트 배너 · 제조사 · 촬영 영상
- 세트 · 베스트 · 할인 · 팝업 공지

이 브라우저에만 저장 (개인 데이터):
- 장바구니 · 위시리스트 · 로그인 세션

---

## 🔒 쓰기 잠금 (보안 강화 — 권장)

사이트 콘텐츠(장비·가격·배너·일정 등)를 **관리자만 수정 가능**하게 잠급니다.
읽기는 그대로라 손님 사이트에는 영향이 없고, 손님 흐름(문의 접수·회원가입)도 계속 동작합니다.

**순서가 중요합니다:**

1. Supabase 대시보드 → **Authentication → Users → Add user**
   - 이메일: `team.skarte@gmail.com` (사이트 관리자 이메일과 동일)
   - 비밀번호: **사이트 관리자 로그인 비밀번호와 동일하게**
   - "Auto Confirm User" 체크
2. 사이트가 관리자 로그인 시 Supabase Auth에 함께 로그인하는 버전인지 확인 (2026-10 이후 배포본이면 OK)
3. `supabase/migrations/0004_site_data_write_lock.sql` 내용을 SQL Editor에서 실행
4. 확인: 시크릿 창에서 손님 문의 접수 1건 + 관리자 재로그인 후 장비 수정 저장
   - 저장 실패 빨간 배너(코드 42501)가 뜨면 → 1번의 계정·비밀번호가 사이트와 같은지 확인
   - 문제 시 롤백 SQL이 같은 파일 하단 주석에 있습니다 (실행 즉시 원상복구)

> 참고: `skeart_orders`(문의) · `skeart_users`(회원) · `skeart_rentals_v2`(예약)는
> 손님 흐름이 직접 쓰기 때문에 이번 단계에서는 열려 있습니다.
> 이 세 키까지 보호하려면 다음 단계인 **Supabase Auth 전면 이전**(`0002_auth_profiles.sql`)이 필요합니다.

---

## 자주 묻는 문제

**Q. 콘솔에 "미설정" 경고가 떠요**
→ key가 안 들어간 거예요. 3단계를 다시 확인. (.env 수정 후엔 `npm run dev` 재시작 필요)

**Q. Vercel 배포본만 데이터가 안 보여요**
→ 4단계(Vercel 환경변수) 누락. 등록 후 Redeploy.

**Q. 저장은 되는데 다른 기기에서 안 보여요**
→ key가 다른 프로젝트를 가리키거나, 2단계 SQL이 실행 안 된 경우. Table Editor에서 site_data 확인.
