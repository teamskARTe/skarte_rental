import { useState, useContext, useEffect } from 'react';
import { Ico } from '../../components/Ico';
import { SiteCtx } from '../../context';

// 유튜브 URL/ID에서 영상 ID만 추출
export function youtubeId(input) {
  if (!input) return '';
  const s = String(input).trim();
  // 이미 ID만 들어온 경우 (11자 내외, 슬래시·점 없음)
  if (!s.includes('/') && !s.includes('.') && !s.includes(' ')) return s;
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? m[1] : s;
}

function thumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function WorksSection() {
  const { works } = useContext(SiteCtx);
  const list = (works || []).filter(w => w.youtubeId);
  const [active, setActive] = useState(null);

  if (list.length === 0) return null;

  return (
    <section className="px-6 md:px-10 max-w-[1400px] mx-auto pt-8 pb-10 md:pt-12 md:pb-14">
      <div className="flex items-end justify-between mb-5 md:mb-6">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— WORKS</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-none">스케아트 장비 촬영 영상</h2>
          <p className="text-[13px] text-muted mt-2">스케아트 렌탈 장비로 촬영한 결과물입니다. 영상을 누르면 자세히 볼 수 있어요.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
        {list.map(w => {
          const id = youtubeId(w.youtubeId);
          return (
            <button key={w.id} onClick={() => setActive(w)}
              className="group bg-bg text-left hover-lift overflow-hidden">
              <div className="aspect-video bg-[#F7F7F7] overflow-hidden relative">
                <img src={thumb(id)} alt={w.title} className="w-full h-full object-cover"/>
                {/* 재생 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-black/55 group-hover:bg-kakao group-hover:text-ink text-white flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="font-display text-lg leading-tight">{w.title || '제목 없음'}</div>
                {w.gear && (
                  <div className="mt-2 flex items-start gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted bg-[#F0F0F0] px-1.5 py-0.5 shrink-0 mt-0.5">사용 장비</span>
                    <span className="text-[13px] text-muted leading-snug">{w.gear}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {active && <WorkModal work={active} onClose={() => setActive(null)}/>}
    </section>
  );
}

function WorkModal({ work, onClose }) {
  const id = youtubeId(work.youtubeId);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] modal-backdrop fade-in flex items-center justify-center p-4 md:p-6" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-bg border border-ink w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
        {/* 좌: 영상 */}
        <div className="lg:flex-[1.6] bg-black flex items-center">
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
              title={work.title || '영상'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        {/* 우: 설명 */}
        <div className="lg:flex-1 p-6 md:p-8 overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink" aria-label="닫기">
            <Ico.close className="w-5 h-5"/>
          </button>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-3">WORKS</div>
          <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-4 pr-8">{work.title || '제목 없음'}</h3>
          {work.gear && (
            <div className="mb-4">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">사용 장비</div>
              <div className="text-[14px] leading-relaxed">{work.gear}</div>
            </div>
          )}
          {work.desc && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-1.5">설명</div>
              <p className="text-[14px] text-muted leading-relaxed whitespace-pre-line">{work.desc}</p>
            </div>
          )}
          <a href={`https://youtu.be/${id}`} target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-[13px] border border-line hover:border-ink px-4 py-2.5 transition-colors">
            유튜브에서 보기 <Ico.arrow className="w-4 h-4"/>
          </a>
        </div>
      </div>
    </div>
  );
}
