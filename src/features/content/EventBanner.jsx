import { useState, useEffect, useContext } from 'react';
import { SiteCtx } from '../../context';

export function EventBanner() {
  const { eventBanners } = useContext(SiteCtx);
  const banners = (eventBanners || []).filter(b => b.imageUrl);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [paused, n]);
  useEffect(() => { if (idx >= n) setIdx(0); }, [n, idx]);
  const go = (i) => setIdx((i + n) % n);

  if (n === 0) return null;

  return (
    <div className="mb-8 relative overflow-hidden bg-ink border border-ink"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* 슬라이드 트랙 */}
      <div className="flex transition-transform duration-500 ease-out" style={{ transform:`translateX(-${idx*100}%)` }}>
        {banners.map((b,i) => (
          <div key={i} className="w-full shrink-0 aspect-[16/5] md:aspect-[16/4]">
            <img src={b.imageUrl} alt={`이벤트 배너 ${i+1}`} className="w-full h-full object-cover"/>
          </div>
        ))}
      </div>

      {/* 좌우 화살표 (배너 2개 이상일 때만) */}
      {n > 1 && (<>
      <button onClick={() => go(idx-1)} aria-label="이전"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-ink/40 text-bg border border-bg/20 hover:border-bg/60 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button onClick={() => go(idx+1)} aria-label="다음"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-ink/40 text-bg border border-bg/20 hover:border-bg/60 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      </>)}

      {/* 인디케이터 */}
      {n > 1 && (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_,i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`${i+1}번 배너`}
            className={`h-1.5 rounded-full transition-all ${i===idx ? 'w-5 bg-kakao' : 'w-1.5 bg-bg/30 hover:bg-bg/50'}`}/>
        ))}
      </div>
      )}
    </div>
  );
}
