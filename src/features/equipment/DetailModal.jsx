import { useState, useEffect, useMemo } from 'react';
import { Ico } from '../../components/Ico';
import { CATEGORIES } from '../../data/defaults';
import { RentalCalendar } from '../rentals/RentalCalendar';
import { priceLabel, won } from '../../lib/format';

export function DetailModal({ item, onClose, onAdd, wishlist, onToggleWish, rentals }) {
  const todayStr = new Date().toISOString().slice(0,10);
  const [chkStart, setChkStart] = useState(todayStr);
  const [chkDays, setChkDays] = useState(1);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  // 선택 기간 중 가용 대수 = 총 재고 − 기간 내 최대 동시 예약 수량
  const avail = useMemo(() => {
    if (!item) return { qty: 0, peak: 0 };
    const mine = (rentals || []).filter(r => r.gearId === item.id);
    const start = new Date(chkStart);
    let peak = 0;
    for (let d = 0; d < Math.max(1, chkDays); d++) {
      const day = new Date(start); day.setDate(day.getDate() + d);
      const booked = mine.reduce((sum, r) => {
        const s = new Date(r.start); const e = new Date(s); e.setDate(e.getDate() + r.days - 1);
        return (day >= s && day <= e) ? sum + r.qty : sum;
      }, 0);
      peak = Math.max(peak, booked);
    }
    return { qty: Math.max(0, item.stock - peak), peak };
  }, [item, rentals, chkStart, chkDays]);

  if (!item) return null;
  const cat = CATEGORIES.find(c => c.id === item.cat) || { label: item.isSet ? '세트 상품' : '기타', en:'', code:'' };
  const chkEnd = (() => {
    const e = new Date(chkStart); e.setDate(e.getDate() + Math.max(1, chkDays) - 1);
    return `${e.getMonth()+1}월 ${e.getDate()}일`;
  })();

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-bg w-full md:max-w-3xl max-h-[92vh] overflow-y-auto border border-ink">
        <div className="sticky top-0 bg-bg border-b border-line px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted">{cat.label}</div>
          <div className="flex items-center gap-3">
            <button onClick={() => onToggleWish(item.id)}
              className={`p-1 hover-lift ${wishlist.includes(item.id) ? 'text-red-500' : 'text-muted/60 hover:text-ink'}`} aria-label="찜">
              {wishlist.includes(item.id) ? <Ico.heartFill className="w-5 h-5"/> : <Ico.heart className="w-5 h-5"/>}
            </button>
            <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="px-6 md:px-10 py-8 md:py-12">
          <div className="font-mono text-[12px] text-muted">#{item.id.toUpperCase()}</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mt-2">{item.name}</h2>
          <div className="mt-2 italic text-muted">{item.sub}</div>

          <div className="aspect-[16/9] my-10 border border-line flex items-center justify-center bg-[#F7F7F7]">
            <Ico.cam className="w-20 h-20 text-muted/40"/>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-3">— 사양</div>
              <ul className="space-y-2 text-[14px]">
                {(item.specs || (item.sub ? item.sub.split(',').map(s=>s.trim()).filter(Boolean) : [])).map((s,i) => (
                  <li key={i} className="flex gap-3 border-b border-line pb-2">
                    <span className="font-mono text-[12px] text-muted">0{i+1}</span>
                    <span>{s}</span>
                  </li>
                ))}
                <li className="flex gap-3 border-b border-line pb-2">
                  <span className="font-mono text-[12px] text-muted">·</span>
                  <span>재고 {item.stock}대</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-3">— 대여 요금</div>
              <div className="border border-line p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-muted">1일</span>
                  <span className="font-display text-4xl font-bold">{priceLabel(item.price)}</span>
                </div>
                <div className="flex items-baseline justify-between mt-3 text-[14px]">
                  <span className="text-muted">3일</span><span className="font-mono font-bold">{won(item.price*3*0.9)}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1 text-[14px]">
                  <span className="text-muted">7일</span><span className="font-mono font-bold">{won(item.price*7*0.8)}</span>
                </div>
                <div className="text-[12px] text-muted mt-3 leading-relaxed">
                  * 3일 이상 10%, 7일 이상 20% 할인이 자동 적용됩니다.
                </div>
              </div>
              <button onClick={() => { onAdd(item); onClose(); }}
                className="mt-4 w-full bg-ink text-bg py-4 inline-flex items-center justify-center gap-2 hover-lift">
                <Ico.bag className="w-4 h-4"/> 장바구니에 담기
              </button>
              <p className="text-[12px] text-muted mt-3 text-center">장바구니에서 일정·수량을 조정 후 카카오톡으로 일괄 문의됩니다.</p>
            </div>
          </div>

          {/* 대여 가능 날짜 (세트 상품 제외) */}
          {!item.isSet && (
          <div className="mt-12">
            <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-3">— 예약 현황</div>
            <h3 className="font-display text-2xl md:text-3xl leading-none mb-5">대여 가능 날짜</h3>

            {/* 날짜별 가용 대수 체크 */}
            <div className="border border-line p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-muted">시작일</label>
                  <input type="date" value={chkStart} min={todayStr}
                    onChange={e => setChkStart(e.target.value || todayStr)}
                    className="w-full border border-line focus:border-ink outline-none px-3 py-2.5 text-[14px] mt-1 bg-transparent"/>
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여 일수</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,3,7].map(d => (
                      <button key={d} onClick={() => setChkDays(d)}
                        className={`w-10 h-10 text-[13px] font-mono border ${chkDays===d ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>{d}</button>
                    ))}
                    <input type="number" min="1" max="90" value={chkDays}
                      onChange={e => setChkDays(Math.max(1, parseInt(e.target.value)||1))}
                      className="w-14 h-10 text-[13px] font-mono border border-line text-center bg-transparent outline-none focus:border-ink"/>
                  </div>
                </div>
              </div>

              {/* 결과 */}
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-4">
                <div className="text-[13px] text-muted">
                  {new Date(chkStart).getMonth()+1}월 {new Date(chkStart).getDate()}일
                  {chkDays > 1 && ` ~ ${chkEnd}`} 기준
                  {avail.peak > 0 && <span className="block text-[12px] mt-0.5">이 기간 최대 {avail.peak}대 예약됨 · 총 {item.stock}대</span>}
                </div>
                <div className="text-right shrink-0">
                  {avail.qty > 0 ? (
                    <>
                      <span className="font-display text-3xl font-bold leading-none">{avail.qty}<span className="text-[15px] font-normal">대</span></span>
                      <span className="block font-mono text-[11px] uppercase tracking-wider text-muted mt-1">대여 가능</span>
                    </>
                  ) : (
                    <>
                      <span className="font-display text-2xl font-bold leading-none">예약 마감</span>
                      <span className="block font-mono text-[11px] uppercase tracking-wider text-muted mt-1">해당 기간</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="font-display font-bold text-lg md:text-xl leading-none mb-4">예약 정보</div>
            <RentalCalendar rentals={rentals || []} equipment={[item]} filterGearId={item.id} readOnly/>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
