// 목록형(배열) 데이터의 동시 편집 병합.
//
// 세 개의 스냅샷을 받아 하나로 합칩니다:
//   base   = 이 탭이 처음 불러온 시점의 값 (내 편집의 기준)
//   local  = 이 탭의 현재 값 (내 편집이 반영된 값)
//   server = 방금 다시 읽은 서버 최신값 (그새 다른 사람이 바꿨을 수 있음)
//
// 규칙(항목의 id 기준):
//   - 내가 추가한 항목 → 결과에 추가
//   - 내가 지운 항목   → 결과에서 제거 (서버에 남아 있어도)
//   - 내가 고친 항목   → 내 버전으로 반영
//   - 내가 건드리지 않은 항목(다른 사람의 추가·수정 포함) → 서버 최신값 유지
// 이렇게 하면 두 사람이 각자 다른 장비를 추가해도 둘 다 살아남습니다.

const j = (x) => JSON.stringify(x);

const allPrimitive = (arr) => arr.every(x => x === null || typeof x !== 'object');
const allHaveId = (arr) => arr.every(x => x && x.id != null);

export function mergeListById(base, local, server) {
  // 안전장치: 배열이 아니면 병합하지 않고 내 값을 그대로 사용
  if (!Array.isArray(base) || !Array.isArray(local) || !Array.isArray(server)) return local;

  // 그새 아무도 서버를 바꾸지 않았으면(server === base) 병합할 필요 없이 내 값 전체를 저장.
  // → 단독 편집 시 순서 변경·모든 편집이 그대로 보존됩니다.
  if (j(server) === j(base)) return local;

  // 원시값 배열(예: 베스트 목록의 id 문자열들)
  if (allPrimitive(base) && allPrimitive(local) && allPrimitive(server)) {
    const baseSet = new Set(base);
    const localSet = new Set(local);
    const added = local.filter(x => !baseSet.has(x));
    const removed = new Set(base.filter(x => !localSet.has(x)));
    const out = server.filter(x => !removed.has(x));
    added.forEach(x => { if (!out.includes(x)) out.push(x); });
    return out;
  }

  // 객체 배열: 모든 항목에 id가 있어야 병합 가능. 아니면 내 값으로 통째 저장.
  if (!allHaveId(base) || !allHaveId(local) || !allHaveId(server)) return local;

  const baseById = new Map(base.map(x => [x.id, x]));
  const localIds = new Set(local.map(x => x.id));

  const removed = new Set([...baseById.keys()].filter(id => !localIds.has(id))); // 내가 지운 것
  const modified = new Map();  // id → 내 수정본
  const added = [];            // 내가 새로 추가한 것
  local.forEach(x => {
    if (!baseById.has(x.id)) added.push(x);
    else if (j(x) !== j(baseById.get(x.id))) modified.set(x.id, x);
  });

  const seen = new Set();
  const out = [];
  server.forEach(x => {
    if (removed.has(x.id)) return;                              // 내가 지운 항목은 제외
    if (modified.has(x.id)) { out.push(modified.get(x.id)); }   // 내가 고친 항목은 내 버전
    else out.push(x);                                          // 나머지는 서버 최신값
    seen.add(x.id);
  });
  // 내가 추가했는데 서버엔 아직 없는 항목을 뒤에 덧붙임
  added.forEach(x => { if (!seen.has(x.id)) { out.push(x); seen.add(x.id); } });

  return out;
}
