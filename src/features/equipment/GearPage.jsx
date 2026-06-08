import { useState, useMemo, useContext } from 'react';
import { Ico } from '../../components/Ico';
import { EquipCtx, SiteCtx } from '../../context';
import { CATEGORIES, EQUIPMENT } from '../../data/defaults';
import { EventBanner } from '../content/EventBanner';
import { priceLabel, won } from '../../lib/format';

export function GearPage({ category, setCategory, onItemClick, wishlist, onToggleWish, query, setQuery, rentals }) {
  const EQUIPMENT = useContext(EquipCtx);
  const { sets } = useContext(SiteCtx);
  const [sort, setSort] = useState('default');

  // 장비별 누적 대여 수량(대여 일정 기준) → 인기순
  const rentCount = useMemo(() => {
    const m = {};
    (rentals || []).forEach(r => { m[r.gearId] = (m[r.gearId] || 0) + (r.qty || 1); });
    return m;
  }, [rentals]);

  const filtered = useMemo(() => {
    let list = EQUIPMENT.filter(e =>
      (category === 'all' || e.cat === category) &&
      (query === '' || e.name.toLowerCase().includes(query.toLowerCase()) || e.sub.includes(query))
    );
    if (sort === 'popular') list = [...list].sort((a,b) => (rentCount[b.id]||0) - (rentCount[a.id]||0));
    else if (sort === 'priceHigh') list = [...list].sort((a,b) => b.price - a.price);
    else if (sort === 'priceLow') list = [...list].sort((a,b) => a.price - b.price);
    return list;
  }, [category, query, EQUIPMENT, sort, rentCount]);

  const SORTS = [
    { id:'default',   label:'기본순' },
    { id:'popular',   label:'대여 많은순' },
    { id:'priceHigh', label:'가격 높은순', arrow:'up' },
    { id:'priceLow',  label:'가격 낮은순', arrow:'down' },
  ];

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1400px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 장비 목록</div>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-none mb-12">장비</h1>

      {/* 세트 상품 */}
      {sets && sets.length > 0 && (
      <div className="mb-6 border-t border-line pt-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-bold text-2xl md:text-3xl leading-none">세트 상품</h2>
          <span className="text-[13px] text-muted">묶음 대여 시 할인가 적용</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          {sets.map(s => (
            <button key={s.id} onClick={() => onItemClick({ id:s.id, cat:'set', name:s.name, sub:s.items, price:s.price, listPrice:s.listPrice, stock:1, bookable:true, isSet:true, note:s.note })}
              className="group bg-bg p-5 text-left hover-lift invert-hover flex flex-col">
              <div className="font-display font-bold text-xl leading-none mb-2">{s.name}</div>
              <div className="text-[12px] text-muted leading-relaxed flex-1 line-clamp-3">{s.items}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-[16px] font-bold">{won(s.price)}</span>
                <span className="font-mono text-[12px] text-muted line-through">{won(s.listPrice)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* 할인 이벤트 배너 (자동 회전) */}
      <EventBanner />

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-t border-line pt-6">
        <button onClick={() => setCategory('all')}
          className={`px-4 py-2 text-[13px] tracking-tight border ${category==='all' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
          전체 · {EQUIPMENT.length}
        </button>
        {CATEGORIES.map(c => {
          const n = EQUIPMENT.filter(e => e.cat === c.id).length;
          return (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`px-4 py-2 text-[13px] tracking-tight border ${category===c.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
              {c.label} · {n}
            </button>
          );
        })}
        <div className="md:ml-auto w-full md:w-auto mt-3 md:mt-0">
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="장비 검색"
            className="bg-transparent border-b border-line focus:border-ink outline-none px-2 py-2 text-[13px] w-full md:w-64 placeholder:text-muted/60"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="text-[12px] text-muted">{filtered.length}개 · 일일 대여료 기준</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SORTS.map(s => (
            <button key={s.id} onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 text-[12px] tracking-tight border inline-flex items-center gap-1 ${sort===s.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink text-muted'}`}>
              {s.label}
              {s.arrow === 'up' && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
              {s.arrow === 'down' && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
        {filtered.map(item => {
          const wished = wishlist.includes(item.id);
          return (
          <div key={item.id} onClick={() => onItemClick(item)} className="group bg-bg p-5 md:p-7 text-left hover-lift invert-hover cursor-pointer relative">
            <button onClick={(e) => { e.stopPropagation(); onToggleWish(item.id); }}
              className={`absolute top-5 right-5 z-10 ${wished ? 'wish-active text-red-500' : 'text-muted/50 hover:text-ink'}`} aria-label="찜">
              {wished ? <Ico.heartFill className="w-5 h-5"/> : <Ico.heart className="w-5 h-5"/>}
            </button>
            <div className="flex items-center justify-between mb-10 pr-8">
              <span className="text-[14px] font-bold text-ink">{CATEGORIES.find(c => c.id === item.cat).label}</span>
            </div>
            <div className="aspect-[4/3] mb-6 border border-line flex items-center justify-center bg-[#F7F7F7] overflow-hidden">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
                : <Ico.cam className="w-12 h-12 text-muted/40"/>}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-display text-xl leading-tight">{item.name}</div>
              <Ico.plus className="w-4 h-4 text-muted shrink-0 transition-transform group-hover:rotate-90"/>
            </div>
            <div className="mt-1 text-[13px] text-muted">{item.sub}</div>
            <div className="mt-5 flex items-baseline justify-between">
              <span className="font-mono text-[16px] font-bold">{priceLabel(item.price)}{item.price>0 && <span className="text-muted font-normal"> / 일</span>}</span>
              <span className="text-[14px] text-muted">재고 {item.stock}대</span>
            </div>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-bg p-12 col-span-full text-center text-muted">검색 결과가 없습니다.</div>
        )}
      </div>
    </section>
  );
}
