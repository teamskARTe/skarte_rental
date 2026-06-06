export const won = (n) => '₩' + n.toLocaleString('ko-KR');

export const priceLabel = (n) => n > 0 ? won(n) : '문의 필요';

// ─── 데모 인증/저장 헬퍼 (localStorage, 보안 X — 프로토타입용) ───
/* ═══════════════ Supabase 연동 설정 ═══════════════
   1) supabase.com 에서 프로젝트 생성
   2) 함께 제공된 supabase-setup.sql 을 SQL Editor에서 실행
   3) Settings → API 에서 Project URL과 anon public key를 복사해 아래에 붙여넣기
   비워두면 기존처럼 localStorage(이 브라우저)에만 저장됩니다. */

export const calcPrice = (price, days) => {
  if (days >= 7) return Math.round(price * days * 0.8);
  if (days >= 3) return Math.round(price * days * 0.9);
  return price * days;
};

export const KAKAO_URL = 'https://pf.kakao.com/_xxxxxx';

export const openKakao = (msg='') => {
  // 채널 URL 또는 미리 채워진 메시지가 있는 카카오톡 오픈채팅 등으로 연결
  window.open(KAKAO_URL, '_blank');
};
