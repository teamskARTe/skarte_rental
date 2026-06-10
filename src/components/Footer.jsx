import { LOGO_WHITE } from '../assets/logo';
import { Ico } from './Ico';
import { openKakao } from '../lib/format';

export function Footer({ setPage }) {
  return (
    <footer className="bg-ink text-bg px-6 md:px-10 pt-14 pb-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">

        {/* 1단 — 회사 정보 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_WHITE} alt="skARTe" className="h-9 md:h-10 w-auto"/>
            <span className="font-display font-bold text-3xl md:text-4xl leading-none">skARTe</span>
          </div>
          <div className="space-y-2 text-[13px] leading-relaxed">
            <div><span className="text-bg/70 font-bold">회사명</span> &nbsp;스케아트</div>
            <div><span className="text-bg/70 font-bold">대표</span> &nbsp;김준겸</div>
            <div><span className="text-bg/70 font-bold">사업자등록번호</span> &nbsp;<span className="text-bg/35">추후 첨부 예정</span></div>
            <div className="text-bg/45 leading-relaxed pt-1">인천광역시 미추홀구 인하로 100<br/>김현태인하드림센터 6층</div>
          </div>
          <div className="mt-5 space-y-1.5 text-[13px]">
            <div><span className="text-bg/70 font-bold">TEL</span> &nbsp;<span className="font-bold">010-5949-0686</span></div>
            <div><span className="text-bg/70 font-bold">E-mail</span> &nbsp;skartefilm@naver.com</div>
            <div><span className="text-bg/70 font-bold">Instagram</span> &nbsp;<a href="https://instagram.com/skartefilm" target="_blank" rel="noopener noreferrer" className="underline-grow">@skartefilm</a></div>
          </div>
          <p className="mt-6 text-[12px] text-bg/35 leading-relaxed max-w-sm">
            스케아트의 모든 제품 사진과 콘텐츠는 저작권으로 보호됩니다. 상업적 무단 도용은 고의적인 저작권 침해로 간주되며, 법적 책임이 부과됩니다.
          </p>
        </div>

        {/* 2단 — 연락 / 영업시간 */}
        <div>
          <div className="text-[12px] tracking-tight text-bg/45 mb-2">대표 연락처</div>
          <div className="font-display text-2xl md:text-3xl leading-none mb-8">010-5949-0686</div>

          <div className="text-[12px] tracking-tight text-bg/45 mb-3">영업시간</div>
          <div className="space-y-1 text-[14px] leading-relaxed">
            <div>평일 10:00 – 19:00</div>
            <div className="text-bg/45">주말·공휴일 휴무</div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            <button onClick={() => setPage('home')} className="text-bg/45 hover:text-bg underline-grow">회사 소개</button>
            <button onClick={() => setPage('guide')} className="text-bg/45 hover:text-bg underline-grow">이용 가이드</button>
            <button onClick={() => setPage('location')} className="text-bg/45 hover:text-bg underline-grow">지점 안내</button>
          </div>
        </div>

        {/* 3단 — 입금 계좌 */}
        <div>
          <div className="text-[12px] tracking-tight text-bg/45 mb-3">입금 계좌 안내</div>
          <div className="space-y-2 text-[13px] leading-relaxed">
            <div><span className="text-bg/70 font-bold">계좌번호</span> &nbsp;<span className="text-bg/35">추후 첨부 예정</span></div>
            <div><span className="text-bg/70 font-bold">예금주</span> &nbsp;<span className="text-bg/35">추후 첨부 예정</span></div>
          </div>
          <p className="text-[13px] text-bg/45 mt-5 leading-relaxed max-w-xs">
            입금 확인 시점에 예약이 확정됩니다. 자세한 견적과 계좌 정보는 카카오톡 문의 시 안내드립니다.
          </p>
          <button onClick={() => openKakao('대여 문의드립니다.')}
            className="mt-5 bg-kakao text-ink px-5 py-3 text-[13px] inline-flex items-center gap-2 hover-lift">
            <Ico.chat className="w-4 h-4"/> 카카오톡 문의
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-bg/15 flex justify-between font-mono text-[11px] text-bg/40 uppercase tracking-wider">
        <span>© 2026 skARTe · Camera & Cinema Rental · Incheon</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('admin')} className="hover:text-bg transition-colors">Admin</button>
          <span>v 0.1 · Beta</span>
        </div>
      </div>
    </footer>
  );
}
