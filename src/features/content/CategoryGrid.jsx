import { useMemo, useContext } from 'react';
import { Ico } from '../../components/Ico';
import { EquipCtx } from '../../context';
import { CATEGORIES, EQUIPMENT } from '../../data/defaults';

export function CategoryGrid({ setPage, setCategory }) {
  const EQUIPMENT = useContext(EquipCtx);
  const counts = useMemo(() => {
    const c = {}; EQUIPMENT.forEach(e => c[e.cat] = (c[e.cat]||0) + 1); return c;
  }, [EQUIPMENT]);
  return (
    <section className="px-6 md:px-10 max-w-[1400px] mx-auto pt-8 pb-8 md:pt-10 md:pb-10">
      <div className="flex items-end justify-between mb-5 md:mb-6">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— 카테고리</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-none">카테고리</h2>
        </div>
        <button onClick={() => { setCategory('all'); setPage('gear'); }}
          className="hidden md:inline-flex items-center gap-2 text-[13px] tracking-tight text-ink hover:opacity-60 transition-opacity underline-grow">
          전체 보기 <Ico.arrow className="w-4 h-4"/>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line stagger">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => { setCategory(c.id); setPage('gear'); }}
            className="group bg-bg p-5 md:p-6 text-left hover-lift invert-hover">
            <div className="flex items-center justify-end mb-6 md:mb-10">
              <Ico.plus className="w-4 h-4 text-muted transition-transform group-hover:rotate-90"/>
            </div>
            <div className="font-display text-xl md:text-3xl leading-none">{c.label}</div>
            <div className="mt-2 text-muted text-[14px]">장비 {counts[c.id]||0}종</div>
          </button>
        ))}
      </div>
    </section>
  );
}
