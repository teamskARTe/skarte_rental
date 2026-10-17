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

  // 장비 표: 항목 + 빈 줄 채움 (최소 15줄 — 양식과 동일)
  const ROWS_MIN = 15;
  const blankRows = Math.max(0, ROWS_MIN - items.length);

  // 핵심 계약사항 (7개 조항 + 전문 약관 적용 안내) — 2열 × 4행으로 표시
  const TERMS = [
    ['01 장비 인수·관리', '출고 전 구성품·외관·작동 상태를 확인합니다. 대여 중 고객 귀책으로 발생한 파손·분실은 실제 수리비 또는 합리적인 손해액을 배상합니다.'],
    ['02 신원 확인·금지행위', '정확한 신원과 연락처를 제공해야 합니다. 장비의 무단 양도·재대여·판매·전당·담보 제공·임의 처분을 금지합니다.'],
    ['03 예약금·대여료', '예약금 100,000원은 정상 반납 및 정산 후 반환하며, 미납금·손해액 등이 있으면 적법한 범위에서 정산할 수 있습니다.'],
    ['04 반납·연장·연체료', '약정 시각까지 반납하며 연장은 사전 승인·결제가 필요합니다. 미승인 지연의 연체료는 할인 전 대여료를 기준으로 산정합니다.'],
    ['05 지연 시 법적 대응', '무단 반납 지연 6시간 초과 시 내용증명 작성·발송 및 반환을 요구할 수 있습니다. 24시간 초과 시 사실관계에 따라 형사 고소 및 금전채권 지급명령을 신청할 수 있습니다.'],
    ['06 위치추적·회수', '장비 보호 및 도난·분실 예방을 위해 일부 장비 가방에 위치추적장치를 운영할 수 있습니다. 관련 법령에 따라 고지·동의 및 필요한 범위에서만 위치정보를 이용합니다.'],
    ['07 계약 위반 사실 고지', '중대한 계약 위반이 발생한 경우 관계 법령을 준수하고 개인 식별이 불가능한 범위에서 객관적 사실을 사업장 내부에만 공지할 수 있습니다.'],
    ['전문 약관의 적용', '본 요약은 주요 사항 안내이며, 별도로 제공되는 「장비대여 계약사항 전문」 제1조~제15조가 계약의 일부를 구성합니다. 상충 시 관계 법령과 개별 합의에 따릅니다.'],
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
          <div className="flex gap-2 items-stretch mb-4">
            {/* 장비 표 (좌) */}
            <table className="flex-1 min-w-0 w-full table-fixed border border-line border-collapse break-words self-start">
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

            {/* 직원 작성란 (우) */}
            <div className="w-[248px] shrink-0 border border-line text-[9.5px]">
              <div className="bg-ink text-bg text-center font-bold py-1.5 text-[10.5px] tracking-wider">직원 작성란 <span className="font-mono text-[8.5px]">STAFF ONLY</span></div>

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
              <div className="px-2 py-[5px] border-b border-line text-[8.5px]">
                <Chk label="수량·구성품"/><Chk label="외관"/><Chk label="작동"/><Chk label="메모리/포맷"/><Chk label="테스트 촬영·재생"/>
              </div>

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
              <textarea rows={3} className="w-full px-2 py-1.5 outline-none bg-transparent resize-none text-[9.5px]"/>
            </div>
          </div>

          {/* 핵심 계약사항 */}
          <div className="font-bold text-[12px] mb-1">핵심 계약사항 <span className="font-normal text-muted text-[9px]">※ 계약 전 전문 15개 조항 제공·열람 및 주요 내용 설명</span></div>
          <table className="w-full border border-line border-collapse mb-3 text-[8.5px] leading-[1.5]">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {[TERMS[i*2], TERMS[i*2+1]].map(([t, d], j) => (
                    <td key={j} className="border border-line px-2 py-1.5 w-1/2 align-top">
                      <span className="block font-bold text-[9px] mb-0.5">{t}</span>
                      {d}
                    </td>
                  ))}
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
            <div className="px-3 py-2.5 border-b border-line flex items-center gap-3">
              <div className="flex-1 min-w-0 leading-relaxed">
                본인은 장비 및 구성품을 인수 전 확인하고, 별도 「장비대여 계약사항 전문」(제1조~제15조)을 계약 전에
                제공받거나 열람할 기회를 부여받았으며, 주요 내용을 설명받고 본 계약의 일부로 적용됨에 동의합니다.
                <span className="block mt-1"><Fill w="130px" def={todayFill} center/></span>
              </div>
              {/* 동의 따라쓰기 박스 — 연한 글씨 위에 고객이 직접 따라 씁니다 */}
              <div className="w-[110px] h-[56px] shrink-0 border border-line flex items-center justify-center">
                <span className="text-[16px] font-bold tracking-[0.15em] text-ink opacity-[0.13] select-none">동의합니다</span>
              </div>
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
