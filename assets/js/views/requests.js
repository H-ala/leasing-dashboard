/* ==========================================================================
   درخواست‌های من (لیست + فیلتر + مرتب‌سازی) و جزئیات/پیگیری درخواست
   ========================================================================== */
window.Views = window.Views || {};

(function () {
  'use strict';

  /* ================= لیست درخواست‌ها ================= */
  var st = { tab: 'all', q: '', sort: 'new' };

  function filterList() {
    var reqs = window.Store.requests().slice();
    if (st.tab !== 'all') reqs = reqs.filter(function (r) { return r.status === st.tab; });
    if (st.q) {
      var ql = window.enDigits(st.q).trim().toLowerCase();
      reqs = reqs.filter(function (r) {
        var svc = window.svcById(r.svc);
        var hay = (r.track + ' ' + (svc ? svc.title : '')).toLowerCase();
        if (hay.indexOf(ql) !== -1) return true;
        return fa(r.track).indexOf(ql) !== -1;
      });
    }
    /* مرتب‌سازی بر اساس تاریخ ثبت (شماره پیگیری ترتیب زمانی دارد) */
    reqs.sort(function (a, b) { return st.sort === 'new' ? b.track.localeCompare(a.track) : a.track.localeCompare(b.track); });
    return reqs;
  }

  function renderTable() {
    var box = document.getElementById('req-table-box');
    if (!box) return;
    var list = filterList();
    box.innerHTML = window.UI.reqTable(list);
    var meta = document.getElementById('req-meta');
    if (meta) meta.textContent = list.length ? ('نمایش ' + window.fa(list.length) + ' درخواست') : '';
  }

  window.Views.requests = {
    render: function (params) {
      st = { tab: (params && params.tab) || 'all', q: '', sort: 'new' };
      var reqs = window.Store.requests();
      var cnt = function (s) { return reqs.filter(function (r) { return r.status === s; }).length; };
      var tabs = [
        { k: 'all', t: 'همه', c: reqs.length },
        { k: 'active', t: 'فعال', c: cnt('active') },
        { k: 'doing', t: 'در حال انجام', c: cnt('doing') },
        { k: 'done', t: 'پایان‌یافته', c: cnt('done') },
        { k: 'rejected', t: 'ردشده', c: cnt('rejected') }
      ].map(function (tb) {
        return '<button class="tab' + (st.tab === tb.k ? ' active' : '') + '" data-rtab="' + tb.k + '">' + tb.t + ' <span class="cnt">' + window.fa(tb.c) + '</span></button>';
      }).join('');

      return '<div class="page-head anim-in">' +
          '<div><h1 class="page-title">' + window.icon('clipboard-list') + 'درخواست‌های من</h1>' +
          '<div class="page-sub">مشاهده، پیگیری و بررسی روند رسیدگی به همه درخواست‌های ثبت‌شده شما</div></div>' +
          '<a class="btn btn-primary" href="#/services">' + window.icon('plus') + 'ثبت درخواست جدید</a>' +
        '</div>' +
        '<div class="card card--flush anim-in-1">' +
          '<div class="req-filter">' +
            '<div class="tabs">' + tabs + '</div>' +
            '<div class="req-search">' + window.icon('search') + '<input class="input" id="req-q" placeholder="جستجوی شماره پیگیری یا خدمت..."></div>' +
            '<div class="sort-box">' + window.icon('arrow-up-down') +
              '<select class="select" id="req-sort">' +
                '<option value="new"' + (st.sort === 'new' ? ' selected' : '') + '>جدیدترین</option>' +
                '<option value="old"' + (st.sort === 'old' ? ' selected' : '') + '>قدیمی‌ترین</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div id="req-table-box"></div>' +
          '<div class="req-meta" id="req-meta"></div>' +
        '</div>';
    },
    afterRender: function () { renderTable(); },
    bind: function (root) {
      root.querySelectorAll('[data-rtab]').forEach(function (b) {
        b.addEventListener('click', function () {
          st.tab = b.getAttribute('data-rtab');
          root.querySelectorAll('[data-rtab]').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          renderTable();
        });
      });
      var q = root.querySelector('#req-q');
      if (q) q.addEventListener('input', function () { st.q = q.value; renderTable(); });
      var s = root.querySelector('#req-sort');
      if (s) s.addEventListener('change', function () { st.sort = s.value; renderTable(); });
    }
  };

  /* ================= جزئیات درخواست ================= */
  window.Views.requestDetail = {
    render: function (params) {
      var r = window.Store.reqByTrack(params.track);
      if (!r) return '<div class="card">' + window.UI.empty({ icon: 'alert-circle', title: 'درخواست یافت نشد', desc: 'شماره پیگیری وارد‌شده معتبر نیست یا درخواست حذف شده است.', action: { href: '#/requests', label: 'بازگشت به درخواست‌ها' } }) + '</div>';
      var svc = window.svcById(r.svc) || { title: '—', icon: 'file-text', cat: 'other' };
      var cat = window.svcCat(svc) || { color: 'var(--muted-foreground)' };
      var stages = r.stages || window.svcStages(svc);

      var rejectHtml = r.status === 'rejected' && r.rejectReason
        ? '<div class="reject-box">' + window.icon('circle-x') +
          '<div><div class="reject-t">دلیل رد درخواست</div><div class="reject-d">' + window.UI.esc(r.rejectReason) + '</div>' +
          '<div class="text-sm text-muted mt-2">در صورت رفع مشکل، امکان ثبت مجدد درخواست از بخش خدمات وجود دارد.</div></div></div>'
        : '';

      /* اطلاعات ثبت‌شده */
      var kv = '';
      svc.fields.forEach(function (f) {
        var v = r.fields ? r.fields[f.n] : null;
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        if (f.t === 'chk') v = v ? 'بله' : 'خیر';
        if (Array.isArray(v)) v = v.join('، ');
        if (f.t === 'num') v = window.fmtNum(v);
        if (typeof v === 'string' && /^\d+$/.test(window.enDigits(v))) v = window.fa(v);
        kv += '<div class="k">' + window.UI.esc(f.l) + '</div><div class="v">' + window.UI.esc(String(v)) + '</div>';
      });
      if (r.fields && r.fields.__notes) kv += '<div class="k">توضیحات تکمیلی مشتری</div><div class="v">' + window.UI.esc(r.fields.__notes) + '</div>';

      /* فایل‌ها */
      var filesHtml = (r.files && r.files.length)
        ? '<div class="file-list">' + r.files.map(function (f) {
            return '<div class="file-item"><span class="file-ic">' + window.icon('file-text') + '</span>' +
              '<div style="min-width:0"><div class="file-name">' + window.UI.esc(f.name) + '</div><div class="file-size">' + window.UI.esc(f.size || '') + '</div></div>' +
              '<button class="file-x" title="دریافت فایل" data-dl="' + window.UI.esc(f.name) + '">' + window.icon('download', 'ic-14') + '</button></div>';
          }).join('') + '</div>'
        : window.UI.empty({ icon: 'paperclip', title: 'فایلی بارگذاری نشده است' });

      /* پیام‌ها */
      var msgs = (r.messages && r.messages.length) ? r.messages.map(function (m) {
        if (m.from === 'system') {
          return '<div style="text-align:center"><span class="badge bd-gray">' + window.icon('info') + window.UI.esc(m.text) + '</span></div>';
        }
        var isCust = m.from === 'customer';
        var av = isCust ? window.UI.avatar(window.PROFILE.fullName, 'av-32') : window.UI.avatar(m.name || 'کارشناس', 'av-32', 'av-expert');
        var meta = isCust
          ? '<b>' + window.UI.esc(window.PROFILE.fullName) + '</b> <span class="msg-role">شما</span> <span>' + window.UI.esc(m.ts) + '</span>'
          : '<b>' + window.UI.esc(m.name) + '</b> <span class="msg-role">' + window.UI.esc(m.role) + '</span> <span>' + window.UI.esc(m.ts) + '</span>';
        return '<div class="msg' + (isCust ? ' is-customer' : '') + '">' + av +
          '<div class="msg-body"><div class="msg-meta">' + meta + '</div>' +
          '<div class="msg-bubble">' + window.UI.esc(m.text) + (m.file ? '<div class="mt-1"><span class="badge bd-gray">' + window.icon('paperclip') + window.UI.esc(m.file) + '</span></div>' : '') + '</div></div></div>';
      }).join('')
        : '<div class="empty" style="padding:24px"><div class="empty-ic">' + window.icon('message') + '</div><div class="empty-d">هنوز گفتگویی برای این درخواست ثبت نشده است. سؤال خود را از کادر زیر بپرسید.</div></div>';

      var unread = window.Store.unreadCount();

      return '<div class="crumbs anim-in">' +
          '<a href="#/home">صفحه اصلی</a><span class="sep">/</span>' +
          '<a href="#/requests">درخواست‌های من</a><span class="sep">/</span>' +
          '<span class="cur">' + window.fa(r.track) + '</span>' +
        '</div>' +

        '<div class="det-head anim-in">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
              '<span class="svc-ic" style="--c:' + cat.color + ';width:46px;height:46px">' + window.icon(svc.icon) + '</span>' +
              '<div><h1 class="page-title" style="font-size:17px">' + window.UI.esc(svc.title) + '</h1>' +
              '<div class="det-track"><span>شماره پیگیری:</span> <b>' + window.fa(r.track) + '</b>' +
              '<button class="copy-btn" data-copy-track="' + r.track + '">' + window.icon('copy') + 'کپی</button>' + window.UI.statusBadge(r.status) + '</div></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn-outline btn-sm" data-print-req="' + r.track + '">' + window.icon('printer') + 'چاپ / دریافت رسید</button>' +
            '<a class="btn btn-ghost btn-sm" href="#/requests">' + window.icon('chevron-right') + 'بازگشت به فهرست</a>' +
          '</div>' +
        '</div>' +

        rejectHtml +

        /* نوار پیشرفت */
        (r.status !== 'rejected'
          ? '<div class="card det-steps-card anim-in-1">' + window.UI.stepper(stages, r.step, r.status) + '</div>'
          : '<div class="card det-steps-card anim-in-1">' + window.UI.stepper(stages, r.step, r.status) + '</div>') +

        '<div class="det-grid">' +
          '<div class="det-main">' +

            '<div class="card card--flush">' +
              '<div class="card-h"><div class="card-t">اطلاعات ثبت‌شده توسط مشتری</div><span class="badge bd-gray">' + window.icon('calendar') + 'ثبت: ' + window.UI.esc(r.createdAt) + '</span></div>' +
              '<div class="card-b"><div class="kv">' + (kv || '<div class="k">اطلاعات</div><div class="v">—</div>') + '</div></div>' +
            '</div>' +

            '<div class="card card--flush">' +
              '<div class="card-h"><div class="card-t">فایل‌ها و مدارک بارگذاری‌شده</div><span class="badge bd-primary">' + window.icon('paperclip') + window.fa((r.files || []).length) + ' فایل</span></div>' +
              '<div class="card-b">' + filesHtml + '</div>' +
            '</div>' +

            '<div class="card card--flush">' +
              '<div class="card-h"><div class="card-t">تاریخچه مراحل رسیدگی</div></div>' +
              '<div class="card-b">' + window.UI.timeline(r.history) + '</div>' +
            '</div>' +

            '<div class="card card--flush">' +
              '<div class="card-h"><div class="card-t">پیام‌ها و توضیحات کارشناسان</div></div>' +
              '<div class="card-b">' +
                '<div class="msgs" id="req-msgs">' + msgs + '</div>' +
                '<div class="reply-box">' +
                  '<div style="flex:1">' +
                    '<textarea class="textarea" id="reply-text" placeholder="پاسخ یا سؤال خود را درباره این درخواست بنویسید..."></textarea>' +
                    '<div class="reply-tools">' +
                      '<button class="btn btn-outline btn-sm" id="reply-attach">' + window.icon('paperclip') + 'پیوست فایل تکمیلی</button>' +
                      '<span class="reply-file-n" id="reply-file-n"></span>' +
                      '<input type="file" id="reply-file" multiple style="display:none">' +
                    '</div>' +
                  '</div>' +
                  '<button class="btn btn-primary" id="reply-send" style="align-self:flex-end">' + window.icon('send') + 'ارسال</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ستون کنار */
          '<aside class="det-aside">' +
            '<div class="card">' +
              '<div class="card-h"><div class="card-t">خلاصه درخواست</div></div>' +
              '<div class="card-b">' +
                '<div class="sum-row"><span class="k">وضعیت فعلی</span><span class="v">' + window.UI.statusBadge(r.status) + '</span></div>' +
                '<div class="sum-row"><span class="k">واحد رسیدگی‌کننده</span><span class="v">' + (r.unit ? window.UI.esc(r.unit) : '<span class="text-muted">در حال تخصیص</span>') + '</span></div>' +
                '<div class="sum-row"><span class="k">تاریخ ثبت</span><span class="v">' + window.UI.esc(r.createdAt) + '</span></div>' +
                '<div class="sum-row"><span class="k">آخرین به‌روزرسانی</span><span class="v">' + window.UI.esc(r.updatedAt) + '</span></div>' +
                '<div class="sum-row"><span class="k">مرحله فعلی</span><span class="v">' + (r.status === 'done' ? 'پایان' : window.UI.esc(stages[Math.min(r.step, stages.length - 1)])) + '</span></div>' +
                (r.extra ? '<div class="sum-row"><span class="k">' + window.UI.esc(r.extra.label) + '</span><span class="v" style="font-size:11px">' + window.UI.esc(r.extra.value) + '</span></div>' : '') +
              '</div>' +
            '</div>' +
            '<div class="card">' +
              '<div class="card-b" style="display:flex;gap:11px;align-items:flex-start">' +
                '<span class="stat-ic" style="background:color-mix(in srgb,var(--warning) 14%,transparent);color:hsl(26 90% 40%)">' + window.icon('upload') + '</span>' +
                '<div><div style="font-weight:700;font-size:13px;color:var(--foreground)">ارسال مدرک تکمیلی</div>' +
                '<div class="text-sm text-muted mt-1" style="line-height:1.8">در صورت درخواست کارشناس، مدارک جدید را بارگذاری کنید.</div>' +
                '<button class="btn btn-primary btn-sm mt-2" id="aside-attach">' + window.icon('upload') + 'بارگذاری مدرک</button>' +
                '<input type="file" id="aside-file" multiple style="display:none"></div>' +
              '</div>' +
            '</div>' +
            '<div class="card">' +
              '<div class="card-b" style="display:flex;gap:11px;align-items:flex-start">' +
                '<span class="stat-ic" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)">' + window.icon('headphones') + '</span>' +
                '<div><div style="font-weight:700;font-size:13px;color:var(--foreground)">ارتباط با پشتیبانی</div>' +
                '<div class="text-sm text-muted mt-1" style="line-height:1.8">برای موضوعات خارج از این درخواست، تیکت ثبت کنید.</div>' +
                '<a class="btn btn-outline btn-sm mt-2" href="#/tickets">' + window.icon('ticket') + 'ثبت تیکت</a></div>' +
              '</div>' +
            '</div>' +
          '</aside>' +
        '</div>';
    },

    afterRender: function () { /* noop */ },

    bind: function (root, params) {
      var r = window.Store.reqByTrack(params.track);
      if (!r) return;

      /* کپی شماره پیگیری */
      root.querySelectorAll('[data-copy-track]').forEach(function (b) {
        b.addEventListener('click', function () {
          window.UI.copyText(b.getAttribute('data-copy-track'));
          window.UI.toast('success', 'کپی شد', 'شماره پیگیری در کلیپ‌بورد قرار گرفت.');
        });
      });

      /* دریافت فایل (نمایشی) */
      root.querySelectorAll('[data-dl]').forEach(function (b) {
        b.addEventListener('click', function () {
          window.UI.toast('info', 'دریافت فایل', 'در نسخه نمایشی، دانلود فایل «' + b.getAttribute('data-dl') + '» شبیه‌سازی شده است.');
        });
      });

      /* چاپ رسید */
      var printBtn = root.querySelector('[data-print-req]');
      if (printBtn) printBtn.addEventListener('click', function () {
        window.App.printReceipt(r, window.svcById(r.svc));
      });

      /* پیوست فایل تکمیلی */
      var attach = function () { root.querySelector('#aside-file').click(); };
      var aBtn = root.querySelector('#aside-attach');
      if (aBtn) aBtn.addEventListener('click', attach);
      var rBtn = root.querySelector('#reply-attach');
      if (rBtn) rBtn.addEventListener('click', function () { root.querySelector('#reply-file').click(); });
      var aFile = root.querySelector('#aside-file');
      if (aFile) aFile.addEventListener('change', function () {
        var names = Array.prototype.map.call(aFile.files, function (f) {
          return { name: f.name, size: window.fa(Math.max(1, Math.round(f.size / 1024))) + ' کیلوبایت' };
        });
        if (!names.length) return;
        window.Store.addFiles(r.track, names);
        window.UI.toast('success', 'مدرک تکمیلی ارسال شد', window.fa(names.length) + ' فایل به درخواست اضافه شد.');
        window.App.refresh();
      });
      var rFile = root.querySelector('#reply-file');
      if (rFile) rFile.addEventListener('change', function () {
        var n = document.getElementById('reply-file-n');
        if (rFile.files.length && n) n.textContent = window.fa(rFile.files.length) + ' فایل انتخاب شد';
      });

      /* ارسال پیام */
      var send = root.querySelector('#reply-send');
      if (send) send.addEventListener('click', function () {
        var ta = root.querySelector('#reply-text');
        var text = ta.value.trim();
        if (!text) {
          ta.classList.add('is-invalid');
          window.UI.toast('error', 'متن پیام خالی است', 'لطفاً متن پاسخ خود را وارد کنید.');
          return;
        }
        var rf = root.querySelector('#reply-file');
        var fnames = rf && rf.files.length ? Array.prototype.map.call(rf.files, function (f) { return f.name; }) : [];
        var btn = send;
        btn.disabled = true;
        btn.innerHTML = '<span class="spin spin-sm"></span> ارسال...';
        setTimeout(function () {
          window.Store.addMessage(r.track, text, fnames[0] || null);
          window.UI.toast('success', 'پیام شما ارسال شد', 'پاسخ کارشناس در همین بخش اعلام می‌شود.');
          window.App.refresh();
        }, 700);
      });
    }
  };
})();
