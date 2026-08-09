import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';
import { BRANCHES, COMPANY, branchMapEmbed, branchKakaoMap, branchNaverMap } from '../data/defaults';

export function LocationPage({ setPage }) {
  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1100px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 지점 안내</div>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-none mb-4">지점 정보</h1>
      <p className="text-muted text-[15px] max-w-xl mb-12">
        <span className="text-ink font-bold">송도점</span>과 <span className="text-ink font-bold">인하대점</span> 두 곳에서 픽업·반납하실 수 있습니다.
        원하시는 지점을 장바구니에서 선택해 주세요.
      </p>

      {/* 두 지점 나란히 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line mb-4">
        {BRANCHES.map(b => (
          <div key={b.id} className="bg-bg flex flex-col">
            {/* 지도 */}
            <div className="border-b border-line aspect-[16/10] overflow-hidden bg-[#F7F7F7]">
              <iframe title={`스케아트 렌탈 ${b.name} 위치`} src={branchMapEmbed(b)}
                className="w-full h-full" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-2xl md:text-3xl leading-none">{b.name}</h2>
                <span className="font-mono text-[11px] px-2 py-0.5 border border-line text-muted">{b.role}</span>
              </div>

              <div className="mt-5 space-y-4 text-[14px] leading-relaxed flex-1">
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-1.5">주소</div>
                  <div>{b.address}</div>
                  <div className="text-muted">{b.addressDetail}</div>
                </div>
                <div>
                  <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-1.5">영업 시간</div>
                  {b.hours.map((h,i) => <div key={i} className={i === 0 ? '' : 'text-muted'}>{h}</div>)}
                  {b.note && <div className="text-ink font-bold pt-0.5">{b.note}</div>}
                </div>
              </div>

              {/* 길찾기 */}
              <div className="flex flex-wrap gap-2 mt-6">
                <a href={branchKakaoMap(b)} target="_blank" rel="noopener noreferrer"
                  className="border border-ink px-4 py-2.5 text-[13px] tracking-tight hover-lift inline-flex items-center gap-2">
                  카카오맵 <Ico.arrow className="w-3.5 h-3.5"/>
                </a>
                <a href={branchNaverMap(b)} target="_blank" rel="noopener noreferrer"
                  className="border border-line px-4 py-2.5 text-[13px] tracking-tight hover-lift inline-flex items-center gap-2 text-muted hover:text-ink hover:border-ink">
                  네이버지도 <Ico.arrow className="w-3.5 h-3.5"/>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 연락처 */}
      <div className="border border-line p-6 md:p-8 mb-16 flex flex-wrap gap-x-12 gap-y-4">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-1.5">연락처</div>
          <div className="text-[14px]">TEL {COMPANY.tel}</div>
          <div className="text-[14px]">{COMPANY.email}</div>
        </div>
        <div>
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-1.5">예약 안내</div>
          <div className="text-[14px]">모든 픽업·반납은 사전 예약제로 운영됩니다.</div>
          <div className="text-[14px] text-muted">카카오톡 채널로 일정을 알려주세요.</div>
        </div>
      </div>

      {/* 오시는 길 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 오시는 길</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-10">오시는 길</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line mb-16">
        {[
          { t:'송도점 — 대중교통', d:'인천지하철 1호선 지식정보단지역에서 이용하실 수 있습니다. 송도 BRC 스마트밸리 지식산업센터 E동으로 오신 뒤 19층 1905-A호로 이동하세요.' },
          { t:'송도점 — 자가용·주차', d:'지하 1층 주차장에서 E 18~20 앞에 있는 비상용 엘리베이터 및 화물용 엘리베이터를 이용해서 장비 운송하시면 편리합니다.' },
          { t:'인하대점 — 대중교통', d:'수인분당선 인하대역에서 버스 또는 도보로 이동할 수 있습니다. 인하대학교 정문 방면 시내버스 정류장에서 가까우며, 인하드림센터는 용현캠퍼스 내에 있습니다.' },
          { t:'인하대점 — 자가용·주차', d:'인하대학교 용현캠퍼스 / 인하드림센터 주차장을 이용하실 수 있습니다. 장비 상·하차 시 건물 1층에 정차 후 6층으로 이동하세요.' },
        ].map(b => (
          <div key={b.t} className="bg-bg p-6 md:p-8">
            <div className="font-display text-xl md:text-2xl mb-2">{b.t}</div>
            <div className="text-[14px] text-muted leading-relaxed">{b.d}</div>
          </div>
        ))}
      </div>

      {/* 주차 요금 안내 (인하대점) */}
      <div className="border border-line p-6 md:p-8 mb-16">
        <div className="font-display text-xl md:text-2xl mb-1">인하대점 학교 주차 요금</div>
        <p className="text-[13px] text-muted mb-5">인하대학교 주차장 이용 시 아래 요금이 적용됩니다.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line mb-4">
          {[
            { t:'최초 15분', v:'무료' },
            { t:'~30분', v:'2,000원' },
            { t:'30분 초과', v:'10분당 500원' },
            { t:'1일 최대', v:'30,000원' },
          ].map(p => (
            <div key={p.t} className="bg-bg p-4">
              <div className="font-mono text-[12px] text-muted mb-1">{p.t}</div>
              <div className="font-display text-lg leading-none">{p.v}</div>
            </div>
          ))}
        </div>
        <div className="bg-ink text-bg p-4 text-[14px]">
          💡 <span className="font-bold">10만원 이상 대여</span> 시 주차비를 <span className="font-bold">차량 1대 · 1시간</span>까지 지원해 드립니다.
        </div>
      </div>

      {/* 커버리지 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 서비스 권역</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-8">서비스 권역</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line mb-4">
        {[
          { k:'인천', d:'방문 수령 최적' },
          { k:'부천·김포', d:'당일 픽업 권장' },
          { k:'서울 서남부', d:'방문 수령 가능' },
        ].map(c => (
          <div key={c.k} className="bg-bg p-5 md:p-6">
            <div className="font-display text-lg md:text-xl leading-none mb-1.5">{c.k}</div>
            <div className="text-[12px] tracking-tight text-muted">{c.d}</div>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-muted mb-16">* 모든 장비는 방문 수령·반납으로 진행됩니다. 픽업 지점과 반납 지점을 서로 다르게 선택하실 수 있어요.</p>

      {/* CTA */}
      <div className="border border-ink p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="font-display font-bold text-3xl md:text-5xl leading-none">방문 예약하고 픽업하세요</div>
          <p className="text-muted mt-3 text-[14px]">방문 일정과 장비를 카카오톡으로 알려주시면 준비해 두겠습니다.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setPage('guide')}
            className="border border-ink px-6 py-4 text-[13px] hover-lift">이용 가이드</button>
          <button onClick={() => openKakao('방문 예약 문의드립니다.')}
            className="bg-kakao text-ink px-6 py-4 text-[13px] inline-flex items-center gap-2 hover-lift">
            <Ico.chat className="w-4 h-4"/> 방문 예약
          </button>
        </div>
      </div>
    </section>
  );
}
