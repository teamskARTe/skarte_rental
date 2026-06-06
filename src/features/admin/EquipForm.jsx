import { useState, useEffect } from 'react';
import { Ico } from '../../components/Ico';
import { CATEGORIES } from '../../data/defaults';

export function EquipForm({ form: initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);
  const setSpec = (i, v) => setForm(f => ({ ...f, specs: f.specs.map((s,idx)=>idx===i?v:s) }));

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
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">스펙 (최대 3개)</label>
            <div className="space-y-2 mt-1">
              {[0,1,2].map(i => (
                <input key={i} value={form.specs[i]||''} onChange={e=>setSpec(i,e.target.value)}
                  className="w-full border border-line focus:border-ink outline-none px-3 py-2.5 text-[13px] bg-transparent" placeholder={`스펙 ${i+1}`}/>
              ))}
            </div>
          </div>
          <button onClick={() => onSave(form)} className="w-full bg-ink text-bg py-4 text-[13px] hover-lift mt-2">
            {form._new ? '등록하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
