import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { COMPANY, branchName } from '../../data/defaults';
import { calcPrice, won } from '../../lib/format';

// 접수(order)를 기반으로 임대차계약서를 만듭니다.
// 견적서와 동일한 자동 연동 + 계약 전용 항목(담당자·계약자·주민번호·계좌·서명 등)은
// 저장하지 않는 입력칸으로 두어, 현장에서 채워 인쇄만 합니다. (민감정보 DB 미저장)
export function ContractModal({ order, equipment, sets = [], onClose }) {
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
    return { idx: idx + 1, name: g.name, parts: g.parts, days, qty, amount: calcPrice(g.price, days) * qty };
  });

  const rentSum = rows.reduce((s, r) => s + r.amount, 0);
  const couponSaved = order.couponSaved || 0;
  const rentalTotal = Math.max(0, rentSum - couponSaved);
  const careFee = order.careFee || 0;
  const vat = order.vat != null ? order.vat : Math.round((rentalTotal + careFee) * 0.1);
  const total = order.total != null ? order.total : rentalTotal + careFee + vat;

  const print = () => {
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 30);
    setTimeout(done, 1500);
  };

  // 밑줄형 입력칸 (저장 안 됨 · 인쇄에 값 그대로 출력)
  const Fill = ({ w = 'auto', ph = '', def = '', center }) => (
    <input defaultValue={def} placeholder={ph}
      className={`inline-block border-0 border-b border-line focus:border-ink outline-none bg-transparent text-[13px] px-1 py-0.5 ${center ? 'text-center' : ''}`}
      style={{ width: w }}/>
  );

  return createPortal(
    <div className="quote-overlay fixed inset-0 z-[80] bg-black/40 overflow-y-auto p-0 md:p-6 flex justify-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full md:max-w-[820px] my-0 md:my-4">
        {/* 툴바 (인쇄 제외) */}
        <div className="no-print flex items-center justify-between gap-3 bg-ink text-bg px-5 py-3 sticky top-0 z-10">
          <span className="text-[14px] font-bold">계약서 · #{order.refNo || order.id}</span>
          <div className="flex items-center gap-2">
            <button onClick={print} className="bg-bg text-ink px-4 py-2 text-[13px] hover-lift">인쇄 / PDF 저장</button>
            <button onClick={onClose} className="border border-bg/40 px-3 py-2 text-[13px]">닫기</button>
          </div>
        </div>
        <div className="no-print bg-[#FFF7E6] text-[12px] text-ink/70 px-5 py-2 border-b border-line">
          ⚠️ 주민번호·계좌 등 직접 입력한 값은 <b>저장되지 않습니다</b>. 이 화면에서 입력 후 바로 인쇄해 주세요.
        </div>

        {/* 문서 */}
        <div className="quote-doc bg-white text-ink px-7 md:px-10 py-9">
          <div className="flex items-end justify-between border-b-2 border-ink pb-4 mb-6">
            <h1 className="font-display font-bold text-3xl leading-none">임대차계약서</h1>
            <div className="text-right text-[12px] text-muted font-mono">접수번호 #{order.refNo || order.id}</div>
          </div>

          {/* 임대인 */}
          <div className="font-bold text-[14px] mb-1.5">임대인</div>
          <table className="w-full border border-line border-collapse mb-5 text-[13px]">
            <tbody>
              <tr><td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2 w-28">상호명</td><td className="border border-line px-3 py-2">{COMPANY.name}</td></tr>
              <tr><td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">대표</td><td className="border border-line px-3 py-2">{COMPANY.ceo}</td></tr>
              <tr><td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">사업자번호</td><td className="border border-line px-3 py-2">{COMPANY.bizNo}</td></tr>
              <tr><td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">주소</td><td className="border border-line px-3 py-2">{COMPANY.address} {COMPANY.addressDetail}</td></tr>
              <tr><td className="border border-line bg-[#FFF7E6] text-muted px-3 py-2">담당자</td><td className="border border-line px-3 py-2"><Fill w="60%" ph="담당자명"/></td></tr>
            </tbody>
          </table>

          {/* 임차인 — 예약자(자동) / 계약자(직접) */}
          <div className="font-bold text-[14px] mb-1.5">임차인</div>
          <table className="w-full border border-line border-collapse mb-6 text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 w-28"></th>
                <th className="border border-line px-3 py-2 text-left">예약자 (자동)</th>
                <th className="border border-line px-3 py-2 text-left bg-[#FFF7E6]">계약자 (직접 입력)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">성함(상호)</td>
                <td className="border border-line px-3 py-2">{order.name || '—'}</td>
                <td className="border border-line px-3 py-2"><Fill w="90%" ph="예약자와 다르면 입력"/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">연락처</td>
                <td className="border border-line px-3 py-2">{order.contact || '—'}</td>
                <td className="border border-line px-3 py-2"><Fill w="90%"/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">주민번호</td>
                <td className="border border-line px-3 py-2 text-muted">—</td>
                <td className="border border-line px-3 py-2"><Fill w="90%" ph="______-_______"/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">주소</td>
                <td className="border border-line px-3 py-2 text-muted">—</td>
                <td className="border border-line px-3 py-2"><Fill w="90%"/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">계좌번호<span className="block text-[11px]">(예약금 환불용)</span></td>
                <td className="border border-line px-3 py-2 text-muted">—</td>
                <td className="border border-line px-3 py-2"><Fill w="90%" ph="은행 / 계좌번호 / 예금주"/></td>
              </tr>
            </tbody>
          </table>

          {/* 렌탈 일정·지점 */}
          <div className="font-bold text-[14px] mb-1.5">렌탈</div>
          <table className="w-full border border-line border-collapse mb-5 text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 text-left w-20"></th>
                <th className="border border-line px-3 py-2 text-left">일정</th>
                <th className="border border-line px-3 py-2 text-left w-28">지점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">렌탈</td>
                <td className="border border-line px-3 py-2 font-mono">{fmtDateTime(order.startDate, order.startTime)}</td>
                <td className="border border-line px-3 py-2">{order.pickupBranch ? branchName(order.pickupBranch) : '—'}</td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-3 py-2">반납</td>
                <td className="border border-line px-3 py-2 font-mono">{fmtDateTime(order.returnDate, order.returnTime)}</td>
                <td className="border border-line px-3 py-2">{order.returnBranch ? branchName(order.returnBranch) : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* 장비 표 (구성품 대여여부 체크 + 기타) */}
          <table className="w-full border border-line border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 w-12 text-left">번호</th>
                <th className="border border-line px-3 py-2 text-left">장비명</th>
                <th className="border border-line px-3 py-2 text-left">구성품(대여 여부)</th>
                <th className="border border-line px-3 py-2 text-left w-24">기타</th>
                <th className="border border-line px-3 py-2 w-24 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.idx}>
                  <td className="border border-line px-3 py-2 align-top font-mono">{String(r.idx).padStart(2,'0')}</td>
                  <td className="border border-line px-3 py-2 align-top">{r.name}<span className="block text-[12px] text-muted">{r.days}일 × {r.qty}대</span></td>
                  <td className="border border-line px-3 py-2 align-top text-[12px]">
                    {r.parts.length === 0 ? <span className="text-muted">—</span>
                      : r.parts.map((p, i) => (
                        <label key={i} className="flex items-center gap-1.5">
                          <input type="checkbox" className="w-3.5 h-3.5"/>
                          <span>{String(i+1).padStart(2,'0')} {p}</span>
                        </label>
                      ))}
                  </td>
                  <td className="border border-line px-3 py-2 align-top"><Fill w="90%"/></td>
                  <td className="border border-line px-3 py-2 align-top text-right font-mono">{won(r.amount)}</td>
                </tr>
              ))}
              {couponSaved > 0 && (
                <tr>
                  <td className="border border-line px-3 py-2" colSpan={3}>쿠폰 <span className="text-muted">{order.couponLabel || '적용'}</span></td>
                  <td className="border border-line px-3 py-2"></td>
                  <td className="border border-line px-3 py-2 text-right font-mono">- {won(couponSaved)}</td>
                </tr>
              )}
              <tr>
                <td className="border border-line px-3 py-2 font-bold" colSpan={4}>렌탈료 합계</td>
                <td className="border border-line px-3 py-2 text-right font-mono font-bold">{won(rentalTotal)}</td>
              </tr>
              {careFee > 0 && (
                <tr>
                  <td className="border border-line px-3 py-2" colSpan={4}>안심케어 <span className="text-muted">(+20%)</span></td>
                  <td className="border border-line px-3 py-2 text-right font-mono">+ {won(careFee)}</td>
                </tr>
              )}
              <tr>
                <td className="border border-line px-3 py-2" colSpan={4}>부가세 (VAT 10%)</td>
                <td className="border border-line px-3 py-2 text-right font-mono">+ {won(vat)}</td>
              </tr>
              <tr className="bg-[#F4F6F9]">
                <td className="border border-line px-3 py-2.5 font-bold" colSpan={4}>합계 (VAT 포함)</td>
                <td className="border border-line px-3 py-2.5 text-right font-mono font-bold text-[15px]">{won(total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[12px] text-muted mt-2">* 구성품은 장비에 따라 자동 표기되며, 대여 여부 체크는 현장에서 확인합니다.</p>

          {/* 부가 품목 */}
          <div className="font-bold text-[14px] mt-6 mb-1.5">부가 품목</div>
          <table className="w-full border border-line border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F4F6F9] text-muted">
                <th className="border border-line px-3 py-2 w-12">✓</th>
                <th className="border border-line px-3 py-2 text-left w-40">품목</th>
                <th className="border border-line px-3 py-2 text-left">상세</th>
              </tr>
            </thead>
            <tbody>
              {['가방/케이스', '라인', ''].map((label, i) => (
                <tr key={i}>
                  <td className="border border-line px-3 py-2 text-center"><input type="checkbox" className="w-3.5 h-3.5"/></td>
                  <td className="border border-line px-3 py-2">{label || <Fill w="90%" ph="품목"/>}</td>
                  <td className="border border-line px-3 py-2"><Fill w="95%"/></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 메모 · 서명 */}
          <div className="mt-6">
            <div className="font-bold text-[14px] mb-1.5">메모</div>
            <textarea rows={2} className="w-full border border-line focus:border-ink outline-none bg-transparent text-[13px] px-3 py-2 resize-none"/>
          </div>

          <div className="mt-6 space-y-2 text-[14px]">
            <div>계약서 발행일 : <Fill w="180px" def={order.date || ''}/></div>
            <div>결제 금액 : <Fill w="180px" def={won(total)}/></div>
            <div className="pt-3">계약일자 : 20<Fill w="42px" center/>년 <Fill w="42px" center/>월 <Fill w="42px" center/>일</div>
            <div className="pt-2 flex items-center gap-2">임차인 : <Fill w="200px"/> <span className="text-muted text-[13px]">(서명 또는 인)</span></div>
          </div>

          <div className="mt-8 pt-4 border-t border-line flex items-center justify-between text-[12px] text-muted">
            <span>{COMPANY.name} · {COMPANY.tel} · {COMPANY.email}</span>
            <span>{COMPANY.address} {COMPANY.addressDetail}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
