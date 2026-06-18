import { useState, useContext } from 'react';
import { LOGO_BLACK } from '../assets/logo';
import { Ico } from './Ico';
import { EquipCtx } from '../context';
import { CATEGORIES, EQUIPMENT } from '../data/defaults';

export function Nav({ page, setPage, setCategory, cartCount, onCartOpen, user, onAuthOpen, isAdmin }) {
  const EQUIPMENT = useContext(EquipCtx);
  const [gearMenu, setGearMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const goCat = (catId) => { setCategory(catId); setPage('gear'); setGearMenu(false); setMobileMenu(false); };
  const goPage = (p) => { setPage(p); setMobileMenu(false); };
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-line backdrop-blur-md" style={{background:'rgba(255,255,255,0.85)'}}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 shrink-0">
          <img src={LOGO_BLACK} alt="skARTe Rental" className="h-7 md:h-8 w-auto"/>
          <span className="hidden sm:inline font-display text-xl md:text-2xl tracking-tight leading-none">skARTe Rental</span>
        </button>
        <div className="hidden md:flex items-center gap-8 text-[13px] tracking-tight">
          <button onClick={() => setPage('home')}
            className={`underline-grow ${page==='home' ? 'text-ink' : 'text-muted hover:text-ink'}`}>홈</button>

          {/* 장비 + 카테고리 드롭다운 */}
          <div className="relative" onMouseEnter={() => setGearMenu(true)} onMouseLeave={() => setGearMenu(false)}>
            <button onClick={() => goCat('all')}
              className={`underline-grow inline-flex items-center gap-1.5 ${page==='gear' ? 'text-ink' : 'text-muted hover:text-ink'}`}>
              장비
              <svg className={`w-3 h-3 transition-transform duration-300 ${gearMenu ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {gearMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-64 fade-in">
                <div className="bg-bg border border-ink shadow-2xl">
                  {CATEGORIES.map(c => {
                    const n = EQUIPMENT.filter(e => e.cat === c.id).length;
                    return (
                      <button key={c.id} onClick={() => goCat(c.id)}
                        className="group w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F7F7F7] border-b border-line transition-colors">
                        <span className="flex items-baseline gap-2">
                          <span className="font-mono text-[11px] text-muted">{c.code}</span>
                          <span className="text-[13px] text-ink">{c.label}</span>
                        </span>
                        <span className="font-mono text-[11px] text-muted">{n}</span>
                      </button>
                    );
                  })}
                  <button onClick={() => goCat('all')}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors">
                    <span className="text-[13px] text-ink">전체 보기</span>
                    <span className="font-mono text-[11px] text-muted">{EQUIPMENT.length}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setPage('guide')}
            className={`underline-grow ${page==='guide' ? 'text-ink' : 'text-muted hover:text-ink'}`}>이용안내</button>
          <button onClick={() => setPage('location')}
            className={`underline-grow ${page==='location' ? 'text-ink' : 'text-muted hover:text-ink'}`}>오시는길</button>
          <button onClick={() => setPage('extra')}
            className={`underline-grow ${page==='extra' ? 'text-ink' : 'text-muted hover:text-ink'}`}>추가 장비 요청</button>
          <button onClick={() => setPage('lookup')}
            className={`underline-grow ${page==='lookup' ? 'text-ink' : 'text-muted hover:text-ink'}`}>문의 조회</button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {isAdmin && (
            <button onClick={() => setPage('admin')}
              className={`px-2.5 md:px-4 py-2 text-[13px] tracking-tight inline-flex items-center gap-2 hover-lift border ${page==='admin' ? 'bg-ink text-bg border-ink' : 'border-ink'}`}>
              관리자
            </button>
          )}
          {user ? (
            <button onClick={() => setPage('mypage')}
              className={`px-2.5 md:px-4 py-2 text-[13px] tracking-tight inline-flex items-center gap-2 hover-lift border ${page==='mypage' ? 'bg-ink text-bg border-ink' : 'border-ink'}`}>
              <Ico.user className="w-3.5 h-3.5"/>
              <span className="hidden sm:inline">{user.name}</span>
            </button>
          ) : (
            <button onClick={onAuthOpen}
              className="px-2.5 md:px-4 py-2 text-[13px] tracking-tight inline-flex items-center gap-2 hover-lift border border-ink">
              <Ico.user className="w-3.5 h-3.5"/>
              <span className="hidden sm:inline">로그인</span>
            </button>
          )}
          <button onClick={onCartOpen}
            className="relative border border-ink px-2.5 md:px-4 py-2 text-[13px] tracking-tight inline-flex items-center gap-1.5 md:gap-2 hover-lift">
            <Ico.bag className="w-3.5 h-3.5"/>
            <span className="hidden sm:inline">장바구니</span>
            <span className="font-mono text-[13px]">[{String(cartCount).padStart(2,'0')}]</span>
          </button>
          {/* 모바일 햄버거 */}
          <button onClick={() => setMobileMenu(o => !o)}
            className="md:hidden border border-ink p-2 hover-lift" aria-label="메뉴">
            {mobileMenu ? <Ico.close className="w-4 h-4"/> : <Ico.menu className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      {/* 모바일 펼침 메뉴 */}
      {mobileMenu && (
        <div className="md:hidden border-t border-line bg-bg fade-in">
          <button onClick={() => goPage('home')}
            className={`w-full text-left px-6 py-4 border-b border-line text-[15px] ${page==='home'?'font-bold':'text-muted'}`}>홈</button>
          <button onClick={() => goCat('all')}
            className={`w-full text-left px-6 py-4 border-b border-line text-[15px] ${page==='gear'?'font-bold':'text-muted'}`}>장비 전체</button>
          <div className="border-b border-line bg-[#FAFAFA]">
            {CATEGORIES.map(c => {
              const n = EQUIPMENT.filter(e => e.cat === c.id).length;
              return (
                <button key={c.id} onClick={() => goCat(c.id)}
                  className="w-full flex items-center justify-between pl-10 pr-6 py-3 text-left border-b border-line last:border-b-0">
                  <span className="text-[14px]">{c.label}</span>
                  <span className="font-mono text-[12px] text-muted">{n}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => goPage('guide')}
            className={`w-full text-left px-6 py-4 border-b border-line text-[15px] ${page==='guide'?'font-bold':'text-muted'}`}>이용안내</button>
          <button onClick={() => goPage('location')}
            className={`w-full text-left px-6 py-4 border-b border-line text-[15px] ${page==='location'?'font-bold':'text-muted'}`}>오시는길</button>
          <button onClick={() => goPage('extra')}
            className={`w-full text-left px-6 py-4 border-b border-line text-[15px] ${page==='extra'?'font-bold':'text-muted'}`}>추가 장비 요청</button>
          <button onClick={() => goPage('lookup')}
            className={`w-full text-left px-6 py-4 text-[15px] ${page==='lookup'?'font-bold':'text-muted'}`}>문의 조회</button>
        </div>
      )}
    </nav>
  );
}
