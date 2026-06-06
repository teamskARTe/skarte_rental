import { useState, useEffect } from 'react';
import { Ico } from '../../components/Ico';
import { CATEGORIES } from '../../data/defaults';
import { RentalCalendar } from '../rentals/RentalCalendar';
import { won } from '../../lib/format';

export function EquipDetailModal({ item, rentals, equipment, onAdd, onRemove, onClose, onEdit }) {
  const [view, setView] = useState('info'); // info | calendar
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const cat = CATEGORIES.find(c => c.id === item.cat);
  const itemRentals = rentals.filter(r => r.gearId === item.id);
  const todayStr = new Date().toISOString().slice(0,10);
  const today = new Date(todayStr);
  // 오늘 대여중 수량
  const activeQty = itemRentals.reduce((sum, r) => {
    const s = new Date(r.start); const e = new Date(s); e.setDate(e.getDate()+r.days-1);
    return (today >= s && today <= e) ? sum + r.qty : sum;
  }, 0);
  // 다가오는 일정
  const upcoming = itemRentals
    .filter(r => { const e = new Date(r.start); e.setDate(e.getDate()+r.days-1); return e >= today; })
    .sort((a,b) => a.start.localeCompare(b.start));

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-3xl max-h-[92vh] overflow-y-auto border border-ink">
        {/* 헤더 */}
        <div className="sticky top-0 bg-bg border-b border-line px-6 md:px-8 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{cat.label}</div>
            <div className="font-display text-2xl md:text-3xl leading-none mt-1 truncate">{item.name}</div>
          </div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform shrink-0"><Ico.close className="w-5 h-5"/></button>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="px-6 md:px-8 pt-5 flex gap-2">
          <button onClick={() => setView('info')}
            className={`px-4 py-2 text-[13px] tracking-tight border ${view==='info' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
            상세 정보
          </button>
          <button onClick={() => setView('calendar')}
            className={`px-4 py-2 text-[13px] tracking-tight border ${view==='calendar' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
            대여 캘린더 · {itemRentals.length}
          </button>
        </div>

        <div className="px-6 md:px-8 py-6">
          {/* 상세 정보 */}
          {view==='info' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="aspect-[4/3] mb-6 border border-line flex items-center justify-center bg-[#F7F7F7]">
                  <Ico.cam className="w-16 h-16 text-muted/40"/>
                </div>
                <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-3">— 사양</div>
                <ul className="space-y-2 text-[14px]">
                  {(item.specs || (item.sub ? item.sub.split(',').map(s=>s.trim()).filter(Boolean) : ['등록된 비고 없음'])).map((s,i) => (
                    <li key={i} className="flex gap-3 border-b border-line pb-2">
                      <span className="font-mono text-[12px] text-muted">0{i+1}</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[14px] text-muted mb-4">{item.sub}</div>
                <div className="border border-line divide-y divide-line mb-4">
                  {[
                    { k:'일일 대여료', v:won(item.price) },
                    { k:'3일 (-10%)', v:won(Math.round(item.price*3*0.9)) },
                    { k:'7일 (-20%)', v:won(Math.round(item.price*7*0.8)) },
                    { k:'보유 재고', v:`${item.stock}대` },
                    { k:'오늘 대여중', v:`${activeQty}대` },
                    { k:'가용 재고', v:`${Math.max(0, item.stock - activeQty)}대` },
                  ].map(row => (
                    <div key={row.k} className="flex items-center justify-between px-4 py-3">
                      <span className="font-mono text-[12px] uppercase tracking-wider text-muted">{row.k}</span>
                      <span className="text-[14px] font-bold">{row.v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { onEdit(item); onClose(); }}
                  className="w-full border border-ink py-3 text-[13px] hover-lift">장비 정보 수정</button>

                {/* 다가오는 일정 요약 */}
                <div className="mt-6">
                  <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-3">— 다가오는 일정</div>
                  {upcoming.length === 0 ? (
                    <div className="text-[13px] text-muted">예정된 대여가 없습니다.</div>
                  ) : (
                    <div className="space-y-2">
                      {upcoming.slice(0,4).map(r => (
                        <div key={r.id} className="flex items-baseline justify-between text-[13px] border-b border-line pb-2">
                          <span>{r.renter} <span className="font-mono text-[12px] text-muted">×{r.qty}</span></span>
                          <span className="font-mono text-[12px] text-muted">{r.start} · {r.days}일</span>
                        </div>
                      ))}
                      {upcoming.length > 4 && <div className="text-[12px] text-muted">외 {upcoming.length-4}건 — 캘린더에서 확인</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 캘린더 */}
          {view==='calendar' && (
            <div>
              <p className="text-[13px] text-muted mb-4">
                <span className="font-bold text-ink">{item.name}</span>의 대여 일정만 표시됩니다. 일정 추가 시 이 장비가 기본 선택됩니다.
              </p>
              <RentalCalendar rentals={rentals} equipment={equipment} onAdd={onAdd} onRemove={onRemove} filterGearId={item.id}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
