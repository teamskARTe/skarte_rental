import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Nav } from './components/Nav';
import { EquipCtx, SiteCtx, CategoriesCtx } from './context';
import { ADMIN_EMAIL, CATEGORIES, DEFAULT_BRANDS, DEFAULT_DISCOUNTS, DEFAULT_EQUIPMENT, DEFAULT_EVENT_BANNERS, DEFAULT_HOME_BANNER, DEFAULT_NOTICES, DEFAULT_SETS, seedRentals, DEFAULT_WORKS } from './data/defaults';
import { AdminPage } from './features/admin/AdminPage';
import { AuthModal } from './features/auth/AuthModal';
import { MyPage } from './features/auth/MyPage';
import { RequireLogin } from './features/auth/RequireLogin';
import { CartPanel } from './features/cart/CartPanel';
import { NoticePopup } from './features/content/NoticePopup';
import { DetailModal } from './features/equipment/DetailModal';
import { GearPage } from './features/equipment/GearPage';
import { sb, store } from './lib/supabase';
import { hashPassword, verifyPassword, isLegacyPlain } from './lib/auth';
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

  // ── Supabase 클라우드 데이터 초기 로드 (설정 시) ──
  useEffect(() => {
    if (!sb) return;
    store.cloudLoad().then(map => {
      if (!map) return;
      if (map.skeart_equipment_v2)    setEquipment(map.skeart_equipment_v2);
      if (map.skeart_rentals_v2)      setRentals(map.skeart_rentals_v2);
      if (map.skeart_orders)          setOrders(map.skeart_orders);
      if (map.skeart_homebanner_v2)   setHomeBanner(map.skeart_homebanner_v2);
      if (map.skeart_eventbanners_v2) setEventBanners(map.skeart_eventbanners_v2);
      if (map.skeart_sets)            setSets(map.skeart_sets);
      if (map.skeart_bestids)         setBestIds(map.skeart_bestids);
      if (map.skeart_notices)         setNotices(map.skeart_notices);
      if (map.skeart_brands)          setBrands(map.skeart_brands);
      if (map.skeart_discounts)       setDiscounts(map.skeart_discounts);
      if (map.skeart_works)           setWorks(map.skeart_works);
      if (map.skeart_categories)      setCategories(map.skeart_categories);
      if (map.skeart_users)           setUsers(map.skeart_users);
    });
  }, []);

  const isAdmin = user && user.email === ADMIN_EMAIL;

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
  useEffect(() => { store.write('skeart_orders', orders); }, [orders]);
  useEffect(() => { store.write('skeart_session', user); }, [user]);
  useEffect(() => { store.write('skeart_equipment_v2', equipment); }, [equipment]);
  useEffect(() => { store.write('skeart_rentals_v2', rentals); }, [rentals]);
  useEffect(() => { store.write('skeart_homebanner_v2', homeBanner); }, [homeBanner]);
  useEffect(() => { store.write('skeart_eventbanners_v2', eventBanners); }, [eventBanners]);
  useEffect(() => { store.write('skeart_sets', sets); }, [sets]);
  useEffect(() => { store.write('skeart_bestids', bestIds); }, [bestIds]);
  useEffect(() => { store.write('skeart_notices', notices); }, [notices]);
  useEffect(() => { store.write('skeart_brands', brands); }, [brands]);
  useEffect(() => { store.write('skeart_discounts', discounts); }, [discounts]);
  useEffect(() => { store.write('skeart_works', works); }, [works]);
  useEffect(() => { store.write('skeart_categories', categories); }, [categories]);
  useEffect(() => { store.write('skeart_users', users); }, [users]);

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
    const u = { name: name.trim(), email: em, pw: hashed, joinedAt: new Date().toISOString().slice(0,10) };
    setUsers([...current, u]);
    const sess = { name: u.name, email: u.email, joinedAt: u.joinedAt };
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
    // 기존 평문 비밀번호면 로그인 성공 시 해시로 업그레이드
    if (isLegacyPlain(u.pw)) {
      const hashed = await hashPassword(pw);
      setUsers(current.map(x => x.email === em ? { ...x, pw: hashed } : x));
    }
    const sess = { name: u.name, email: u.email, joinedAt: u.joinedAt };
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
  const recordOrder = ({ items, total, startDate, type = 'cart', gear, situation, contact, name }) => {
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
