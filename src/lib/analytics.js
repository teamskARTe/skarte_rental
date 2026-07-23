// ─── Google Analytics 4 이벤트 추적 헬퍼 ───
// gtag는 index.html에서 로드됩니다. 로드 실패(광고 차단기 등) 시에도
// 사이트가 멈추지 않도록 모든 호출을 안전하게 감쌉니다.

const GA_ID = 'G-KGSXSXZNHZ';

const gtagSafe = (...args) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(...args);
    }
  } catch (_) { /* 추적 실패는 무시 */ }
};

// 커스텀/표준 이벤트 전송
export const track = (eventName, params = {}) => {
  gtagSafe('event', eventName, params);
};

// SPA 라우트 전환 시 페이지뷰 수동 전송 (제목 포함)
export const trackPageView = (path, title) => {
  gtagSafe('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};

// 장비 1개를 GA4 이커머스 item 형식으로 변환
export const toGaItem = (gear, extra = {}) => ({
  item_id: gear.id,
  item_name: gear.name,
  item_category: gear.category || undefined,
  item_brand: gear.brand || undefined,
  price: gear.price || 0,
  quantity: 1,
  ...extra,
});

// 로그인 사용자 식별 (이메일을 그대로 보내지 않고 SHA-256 해시 사용)
export const setAnalyticsUser = async (email) => {
  try {
    if (!email) {
      gtagSafe('config', GA_ID, { user_id: undefined });
      return;
    }
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));
    const hash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    gtagSafe('config', GA_ID, { user_id: hash });
  } catch (_) { /* 해시 실패 시 미설정 */ }
};
