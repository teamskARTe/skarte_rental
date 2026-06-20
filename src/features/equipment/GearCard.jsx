import { useContext } from 'react';
import { CategoriesCtx } from '../../context';
import { Ico } from '../../components/Ico';
import { priceLabel } from '../../lib/format';

export function GearCard({ item, onClick }) {
  const CATEGORIES = useContext(CategoriesCtx);
  const cat = CATEGORIES.find(c => c.id === item.cat);
  return (
    <button onClick={onClick} className="group bg-bg p-6 md:p-8 text-left hover-lift invert-hover relative">
      <div className="mb-10 md:mb-12">
        <span className="text-[14px] font-bold text-ink">{cat.label}</span>
      </div>
      {/* 장비 사진 (없으면 아이콘) */}
      <div className="aspect-[4/3] mb-8 border border-line flex items-center justify-center bg-[#F7F7F7] overflow-hidden">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
          : <Ico.cam className="w-12 h-12 text-muted/40"/>}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-display text-xl md:text-2xl leading-tight">{item.name}</div>
        <Ico.arrow className="w-4 h-4 text-muted shrink-0 transition-transform group-hover:translate-x-1"/>
      </div>
      <div className="mt-1 text-[13px] text-muted">{item.sub}</div>
      <div className="mt-6 flex items-baseline justify-between">
        <span className="font-mono text-[16px] font-bold">{priceLabel(item.price)}{item.price>0 && <span className="text-muted font-normal"> / 일</span>}</span>
        <span className="text-[14px] text-muted">재고 {item.stock}대</span>
      </div>
    </button>
  );
}
