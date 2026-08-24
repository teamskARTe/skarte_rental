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
import { mergeListById } from './lib/merge';
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
  const [cartPrefill, setCartPrefill] = useState(null); // 마이페이지에서 기존 문의를 수정할 때 장바구니 초기값
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
  // 공유 캘린더 비밀 키 (/schedule?key=... 임베드용)
  const [shareKey, setShareKey] = useState(() => store.read('skeart_schedule_key', ''));

  // 클라우드에서 마지막으로 읽은 값(키별 JSON). 값이 그대로면 다시 쓰지 않습니다.
  // 이게 없으면 페이지가 열릴 때마다 13개 키를 전부 되써서, 방문자 모두가 DB에 쓰게 됩니다.
  const cloudSnap = useRef({});
  // 클라우드 로드 실패 여부 — 실패하면 저장을 아예 막습니다(오래된 값이 덮어쓰는 사고 방지).
  const [cloudFailed, setCloudFailed] = useState(null);   // null | 오류정보 객체
  // 저장 실패 기록 (최근 것부터). 화면에 남겨두고 복사할 수 있게 합니다.
  const [saveErrors, setSaveErrors] = useState([]);

  // 목록형(배열) 키 → 저장 직전에 서버 최신값과 id 기준으로 병합합니다.
  // 두 사람이 각자 장비를 추가·수정해도 서로의 변경이 보존되어, 매번 새로고침할 필요가 없습니다.
  const LIST_SETTERS = {
    skeart_equipment_v2: setEquipment,
    skeart_rentals_v2: setRentals,
    skeart_orders: setOrders,
    skeart_sets: setSets,
    skeart_brands: setBrands,
    skeart_discounts: setDiscounts,
    skeart_notices: setNotices,
    skeart_works: setWorks,
    skeart_eventbanners_v2: setEventBanners,
    skeart_homebanner_v2: setHomeBanner,
    skeart_bestids: setBestIds,
    skeart_categories: setCategories,
  };

  const saveCloud = async (key, val) => {
    const json = JSON.stringify(val);
    if (cloudSnap.current[key] === json) return;  // 이 탭 기준 변경 없음 → 저장 안 함

    const setter = LIST_SETTERS[key];
    const baseRaw = cloudSnap.current[key];
    // 목록형이고, 불러온 기준값(base)이 있으며, 서버 연결이 있을 때만 병합 저장
    if (sb && setter && Array.isArray(val) && baseRaw !== undefined) {
      let base = null;
      try { base = JSON.parse(baseRaw); } catch (e) { base = null; }
      const server = await store.cloudReadKey(key);   // 서버 최신값 (실패 시 null)
      if (Array.isArray(base) && Array.isArray(server)) {
        const merged = mergeListById(base, val, server);
        const mergedJson = JSON.stringify(merged);
        cloudSnap.current[key] = mergedJson;
        // 병합 결과가 내 화면과 다르면(다른 사람의 변경 포함) 화면에도 반영
        if (mergedJson !== json) setter(merged);
        store.write(key, merged);
        return;
      }
    }
    // 그 외(단일 객체 등) 또는 병합 불가: 기존처럼 통째로 저장
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
      if (typeof map.skeart_schedule_key === 'string') setShareKey(map.skeart_schedule_key);

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

  // 공유 캘린더 비밀 키: 관리자가 처음 들어오면 없을 때 자동 생성
  const genShareKey = () => {
    try {
      const a = new Uint8Array(16); crypto.getRandomValues(a);
      return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return (Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/g, '');
    }
  };
  useEffect(() => {
    if (loaded && isAdmin && !shareKey) setShareKey(genShareKey());
  }, [loaded, isAdmin, shareKey]);
  const regenerateShareKey = () => setShareKey(genShareKey());

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
  useEffect(() => { if (loaded && shareKey) saveCloud('skeart_schedule_key', shareKey); }, [shareKey, loaded]);

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
  // 접수 방식은 손님이 명시적으로 선택합니다:
  //  - mode 'new'  : 새 접수번호 발급
  //  - mode 'edit' : editRefNo(기존 접수번호)의 예약을 이 내용으로 갱신하고 '수정됨'으로 표시
  const recordOrder = async ({ items, total, startDate, type = 'cart', gear, situation, contact, name,
    startTime, returnDate, returnTime, pickupBranch, returnBranch, care, careFee, vat,
    couponLabel, couponSaved, mode = 'new', editRefNo = '' }) => {
    const norm = (s) => (s || '').trim();
    const fields = {
      type,
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
      couponLabel: couponLabel || '',
      couponSaved: couponSaved || 0,
      gear: gear || '',
      situation: situation || '',
      contact: norm(contact),
      name: norm(name),
    };

    // 기존 예약 수정: 입력한 접수번호의 예약을 갱신하고 '수정됨' 상태로. 캘린더 예약은
    // 재수락 시 다시 만들도록 제거합니다. 번호를 못 찾으면 아래 새 접수로 진행합니다.
    if (mode === 'edit' && editRefNo) {
      const rno = parseInt(editRefNo);
      const idx = orders.findIndex(o => o.refNo === rno);
      if (idx >= 0) {
        const updated = { ...orders[idx], ...fields, status: 'modified', date: new Date().toISOString().slice(0,10) };
        setOrders(prev => prev.map((o, i) => i === idx ? updated : o));
        setRentals(prev => prev.filter(r => r.fromOrder !== rno));
        return updated;   // 같은 접수번호 유지
      }
    }

    // 새 접수번호: 서버 시퀀스(원자적)로 발급 → 동시에 접수해도 절대 중복되지 않음.
    // 서버 미연결·함수 없음·오류 시엔 기존 방식(로컬 max+1)으로 폴백.
    let refNo = null;
    if (sb) {
      try {
        const { data, error } = await sb.rpc('next_ref_no');
        if (!error && data != null) refNo = Number(data);
      } catch (e) { /* 폴백으로 진행 */ }
    }
    if (refNo == null) refNo = orders.reduce((m, o) => Math.max(m, o.refNo || 1000), 1000) + 1;

    const o = {
      id: Date.now().toString().slice(-6),
      refNo,
      status: 'pending',
      date: new Date().toISOString().slice(0,10),
      createdAt: new Date().toISOString(),
      ...fields,
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
            startTime: o.startTime || '',
            endTime: o.returnTime || '',
            pickupBranch: o.pickupBranch || '',
            returnBranch: o.returnBranch || '',
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

  const openCart = () => { setCartPrefill(null); setCartOpen(true); };

  // 마이페이지 "이 내용으로 수정": 기존 문의 내용을 장바구니에 채우고 '기존 예약 수정' 상태로 엽니다.
  const editOrderInCart = (order) => {
    if (cart.length > 0 && !window.confirm('장바구니에 담긴 내용을 이 문의 내용으로 바꿀까요?')) return;
    setCart((order.items || [])
      .filter(it => it.id)
      .map(it => ({ id: it.id, qty: parseInt(it.qty) || 1, days: parseInt(it.days) || 1 })));
    setCartPrefill({
      refNo: order.refNo,
      name: order.name || '', contact: order.contact || '',
      startDate: order.startDate || '', startTime: order.startTime || '',
      returnDate: order.returnDate || '', returnTime: order.returnTime || '',
      pickupBranch: order.pickupBranch || '', returnBranch: order.returnBranch || '',
      care: !!order.care,
    });
    setCartOpen(true);
    setPage('home');
  };

  return (
    <EquipCtx.Provider value={equipment}>
    <CategoriesCtx.Provider value={categories}>
    <SiteCtx.Provider value={{ homeBanner, eventBanners, sets, bestIds, notices, brands, discounts, works }}>
      <Nav page={page} setPage={setPage} setCategory={setCategory} cartCount={cartCount}
        onCartOpen={openCart} user={user} onAuthOpen={() => setAuthOpen(true)} isAdmin={isAdmin}
        onSearch={(q) => { setGearSearch(q); setCategory('all'); setPage('gear'); }}/>
      <main className="min-h-screen">
        {page === 'home'  && <HomePage setPage={setPage} setCategory={setCategory} onBrand={(q) => { setGearSearch(q); setCategory('all'); setPage('gear'); }}/>}
        {page === 'gear'  && <GearPage category={category} setCategory={setCategory} onItemClick={setSelectedItem} wishlist={wishlist} onToggleWish={toggleWish} query={gearSearch} setQuery={setGearSearch} rentals={rentals}/>}
        {page === 'guide' && <GuidePage setPage={setPage}/>}
        {page === 'extra' && <ExtraGearPage setPage={setPage} onRecordOrder={recordOrder} ready={loaded}/>}
        {page === 'lookup' && <LookupPage setPage={setPage} orders={orders}/>}
        {page === 'location' && <LocationPage setPage={setPage}/>}
        {page === 'mypage' && (user
          ? <MyPage user={user} wishlist={wishlist} orders={orders} cart={cart}
              onLogout={logout} onItemClick={setSelectedItem} onToggleWish={toggleWish}
              onOpenCart={openCart} onEditOrder={editOrderInCart} setPage={setPage} setCategory={setCategory}/>
          : <RequireLogin onAuthOpen={() => setAuthOpen(true)}/>)}
        {page === 'admin' && (!isAdmin
          ? <RequireLogin onAuthOpen={() => setAuthOpen(true)}/>
          : cloudFailed
            ? <AdminUnavailable failed={cloudFailed}/>
            : !loaded
              ? <AdminUnavailable/>
              : <AdminPage equipment={equipment} setEquipment={setEquipment} orders={orders} setOrders={setOrders} updateOrderStatus={updateOrderStatus} rentals={rentals} setRentals={setRentals}
                  users={users} categories={categories} setCategories={setCategories}
                  shareKey={shareKey} onRegenerateShareKey={regenerateShareKey}
                  homeBanner={homeBanner} setHomeBanner={setHomeBanner}
                  eventBanners={eventBanners} setEventBanners={setEventBanners}
                  sets={sets} setSets={setSets} bestIds={bestIds} setBestIds={setBestIds}
                  notices={notices} setNotices={setNotices}
                  brands={brands} setBrands={setBrands}
                  discounts={discounts} setDiscounts={setDiscounts}
                  works={works} setWorks={setWorks}
                  onExit={() => setPage('home')}/>)}
      </main>
      <Footer setPage={setPage}/>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} wishlist={wishlist} onToggleWish={toggleWish} rentals={rentals}/>}
      {cartOpen && <CartPanel cart={cart} onClose={() => { setCartOpen(false); setCartPrefill(null); }} onUpdate={updateCart} onRemove={removeFromCart} onClear={clearCart} onRecordOrder={recordOrder} user={user} onAuthOpen={() => setAuthOpen(true)} ready={loaded} prefill={cartPrefill}/>}
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

// 관리자 페이지: 클라우드 로드가 끝나기 전(또는 실패 시)엔 편집 화면 대신 안내를 띄웁니다.
// 옛 데이터로 편집하다 뒤늦게 도착한 클라우드 데이터에 덮어써지는 유실을 막습니다.
function AdminUnavailable({ failed }) {
  return (
    <section className="pt-32 md:pt-40 px-6 pb-32 max-w-[560px] mx-auto text-center">
      {failed ? (
        <>
          <div className="font-display font-bold text-3xl md:text-4xl leading-none mb-3">데이터를 불러오지 못했습니다</div>
          <p className="text-[14px] text-muted leading-relaxed mb-2">
            서버에서 최신 데이터를 받지 못해, 잘못된 수정으로 기록이 유실되는 것을 막기 위해 관리자 화면을 잠갔습니다.
          </p>
          <p className="font-mono text-[12px] text-muted mb-6">
            [{failed.code || 'ERROR'}{failed.status ? ` ${failed.status}` : ''}] {failed.message}
          </p>
          <button onClick={() => window.location.reload()} className="bg-ink text-bg px-6 py-3 text-[13px] hover-lift">다시 시도</button>
        </>
      ) : (
        <>
          <div className="inline-block w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin mb-5" aria-hidden/>
          <div className="font-display text-2xl md:text-3xl leading-none mb-2">최신 데이터를 불러오는 중…</div>
          <p className="text-[14px] text-muted">잠시만 기다려 주세요. 로딩이 끝나면 편집할 수 있어요.</p>
        </>
      )}
    </section>
  );
}
