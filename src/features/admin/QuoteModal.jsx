import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ico } from '../../components/Ico';
import { COMPANY, branchName } from '../../data/defaults';
import { calcPrice, won } from '../../lib/format';

// 접수(order) 한 건을 견적서 문서로 렌더링합니다. 데이터는 접수에서 자동 연동됩니다.
// 화면에선 미리보기, "인쇄/PDF"로 A4 문서를 출력합니다.
export function QuoteModal({ order, equipment, sets = [], onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const WD = ['일','월','화','수','목','금','토'];
  const fmtDateTime = (iso, time) => {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    const base = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}(${WD[d.getDay()]})`;
    return time ? `${base} ${time}` : base;
  };

  // 장비/세트 정보 조회
  const gearInfo = (it) => {
    const e = equipment.find(x => x.id === it.id);
    if (e) return { name: e.name, price: it.price ?? e.price ?? 0, parts: e.specs || [] };
    const s = (sets || []).find(x => x.id === it.id);
    if (s) return { name: `[세트] ${s.name}`, price: it.price ?? s.price ?? 0, parts: s.items ? [s.items] : [] };
    return { name: it.name || it.id, price: it.price ?? 0, parts: [] };
  };

  const rows = (order.items || []).map((it, idx) => {
    const g = gearInfo(it);
    const days = parseInt(it.days) || 0;
    const qty = parseInt(it.qty) || 0;
    const amount = calcPrice(g.price, days) * qty;
    return { idx: idx + 1, name: g.name, parts: g.parts, days, qty, amount };
  });

  const rentSum = rows.reduce((s, r) => s + r.amount, 0);      // 기간할인 적용된 항목 합
  const couponSaved = order.couponSaved || 0;
  const rentalTotal = Math.max(0, rentSum - couponSaved);       // 렌탈료 합계
  const careFee = order.careFee || 0;
  const vat = order.vat != null ? order.vat : Math.round((rentalTotal + careFee) * 0.1);
  const total = order.total != null ? order.total : rentalTotal + careFee + vat;

  const print = () => {
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { window.print(); }, 30);
    setTimeout(done, 1500);
  };

  const Cell = ({ children, label }) => (
    <div className="flex border-b border-line last:border-b-0">
      <div className="w-28 shrink-0 bg-[#F4F6F9] px-3 py-2 text-[13px] text-muted border-r border-line">{label}</div>
      <div className="flex-1 px-3 py-2 text-[13px]">{children || ' '}</div>
    </div>
  );

  return createPortal(
    <div className="quote-overlay fixed inset-0 z-[80] bg-black/40 overflow-y-auto p-0 md:p-6 flex justify-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full md:max-w-[820px] my-0 md:my-4">
        {/* 툴바 (인쇄 제외) */}
        <div className="no-print flex items-center justify-between gap-3 bg-ink text-bg px-5 py-3 sticky top-0 z-10">
          <span className="text-[14px] font-bold">견적서 · #{order.refNo || order.id}</span>
          <div className="flex items-center gap-2">
            <button onClick={print} className="bg-bg text-ink px-4 py-2 text-[13px] hover-lift">인쇄 / PDF 저장</button>
            <button onClick={onClose} className="border border-bg/40 px-3 py-2 text-[13px]">닫기</button>
          </div>
        </div>

        {/* 문서 */}
        <div className="quote-doc bg-white text-ink px-7 md:px-10 py-9">
          <div className="flex items-end justify-between border-b-2 border-ink pb-4 mb-6">
            <h1 className="font-display font-bold text-3xl leading-none">스케아트 견적서</h1>
            <div className="text-right text-[12px] text-muted font-mono">
              접수번호 #{order.refNo || order.id}<br/>발행일 {order.date || ''}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {/* 임대인 */}
            <div>
              <div className="font-bold text-[14px] mb-1.5">임대인</div>
              <div className="border border-line">
                <Cell label="상호명">{COMPANY.name}</Cell>
                <Cell label="대표">{COMPANY.ceo}</Cell>
                <Cell label="사업자번호">{COMPANY.bizNo}</Cell>
                <Cell label="주소">{COMPANY.address} {COMPANY.addressDetail}</Cell>
              </div>
            </div>
            {/* 임차인 */}
            <div>
              <div className="font-bold text-[14px] mb-1.5">임차인</div>
              <div className="border border-line">
                <Cell label="성함(상호)">{order.name}</Cell>
                <Cell label="연락처">{order.contact}</Cell>
              </div>
            </div>
          </div>

          {/* 렌탈 일정·지점 */}
          <div className="font-bold text-[14px] mb-1.5">렌탈</div>
          <table className="w-full border border-line border-collapse mb-6 text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 text-left w-20"></th>
                <th className="border border-line px-3 py-2 text-left">일정</th>
                <th className="border border-line px-3 py-2 text-left w-28">지점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-line px-3 py-2 bg-[#F4F6F9] text-muted">렌탈</td>
                <td className="border border-line px-3 py-2 font-mono">{fmtDateTime(order.startDate, order.startTime)}</td>
                <td className="border border-line px-3 py-2">{order.pickupBranch ? branchName(order.pickupBranch) : '—'}</td>
              </tr>
              <tr>
                <td className="border border-line px-3 py-2 bg-[#F4F6F9] text-muted">반납</td>
                <td className="border border-line px-3 py-2 font-mono">{fmtDateTime(order.returnDate, order.returnTime)}</td>
                <td className="border border-line px-3 py-2">{order.returnBranch ? branchName(order.returnBranch) : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* 장비 표 */}
          <table className="w-full border border-line border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 w-12 text-left">번호</th>
                <th className="border border-line px-3 py-2 text-left">장비명</th>
                <th className="border border-line px-3 py-2 text-left">구성품</th>
                <th className="border border-line px-3 py-2 w-28 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.idx}>
                  <td className="border border-line px-3 py-2 align-top font-mono">{String(r.idx).padStart(2,'0')}</td>
                  <td className="border border-line px-3 py-2 align-top">
                    {r.name}
                    <span className="block text-[12px] text-muted">{r.days}일 × {r.qty}대</span>
                  </td>
                  <td className="border border-line px-3 py-2 align-top text-[12px]">
                    {r.parts.length === 0 ? <span className="text-muted">—</span>
                      : r.parts.map((p, i) => <span key={i} className="block">{String(i+1).padStart(2,'0')} {p} (  )</span>)}
                  </td>
                  <td className="border border-line px-3 py-2 align-top text-right font-mono">{won(r.amount)}</td>
                </tr>
              ))}
              {couponSaved > 0 && (
                <tr>
                  <td className="border border-line px-3 py-2" colSpan={2}>쿠폰 <span className="text-muted">{order.couponLabel || '적용'}</span></td>
                  <td className="border border-line px-3 py-2 text-right text-muted" colSpan={1}></td>
                  <td className="border border-line px-3 py-2 text-right font-mono">- {won(couponSaved)}</td>
                </tr>
              )}
              <tr>
                <td className="border border-line px-3 py-2 font-bold" colSpan={3}>렌탈료 합계</td>
                <td className="border border-line px-3 py-2 text-right font-mono font-bold">{won(rentalTotal)}</td>
              </tr>
              {careFee > 0 && (
                <tr>
                  <td className="border border-line px-3 py-2" colSpan={3}>안심케어 <span className="text-muted">(+20%)</span></td>
                  <td className="border border-line px-3 py-2 text-right font-mono">+ {won(careFee)}</td>
                </tr>
              )}
              <tr>
                <td className="border border-line px-3 py-2" colSpan={3}>부가세 (VAT 10%)</td>
                <td className="border border-line px-3 py-2 text-right font-mono">+ {won(vat)}</td>
              </tr>
              <tr className="bg-[#F4F6F9]">
                <td className="border border-line px-3 py-2.5 font-bold" colSpan={3}>합계 (VAT 포함)</td>
                <td className="border border-line px-3 py-2.5 text-right font-mono font-bold text-[15px]">{won(total)}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-[12px] text-muted mt-3">* 구성품은 장비에 따라 자동 표기됩니다. 대여 여부 체크 ( )는 현장에서 확인합니다.</p>
          <div className="mt-8 pt-4 border-t border-line flex items-center justify-between text-[12px] text-muted">
            <span>{COMPANY.name} · {COMPANY.tel} · {COMPANY.email}</span>
            <span>계좌 {COMPANY.bank} {COMPANY.account} ({COMPANY.accountHolder})</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
