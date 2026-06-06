import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';

export function LocationPage({ setPage }) {
  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1100px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 지점 안내</div>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-none mb-4">지점 정보</h1>
      <p className="text-muted text-[15px] max-w-xl mb-12">
        <span className="text-ink font-bold">인천 거점</span>의 스케아트 스튜디오. 수도권 서부 촬영팀에게 가장 가까운 장비 픽업 포인트입니다.
      </p>

      {/* 지도 임베드 */}
      <div className="border border-ink mb-px aspect-[16/10] md:aspect-[16/7] overflow-hidden bg-[#F7F7F7]">
        <iframe title="스케아트 위치 — 인하드림센터"
          src="https://maps.google.com/maps?q=37.4486858,126.6562488&z=16&hl=ko&output=embed"
          className="w-full h-full" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
      </div>

      {/* 핵심 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line mb-4">
        {[
          { t:'주소', l:['인천광역시 미추홀구 인하로 100','김현태인하드림센터 6층'] },
          { t:'영업 시간', l:['평일 10:00 – 19:00','주말·공휴일 휴무'] },
          { t:'연락처', l:['TEL 010-5949-0686','skartefilm@naver.com'] },
        ].map(b => (
          <div key={b.t} className="bg-bg p-6 md:p-8">
            <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-4">{b.t}</div>
            {b.l.map((line,i) => <div key={i} className="text-[14px] leading-relaxed">{line}</div>)}
          </div>
        ))}
      </div>

      {/* 길찾기 버튼 */}
      <div className="flex flex-wrap gap-2 mb-16">
        <a href="https://map.kakao.com/link/to/스케아트 인하드림센터,37.4486858,126.6562488" target="_blank" rel="noopener noreferrer"
          className="border border-ink px-5 py-3 text-[13px] tracking-tight hover-lift inline-flex items-center gap-2">
          카카오맵 길찾기 <Ico.arrow className="w-3.5 h-3.5"/>
        </a>
        <a href="https://map.naver.com/p/search/인천광역시 미추홀구 인하로 100" target="_blank" rel="noopener noreferrer"
          className="border border-ink px-5 py-3 text-[13px] tracking-tight hover-lift inline-flex items-center gap-2">
          네이버지도 <Ico.arrow className="w-3.5 h-3.5"/>
        </a>
        <a href="https://maps.google.com/?q=37.4486858,126.6562488" target="_blank" rel="noopener noreferrer"
          className="border border-line px-5 py-3 text-[13px] tracking-tight hover-lift inline-flex items-center gap-2 text-muted hover:text-ink hover:border-ink">
          Google Maps <Ico.arrow className="w-3.5 h-3.5"/>
        </a>
      </div>

      {/* 오시는 길 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 오시는 길</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-10">오시는 길</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line mb-16">
        {[
          { t:'대중교통', d:'수인분당선 인하대역에서 버스 또는 도보로 이동할 수 있습니다. 인하대학교 정문 방면 시내버스 정류장에서 가까우며, 인하드림센터는 용현캠퍼스 내에 있습니다.' },
          { t:'자가용·주차', d:'인하대학교 용현캠퍼스 / 인하드림센터 주차장을 이용하실 수 있습니다. 장비 상·하차 시 건물 1층에 정차 후 6층으로 이동하세요.' },
        ].map(b => (
          <div key={b.t} className="bg-bg p-6 md:p-8">
            <div className="font-display text-xl md:text-2xl mb-2">{b.t}</div>
            <div className="text-[14px] text-muted leading-relaxed">{b.d}</div>
          </div>
        ))}
      </div>

      {/* 커버리지 */}
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 서비스 권역</div>
      <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-8">서비스 권역</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line mb-4">
        {[
          { k:'인천', d:'방문 수령 최적' },
          { k:'부천·김포', d:'당일 픽업 권장' },
          { k:'서울 서남부', d:'방문·택배 모두' },
          { k:'전국', d:'택배 발송 가능' },
        ].map(c => (
          <div key={c.k} className="bg-bg p-5 md:p-6">
            <div className="font-display text-lg md:text-xl leading-none mb-1.5">{c.k}</div>
            <div className="text-[12px] tracking-tight text-muted">{c.d}</div>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-muted mb-16">* 인천공항 인접 거점으로, 입국·로케이션 촬영팀의 장비 수급에도 대응합니다.</p>

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
