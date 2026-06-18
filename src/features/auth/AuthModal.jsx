import { useState, useEffect } from 'react';
import { Ico } from '../../components/Ico';

export function AuthModal({ onClose, onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', pw:'' });
  const [err, setErr] = useState('');

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  const submit = async () => {
    setErr('');
    if (mode === 'signup') {
      if (!form.name.trim()) return setErr('이름을 입력해 주세요.');
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return setErr('올바른 이메일을 입력해 주세요.');
      if (form.pw.length < 4) return setErr('비밀번호는 4자 이상이어야 합니다.');
      const r = await onSignup(form);
      if (r !== true) return setErr(r);
    } else {
      const r = await onLogin(form.email, form.pw);
      if (r !== true) return setErr(r);
    }
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg w-full md:max-w-md border border-ink">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted">— 계정</div>
          <button onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><Ico.close className="w-5 h-5"/></button>
        </div>
        <div className="px-6 md:px-8 py-8">
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-none mb-1">{mode==='login' ? '로그인' : '회원가입'}</h2>
          <p className="text-[13px] text-muted mb-6">{mode==='login' ? '스케아트 렌탈 계정으로 로그인하세요.' : '몇 초면 가입할 수 있어요.'}</p>

          <div className="space-y-3">
            {mode==='signup' && (
              <div>
                <label className="text-[12px] text-muted">이름</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                  className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="홍길동"/>
              </div>
            )}
            <div>
              <label className="text-[12px] text-muted">이메일</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                onKeyDown={e => e.key==='Enter' && submit()}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="you@example.com"/>
            </div>
            <div>
              <label className="text-[12px] text-muted">비밀번호</label>
              <input type="password" value={form.pw} onChange={e => setForm({...form, pw:e.target.value})}
                onKeyDown={e => e.key==='Enter' && submit()}
                className="w-full border border-line focus:border-ink outline-none px-3 py-3 text-[14px] mt-1 bg-transparent" placeholder="••••••"/>
            </div>
          </div>

          {err && <div className="mt-3 text-[13px] text-red-600">{err}</div>}

          <button onClick={submit} className="mt-6 w-full bg-ink text-bg py-4 text-[13px] hover-lift">
            {mode==='login' ? '로그인' : '가입하고 시작하기'}
          </button>

          <div className="mt-4 text-center text-[13px] text-muted">
            {mode==='login' ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            <button onClick={() => { setMode(mode==='login'?'signup':'login'); setErr(''); }}
              className="text-ink underline-grow">
              {mode==='login' ? '회원가입' : '로그인'}
            </button>
          </div>
          <p className="mt-6 text-[11px] text-muted/70 text-center leading-relaxed border-t border-line pt-4">
            * 데모용 계정입니다. 정보는 이 브라우저에만 저장되며 실제 인증·보안은 적용되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
