import { useState, useEffect, useContext } from 'react';
import { Ico } from '../../components/Ico';
import { SiteCtx } from '../../context';

export function NoticePopup() {
  const { notices } = useContext(SiteCtx);
  const active = (notices || []).filter(n => n.active !== false && (n.title || n.content || n.imageUrl));
  const [queue, setQueue] = useState([]);

  // 최초 1회: "오늘 하루 보지 않기" 처리 안 된 공지만 큐에 담음
  useEffect(() => {
    const ids = active.filter(n => {
      try {
        const until = localStorage.getItem(`skeart_notice_dismiss_${n.id}`);
        return !(until && Date.now() < Number(until));
      } catch (e) { return true; }
    }).map(n => n.id);
    setQueue(ids);
  }, [notices]);

  const cur = active.find(n => n.id === queue[0]);
  if (!cur) return null;

  const total = queue.length;
  const close = () => setQueue(q => q.slice(1));
  const dismissToday = () => {
    try {
      const t = new Date(); t.setHours(24,0,0,0);
      localStorage.setItem(`skeart_notice_dismiss_${cur.id}`, String(t.getTime()));
    } catch (e) {}
    close();
  };

  return (
    <div className="fixed inset-0 z-[70] modal-backdrop fade-in flex items-center justify-center p-5" onClick={close}>
      <div onClick={e => e.stopPropagation()}
        className="bg-bg border border-ink w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]">
        {cur.imageUrl && (
          <div className="relative w-full aspect-[16/10] bg-[#F0F0F0] shrink-0">
            <img src={cur.imageUrl} alt={cur.title || '공지'} className="absolute inset-0 w-full h-full object-cover"/>
          </div>
        )}
        {(cur.title || cur.content) && (
          <div className="p-5 overflow-y-auto">
            {total > 1 && <div className="font-mono text-[11px] text-muted mb-2">공지 {active.length - total + 1} / {active.length}</div>}
            {cur.title && <h2 className="font-display font-bold text-xl leading-tight mb-2">{cur.title}</h2>}
            {cur.content && <p className="text-[14px] text-muted leading-relaxed whitespace-pre-line">{cur.content}</p>}
          </div>
        )}
        <div className="flex border-t border-line shrink-0">
          <button onClick={dismissToday}
            className="flex-1 py-3.5 text-[13px] text-muted hover:bg-[#F7F7F7] transition-colors">오늘 하루 보지 않기</button>
          <button onClick={close}
            className="flex-1 py-3.5 text-[13px] font-bold text-ink border-l border-line hover:bg-[#F7F7F7] transition-colors inline-flex items-center justify-center gap-1.5">
            <Ico.close className="w-3.5 h-3.5"/> 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
