import { useState } from 'react';
import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';

export function ExtraGearPage({ setPage }) {
  const [name, setName] = useState('');
  const [gear, setGear] = useState('');
  const [period, setPeriod] = useState('');
  const [contact, setContact] = useState('');
  const [memo, setMemo] = useState('');

  const submit = () => {
    if (!gear.trim()) return;
    const msg = `[추가 장비 요청]\n\n`
      + (name ? `성함 · ${name}\n` : '')
      + `요청 장비 · ${gear}\n`
      + (period ? `대여 희망 기간 · ${period}\n` : '')
      + (contact ? `연락처 · ${contact}\n` : '')
      + (memo ? `\n${memo}` : '');
    openKakao(msg);
  };

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[760px] mx-auto pb-24">
      <button onClick={() => setPage('home')} className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5 mb-8">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg> 홈으로
      </button>

      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— EXTRA GEAR</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-none mb-4">추가 장비 대여 요청</h1>
      <p className="text-[14px] text-muted leading-relaxed mb-10">
        목록에 없는 장비가 필요하신가요? 원하시는 장비를 알려주시면 보유 여부와 대여 가능 일정을 확인해 안내해 드려요.
        스케아트가 보유하지 않은 장비도 수급 가능한 경우가 있으니 편하게 문의해 주세요.
      </p>

      <div className="space-y-5">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1.5">요청 장비 <span className="text-ink">*</span></label>
          <textarea value={gear} onChange={e => setGear(e.target.value)} rows={3}
            placeholder="예) ARRI Alexa Mini LF / Cooke S4 35mm / 또는 촬영 컨셉을 적어주셔도 좋아요"
            className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent resize-none"/>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1.5">대여 희망 기간</label>
            <input value={period} onChange={e => setPeriod(e.target.value)}
              placeholder="예) 6/20 ~ 6/22 (3일)"
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1.5">성함</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="예) 김감독"
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
          </div>
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1.5">연락처</label>
          <input value={contact} onChange={e => setContact(e.target.value)}
            placeholder="회신받을 연락처 (선택)"
            className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1.5">추가 메모</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3}
            placeholder="촬영 용도, 예산, 기타 요청 사항 등 (선택)"
            className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent resize-none"/>
        </div>

        <button onClick={submit} disabled={!gear.trim()}
          className="w-full bg-kakao text-ink py-4 inline-flex items-center justify-center gap-2 hover-lift disabled:opacity-40">
          <Ico.chat className="w-4 h-4"/> 카카오톡으로 요청 보내기
        </button>
        <p className="text-[12px] text-muted text-center">버튼을 누르면 입력하신 내용이 카카오톡 메시지로 자동 작성돼요.</p>
      </div>
    </section>
  );
}
