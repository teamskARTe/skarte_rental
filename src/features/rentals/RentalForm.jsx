import { useState, useEffect } from 'react';
import { Ico } from '../../components/Ico';
import { BRANCHES } from '../../data/defaults';

// 한 사람(또는 팀) 이름으로 여러 장비를 같은 기간에 한 번에 등록합니다.
// 저장 시 장비별로 rental 한 건씩 만들어 배열로 넘깁니다.
export function RentalForm({ equipment, sets = [], defaultStart, defaultGearId, onSave, onClose }) {
  // 장비 + 세트를 한 목록으로 (선택용)
  const pickOptions = [
    ...equipment.map(e => ({ id: e.id, label: e.name, stock: e.stock })),
    ...(sets || []).map(s => ({ id: s.id, label: `[세트] ${s.name}`, stock: 1 })),
  ];
  const optOf = (id) => pickOptions.find(o => o.id === id);
  const first = defaultGearId || pickOptions[0]?.id || '';
  const [renter, setRenter] = useState('');
  const [start, setStart] = useState(defaultStart);
  const [startTime, setStartTime] = useState('10:00');
  const [days, setDays] = useState(1);
  const [endTime, setEndTime] = useState('18:00');
  const [rows, setRows] = useState(first ? [{ gearId: first, qty: 1 }] : []);
  const [addGearId, setAddGearId] = useState('');
  const [pickupBranch, setPickupBranch] = useState(BRANCHES[0].id);
  const [returnBranch, setReturnBranch] = useState(BRANCHES[0].id);
  const [memo, setMemo] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  // 반납일 = 시작일 + (일수 - 1). toISOString은 UTC라 하루 밀리므로 로컬 기준으로 만듭니다.
  const returnDate = (() => {
    const d = parseInt(days) || 0;
    if (!start || d < 1) return '';
    const dt = new Date(start + 'T00:00:00');
    dt.setDate(dt.getDate() + d - 1);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  })();

  const gearOf = (id) => optOf(id);
  const patchRow = (i, patch) => setRows(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i) => setRows(rs => rs.filter((_, idx) => idx !== i));
  const addRow = () => {
    if (!addGearId) return;
    setRows(rs => [...rs, { gearId: addGearId, qty: 1 }]);
    setAddGearId('');
  };

  const submit = () => {
    if (!renter.trim()) return setErr('대여자명을 입력해 주세요.');
    if (!start) return setErr('대여 시작일을 선택해 주세요.');
    if (rows.length === 0) return setErr('장비를 한 개 이상 추가해 주세요.');
    const base = Date.now().toString().slice(-6);
    const d = Math.max(1, parseInt(days) || 1);
    const m = memo.trim();
    onSave(rows.map((r, i) => ({
      id: `r${base}_${i}`,
      gearId: r.gearId,
      qty: Math.max(1, parseInt(r.qty) || 1),
      renter: renter.trim(),
      start,
      days: d,
      startTime,
      endTime,
      pickupBranch,
      returnBranch,
      memo: m,             // 예약(묶음) 메모 — 같은 예약의 모든 항목에 동일하게 저장
      group: `g${base}`,   // 같은 등록건 묶음 표시용
    })));
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-lg border border-ink max-h-[92vh] flex flex-col">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between shrink-0">
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted">대여 일정 추가</div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-4 overflow-y-auto">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여자 · 팀명</label>
            <input value={renter} onChange={e=>setRenter(e.target.value)}
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="이름 또는 팀명"/>
          </div>

          {/* 대여 시작 */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여 시작 (날짜 · 시간)</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input type="date" value={start} onChange={e=>setStart(e.target.value)}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
            </div>
          </div>

          {/* 반납 */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여 일수 · 반납 시간</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input type="number" min="1" max="365" value={days} onChange={e=>setDays(e.target.value)}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
            </div>
            <p className="text-[12px] text-muted mt-1.5">
              반납일 <span className="font-mono text-ink">{returnDate || '—'}</span> {endTime} (자동 계산)
            </p>
          </div>

          {/* 픽업·반납 지점 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">픽업 지점</label>
              <div className="flex gap-1.5 mt-1">
                {BRANCHES.map(b => (
                  <button key={b.id} type="button" onClick={() => setPickupBranch(b.id)}
                    className={`flex-1 text-[13px] px-2 py-2 border ${pickupBranch === b.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink bg-transparent'}`}>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">반납 지점</label>
              <div className="flex gap-1.5 mt-1">
                {BRANCHES.map(b => (
                  <button key={b.id} type="button" onClick={() => setReturnBranch(b.id)}
                    className={`flex-1 text-[13px] px-2 py-2 border ${returnBranch === b.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink bg-transparent'}`}>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 장비 목록 */}
          <div className="pt-2 border-t border-line">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">장비 목록 ({rows.length})</label>
            {rows.length === 0 && (
              <div className="text-[13px] text-muted border border-line px-3 py-4 mt-1.5">아래에서 장비를 추가해 주세요.</div>
            )}
            <div className="space-y-1.5 mt-1.5">
              {rows.map((r, i) => {
                const g = gearOf(r.gearId);
                return (
                  <div key={i} className="flex items-center gap-1.5 border border-line px-2 py-2">
                    <select value={r.gearId} onChange={e=>patchRow(i, { gearId: e.target.value })}
                      className="flex-1 min-w-0 text-[13px] border border-line focus:border-ink outline-none px-2 py-1.5 bg-transparent">
                      {pickOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <label className="text-[11px] text-muted shrink-0">수량</label>
                    <input type="number" min="1" value={r.qty} onChange={e=>patchRow(i, { qty: e.target.value })}
                      className="w-14 text-[13px] font-mono text-center border border-line focus:border-ink outline-none px-1 py-1.5 bg-transparent"/>
                    <span className="font-mono text-[11px] text-muted shrink-0 w-10 text-right">/ {g ? g.stock : '-'}</span>
                    <button onClick={() => removeRow(i)} className="text-muted hover:text-ink p-1 shrink-0" aria-label="삭제">
                      <Ico.trash className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1.5 mt-2">
              <select value={addGearId} onChange={e=>setAddGearId(e.target.value)}
                className="flex-1 min-w-0 text-[13px] border border-line focus:border-ink outline-none px-2 py-2 bg-transparent">
                <option value="">+ 장비·세트 추가…</option>
                {pickOptions.map(o => <option key={o.id} value={o.id}>{o.label}{o.stock != null ? ` (재고 ${o.stock})` : ''}</option>)}
              </select>
              <button onClick={addRow} disabled={!addGearId}
                className="shrink-0 text-[12px] border border-ink px-4 py-2 hover-lift disabled:opacity-40 disabled:cursor-not-allowed">추가</button>
            </div>
          </div>

          {/* 메모 (예약 단위) */}
          <div className="pt-2 border-t border-line">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">메모 (선택)</label>
            <textarea value={memo} onChange={e=>setMemo(e.target.value)} rows={3}
              placeholder="대여 관련 자유 메모 (예: 보증금 받음, 오후 6시 이후 반납 등)"
              className="w-full border border-line focus:border-ink outline-none px-3 py-2.5 text-[14px] mt-1 bg-transparent resize-y"/>
          </div>

          {err && <div className="text-[13px] text-red-600">{err}</div>}
        </div>

        <div className="border-t border-line px-6 md:px-8 py-4 shrink-0">
          <button onClick={submit} className="w-full bg-ink text-bg py-4 text-[13px] hover-lift">
            {rows.length > 1 ? `장비 ${rows.length}개 일정 등록` : '일정 등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
