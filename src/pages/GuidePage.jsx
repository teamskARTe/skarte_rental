import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';

export function GuidePage({ setPage }) {
  const steps = [
    { n:'01', t:'문의', d:'카카오톡으로 원하시는 장비와 대여 일정을 보내주세요. 장바구니에 담아 한 번에 문의하면 더 편리합니다.' },
    { n:'02', t:'견적·확인', d:'재고를 확인한 뒤 견적과 입금 계좌를 안내드립니다.' },
    { n:'03', t:'입금·확정', d:'입금이 확인되는 시점에 예약이 확정됩니다.' },
    { n:'04', t:'수령', d:'인천 지점 방문 또는 택배 수령 중 선택하세요.' },
    { n:'05', t:'반납', d:'대여 종료일에 방문 또는 택배로 반납합니다. 정상 반납 시 보증금은 전액 환불됩니다.' },
  ];
  const policies = [
    { t:'대여 요금', d:'일일 대여료가 기준이며, 3일 이상 10%, 7일 이상 20%가 자동 할인됩니다. 30일 이상 장기 대여는 별도 문의해 주세요.' },
    { t:'보증금', d:'장비 가격대에 따라 보증금이 책정되며, 파손 없이 정상 반납하면 전액 환불됩니다.' },
    { t:'준비물', d:'본인 확인용 신분증이 필요합니다. 사업자·팀 단위 대여는 카카오톡으로 별도 문의 바랍니다.' },
    { t:'파손·분실', d:'파손·분실 시 수리비 또는 동일 장비 시세에 준하는 금액이 청구됩니다. 촬영 전 보험 가입을 권장합니다.' },
  ];
  const faqs = [
    { q:'대여 가능한 기간은 어떻게 되나요?', a:'최소 1일부터 가능하며, 장기 대여 시 별도 할인이 적용됩니다. 3일 이상 10%, 7일 이상 20%, 30일 이상은 카카오톡으로 문의 부탁드립니다.' },
    { q:'예약은 어떻게 진행되나요?', a:'카카오톡으로 원하시는 장비와 일정을 알려주시면, 재고 확인 후 견적과 계좌번호를 안내드립니다. 입금 확인이 완료된 시점에 예약이 확정됩니다.' },
    { q:'수령과 반납 방법은요?', a:'스튜디오 방문 수령(인천 미추홀구 인하드림센터), 또는 택배 발송 중 선택 가능합니다. 인천·부천·김포 등 수도권 서부 지역은 방문 수령이 특히 편리하며, 택배의 경우 왕복 배송비가 별도로 청구됩니다.' },
    { q:'보증금이 따로 있나요?', a:'장비 가격대에 따라 보증금이 책정되며, 정상 반납 시 전액 환불됩니다. 자세한 금액은 문의 시 안내드립니다.' },
    { q:'파손이나 분실 시에는 어떻게 되나요?', a:'파손·분실 시 수리비 또는 동일 장비 시세에 준하는 금액을 청구해 드립니다. 작업 전 보험 가입을 권장드립니다.' },
    { q:'당일 대여도 가능한가요?', a:'재고 상황에 따라 가능합니다. 다만 안정적인 작업을 위해 최소 1-2일 전 예약을 권장드립니다.' },
  ];
  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1100px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 이용 안내</div>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-none mb-4">이용 가이드</h1>
      <p className="text-muted text-[15px] max-w-xl mb-16">
        스케아트는 카카오톡 문의 기반으로 운영됩니다. 처음이셔도 메시지 한 통이면 충분해요.
      </p>

      {/* 대여 절차 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 대여 절차</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-10">대여 절차</h2>
      <div className="border-t border-line mb-20">
        {steps.map(s => (
          <div key={s.n} className="border-b border-line py-6 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2 md:col-span-1 font-mono text-[13px] text-muted">{s.n}</div>
            <div className="col-span-10 md:col-span-3 font-display text-2xl md:text-3xl leading-none">{s.t}</div>
            <div className="col-span-12 md:col-span-8 text-[14px] text-muted leading-relaxed">{s.d}</div>
          </div>
        ))}
      </div>

      {/* 대여 정책 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 대여 정책</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-10">대여 정책</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line mb-20">
        {policies.map(p => (
          <div key={p.t} className="bg-bg p-6 md:p-8">
            <div className="font-display text-xl md:text-2xl mb-2">{p.t}</div>
            <div className="text-[14px] text-muted leading-relaxed">{p.d}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 자주 묻는 질문</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-10">자주 묻는 질문</h2>
      <div className="border-t border-line">
        {faqs.map((f, i) => (
          <details key={i} className="border-b border-line group">
            <summary className="py-6 px-3 -mx-3 cursor-pointer flex items-center justify-between gap-6 list-none transition-colors duration-300 hover:bg-[#F2F2F2]">
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-[12px] text-muted">{String(i+1).padStart(2,'0')}</span>
                <span className="font-display text-xl md:text-2xl">{f.q}</span>
              </span>
              <Ico.plus className="chev w-5 h-5 shrink-0"/>
            </summary>
            <div className="pb-6 pl-12 text-[14px] text-muted leading-relaxed max-w-2xl">{f.a}</div>
          </details>
        ))}
      </div>

      <div className="mt-20 border border-ink p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="font-display font-bold text-3xl md:text-5xl leading-none">방문 전 지점 정보를 확인하세요</div>
          <p className="text-muted mt-3 text-[14px]">위치·영업시간·오시는 길은 지점 정보 페이지에 정리되어 있어요.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setPage('location')}
            className="border border-ink px-6 py-4 text-[13px] hover-lift">지점 정보</button>
          <button onClick={() => openKakao('안녕하세요, 문의드립니다.')}
            className="bg-kakao text-ink px-6 py-4 text-[13px] inline-flex items-center gap-2 hover-lift">
            <Ico.chat className="w-4 h-4"/> 카카오톡 문의
          </button>
        </div>
      </div>
    </section>
  );
}
