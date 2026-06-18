import { useState } from 'react';
import { Ico } from '../components/Ico';
import { openKakao } from '../lib/format';

export function ExtraGearPage({ setPage, onRecordOrder }) {
  const [gear, setGear] = useState('');
  const [situation, setSituation] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [done, setDone] = useState(null); // 접수 완료 시 { refNo }
  const [copied, setCopied] = useState(false);

  const submit = () => {
    if (!gear.trim()) return;
    let refNo = null;
    if (onRecordOrder) {
      const saved = onRecordOrder({ type:'extra', gear, situation, name, contact });
      if (saved && saved.refNo) refNo = saved.refNo;
    }
    setDone({ refNo });
  };

  const openChannel = () => {
    const msg = `[추가 장비 요청]\n\n`
      + (done?.refNo ? `접수번호 · #${done.refNo}\n` : '')
      + (name ? `성함 · ${name}\n` : '')
      + (contact ? `연락처 · ${contact}\n` : '')
      + `필요한 장비 · ${gear}\n`
      + (situation ? `필요했던 상황 · ${situation}\n` : '');
    openKakao(msg);
  };

  const copyRef = () => {
    if (!done?.refNo) return;
    navigator.clipboard?.writeText(`#${done.refNo}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  // ── 접수 완료 화면 (A) ──
  if (done) {
    return (
      <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[600px] mx-auto pb-24 text-center">
        <div className="w-16 h-16 rounded-full bg-ink text-bg flex items-center justify-center mx-auto mb-6">
          <Ico.check className="w-8 h-8"/>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-3">요청이 접수되었어요</h1>
        <p className="text-[14px] text-muted leading-relaxed mb-8">
          아래 접수번호를 카카오톡 채널에 보내주시면 빠르게 확인해 드려요.<br/>
          접수번호는 "내 문의 조회"에서 연락처로도 다시 확인할 수 있어요.
        </p>

        {done.refNo && (
          <div className="border-2 border-ink p-6 mb-6">
            <div className="font-mono text-[12px] uppercase tracking-wider text-muted mb-2">접수번호</div>
            <div className="font-display font-bold text-5xl mb-4">#{done.refNo}</div>
            <button onClick={copyRef} className="text-[13px] border border-line hover:border-ink px-4 py-2 inline-flex items-center gap-2">
              {copied ? <>복사됨 ✓</> : <>접수번호 복사</>}
            </button>
          </div>
        )}

        <button onClick={openChannel} className="w-full bg-kakao text-ink py-4 inline-flex items-center justify-center gap-2 hover-lift mb-3">
          <Ico.chat className="w-4 h-4"/> 카카오톡 채널로 접수번호 보내기
        </button>
        <button onClick={() => setPage('home')} className="text-[13px] text-muted hover:text-ink">홈으로 돌아가기</button>
      </section>
    );
  }

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[760px] mx-auto pb-24">
      <button onClick={() => setPage('home')} className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5 mb-8">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg> 홈으로
      </button>

      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted">EXTRA GEAR</div>
        <button onClick={() => setPage('lookup')} className="text-[13px] text-muted hover:text-ink underline-grow">내 문의 조회</button>
      </div>
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-none mb-4">추가 장비 요청</h1>
      <p className="text-[14px] text-muted leading-relaxed mb-10">
        대여하려 했지만 스케아트 렌탈에 없어서 빌리지 못한 장비가 있다면 남겨주세요.
        접수된 요청은 신규 입고 검토와 장비 구성 업데이트에 참고합니다.
      </p>

      <div className="border border-line p-6 md:p-8 space-y-5">
        <div>
          <label className="text-[14px] font-bold text-ink block mb-2">필요한 장비 <span className="text-red-500">*</span></label>
          <input value={gear} onChange={e => setGear(e.target.value)}
            placeholder="예) SONY 85mm GM, C-stand, 오디오 인터페이스"
            className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
        </div>
        <div>
          <label className="text-[14px] font-bold text-ink block mb-2">필요했던 상황</label>
          <input value={situation} onChange={e => setSituation(e.target.value)}
            placeholder="촬영 날짜, 용도, 필요한 수량 등을 적어주세요."
            className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="text-[14px] font-bold text-ink block mb-2">성함 <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="예) 김감독"
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
          </div>
          <div>
            <label className="text-[14px] font-bold text-ink block mb-2">연락처 <span className="text-red-500">*</span></label>
            <input value={contact} onChange={e => setContact(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] bg-transparent"/>
          </div>
        </div>
        <p className="text-[12px] text-muted">연락처로 문의를 조회할 수 있어요. 해당 장비 입고 시 연락드립니다.</p>

        <button onClick={submit} disabled={!gear.trim() || !name.trim() || !contact.trim()}
          className="w-full bg-ink text-bg py-4 inline-flex items-center justify-center gap-2 hover-lift disabled:opacity-40">
          추가 장비 신청
        </button>
      </div>
    </section>
  );
}
