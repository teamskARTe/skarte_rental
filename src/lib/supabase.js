import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   Supabase 연동 설정

   [방법 1 — 권장] 환경변수(.env) 사용
     프로젝트 루트에 .env 파일을 만들고 아래 두 줄을 넣으세요:
       VITE_SUPABASE_URL=https://xxxx.supabase.co
       VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
     Vercel 배포 시에는 Settings → Environment Variables 에 동일하게 등록.

   [방법 2 — 간단] 아래 따옴표 안에 직접 붙여넣기 (env가 우선합니다)
   ═══════════════════════════════════════════════════════════ */
const FALLBACK_URL = '';      // 환경변수(.env / Vercel) 사용 시 비워둠
const FALLBACK_ANON_KEY = ''; // 환경변수(.env / Vercel) 사용 시 비워둠

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const sb = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// 연동 상태 로깅 (브라우저 콘솔에서 확인용)
if (typeof window !== 'undefined') {
  if (sb) console.info('%c[SKARTE] Supabase 클라우드 연동 ON', 'color:#16a34a;font-weight:bold', SUPABASE_URL);
  else console.warn('[SKARTE] Supabase 미설정 → localStorage(이 브라우저)로만 동작합니다. key를 설정하세요.');
}

// 클라우드(공유)로 동기화할 키 — 그 외(장바구니·위시리스트·세션)는 이 브라우저에만 저장
export const CLOUD_KEYS = [
  'skeart_equipment_v2', 'skeart_rentals_v2', 'skeart_orders',
  'skeart_homebanner_v2', 'skeart_eventbanners_v2', 'skeart_sets',
  'skeart_bestids', 'skeart_notices', 'skeart_brands', 'skeart_discounts',
  'skeart_works', 'skeart_users', 'skeart_categories',
];

let CLOUD_READY = !sb;

export const store = {
  read(key, fallback) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; } },
  write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    if (sb && CLOUD_READY && CLOUD_KEYS.includes(key)) {
      sb.from('site_data').upsert({ key, value: val, updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) console.warn('Supabase 저장 실패:', key, error.message); });
    }
  },
  // 단일 키를 클라우드에서 최신값으로 조회 (회원 중복확인·로그인용)
  async cloudReadKey(key) {
    if (!sb) return null;
    const { data, error } = await sb.from('site_data').select('value').eq('key', key).maybeSingle();
    if (error) { console.warn('Supabase 단일조회 실패:', key, error.message); return null; }
    return data ? data.value : [];
  },
  // 앱 시작 시 클라우드 데이터 일괄 로드
  async cloudLoad() {
    if (!sb) return null;
    const { data, error } = await sb.from('site_data').select('key,value');
    if (error) { console.warn('Supabase 로드 실패:', error.message); CLOUD_READY = true; return null; }
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    Object.entries(map).forEach(([k, v]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} });
    CLOUD_READY = true;
    console.info(`[SKARTE] Supabase에서 ${Object.keys(map).length}개 데이터 로드 완료`);
    return map;
  },
};

// ─── 이미지 업로드 (Supabase Storage) ───
// 버킷 이름: 'equipment-images' (Supabase에서 public 버킷으로 생성 필요)
const BUCKET = 'equipment-images';

// File을 Storage에 업로드하고 public URL 반환. 실패 시 null.
export async function uploadImage(file) {
  if (!sb) throw new Error('Supabase가 연결되지 않았습니다.');
  // 파일명: 타임스탬프 + 랜덤 + 확장자 (한글/공백 제거)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',   // 1년 캐싱 → egress 절약
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Blob(canvas 압축 결과)을 업로드. ImageInput에서 압축 후 사용.
export async function uploadBlob(blob, ext = 'jpg') {
  if (!sb) throw new Error('Supabase가 연결되지 않았습니다.');
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    upsert: false,
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
