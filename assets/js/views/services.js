/* ==========================================================================
   صفحه خدمات غیرحضوری — همه ۲۰ خدمت با فیلتر دسته و جستجو
   ========================================================================== */
window.Views = window.Views || {};

(function () {
  'use strict';

  var state = { q: '', cat: '' };

  function renderList() {
    var ql = window.enDigits(state.q).trim().toLowerCase();
    var list = window.SERVICES.filter(function (s) {
      var okCat = !state.cat || s.cat === state.cat;
      var okQ = !ql || (s.title + ' ' + s.short + ' ' + s.desc).toLowerCase().indexOf(ql) !== -1;
      return okCat && okQ;
    });
    var box = document.getElementById('svc-grid-page');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<div class="card" style="grid-column:1/-1">' +
        window.UI.empty({ icon: 'search', title: 'خدمتی مطابق جستجوی شما یافت نشد', desc: 'عبارت دیگری را امتحان کنید یا موضوع خود را از طریق ثبت تیکت با کارشناسان در میان بگذارید.', action: { href: '#/tickets', label: 'ثبت تیکت به پشتیبانی' } }) + '</div>';
      var cnt = document.getElementById('svc-count');
      if (cnt) cnt.textContent = '۰ خدمت';
      return;
    }
    box.innerHTML = list.map(window.UI.serviceCard).join('');
    var cnt2 = document.getElementById('svc-count');
    if (cnt2) cnt2.textContent = window.fa(list.length) + ' خدمت از ' + window.fa(window.SERVICES.length) + ' خدمت';
  }

  window.Views.services = {
    render: function (params) {
      state = { q: '', cat: (params && params.cat) || '' };
      var catCounts = {};
      window.SERVICES.forEach(function (s) { catCounts[s.cat] = (catCounts[s.cat] || 0) + 1; });

      return '<div class="page-head anim-in">' +
          '<div><h1 class="page-title">' + window.icon('grid') + 'خدمات غیرحضوری</h1>' +
          '<div class="page-sub">' + window.fa(window.SERVICES.length) + ' خدمت در ' + window.fa(window.CATS.length) + ' دسته‌بندی — خدمت موردنظر را انتخاب و فرم اختصاصی آن را تکمیل کنید.</div></div>' +
        '</div>' +

        '<div class="alert al-info anim-in-1" style="margin-bottom:16px">' +
          '<span class="al-ic">' + window.icon('info') + '</span>' +
          '<div><div class="al-title">راهنمای ثبت درخواست</div>' +
          '<div class="al-desc">پیش از ثبت، مدارک موردنیاز هر خدمت در راهنمای همان خدمت نمایش داده می‌شود. پس از ثبت، شماره پیگیری دریافت می‌کنید و تمام مراحل از بخش «درخواست‌های من» قابل پیگیری است.</div></div>' +
        '</div>' +

        '<div class="svc-tools anim-in-2">' +
          '<div class="svc-search">' + window.icon('search') +
            '<input class="input" id="svc-q" placeholder="جستجوی بر اساس نام خدمت..." value="">' +
          '</div>' +
          '<span class="text-sm text-muted" id="svc-count">' + window.fa(window.SERVICES.length) + ' خدمت</span>' +
        '</div>' +
        '<div class="svc-cats" style="margin-bottom:16px" id="svc-cats">' +
          '<button class="chip' + (state.cat ? '' : ' active') + '" data-cat="">همه <span class="chip-n">' + window.fa(window.SERVICES.length) + '</span></button>' +
          window.CATS.map(function (c) {
            return '<button class="chip' + (state.cat === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' + window.icon(c.icon) + c.label + ' <span class="chip-n">' + window.fa(catCounts[c.id] || 0) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="svc-grid" id="svc-grid-page"></div>';
    },

    afterRender: function () { renderList(); },

    bind: function (root) {
      var q = root.querySelector('#svc-q');
      if (q) q.addEventListener('input', function () { state.q = q.value; renderList(); });
      root.querySelectorAll('[data-cat]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.cat = b.getAttribute('data-cat');
          root.querySelectorAll('[data-cat]').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          renderList();
        });
      });
    }
  };
})();
