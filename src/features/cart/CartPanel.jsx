import { useState, useEffect, useContext } from 'react';
import { Ico } from '../../components/Ico';
import { EquipCtx, SiteCtx } from '../../context';
import { CATEGORIES, EQUIPMENT } from '../../data/defaults';
import { openKakao, won } from '../../lib/format';

export function CartPanel({ cart, onClose, onUpdate, onRemove, onClear, onRecordOrder, user, onAuthOpen }) {
  const EQUIPMENT = useContext(EquipCtx);
  const { sets } = useContext(SiteCtx);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const items = cart
    .map(c => {
      let gear = EQUIPMENT.find(e => e.id === c.id);
      if (!gear && c.id && c.id.startsWith('set_')) {
        const s = (sets || []).find(x => x.id === c.id);
        if (s) gear = { id: s.id, cat: 'set', name: s.name, sub: s.items, price: s.price, stock: 1 };
      }
      return { ...c, gear };
    })
    .filter(c => c.gear);

  // 선택된 항목 (기본: 전체 선택)
  const [selected, setSelected] = useState(() => items.map(i => i.id));
  // 장바구니 항목이 바뀌면 선택 목록 동기화 (새로 담긴 건 자동 선택, 삭제된 건 제거)
  useEffect(() => {
    setSelected(prev => {
      const ids = items.map(i => i.id);
      const kept = prev.filter(id => ids.includes(id));
      const added = ids.filter(id => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [cart.length]);

  const isSel = (id) => selected.includes(id);
  const toggleSel = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = items.length > 0 && selected.length === items.length;
  const toggleAll = () => setSelected(allSelected ? [] : items.map(i => i.id));

  const calc = (price, days) => {
    if (days >= 7) return Math.round(price * days * 0.8);
    if (days >= 3) return Math.round(price * days * 0.9);
    return price * days;
  };
  const discRate = (days) => days >= 7 ? 0.2 : days >= 3 ? 0.1 : 0;

  const selItems = items.filter(i => isSel(i.id));
  // 선택 항목 기준: 정가 합계, 기간 할인 합계, 소계
  const listTotal = selItems.reduce((s, i) => s + i.gear.price * i.days * i.qty, 0);
  const subtotal = selItems.reduce((s, i) => s + calc(i.gear.price, i.days) * i.qty, 0);
  const periodSaved = listTotal - subtotal;
  // 기간 할인 구간별 집계 (7일 -20%, 3일 -10%)
  const period7 = selItems.filter(i => i.days >= 7).reduce((s,i) => s + (i.gear.price*i.days*i.qty - calc(i.gear.price,i.days)*i.qty), 0);
  const period3 = selItems.filter(i => i.days >= 3 && i.days < 7).reduce((s,i) => s + (i.gear.price*i.days*i.qty - calc(i.gear.price,i.days)*i.qty), 0);

  // 할인 이벤트 (관리자가 만든 것, 활성만 + 미적용 옵션)
  const { discounts } = useContext(SiteCtx);
  const COUPONS = [
    { id:'NONE', label:'할인 미적용', type:'none', value:0, min:0 },
    ...((discounts || []).filter(d => d.active !== false)),
  ];
  const [coupon, setCoupon] = useState('NONE');
  const [couponOpen, setCouponOpen] = useState(false);
  const selCoupon = COUPONS.find(c => c.id === coupon) || COUPONS[0];
  const couponEligible = selCoupon.type === 'none' || subtotal >= (selCoupon.min || 0);
  const couponSaved = (!couponEligible || selCoupon.type === 'none') ? 0
    : selCoupon.type === 'percent' ? Math.round(subtotal * selCoupon.value / 100)
    : Math.min(selCoupon.value, subtotal);

  const total = Math.max(0, subtotal - couponSaved);
  const saved = periodSaved + couponSaved;

  // 대여 시작일 (기본: 내일)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    const wd = ['일','월','화','수','목','금','토'][d.getDay()];
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}(${wd})`;
  };
  const minDate = new Date().toISOString().slice(0, 10);

  const sendToKakao = () => {
    if (selItems.length === 0) return;
    const lines = selItems.map((i, idx) => {
      const sub = calc(i.gear.price, i.days) * i.qty;
      const disc = i.days >= 7 ? ' (-20%)' : i.days >= 3 ? ' (-10%)' : '';
      // 항목별 종료일 (시작일 + 일수 - 1)
      let endStr = '';
      if (startDate) {
        const e = new Date(startDate + 'T00:00:00'); e.setDate(e.getDate() + Math.max(1, i.days) - 1);
        endStr = ` (~${e.getMonth()+1}.${String(e.getDate()).padStart(2,'0')})`;
      }
      return `${String(idx+1).padStart(2,'0')}. ${i.gear.name}\n    ${i.days}일 × ${i.qty}대${disc}${endStr} · ${won(sub)}`;
    }).join('\n\n');
    const couponLine = couponSaved > 0 ? `\n쿠폰(${selCoupon.label}) · -${won(couponSaved)}` : '';
    const p7Line = period7 > 0 ? `\n7일+ 장기 할인(-20%) · -${won(period7)}` : '';
    const p3Line = period3 > 0 ? `\n3일+ 기간 할인(-10%) · -${won(period3)}` : '';
    const dateLine = startDate ? `대여 시작일 · ${fmtDate(startDate)}\n\n` : '';
    const msg = `[대여 문의]\n\n${dateLine}${lines}\n\n────────────${p7Line}${p3Line}${couponLine}\n합계 · ${won(total)}`;
    if (user && onRecordOrder) {
      onRecordOrder({ items: selItems.map(i => ({ id:i.id, qty:i.qty, days:i.days })), total, startDate });
    }
    openKakao(msg);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md lg:max-w-3xl bg-bg border-l border-ink flex flex-col slide-in-right">
        {/* Header */}
        <div className="border-b border-line px-6 md:px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="font-mono text-[12px] uppercase tracking-wider text-muted">— 장바구니</div>
            <h2 className="font-display font-bold text-3xl leading-none mt-1">장바구니</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform">
            <Ico.close className="w-5 h-5"/>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6">
            <Ico.bag className="w-12 h-12 text-muted/40 mb-5"/>
            <div className="font-display text-2xl mb-2">담긴 장비가 없습니다</div>
            <p className="text-[13px] text-muted">장비 페이지에서 원하는 품목을 담아보세요.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* ── 장비 목록 (선택) ── */}
            <div className="flex flex-col min-h-0 flex-1 lg:border-r border-line">
              <div className="px-6 md:px-8 pt-5 pb-3 shrink-0 border-b border-line">
                <button onClick={toggleAll} className="w-full flex items-center gap-2.5 text-left">
                  <span className={`w-5 h-5 border flex items-center justify-center shrink-0 ${allSelected ? 'bg-ink border-ink' : 'border-line'}`}>
                    {allSelected && <Ico.check className="w-3.5 h-3.5 text-bg"/>}
                  </span>
                  <span className="text-[14px] tracking-tight">전체 선택 <span className="text-muted">({selected.length}/{items.length})</span></span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 scrollbar-hide">
              <div className="space-y-5">
              {items.map((i, idx) => {
                const sub = calc(i.gear.price, i.days) * i.qty;
                const listSub = i.gear.price * i.days * i.qty;
                const cat = CATEGORIES.find(c => c.id === i.gear.cat);
                const rate = discRate(i.days);
                const sel = isSel(i.id);
                return (
                  <div key={i.id} className={`border-b border-line pb-5 transition-opacity ${sel ? '' : 'opacity-45'}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleSel(i.id)} className="mt-0.5 shrink-0" aria-label="선택">
                        <span className={`w-5 h-5 border flex items-center justify-center ${sel ? 'bg-ink border-ink' : 'border-line'}`}>
                          {sel && <Ico.check className="w-3.5 h-3.5 text-bg"/>}
                        </span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-ink mb-0.5">{cat ? cat.label : '세트 상품'}</div>
                        <div className="font-display text-lg leading-tight truncate">{i.gear.name}</div>
                        <div className="text-[13px] text-muted truncate">{i.gear.sub}</div>
                      </div>
                      <button onClick={() => onRemove(i.id)} className="text-muted hover:text-ink p-1 shrink-0" aria-label="삭제">
                        <Ico.trash className="w-4 h-4"/>
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 grid grid-cols-2 gap-3 pl-8">
                      <div>
                        <div className="text-[12px] text-muted mb-2">대여 일수</div>
                        <div className="flex items-center gap-1">
                          {[1, 3, 7].map(d => (
                            <button key={d} onClick={() => onUpdate(i.id, { days: d })}
                              className={`relative w-9 h-8 text-[13px] font-mono border ${i.days === d ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
                              {d}
                              {(d === 3 || d === 7) && (
                                <span className="absolute -top-2 -right-1.5 text-[8px] font-mono bg-kakao text-ink px-1 leading-tight rounded-sm">-{d===7?20:10}%</span>
                              )}
                            </button>
                          ))}
                          <input type="number" min="1" max="90" value={i.days}
                            onChange={e => onUpdate(i.id, { days: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-12 h-8 text-[13px] font-mono border border-line text-center bg-transparent outline-none focus:border-ink"/>
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] text-muted mb-2">수량</div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => onUpdate(i.id, { qty: Math.max(1, i.qty - 1) })}
                            className="w-8 h-8 border border-line hover:border-ink flex items-center justify-center">
                            <Ico.minus className="w-3 h-3"/>
                          </button>
                          <span className="font-mono text-[13px] w-8 text-center">{i.qty}</span>
                          <button onClick={() => onUpdate(i.id, { qty: Math.min(i.gear.stock, i.qty + 1) })}
                            className="w-8 h-8 border border-line hover:border-ink flex items-center justify-center disabled:opacity-30"
                            disabled={i.qty >= i.gear.stock}>
                            <Ico.plus className="w-3 h-3"/>
                          </button>
                          <span className="font-mono text-[11px] text-muted ml-1">/ {i.gear.stock}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 pl-8 flex items-baseline justify-between">
                      <span className="font-mono text-[13px] text-muted">
                        {i.gear.price > 0 ? `${won(i.gear.price)}/일 × ${i.days}일 × ${i.qty}대` : '문의 필요'}
                        {rate > 0 && i.gear.price > 0 && <span className="ml-1.5 text-ink font-bold">-{rate*100}%</span>}
                      </span>
                      <span className="text-right">
                        {rate > 0 && i.gear.price > 0 && <span className="block font-mono text-[12px] text-muted line-through leading-none">{won(listSub)}</span>}
                        <span className="font-mono text-[15px] font-bold">{i.gear.price > 0 ? won(sub) : '문의'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              </div>
              </div>
            </div>

            {/* ── 쿠폰 + 결제 요약 ── */}
            <div className="shrink-0 lg:w-80 flex flex-col min-h-0 border-t lg:border-t-0 border-line bg-[#FAFAFA]">
              <div className="px-6 md:px-8 pt-5 pb-4 lg:flex-1 max-h-[40vh] lg:max-h-none overflow-y-auto scrollbar-hide">
                {/* 쿠폰 */}
                <div className="hidden lg:block font-mono text-[11px] uppercase tracking-wider text-muted mb-3">— 할인</div>
                <button onClick={() => setCouponOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-line hover:border-ink transition-colors bg-bg mb-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <Ico.bag className="w-4 h-4 text-muted shrink-0"/>
                    <span className="text-[13px] truncate">
                      {selCoupon.type === 'none' ? '할인 선택' : selCoupon.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {couponSaved > 0 && <span className="text-[12px] font-bold text-ink">-{won(couponSaved)}</span>}
                    <Ico.plus className={`w-4 h-4 text-muted transition-transform ${couponOpen ? 'rotate-45' : ''}`}/>
                  </span>
                </button>
                {couponOpen && (
                  <div className="space-y-2 mb-4 fade-in">
                    {COUPONS.length === 1 && (
                      <div className="text-[12px] text-muted px-1 py-2">현재 적용 가능한 할인이 없습니다.</div>
                    )}
                    {COUPONS.map(c => {
                      const eligible = c.type === 'none' || subtotal >= (c.min || 0);
                      const active = coupon === c.id;
                      const valLabel = c.type === 'percent' ? `-${c.value}%` : c.type === 'amount' ? `-${won(c.value)}` : '';
                      return (
                        <button key={c.id} onClick={() => { if (eligible) { setCoupon(c.id); setCouponOpen(false); } }} disabled={!eligible}
                          className={`w-full text-left px-4 py-3 border flex items-center gap-3 transition-colors ${active ? 'bg-ink text-bg border-ink' : eligible ? 'bg-bg border-line hover:border-ink' : 'bg-bg border-line opacity-40 cursor-not-allowed'}`}>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-bg' : 'border-muted'}`}>
                            {active && <span className="w-2 h-2 rounded-full bg-bg"/>}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="block text-[13px] font-bold leading-tight">{c.label}</span>
                              {valLabel && <span className={`font-mono text-[12px] font-bold ${active ? 'text-kakao' : 'text-ink'}`}>{valLabel}</span>}
                            </span>
                            {c.min > 0 && <span className={`block text-[11px] mt-0.5 ${active ? 'text-bg/70' : 'text-muted'}`}>{won(c.min)} 이상 사용 가능</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 금액 요약 */}
                <div className="hidden lg:block font-mono text-[11px] uppercase tracking-wider text-muted mt-6 mb-3">— 결제 요약</div>
                <div className="space-y-2 text-[14px] mt-3 lg:mt-0">
                  <div className="flex justify-between text-muted">
                    <span>정가 합계</span><span className="font-mono">{won(listTotal)}</span>
                  </div>
                  {period7 > 0 && (
                    <div className="flex justify-between"><span>7일+ 장기 할인 <span className="text-muted">-20%</span></span><span className="font-mono">- {won(period7)}</span></div>
                  )}
                  {period3 > 0 && (
                    <div className="flex justify-between"><span>3일+ 기간 할인 <span className="text-muted">-10%</span></span><span className="font-mono">- {won(period3)}</span></div>
                  )}
                  {couponSaved > 0 && (
                    <div className="flex justify-between"><span>쿠폰 <span className="text-muted">{selCoupon.label}</span></span><span className="font-mono">- {won(couponSaved)}</span></div>
                  )}
                  {saved > 0 && (
                    <div className="flex justify-between font-bold pt-2 border-t border-line">
                      <span>총 할인</span><span className="font-mono text-ink">- {won(saved)}</span>
                    </div>
                  )}
                </div>
                {saved === 0 && (
                  <p className="text-[12px] text-muted mt-2">3일 이상 대여하거나 쿠폰을 적용하면 할인돼요.</p>
                )}

                {/* 대여 시작일 */}
                <div className="mt-5 pt-4 border-t border-line">
                  <label className="text-[13px] font-bold text-ink block mb-2">대여 시작일</label>
                  <input type="date" value={startDate} min={minDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-line focus:border-ink outline-none px-3 py-2.5 text-[14px] bg-bg"/>
                  {startDate && (
                    <p className="text-[12px] text-muted mt-1.5">{fmtDate(startDate)}부터 대여 (반납일은 항목별 일수 기준)</p>
                  )}
                </div>
              </div>

              {/* 최종 결제 (고정 하단) */}
              <div className="border-t border-line px-6 md:px-8 py-5 bg-bg shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted">선택 {selItems.length}개 · 총 결제</span>
                  {saved > 0 && <span className="text-[12px] text-ink font-bold">-{won(saved)} 할인</span>}
                </div>
                <div className="font-display text-4xl font-bold leading-none mb-4">{won(total)}</div>
                <button onClick={sendToKakao} disabled={selItems.length === 0}
                  className="w-full bg-kakao text-ink py-4 inline-flex items-center justify-center gap-2 hover-lift disabled:opacity-40">
                  <Ico.chat className="w-4 h-4"/> 선택 항목 카카오톡 문의
                </button>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={onClear} className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink underline-grow">전체 비우기</button>
                  <span className="text-[11px] text-muted">시작일·내역이 메시지에 자동 입력</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
