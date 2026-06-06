import { useState, useContext } from 'react';
import { Empty } from '../../components/Empty';
import { Ico } from '../../components/Ico';
import { EquipCtx } from '../../context';
import { CATEGORIES, EQUIPMENT } from '../../data/defaults';
import { calcPrice, priceLabel, won } from '../../lib/format';

export function MyPage({ user, wishlist, orders, cart, onLogout, onItemClick, onToggleWish, onOpenCart, setPage, setCategory }) {
  const EQUIPMENT = useContext(EquipCtx);
  const [tab, setTab] = useState('orders');
  const wishItems = wishlist.map(id => EQUIPMENT.find(e => e.id===id)).filter(Boolean);
  const cartItems = cart.map(c => ({...c, gear: EQUIPMENT.find(e=>e.id===c.id)})).filter(c=>c.gear);
  const cartTotal = cartItems.reduce((s,i) => s + calcPrice(i.gear.price, i.days)*i.qty, 0);

  const tabs = [
    { id:'orders', label:'문의 내역', n:orders.length },
    { id:'wish',   label:'위시리스트', n:wishItems.length },
    { id:'cart',   label:'장바구니', n:cartItems.reduce((a,c)=>a+c.qty,0) },
    { id:'profile',label:'회원 정보', n:null },
  ];

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1400px] mx-auto pb-24">
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 마이페이지 Page</div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-none">
          안녕하세요, {user.name}님
        </h1>
        <button onClick={onLogout} className="font-mono text-[12px] uppercase tracking-wider border border-ink px-4 py-2 hover-lift">
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-2 border-t border-line pt-6 mb-8">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] tracking-tight border ${tab===t.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
            {t.label}{t.n!==null ? ` · ${t.n}` : ''}
          </button>
        ))}
      </div>

      {/* 문의 내역 */}
      {tab==='orders' && (
        orders.length === 0 ? (
          <Empty icon="bag" title="문의 내역이 없습니다" desc="장바구니에서 카카오톡으로 문의하면 여기에 기록됩니다." cta="장비 둘러보기" onCta={()=>{setCategory('all');setPage('gear');}}/>
        ) : (
          <div className="space-y-px bg-line border border-line">
            {orders.slice().reverse().map((o) => (
              <div key={o.id} className="bg-bg p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-[12px] text-muted">#{o.id} · {o.date}</div>
                  <div className="font-mono text-[13px] font-bold">{won(o.total)}</div>
                </div>
                <div className="space-y-1.5">
                  {o.items.map((it, i) => {
                    const g = EQUIPMENT.find(e=>e.id===it.id);
                    return (
                      <div key={i} className="flex items-baseline justify-between text-[13px]">
                        <span>{g ? g.name : it.id} <span className="text-muted font-mono text-[12px]">· {it.days}일 × {it.qty}대</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 위시리스트 */}
      {tab==='wish' && (
        wishItems.length === 0 ? (
          <Empty icon="heart" title="찜한 장비가 없습니다" desc="장비 카드의 하트를 눌러 관심 장비를 저장하세요." cta="장비 둘러보기" onCta={()=>{setCategory('all');setPage('gear');}}/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
            {wishItems.map(item => (
              <div key={item.id} className="group bg-bg p-6 relative">
                <button onClick={() => onToggleWish(item.id)}
                  className="absolute top-5 right-5 text-red-500 hover-lift" aria-label="찜 해제">
                  <Ico.heartFill className="w-5 h-5"/>
                </button>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-10">
                  {CATEGORIES.find(c=>c.id===item.cat).label}
                </div>
                <div className="aspect-[4/3] mb-6 border border-line flex items-center justify-center bg-[#F7F7F7]">
                  <Ico.cam className="w-12 h-12 text-muted/40"/>
                </div>
                <button onClick={() => onItemClick(item)} className="font-display text-xl leading-tight text-left underline-grow">{item.name}</button>
                <div className="mt-1 text-[13px] text-muted">{item.sub}</div>
                <div className="mt-4 font-mono text-[15px] font-bold">{priceLabel(item.price)}{item.price>0 && <span className="text-muted font-normal"> / 일</span>}</div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 장바구니 */}
      {tab==='cart' && (
        cartItems.length === 0 ? (
          <Empty icon="bag" title="장바구니가 비어 있습니다" desc="원하는 장비를 담아 한 번에 문의하세요." cta="장비 둘러보기" onCta={()=>{setCategory('all');setPage('gear');}}/>
        ) : (
          <div>
            <div className="space-y-px bg-line border border-line mb-6">
              {cartItems.map((i, idx) => (
                <div key={i.id} className="bg-bg p-5 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[11px] text-muted uppercase tracking-wider">{CATEGORIES.find(c=>c.id===i.gear.cat).label}</div>
                    <div className="font-display text-lg">{i.gear.name}</div>
                    <div className="font-mono text-[12px] text-muted mt-1">{i.days}일 × {i.qty}대</div>
                  </div>
                  <div className="font-mono text-[15px] font-bold">{won(calcPrice(i.gear.price,i.days)*i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-ink pt-5">
              <div>
                <div className="text-[12px] text-muted">합계</div>
                <div className="font-display text-4xl font-bold leading-none">{won(cartTotal)}</div>
              </div>
              <button onClick={onOpenCart} className="bg-kakao text-ink px-6 py-4 text-[13px] inline-flex items-center gap-2 hover-lift">
                <Ico.chat className="w-4 h-4"/> 장바구니 열어 문의
              </button>
            </div>
          </div>
        )
      )}

      {/* 회원 정보 */}
      {tab==='profile' && (
        <div className="max-w-xl">
          <div className="border border-line divide-y divide-line">
            {[
              { k:'이름', v:user.name },
              { k:'이메일', v:user.email },
              { k:'가입일', v:user.joinedAt },
              { k:'회원 등급', v:'일반 회원' },
            ].map(row => (
              <div key={row.k} className="flex items-center justify-between px-5 py-4">
                <span className="font-mono text-[12px] uppercase tracking-wider text-muted">{row.k}</span>
                <span className="text-[14px]">{row.v}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-muted mt-4 leading-relaxed">
            회원 정보 수정 및 비밀번호 변경은 실제 서비스 전환(백엔드 연동) 시 제공됩니다.
          </p>
          <button onClick={onLogout} className="mt-6 border border-ink px-6 py-3 text-[13px] hover-lift">로그아웃</button>
        </div>
      )}
    </section>
  );
}
