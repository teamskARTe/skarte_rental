-- ═══════════════════════════════════════════════════
-- 스케아트(SKARTE) 대여 사이트 — Supabase 셋업 SQL
-- Supabase 대시보드 → SQL Editor → New query 에 붙여넣고 Run
-- ═══════════════════════════════════════════════════

-- 사이트 공유 데이터 (키-값 JSON 저장소)
-- 장비 목록, 대여 일정, 문의 내역, 배너, 세트, 할인 등이 여기에 저장됩니다.
create table if not exists site_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Row Level Security 활성화
alter table site_data enable row level security;

-- 누구나 읽기 가능 (사이트 방문자가 장비 목록 등을 봐야 하므로)
create policy "site_data_public_read" on site_data
  for select using (true);

-- 쓰기 허용 (⚠️ 데모 단계 정책 — 아래 주의사항 필독)
create policy "site_data_public_write" on site_data
  for insert with check (true);

create policy "site_data_public_update" on site_data
  for update using (true);

-- ═══════════════════════════════════════════════════
-- ⚠️ 중요 주의사항
--
-- 현재 관리자 로그인이 사이트 코드 안에서만 확인되는 데모 방식이라,
-- 위 쓰기 정책은 "누구나 쓰기 가능"으로 열려 있습니다.
-- 실제 운영에서 데이터 보호가 필요해지면:
--
--   1) Supabase Auth로 관리자 계정을 만들고
--   2) 쓰기 정책을 아래처럼 교체하세요:
--
--   drop policy "site_data_public_write" on site_data;
--   drop policy "site_data_public_update" on site_data;
--
--   create policy "site_data_admin_write" on site_data
--     for all using (auth.jwt() ->> 'email' = 'skartefilm@naver.com');
--
-- (Auth 연동은 다음 단계에서 함께 진행할 수 있습니다)
-- ═══════════════════════════════════════════════════
