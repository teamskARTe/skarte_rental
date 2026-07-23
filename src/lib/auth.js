// 비밀번호 해싱 유틸 (라이브러리 없이 브라우저 내장 Web Crypto 사용)
// SHA-256 + 고정 솔트. 평문 저장을 막아 DB 유출 시에도 원문 비밀번호가 드러나지 않게 합니다.

const SALT = 'skarte_rental_v1::';

// 문자열 → SHA-256 hex
export async function hashPassword(plain) {
  try {
    const data = new TextEncoder().encode(SALT + plain);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return 'sha256$' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // crypto.subtle 미지원 환경(아주 구형) 폴백: 원문 그대로 (최소한 동작은 보장)
    return plain;
  }
}

// 입력 비밀번호가 저장된 값과 일치하는지. 기존 평문 저장분과도 호환.
export async function verifyPassword(plain, stored) {
  if (stored == null) return false;
  // 해시 형식이면 해시 비교
  if (typeof stored === 'string' && stored.startsWith('sha256$')) {
    const h = await hashPassword(plain);
    return h === stored;
  }
  // 옛 평문 저장분: 원문 비교 (점진적 마이그레이션 허용)
  return plain === stored;
}

// 저장된 값이 아직 평문인지 (로그인 성공 시 해시로 업그레이드할지 판단용)
export function isLegacyPlain(stored) {
  return typeof stored === 'string' && !stored.startsWith('sha256$');
}
