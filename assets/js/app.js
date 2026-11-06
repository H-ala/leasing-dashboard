/* ==========================================================================
   App — روتر، پوسته (سایدبار + منوی بالا)، جستجوی سراسری، اعلان‌ها، خروج
   ========================================================================== */
(function () {
  'use strict';

  var App = {
    current: null,

    /* ---------- شروع ---------- */
    init: function () {
      window.Store.init();
      this.buildShell();
      this.bindGlobal();
      window.addEventListener('hashchange', function () { App.route(); });
      this.route();
    },

    /* ---------- ساخت پوسته ---------- */
    buildShell: function () {
      var app = document.getElementById('app');
      app.className = 'app';
      app.setAttribute('data-sb', (localStorage.getItem('lzm_sb') === '0') ? 'collapsed' : 'expanded');
      app.innerHTML =
        '<aside class="sidebar" id="sidebar" aria-label="منوی کناری">' +
          '<div class="sb-inner">' +
            '<div class="sb-head">' +
              '<a class="brand" href="#/home">' +
              '<span class="brand-logo">' +
              '<img src="assets/images/logo.png" alt="لوگوی لیزینگ مشرق‌زمین">' +
              '</span>' +
                '<span class="brand-txt sb-label-txt-wrap" data-sbtxt><span class="brand-name">لیزینگ مشرق‌زمین</span>' +
                '<span class="brand-sub" style="display:block">خدمات غیرحضوری مشتریان</span></span>' +
              '</a>' +
            '</div>' +
            '<div class="sb-content">' +
              '<div class="sb-user">' + window.UI.avatar(window.PROFILE.fullName, 'av-40') +
                '<div class="sb-user-info"><div class="sb-user-name">' + window.UI.esc(window.PROFILE.fullName) + '</div>' +
                '<div class="sb-user-no">' + window.icon('credit-card') + 'شماره مشتری: ' + window.fa(window.PROFILE.customerNo) + '</div></div>' +
              '</div>' +
              '<div class="sb-group-label">منوی اصلی</div>' +
              '<nav class="sb-menu" id="sb-main"></nav>' +
              // '<div class="sb-sep"></div>' +
              // '<div class="sb-group-label">دسته‌بندی خدمات</div>' +
              // '<nav class="sb-menu" id="sb-cats"></nav>' +
            '</div>' +
            // '<div class="sb-footer">' +
            //   '<button class="sb-item" data-action="logout">' + window.icon('log-out') + '<span class="sb-label-txt">خروج از حساب کاربری</span></button>' +
            //   '<div class="sb-ver">نسخه ۱.۰.۰ — نمونه اولیه</div>' +
            // '</div>' +
          '</div>' +
          '<div class="sb-loyalty-card">' +
          '<div class="sb-loyalty-content">' +
          '<div class="sb-loyalty-title">باشگاه مشتریان</div>' +
          '<p>سطح عضویت شما در باشگاه لیزینگ طلایی است.</p>' +
          '<button type="button" class="sb-loyalty-btn">' +
          'ورود به باشگاه' +
          '</button>' +
          '</div>' +
          '</div>' +
        '</aside>' +
        '<div class="sb-scrim" id="sb-scrim"></div>' +
        '<div class="app-body">' +
          '<header class="topbar">' +
            '<button class="icon-btn" data-action="toggle-sidebar" aria-label="باز و بسته کردن منو" title="منو (Ctrl+B)">' + window.icon('panel-left') + '</button>' +
            // '<a class="brand" href="#/home" data-topbrand>' +
            //   '<span class="brand-logo">' + window.icon('car-front') + '</span>' +
            //   '<span class="brand-txt"><span class="brand-name">لیزینگ مشرق‌زمین</span><span class="brand-sub" style="display:block">سامانه خدمات غیرحضوری مشتریان</span></span>' +
            // '</a>' +
            // '<nav class="topnav" id="topnav"></nav>' +
            '<div class="topbar-side">' +
              '<div class="gsearch" id="gsearch">' +
                window.icon('search', '') +
                '<input id="gs-input" placeholder="جستجوی خدمات، شماره پیگیری..." autocomplete="off">' +
                '<span class="gs-kbd">Ctrl+K</span>' +
                '<div class="dd" id="gs-dd" style="display:none"></div>' +
              '</div>' +
              '<div style="position:relative">' +
                '<button class="icon-btn" id="notif-btn" data-action="toggle-notif" aria-label="اعلان‌ها">' + window.icon('bell') + '<span class="ndot" id="notif-count" style="display:none"></span></button>' +
                '<div class="dd ndd" id="notif-dd" style="display:none"></div>' +
              '</div>' +
              '<div style="position:relative">' +
                '<button class="user-chip" data-action="toggle-user">' +
                  window.UI.avatar(window.PROFILE.fullName, 'av-32') +
                  '<span class="uc-txt"><span class="uc-name">' + window.UI.esc(window.PROFILE.firstName) + '</span><span class="uc-role">مشتری</span></span>' +
                '</button>' +
                '<div class="dd" id="user-dd" style="display:none">' +
                  '<button class="dd-item" data-action="go" data-href="#/profile">' + window.icon('user') + 'پروفایل کاربری</button>' +
                  '<button class="dd-item" data-action="go" data-href="#/tickets">' + window.icon('ticket') + 'تیکت‌های من</button>' +
                  '<button class="dd-item" data-action="go" data-href="#/notifications">' + window.icon('bell') + 'اعلان‌ها</button>' +
                  '<div class="dd-sep"></div>' +
                  '<button class="dd-item danger" data-action="logout">' + window.icon('log-out') + 'خروج از حساب کاربری</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</header>' +
          '<main class="main" id="view"></main>' +
          '<footer class="app-footer">' +
            '<span>© ۱۴۰۵ لیزینگ مشرق‌زمین — تمامی حقوق محفوظ است.</span>' +
            '<div class="f-links"><a href="#/services">خدمات غیرحضوری</a><a href="#/tickets">پشتیبانی</a><span>تلفن: ' + window.fa('021-8744') + '</span></div>' +
          '</footer>' +
        '</div>';

      /* جستجوی سراسری: آیکون داخل .gsearch */
      var gsIcon = document.querySelector('#gsearch > svg');
      if (gsIcon) { gsIcon.style.cssText = 'position:absolute;inset-inline-start:9px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--muted-foreground);pointer-events:none'; }

      this.fillMenus();
      this.updateBadges();
    },

    fillMenus: function () {
      var main = [
        { href: '#/home', icon: 'home', label: 'صفحه اصلی' },
        { href: '#/services', icon: 'grid', label: 'خدمات غیرحضوری' },
        { href: '#/services2', icon: 'layout-grid', label: 'خدمات غیرحضوری ۲' },
        { href: '#/requests', icon: 'clipboard-list', label: 'درخواست‌های من' },
        { href: '#/tickets', icon: 'ticket', label: 'ثبت تیکت' },
        // { href: '#/profile', icon: 'user', label: 'پروفایل کاربری' },
        // { href: '#/notifications', icon: 'bell', label: 'اعلان‌ها', badge: window.Store.unreadCount() }
      ];
      document.getElementById('sb-main').innerHTML = main.map(function (m) {
        return '<a class="sb-item" href="' + m.href + '" data-route="' + m.href + '">' + window.icon(m.icon) +
          '<span class="sb-label-txt">' + m.label + '</span>' +
          (m.badge ? '<span class="sb-badge">' + window.fa(m.badge) + '</span>' : '') + '</a>';
      }).join('');
      // document.getElementById('sb-cats').innerHTML = window.CATS.map(function (c) {
      //   var n = window.SERVICES.filter(function (s) { return s.cat === c.id; }).length;
      //   return '<a class="sb-item" href="#/services?cat=' + c.id + '" data-route="#/services?cat=' + c.id + '">' +
      //     '<span style="width:8px;height:8px;border-radius:3px;background:' + c.color + ';flex-shrink:0"></span>' +
      //     '<span class="sb-label-txt">' + c.label + '</span><span class="sb-badge">' + window.fa(n) + '</span></a>';
      // }).join('');

      var topnav = [
        { href: '#/home', icon: 'home', label: 'صفحه اصلی' },
        { href: '#/services', icon: 'grid', label: 'خدمات غیرحضوری' },
        { href: '#/requests', icon: 'clipboard-list', label: 'درخواست‌های من' },
        { href: '#/tickets', icon: 'ticket', label: 'ثبت تیکت' },
        { href: '#/profile', icon: 'user', label: 'پروفایل کاربری' }
      ];
      // document.getElementById('topnav').innerHTML = topnav.map(function (m) {
      //   return '<a href="' + m.href + '" data-route="' + m.href + '">' + window.icon(m.icon) + '<span>' + m.label + '</span></a>';
      // }).join('');
    },

    updateBadges: function () {
      var c = window.Store.unreadCount();
      var dot = document.getElementById('notif-count');
      if (dot) {
        if (c) { dot.style.display = 'grid'; dot.textContent = window.fa(c); } else { dot.style.display = 'none'; }
      }
      var sbBell = document.querySelector('#sb-main [data-route="#/notifications"] .sb-badge');
      if (sbBell) { if (c) { sbBell.style.display = ''; sbBell.textContent = window.fa(c); } else sbBell.style.display = 'none'; }
      this.fillMenus();
    },

    /* ---------- مسیریابی ---------- */
    parseHash: function () {
      var h = location.hash.replace(/^#\/?/, '');
      var parts = h.split('?');
      var segs = parts[0].split('/').filter(Boolean);
      var query = {};
      if (parts[1]) parts[1].split('&').forEach(function (kv) {
        var p = kv.split('='); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
      return { segs: segs, query: query };
    },

    route: function () {
      /* سقف ورود */
      if (!window.Store.session.get()) {
        if (this.parseHash().segs[0] !== 'login') { location.hash = '#/login'; return; }
      } else if (this.parseHash().segs[0] === 'login') {
        location.hash = '#/home'; return;
      }

      var r = this.parseHash();
      var seg = r.segs[0] || 'home';
      var view, params = r.query;

      if (seg === 'login') view = window.Views.login;
      else if (seg === 'home') view = window.Views.home;
      else if (seg === 'services') { view = window.Views.services; params = { cat: r.query.cat || '' }; }
      else if (seg === 'service' && r.segs[1]) { view = window.Views.form; params = { id: r.segs[1] }; }
      else if (seg === 'services2') {view = window.Views.services2;}
      else if (seg === 'requests') { view = window.Views.requests; params = { tab: r.query.tab || '' }; }
      else if (seg === 'request' && r.segs[1]) { view = window.Views.requestDetail; params = { track: r.segs[1] }; }
      else if (seg === 'tickets') { view = window.Views.tickets; params = { tab: r.query.tab || '' }; }
      else if (seg === 'notifications') view = window.Views.notifications;
      else if (seg === 'profile') view = window.Views.profile;
      else { view = window.Views.home; }

      this.closeDropdowns();
      var app = document.getElementById('app');
      if (seg === 'login') app.classList.add('auth-mode'); else app.classList.remove('auth-mode');
      var v = document.getElementById('view');
      v.innerHTML = view.render(params);
      v.scrollTop = 0;
      window.scrollTo({ top: 0 });
      if (view.afterRender) view.afterRender(params);
      if (view.bind) view.bind(v, params);
      this.current = seg;
      this.activateNav(r);
      this.closeMobileSidebar();
    },

    activateNav: function (r) {
      var path = '#/' + (r.segs[0] || 'home') + (r.segs[0] === 'service' ? 's' : '');
      var active = path;
      if (r.segs[0] === 'request') active = '#/requests';
      if (r.segs[0] === 'service') active = '#/services';
      document.querySelectorAll('[data-route]').forEach(function (a) {
        var on = a.getAttribute('data-route') === active ||
          (active === '#/home' && a.getAttribute('data-route') === '#/home' && r.segs[0] === 'home');
        a.classList.toggle('active', on);
      });
    },

    refresh: function () { this.route(); },

    /* ---------- رویدادهای سراسری ---------- */
    bindGlobal: function () {
      var self = this;

      document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action]');
        /* بستن دراپ‌داون‌ها هنگام کلیک بیرون */
        if (!e.target.closest('#gsearch')) self.closeDD('gs-dd');
        if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dd')) self.closeDD('notif-dd');
        if (!e.target.closest('[data-action="toggle-user"]') && !e.target.closest('#user-dd')) self.closeDD('user-dd');

        if (!el) return;
        var act = el.getAttribute('data-action');
        switch (act) {
          case 'open-service': location.hash = '#/service/' + el.getAttribute('data-id'); break;
          case 'open-request': location.hash = '#/request/' + el.getAttribute('data-track'); break;
          case 'go-back': history.back(); break;
          case 'go': location.hash = el.getAttribute('data-href'); break;
          case 'go-requests':
            location.hash = '#/requests' + (el.getAttribute('data-tab') ? '?tab=' + el.getAttribute('data-tab') : '');
            break;
          case 'go-tickets': location.hash = '#/tickets'; break;
          case 'dismiss-ann': window.Store.dismiss(el.getAttribute('data-id')); self.refresh(); break;
          case 'toggle-sidebar': self.toggleSidebar(); break;
          case 'toggle-notif': self.toggleNotif(); break;
          case 'toggle-user': self.toggleDD('user-dd'); break;
          case 'mark-all-read': window.Store.markAllRead(); self.updateBadges(); self.refresh(); window.UI.toast('success', 'انجام شد', 'همه اعلان‌ها خوانده‌شده علامت‌گذاری شدند.'); break;
          case 'logout': self.logout(); break;
          case 'toggle-mask': self.refresh(); break;
        }
      });

      /* میانبر کیبورد سایدبار (Ctrl+B مطابق مرجع) + جستجو (Ctrl+K) */
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); self.toggleSidebar(); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          var gi = document.getElementById('gs-input');
          if (gi) { e.preventDefault(); gi.focus(); }
        }
      });

      /* اسکریم سایدبار موبایل */
      document.getElementById('sb-scrim').addEventListener('click', function () { self.closeMobileSidebar(); });

      /* جستجوی سراسری */
      var gi = document.getElementById('gs-input');
      var dd = document.getElementById('gs-dd');
      gi.addEventListener('input', function () { self.globalSearch(gi.value); });
      gi.addEventListener('focus', function () { if (gi.value.trim()) self.globalSearch(gi.value); });
      gi.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var first = dd.querySelector('[data-gs]');
          if (first) { location.hash = first.getAttribute('data-gs'); self.closeDD('gs-dd'); gi.blur(); }
        }
        if (e.key === 'Escape') { self.closeDD('gs-dd'); gi.blur(); }
      });
      dd.addEventListener('click', function (e) {
        var it = e.target.closest('[data-gs]');
        if (it) { location.hash = it.getAttribute('data-gs'); self.closeDD('gs-dd'); }
      });
    },

    /* ---------- دراپ‌داون‌ها ---------- */
    toggleDD: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var show = el.style.display === 'none';
      this.closeDropdowns();
      if (show) {
        el.style.display = '';
        if (id === 'notif-dd') this.renderNotifDD();
      }
    },
    closeDD: function (id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; },
    closeDropdowns: function () { ['gs-dd', 'notif-dd', 'user-dd'].forEach(this.closeDD); },

    toggleNotif: function () { this.toggleDD('notif-dd'); },

    renderNotifDD: function () {
      var dd = document.getElementById('notif-dd');
      var list = window.Store.notifs();
      var unread = window.Store.unreadCount();
      var items = list.slice(0, 6).map(function (n) {
        var cls = { success: 'st-done', info: 'bd-primary', warning: 'st-doing', danger: 'st-rejected' }[n.type] || 'bd-gray';
        return '<button class="ntf' + (n.unread ? ' is-unread' : '') + '" data-notif-go="' + n.id + '">' +
          '<span class="ntf-ic badge ' + cls + '" style="height:34px;width:34px;justify-content:center">' + window.icon(n.icon) + '</span>' +
          '<span style="min-width:0;flex:1"><span class="ntf-t" style="display:block">' + window.UI.esc(n.title) + '</span>' +
          '<span class="ntf-d" style="display:block">' + window.UI.esc(n.desc) + '</span>' +
          '<span class="ntf-time" style="display:block">' + window.UI.esc(n.time) + '</span></span>' +
          (n.unread ? '<span class="unread-dot"></span>' : '') +
        '</button>';
      }).join('');
      dd.innerHTML =
        '<div class="ndd-h"><span class="ndd-t">اعلان‌ها' + (unread ? ' <span class="ndd-cnt">' + window.fa(unread) + '</span>' : '') + '</span>' +
        '<button class="ndd-mark" data-action="mark-all-read">خواندن همه</button></div>' +
        '<div class="ndd-list">' + (items || '<div class="ntf-readall">اعلانی وجود ندارد.</div>') + '</div>' +
        '<div class="ndd-f"><a href="#/notifications">مشاهده همه اعلان‌ها</a></div>';

      dd.querySelectorAll('[data-notif-go]').forEach(function (b) {
        b.addEventListener('click', function () {
          var n = window.Store.notifs().filter(function (x) { return x.id === b.getAttribute('data-notif-go'); })[0];
          if (n) { window.Store.markRead(n.id); App.updateBadges(); if (n.link) location.hash = n.link; }
          App.closeDD('notif-dd');
        });
      });
    },

    /* ---------- جستجوی سراسری ---------- */
    globalSearch: function (q) {
      var dd = document.getElementById('gs-dd');
      var ql = window.enDigits(q).trim().toLowerCase();
      if (!ql) { dd.style.display = 'none'; return; }
      var html = '';
      var svcs = window.SERVICES.filter(function (s) { return (s.title + ' ' + s.short).toLowerCase().indexOf(ql) !== -1; }).slice(0, 4);
      var reqs = window.Store.requests().filter(function (r) {
        var svc = window.svcById(r.svc);
        return (r.track + ' ' + (svc ? svc.title : '')).toLowerCase().indexOf(ql) !== -1 || fa(r.track).indexOf(ql) !== -1;
      }).slice(0, 3);
      if (svcs.length) {
        html += '<div class="gs-group">خدمات</div>' + svcs.map(function (s) {
          var cat = window.svcCat(s);
          return '<button class="gs-item" data-gs="#/service/' + s.id + '">' +
            '<span class="gsi-ic" style="background:color-mix(in srgb,' + cat.color + ' 11%,transparent);color:' + cat.color + '">' + window.icon(s.icon) + '</span>' +
            '<span><span class="gsi-t" style="display:block">' + window.UI.esc(s.title) + '</span><span class="gsi-s">' + cat.label + '</span></span></button>';
        }).join('');
      }
      if (reqs.length) {
        html += '<div class="gs-group">درخواست‌های من</div>' + reqs.map(function (r) {
          var svc = window.svcById(r.svc) || { title: '—', icon: 'file-text' };
          return '<button class="gs-item" data-gs="#/request/' + r.track + '">' +
            '<span class="gsi-ic" style="background:color-mix(in srgb,var(--muted-foreground) 12%,transparent);color:var(--muted-foreground)">' + window.icon(svc.icon) + '</span>' +
            '<span><span class="gsi-t" style="display:block">' + window.fa(r.track) + '</span><span class="gsi-s">' + window.UI.esc(svc.title) + '</span></span></button>';
        }).join('');
      }
      if (!html) html = '<div class="gs-empty">نتیجه‌ای برای «' + window.UI.esc(q) + '» یافت نشد</div>';
      dd.innerHTML = html;
      dd.style.display = '';
    },

    /* ---------- سایدبار ---------- */
    toggleSidebar: function () {
      var app = document.getElementById('app');
      var collapsed = app.getAttribute('data-sb') === 'collapsed';
      var isMobile = window.innerWidth < 1024;
      if (isMobile) {
        app.classList.toggle('sb-mobile-open');
      } else {
        app.setAttribute('data-sb', collapsed ? 'expanded' : 'collapsed');
        try { localStorage.setItem('lzm_sb', collapsed ? '1' : '0'); } catch (e) { /* noop */ }
      }
    },
    closeMobileSidebar: function () {
      document.getElementById('app').classList.remove('sb-mobile-open');
    },

    /* ---------- خروج ---------- */
    logout: function () {
      window.UI.confirm({
        title: 'خروج از حساب کاربری',
        desc: 'آیا از خروج از داشبورد اطمینان دارید؟',
        icon: 'log-out', variant: 'destructive',
        confirmLabel: 'خروج', cancelLabel: 'انصراف'
      }).then(function (yes) {
        if (yes) {
          window.Store.session.set(false);
          window.UI.toast('info', 'خارج شدید', 'برای مشاهده داشبورد دوباره وارد شوید.');
          location.hash = '#/login';
        }
      });
    },

    /* ---------- چاپ رسید درخواست ---------- */
    printReceipt: function (r, svc) {
      var sheet = document.getElementById('print-sheet');
      if (!svc) svc = window.svcById(r.svc) || { title: '—' };
      var rows = '';
      Object.keys(r.fields || {}).forEach(function (k) {
        var f = null;
        (svc.fields || []).forEach(function (x) { if (x.n === k) f = x; });
        if (k === '__notes') return;
        var label = f ? f.l : k;
        var v = r.fields[k];
        if (f && f.t === 'chk') v = v ? 'بله' : 'خیر';
        if (Array.isArray(v)) v = v.join('، ');
        if (v == null || v === '') return;
        rows += '<tr><td>' + window.UI.esc(String(label)) + '</td><td>' + window.UI.esc(String(v)) + '</td></tr>';
      });
      sheet.innerHTML =
        '<div class="ps-logo"><div class="ps-mark">م</div><div><div class="ps-t">لیزینگ مشرق‌زمین</div><div class="ps-s">سامانه خدمات غیرحضوری مشتریان — رسید ثبت درخواست</div></div></div>' +
        '<div class="ps-box"><div style="font-size:11px;color:#666">شماره پیگیری</div><div class="ps-track">' + window.fa(r.track) + '</div></div>' +
        '<table class="ps-tbl">' +
          '<tr><td>عنوان خدمت</td><td>' + window.UI.esc(svc.title) + '</td></tr>' +
          '<tr><td>تاریخ و ساعت ثبت</td><td>' + window.UI.esc(r.createdAt) + '</td></tr>' +
          '<tr><td>وضعیت فعلی</td><td>' + (window.STATUSES[r.status] || {}).label + '</td></tr>' +
          '<tr><td>واحد رسیدگی‌کننده</td><td>' + window.UI.esc(r.unit || 'در حال تخصیص') + '</td></tr>' +
          rows +
        '</table>' +
        '<div class="ps-note">این رسید به‌صورت سیستمی صادر شده و نیازی به مهر و امضا ندارد. وضعیت درخواست از طریق داشبورد خدمات غیرحضوری یا تماس با شماره ' + window.fa('021-8744') + ' قابل پیگیری است.</div>';
      window.print();
    }
  };

  window.App = App;
  document.addEventListener('DOMContentLoaded', function () { App.init(); });
})();
