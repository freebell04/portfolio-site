/* =========================================================
   최진서 포트폴리오 — GA4 이벤트 추적 (track.js)
   index.html </body> 앞의 <script src="track.js"></script> 로 불러옴

   menu_*    어떤 메뉴를 봤나 (about / solution / work / contact)
   work_*    어떤 작업물 카드를 눌렀나 (작업물마다 이벤트 이름이 따로 있음)
   filter_*  Work 필터 버튼
   contact_* 어떤 방법으로 연락하려 했나
   ========================================================= */
(function () {
  function send(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  /* ---- 작업물 카드 제목 → 이벤트 이름 ---- */
  var WORKS = [
    // 마케팅
    [/자동화 프로그램 홍보/,     'work_mkt_program_promo'],
    [/처음 만나는 대한민국/,     'work_mkt_korea'],
    [/모야 ?ZIP/i,              'work_mkt_moyazip_blog'],
    [/리에티/,                  'work_mkt_rieti'],
    [/스파르타/,                'work_mkt_sparta'],
    [/크리치오/,                'work_mkt_crichio'],
    // UX·UI
    [/블로그 자동화 프로그램/,   'work_ux_blog_program'],
    [/SWM|공부습관/i,           'work_ux_swm'],
    [/카리스|CHARIS/i,          'work_ux_charis'],
    // 디자인
    [/카페|X배너|메뉴판/,        'work_design_cafe_banner'],
    [/렌지/,                    'work_design_rangeguard'],
    [/어학연수/,                'work_design_study_guide'],
    [/츄|슬로건/,               'work_design_chuu_slogan'],
    [/졸업전시|도록|STEP UP/i,   'work_design_graduation']
  ];
  function workEventName(title) {
    for (var i = 0; i < WORKS.length; i++) if (WORKS[i][0].test(title)) return WORKS[i][1];
    return 'work_etc';
  }

  /* ---- 1) 메뉴 전환 ---- */
  var last = '';
  function reportActive() {
    var p = document.querySelector('.page.active');
    if (p && p.id && p.id !== last) { last = p.id; send('menu_' + p.id); }
  }
  document.querySelectorAll('.page').forEach(function (p) {
    new MutationObserver(reportActive).observe(p, { attributes: true, attributeFilter: ['class'] });
  });
  if (document.readyState === 'complete') reportActive();
  else window.addEventListener('load', reportActive);

  /* ---- 2) 클릭 ---- */
  document.addEventListener('click', function (e) {
    var t = e.target;

    // 작업물 카드 (About 미리보기 / Work 둘 다)
    var work = t.closest('.work-card');
    if (work) {
      var h = work.querySelector('h4');
      var title = clean(h ? h.textContent : work.textContent).slice(0, 80);
      var sec = work.closest('.page');
      var where = sec ? sec.id : '';
      send(workEventName(title), { work_title: title, card_location: where });
      send('work_click_all', { work_title: title, card_location: where });
      return;
    }

    // Work 필터 버튼
    var fb = t.closest('#workFilter button');
    if (fb) {
      var f = clean(fb.textContent), k = 'etc';
      if (/전체|all/i.test(f)) k = 'all';
      else if (/마케팅/.test(f)) k = 'mkt';
      else if (/UX|UI/i.test(f)) k = 'ux';
      else if (/디자인/.test(f)) k = 'design';
      send('filter_' + k, { filter_name: f });
      return;
    }

    // 연락
    if (t.closest('[onclick*="handleContact"]')) { send('contact_email'); return; }
    if (t.closest('#kakaoBtnMain, #kakaoBtnNav, a[href*="kakao"]')) { send('contact_kakao'); return; }
    if (t.closest('.fab-insta, a[href*="instagram.com"]')) { send('contact_instagram'); return; }
    if (t.closest('.fab-blog, a[href*="blog.naver.com"]')) { send('contact_blog'); return; }
    var mail = t.closest('a[href^="mailto:"]');
    if (mail) { send('contact_email'); return; }
  }, true);
})();
