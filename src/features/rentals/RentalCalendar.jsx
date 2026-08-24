import { useState, useMemo, useEffect } from 'react';
import { Ico } from '../../components/Ico';
import { RENTAL_COLORS, colorOf, rentalEndStr, branchName } from '../../data/defaults';
import { RentalForm } from './RentalForm';

// readOnly     : 편집(추가·삭제·메모수정) 불가
// hideIdentity : 대여자·장비명·메모를 가림 (손님용 공개 예약현황)
export function RentalCalendar({ rentals, equipment, sets = [], onAdd, onRemove, onUpdate, filterGearId, readOnly, hideIdentity }) {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null); // 날짜 상세

  const scoped = filterGearId ? rentals.filter(r => r.gearId === filterGearId) : rentals;
  // 장비 + 세트를 한 목록으로 (선택·이름 표시 공용)
  const pickOptions = [
    ...equipment.map(e => ({ id: e.id, label: e.name, stock: e.stock })),
    ...(sets || []).map(s => ({ id: s.id, label: `[세트] ${s.name}`, stock: 1 })),
  ];
  const gearName = (id) => {
    const e = equipment.find(x => x.id === id); if (e) return e.name;
    const s = (sets || []).find(x => x.id === id); if (s) return `[세트] ${s.name}`;
    return id;
  };
  const short = (s) => s.length > 10 ? s.slice(0,9) + '…' : s;

  // 예약자·대여기간(시작일+일수)이 같은 건들을 한 예약으로 묶어 한 줄로 표시합니다.
  const groups = useMemo(() => {
    const map = new Map();
    scoped.forEach(r => {
      const key = `${r.renter || ''}|${r.start}|${r.days}`;
      if (!map.has(key)) {
        map.set(key, {
          key, renter: r.renter, start: r.start, days: r.days,
          startTime: r.startTime, endTime: r.endTime,
          pickupBranch: r.pickupBranch || '', returnBranch: r.returnBranch || '',
          memo: r.memo || '', items: [],
        });
      }
      const g = map.get(key);
      g.items.push(r);
      // 시간·지점·메모는 먼저 들어온 값을 유지하되, 비어 있으면 채웁니다.
      if (!g.startTime && r.startTime) g.startTime = r.startTime;
      if (!g.endTime && r.endTime) g.endTime = r.endTime;
      if (!g.pickupBranch && r.pickupBranch) g.pickupBranch = r.pickupBranch;
      if (!g.returnBranch && r.returnBranch) g.returnBranch = r.returnBranch;
      if (!g.memo && r.memo) g.memo = r.memo;
    });
    return [...map.values()];
  }, [scoped]);

  const totalQty = (g) => g.items.reduce((s, r) => s + (parseInt(r.qty) || 0), 0);
  // 묶음 라벨: 장비가 하나면 장비명, 여러 개면 "장비명 외 N종"
  const groupLabel = (g) => {
    if (g.items.length === 1) return `${short(gearName(g.items[0].gearId))} ×${g.items[0].qty}`;
    return `${short(gearName(g.items[0].gearId))} 외 ${g.items.length - 1}종`;
  };

  const fmt = (day) => `${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const onDay = (day) => {
    const d = new Date(fmt(day));
    return groups.filter(g => {
      const s = new Date(g.start); const e = new Date(s); e.setDate(e.getDate() + g.days - 1);
      return d >= s && d <= e;
    });
  };

  const startWeekday = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const todayStr = now.toISOString().slice(0,10);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setCur(c => c.m === 0 ? { y:c.y-1, m:11 } : { y:c.y, m:c.m-1 });
  const next = () => setCur(c => c.m === 11 ? { y:c.y+1, m:0 } : { y:c.y, m:c.m+1 });
  const goToday = () => setCur({ y: now.getFullYear(), m: now.getMonth() });

  const WD = ['일','월','화','수','목','금','토'];
  const monthTotal = groups.filter(g => {
    const s = new Date(g.start);
    return s.getFullYear()===cur.y && s.getMonth()===cur.m;
  });

  // 레인 할당: 같은 예약이 모든 날짜에서 같은 세로 줄에 오도록
  const LANES_SHOWN = 3;
  const laneOf = useMemo(() => {
    const sorted = [...groups].sort((a,b) => a.start.localeCompare(b.start));
    const laneEnds = []; const map = {};
    sorted.forEach(g => {
      const s = new Date(g.start); const e = new Date(rentalEndStr(g));
      let lane = 0;
      while (laneEnds[lane] !== undefined && laneEnds[lane] >= s) lane++;
      laneEnds[lane] = e; map[g.key] = lane;
    });
    return map;
  }, [groups]);

  return (
    <div className="mt-px">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-line border-b-0 px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-2xl md:text-3xl leading-none">{cur.y}년 {cur.m+1}월</h3>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="w-8 h-8 border border-line hover:border-ink flex items-center justify-center" aria-label="이전 달">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={next} className="w-8 h-8 border border-line hover:border-ink flex items-center justify-center" aria-label="다음 달">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button onClick={goToday} className="ml-1 text-[12px] tracking-tight border border-line hover:border-ink px-3 h-8">오늘</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-muted">이번 달 {monthTotal.length}건 예약</span>
          {!readOnly && (
            <button onClick={() => setAdding(true)} className="text-[13px] tracking-tight bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2">
              <Ico.plus className="w-3.5 h-3.5"/> 일정 추가
            </button>
          )}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-l border-t border-line">
        {WD.map((w,i) => (
          <div key={w} className={`border-r border-b border-line py-2 text-center font-mono text-[11px] uppercase tracking-wider ${i===0?'text-red-500':i===6?'text-blue-500':'text-muted'}`}>{w}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 border-l border-line">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="border-r border-b border-line bg-[#FAFAFA] min-h-[104px]"/>;
          const items = onDay(day);
          const isToday = fmt(day) === todayStr;
          const weekStart = (i % 7) === 0; // 일요일 = 줄 시작
          // 레인별 매핑
          const byLane = {};
          let overflow = 0;
          items.forEach(g => {
            const lane = laneOf[g.key];
            if (lane < LANES_SHOWN) byLane[lane] = g; else overflow++;
          });
          return (
            <button key={i} onClick={() => items.length && setSelected({ day, items })}
              className={`border-r border-b border-line min-h-[104px] pt-1.5 pb-1 text-left align-top flex flex-col gap-1 ${items.length ? 'hover:bg-[#F7F7F7] cursor-pointer' : 'cursor-default'}`}>
              <div className={`mx-1.5 font-mono text-[12px] ${isToday ? 'bg-ink text-bg w-5 h-5 flex items-center justify-center rounded-full' : 'text-muted'}`}>{day}</div>
              <div className="flex flex-col gap-0.5">
                {Array.from({ length: LANES_SHOWN }).map((_, lane) => {
                  const g = byLane[lane];
                  if (!g) return <div key={lane} className="h-[19px]"/>; // 빈 슬롯(정렬 유지)
                  const isS = g.start === fmt(day);
                  const isE = rentalEndStr(g) === fmt(day);
                  const showLabel = isS || weekStart; // 시작일 또는 매주 첫날 라벨 재표시
                  return (
                    <div key={lane}
                      className={`h-[19px] leading-[19px] text-[11px] text-ink/80 overflow-hidden whitespace-nowrap ${isS ? 'rounded-l-sm pl-1.5 border-l-2 border-ink' : 'pl-1'} ${isE ? 'rounded-r-sm mr-0.5' : ''}`}
                      style={{ background: colorOf(g.key) }}
                      title={hideIdentity
                        ? `예약됨 ×${totalQty(g)} (${g.start}부터 ${g.days}일)`
                        : `${g.renter} · ${g.items.map(x => `${gearName(x.gearId)} ×${x.qty}`).join(', ')} (${g.start}부터 ${g.days}일)${g.memo ? ` · ${g.memo}` : ''}`}>
                      {showLabel ? (hideIdentity ? `예약 ×${totalQty(g)}` : `${isS ? g.renter + ' · ' : ''}${groupLabel(g)}`) : '\u00A0'}
                    </div>
                  );
                })}
                {overflow > 0 && <div className="text-[11px] text-muted px-1.5">+{overflow}건</div>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {hideIdentity ? (
          <span className="text-[12px] text-muted">색칠된 날짜는 예약이 있는 기간입니다. 그 외 날짜는 대여 가능하며, 정확한 가용 수량은 문의 시 안내드립니다.</span>
        ) : (
          <>
            <span className="text-[12px] text-muted">예약자·대여기간이 같은 장비는 하나의 막대로 묶여 표시됩니다. 날짜를 클릭하면 장비 목록을 볼 수 있어요.</span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
              <span className="inline-block w-4 h-3 border-l-2 border-ink" style={{background:RENTAL_COLORS[0]}}/> 시작일
            </span>
          </>
        )}
      </div>

      {adding && <RentalForm equipment={equipment} sets={sets} defaultStart={todayStr} defaultGearId={filterGearId}
        onSave={(list) => { onAdd(list); setAdding(false); }} onClose={() => setAdding(false)}/>}

      {/* 날짜 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-md border border-ink">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <div className="font-display text-2xl">{cur.m+1}월 {selected.day}일 {hideIdentity ? '예약 현황' : '대여 현황'}</div>
              <button onClick={() => setSelected(null)} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {selected.items.map(g => (
                <div key={g.key} className="border-b border-line pb-3">
                  {/* 예약 묶음 헤더 — 예약자 · 기간 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-lg leading-tight">
                        {hideIdentity ? '예약됨' : g.renter}
                        <span className="font-mono text-[13px] text-muted ml-2">장비 {g.items.length}종 · 총 {totalQty(g)}대</span>
                      </div>
                      <div className="font-mono text-[12px] text-muted mt-0.5">
                        {g.start}{g.startTime ? ` ${g.startTime}` : ''} → {rentalEndStr(g)}{g.endTime ? ` ${g.endTime}` : ''} ({g.days}일)
                      </div>
                      {(g.pickupBranch || g.returnBranch) && (
                        <div className="text-[12px] text-muted mt-0.5">
                          <span className="text-ink">픽업</span> {g.pickupBranch ? branchName(g.pickupBranch) : '—'}
                          <span className="mx-1.5">→</span>
                          <span className="text-ink">반납</span> {g.returnBranch ? branchName(g.returnBranch) : '—'}
                        </div>
                      )}
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => {
                          if (!confirm(`${g.renter}님의 예약 ${g.items.length}건을 모두 삭제할까요?`)) return;
                          g.items.forEach(r => onRemove(r.id));
                          setSelected(s => ({ ...s, items: s.items.filter(x => x.key !== g.key) }));
                        }}
                        className="text-[11px] text-muted hover:text-ink border border-line hover:border-ink px-2 py-1 shrink-0">전체 삭제</button>
                    )}
                  </div>
                  {/* 묶음에 속한 장비들 */}
                  <div className="mt-2 space-y-1">
                    {g.items.map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 text-[13px] pl-3 border-l-2 border-line">
                        <span className="min-w-0 truncate">
                          {hideIdentity ? '예약된 장비' : gearName(r.gearId)}
                          <span className="font-mono text-[12px] text-muted ml-1.5">×{r.qty}</span>
                        </span>
                        {!readOnly && (
                          <button onClick={() => {
                              onRemove(r.id);
                              setSelected(s => ({
                                ...s,
                                items: s.items
                                  .map(x => x.key === g.key ? { ...x, items: x.items.filter(y => y.id !== r.id) } : x)
                                  .filter(x => x.items.length > 0),
                              }));
                            }}
                            className="text-muted hover:text-ink p-1 shrink-0" aria-label="이 장비만 삭제">
                            <Ico.trash className="w-3.5 h-3.5"/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 장비·세트 추가 (관리자) */}
                  {!readOnly && (
                    <GroupAdder options={pickOptions}
                      onAdd={(id, qty) => {
                        const newItem = {
                          id: `r${Date.now().toString().slice(-6)}${Math.floor(Math.random()*100)}`,
                          gearId: id, qty,
                          renter: g.renter, start: g.start, days: g.days,
                          startTime: g.startTime, endTime: g.endTime,
                          pickupBranch: g.pickupBranch || '', returnBranch: g.returnBranch || '',
                          memo: g.memo || '',
                          fromOrder: g.items[0]?.fromOrder,   // 문의에서 온 예약이면 링크 유지 → 문의에도 반영
                        };
                        if (onAdd) onAdd([newItem]);
                        setSelected(s => ({ ...s, items: s.items.map(x => x.key === g.key ? { ...x, items: [...x.items, newItem] } : x) }));
                      }}/>
                  )}

                  {/* 메모 (예약 단위) */}
                  {!hideIdentity && (
                    <GroupMemo group={g} readOnly={readOnly}
                      onSave={(text) => {
                        if (onUpdate) onUpdate(g.items.map(i => i.id), { memo: text });
                        // 모달 표시도 즉시 갱신
                        setSelected(s => ({ ...s, items: s.items.map(x => x.key === g.key ? { ...x, memo: text } : x) }));
                      }}/>
                  )}
                </div>
              ))}
              {selected.items.length === 0 && <div className="text-center text-muted py-6 text-[14px]">예약이 없습니다.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 예약에 장비·세트 추가 (관리자 전용)
function GroupAdder({ options, onAdd }) {
  const [pick, setPick] = useState('');
  const [qty, setQty] = useState(1);
  return (
    <div className="mt-2 flex gap-1.5">
      <select value={pick} onChange={e => setPick(e.target.value)}
        className="flex-1 min-w-0 text-[13px] border border-line focus:border-ink outline-none px-2 py-1.5 bg-transparent">
        <option value="">+ 장비·세트 추가…</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
        className="w-14 text-[13px] font-mono text-center border border-line focus:border-ink outline-none px-1 py-1.5 bg-transparent" aria-label="수량"/>
      <button onClick={() => { if (!pick) return; onAdd(pick, Math.max(1, parseInt(qty) || 1)); setPick(''); setQty(1); }}
        disabled={!pick}
        className="shrink-0 text-[12px] border border-ink px-3 py-1.5 hover-lift disabled:opacity-40 disabled:cursor-not-allowed">추가</button>
    </div>
  );
}

// 예약(묶음) 메모: 관리자는 편집·저장, 공유 링크에서는 읽기전용으로 표시
function GroupMemo({ group, readOnly, onSave }) {
  const [text, setText] = useState(group.memo || '');
  const [editing, setEditing] = useState(false);
  // 다른 예약을 선택하면 최신 메모로 동기화
  useEffect(() => { setText(group.memo || ''); setEditing(false); }, [group.key, group.memo]);

  if (readOnly) {
    if (!group.memo) return null;
    return (
      <div className="mt-3 border-t border-line pt-2">
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1">메모</div>
        <div className="text-[13px] whitespace-pre-wrap leading-relaxed">{group.memo}</div>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-line pt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">메모</span>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-[12px] text-muted hover:text-ink underline-grow">
            {group.memo ? '수정' : '추가'}
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} autoFocus
            placeholder="대여 관련 자유 메모"
            className="w-full border border-line focus:border-ink outline-none px-3 py-2 text-[13px] bg-transparent resize-y"/>
          <div className="flex gap-2 justify-end mt-1.5">
            <button onClick={() => { setText(group.memo || ''); setEditing(false); }}
              className="text-[12px] border border-line hover:border-ink px-3 py-1.5">취소</button>
            <button onClick={() => { onSave(text.trim()); setEditing(false); }}
              className="text-[12px] bg-ink text-bg px-4 py-1.5 hover-lift">저장</button>
          </div>
        </div>
      ) : (
        <div className="text-[13px] whitespace-pre-wrap leading-relaxed text-ink/90">
          {group.memo || <span className="text-muted">메모 없음</span>}
        </div>
      )}
    </div>
  );
}
