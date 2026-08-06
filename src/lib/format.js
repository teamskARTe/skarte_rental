export const won = (n) => '₩' + n.toLocaleString('ko-KR');

export const priceLabel = (n) => n > 0 ? won(n) : '문의 필요';

// ─── 저장 헬퍼 (Supabase 클라우드 + localStorage 폴백) ───
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

export const KAKAO_URL = 'https://pf.kakao.com/_VGJxnX/chat';

// 텍스트를 클립보드로 복사. 성공 여부를 Promise<boolean>로 돌려줍니다.
// 카카오톡 채널 채팅은 URL로 메시지를 미리 채울 수 없어, 복사 후 붙여넣는 방식으로 처리합니다.
export const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* 아래 폴백으로 진행 */ }
  // 구형 브라우저 · 비보안 컨텍스트 폴백
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
};

export const openKakao = (msg='') => {
  // 메시지가 있으면 클립보드에 복사해 두고 채널 채팅창을 엽니다.
  // 복사(비동기)를 기다리지 않고 창을 먼저 열어야 팝업 차단에 걸리지 않습니다.
  const copying = msg ? copyText(msg) : Promise.resolve(false);
  window.open(KAKAO_URL, '_blank', 'noopener');
  return copying;
};
