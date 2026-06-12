import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = '';      // 예: 'https://abcdefgh.supabase.co'

export const SUPABASE_ANON_KEY = ''; // 예: 'eyJhbGciOi...'

export const sb = (SUPABASE_URL && SUPABASE_ANON_KEY && true)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const CLOUD_KEYS = [
  'skeart_equipment_v2', 'skeart_rentals_v2', 'skeart_orders',
  'skeart_homebanner_v2', 'skeart_eventbanners_v2', 'skeart_sets',
  'skeart_bestids', 'skeart_notices', 'skeart_brands', 'skeart_discounts',
  'skeart_works',
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
  // 앱 시작 시 클라우드 데이터 일괄 로드
  async cloudLoad() {
    if (!sb) return null;
    const { data, error } = await sb.from('site_data').select('key,value');
    if (error) { console.warn('Supabase 로드 실패:', error.message); CLOUD_READY = true; return null; }
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    // 로컬 캐시에도 반영 (다음 방문 시 빠른 표시)
    Object.entries(map).forEach(([k, v]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} });
    CLOUD_READY = true;
    return map;
  },
};
