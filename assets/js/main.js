(function () {
  'use strict';
  var CONFIG = window.KOHARU_CONFIG || {};
  function $(id) { return document.getElementById(id); }
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // ===== ご相談者さまの声（reviews.js が空なら出さない） =====
  (function () {
    var reviews = (window.KOHARU_REVIEWS || []).filter(function (r) { return r && r.text && String(r.text).trim(); });
    var section = $('voices');
    if (!section || !reviews.length) return;
    var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function kanjiNum(n) {
      var d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      if (n < 10) return d[n];
      if (n < 100) return (n >= 20 ? d[Math.floor(n / 10)] : '') + '十' + d[n % 10];
      return String(n);
    }
    var track = $('voices-track');
    var total = reviews.length;
    $('voices-total').textContent = total;
    track.innerHTML = reviews.map(function (r, i) {
      var name = r.name && String(r.name).trim();
      return '<figure class="voice" aria-label="' + (i + 1) + '件目 / 全' + total + '件">' +
        '<div class="voice__body"><span class="voice__num" aria-hidden="true">' + kanjiNum(i + 1) + '通目</span>' +
        '<blockquote class="voice__text">' + esc(r.text) + '</blockquote></div>' +
        (name ? '<figcaption class="voice__name">— ' + esc(name) + ' 様</figcaption>' : '') + '</figure>';
    }).join('');
    var cards = track.children;
    var current = -1;
    var dots = reviews.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'voices__dot';
      b.setAttribute('aria-label', (i + 1) + '件目を表示');
      b.addEventListener('click', function () { goTo(i); });
      $('voices-dots').appendChild(b);
      return b;
    });
    if (total < 2) section.querySelector('.voices__nav').hidden = true;
    function setCurrent(i) {
      if (i === current) return;
      current = i;
      $('voices-current').textContent = i + 1;
      dots.forEach(function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    }
    function goTo(i) { track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: REDUCE ? 'auto' : 'smooth' }); }
    var tick = false;
    track.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
        var i = Math.round(track.scrollLeft / step);
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) i = total - 1;
        setCurrent(Math.max(0, Math.min(total - 1, i)));
      });
    }, { passive: true });
    setCurrent(0);
    section.hidden = false;
  })();

  // ===== 生年月日 =====
  var thisYear = new Date().getFullYear();
  function add(sel, from, to) {
    for (var i = from; from <= to ? i <= to : i >= to; from <= to ? i++ : i--) {
      var o = document.createElement('option');
      o.value = i; o.textContent = i;
      sel.appendChild(o);
    }
  }
  add($('year'), thisYear - 18, thisYear - 100);
  add($('pyear'), thisYear - 10, thisYear - 100);
  // 年は 1980 を選んだ状態から始める（月・日が空なら「なし」として扱う）
  $('year').value = $('pyear').value = '1980';
  ['', 'p'].forEach(function (p) {
    add($(p + 'month'), 1, 12);
    add($(p + 'day'), 1, 31);
  });
  // 年・月・日がそろっていれば日付の文字、月・日が空なら ''、途中までなら null
  function birth(p) {
    var v = [$(p + 'year').value, $(p + 'month').value, $(p + 'day').value];
    if (!v[1] && !v[2]) return '';
    if (!v[0] || !v[1] || !v[2]) return null;
    return v[0] + '年' + v[1] + '月' + v[2] + '日';
  }

  var form = $('form');
  var error = $('error');

  // 入力を確かめて集める。足りなければ errEl に書いて null
  function collect(errEl) {
    var name = $('name').value.trim();
    var kind = form.querySelector('input[name="kind"]:checked');
    var concern = $('concern').value.trim();
    var hasPartner = $('has-partner').checked;
    var pname = hasPartner ? $('pname').value.trim() : '';
    var myBirth = birth('');
    var pBirth = hasPartner ? birth('p') : '';
    var missing = [];
    if (!name) missing.push('お名前');
    if (myBirth === null) missing.push('生年月日（年・月・日すべて）');
    if (!kind) missing.push('悩みの種類');
    if (!concern) missing.push('悩みの内容');
    if (pBirth === null) missing.push('お相手の生年月日（年・月・日すべて）');
    if (missing.length) { errEl.textContent = missing.join('・') + 'を入力してください'; return null; }
    if (!$('adult').checked) { errEl.textContent = '18歳以上の方のみ鑑定をお受けしています'; return null; }
    errEl.textContent = '';
    return { name: name, birth: myBirth, kind: kind.value, concern: concern, pname: pname, pbirth: pBirth };
  }

  // お相手のこと：チェックを入れたときだけ、名前と生年月日の欄を出す
  $('has-partner').addEventListener('change', function () {
    $('partner').hidden = !this.checked;
    this.setAttribute('aria-expanded', String(this.checked));
  });

  // お届け先：メールを選んだときだけ、メール欄とお知らせメールの同意を出す
  function deliverTo() { return form.querySelector('input[name="to"]:checked').value; }
  function syncTo() {
    var mail = deliverTo() === 'mail';
    $('mail-fields').hidden = !mail;
    $('optin-field').hidden = !mail;
    $('line-note').hidden = mail;
  }
  form.querySelectorAll('input[name="to"]').forEach(function (r) { r.addEventListener('change', syncTo); });
  syncTo();

  // スプレッドシートへの記録（Apps Script）。text/plain で送るので事前確認なしで届く
  function record(payload) {
    if (!CONFIG.FORM_ENDPOINT) return Promise.resolve();
    var body = JSON.stringify(payload);
    if (payload.delivery === 'LINE' && navigator.sendBeacon &&
        navigator.sendBeacon(CONFIG.FORM_ENDPOINT, new Blob([body], { type: 'text/plain;charset=utf-8' }))) {
      return Promise.resolve();
    }
    return fetch(CONFIG.FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body });
  }
  function toSheet(d, delivery) {
    return {
      type: 'apply', delivery: delivery, concern: d.kind, detail: d.concern, name: d.name,
      birthday: d.birth || 'なし', partnerBirthday: (d.pname || d.pbirth) ? (d.pname || '不明') + '／' + (d.pbirth || '不明') : '',
      email: d.email || '', adult: true, newsletter: !!d.optin
    };
  }

  var send = $('send');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (send.disabled) return;
    if ($('website').value) return; // いたずら送信
    var d = collect(error);
    if (!d) return;
    if (deliverTo() === 'line') sendLine(d);
    else sendMail(d);
  });

  // LINE：内容が入った状態で小春の公式LINEを開く（ボタンを押したその場で開く）
  function sendLine(d) {
    var lines = [
      '【初回鑑定用】',
      '',
      '① 〈' + d.kind + '〉',
      d.concern,
      '② ' + d.name,
      '③ ' + (d.birth || 'なし')
    ];
    if (d.pname || d.pbirth) lines.push('', 'お相手：' + (d.pname || '不明') + '／' + (d.pbirth || '不明'));
    record(toSheet(d, 'LINE'));
    location.href = 'https://line.me/R/oaMessage/' + encodeURIComponent(CONFIG.LINE_ID) + '/?' + encodeURIComponent(lines.join('\n'));
  }

  // メール：内容をスプレッドシートに記録し、完了の画面を出す
  function sendMail(d) {
    var email = $('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error.textContent = 'メールアドレスを正しく入力してください'; $('email').focus(); return; }
    d.email = email;
    d.optin = $('optin').checked;
    send.disabled = true;
    error.textContent = '';
    record(toSheet(d, 'メール')).then(function () {
      form.hidden = true;
      var done = $('done');
      done.hidden = false;
      $('form-title').scrollIntoView({ behavior: 'smooth' });
      done.focus({ preventScroll: true });
    }).catch(function () {
      error.textContent = 'うまく送れませんでした。お手数ですが、少し時間をおいてもう一度お試しください。';
      send.disabled = false;
    });
  }

  // フォームが見えたら、下の「ご相談」ボタンを消す
  var backToForm = document.querySelector('.back-to-form');
  function updateScrollButton() {
    var r = $('form-title').getBoundingClientRect();
    backToForm.hidden = window.scrollY < 400 || r.top < window.innerHeight;
  }
  window.addEventListener('scroll', updateScrollButton, { passive: true });
  updateScrollButton();
})();
