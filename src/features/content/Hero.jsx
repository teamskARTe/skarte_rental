import { useState, useEffect, useContext } from 'react';
import { Ico } from '../../components/Ico';
import { SiteCtx } from '../../context';
import { openKakao } from '../../lib/format';

export function Hero({ setPage, setCategory }) {
  const { homeBanner } = useContext(SiteCtx);
  // 문자열(구버전) 또는 {pc, mobile} 객체 모두 지원
  const banners = (Array.isArray(homeBanner) ? homeBanner : [])
    .map(b => typeof b === 'string' ? { pc: b, mobile: '' } : (b || {}))
    .filter(b => b.pc || b.mobile);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % n), 4500);
    return () => clearInterval(t);
  }, [paused, n]);
  useEffect(() => { if (idx >= n) setIdx(0); }, [n, idx]);
  const go = (i) => setIdx((i + n) % n);

  return (
    <section className="relative pt-24 md:pt-28 pb-8 md:pb-10 px-6 md:px-10 max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-stretch">
        {/* 배너 */}
        <div className="md:col-span-8 fade-in">
          {n > 0 ? (
            <div className={`relative w-full ${banners.some(b=>b.mobile) ? 'aspect-[4/5]' : 'aspect-[16/9]'} md:h-full md:aspect-auto md:min-h-[360px] border border-ink overflow-hidden bg-ink`}
              onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform:`translateX(-${idx*100}%)` }}>
                {banners.map((b,i) => (
                  <picture key={i} className="w-full h-full shrink-0 block">
                    {b.mobile && <source media="(max-width: 767px)" srcSet={b.mobile}/>}
                    <img src={b.pc || b.mobile} alt={`배너 ${i+1}`} className="w-full h-full object-cover"/>
                  </picture>
                ))}
              </div>
              {n > 1 && (<>
                <button onClick={() => go(idx-1)} aria-label="이전"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-ink/40 text-bg border border-bg/20 hover:border-bg/60 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onClick={() => go(idx+1)} aria-label="다음"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-ink/40 text-bg border border-bg/20 hover:border-bg/60 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {banners.map((_,i) => (
                    <button key={i} onClick={() => setIdx(i)} aria-label={`${i+1}번 배너`}
                      className={`h-1.5 rounded-full transition-all ${i===idx ? 'w-5 bg-kakao' : 'w-1.5 bg-bg/40 hover:bg-bg/60'}`}/>
                  ))}
                </div>
              </>)}
            </div>
          ) : (
            <div className="relative w-full aspect-[16/9] md:h-full md:aspect-auto md:min-h-[360px] bg-[#F0F0F0] border border-ink overflow-hidden flex items-center justify-center">
              {/* 대각선 패턴으로 '이미지 자리' 표시 */}
              <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 12px)'}}/>
              <div className="relative text-center px-4 max-w-full">
                <Ico.cam className="w-12 h-12 md:w-16 md:h-16 text-muted/40 mx-auto mb-3"/>
                <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.25em] text-muted/70">배너 이미지</div>
                <div className="text-[11px] md:text-[12px] text-muted/60 mt-1.5 px-2 break-keep leading-relaxed">관리자 페이지에서 홈 배너를 설정할 수 있어요</div>
              </div>
              {/* 코너 마커 (촬영 프레임 느낌) */}
              <span className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-ink/30"/>
              <span className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-ink/30"/>
              <span className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-ink/30"/>
              <span className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-ink/30"/>
            </div>
          )}
        </div>
        {/* 우측 설명 + CTA */}
        <div className="md:col-span-4 flex flex-col justify-end gap-3 fade-in" style={{animationDelay:'0.15s'}}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-1 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-ink"/> Incheon
          </div>
          <p className="text-[15px] leading-relaxed text-muted">
            <span className="text-ink font-bold">인천 거점</span>의 카메라·시네마 장비 대여 스튜디오. 수도권 서부 촬영팀에게 가장 가까운 곳에서 빠르게 픽업하세요.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            <button onClick={() => setPage('gear')}
              className="group bg-ink text-bg px-5 py-3 text-[13px] inline-flex items-center gap-2 hover-lift">
              장비 둘러보기 <Ico.arrow className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"/>
            </button>
            <button onClick={() => openKakao('대여 문의드립니다.')}
              className="border border-ink px-5 py-3 text-[13px] inline-flex items-center gap-2 hover-lift">
              <Ico.chat className="w-3.5 h-3.5"/> 바로 문의
            </button>
          </div>
        </div>
      </div>

      {/* 인천 거점 어필 띠 — 필름 스트립 */}
      <div className="mt-10 md:mt-12 bg-ink p-2 fade-in overflow-hidden" style={{animationDelay:'0.3s'}}>
        {/* 상단 퍼포레이션 */}
        <div className="flex justify-between items-center px-1 py-1.5 overflow-hidden">
          {Array.from({length:12}).map((_,i) => <span key={i} className="w-3 h-2 md:w-4 md:h-2.5 bg-bg rounded-[1px] shrink-0"/>)}
        </div>
        {/* 프레임 칸들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { k:'01', v:'인천 유일 시네마 렌탈', d:'인천 유일의 시네마 장비 렌탈샵' },
            { k:'02', v:'대학생 픽업 편의', d:'인하대학교 내에서 렌탈 가능' },
            { k:'03', v:'무인 렌탈', d:'원하시는 시간에 렌탈·반납 가능' },
            { k:'04', v:'운송·세팅 인력 제공', d:'전문 인력의 현장 세팅·바라시 지원' },
          ].map((s, i) => (
            <div key={i} className="bg-bg p-4 md:p-5 relative min-w-0">
              <div className="font-mono text-[10px] text-muted/70 mb-1.5 flex items-center justify-between gap-2">
                <span className="uppercase tracking-[0.15em] truncate">{s.k}</span>
                <span className="shrink-0">{String(i+1).padStart(2,'0')}A</span>
              </div>
              <div className="font-display text-base md:text-xl leading-tight mb-1 break-keep">{s.v}</div>
              <div className="text-[12px] md:text-[13px] text-muted break-keep">{s.d}</div>
            </div>
          ))}
        </div>
        {/* 하단 퍼포레이션 */}
        <div className="flex justify-between items-center px-1 py-1.5 overflow-hidden">
          {Array.from({length:12}).map((_,i) => <span key={i} className="w-3 h-2 md:w-4 md:h-2.5 bg-bg rounded-[1px] shrink-0"/>)}
        </div>
      </div>
    </section>
  );
}
