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

    // ▼▼▼ [1] 카카오 JavaScript 키 — 넣으면 '카카오톡 전하기' + 카카오맵이 켜집니다.
    //         (https://developers.kakao.com → 내 애플리케이션 → 앱 키 → JavaScript 키)
    kakaoJsKey: '',

    // 예식장 좌표 (카카오맵 표시용)
    venue: { name: '라시따시어터', lat: 37.4695, lng: 127.0380 },

    // ▼▼▼ [2] Firebase 설정 — 넣으면 방명록이 실제 DB에 저장됩니다. (비워두면 브라우저 임시저장)
    //         (https://console.firebase.google.com → 프로젝트 설정 → 내 앱(웹) → SDK 설정)
    firebase: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    },
    // 갤러리: 폴더 저장 순서(01~26.jpg) → g01~g26.jpg, 3열 정사각 썸네일 + 더보기
    galleryInit: 12,
    gallery: (function () { var a = []; for (var i = 1; i <= 26; i++) a.push('g' + ('0' + i).slice(-2) + '.jpg'); return a; })()
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
    var cur = 0;
    function open(i) {
      cur = i;
      lbImg.src = 'assets/images/gallery/' + CONFIG.gallery[i];
      lbCount.textContent = (i + 1) + ' / ' + CONFIG.gallery.length;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    }
    function move(d) { cur = (cur + d + CONFIG.gallery.length) % CONFIG.gallery.length; open(cur); }
    grid.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery__item'); if (item) open(+item.dataset.i);
    });
    $('#lbClose').addEventListener('click', function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); });
    $('#lbPrev').addEventListener('click', function () { move(-1); });
    $('#lbNext').addEventListener('click', function () { move(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) { lb.classList.remove('open'); } });
    // 스와이프
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) move(dx > 0 ? -1 : 1);
    });
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (res) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); res();
    });
  }
  $$('.acc__copy').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.dataset.copy).then(function () {
        toast((b.dataset.label || '') + ' 계좌번호가 복사되었습니다');
      });
    });
  });

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
            imageUrl: location.origin + location.pathname.replace(/index\.html$/, '') + 'assets/images/hero.jpg',
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
