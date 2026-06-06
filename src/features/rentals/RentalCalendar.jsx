import { useState, useMemo } from 'react';
import { Ico } from '../../components/Ico';
import { RENTAL_COLORS, colorOf, rentalEndStr } from '../../data/defaults';
import { RentalForm } from './RentalForm';

export function RentalCalendar({ rentals, equipment, onAdd, onRemove, filterGearId, readOnly }) {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null); // 날짜 상세

  const scoped = filterGearId ? rentals.filter(r => r.gearId === filterGearId) : rentals;
  const gearName = (id) => (equipment.find(e => e.id === id) || {}).name || id;
  const short = (s) => s.length > 10 ? s.slice(0,9) + '…' : s;

  const fmt = (day) => `${cur.y}-${String(cur.m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const onDay = (day) => {
    const ds = fmt(day);
    const d = new Date(ds);
    return scoped.filter(r => {
      const s = new Date(r.start); const e = new Date(s); e.setDate(e.getDate() + r.days - 1);
      return d >= s && d <= e;
    });
  };
  const isStart = (r, day) => r.start === fmt(day);

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
  const monthTotal = scoped.filter(r => {
    const s = new Date(r.start);
    return s.getFullYear()===cur.y && s.getMonth()===cur.m;
  });

  // 레인 할당: 같은 예약이 모든 날짜에서 같은 세로 줄에 오도록
  const LANES_SHOWN = 3;
  const laneOf = useMemo(() => {
    const sorted = [...scoped].sort((a,b) => a.start.localeCompare(b.start));
    const laneEnds = []; const map = {};
    sorted.forEach(r => {
      const s = new Date(r.start); const e = new Date(rentalEndStr(r));
      let lane = 0;
      while (laneEnds[lane] !== undefined && laneEnds[lane] >= s) lane++;
      laneEnds[lane] = e; map[r.id] = lane;
    });
    return map;
  }, [scoped]);

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
          items.forEach(r => {
            const lane = laneOf[r.id];
            if (lane < LANES_SHOWN) byLane[lane] = r; else overflow++;
          });
          return (
            <button key={i} onClick={() => items.length && setSelected({ day, items })}
              className={`border-r border-b border-line min-h-[104px] pt-1.5 pb-1 text-left align-top flex flex-col gap-1 ${items.length ? 'hover:bg-[#F7F7F7] cursor-pointer' : 'cursor-default'}`}>
              <div className={`mx-1.5 font-mono text-[12px] ${isToday ? 'bg-ink text-bg w-5 h-5 flex items-center justify-center rounded-full' : 'text-muted'}`}>{day}</div>
              <div className="flex flex-col gap-0.5">
                {Array.from({ length: LANES_SHOWN }).map((_, lane) => {
                  const r = byLane[lane];
                  if (!r) return <div key={lane} className="h-[19px]"/>; // 빈 슬롯(정렬 유지)
                  const isS = r.start === fmt(day);
                  const isE = rentalEndStr(r) === fmt(day);
                  const showLabel = isS || weekStart; // 시작일 또는 매주 첫날 라벨 재표시
                  return (
                    <div key={lane}
                      className={`h-[19px] leading-[19px] text-[11px] text-ink/80 overflow-hidden whitespace-nowrap ${isS ? 'rounded-l-sm pl-1.5 border-l-2 border-ink' : 'pl-1'} ${isE ? 'rounded-r-sm mr-0.5' : ''}`}
                      style={{ background: colorOf(r.id) }}
                      title={readOnly ? `예약됨 ×${r.qty} (${r.start}부터 ${r.days}일)` : `${gearName(r.gearId)} ×${r.qty} · ${r.renter} (${r.start}부터 ${r.days}일)`}>
                      {showLabel ? (readOnly ? `예약 ×${r.qty}` : `${short(gearName(r.gearId))} ×${r.qty}${isS ? ' · ' + r.renter : ''}`) : '\u00A0'}
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
        {readOnly ? (
          <span className="text-[12px] text-muted">색칠된 날짜는 예약이 있는 기간입니다. 그 외 날짜는 대여 가능하며, 정확한 가용 수량은 문의 시 안내드립니다.</span>
        ) : (
          <>
            <span className="text-[12px] text-muted">같은 색·같은 줄로 이어진 막대가 하나의 예약입니다.</span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
              <span className="inline-block w-4 h-3 border-l-2 border-ink" style={{background:RENTAL_COLORS[0]}}/> 시작일
            </span>
          </>
        )}
      </div>

      {adding && <RentalForm equipment={equipment} defaultStart={todayStr} defaultGearId={filterGearId} onSave={(r) => { onAdd(r); setAdding(false); }} onClose={() => setAdding(false)}/>}

      {/* 날짜 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-md border border-ink">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <div className="font-display text-2xl">{cur.m+1}월 {selected.day}일 {readOnly ? '예약 현황' : '대여 현황'}</div>
              <button onClick={() => setSelected(null)} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {selected.items.map(r => (
                <div key={r.id} className="flex items-start justify-between gap-3 border-b border-line pb-3">
                  <div>
                    <div className="font-display text-lg leading-tight">{gearName(r.gearId)} <span className="font-mono text-[13px] text-muted">×{r.qty}</span></div>
                    <div className="text-[13px] text-muted">{readOnly ? '예약됨' : r.renter} · {r.start}부터 {r.days}일</div>
                  </div>
                  {!readOnly && (
                    <button onClick={() => { onRemove(r.id); setSelected(s => ({ ...s, items: s.items.filter(x=>x.id!==r.id) })); }}
                      className="text-muted hover:text-ink p-1 shrink-0"><Ico.trash className="w-4 h-4"/></button>
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
