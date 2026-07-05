import { useState } from 'react';
import { Ico } from '../components/Ico';
import { won } from '../lib/format';

// 연락처 정규화 (숫자만)
const normPhone = (s) => String(s || '').replace(/[^0-9]/g, '');

export function LookupPage({ setPage, orders }) {
  const [contact, setContact] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);

  const search = () => {
    const q = normPhone(contact);
    if (q.length < 4) return;
    const found = (orders || [])
      .filter(o => normPhone(o.contact).includes(q))
      .sort((a, b) => (b.refNo || 0) - (a.refNo || 0));
    setResults(found);
    setSearched(true);
  };

  const stLabel = (st) => st === 'accepted' ? '수락됨' : st === 'rejected' ? '거절됨' : '대기 중';
  const stClass = (st) => st === 'accepted' ? 'bg-ink text-bg' : st === 'rejected' ? 'bg-line text-muted' : 'border border-ink text-ink';

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[680px] mx-auto pb-24">
      <button onClick={() => setPage('home')} className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5 mb-8">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg> 홈으로
      </button>

      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">LOOKUP</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-none mb-4">내 문의 조회</h1>
      <p className="text-[14px] text-muted leading-relaxed mb-8">
        문의하실 때 입력한 연락처로 접수번호와 처리 상태를 확인할 수 있어요.
      </p>

      <div className="flex gap-2 mb-8">
        <input value={contact} onChange={e => setContact(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="연락처 입력 (예: 010-0000-0000)"
          className="flex-1 border border-line focus:border-ink outline-none px-4 py-3 text-[14px] bg-transparent"/>
        <button onClick={search} disabled={normPhone(contact).length < 4}
          className="bg-ink text-bg px-6 py-3 text-[14px] hover-lift disabled:opacity-40 shrink-0">조회</button>
      </div>

      {searched && results.length === 0 && (
        <div className="border border-line py-16 text-center">
          <p className="text-[14px] text-muted">해당 연락처로 접수된 문의가 없어요.</p>
          <p className="text-[13px] text-muted mt-2">연락처를 다시 확인하시거나, 카카오톡 채널로 문의해 주세요.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-[13px] text-muted mb-1">{results.length}건의 문의를 찾았어요.</div>
          {results.map(o => {
            const st = o.status || 'pending';
            return (
              <div key={o.id} className="border border-line p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-xl font-bold">#{o.refNo || o.id}</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 ${stClass(st)}`}>{stLabel(st)}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 border border-line text-muted">{o.type === 'extra' ? '추가장비' : '대여'}</span>
                  </div>
                  <div className="font-mono text-[12px] text-muted">{o.date}</div>
                </div>
                {o.type === 'extra' ? (
                  <div className="text-[13px]"><span className="text-muted">요청 장비:</span> {o.gear}</div>
                ) : (
                  <div className="space-y-1">
                    {(o.items || []).map((it, i) => (
                      <div key={i} className="text-[13px]">{it.name || it.id} <span className="font-mono text-[12px] text-muted">· {it.days}일 × {it.qty}대</span></div>
                    ))}
                    {o.startDate && <div className="font-mono text-[12px] text-muted mt-1">대여 시작 {o.startDate}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
