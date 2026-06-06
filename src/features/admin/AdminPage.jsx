import { useState } from 'react';
import { Ico } from '../../components/Ico';
import { ImageInput } from '../../components/ImageInput';
import { ADMIN_EMAIL, CATEGORIES, DEFAULT_EQUIPMENT } from '../../data/defaults';
import { EquipDetailModal } from './EquipDetailModal';
import { EquipForm } from './EquipForm';
import { RentalCalendar } from '../rentals/RentalCalendar';
import { priceLabel, won } from '../../lib/format';
import { store } from '../../lib/supabase';

export function AdminPage({ equipment, setEquipment, orders, rentals, setRentals,
  homeBanner, setHomeBanner, eventBanners, setEventBanners, sets, setSets, bestIds, setBestIds,
  notices, setNotices, brands, setBrands, discounts, setDiscounts, onExit }) {
  const [tab, setTab] = useState('dash');
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [viewing, setViewing] = useState(null); // 상세/캘린더 보기 장비
  const [gearCat, setGearCat] = useState('all');
  const [gearQuery, setGearQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const users = store.read('skeart_users', []).filter(u => u.email !== ADMIN_EMAIL);

  const blank = { name:'', cat:'cam', sub:'', price:0, stock:1, specs:['','',''] };
  const startNew = () => setEditing({ ...blank, _new:true });
  const startEdit = (item) => setEditing({ ...item, specs:[...(item.specs || []), '', ''].slice(0,3) });

  const saveItem = (form) => {
    const clean = {
      name: form.name.trim(), cat: form.cat, sub: form.sub.trim(),
      price: Math.max(0, parseInt(form.price)||0), stock: Math.max(0, parseInt(form.stock)||0),
      specs: form.specs.map(s=>s.trim()).filter(Boolean),
    };
    if (!clean.name) return;
    if (form._new) {
      const id = 'x' + Date.now().toString().slice(-6);
      setEquipment(prev => [...prev, { id, ...clean }]);
    } else {
      setEquipment(prev => prev.map(e => e.id === form.id ? { ...e, ...clean } : e));
    }
    setEditing(null);
  };
  const delItem = (id) => { if (confirm('이 장비를 삭제할까요?')) setEquipment(prev => prev.filter(e => e.id !== id)); };
  const resetAll = () => { if (confirm('장비 목록을 기본값으로 초기화할까요? (등록·수정 내역이 사라집니다)')) setEquipment(DEFAULT_EQUIPMENT); };

  const totalStock = equipment.reduce((a,e)=>a+e.stock,0);
  const orderTotal = orders.reduce((a,o)=>a+o.total,0);

  const tabs = [
    { id:'dash',  label:'대시보드' },
    { id:'gear',  label:`장비 관리 · ${equipment.length}` },
    { id:'order', label:`문의 내역 · ${orders.length}` },
    { id:'user',  label:`회원 · ${users.length}` },
    { id:'set',   label:`세트 상품 · ${sets.length}` },
    { id:'best',  label:`베스트 · ${bestIds.length}` },
    { id:'discount', label:`할인 이벤트 · ${discounts.length}` },
    { id:'_sep',  label:'— 화면 콘텐츠' },
    { id:'home',  label:'홈 배너' },
    { id:'event', label:`이벤트 배너 · ${eventBanners.length}` },
    { id:'brand', label:`제조사 · ${brands.length}` },
    { id:'notice', label:`팝업 공지 · ${notices.length}` },
  ];

  return (
    <section className="pt-28 md:pt-36 px-6 md:px-10 max-w-[1400px] mx-auto pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-2">— 관리자</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-none">관리자</h1>
        </div>
        <button onClick={onExit} className="text-[13px] tracking-tight border border-ink px-4 py-2 hover-lift">사이트로 나가기</button>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6 mb-8">
        {tabs.map(t => (
          t.id === '_sep'
            ? <span key={t.id} className="w-full md:w-auto md:ml-2 font-mono text-[11px] uppercase tracking-wider text-muted/70 md:border-l md:border-line md:pl-3">{t.label}</span>
            : <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-[13px] tracking-tight border ${tab===t.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
                {t.label}
              </button>
        ))}
      </div>

      {/* 대시보드 */}
      {tab==='dash' && (
        <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
          {[
            { k:'총 장비', v:`${equipment.length}종`, to:'gear', cat:'all' },
            { k:'총 재고', v:`${totalStock}대`, to:'gear', cat:'all' },
            { k:'문의 건수', v:`${orders.length}건`, to:'order' },
            { k:'문의 합계', v:won(orderTotal), to:'order' },
            { k:'가입 회원', v:`${users.length}명`, to:'user' },
            { k:'세트 상품', v:`${sets.length}종`, to:'set' },
            ...CATEGORIES.map(c => ({ k:c.label, v:`${equipment.filter(e=>e.cat===c.id).length}종`, to:'gear', cat:c.id })),
          ].map((s,i) => (
            <button key={i}
              onClick={() => { setTab(s.to); if (s.to==='gear') setGearCat(s.cat || 'all'); }}
              className="group bg-bg p-5 md:p-6 text-left hover:bg-[#F7F7F7] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[14px] md:text-[15px] tracking-tight text-muted">{s.k}</div>
                <Ico.arrow className="w-4 h-4 text-muted/30 group-hover:text-ink transition-all group-hover:translate-x-0.5"/>
              </div>
              <div className="font-display text-2xl md:text-3xl leading-none">{s.v}</div>
            </button>
          ))}
          </div>
          {/* 대여 일정 캘린더 */}
          <div className="mt-10">
            <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted mb-3">— 대여 일정</div>
            <h2 className="font-display text-2xl md:text-3xl leading-none mb-5">대여 일정</h2>
            <RentalCalendar
              rentals={rentals} equipment={equipment}
              onAdd={(r) => setRentals(prev => [...prev, r])}
              onRemove={(id) => setRentals(prev => prev.filter(x => x.id !== id))}/>
          </div>
        </div>
      )}

      {/* 장비 관리 */}
      {tab==='gear' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setGearCat('all')}
                className={`px-3 py-1.5 text-[12px] tracking-tight border ${gearCat==='all' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
                전체 · {equipment.length}
              </button>
              {CATEGORIES.map(c => {
                const n = equipment.filter(e => e.cat === c.id).length;
                return (
                  <button key={c.id} onClick={() => setGearCat(c.id)}
                    className={`px-3 py-1.5 text-[12px] tracking-tight border ${gearCat===c.id ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>
                    {c.label} · {n}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input value={gearQuery} onChange={e => setGearQuery(e.target.value)} placeholder="장비명 검색"
                className="text-[13px] border border-line focus:border-ink outline-none px-3 py-2 bg-transparent flex-1 md:flex-none md:w-40 min-w-0"/>
              <button onClick={resetAll} className="text-[13px] tracking-tight border border-line hover:border-ink px-4 py-2 shrink-0">초기화</button>
              <button onClick={startNew} className="text-[13px] tracking-tight bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 장비 등록</button>
            </div>
          </div>
          <div className="border border-line divide-y divide-line">
            {equipment.filter(e => (gearCat==='all' || e.cat===gearCat) && (gearQuery==='' || e.name.toLowerCase().includes(gearQuery.toLowerCase()) || e.sub.includes(gearQuery))).map(e => (
              <div key={e.id} onClick={() => setViewing(e)}
                className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-3 hover:bg-[#F7F7F7] cursor-pointer">
                <span className="hidden md:block font-mono text-[11px] text-muted w-16 shrink-0">#{e.id.toUpperCase()}</span>
                <span className="font-mono text-[11px] text-muted w-12 md:w-20 shrink-0 uppercase">{CATEGORIES.find(c=>c.id===e.cat)?.label}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-[14px] truncate block underline-grow inline">{e.name}</span>
                  <span className="text-[12px] md:text-[13px] text-muted truncate block">{e.sub}</span>
                  <span className="md:hidden font-mono text-[12px] text-muted mt-0.5 block">{priceLabel(e.price)} · 재고 {e.stock}대</span>
                </span>
                <span className="hidden md:block font-mono text-[13px] font-bold w-24 text-right shrink-0">{priceLabel(e.price)}</span>
                <span className="hidden md:block font-mono text-[12px] text-muted w-12 text-right shrink-0">{e.stock}대</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={(ev) => { ev.stopPropagation(); startEdit(e); }} className="text-[12px] font-mono uppercase border border-line hover:border-ink px-2 py-1">수정</button>
                  <button onClick={(ev) => { ev.stopPropagation(); delItem(e.id); }} className="text-muted hover:text-ink p-1"><Ico.trash className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
            {equipment.filter(e => (gearCat==='all' || e.cat===gearCat) && (gearQuery==='' || e.name.toLowerCase().includes(gearQuery.toLowerCase()) || e.sub.includes(gearQuery))).length === 0 && (
              <div className="px-4 py-12 text-center text-muted text-[14px]">{gearQuery ? '검색 결과가 없습니다.' : '이 카테고리에 등록된 장비가 없습니다.'}</div>
            )}
          </div>
        </div>
      )}

      {/* 문의 내역 */}
      {tab==='order' && (
        orders.length === 0 ? (
          <div className="border border-line py-20 text-center text-muted">접수된 문의 내역이 없습니다.</div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <input value={orderQuery} onChange={e => setOrderQuery(e.target.value)} placeholder="문의번호·장비명 검색"
                className="text-[13px] border border-line focus:border-ink outline-none px-3 py-2 bg-transparent w-56"/>
            </div>
            {(() => {
              const q = orderQuery.toLowerCase();
              const list = orders.slice().reverse().filter(o =>
                q === '' || o.id.toLowerCase().includes(q) ||
                o.items.some(it => { const g = equipment.find(e=>e.id===it.id); return g && g.name.toLowerCase().includes(q); })
              );
              if (list.length === 0) return <div className="border border-line py-16 text-center text-muted text-[14px]">검색 결과가 없습니다.</div>;
              return (
                <div className="space-y-px bg-line border border-line">
                  {list.map(o => (
                    <div key={o.id} className="bg-bg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-mono text-[12px] text-muted">#{o.id} · {o.date}</div>
                        <div className="font-mono text-[13px] font-bold">{won(o.total)}</div>
                      </div>
                      <div className="space-y-1">
                        {o.items.map((it,i) => {
                          const g = equipment.find(e=>e.id===it.id);
                          return <div key={i} className="text-[13px]">{g?g.name:it.id} <span className="font-mono text-[12px] text-muted">· {it.days}일 × {it.qty}대</span></div>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )
      )}

      {/* 회원 */}
      {tab==='user' && (
        users.length === 0 ? (
          <div className="border border-line py-20 text-center text-muted">가입한 회원이 없습니다.</div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <input value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="이름·이메일 검색"
                className="text-[13px] border border-line focus:border-ink outline-none px-3 py-2 bg-transparent w-56"/>
            </div>
            {(() => {
              const q = userQuery.toLowerCase();
              const list = users.filter(u => q === '' || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
              if (list.length === 0) return <div className="border border-line py-16 text-center text-muted text-[14px]">검색 결과가 없습니다.</div>;
              return (
                <div className="border border-line divide-y divide-line">
                  {list.map((u,i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3">
                      <span className="font-mono text-[11px] text-muted w-6 md:w-8 shrink-0">{String(i+1).padStart(2,'0')}</span>
                      <span className="flex-1 min-w-0">
                        <span className="text-[14px] block truncate">{u.name}</span>
                        <span className="text-[13px] text-muted block truncate">{u.email}</span>
                      </span>
                      <span className="font-mono text-[12px] text-muted shrink-0 hidden sm:block">{u.joinedAt}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )
      )}

      {/* ── 홈 배너 관리 ── */}
      {tab==='home' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">홈 메인 배너입니다. PC용(가로 16:9)과 모바일용(세로 4:5) 이미지를 각각 올릴 수 있어요. 여러 장 등록하면 자동 회전합니다. 모바일용을 비우면 PC 이미지를 그대로 씁니다.</p>
            <button onClick={() => setHomeBanner(prev => [...(Array.isArray(prev)?prev:[]), { pc:'', mobile:'' }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 배너 추가</button>
          </div>
          <div className="space-y-3">
            {(Array.isArray(homeBanner)?homeBanner:[]).map((raw, i) => {
              const b = typeof raw === 'string' ? { pc: raw, mobile: '' } : (raw || { pc:'', mobile:'' });
              const upd = (patch) => setHomeBanner(prev => prev.map((x,idx) => idx===i ? { ...(typeof x==='string'?{pc:x,mobile:''}:x), ...patch } : x));
              return (
              <div key={i} className="border border-line p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[12px] text-muted">배너 {String(i+1).padStart(2,'0')}</span>
                  <div className="flex gap-1">
                    <button onClick={() => i>0 && setHomeBanner(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; })}
                      disabled={i===0} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↑</button>
                    <button onClick={() => i<homeBanner.length-1 && setHomeBanner(prev => { const a=[...prev]; [a[i+1],a[i]]=[a[i],a[i+1]]; return a; })}
                      disabled={i===homeBanner.length-1} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↓</button>
                    <button onClick={() => setHomeBanner(prev => prev.filter((_,idx)=>idx!==i))}
                      className="text-muted hover:text-ink p-1"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* PC */}
                  <div className="flex gap-3">
                    <div className="w-28 aspect-[16/9] border border-line overflow-hidden bg-[#F0F0F0] shrink-0 flex items-center justify-center">
                      {b.pc ? <img src={b.pc} alt="PC 배너" className="w-full h-full object-cover"/> : <span className="text-[11px] text-muted">PC 16:9</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <ImageInput label="PC 배너 (가로 16:9)" value={b.pc} onChange={v => upd({ pc:v })}/>
                    </div>
                  </div>
                  {/* 모바일 */}
                  <div className="flex gap-3">
                    <div className="w-20 aspect-[4/5] border border-line overflow-hidden bg-[#F0F0F0] shrink-0 flex items-center justify-center">
                      {b.mobile ? <img src={b.mobile} alt="모바일 배너" className="w-full h-full object-cover"/> : <span className="text-[11px] text-muted text-center px-1">모바일 4:5</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <ImageInput label="모바일 배너 (세로 4:5, 선택)" value={b.mobile} onChange={v => upd({ mobile:v })}/>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            {(!Array.isArray(homeBanner) || homeBanner.length === 0) && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 홈 배너가 없습니다.</div>}
          </div>
        </div>
      )}

      {/* ── 이벤트 배너 관리 ── */}
      {tab==='event' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">장비 페이지 상단에서 자동 회전하는 이벤트 배너입니다. 이미지만 넣으면 됩니다. (16:9 또는 가로형 권장)</p>
            <button onClick={() => setEventBanners(prev => [...prev, { imageUrl:'' }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 배너 추가</button>
          </div>
          <div className="space-y-3">
            {eventBanners.map((b, i) => {
              const upd = (patch) => setEventBanners(prev => prev.map((x,idx) => idx===i ? { ...x, ...patch } : x));
              return (
                <div key={i} className="border border-line p-4 flex flex-col md:flex-row gap-4 md:items-center">
                  {/* 미리보기 썸네일 */}
                  <div className="w-full md:w-48 aspect-[16/9] border border-line overflow-hidden bg-[#F0F0F0] shrink-0 flex items-center justify-center">
                    {b.imageUrl
                      ? <img src={b.imageUrl} alt={`배너 ${i+1}`} className="w-full h-full object-cover"/>
                      : <span className="text-[12px] text-muted">미리보기</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <ImageInput label="이미지 주소 (URL) 또는 파일 업로드" value={b.imageUrl || ''}
                      onChange={v => upd({ imageUrl:v })}/>
                  </div>
                  <div className="flex md:flex-col gap-1 shrink-0">
                    <button onClick={() => i>0 && setEventBanners(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; })}
                      disabled={i===0} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↑</button>
                    <button onClick={() => i<eventBanners.length-1 && setEventBanners(prev => { const a=[...prev]; [a[i+1],a[i]]=[a[i],a[i+1]]; return a; })}
                      disabled={i===eventBanners.length-1} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↓</button>
                    <button onClick={() => setEventBanners(prev => prev.filter((_,idx)=>idx!==i))}
                      className="text-muted hover:text-ink p-1"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                </div>
              );
            })}
            {eventBanners.length === 0 && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 이벤트 배너가 없습니다.</div>}
          </div>
        </div>
      )}

      {/* ── 세트 상품 관리 ── */}
      {tab==='set' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">장비 페이지의 세트 상품을 추가·편집합니다. 가격/정가로 할인율이 표시됩니다.</p>
            <button onClick={() => setSets(prev => [...prev, { id:'set_'+Date.now().toString().slice(-6), name:'새 세트', price:0, listPrice:0, items:'', note:'' }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2"><Ico.plus className="w-3.5 h-3.5"/> 세트 추가</button>
          </div>
          <div className="space-y-4">
            {sets.map((s, i) => {
              const upd = (patch) => setSets(prev => prev.map((x,idx) => idx===i ? { ...x, ...patch } : x));
              return (
                <div key={s.id} className="border border-line p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <input value={s.name} onChange={e => upd({ name:e.target.value })} placeholder="세트 이름"
                      className="font-display text-lg border-b border-line focus:border-ink outline-none px-1 py-1 bg-transparent flex-1"/>
                    <button onClick={() => setSets(prev => prev.filter((_,idx)=>idx!==i))} className="text-muted hover:text-ink p-1 shrink-0"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[12px] text-muted block mb-1">판매가</label>
                      <input type="number" value={s.price} onChange={e => upd({ price:Math.max(0,parseInt(e.target.value)||0) })}
                        className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] font-mono bg-transparent"/>
                    </div>
                    <div>
                      <label className="text-[12px] text-muted block mb-1">정가(취소선)</label>
                      <input type="number" value={s.listPrice} onChange={e => upd({ listPrice:Math.max(0,parseInt(e.target.value)||0) })}
                        className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] font-mono bg-transparent"/>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[12px] text-muted block mb-1">구성품</label>
                    <textarea value={s.items} onChange={e => upd({ items:e.target.value })} rows={2}
                      className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent resize-none"/>
                  </div>
                  <div>
                    <label className="text-[12px] text-muted block mb-1">비고 (선택)</label>
                    <input value={s.note} onChange={e => upd({ note:e.target.value })}
                      className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent"/>
                  </div>
                </div>
              );
            })}
            {sets.length === 0 && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 세트 상품이 없습니다.</div>}
          </div>
        </div>
      )}

      {/* ── 베스트 아이템 설정 ── */}
      {tab==='best' && (
        <div>
          <p className="text-[14px] text-muted mb-2">홈 화면 "베스트 아이템"에 노출할 장비를 선택합니다. (권장 3개, 선택 순서대로 노출 · 미선택 시 기본 3개)</p>
          <div className="text-[13px] mb-5">선택됨 <span className="font-bold">{bestIds.length}</span>개</div>
          <div className="border border-line divide-y divide-line max-h-[60vh] overflow-y-auto">
            {equipment.map(e => {
              const on = bestIds.includes(e.id);
              const order = bestIds.indexOf(e.id) + 1;
              return (
                <button key={e.id} onClick={() => setBestIds(prev => on ? prev.filter(id=>id!==e.id) : [...prev, e.id])}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F7F7]">
                  <span className={`w-5 h-5 border flex items-center justify-center shrink-0 ${on ? 'bg-ink border-ink' : 'border-line'}`}>
                    {on && <span className="font-mono text-[11px] text-bg">{order}</span>}
                  </span>
                  <span className="font-mono text-[11px] text-muted w-16 shrink-0">{CATEGORIES.find(c=>c.id===e.cat)?.label}</span>
                  <span className="text-[14px] flex-1 min-w-0 truncate">{e.name}</span>
                  <span className="font-mono text-[13px] text-muted shrink-0">{priceLabel(e.price)}</span>
                </button>
              );
            })}
          </div>
          {bestIds.length > 0 && (
            <button onClick={() => setBestIds([])} className="mt-4 text-[13px] border border-line hover:border-ink px-4 py-2">전체 해제</button>
          )}
        </div>
      )}

      {/* ── 팝업 공지 관리 ── */}
      {tab==='notice' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">사이트 방문 시 뜨는 팝업 공지입니다. 제목·내용·이미지를 넣을 수 있고, 여러 개면 하나씩 차례로 표시됩니다. 방문자가 "오늘 하루 보지 않기"를 누르면 그날은 다시 뜨지 않아요.</p>
            <button onClick={() => setNotices(prev => [...prev, { id:'ntc_'+Date.now().toString().slice(-6), title:'', content:'', imageUrl:'', active:true }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 공지 추가</button>
          </div>
          <div className="space-y-4">
            {notices.map((nt, i) => {
              const upd = (patch) => setNotices(prev => prev.map((x,idx) => idx===i ? { ...x, ...patch } : x));
              return (
                <div key={nt.id} className={`border p-4 ${nt.active===false ? 'border-line opacity-60' : 'border-ink'}`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                      <span onClick={() => upd({ active: nt.active===false })}
                        className={`w-9 h-5 rounded-full relative transition-colors ${nt.active!==false ? 'bg-ink' : 'bg-line'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-bg transition-all ${nt.active!==false ? 'left-[18px]' : 'left-0.5'}`}/>
                      </span>
                      {nt.active!==false ? '노출 중' : '숨김'}
                    </label>
                    <button onClick={() => setNotices(prev => prev.filter((_,idx)=>idx!==i))} className="text-muted hover:text-ink p-1 shrink-0"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                  <div className="grid md:grid-cols-[180px_1fr] gap-4">
                    {/* 이미지 */}
                    <div>
                      <div className="aspect-[16/10] border border-line overflow-hidden bg-[#F0F0F0] flex items-center justify-center mb-2">
                        {nt.imageUrl
                          ? <img src={nt.imageUrl} alt="공지 이미지" className="w-full h-full object-cover"/>
                          : <span className="text-[12px] text-muted">이미지 미리보기</span>}
                      </div>
                      <ImageInput value={nt.imageUrl} onChange={v => upd({ imageUrl:v })} placeholder="이미지 주소 (선택)"/>
                    </div>
                    {/* 텍스트 */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[12px] text-muted block mb-1">제목</label>
                        <input value={nt.title} onChange={e => upd({ title:e.target.value })} placeholder="예) 추석 연휴 휴무 안내"
                          className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] bg-transparent"/>
                      </div>
                      <div>
                        <label className="text-[12px] text-muted block mb-1">내용</label>
                        <textarea value={nt.content} onChange={e => upd({ content:e.target.value })} rows={4} placeholder="공지 내용을 입력하세요."
                          className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent resize-none"/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {notices.length === 0 && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 팝업 공지가 없습니다.</div>}
          </div>
        </div>
      )}

      {/* ── 제조사 관리 ── */}
      {tab==='brand' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">홈 화면 "제조사별 보기" 카드입니다. 이름·태그·검색어·이미지를 설정합니다. (검색어 = 클릭 시 해당 제조사 장비를 찾는 키워드)</p>
            <button onClick={() => setBrands(prev => [...prev, { id:'br_'+Date.now().toString().slice(-6), name:'새 제조사', q:'', tag:'', imageUrl:'' }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 제조사 추가</button>
          </div>
          <div className="space-y-3">
            {brands.map((b, i) => {
              const upd = (patch) => setBrands(prev => prev.map((x,idx) => idx===i ? { ...x, ...patch } : x));
              return (
                <div key={b.id} className="border border-line p-4 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-40 aspect-[4/3] border border-line overflow-hidden bg-[#F0F0F0] shrink-0 flex items-center justify-center">
                    {b.imageUrl ? <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover"/> : <span className="font-display text-xl text-muted/50">{b.name||'미리보기'}</span>}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[12px] text-muted block mb-1">이름</label>
                        <input value={b.name} onChange={e => upd({ name:e.target.value })} placeholder="SONY"
                          className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] bg-transparent"/>
                      </div>
                      <div className="flex-1">
                        <label className="text-[12px] text-muted block mb-1">태그(설명)</label>
                        <input value={b.tag} onChange={e => upd({ tag:e.target.value })} placeholder="시네마·미러리스"
                          className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent"/>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[12px] text-muted block mb-1">검색어 (클릭 시)</label>
                        <input value={b.q} onChange={e => upd({ q:e.target.value })} placeholder="Sony"
                          className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent"/>
                      </div>
                      <div className="flex-[2]">
                        <ImageInput label="이미지 (URL 또는 업로드)" value={b.imageUrl} onChange={v => upd({ imageUrl:v })}/>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-1 shrink-0">
                    <button onClick={() => i>0 && setBrands(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; })}
                      disabled={i===0} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↑</button>
                    <button onClick={() => i<brands.length-1 && setBrands(prev => { const a=[...prev]; [a[i+1],a[i]]=[a[i],a[i+1]]; return a; })}
                      disabled={i===brands.length-1} className="text-[12px] border border-line hover:border-ink px-2 py-1 disabled:opacity-30">↓</button>
                    <button onClick={() => setBrands(prev => prev.filter((_,idx)=>idx!==i))}
                      className="text-muted hover:text-ink p-1"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                </div>
              );
            })}
            {brands.length === 0 && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 제조사가 없습니다.</div>}
          </div>
        </div>
      )}

      {/* ── 할인 이벤트 관리 ── */}
      {tab==='discount' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] text-muted">장바구니에서 고객이 직접 선택해 적용하는 할인입니다. 노출 중인 할인만 장바구니에 나타나며, 최소 금액(소계) 조건을 채워야 선택할 수 있어요.</p>
            <button onClick={() => setDiscounts(prev => [...prev, { id:'dc_'+Date.now().toString().slice(-6), label:'새 할인', type:'percent', value:10, min:0, active:true }])}
              className="text-[13px] bg-ink text-bg px-4 py-2 hover-lift inline-flex items-center gap-2 shrink-0"><Ico.plus className="w-3.5 h-3.5"/> 할인 추가</button>
          </div>
          <div className="space-y-3">
            {discounts.map((d, i) => {
              const upd = (patch) => setDiscounts(prev => prev.map((x,idx) => idx===i ? { ...x, ...patch } : x));
              return (
                <div key={d.id} className={`border p-4 ${d.active===false ? 'border-line opacity-60' : 'border-ink'}`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                      <span onClick={() => upd({ active: d.active===false })}
                        className={`w-9 h-5 rounded-full relative transition-colors ${d.active!==false ? 'bg-ink' : 'bg-line'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-bg transition-all ${d.active!==false ? 'left-[18px]' : 'left-0.5'}`}/>
                      </span>
                      {d.active!==false ? '노출 중' : '숨김'}
                    </label>
                    <button onClick={() => setDiscounts(prev => prev.filter((_,idx)=>idx!==i))} className="text-muted hover:text-ink p-1 shrink-0"><Ico.trash className="w-4 h-4"/></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[12px] text-muted block mb-1">할인 이름</label>
                      <input value={d.label} onChange={e => upd({ label:e.target.value })} placeholder="예) 인천 소재 학생 30% 할인"
                        className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] bg-transparent"/>
                    </div>
                    <div>
                      <label className="text-[12px] text-muted block mb-1">할인 방식</label>
                      <div className="flex gap-1">
                        <button onClick={() => upd({ type:'percent' })}
                          className={`flex-1 py-2 text-[13px] border ${d.type==='percent' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>퍼센트(%)</button>
                        <button onClick={() => upd({ type:'amount' })}
                          className={`flex-1 py-2 text-[13px] border ${d.type==='amount' ? 'bg-ink text-bg border-ink' : 'border-line hover:border-ink'}`}>정액(원)</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] text-muted block mb-1">{d.type==='amount' ? '할인 금액(원)' : '할인율(%)'}</label>
                      <input type="number" value={d.value} onChange={e => upd({ value:Math.max(0,parseInt(e.target.value)||0) })}
                        className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] font-mono bg-transparent"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[12px] text-muted block mb-1">최소 금액 조건 (소계, 원) · 0이면 조건 없음</label>
                      <input type="number" value={d.min} onChange={e => upd({ min:Math.max(0,parseInt(e.target.value)||0) })}
                        className="w-full border border-line focus:border-ink outline-none px-2 py-2 text-[14px] font-mono bg-transparent"/>
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] text-muted">
                    미리보기: <span className="text-ink font-bold">{d.label}</span> · {d.type==='amount' ? `-${won(d.value)}` : `-${d.value}%`}{d.min>0 ? ` · ${won(d.min)} 이상` : ''}
                  </div>
                </div>
              );
            })}
            {discounts.length === 0 && <div className="border border-line py-12 text-center text-muted text-[14px]">등록된 할인 이벤트가 없습니다.</div>}
          </div>
        </div>
      )}

      {editing && <EquipForm form={editing} onSave={saveItem} onClose={() => setEditing(null)}/>}
      {viewing && <EquipDetailModal item={viewing} rentals={rentals} equipment={equipment}
        onAdd={(r) => setRentals(prev => [...prev, r])}
        onRemove={(id) => setRentals(prev => prev.filter(x => x.id !== id))}
        onEdit={startEdit} onClose={() => setViewing(null)}/>}
    </section>
  );
}
