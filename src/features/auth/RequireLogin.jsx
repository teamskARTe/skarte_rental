import { Ico } from '../../components/Ico';

export function RequireLogin({ onAuthOpen }) {
  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1400px] mx-auto pb-24">
      <div className="border border-line py-24 flex flex-col items-center text-center">
        <Ico.user className="w-12 h-12 text-muted/40 mb-5"/>
        <div className="font-display text-3xl md:text-4xl mb-2">로그인이 필요합니다</div>
        <p className="text-[13px] text-muted mb-6 max-w-xs">마이페이지는 로그인 후 이용할 수 있어요.</p>
        <button onClick={onAuthOpen} className="bg-ink text-bg px-6 py-4 text-[13px] hover-lift">로그인 / 회원가입</button>
      </div>
    </section>
  );
}
