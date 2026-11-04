/* ==========================================================================
   صفحه اصلی داشبورد — خلاصه وضعیت + خدمات + درخواست‌های من
   ========================================================================== */
window.Views = window.Views || {};

(function () {
  'use strict';

  var esc = window.UI.esc;

  /* مرتب‌سازی کرونولوژیک نمونه: درخواست‌های جدید (ثبت‌شده) اول */
  function allRequests() { return window.Store.requests(); }

  function statTile(o) {
    return '<button class="stat" data-action="' + o.action + '"' + (o.data || '') + '>' +
      '<span class="stat-ic" style="background:color-mix(in srgb,' + o.color + ' 11%,transparent);color:' + o.color + '">' + window.icon(o.icon) + '</span>' +
      '<span><span class="stat-v">' + window.fa(o.value) + '</span><span class="stat-l" style="display:block">' + o.label + '</span></span>' +
    '</button>';
  }

  /* جدول درخواست‌های اخیر با تب‌ها */
  var homeReqState = { tab: 'all' };
  function recentTable() {
    var list = allRequests();
    if (homeReqState.tab !== 'all') list = list.filter(function (r) { return r.status === homeReqState.tab; });
    list = list.slice(0, 5);
    var box = document.getElementById('home-req-table');
    if (box) box.innerHTML = window.UI.reqTable(list);
  }

  window.Views.home = {
    render: function () {
      var p = window.PROFILE;
      var reqs = allRequests();
      var cnt = function (s) { return reqs.filter(function (r) { return r.status === s; }).length; };
      var unanswered = window.Store.tickets().filter(function (t) { return t.status === 'open'; }).length;
      var anns = window.ANNOUNCEMENTS.filter(function (a) { return !window.Store.isDismissed(a.id); });
      var unread = window.Store.unreadCount();

      var stats =
        statTile({ icon: 'clipboard-list', color: 'var(--chart-1)', value: reqs.length, label: 'کل درخواست‌ها', action: 'go-requests' }) +
        statTile({ icon: 'clock', color: 'var(--primary)', value: cnt('active'), label: 'درخواست‌های فعال', action: 'go-requests', data: ' data-tab="active"' }) +
        statTile({ icon: 'loader', color: 'var(--chart-5)', value: cnt('doing'), label: 'در حال انجام', action: 'go-requests', data: ' data-tab="doing"' }) +
        statTile({ icon: 'circle-check', color: 'var(--chart-2)', value: cnt('done'), label: 'پایان‌یافته', action: 'go-requests', data: ' data-tab="done"' }) +
        statTile({ icon: 'ticket', color: 'var(--destructive)', value: unanswered, label: 'تیکت‌های پاسخ‌داده‌نشده', action: 'go-tickets' });

      var tabs = [
        { k: 'all', t: 'همه', c: reqs.length },
        { k: 'active', t: 'فعال', c: cnt('active') },
        { k: 'doing', t: 'در حال انجام', c: cnt('doing') },
        { k: 'done', t: 'پایان‌یافته', c: cnt('done') },
        { k: 'rejected', t: 'ردشده', c: cnt('rejected') }
      ].map(function (tb) {
        return '<button class="tab' + (homeReqState.tab === tb.k ? ' active' : '') + '" data-htab="' + tb.k + '">' + tb.t + ' <span class="cnt">' + window.fa(tb.c) + '</span></button>';
      }).join('');

      return '' +
        /* خوش‌آمد */
        '<div class="hero anim-in">' +
          '<div><h1>سلام، ' + esc(p.fullName) + '</h1>' +
          '<div class="hero-date">' + window.icon('calendar') + 'امروز ' + window.TODAY + ' — به داشبورد خدمات غیرحضوری خوش آمدید</div></div>' +
          '<a class="btn btn-primary btn-lg" href="#/services">' + window.icon('plus') + 'ثبت درخواست جدید</a>' +
        '</div>' +

        /* اطلاعیه‌ها */
        (anns.length ? '<div class="ann-stack">' + anns.map(function (a) {
          return window.UI.alert({ id: a.id, variant: a.variant, icon: a.icon, title: a.title, text: a.text, dismiss: true });
        }).join('') + '</div>' : '') +

        /* کارت خلاصه وضعیت */
        '<div class="stats anim-in-1">' + stats + '</div>' +

        /* خدمات */
        '<div class="sec-head anim-in-2">' +
          '<div class="sec-title">' + window.icon('grid') + 'خدمات غیرحضوری</div>' +
          '<a class="sec-link" href="#/services">مشاهده همه ۲۰ خدمت ' + window.icon('chevron-left') + '</a>' +
        '</div>' +
        '<div class="svc-tools">' +
          '<div class="svc-search">' + window.icon('search') + '<input class="input" id="home-svc-q" placeholder="جستجوی نام خدمت..."></div>' +
          '<div class="svc-cats" id="home-cats">' +
            '<button class="chip active" data-hcat="">همه</button>' +
            window.CATS.map(function (c) {
              var n = window.SERVICES.filter(function (s) { return s.cat === c.id; }).length;
              return '<button class="chip" data-hcat="' + c.id + '">' + window.icon(c.icon) + c.label + ' <span class="chip-n">' + window.fa(n) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="svc-grid" id="home-svc-grid">' + renderServiceList('', '') + '</div>' +

        /* درخواست‌های من */
        '<div class="sec-head">' +
          '<div class="sec-title">' + window.icon('clipboard-list') + 'درخواست‌های من</div>' +
          '<a class="sec-link" href="#/requests">مشاهده همه و پیگیری ' + window.icon('chevron-left') + '</a>' +
        '</div>' +
        '<div class="card card--flush anim-in-3">' +
          '<div style="padding:12px 14px;overflow-x:auto">' +
            '<div class="tabs" style="display:flex">' + tabs + '</div>' +
          '</div>' +
          '<div id="home-req-table">' + '' + '</div>' +
        '</div>' +

        /* پشتیبانی */
        '<div class="card anim-in-4" style="margin-top:22px;flex-direction:row;align-items:center;gap:14px;flex-wrap:wrap;padding:16px">' +
          '<span class="stat-ic" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)">' + window.icon('headphones') + '</span>' +
          '<div style="flex:1;min-width:200px"><div style="font-weight:700;font-size:14px;color:var(--foreground)">نیاز به راهنمایی دارید؟</div>' +
          '<div class="text-sm text-muted mt-1">برای موضوعاتی خارج از فهرست خدمات، با کارشناسان ما در تماس باشید. پاسخگویی: شنبه تا چهارشنبه ۸ تا ۱۶</div></div>' +
          '<a class="btn btn-primary" href="#/tickets">' + window.icon('ticket') + 'ثبت تیکت</a>' +
          '<a class="btn btn-outline" href="#/notifications">' + window.icon('bell') + 'اعلان‌ها' + (unread ? ' <span class="badge bd-danger">' + window.fa(unread) + '</span>' : '') + '</a>' +
        '</div>';
    },

    afterRender: function () {
      var reqs = allRequests();
      document.getElementById('home-req-table').innerHTML = window.UI.reqTable(reqs.slice(0, 5));
    },

    bind: function (root) {
      /* جستجوی خدمات صفحه اصلی */
      var q = root.querySelector('#home-svc-q');
      if (q) q.addEventListener('input', function () {
        document.getElementById('home-svc-grid').innerHTML = renderServiceList(q.value, currentCat());
      });
      /* فیلتر دسته */
      root.querySelectorAll('[data-hcat]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-hcat]').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          document.getElementById('home-svc-grid').innerHTML = renderServiceList(q ? q.value : '', b.getAttribute('data-hcat'));
        });
      });
      /* تب‌های درخواست‌ها */
      root.querySelectorAll('[data-htab]').forEach(function (b) {
        b.addEventListener('click', function () {
          homeReqState.tab = b.getAttribute('data-htab');
          root.querySelectorAll('[data-htab]').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          recentTable();
        });
      });
    }
  };

  var currentCatVal = '';
  function currentCat() { return currentCatVal; }
  function renderServiceList(query, cat) {
    currentCatVal = cat || '';
    var ql = window.enDigits(query || '').trim().toLowerCase();
    var list = window.SERVICES.filter(function (s) {
      var okCat = !currentCatVal || s.cat === currentCatVal;
      var okQ = !ql || (s.title + ' ' + s.short + ' ' + s.desc).toLowerCase().indexOf(ql) !== -1;
      return okCat && okQ;
    });
    if (!list.length) return '<div class="card" style="grid-column:1/-1">' + window.UI.empty({ icon: 'search', title: 'خدمتی یافت نشد', desc: 'عبارت دیگری را جستجو کنید یا موضوع خود را از طریق ثبت تیکت با کارشناسان مطرح کنید.', action: { href: '#/tickets', label: 'ثبت تیکت' } }) + '</div>';
    return list.map(window.UI.serviceCard).join('');
  }
})();
