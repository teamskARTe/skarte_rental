export const CATEGORIES = [
  { id: 'cam',   label: '카메라', en: 'Cameras',   code: '01' },
  { id: 'lens',  label: '렌즈',   en: 'Lenses',    code: '02' },
  { id: 'tri',   label: '삼각대', en: 'Tripods',   code: '03' },
  { id: 'audio', label: '음향',   en: 'Audio',     code: '04' },
  { id: 'light', label: '조명',   en: 'Lighting',  code: '05' },
  { id: 'etc',   label: '기타',   en: 'Accessories',code: '06' },
];

export const EQUIPMENT = [
  { id:'cam1', cat:'cam', name:'Fx9', sub:'', price:70000, stock:1, bookable:true },
  { id:'cam2', cat:'cam', name:'Fx6', sub:'', price:60000, stock:1, bookable:true },
  { id:'cam3', cat:'cam', name:'Fx3', sub:'케이지, 오디오 탑핸들', price:40000, stock:1, bookable:true },
  { id:'cam4', cat:'cam', name:'Fx30', sub:'', price:30000, stock:1, bookable:true },
  { id:'cam5', cat:'cam', name:'A7M4', sub:'', price:30000, stock:1, bookable:true },
  { id:'cam6', cat:'cam', name:'액션캠 인스타 360 one rs', sub:'', price:10000, stock:1, bookable:true },
  { id:'cam7', cat:'cam', name:'드론 매빅 줌2', sub:'', price:25000, stock:1, bookable:true },
  { id:'cam8', cat:'cam', name:'DJI 포켓 3', sub:'크리에이터 세트, 광각 렌즈 미포함 128 micro sd', price:25000, stock:1, bookable:true },
  { id:'lens1', cat:'lens', name:'2470gm2', sub:'82구경', price:30000, stock:1, bookable:true },
  { id:'lens2', cat:'lens', name:'70200gm2', sub:'77구경', price:30000, stock:1, bookable:true },
  { id:'lens3', cat:'lens', name:'50.2gm', sub:'72구경', price:25000, stock:1, bookable:true },
  { id:'lens4', cat:'lens', name:'18110g', sub:'크롭렌즈', price:25000, stock:1, bookable:true },
  { id:'lens5', cat:'lens', name:'1635pz g', sub:'72구경', price:20000, stock:1, bookable:true },
  { id:'lens6', cat:'lens', name:'1635z', sub:'후드X, 필터장착 불가', price:10000, stock:1, bookable:true },
  { id:'lens7', cat:'lens', name:'18105G', sub:'크롭렌즈', price:10000, stock:1, bookable:true },
  { id:'lens8', cat:'lens', name:'70200g', sub:'', price:20000, stock:1, bookable:true },
  { id:'lens9', cat:'lens', name:'1635,2470,70200 3세트', sub:'', price:70000, stock:1, bookable:true },
  { id:'tri1', cat:'tri', name:'트라이 100볼', sub:'시루이 헤드', price:15000, stock:1, bookable:true },
  { id:'tri2', cat:'tri', name:'트라이 75볼', sub:'카본 테리스 2', price:10000, stock:2, bookable:true },
  { id:'tri3', cat:'tri', name:'트라이 베이비 100볼', sub:'헤드 미포함 / 75볼도 장착가능', price:5000, stock:1, bookable:true },
  { id:'tri4', cat:'tri', name:'YC ONION 파인타테크 모노포드', sub:'전용 달리 있음 필요시 문의', price:10000, stock:1, bookable:true },
  { id:'tri5', cat:'tri', name:'트라이 달리', sub:'', price:5000, stock:1, bookable:true },
  { id:'audio1', cat:'audio', name:'젠하이저 MKE600', sub:'XLR 선 포함', price:15000, stock:1, bookable:true },
  { id:'audio2', cat:'audio', name:'붐대', sub:'', price:5000, stock:1, bookable:true },
  { id:'audio3', cat:'audio', name:'줌 H6', sub:'', price:10000, stock:1, bookable:true },
  { id:'audio4', cat:'audio', name:'홀리랜드 라크 마스2', sub:'소니 핫슈 어댑터 O, 2채널, 모니터링 가능', price:15000, stock:1, bookable:true },
  { id:'audio5', cat:'audio', name:'ECM G1', sub:'', price:5000, stock:1, bookable:true },
  { id:'audio6', cat:'audio', name:'로데 비디오마이크로프로', sub:'', price:5000, stock:1, bookable:true },
  { id:'audio7', cat:'audio', name:'소니 D11', sub:'', price:10000, stock:1, bookable:true },
  { id:'audio8', cat:'audio', name:'소니 샷건 마이크', sub:'XLR', price:5000, stock:2, bookable:true },
  { id:'light1', cat:'light', name:'난라이트 200s', sub:'데이라이트 리플렉터 1개, 소프트박스 2개', price:10000, stock:2, bookable:true },
  { id:'light2', cat:'light', name:'포이즘 100 판조명', sub:'브이마운트 플레이트 장착', price:10000, stock:2, bookable:true },
  { id:'light3', cat:'light', name:'시네로이드 플렉시블 800v', sub:'디퓨저, 그리드', price:20000, stock:1, bookable:true },
  { id:'light4', cat:'light', name:'Aputure mc 4kit', sub:'디퓨저 2', price:15000, stock:1, bookable:true },
  { id:'light5', cat:'light', name:'유쾌한생각 텅스텐 조명', sub:'앞에 렌즈 깨져 있음', price:10000, stock:1, bookable:true },
  { id:'light6', cat:'light', name:'A스탠드', sub:'롱암 1, 중암 1, 고보헤드 4', price:2500, stock:6, bookable:true },
  { id:'light7', cat:'light', name:'난라이트 파보튜브 6c', sub:'', price:2500, stock:1, bookable:true },
  { id:'light8', cat:'light', name:'고독스 ML100 BI', sub:'바이컬러, 소프트박스, 그리드', price:10000, stock:1, bookable:true },
  { id:'light9', cat:'light', name:'어퓨처 mini 20 3kit', sub:'스팟 조명, 데이라이트 2, 바이컬러 1', price:10000, stock:1, bookable:true },
  { id:'etc1', cat:'etc', name:'뉴클리어스 m', sub:'풀세트', price:25000, stock:1, bookable:true },
  { id:'etc2', cat:'etc', name:'인터컴 홀리랜드 SE PRO 6구', sub:'배터리 12', price:35000, stock:1, bookable:true },
  { id:'etc3', cat:'etc', name:'액순 M7 PRO', sub:'7인치 시네뷰 TX, RX 가능, 레코딩 가능( SDI in/out, HDMI in/out) 크로스컨버전 O)', price:30000, stock:1, bookable:true },
  { id:'etc4', cat:'etc', name:'포트키 bm7 II', sub:'7인치 모니터(SDI in/out, HDMI in out)', price:20000, stock:1, bookable:true },
  { id:'etc5', cat:'etc', name:'포트키 LH7P', sub:'7인치 모니터(HDMI in/out)', price:10000, stock:1, bookable:true },
  { id:'etc6', cat:'etc', name:'티비로직 7인치', sub:'모니터링, (hdmi in, SDI in/out)', price:5000, stock:1, bookable:true },
  { id:'etc7', cat:'etc', name:'이지리그(seren 포함)', sub:'짭지리그 Seren 포함', price:15000, stock:1, bookable:true },
  { id:'etc8', cat:'etc', name:'시택 17인치 필드모니터', sub:'', price:25000, stock:1, bookable:true },
  { id:'etc9', cat:'etc', name:'오씨 메가 22S4', sub:'신형, 분할 화면 가능', price:35000, stock:1, bookable:true },
  { id:'etc10', cat:'etc', name:'DJI RS3 PRO COMBO', sub:'브리켓 핸들, 듀얼핸들 필요시 요청', price:25000, stock:2, bookable:true },
  { id:'etc11', cat:'etc', name:'로닌 스몰리그 링그립', sub:'단독대여X', price:10000, stock:1, bookable:true },
  { id:'etc12', cat:'etc', name:'지윤 크레인 3s', sub:'링그립 포함', price:20000, stock:1, bookable:true },
  { id:'etc13', cat:'etc', name:'액순 씨네뷰 se', sub:'', price:15000, stock:2, bookable:true },
  { id:'etc14', cat:'etc', name:'코스모 홀리랜드 600', sub:'0딜레이 무선송수신기 송신기 화면 2초 뒤에 꺼짐(채널 4 고정), on off 스위치 고장(항상 on)', price:20000, stock:1, bookable:true },
  { id:'etc15', cat:'etc', name:'짐벌 깔대기', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc16', cat:'etc', name:'OSEE 4분할 스위처', sub:'', price:15000, stock:1, bookable:true },
  { id:'etc17', cat:'etc', name:'보조모니터 13인치', sub:'HDMI 가능', price:10000, stock:1, bookable:true },
  { id:'etc18', cat:'etc', name:'리벡 줌서보', sub:'LANC 단자', price:5000, stock:1, bookable:true },
  { id:'etc19', cat:'etc', name:'소니 멀티 단자 줌서보', sub:'소니 멀티 단자', price:3000, stock:1, bookable:true },
  { id:'etc20', cat:'etc', name:'렌즈서포터', sub:'', price:0, stock:1, bookable:true },
  { id:'etc21', cat:'etc', name:'스몰리그 매트박스 small', sub:'67, 72, 77, 82  디아', price:0, stock:1, bookable:true },
  { id:'etc22', cat:'etc', name:'스몰리그 매트박스 big', sub:'67, 72, 77, 82 디아', price:0, stock:1, bookable:true },
  { id:'etc23', cat:'etc', name:'틸타 수동 팔로우 포커스', sub:'', price:0, stock:1, bookable:true },
  { id:'etc24', cat:'etc', name:'숄더리그', sub:'', price:10000, stock:1, bookable:true },
  { id:'etc25', cat:'etc', name:'롤다리', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc26', cat:'etc', name:'레보링 67~82 ND 필터', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc27', cat:'etc', name:'애플박스', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc28', cat:'etc', name:'블랙매직 sdi to hdmi 컨버터', sub:'Sdi to hdmi 1, hdmi to sdi 1', price:5000, stock:2, bookable:true },
  { id:'etc29', cat:'etc', name:'짐벌 무선 컨트롤러', sub:'', price:30000, stock:1, bookable:true },
  { id:'etc30', cat:'etc', name:'짝퉁 이지리그', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc31', cat:'etc', name:'타리온 카트 프로', sub:'', price:15000, stock:1, bookable:true },
  { id:'etc32', cat:'etc', name:'조이포토', sub:'', price:5000, stock:1, bookable:true },
  { id:'etc33', cat:'etc', name:'삼성 4tb ssd', sub:'', price:15000, stock:1, bookable:true },
  { id:'etc34', cat:'etc', name:'V마운트 BP 290Wh', sub:'', price:0, stock:4, bookable:true },
  { id:'etc35', cat:'etc', name:'V마운트 BP 150Wh', sub:'C 단자 O', price:0, stock:4, bookable:true },
  { id:'etc36', cat:'etc', name:'V마운트 BP 99Wh', sub:'1개만 C 단자 O', price:0, stock:5, bookable:true },
  { id:'etc37', cat:'etc', name:'V마운트 BP 50Wh', sub:'C 단자 O', price:0, stock:2, bookable:true },
  { id:'etc38', cat:'etc', name:'970 배터리', sub:'', price:0, stock:6, bookable:true },
  { id:'etc39', cat:'etc', name:'소니 FZ100', sub:'', price:0, stock:7, bookable:true },
  { id:'etc40', cat:'etc', name:'BP-U30', sub:'', price:0, stock:3, bookable:true },
  { id:'etc41', cat:'etc', name:'BP-U35', sub:'', price:0, stock:1, bookable:true },
  { id:'etc42', cat:'etc', name:'V마운트 2구 차저', sub:'', price:0, stock:1, bookable:true },
  { id:'etc43', cat:'etc', name:'V마운트 1구 차저', sub:'', price:0, stock:1, bookable:true },
  { id:'etc44', cat:'etc', name:'CF-A 320gb', sub:'리더기', price:0, stock:2, bookable:true },
  { id:'etc45', cat:'etc', name:'CF-A 1.6tb', sub:'', price:0, stock:1, bookable:true },
  { id:'etc46', cat:'etc', name:'V30 SD 128', sub:'', price:0, stock:8, bookable:true },
  { id:'etc47', cat:'etc', name:'V60 SD 128', sub:'', price:0, stock:1, bookable:true },
  { id:'etc48', cat:'etc', name:'XQD 240gb', sub:'리더기', price:0, stock:2, bookable:true },
];

export const DEFAULT_EQUIPMENT = EQUIPMENT;

export const DEFAULT_SETS = [
  { id:'set_cam', name:'SET 카메라', price:270000, listPrice:310000,
    items:'FX9/FX6 + 7인치 모니터 + 100볼 트라이·베이비 + 1635G·2470GM2·70200GM2 + 숄더리그 + 크레인3s/RS3 PRO + 링그립 + 시택 17인치 필드모니터 + 액순 씨네뷰 SE + 인터컴 홀리랜드 SE PRO 6구 + V마운트 배터리 6개 + 2구 차저',
    note:'트라이·짐벌·핸드헬드 올인원! FX3로 변경 시 -20,000' },
  { id:'set_audio', name:'SET 음향', price:25000, listPrice:30000,
    items:'젠하이저 MKE 600 + 붐대 + 줌 H6 + 모니터링 헤드폰', note:'' },
  { id:'set_light', name:'SET 조명', price:50000, listPrice:65000,
    items:'난라이트 200s ×2 + 시네로이드 플렉시블 800v + 어퓨처 MC 4kit + 난라이트 파보튜브 6c + A스탠드 ×3 + 롱암 + 그립헤드 ×2', note:'' },
  { id:'set_all', name:'ALL IN ONE', price:450000, listPrice:605000,
    items:'SET 카메라 + SET 음향 + SET 조명 + 인천 내 차량 운용 반입·반출', note:'스케아트 풀 패키지' },
];

export const DEFAULT_EVENT_BANNERS = [];

export const DEFAULT_HOME_BANNER = [];

export const DEFAULT_NOTICES = [];

export const DEFAULT_BRANDS = [
  { id:'br_sony', name:'SONY',     q:'Sony',     tag:'시네마·미러리스', imageUrl:'' },
  { id:'br_canon', name:'CANON',   q:'Canon',    tag:'EOS R 시스템',   imageUrl:'' },
  { id:'br_fuji', name:'FUJIFILM', q:'Fujifilm', tag:'X·GFX 시리즈',   imageUrl:'' },
  { id:'br_sigma', name:'SIGMA',   q:'Sigma',    tag:'아트 렌즈',      imageUrl:'' },
  { id:'br_aputure', name:'APUTURE', q:'Aputure', tag:'조명',          imageUrl:'' },
  { id:'br_godox', name:'GODOX',   q:'Godox',    tag:'조명',           imageUrl:'' },
  { id:'br_dji', name:'DJI',       q:'DJI',      tag:'짐벌·드론',      imageUrl:'' },
  { id:'br_rode', name:'RØDE',     q:'RØDE',     tag:'오디오',         imageUrl:'' },
];

export const DEFAULT_DISCOUNTS = [
  { id:'dc_student30', label:'인천 소재 학생 30% 할인', type:'percent', value:30, min:60000, active:true },
  { id:'dc_student20', label:'학생 20% 할인',           type:'percent', value:20, min:60000, active:true },
  { id:'dc_local10',   label:'인천 지역 10% 할인',      type:'percent', value:10, min:60000, active:true },
];

export const ADMIN_EMAIL = 'skartefilm@naver.com';

export const ADMIN_PW = '1234';

export const RENTAL_COLORS = ['#E0DAC8','#CFE0D6','#E0CFD8','#CEDAE2','#E5DAC9','#D6DCC9','#D5D8E4','#E2D3CB'];

export const hashId = (s) => { let h=0; for (let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); };

export const colorOf = (id) => RENTAL_COLORS[hashId(String(id)) % RENTAL_COLORS.length];

export const rentalEndStr = (r) => {
  const e = new Date(r.start); e.setDate(e.getDate() + r.days - 1);
  return `${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,'0')}-${String(e.getDate()).padStart(2,'0')}`;
};

export function seedRentals() {
  const n = new Date();
  const y = n.getFullYear(), m = n.getMonth();
  const d = (day) => `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  return [
    { id:'r1', gearId:'cam2', qty:1, renter:'김감독', start:d(4),  days:3 },
    { id:'r2', gearId:'lens1', qty:2, renter:'이촬영', start:d(4),  days:2 },
    { id:'r3', gearId:'light1', qty:1, renter:'박PD',   start:d(11), days:4 },
    { id:'r4', gearId:'cam3', qty:1, renter:'최작가', start:d(15), days:1 },
    { id:'r5', gearId:'etc1', qty:1, renter:'정스튜디오', start:d(18), days:5 },
    { id:'r6', gearId:'lens2', qty:1, renter:'김감독', start:d(22), days:2 },
  ];
}

// 스케아트 장비 촬영 영상 (WORKS). { id, youtubeId, title, desc, gear }
// youtubeId: 유튜브 영상 ID (https://youtu.be/[여기] 또는 watch?v=[여기])
export const DEFAULT_WORKS = [];
