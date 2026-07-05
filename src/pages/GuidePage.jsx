import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';

export function GuidePage({ setPage }) {
  const steps = [
    { n:'01', t:'장비 담기', d:'원하는 장비를 장바구니에 담고 대여 시작일·일수·수량을 선택하세요. 목록에 없는 장비는 "추가 장비 요청"으로 남길 수 있어요.' },
    { n:'02', t:'문의 접수', d:'성함·연락처를 입력하고 신청하면 접수번호(예: #1042)가 발급됩니다. 이 번호가 문의를 확인하는 열쇠예요.' },
    { n:'03', t:'카카오톡 전송', d:'접수 완료 화면에서 "카카오톡 채널로 보내기"를 누르면 접수번호와 문의 내용이 담긴 메시지가 준비됩니다. 채널로 전송해 주세요.' },
    { n:'04', t:'견적·확정', d:'재고 확인과 견적 안내 후, 예약금(10만원) 입금이 확인되는 시점에 예약이 확정되고 장비가 예약 일정에 등록됩니다.' },
    { n:'05', t:'수령·반납', d:'인천 지점에 방문해 수령하고, 대여 종료일에 방문 반납합니다. 무인 렌탈로 원하시는 시간에 픽업·반납하실 수 있어요. 정상 렌탈·반납 시 예약금은 전액 환불됩니다.' },
  ];
  const policies = [
    { t:'대여 요금', d:'일일 대여료가 기준이며, 3일 이상 10%, 7일 이상 20%가 자동 할인됩니다. 30일 이상 장기 대여는 별도 문의해 주세요.' },
    { t:'예약금', d:'예약 시 예약금 10만원을 입금하면 예약이 확정됩니다. 정상 렌탈·반납 시 예약금은 전액 환불됩니다.' },
    { t:'준비물', d:'본인 확인용 신분증이 필요합니다. 사업자·팀 단위 대여는 카카오톡으로 별도 문의 바랍니다.' },
    { t:'파손·분실', d:'파손·분실 시 수리비 또는 동일 장비 시세에 준하는 금액이 청구됩니다. 안심케어 가입을 권장드립니다.' },
  ];
  const faqs = [
    { q:'대여 가능한 기간은 어떻게 되나요?', a:'최소 1일부터 가능하며, 장기 대여 시 별도 할인이 적용됩니다. 3일 이상 10%, 7일 이상 20%, 30일 이상은 카카오톡으로 문의 부탁드립니다.' },
    { q:'예약은 어떻게 진행되나요?', a:'카카오톡으로 원하시는 장비와 일정을 알려주시면, 재고 확인 후 견적과 계좌번호를 안내드립니다. 예약금(10만원) 입금이 확인된 시점에 예약이 확정됩니다.' },
    { q:'수령과 반납 방법은요?', a:'스튜디오 방문 수령(인천 미추홀구 인하드림센터), 또는 택배 발송 중 선택 가능합니다. 인천·부천·김포 등 수도권 서부 지역은 방문 수령이 특히 편리하며, 택배의 경우 왕복 배송비가 별도로 청구됩니다.' },
    { q:'예약금이 있나요?', a:'예약 확정을 위해 예약금 10만원을 받습니다. 정상 렌탈·반납 시 예약금은 전액 환불됩니다.' },
    { q:'파손이나 분실 시에는 어떻게 되나요?', a:'파손·분실 시 수리비 또는 동일 장비 시세에 준하는 금액을 청구해 드립니다. 안심케어 가입을 권장드립니다.' },
    { q:'당일 대여도 가능한가요?', a:'재고 상황에 따라 가능합니다. 다만 안정적인 작업을 위해 최소 1-2일 전 예약을 권장드립니다.' },
    { q:'예약 취소 시 수수료가 있을까요?', a:'취소 시점에 따라 환불 비율이 달라집니다. 7일 전 전액 환불, 3~6일 전 50% 환불, 2일 전~당일은 환불이 불가합니다.' },
    { q:'접수번호를 잊어버렸어요.', a:'상단 메뉴의 "문의 조회"에서 문의하실 때 입력한 연락처를 넣으면 접수번호와 처리 상태를 다시 확인할 수 있어요. 그래도 어려우시면 카카오톡 채널에 성함과 연락처를 보내주시면 저희가 찾아 안내해 드립니다.' },
    { q:'문의하면 바로 예약이 확정되나요?', a:'문의 접수만으로는 예약이 확정되지 않습니다. 재고 확인과 견적 안내 후, 예약금(10만원) 입금이 확인되는 시점에 예약이 확정되고 장비가 예약 일정에 등록됩니다. 처리 상태는 "문의 조회"에서 확인하실 수 있어요.' },
  ];
  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1100px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 이용 안내</div>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-none mb-4">이용 가이드</h1>
      <p className="text-muted text-[15px] max-w-xl mb-16">
        스케아트 렌탈은 사이트에서 문의를 접수하고 카카오톡으로 안내해 드려요. 처음이셔도 아래 절차만 따라오시면 됩니다.
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

      {/* 접수번호 안내 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 접수번호 안내</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-6">접수번호란?</h2>
      <div className="bg-[#F7F7F7] border border-line p-6 md:p-10 mb-20">
        <p className="text-[15px] leading-relaxed mb-6">
          스케아트 렌탈은 카카오톡으로 최종 안내를 드려요. 카카오톡 대화만으로는 어떤 문의인지 확인이 어렵기 때문에,
          문의하실 때 발급되는 <span className="font-bold">접수번호</span>로 빠르고 정확하게 확인해 드립니다.
        </p>
        <div className="grid md:grid-cols-3 gap-px bg-line">
          <div className="bg-bg p-5">
            <div className="font-mono text-[12px] text-muted mb-2">STEP 1</div>
            <div className="font-display text-lg mb-1.5">접수번호 받기</div>
            <p className="text-[13px] text-muted leading-relaxed">문의를 신청하면 화면에 접수번호(#1042)가 표시돼요. "복사" 버튼으로 간편하게 복사하세요.</p>
          </div>
          <div className="bg-bg p-5">
            <div className="font-mono text-[12px] text-muted mb-2">STEP 2</div>
            <div className="font-display text-lg mb-1.5">카카오톡에 전송</div>
            <p className="text-[13px] text-muted leading-relaxed">카카오톡 채널에 접수번호와 성함·연락처를 보내주시면 담당자가 해당 문의를 바로 찾아 안내드려요.</p>
          </div>
          <div className="bg-bg p-5">
            <div className="font-mono text-[12px] text-muted mb-2">STEP 3</div>
            <div className="font-display text-lg mb-1.5">상태 조회</div>
            <p className="text-[13px] text-muted leading-relaxed">접수번호를 잊으셨어도 걱정 마세요. "문의 조회"에서 연락처만 입력하면 처리 상태를 확인할 수 있어요.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => setPage('lookup')}
            className="border border-ink px-5 py-3 text-[13px] hover-lift">내 문의 조회하기</button>
          <button onClick={() => setPage('extra')}
            className="border border-line hover:border-ink px-5 py-3 text-[13px] hover-lift">추가 장비 요청</button>
        </div>
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

      {/* 취소 / 반납 지연 규정 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 취소 · 반납 규정</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-8">취소 · 반납 지연 규정</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line mb-20">
        <div className="bg-bg p-6 md:p-8">
          <div className="font-display text-xl md:text-2xl mb-4">예약 취소 규정</div>
          <ul className="space-y-3">
            {[
              { t:'7일 전', v:'전액 환불' },
              { t:'3~6일 전', v:'50% 환불' },
              { t:'2일 전 ~ 당일', v:'환불 불가' },
            ].map(r => (
              <li key={r.t} className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="text-[14px] text-muted">{r.t}</span>
                <span className="text-[14px] font-bold">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-bg p-6 md:p-8">
          <div className="font-display text-xl md:text-2xl mb-4">반납 지연 규정</div>
          <ul className="space-y-3">
            {[
              { t:'1시간 이내', v:'무료 (사전 연락 시)' },
              { t:'1시간 초과 ~ 6시간', v:'1일 렌탈료의 50%' },
              { t:'6시간 초과', v:'1일 렌탈료 100%' },
            ].map(r => (
              <li key={r.t} className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="text-[14px] text-muted">{r.t}</span>
                <span className="text-[14px] font-bold">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 안심케어 서비스 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 안심케어</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-6">안심케어 서비스 안내</h2>
      <div className="bg-[#F7F7F7] border border-line p-6 md:p-10 mb-20">
        <p className="text-[15px] leading-relaxed mb-5">
          안심케어 서비스는 장비 대여 중 발생할 수 있는 예기치 못한 파손에 대한 고객님의 부담을 줄여드리기 위한 <span className="font-bold">선택 서비스</span>입니다.
        </p>
        <ul className="space-y-2.5 text-[14px] text-muted leading-relaxed">
          <li>· 안심케어 가입 시 일반적인 사용 과정에서 발생한 파손에 한해 고객 부담금이 <span className="text-ink font-bold">최대 50% 경감</span >됩니다.</li>
          <li>· 적용 범위 및 고객 부담 한도는 장비 종류와 손상 정도에 따라 달라질 수 있습니다.</li>
          <li>· 분실, 도난, 침수, 고의 또는 중대한 과실로 인한 손상은 적용 대상에서 제외됩니다.</li>
          <li>· 안심케어는 보험상품이 아니며, 렌탈 계약상 고객의 손해배상 책임을 일부 경감하는 서비스입니다.</li>
          <li>· 자세한 적용 기준은 대여약관 및 이용규정을 참고해 주세요.</li>
        </ul>
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
