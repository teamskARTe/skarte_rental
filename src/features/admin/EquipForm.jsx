import { useState, useEffect, useContext } from 'react';
import { CategoriesCtx } from '../../context';
import { Ico } from '../../components/Ico';
import { ImageInput } from '../../components/ImageInput';

export function EquipForm({ form: initial, onSave, onClose }) {
  const CATEGORIES = useContext(CategoriesCtx);
  const [form, setForm] = useState(initial);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);
  const setSpec = (i, v) => setForm(f => ({ ...f, specs: f.specs.map((s,idx)=>idx===i?v:s) }));
  const addSpec = () => setForm(f => ({ ...f, specs: [...(f.specs||[]), ''] }));
  const delSpec = (i) => setForm(f => ({ ...f, specs: f.specs.filter((_,idx)=>idx!==i) }));

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-lg max-h-[92vh] overflow-y-auto border border-ink">
        <div className="sticky top-0 bg-bg border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted">{form._new ? '장비 등록' : '장비 수정'}</div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
        </div>
        <div className="px-6 md:px-8 py-6 space-y-4">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">장비명</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="Sony A7 IV"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">카테고리</label>
              <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">부제</label>
              <input value={form.sub} onChange={e=>setForm({...form,sub:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="풀프레임 미러리스"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">일일 대여료 (원)</label>
              <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="80000"/>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">재고 (대)</label>
              <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="3"/>
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">장비 사진 (4:3 권장)</label>
            <div className="flex gap-3 mt-1">
              <div className="w-28 aspect-[4/3] border border-line overflow-hidden bg-[#F0F0F0] shrink-0 flex items-center justify-center">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="장비 사진" className="w-full h-full object-cover"/>
                  : <Ico.cam className="w-7 h-7 text-muted/40"/>}
              </div>
              <div className="flex-1 min-w-0">
                <ImageInput value={form.imageUrl || ''} onChange={v => setForm({ ...form, imageUrl: v })}/>
              </div>
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">스펙 (개수 제한 없음)</label>
            <div className="space-y-2 mt-1">
              {(form.specs && form.specs.length ? form.specs : ['']).map((s,i) => (
                <div key={i} className="flex gap-2">
                  <input value={s||''} onChange={e=>setSpec(i,e.target.value)}
                    className="flex-1 border border-line focus:border-ink outline-none px-3 py-2.5 text-[13px] bg-transparent" placeholder={`스펙 ${i+1}`}/>
                  <button onClick={()=>delSpec(i)} className="shrink-0 border border-line hover:border-ink px-2.5 text-muted hover:text-ink" aria-label="스펙 삭제">
                    <Ico.trash className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              <button onClick={addSpec} className="w-full border border-dashed border-line hover:border-ink text-[12px] text-muted hover:text-ink py-2 inline-flex items-center justify-center gap-1.5">
                <Ico.plus className="w-3.5 h-3.5"/> 스펙 추가
              </button>
            </div>
            <p className="text-[11px] text-muted mt-1.5">스펙은 장비 상세에서 전부 표시돼요. (목록 카드에는 부제만 노출)</p>
          </div>
          <button onClick={() => onSave(form)} className="w-full bg-ink text-bg py-4 text-[13px] hover-lift mt-2">
            {form._new ? '등록하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
