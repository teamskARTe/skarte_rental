import { useContext } from 'react';
import { Ico } from '../components/Ico';
import { EquipCtx, SiteCtx } from '../context';
import { EQUIPMENT } from '../data/defaults';
import { BrandStrip } from '../features/content/BrandStrip';
import { CategoryGrid } from '../features/content/CategoryGrid';
import { Hero } from '../features/content/Hero';
import { GearCard } from '../features/equipment/GearCard';

export function HomePage({ setPage, setCategory, onBrand }) {
  const EQUIPMENT = useContext(EquipCtx);
  const { bestIds } = useContext(SiteCtx);
  const bestItems = (bestIds && bestIds.length
    ? bestIds.map(id => EQUIPMENT.find(e => e.id === id)).filter(Boolean)
    : EQUIPMENT.slice(0, 3));
  return (
    <>
      <Hero setPage={setPage} setCategory={setCategory}/>
      <CategoryGrid setPage={setPage} setCategory={setCategory}/>
      {/* Best */}
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto pt-8 pb-8 md:pt-10 md:pb-10">
        <div className="flex items-end justify-between mb-5 md:mb-6">
          <div>
            <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— 베스트</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-none">베스트 아이템</h2>
          </div>
          <button onClick={() => setPage('gear')} className="hidden md:inline-flex items-center gap-2 text-[13px] tracking-tight text-ink hover:opacity-60 transition-opacity underline-grow">전체 보기 <Ico.arrow className="w-4 h-4"/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line stagger">
          {bestItems.map(e => (
            <GearCard key={e.id} item={e} onClick={() => { setCategory(e.cat); setPage('gear'); }}/>
          ))}
        </div>
      </section>
      <BrandStrip onBrand={onBrand}/>
    </>
  );
}
