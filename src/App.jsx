import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Nav } from './components/Nav';
import { EquipCtx, SiteCtx, CategoriesCtx } from './context';
import { ADMIN_EMAIL, ROLE_USER, isAdminUser, roleOf, CATEGORIES, DEFAULT_BRANDS, DEFAULT_DISCOUNTS, DEFAULT_EQUIPMENT, DEFAULT_EVENT_BANNERS, DEFAULT_HOME_BANNER, DEFAULT_NOTICES, DEFAULT_SETS, seedRentals, DEFAULT_WORKS } from './data/defaults';
import { AdminPage } from './features/admin/AdminPage';
import { AuthModal } from './features/auth/AuthModal';
import { MyPage } from './features/auth/MyPage';
import { RequireLogin } from './features/auth/RequireLogin';
import { CartPanel } from './features/cart/CartPanel';
import { NoticePopup } from './features/content/NoticePopup';
import { DetailModal } from './features/equipment/DetailModal';
import { GearPage } from './features/equipment/GearPage';
import { sb, store, CLOUD_KEYS, onWriteError, getLastLoadError } from './lib/supabase';
import { hashPassword, verifyPassword, isLegacyPlain } from './lib/auth';
import { copyText } from './lib/format';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { ExtraGearPage } from './pages/ExtraGearPage';
import { LookupPage } from './pages/LookupPage';
import { LocationPage } from './pages/LocationPage';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // URL ↔ page 매핑
  const PATH_TO_PAGE = { '/': 'home', '/gear': 'gear', '/guide': 'guide', '/extra': 'extra', '/lookup': 'lookup', '/location': 'location', '/mypage': 'mypage', '/admin': 'admin' };
  const PAGE_TO_PATH = { home: '/', gear: '/gear', guide: '/guide', extra: '/extra', lookup: '/lookup', location: '/location', mypage: '/mypage', admin: '/admin' };
  const page = PATH_TO_PAGE[location.pathname] || 'home';
  const setPage = (p) => { navigate(PAGE_TO_PATH[p] || '/'); window.scrollTo(0, 0); };
  const [category, setCategory] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const [gearSearch, setGearSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState(() => store.read('skeart_cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // 인증 / 위시 / 주문 / 장비
  const [user, setUser] = useState(() => store.read('skeart_session', null));
  const [authOpen, setAuthOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => store.read('skeart_wishlist', []));
  const [orders, setOrders] = useState(() => store.read('skeart_orders', []));
  const [equipment, setEquipment] = useState(() => store.read('skeart_equipment_v2', DEFAULT_EQUIPMENT));
  const [rentals, setRentals] = useState(() => store.read('skeart_rentals_v2', seedRentals()));

  // 사이트 편집 콘텐츠 (어드민 관리)
  const [homeBanner, setHomeBanner] = useState(() => store.read('skeart_homebanner_v2', DEFAULT_HOME_BANNER));
  const [eventBanners, setEventBanners] = useState(() => store.read('skeart_eventbanners_v2', DEFAULT_EVENT_BANNERS));
  const [sets, setSets] = useState(() => store.read('skeart_sets', DEFAULT_SETS));
  const [bestIds, setBestIds] = useState(() => store.read('skeart_bestids', []));
  const [notices, setNotices] = useState(() => store.read('skeart_notices', DEFAULT_NOTICES));
  const [brands, setBrands] = useState(() => store.read('skeart_brands', DEFAULT_BRANDS));
  const [discounts, setDiscounts] = useState(() => store.read('skeart_discounts', DEFAULT_DISCOUNTS));
  const [works, setWorks] = useState(() => store.read('skeart_works', DEFAULT_WORKS));
  const [categories, setCategories] = useState(() => store.read('skeart_categories', CATEGORIES));
  const [users, setUsers] = useState(() => store.read('skeart_users', []));

  // 클라우드에서 마지막으로 읽은 값(키별 JSON). 값이 그대로면 다시 쓰지 않습니다.
  // 이게 없으면 페이지가 열릴 때마다 13개 키를 전부 되써서, 방문자 모두가 DB에 쓰게 됩니다.
  const cloudSnap = useRef({});
  // 클라우드 로드 실패 여부 — 실패하면 저장을 아예 막습니다(오래된 값이 덮어쓰는 사고 방지).
  const [cloudFailed, setCloudFailed] = useState(null);   // null | 오류정보 객체
  // 저장 실패 기록 (최근 것부터). 화면에 남겨두고 복사할 수 있게 합니다.
  const [saveErrors, setSaveErrors] = useState([]);

  const saveCloud = (key, val) => {
    const json = JSON.stringify(val);
    if (cloudSnap.current[key] === json) return;  // 변경 없음 → 쓰지 않음
    cloudSnap.current[key] = json;
    store.write(key, val);
  };

  // ── Supabase 클라우드 데이터 초기 로드 (설정 시) ──
  useEffect(() => {
    if (!sb) { setLoaded(true); return; }
    store.cloudLoad().then(map => {
      if (!map) {
        // 로드 실패(네트워크 등). 여기서 저장을 열어주면 이 브라우저에 남아 있던
        // 예전 값이 클라우드를 덮어써 관리자 수정본이 사라집니다. 그래서 막아둡니다.
        setCloudFailed(getLastLoadError() || { message: '서버에서 데이터를 불러오지 못했습니다.', code: 'UNKNOWN' });
        return;
      }
      if (map.skeart_equipment_v2    !== undefined) setEquipment(map.skeart_equipment_v2);
      if (map.skeart_rentals_v2      !== undefined) setRentals(map.skeart_rentals_v2);
      if (map.skeart_orders          !== undefined) setOrders(map.skeart_orders);
      if (map.skeart_homebanner_v2   !== undefined) setHomeBanner(map.skeart_homebanner_v2);
      if (map.skeart_eventbanners_v2 !== undefined) setEventBanners(map.skeart_eventbanners_v2);
      if (map.skeart_sets            !== undefined) setSets(map.skeart_sets);
      if (map.skeart_bestids         !== undefined) setBestIds(map.skeart_bestids);
      if (map.skeart_notices         !== undefined) setNotices(map.skeart_notices);
      if (map.skeart_brands          !== undefined) setBrands(map.skeart_brands);
      if (map.skeart_discounts       !== undefined) setDiscounts(map.skeart_discounts);
      if (map.skeart_works           !== undefined) setWorks(map.skeart_works);
      if (map.skeart_categories      !== undefined) setCategories(map.skeart_categories);
      if (map.skeart_users           !== undefined) setUsers(map.skeart_users);

      // 방금 읽은 값을 스냅샷에 기록 → 로드 직후의 불필요한 되쓰기를 막습니다.
      CLOUD_KEYS.forEach(k => { if (map[k] !== undefined) cloudSnap.current[k] = JSON.stringify(map[k]); });
      setLoaded(true);  // 로드 성공 후에만 저장(write) 허용
    }).catch(e => {
      // cloudLoad 내부에서 못 잡은 예외까지 여기서 받아냅니다.
      setCloudFailed({ message: e.message || '알 수 없는 오류', code: 'LOAD_EXCEPTION' });
    });
  }, []);

  // 저장 실패를 관리자에게 그대로 알립니다 (예전에는 조용히 무시됐습니다).
  useEffect(() => {
    onWriteError((info) => setSaveErrors(prev => [info, ...prev].slice(0, 5)));
  }, []);

  // 관리자 판별: 세션의 role 우선, 없으면 users 목록/ADMIN_EMAIL로 보정(기존 세션 호환)
  const isAdmin = !!user && (
    user.role ? isAdminUser(user)
              : isAdminUser(users.find(u => u.email === user.email) || user)
  );

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [page]);
  // 장비 목록에 없는(옛 더미 등) 장바구니 항목 자동 정리
  useEffect(() => {
    setCart(prev => {
      const valid = prev.filter(c => equipment.some(e => e.id === c.id) || (c.id && c.id.startsWith('set_')));
      return valid.length === prev.length ? prev : valid;
    });
  }, [equipment]);
  useEffect(() => { store.write('skeart_cart', cart); }, [cart]);
  useEffect(() => { store.write('skeart_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { if (loaded) saveCloud('skeart_orders', orders); }, [orders, loaded]);
  useEffect(() => { store.write('skeart_session', user); }, [user]);
  useEffect(() => { if (loaded) saveCloud('skeart_equipment_v2', equipment); }, [equipment, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_rentals_v2', rentals); }, [rentals, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_homebanner_v2', homeBanner); }, [homeBanner, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_eventbanners_v2', eventBanners); }, [eventBanners, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_sets', sets); }, [sets, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_bestids', bestIds); }, [bestIds, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_notices', notices); }, [notices, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_brands', brands); }, [brands, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_discounts', discounts); }, [discounts, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_works', works); }, [works, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_categories', categories); }, [categories, loaded]);
  useEffect(() => { if (loaded) saveCloud('skeart_users', users); }, [users, loaded]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  // 세트는 EQUIPMENT에 없으므로 set_ 접두사도 유효 처리
  const cartCount = cart.filter(c => equipment.some(e => e.id === c.id) || (c.id && c.id.startsWith('set_'))).reduce((a, c) => a + c.qty, 0);

  // ── 장바구니 ──
  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(c => c.id === item.id);
      if (exist) return prev.map(c => c.id === item.id ? { ...c, qty: Math.min(item.stock, c.qty + 1) } : c);
      return [...prev, { id: item.id, qty: 1, days: 1 }];
    });
    showToast(`${item.name} · 장바구니에 담았습니다`);
  };
  const updateCart = (id, patch) => setCart(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);

  // ── 인증 (비밀번호 해싱 + Supabase 저장) ──
  const signup = async ({ name, email, pw }) => {
    const em = email.toLowerCase();
    if (em === ADMIN_EMAIL.toLowerCase()) return '이미 가입된 이메일입니다.';
    let current = users;
    if (sb) { const fresh = await store.cloudReadKey('skeart_users'); if (fresh) current = fresh; }
    if (current.find(u => u.email === em)) return '이미 가입된 이메일입니다.';
    const hashed = await hashPassword(pw);
    const u = { name: name.trim(), email: em, pw: hashed, role: ROLE_USER, joinedAt: new Date().toISOString().slice(0,10) };
    setUsers([...current, u]);
    const sess = { name: u.name, email: u.email, role: u.role, joinedAt: u.joinedAt };
    setUser(sess); setAuthOpen(false); showToast(`${u.name}님, 환영합니다!`);
    return true;
  };
  const login = async (email, pw) => {
    const em = email.toLowerCase();
    let current = users;
    if (sb) { const fresh = await store.cloudReadKey('skeart_users'); if (fresh) { current = fresh; setUsers(fresh); } }
    const u = current.find(x => x.email === em);
    if (!u) return '가입되지 않은 이메일입니다.';
    const ok = await verifyPassword(pw, u.pw);
    if (!ok) return '비밀번호가 일치하지 않습니다.';
    // 기존 평문 비밀번호면 해시로, role이 없던 계정이면 등급을 채워서 업그레이드
    const role = roleOf(u);
    const needsPwUpgrade = isLegacyPlain(u.pw);
    if (needsPwUpgrade || !u.role) {
      const hashed = needsPwUpgrade ? await hashPassword(pw) : u.pw;
      setUsers(current.map(x => x.email === em ? { ...x, pw: hashed, role } : x));
    }
    const sess = { name: u.name, email: u.email, role, joinedAt: u.joinedAt };
    setUser(sess); setAuthOpen(false); showToast(`${u.name}님, 다시 오셨네요!`);
    return true;
  };
  const logout = () => { setUser(null); setPage('home'); showToast('로그아웃되었습니다.'); };

  // ── 위시리스트 ──
  const toggleWish = (id) => {
    if (!user) { setAuthOpen(true); showToast('로그인 후 이용할 수 있어요.'); return; }
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── 문의 내역 기록 ──
  // 문의 접수: 접수번호 발급 + 상태(pending) 저장, 저장된 객체 반환
  const recordOrder = ({ items, total, startDate, type = 'cart', gear, situation, contact, name,
    startTime, returnDate, returnTime, pickupBranch, returnBranch, care, careFee, vat }) => {
    // 접수번호: 1001부터 1씩 증가
    const lastNo = orders.reduce((m, o) => Math.max(m, o.refNo || 1000), 1000);
    const refNo = lastNo + 1;
    const o = {
      id: Date.now().toString().slice(-6),
      refNo,
      type,                 // 'cart' | 'extra'
      status: 'pending',    // 'pending' | 'accepted' | 'rejected'
      date: new Date().toISOString().slice(0,10),
      createdAt: new Date().toISOString(),
      items: items || [],
      total: total || 0,
      startDate: startDate || '',
      startTime: startTime || '',
      returnDate: returnDate || '',
      returnTime: returnTime || '',
      pickupBranch: pickupBranch || '',
      returnBranch: returnBranch || '',
      care: !!care,
      careFee: careFee || 0,
      vat: vat || 0,
      gear: gear || '',
      situation: situation || '',
      contact: contact || '',
      name: name || '',
    };
    setOrders(prev => [...prev, o]);
    return o;
  };

  // 문의 수락/거절. 장바구니 문의 수락 시 예약 일정 자동 등록
  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      // 장바구니 문의 수락 → 예약 일정 등록 (중복 방지)
      if (status === 'accepted' && o.status !== 'accepted' && o.type === 'cart' && o.startDate && Array.isArray(o.items)) {
        const newRentals = o.items
          .filter(it => it.id && !String(it.id).startsWith('set_'))
          .map((it, idx) => ({
            id: `ord${o.refNo}_${idx}`,
            gearId: it.id,
            qty: it.qty || 1,
            renter: o.name || `문의 #${o.refNo}`,
            start: o.startDate,
            days: it.days || 1,
            fromOrder: o.refNo,
          }));
        if (newRentals.length) {
          setRentals(prevR => {
            const exist = new Set(prevR.map(r => r.id));
            return [...prevR, ...newRentals.filter(r => !exist.has(r.id))];
          });
        }
      }
      return { ...o, status };
    }));
  };

  const openCart = () => setCartOpen(true);

  return (
    <EquipCtx.Provider value={equipment}>
    <CategoriesCtx.Provider value={categories}>
    <SiteCtx.Provider value={{ homeBanner, eventBanners, sets, bestIds, notices, brands, discounts, works }}>
      <Nav page={page} setPage={setPage} setCategory={setCategory} cartCount={cartCount}
        onCartOpen={openCart} user={user} onAuthOpen={() => setAuthOpen(true)} isAdmin={isAdmin}/>
      <main className="min-h-screen">
        {page === 'home'  && <HomePage setPage={setPage} setCategory={setCategory} onBrand={(q) => { setGearSearch(q); setCategory('all'); setPage('gear'); }}/>}
        {page === 'gear'  && <GearPage category={category} setCategory={setCategory} onItemClick={setSelectedItem} wishlist={wishlist} onToggleWish={toggleWish} query={gearSearch} setQuery={setGearSearch} rentals={rentals}/>}
        {page === 'guide' && <GuidePage setPage={setPage}/>}
        {page === 'extra' && <ExtraGearPage setPage={setPage} onRecordOrder={recordOrder}/>}
        {page === 'lookup' && <LookupPage setPage={setPage} orders={orders}/>}
        {page === 'location' && <LocationPage setPage={setPage}/>}
        {page === 'mypage' && (user
          ? <MyPage user={user} wishlist={wishlist} orders={orders} cart={cart}
              onLogout={logout} onItemClick={setSelectedItem} onToggleWish={toggleWish}
              onOpenCart={openCart} setPage={setPage} setCategory={setCategory}/>
          : <RequireLogin onAuthOpen={() => setAuthOpen(true)}/>)}
        {page === 'admin' && (isAdmin
          ? <AdminPage equipment={equipment} setEquipment={setEquipment} orders={orders} setOrders={setOrders} updateOrderStatus={updateOrderStatus} rentals={rentals} setRentals={setRentals}
              users={users} categories={categories} setCategories={setCategories}
              homeBanner={homeBanner} setHomeBanner={setHomeBanner}
              eventBanners={eventBanners} setEventBanners={setEventBanners}
              sets={sets} setSets={setSets} bestIds={bestIds} setBestIds={setBestIds}
              notices={notices} setNotices={setNotices}
              brands={brands} setBrands={setBrands}
              discounts={discounts} setDiscounts={setDiscounts}
              works={works} setWorks={setWorks}
              onExit={() => setPage('home')}/>
          : <RequireLogin onAuthOpen={() => setAuthOpen(true)}/>)}
      </main>
      <Footer setPage={setPage}/>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} wishlist={wishlist} onToggleWish={toggleWish} rentals={rentals}/>}
      {cartOpen && <CartPanel cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateCart} onRemove={removeFromCart} onClear={clearCart} onRecordOrder={recordOrder} user={user} onAuthOpen={() => setAuthOpen(true)}/>}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={login} onSignup={signup}/>}
      {page !== 'admin' && <NoticePopup />}
      {cloudFailed && (
        <div className="fixed top-0 left-0 right-0 z-[70] bg-ink text-bg px-5 py-2.5 text-[13px] text-center">
          서버에서 데이터를 불러오지 못해 <span className="font-bold">저장이 막혀 있습니다</span>.{' '}
          <button onClick={() => window.location.reload()} className="underline font-bold">새로고침</button>해 주세요.
          <span className="block font-mono text-[11px] text-bg/60 mt-0.5">
            [{cloudFailed.code || 'ERROR'}{cloudFailed.status ? ` ${cloudFailed.status}` : ''}] {cloudFailed.message}
          </span>
        </div>
      )}

      {/* 저장 실패 기록 — 사라지지 않고 남습니다. 복사해서 그대로 전달하실 수 있어요. */}
      {saveErrors.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[70] w-[min(92vw,420px)] border border-ink bg-bg shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-ink text-bg">
            <span className="text-[13px] font-bold">저장 실패 {saveErrors.length}건</span>
            <div className="flex items-center gap-2">
              <button onClick={() => copyText(saveErrors.map(e =>
                  `[${e.code || 'ERROR'}${e.status ? ' ' + e.status : ''}] ${e.key}\n${e.message}${e.hint ? `\nhint: ${e.hint}` : ''}${e.details ? `\ndetails: ${e.details}` : ''}\n${e.at}`
                ).join('\n\n')).then(ok => showToast(ok ? '오류 내용이 복사되었습니다' : '복사에 실패했습니다'))}
                className="text-[12px] underline">복사</button>
              <button onClick={() => setSaveErrors([])} className="text-[12px] underline">닫기</button>
            </div>
          </div>
          <div className="max-h-[40vh] overflow-y-auto divide-y divide-line">
            {saveErrors.map((e, i) => (
              <div key={i} className="px-4 py-3">
                <div className="font-mono text-[12px] font-bold text-ink">
                  [{e.code || 'ERROR'}{e.status ? ` ${e.status}` : ''}] {e.key}
                </div>
                <div className="text-[13px] mt-0.5 break-words">{e.message}</div>
                {e.hint && <div className="text-[12px] text-muted mt-0.5 break-words">hint · {e.hint}</div>}
                {e.details && <div className="text-[12px] text-muted mt-0.5 break-words">details · {e.details}</div>}
                <div className="font-mono text-[11px] text-muted mt-1">{e.at}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-line text-[12px] text-muted">
            이 내용을 그대로 전달해 주시면 원인을 확인할 수 있습니다.
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-bg px-5 py-3 text-[13px] fade-in shadow-2xl font-mono tracking-wider">
          {toast}
        </div>
      )}
    </SiteCtx.Provider>
    </CategoriesCtx.Provider>
    </EquipCtx.Provider>
  );
}
