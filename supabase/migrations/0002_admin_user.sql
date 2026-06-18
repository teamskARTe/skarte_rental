-- ═══════════════════════════════════════════════════
-- 관리자 계정 등록 (Supabase에서 직접 관리)
-- 아래 'YOUR_PASSWORD' 를 원하는 비밀번호로 바꾼 뒤 SQL Editor에서 Run
-- ═══════════════════════════════════════════════════

insert into site_data (key, value)
values (
  'skeart_users',
  jsonb_build_array(
    jsonb_build_object(
      'name', '관리자',
      'email', 'skartefilm@naver.com',
      'pw', 'YOUR_PASSWORD',
      'joinedAt', to_char(now(), 'YYYY-MM-DD')
    )
  )
)
on conflict (key) do update
set value = (
  -- 이미 회원 데이터가 있으면, 관리자 계정만 추가/갱신
  select jsonb_agg(u) || jsonb_build_array(
    jsonb_build_object(
      'name', '관리자',
      'email', 'skartefilm@naver.com',
      'pw', 'YOUR_PASSWORD',
      'joinedAt', to_char(now(), 'YYYY-MM-DD')
    )
  )
  from jsonb_array_elements(site_data.value) u
  where u->>'email' <> 'skartefilm@naver.com'
);
