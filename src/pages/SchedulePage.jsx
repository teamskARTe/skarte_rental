import { useState, useEffect } from 'react';
import { sb, store } from '../lib/supabase';
import { RentalCalendar } from '../features/rentals/RentalCalendar';

// 로그인 없이 열리는 읽기 전용 대여 일정 페이지.
// URL의 ?key= 값이 저장된 비밀 키와 일치할 때만 보여줍니다. (노션 등 임베드용)
export function SchedulePage() {
  const [status, setStatus] = useState('loading'); // loading | ok | denied | empty | error
  const [msg, setMsg] = useState('');
  const [rentals, setRentals] = useState([]);
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    if (!sb) { setStatus('error'); setMsg('서버가 설정되지 않았습니다.'); return; }
    const urlKey = new URLSearchParams(window.location.search).get('key') || '';
    (async () => {
      const stored = await store.cloudReadKey('skeart_schedule_key');
      const validKey = typeof stored === 'string' ? stored : '';
      if (!validKey) { setStatus('empty'); return; }
      if (!urlKey || urlKey !== validKey) { setStatus('denied'); return; }
      const [rs, eq] = await Promise.all([
        store.cloudReadKey('skeart_rentals_v2'),
        store.cloudReadKey('skeart_equipment_v2'),
      ]);
      setRentals(Array.isArray(rs) ? rs : []);
      setEquipment(Array.isArray(eq) ? eq : []);
      setStatus('ok');
    })().catch(e => { setStatus('error'); setMsg(e.message || '불러오지 못했습니다.'); });
  }, []);

  const Frame = ({ children }) => (
    <div className="min-h-screen bg-bg text-ink px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-[1100px] mx-auto">{children}</div>
    </div>
  );

  if (status === 'loading') return <Frame><div className="py-24 text-center text-muted text-[14px]">불러오는 중…</div></Frame>;
  if (status === 'denied') return <Frame><div className="py-24 text-center"><div className="font-display text-2xl mb-2">접근할 수 없는 링크입니다</div><p className="text-[14px] text-muted">올바른 공유 링크로 다시 시도해 주세요.</p></div></Frame>;
  if (status === 'empty')  return <Frame><div className="py-24 text-center"><div className="font-display text-2xl mb-2">아직 공유 링크가 준비되지 않았습니다</div><p className="text-[14px] text-muted">관리자에게 문의해 주세요.</p></div></Frame>;
  if (status === 'error')  return <Frame><div className="py-24 text-center"><div className="font-display text-2xl mb-2">일정을 불러오지 못했습니다</div><p className="text-[13px] text-muted font-mono">{msg}</p></div></Frame>;

  return (
    <Frame>
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl leading-none">스케아트 렌탈 · 대여 일정</h1>
        <span className="font-mono text-[11px] text-muted">읽기 전용</span>
      </div>
      <RentalCalendar rentals={rentals} equipment={equipment} readOnly />
    </Frame>
  );
}
