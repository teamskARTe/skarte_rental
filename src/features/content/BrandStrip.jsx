import { useContext } from 'react';
import { Ico } from '../../components/Ico';
import { SiteCtx } from '../../context';
import { DEFAULT_BRANDS } from '../../data/defaults';

export function BrandStrip({ onBrand }) {
  const { brands: ctxBrands } = useContext(SiteCtx);
  const brands = (ctxBrands && ctxBrands.length) ? ctxBrands : DEFAULT_BRANDS;
  if (brands.length === 0) return null;
  // 무한 루프를 위해 2배로 복제 (개수 적으면 더 복제)
  const loop = brands.length < 5 ? [...brands, ...brands, ...brands, ...brands] : [...brands, ...brands];
  return (
    <section className="pt-8 pb-14 md:pt-10 md:pb-16 overflow-hidden">
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto mb-6 md:mb-8">
        <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— 제조사</div>
        <h2 className="font-display font-bold text-3xl md:text-5xl leading-none">제조사별 보기</h2>
        <p className="text-[13px] text-muted mt-2">로고를 클릭하면 해당 제조사 장비만 모아 보여드려요.</p>
      </div>
      {/* 마퀴 */}
      <div className="relative">
        {/* 좌우 페이드 */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-28 z-10 bg-gradient-to-r from-bg to-transparent"/>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-28 z-10 bg-gradient-to-l from-bg to-transparent"/>
        <div className="marquee-track gap-px bg-line py-px">
          {loop.map((b, i) => (
            <button key={i} onClick={() => onBrand(b.q)}
              className="group shrink-0 w-[200px] md:w-[280px] bg-bg p-5 md:p-6 text-left hover-lift invert-hover">
              <div className="aspect-[4/3] mb-5 border border-line bg-[#F7F7F7] flex flex-col items-center justify-center relative overflow-hidden">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.name} className="absolute inset-0 w-full h-full object-cover"/>
                ) : (<>
                  <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 12px)'}}/>
                  <span className="font-display text-2xl md:text-3xl leading-none relative">{b.name}</span>
                  <span className="text-[12px] text-muted/60 mt-2 relative">이미지</span>
                </>)}
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-lg md:text-xl leading-none">{b.name}</div>
                <Ico.arrow className="w-4 h-4 text-muted shrink-0 transition-transform group-hover:translate-x-1"/>
              </div>
              <div className="mt-1.5 text-[13px] text-muted">{b.tag}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
