import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { branchName } from '../../data/defaults';
import { calcPriceFor, won } from '../../lib/format';

// 접수(order)를 기반으로 장비대여계약서(skARTe 양식)를 만듭니다.
// 고객 정보·장비 목록·일시·지점·금액(정상/할인/최종)은 접수에서 자동 연동되고,
// 담당자·가방 수·결제방식·서명 등 현장 기재 항목은 저장되지 않는 입력칸으로 두어
// 화면에서 채운 뒤 바로 인쇄합니다. (민감정보 DB 미저장)
export function ContractModal({ order, equipment, sets = [], onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const fmtDT = (iso, time) => {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getFullYear()} . ${String(d.getMonth()+1).padStart(2,'0')} . ${String(d.getDate()).padStart(2,'0')}${time ? `  ${time}` : ''}`;
  };

  const gearInfo = (it) => {
    const e = equipment.find(x => x.id === it.id);
    if (e) return { name: e.name, price: it.price ?? e.price ?? 0, parts: e.specs || [] };
    const s = (sets || []).find(x => x.id === it.id);
    if (s) return { name: `[세트] ${s.name}`, price: it.price ?? s.price ?? 0, parts: s.items ? [s.items] : [] };
    return { name: it.name || it.id, price: it.price ?? 0, parts: [] };
  };

  const items = (order.items || []).map((it) => {
    const g = gearInfo(it);
    const days = parseInt(it.days) || 0;
    const qty = parseInt(it.qty) || 0;
    return { name: g.name, parts: g.parts, days, qty, price: g.price };
  });

  // ── 금액 (접수 연동 · 자동 기입) ──
  const listSum = items.reduce((s, r) => s + r.price * r.days * r.qty, 0);                       // 정상금액 (할인 전)
  const rentSum = items.reduce((s, r) => s + calcPriceFor(r.price, r.days, order.noPeriodDisc) * r.qty, 0);
  const periodSaved = Math.max(0, listSum - rentSum);                                            // 기간할인
  const couponSaved = order.couponSaved || 0;
  const extraSaved = order.extraSaved || 0;
  const rental = Math.max(0, rentSum - couponSaved - extraSaved);
  const vat = Math.round(rental * 0.1);
  const total = rental + vat;                                                                    // 최종금액 (VAT 포함)
  const discountTotal = periodSaved + couponSaved + extraSaved;
  const discountParts = [
    periodSaved > 0 && `기간할인 -${won(periodSaved)}`,
    couponSaved > 0 && `쿠폰${order.couponLabel ? `(${order.couponLabel})` : ''} -${won(couponSaved)}`,
    extraSaved > 0 && `추가할인${order.extraRate ? `(-${order.extraRate}%)` : ''} -${won(extraSaved)}`,
  ].filter(Boolean).join(' · ');

  const print = () => {
    // PDF 저장 시 파일명이 "(날짜) 000님 계약서"가 되도록 문서 제목을 잠시 바꿉니다.
    const now = new Date();
    const ds = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
    const prevTitle = document.title;
    document.title = `(${ds}) ${order.name ? `${order.name}님 ` : ''}계약서 #${order.refNo || order.id}`;
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); document.title = prevTitle; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 30);
    setTimeout(done, 1500);
  };

  // 밑줄형 입력칸 (저장 안 됨 · 인쇄에 값 그대로 출력)
  // 비어 있으면 fill-empty 클래스가 붙어 인쇄 시 밑줄이 보이지 않습니다.
  const Fill = ({ w = 'auto', ph = '', def = '', center }) => (
    <input defaultValue={def} placeholder={ph}
      onInput={e => e.target.classList.toggle('fill-empty', e.target.value === '')}
      className={`inline-block border-0 border-b border-line focus:border-ink outline-none bg-transparent px-1 py-0 text-inherit ${def ? '' : 'fill-empty'} ${center ? 'text-center' : ''}`}
      style={{ width: w, fontSize: 'inherit' }}/>
  );
  const Chk = ({ label }) => (
    <label className="inline-flex items-center gap-1 mr-2 whitespace-nowrap">
      <input type="checkbox" className="w-2.5 h-2.5"/><span>{label}</span>
    </label>
  );

  // 직원 작성란 한 줄 (라벨 + 값)
  const SRow = ({ label, children }) => (
    <div className="flex border-b border-line last:border-b-0">
      <div className="w-[74px] shrink-0 bg-[#F4F6F9] px-2 py-[5px] text-muted border-r border-line">{label}</div>
      <div className="flex-1 px-2 py-[5px] min-w-0">{children}</div>
    </div>
  );

  const today = new Date();
  const todayFill = `${today.getFullYear()} . ${String(today.getMonth()+1).padStart(2,'0')} . ${String(today.getDate()).padStart(2,'0')}`;

  // 장비 표: 항목 + 빈 줄 채움 (최소 6줄 — 한 장 인쇄에 맞춤)
  const ROWS_MIN = 6;
  const blankRows = Math.max(0, ROWS_MIN - items.length);

  // 대여 약관 요약 (10개 항목)
  const TERMS = [
    ['1. 인수·사전 테스트', '출고 전 외관·구성품·작동 및 필요한 기록·재생을 확인하고 이상은 즉시 고지·기록합니다.'],
    ['2. 사용·호환성', '사용법·설정·호환성은 대여자 책임이며 사용 미숙·설정 오류로 인한 결과는 책임지지 않습니다.'],
    ['3. 메모리·데이터', '기록매체 확인은 대여자 책임이며 기록 실패·파일 유실·재촬영 등 간접손해는 책임지지 않습니다.'],
    ['4. 관리·고위험 환경', '레이저·강광원·우천·침수·모래·분진·염분 등으로 인한 손상은 대여자 책임입니다.'],
    ['5. 파손·분실·도난', '귀책 파손은 수리비, 전손·분실은 시가·상태·대체비용을 고려한 합리적 손해액을 배상합니다.'],
    ['6. 사고 발생 시', '이상·사고 시 즉시 사용을 중단하고 연락하며 계속 사용하여 확대된 손해는 대여자 책임입니다.'],
    ['7. 반납·연장·지연', '사전 고지·승인 없이 예정 반납시각을 6시간 초과하면 장비 미반납으로 간주하며, 회수 및 필요 시 고소·고발 등 민·형사상 조치를 취할 수 있습니다.'],
    ['8. 재대여·무단조치', '제3자 재대여·양도·담보 및 승인 없는 분해·개조·수리를 금지합니다.'],
    ['9. 출고불가 시', '불가피한 고장·사고 시 동급 대체장비 제공 또는 미제공 장비 대여료 환불을 원칙으로 합니다.'],
    ['10. 기타', '예약·취소·환불·퀵 운송 등은 스케아트 렌탈 운영정책·별도 합의 및 관계 법령에 따릅니다.'],
  ];

  return createPortal(
    <div className="quote-overlay fixed inset-0 z-[80] bg-black/40 overflow-y-auto p-0 md:p-6 flex justify-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full md:max-w-[900px] my-0 md:my-4">
        {/* 툴바 (인쇄 제외) */}
        <div className="no-print flex items-center justify-between gap-3 bg-ink text-bg px-5 py-3 sticky top-0 z-10">
          <span className="text-[14px] font-bold">계약서 · #{order.refNo || order.id}</span>
          <div className="flex items-center gap-2">
            <button onClick={print} className="bg-bg text-ink px-4 py-2 text-[13px] hover-lift">인쇄 / PDF 저장</button>
            <button onClick={onClose} className="border border-bg/40 px-3 py-2 text-[13px]">닫기</button>
          </div>
        </div>
        <div className="no-print bg-[#FFF7E6] text-[12px] text-ink/70 px-5 py-2 border-b border-line">
          ⚠️ 담당자·결제방식·서명 등 직접 입력한 값은 <b>저장되지 않습니다</b>. 이 화면에서 입력 후 바로 인쇄해 주세요. 금액·일시·지점은 접수 내용에서 자동 기입됩니다.
        </div>

        {/* 문서 */}
        <div className="quote-doc bg-white text-ink px-6 md:px-9 py-7 text-[11px] leading-snug">
          {/* 헤더 */}
          <div className="flex items-start justify-between pb-2.5 border-b-2 border-ink mb-3">
            <div>
              <div className="font-display font-bold text-[26px] leading-none tracking-tight">skARTe</div>
              <div className="font-mono text-[9px] tracking-[0.35em] mt-0.5">RENTAL</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-[22px] leading-none">장비대여계약서</div>
              <div className="font-mono text-[8.5px] tracking-widest text-muted mt-1">EQUIPMENT RENTAL AGREEMENT</div>
            </div>
            <div className="text-right font-mono text-[9px] text-muted pt-1">접수번호<br/><span className="text-ink text-[12px] font-bold">#{order.refNo || order.id}</span></div>
          </div>

          {/* 계약자 / 고객 작성 */}
          <div className="font-bold text-[12px] mb-1">계약자 / 고객 작성</div>
          <table className="w-full border border-line border-collapse mb-3">
            <tbody>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px] w-[84px]">접수번호</td>
                <td className="border border-line px-2 py-[5px] font-mono">#{order.refNo || order.id}</td>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px] w-[84px]">계약일</td>
                <td className="border border-line px-2 py-[5px]"><Fill w="140px" def={todayFill} center/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">고객구분</td>
                <td className="border border-line px-2 py-[5px]"><Chk label="개인"/><Chk label="개인사업자"/><Chk label="법인"/></td>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">성명 / 상호</td>
                <td className="border border-line px-2 py-[5px]">{order.name || <Fill w="80%"/>}</td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">연락처</td>
                <td className="border border-line px-2 py-[5px]">{order.contact || <Fill w="80%"/>}</td>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">사업자번호</td>
                <td className="border border-line px-2 py-[5px]"><Fill w="80%"/></td>
              </tr>
              <tr>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">주소</td>
                <td className="border border-line px-2 py-[5px]"><Fill w="90%"/></td>
                <td className="border border-line bg-[#F4F6F9] text-muted px-2 py-[5px]">이메일</td>
                <td className="border border-line px-2 py-[5px]"><Fill w="80%"/></td>
              </tr>
            </tbody>
          </table>

          {/* 대여 장비 / 직원 관리 */}
          <div className="font-bold text-[12px] mb-1">대여 장비 / 직원 관리</div>
          {/* 장비 표 (전체 폭) — 아래 직원 작성란과 상하 배치해 한 장 인쇄에 맞춥니다 */}
          <table className="w-full table-fixed border border-line border-collapse break-words mb-2">
              <thead>
                <tr className="bg-[#F4F6F9] text-muted">
                  <th className="border border-line px-1.5 py-1 w-8 font-normal">No.</th>
                  <th className="border border-line px-1.5 py-1 text-left font-normal">장비명 / 모델명</th>
                  <th className="border border-line px-1 py-1 w-[46px] font-normal whitespace-nowrap text-[8px]">S/N·관리번호</th>
                  <th className="border border-line px-1.5 py-1 w-9 font-normal">수량</th>
                  <th className="border border-line px-1.5 py-1 text-left w-[140px] font-normal">구성품</th>
                  <th className="border border-line px-1.5 py-1 w-[64px] font-normal">비고</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr key={i}>
                    <td className="border border-line px-1.5 py-1 text-center font-mono">{i+1}</td>
                    <td className="border border-line px-1.5 py-1">
                      {r.name}
                      <span className="block text-[8.5px] text-muted">{r.days}일 대여</span>
                    </td>
                    <td className="border border-line px-1 py-1"><Fill w="95%" center/></td>
                    <td className="border border-line px-1.5 py-1 text-center font-mono">{r.qty}</td>
                    <td className="border border-line px-1.5 py-1 text-[8.5px] leading-[1.5]">
                      {r.parts.length === 0 ? <span className="text-muted">—</span>
                        : r.parts.map((p, j) => (
                          <label key={j} className="flex items-center gap-1">
                            <input type="checkbox" className="w-2 h-2"/><span>{p}</span>
                          </label>
                        ))}
                    </td>
                    <td className="border border-line px-1 py-1"><Fill w="95%"/></td>
                  </tr>
                ))}
                {Array.from({ length: blankRows }).map((_, i) => (
                  <tr key={`b${i}`}>
                    <td className="border border-line px-1.5 py-1 text-center font-mono text-muted">{items.length + i + 1}</td>
                    <td className="border border-line px-1 py-1"><Fill w="95%"/></td>
                    <td className="border border-line px-1 py-1"><Fill w="95%" center/></td>
                    <td className="border border-line px-1 py-1"><Fill w="90%" center/></td>
                    <td className="border border-line px-1 py-1"><Fill w="95%"/></td>
                    <td className="border border-line px-1 py-1"><Fill w="95%"/></td>
                  </tr>
                ))}
              </tbody>
            </table>

          {/* 직원 작성란 — 렌탈/반납 확인을 좌우 2단으로 배치 (세로 길이 절반) */}
          <div className="border border-line text-[9.5px] mb-4">
            <div className="bg-ink text-bg text-center font-bold py-1 text-[10.5px] tracking-wider">직원 작성란 <span className="font-mono text-[8.5px]">STAFF ONLY</span></div>
            <div className="grid grid-cols-2">
              {/* 렌탈 시 확인 */}
              <div className="border-r border-line">
                <div className="bg-[#EDEFF3] px-2 py-1 font-bold border-b border-line">렌탈 시 확인</div>
                <SRow label="렌탈 일시">{order.startDate ? <span className="font-mono">{fmtDT(order.startDate, order.startTime)}</span> : <Fill w="95%"/>}</SRow>
                <SRow label="렌탈 담당자"><Fill w="95%"/></SRow>
                <SRow label="렌탈 지점">{order.pickupBranch ? branchName(order.pickupBranch) : <Fill w="95%"/>}</SRow>
                <SRow label="출고 가방"><Fill w="42px" center/> 개</SRow>
                <SRow label="예약금">100,000원 <label className="inline-flex items-center gap-1 ml-1"><input type="checkbox" className="w-2.5 h-2.5"/>확인</label></SRow>
                <SRow label="정상금액"><span className="font-mono font-bold">{won(listSum)}</span></SRow>
                <SRow label="할인">
                  {discountTotal > 0 ? (
                    <>
                      <span className="font-mono font-bold">- {won(discountTotal)}</span>
                      <span className="block text-[8px] text-muted leading-tight">{discountParts}</span>
                    </>
                  ) : <>종류 <Fill w="52px"/> <Fill w="30px" center/>% / <Fill w="52px" center/>원</>}
                </SRow>
                <SRow label="최종금액"><span className="font-mono font-bold">{won(total)}</span> <span className="text-[8px] text-muted">(VAT 포함 · 부가세 {won(vat)})</span></SRow>
                <SRow label="결제방식"><Chk label="카드"/><Chk label="현금"/><Chk label="계좌이체"/></SRow>
                <SRow label="증빙"><Chk label="현금영수증"/><Chk label="세금계산서"/><Chk label="없음"/></SRow>
                <div className="px-2 py-[5px] text-[8.5px]">
                  <Chk label="수량·구성품"/><Chk label="외관"/><Chk label="작동"/><Chk label="메모리/포맷"/><Chk label="테스트 촬영·재생"/>
                </div>
              </div>
              {/* 반납 시 확인 + 특이사항 */}
              <div>
                <div className="bg-[#EDEFF3] px-2 py-1 font-bold border-b border-line">반납 시 확인</div>
                <SRow label="반납 예정">{order.returnDate ? <span className="font-mono">{fmtDT(order.returnDate, order.returnTime)}</span> : <Fill w="95%"/>}</SRow>
                <SRow label="실제 반납"><Fill w="95%" ph="20    .    .        :"/></SRow>
                <SRow label="반납 담당자"><Fill w="95%"/></SRow>
                <SRow label="반납 지점">{order.returnBranch ? branchName(order.returnBranch) : <Fill w="95%"/>}</SRow>
                <SRow label="반납 가방"><Fill w="42px" center/> 개</SRow>
                <SRow label="추가금액"><Fill w="70%" center/> 원</SRow>
                <SRow label="반납 계좌">은행 <Fill w="52px"/> / 계좌 <Fill w="110px"/></SRow>
                <SRow label="예금주"><Fill w="95%"/></SRow>
                <div className="px-2 py-[5px] border-b border-line text-[8.5px]">
                  <Chk label="수량·구성품"/><Chk label="외관"/><Chk label="작동"/><Chk label="메모리"/><Chk label="가방"/><Chk label="이상 유무"/>
                </div>
                <div className="bg-[#EDEFF3] px-2 py-1 font-bold border-b border-line">특이사항 (직원 기재)</div>
                <textarea rows={2} className="w-full px-2 py-1 outline-none bg-transparent resize-none text-[9.5px]"/>
              </div>
            </div>
          </div>

          {/* 대여 약관 */}
          <div className="font-bold text-[12px] mb-1">대여 약관 <span className="font-normal text-muted text-[9px]">※ 주요 내용 요약</span></div>
          <table className="w-full border border-line border-collapse mb-3 text-[8.5px] leading-[1.5]">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-line px-2 py-1 w-1/2 align-top"><b>{TERMS[i][0]}</b> {TERMS[i][1]}</td>
                  <td className="border border-line px-2 py-1 w-1/2 align-top"><b>{TERMS[i+5][0]}</b> {TERMS[i+5][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 계약자 인수 확인 및 서명 */}
          <div className="font-bold text-[12px] mb-1">계약자 인수 확인 및 서명 / 고객 작성</div>
          <div className="border border-line">
            <div className="px-3 py-2 border-b border-line text-center text-[9.5px]">
              인수 전 체크&nbsp;&nbsp;<Chk label="구성품 확인"/><Chk label="외관 상태"/><Chk label="작동 상태"/><Chk label="메모리·포맷"/><Chk label="테스트 촬영·재생"/>
            </div>
            <div className="px-3 py-2.5 border-b border-line text-center">
              본인은 위 장비의 상태와 대여 약관을 확인하고 장비를 인수하였습니다.&nbsp;&nbsp;<Fill w="130px" def={todayFill} center/>
            </div>
            <div className="px-3 py-2.5 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
              <span>고객 성명 <Fill w="150px" def={order.name || ''}/> <span className="text-muted">(서명)</span></span>
              <span>직원 확인 <Fill w="150px"/> <span className="text-muted">(서명)</span></span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-line flex items-center justify-between font-mono text-[8.5px] text-muted">
            <span className="font-bold text-ink">skARTe RENTAL</span>
            <span>CAMERA · LENS · LIGHTING · AUDIO · GRIP</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
