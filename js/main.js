/* ============================================================
   김희준 ♡ 한예빈 모바일 청첩장 - main.js
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 설정 ---------- */
  var CONFIG = {
    weddingAt: new Date('2026-10-18T17:00:00+09:00'),
    groom: '김희준',
    bride: '한예빈',
    shareTitle: '김희준 ♡ 한예빈 결혼합니다',
    shareDesc: '2026년 10월 18일 일요일 오후 5시\n라시따시어터 1층 그랜드볼룸',

    // ▼▼▼ [1] 카카오 JavaScript 키 — '카카오톡 전하기' + 카카오맵 활성화
    kakaoJsKey: '11a72bff610fba485eb712d84f3b1e47',

    // 예식장 좌표 (카카오맵 표시용)
    venue: { name: '라시따시어터', lat: 37.4695, lng: 127.0380 },

    // ▼▼▼ [2] Firebase 설정 — 방명록 실제 저장 (Firestore 'guestbook' 컬렉션)
    firebase: {
      apiKey: 'AIzaSyBa3vzzGwj32K4ecn5xsuHVdXfcjI6pxcg',
      authDomain: 'wedding-30147.firebaseapp.com',
      projectId: 'wedding-30147',
      storageBucket: 'wedding-30147.firebasestorage.app',
      messagingSenderId: '997245103079',
      appId: '1:997245103079:web:267f2735bea955b5ad2b42'
    },
    // 갤러리: 폴더 저장 순서(01~26.jpg) → g01~g26.jpg, 3열 정사각 썸네일 + 더보기
    galleryInit: 12,
    gallery: (function () { var a = []; for (var i = 1; i <= 30; i++) a.push('g' + ('0' + i).slice(-2) + '.jpg'); return a; })()
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // 외부 SDK(카카오/Firebase)는 키가 있을 때만 동적으로 로드
  var _scriptCache = {};
  function loadScript(src, attrs) {
    if (_scriptCache[src]) return _scriptCache[src];
    _scriptCache[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('script load failed: ' + src)); };
      document.head.appendChild(s);
    });
    return _scriptCache[src];
  }

  /* ---------- 인트로 ---------- */
  window.addEventListener('load', function () {
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var intro = $('#intro');
      if (intro) intro.classList.add('hide');
      document.body.style.overflow = '';
      // 커버 텍스트 등장
      $$('.cover .reveal').forEach(function (el, i) {
        setTimeout(function () { el.classList.add('in'); }, 250 + i * 350);
      });
    }, 2600);
  });

  /* ---------- 스크롤 리빌 ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  $$('.reveal').forEach(function (el) { if (!el.closest('.cover')) io.observe(el); });

  /* ---------- 캘린더 ---------- */
  (function buildCalendar() {
    var el = $('#calendar'); if (!el) return;
    var y = 2026, m = 9, markDay = 18; // m: 0-based (9 = 10월)
    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    var heads = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    var html = '<div class="calendar__grid">';
    heads.forEach(function (h, i) {
      html += '<div class="calendar__head' + (i === 0 ? ' sun' : '') + '">' + h + '</div>';
    });
    for (var i = 0; i < first; i++) html += '<div class="calendar__cell"></div>';
    for (var d = 1; d <= days; d++) {
      var dow = (first + d - 1) % 7;
      var cls = 'calendar__cell' + (dow === 0 ? ' sun' : '') + (d === markDay ? ' mark' : '');
      html += '<div class="' + cls + '"><span>' + d + '</span></div>';
    }
    html += '</div>';
    el.innerHTML = html;
  })();

  /* ---------- 디데이 카운트다운 ---------- */
  (function countdown() {
    var dd = $('#dd-day'), hh = $('#dd-hour'), mm = $('#dd-min'), ss = $('#dd-sec');
    var txt = $('#dday-text'); if (!dd) return;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function tick() {
      var now = new Date();
      var diff = CONFIG.weddingAt - now;
      if (diff < 0) {
        dd.textContent = '0'; hh.textContent = '00'; mm.textContent = '00'; ss.textContent = '00';
        txt.innerHTML = '두 사람의 새로운 시작을 축복해 주세요';
        return;
      }
      var s = Math.floor(diff / 1000);
      var day = Math.floor(s / 86400);
      var hour = Math.floor((s % 86400) / 3600);
      var min = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      dd.textContent = day; hh.textContent = pad(hour); mm.textContent = pad(min); ss.textContent = pad(sec);
      txt.innerHTML = CONFIG.groom + ' ♡ ' + CONFIG.bride + '의 결혼식이 <b>' + day + '일</b> 남았습니다';
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ---------- 갤러리 ---------- */
  (function gallery() {
    var grid = $('#galleryGrid'); if (!grid) return;
    var INIT = CONFIG.galleryInit || 12;
    var html = '';
    CONFIG.gallery.forEach(function (f, i) {
      var hide = i >= INIT ? ' is-hidden' : '';
      html += '<div class="gallery__item' + hide + '" data-i="' + i + '">' +
        '<img loading="lazy" src="assets/images/gallery/' + f + '" alt="갤러리 ' + (i + 1) + '" /></div>';
    });
    grid.innerHTML = html;

    var moreBtn = $('#galleryMore');
    if (moreBtn && CONFIG.gallery.length > INIT) {
      moreBtn.hidden = false;
      moreBtn.addEventListener('click', function () {
        $$('.gallery__item.is-hidden', grid).forEach(function (el) { el.classList.remove('is-hidden'); });
        moreBtn.hidden = true;
      });
    }

    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
    var stage = lbImg.parentElement;
    var cur = 0;

    // 확대(줌) 상태
    var scale = 1, tx = 0, ty = 0;
    function applyT(anim) {
      lbImg.style.transition = anim ? 'transform .2s ease' : 'none';
      lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    }
    function resetZoom(anim) { scale = 1; tx = 0; ty = 0; applyT(anim); }
    function clampPan() {
      var maxX = Math.max(0, (lbImg.clientWidth * scale - window.innerWidth) / 2 + 30);
      var maxY = Math.max(0, (lbImg.clientHeight * scale - window.innerHeight) / 2 + 30);
      tx = Math.max(-maxX, Math.min(maxX, tx));
      ty = Math.max(-maxY, Math.min(maxY, ty));
    }

    function open(i) {
      cur = i;
      resetZoom(false);
      var f = CONFIG.gallery[i];
      lbImg.src = 'assets/images/gallery/' + f;          // 썸네일 즉시 표시(이미 캐시됨)
      var hi = new Image();
      hi.onload = function () {
        if (cur === i) lbImg.src = 'assets/images/gallery/full/' + f; // 고해상도 원본으로 교체
        [i + 1, i - 1].forEach(function (j) {                          // 인접 사진 미리 불러오기(넘길 때 버퍼링 방지)
          var n = (j + CONFIG.gallery.length) % CONFIG.gallery.length;
          (new Image()).src = 'assets/images/gallery/full/' + CONFIG.gallery[n];
        });
      };
      hi.src = 'assets/images/gallery/full/' + f;
      lbCount.textContent = (i + 1) + ' / ' + CONFIG.gallery.length;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    }
    function move(d) { cur = (cur + d + CONFIG.gallery.length) % CONFIG.gallery.length; open(cur); }
    function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); resetZoom(false); }

    grid.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery__item'); if (item) open(+item.dataset.i);
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { move(-1); });
    $('#lbNext').addEventListener('click', function () { move(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    function toggleZoom(pt) {
      if (scale > 1) { resetZoom(true); }
      else {
        scale = 2.5;
        if (pt) { tx = (window.innerWidth / 2 - pt.clientX) * (scale - 1); ty = (window.innerHeight / 2 - pt.clientY) * (scale - 1); }
        clampPan(); applyT(true);
      }
    }

    // 터치: 핀치 확대 / 드래그 이동 / 스와이프 넘기기 / 더블탭 확대
    var mode = '', startDist = 0, startScale = 1, panX = 0, panY = 0, swipeX = 0, lastTap = 0;
    function tdist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) { mode = 'pinch'; startDist = tdist(e.touches); startScale = scale; }
      else if (e.touches.length === 1) {
        var now = Date.now();
        if (now - lastTap < 300) { e.preventDefault(); toggleZoom(e.touches[0]); mode = ''; lastTap = 0; return; }
        lastTap = now;
        if (scale > 1) { mode = 'pan'; panX = e.touches[0].clientX - tx; panY = e.touches[0].clientY - ty; }
        else { mode = 'swipe'; swipeX = e.touches[0].clientX; }
      }
    }, { passive: false });

    stage.addEventListener('touchmove', function (e) {
      if (mode === 'pinch' && e.touches.length === 2) {
        e.preventDefault();
        scale = Math.max(1, Math.min(3,startScale * tdist(e.touches) / startDist));
        if (scale <= 1) { tx = 0; ty = 0; }
        clampPan(); applyT(false);
      } else if (mode === 'pan' && e.touches.length === 1) {
        e.preventDefault();
        tx = e.touches[0].clientX - panX; ty = e.touches[0].clientY - panY;
        clampPan(); applyT(false);
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (e) {
      if (mode === 'swipe') {
        var dx = e.changedTouches[0].clientX - swipeX;
        if (Math.abs(dx) > 50) move(dx > 0 ? -1 : 1);
      }
      if (scale <= 1.02) resetZoom(true);
      mode = '';
    }, { passive: true });

    // 데스크탑: 더블클릭 / 휠 확대
    lbImg.addEventListener('dblclick', function (e) { toggleZoom(e); });
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      scale = Math.max(1, Math.min(3,scale - e.deltaY * 0.0015));
      if (scale <= 1) { tx = 0; ty = 0; }
      clampPan(); applyT(false);
    }, { passive: false });
  })();

  /* ---------- 카카오맵 (키 입력 시 OSM → 카카오맵 교체) ---------- */
  (function kakaoMap() {
    if (!CONFIG.kakaoJsKey) return;
    var mapEl = $('#map'); if (!mapEl) return;
    var s = document.createElement('script');
    s.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + CONFIG.kakaoJsKey + '&autoload=false&libraries=services';
    s.onload = function () {
      if (!window.kakao || !kakao.maps) return;
      kakao.maps.load(function () {
        mapEl.innerHTML = '';
        mapEl.style.height = '240px';
        var center = new kakao.maps.LatLng(CONFIG.venue.lat, CONFIG.venue.lng);
        var map = new kakao.maps.Map(mapEl, { center: center, level: 4 });
        new kakao.maps.Marker({ position: center, map: map });
        map.setZoomable(false);
      });
    };
    document.head.appendChild(s);
  })();

  /* ---------- 아코디언 (계좌) ---------- */
  $$('.acc__head').forEach(function (h) {
    h.addEventListener('click', function () { h.parentElement.classList.toggle('open'); });
  });

  /* ---------- 복사 + 토스트 ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1900);
  }
  function copyText(text) {
    return new Promise(function (resolve) {
      function legacy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.left = '0'; ta.style.opacity = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { ta.setSelectionRange(0, ta.value.length); } catch (e) {}
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        resolve();
      }
      // 카카오톡 인앱 브라우저 등에서 clipboard API가 막히면 자동으로 execCommand로 대체
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { resolve(); }, legacy);
      } else {
        legacy();
      }
    });
  }
  $$('.acc__copy').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.dataset.copy).then(function () {
        toast((b.dataset.label || '') + ' 계좌번호가 복사되었습니다');
      });
    });
  });

  // 오시는 길 - 주소 복사
  var copyAddrBtn = $('#copyAddrBtn');
  if (copyAddrBtn) {
    copyAddrBtn.addEventListener('click', function () {
      copyText(copyAddrBtn.dataset.addr).then(function () { toast('주소가 복사되었습니다'); });
    });
  }

  /* ---------- 방명록 (Firebase 우선, 없으면 localStorage 데모) ---------- */
  (function guestbook() {
    var KEY = 'wedding_guestbook_v1';
    var listEl = $('#guestList'), moreBtn = $('#guestMore');
    var modal = $('#guestModal');
    var shown = 3;
    var data = [];

    // Firebase 사용 여부 (설정값이 있으면 SDK를 동적으로 로드)
    var wantFB = !!(CONFIG.firebase && CONFIG.firebase.projectId);
    var useFB = false;
    var db = null;

    function todayStr() {
      var n = new Date();
      return n.getFullYear() + '.' + ('0' + (n.getMonth() + 1)).slice(-2) + '.' + ('0' + n.getDate()).slice(-2);
    }

    function loadLocal() {
      try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
    }
    function saveLocal(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

    // 데이터 로드
    function fetchAll() {
      if (useFB) {
        return db.collection('guestbook').orderBy('ts', 'desc').get().then(function (snap) {
          data = []; snap.forEach(function (doc) { data.push(doc.data()); });
          render();
        }).catch(function () { useFB = false; bootLocal(); });
      }
      bootLocal();
      return Promise.resolve();
    }
    function bootLocal() {
      data = loadLocal();
      if (!data) {
        data = [
          { n: '김민수', m: '두 분의 앞날에 늘 행복만 가득하길 바랍니다. 결혼 축하해요!', d: '2026.06.10' },
          { n: '이서연', m: '예쁜 신부, 멋진 신랑! 평생 지금처럼 사랑하며 사세요 💐', d: '2026.06.09' }
        ];
        saveLocal(data);
      }
      render();
    }

    function addEntry(entry) {
      if (useFB) {
        entry.ts = Date.now();
        return db.collection('guestbook').add(entry).then(function () { return fetchAll(); });
      }
      data.unshift(entry); saveLocal(data);
      shown = 3; render();
      return Promise.resolve();
    }

    function render() {
      if (!data.length) {
        listEl.innerHTML = '<li class="guest__empty">첫 번째 축하 메시지를 남겨주세요 ♡</li>';
        moreBtn.hidden = true; return;
      }
      var slice = data.slice(0, shown);
      listEl.innerHTML = slice.map(function (g) {
        return '<li class="guest__card"><div class="guest__top">' +
          '<span class="guest__name">' + esc(g.n) + '</span>' +
          '<span class="guest__date">' + esc(g.d) + '</span></div>' +
          '<p class="guest__text">' + esc(g.m) + '</p></li>';
      }).join('');
      moreBtn.hidden = data.length <= shown;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    moreBtn.addEventListener('click', function () { shown += 5; render(); });

    $('#guestWrite').addEventListener('click', function () { modal.classList.add('open'); });
    $('#gCancel').addEventListener('click', function () { modal.classList.remove('open'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
    var saving = false;
    $('#gSave').addEventListener('click', function () {
      if (saving) return;
      var n = $('#gName').value.trim(), m = $('#gMsg').value.trim();
      if (!n) { toast('이름을 입력해 주세요'); return; }
      if (!m) { toast('메시지를 입력해 주세요'); return; }
      saving = true;
      addEntry({ n: n, m: m, d: todayStr() }).then(function () {
        $('#gName').value = ''; $('#gMsg').value = '';
        modal.classList.remove('open');
        shown = 3;
        toast('축하 메시지가 등록되었습니다 ♡');
      }).catch(function () {
        toast('등록에 실패했습니다. 잠시 후 다시 시도해 주세요');
      }).then(function () { saving = false; });
    });

    // 초기 로드: Firebase 설정이 있으면 SDK 로드 후 Firestore, 없으면 로컬 데모
    if (wantFB) {
      var FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
      loadScript(FB + 'firebase-app-compat.js')
        .then(function () { return loadScript(FB + 'firebase-firestore-compat.js'); })
        .then(function () {
          try {
            if (!firebase.apps.length) firebase.initializeApp(CONFIG.firebase);
            db = firebase.firestore(); useFB = true;
          } catch (e) { useFB = false; }
          fetchAll();
        })
        .catch(function () { bootLocal(); });
    } else {
      bootLocal();
    }
  })();

  /* ---------- 공유 (카카오 / 링크 복사) ---------- */
  (function share() {
    var kakaoBtn = $('#shareKakao'), linkBtn = $('#shareLink');
    var url = location.href;

    var kakaoReady = false;
    if (CONFIG.kakaoJsKey) {
      loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js', {
        integrity: 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4',
        crossorigin: 'anonymous'
      }).then(function () {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(CONFIG.kakaoJsKey);
          kakaoReady = window.Kakao.isInitialized();
        } catch (e) {}
      }).catch(function () {});
    }

    kakaoBtn.addEventListener('click', function () {
      if (kakaoReady) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: CONFIG.shareTitle,
            description: CONFIG.shareDesc,
            imageUrl: location.origin + location.pathname.replace(/index\.html$/, '') + 'assets/images/share.jpg',
            link: { mobileWebUrl: url, webUrl: url }
          },
          buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: url, webUrl: url } }]
        });
      } else if (navigator.share) {
        navigator.share({ title: CONFIG.shareTitle, text: CONFIG.shareDesc, url: url }).catch(function () {});
      } else {
        copyText(url).then(function () { toast('청첩장 주소가 복사되었습니다'); });
      }
    });

    linkBtn.addEventListener('click', function () {
      copyText(url).then(function () { toast('청첩장 주소가 복사되었습니다'); });
    });
  })();

  /* ---------- 배경음악 ---------- */
  (function music() {
    var btn = $('#musicToggle'), audio = $('#bgm'); if (!btn || !audio) return;
    audio.volume = 0.55;
    var playing = false, userPaused = false;
    function setState(p) { playing = p; btn.classList.toggle('playing', p); }
    function play() {
      var pr = audio.play();
      if (pr && pr.then) pr.then(function () { setState(true); }).catch(function () { setState(false); });
      else setState(true);
    }
    function pause() { audio.pause(); setState(false); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); }
    });
    // 시작 시 자동재생 시도
    play();
    // 브라우저가 막으면 첫 화면 터치/클릭에서 재생 (사용자가 직접 끈 경우는 제외)
    function autoOnce() {
      document.removeEventListener('touchstart', autoOnce);
      document.removeEventListener('click', autoOnce);
      if (!playing && !userPaused) play();
    }
    document.addEventListener('touchstart', autoOnce);
    document.addEventListener('click', autoOnce);
  })();

})();
