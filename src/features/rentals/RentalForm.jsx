import { useState, useEffect } from 'react';
import { Ico } from '../../components/Ico';

export function RentalForm({ equipment, defaultStart, defaultGearId, onSave, onClose }) {
  const [form, setForm] = useState({ gearId: defaultGearId || equipment[0]?.id || '', qty:1, renter:'', start: defaultStart, days:1 });
  const [err, setErr] = useState('');
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const submit = () => {
    if (!form.gearId) return setErr('장비를 선택해 주세요.');
    if (!form.renter.trim()) return setErr('대여자명을 입력해 주세요.');
    if (!form.start) return setErr('대여 시작일을 선택해 주세요.');
    onSave({
      id: 'r' + Date.now().toString().slice(-6),
      gearId: form.gearId,
      qty: Math.max(1, parseInt(form.qty)||1),
      renter: form.renter.trim(),
      start: form.start,
      days: Math.max(1, parseInt(form.days)||1),
    });
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-bg w-full md:max-w-md border border-ink">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted">대여 일정 추가</div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
        </div>
        <div className="px-6 md:px-8 py-6 space-y-4">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">장비</label>
            <select value={form.gearId} onChange={e=>setForm({...form,gearId:e.target.value})}
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent">
              {equipment.map(e => <option key={e.id} value={e.id}>{e.name} (재고 {e.stock})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">수량 (대)</label>
              <input type="number" min="1" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent"/>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여 일수</label>
              <input type="number" min="1" value={form.days} onChange={e=>setForm({...form,days:e.target.value})}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent"/>
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여자</label>
            <input value={form.renter} onChange={e=>setForm({...form,renter:e.target.value})}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="이름 또는 팀명"/>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">대여 시작일</label>
            <input type="date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent"/>
          </div>
          {err && <div className="text-[13px] text-red-600">{err}</div>}
          <button onClick={submit} className="w-full bg-ink text-bg py-4 text-[13px] hover-lift mt-2">일정 등록</button>
        </div>
      </div>
    </div>
  );
}
