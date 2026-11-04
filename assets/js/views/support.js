/* ==========================================================================
   ثبت تیکت + تیکت‌های من + صفحه اعلان‌ها
   ========================================================================== */
window.Views = window.Views || {};

(function () {
  'use strict';

  var TICKET_CATS = ['عمومی', 'امور مالی', 'قرارداد', 'خودرو', 'شکایت', 'سایر'];

  var tState = { tab: 'new', open: null };

  function ticketStatusBadge(s) {
    if (s === 'open') return '<span class="badge st-doing">' + window.icon('clock') + 'در انتظار پاسخ</span>';
    if (s === 'answered') return '<span class="badge st-done">' + window.icon('message') + 'پاسخ داده شد</span>';
    return '<span class="badge bd-gray">' + window.icon('circle-check') + 'بسته شد</span>';
  }

  function ticketThread(t) {
    return '<div class="ticket-msgs">' +
      '<div class="msgs">' + t.msgs.map(function (m) {
        if (m.from === 'system') return '<div style="text-align:center"><span class="badge bd-gray">' + window.icon('info') + window.UI.esc(m.text) + '</span></div>';
        var isCust = m.from === 'customer';
        var av = isCust ? window.UI.avatar(window.PROFILE.fullName, 'av-32') : window.UI.avatar(m.name || 'کارشناس', 'av-32', 'av-expert');
        var meta = isCust
          ? '<b>' + window.UI.esc(window.PROFILE.fullName) + '</b> <span class="msg-role">شما</span> <span>' + window.UI.esc(m.ts) + '</span>'
          : '<b>' + window.UI.esc(m.name) + '</b> <span class="msg-role">' + window.UI.esc(m.role) + '</span> <span>' + window.UI.esc(m.ts) + '</span>';
        return '<div class="msg' + (isCust ? ' is-customer' : '') + '">' + av +
          '<div class="msg-body"><div class="msg-meta">' + meta + '</div>' +
          '<div class="msg-bubble">' + window.UI.esc(m.text) +
          (m.file ? '<div class="mt-1"><span class="badge bd-gray">' + window.icon('paperclip') + window.UI.esc(m.file) + '</span></div>' : '') +
          '</div></div></div>';
      }).join('') + '</div>' +
      (t.status !== 'closed'
        ? '<div class="reply-box"><textarea class="textarea" id="tk-reply" placeholder="پاسخ خود را بنویسید..."></textarea>' +
          '<button class="btn btn-primary" data-tk-reply="' + t.id + '" style="align-self:flex-end">' + window.icon('send') + 'ارسال</button></div>'
        : '<div class="text-sm text-muted mt-2" style="text-align:center">این تیکت بسته شده است. برای موضوع جدید، تیکت جدید ثبت کنید.</div>') +
      '</div>';
  }

  window.Views.tickets = {
    render: function (params) {
      tState.tab = (params && params.tab) || tState.tab || 'new';
      /* tState.open حفظ می‌شود تا ترد باز در رندر مجدد بسته نشود */
      var tickets = window.Store.tickets();
      var tabs = '<div class="tabs">' +
        '<button class="tab' + (tState.tab === 'new' ? ' active' : '') + '" data-ttab="new">' + window.icon('plus') + 'ثبت تیکت جدید</button>' +
        '<button class="tab' + (tState.tab === 'mine' ? ' active' : '') + '" data-ttab="mine">' + window.icon('ticket') + 'تیکت‌های من <span class="cnt">' + window.fa(tickets.length) + '</span></button>' +
      '</div>';

      var formHtml =
        '<div class="ticket-form-wrap">' +
          '<div class="alert al-info">' +
            '<span class="al-ic">' + window.icon('info') + '</span>' +
            '<div><div class="al-title">چه زمانی تیکت ثبت کنیم؟</div>' +
            '<div class="al-desc">برای موضوعاتی که در فهرست خدمات غیرحضوری وجود ندارند یا نیاز به ارتباط مستقیم با کارشناسان دارند، تیکت ثبت کنید. میانگین زمان پاسخ: حداکثر یک روز کاری.</div></div>' +
          '</div>' +
          '<form id="tk-form" class="card card--flush" style="padding:16px;margin-top:14px" novalidate>' +
            '<div class="f-grid">' +
              '<div class="f f-col-6" data-field="tk-cat"><label class="f-label" for="tk-cat">دسته‌بندی موضوع <span class="f-req">*</span></label>' +
                '<select class="select" id="tk-cat" name="tk-cat"><option value="">انتخاب کنید...</option>' +
                  TICKET_CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
                '<div class="f-err">دسته‌بندی را انتخاب کنید</div></div>' +
              '<div class="f f-col-6" data-field="tk-title"><label class="f-label" for="tk-title">عنوان تیکت <span class="f-req">*</span></label>' +
                '<input class="input" id="tk-title" name="tk-title" placeholder="مثال: سؤال درباره محاسبه خسارت دیرکرد">' +
                '<div class="f-err">عنوان تیکت را وارد کنید</div></div>' +
              '<div class="f f-col-12" data-field="tk-text"><label class="f-label" for="tk-text">متن پیام <span class="f-req">*</span></label>' +
                '<textarea class="textarea" id="tk-text" name="tk-text" placeholder="شرح کامل موضوع، شماره قرارداد یا پیگیری مربوطه را نیز ذکر کنید..."></textarea>' +
                '<div class="f-err">متن پیام را وارد کنید</div></div>' +
              '<div class="f f-col-12" data-field="__tkfile"><label class="f-label">پیوست فایل (اختیاری)</label>' +
                window.UI.fileZone('tk-dropzone') + '</div>' +
            '</div>' +
            '<div class="form-actions">' +
              '<button type="submit" class="btn btn-primary btn-lg" id="tk-submit">' + window.icon('send') + 'ارسال تیکت</button>' +
              '<span class="fa-note">' + window.icon('alert-circle') + 'پاسخ در بخش «تیکت‌های من» اعلام می‌شود</span>' +
            '</div>' +
          '</form>' +
        '</div>';

      var listHtml = tickets.length
        ? '<div class="card card--flush">' + tickets.map(function (t) {
            var open = tState.open === t.id;
            return '<div class="ticket-item" data-tk-toggle="' + t.id + '">' +
              '<div class="ticket-top">' +
                '<span class="ticket-no">' + window.fa(t.id) + '</span>' +
                '<span class="ticket-t">' + window.UI.esc(t.title) + '</span>' +
                '<span class="badge bd-gray">' + window.UI.esc(t.cat) + '</span>' +
                ticketStatusBadge(t.status) +
                '<span class="text-xs text-muted" style="margin-inline-start:auto">' + window.UI.esc(t.createdAt) + '</span>' +
                window.icon(open ? 'chevron-down' : 'chevron-left') +
              '</div>' +
              (open ? ticketThread(t) : '') +
            '</div>';
          }).join('') + '</div>'
        : '<div class="card">' + window.UI.empty({ icon: 'ticket', title: 'تیکتی ثبت نکرده‌اید', desc: 'برای ارتباط با کارشناسان درباره موضوعات خارج از فهرست خدمات، اولین تیکت خود را ثبت کنید.', action: { href: '#/tickets', label: 'ثبت تیکت' } }) + '</div>';

      return '<div class="page-head anim-in">' +
          '<div><h1 class="page-title">' + window.icon('ticket') + 'ثبت تیکت و پشتیبانی</h1>' +
          '<div class="page-sub">ارتباط مستقیم با کارشناسان لیزینگ مشرق‌زمین و پیگیری پاسخ‌ها</div></div>' +
        '</div>' +
        '<div class="anim-in-1" style="margin-bottom:16px">' + tabs + '</div>' +
        '<div id="tk-body">' + (tState.tab === 'new' ? formHtml : listHtml) + '</div>';
    },

    afterRender: function () { /* noop */ },

    bind: function (root) {
      root.querySelectorAll('[data-ttab]').forEach(function (b) {
        b.addEventListener('click', function () {
          tState.tab = b.getAttribute('data-ttab');
          window.App.refresh();
        });
      });

      /* باز/بسته کردن ترد تیکت */
      root.querySelectorAll('[data-tk-toggle]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          if (e.target.closest('[data-tk-reply]') || e.target.closest('.ticket-msgs')) return;
          var id = el.getAttribute('data-tk-toggle');
          tState.open = tState.open === id ? null : id;
          window.App.refresh();
        });
      });

      /* پاسخ به تیکت */
      root.querySelectorAll('[data-tk-reply]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-tk-reply');
          var ta = root.querySelector('#tk-reply');
          var text = ta.value.trim();
          if (!text) { ta.classList.add('is-invalid'); window.UI.toast('error', 'متن خالی است', 'پاسخ خود را وارد کنید.'); return; }
          b.disabled = true;
          b.innerHTML = '<span class="spin spin-sm"></span>';
          setTimeout(function () {
            window.Store.replyTicket(id, text);
            window.UI.toast('success', 'پاسخ شما ارسال شد', 'پاسخ کارشناس پس از بررسی اعلام می‌شود.');
            window.App.refresh();
          }, 600);
        });
      });

      /* فرم تیکت جدید */
      var form = root.querySelector('#tk-form');
      if (!form) return;
      var TKFILES = [];
      var zone = root.querySelector('#tk-dropzone');
      if (zone) {
        var input = zone.querySelector('input[type=file]');
        var listEl = root.querySelector('#tk-dropzone-list');
        zone.addEventListener('click', function () { input.click(); });
        input.addEventListener('change', function () {
          Array.prototype.forEach.call(input.files, function (f) {
            TKFILES.push({ name: f.name, size: window.fa(Math.max(1, Math.round(f.size / 1024))) + ' کیلوبایت' });
          });
          input.value = '';
          listEl.innerHTML = TKFILES.map(function (f, i) {
            return '<div class="file-item"><span class="file-ic">' + window.icon('file-text') + '</span>' +
              '<div><div class="file-name">' + window.UI.esc(f.name) + '</div><div class="file-size">' + f.size + '</div></div>' +
              '<button type="button" class="file-x" data-tkrm="' + i + '">' + window.icon('trash', 'ic-12') + '</button></div>';
          }).join('');
          listEl.querySelectorAll('[data-tkrm]').forEach(function (x) {
            x.addEventListener('click', function () { TKFILES.splice(+x.getAttribute('data-tkrm'), 1); x.closest('.file-item').remove(); });
          });
        });
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        ['tk-cat', 'tk-title', 'tk-text'].forEach(function (n) {
          var el = form.querySelector('[name="' + n + '"]');
          var wrap = el.closest('.f');
          var v = el.value.trim();
          wrap.classList.remove('is-error'); el.classList.remove('is-invalid');
          if (!v) { wrap.classList.add('is-error'); el.classList.add('is-invalid'); ok = false; }
        });
        if (!ok) { window.UI.toast('error', 'ارسال تیکت ناموفق بود', 'فیلدهای ضروری را تکمیل کنید.'); return; }
        var btn = form.querySelector('#tk-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spin"></span> در حال ارسال...';
        setTimeout(function () {
          var t = window.Store.addTicket(
            form.querySelector('#tk-cat').value,
            form.querySelector('#tk-title').value.trim(),
            form.querySelector('#tk-text').value.trim(),
            TKFILES
          );
          window.UI.toast('success', 'تیکت شما ثبت شد', 'شماره تیکت: ' + window.fa(t.id));
          tState.tab = 'mine'; tState.open = t.id;
          window.App.refresh();
        }, 900);
      });
    }
  };

  /* ================= صفحه اعلان‌ها ================= */
  window.Views.notifications = {
    render: function () {
      var list = window.Store.notifs();
      var unread = window.Store.unreadCount();
      var items = list.map(function (n) {
        var cls = { success: 'st-done', info: 'bd-primary', warning: 'st-doing', danger: 'st-rejected' }[n.type] || 'bd-gray';
        return '<button class="ntf' + (n.unread ? ' is-unread' : '') + '" data-ntf="' + n.id + '" data-link="' + (n.link || '') + '">' +
          '<span class="ntf-ic badge ' + cls + '" style="height:34px;width:34px;justify-content:center">' + window.icon(n.icon) + '</span>' +
          '<span style="min-width:0;flex:1"><span class="ntf-t" style="display:block">' + window.UI.esc(n.title) + '</span>' +
          '<span class="ntf-d" style="display:block">' + window.UI.esc(n.desc) + '</span>' +
          '<span class="ntf-time" style="display:block">' + window.UI.esc(n.time) + '</span></span>' +
          (n.unread ? '<span class="unread-dot"></span>' : '') +
        '</button>';
      }).join('');
      return '<div class="page-head anim-in">' +
          '<div><h1 class="page-title">' + window.icon('bell') + 'اعلان‌ها</h1>' +
          '<div class="page-sub">آخرین اطلاع‌رسانی‌های وضعیت درخواست‌ها، تیکت‌ها و پیام‌های کارشناسان</div></div>' +
          '<button class="btn btn-outline btn-sm" data-action="mark-all-read">' + window.icon('check') + 'علامت‌گذاری همه به‌عنوان خوانده‌شده</button>' +
        '</div>' +
        '<div class="card card--flush ntf-page anim-in-1">' +
          (list.length ? items : '<div class="ntf-readall">اعلانی برای نمایش وجود ندارد.</div>') +
        '</div>' +
        (unread ? '' : '<div class="text-sm text-muted mt-3" style="text-align:center">همه اعلان‌ها خوانده شده‌اند.</div>');
    },
    afterRender: function () { /* noop */ },
    bind: function (root) {
      root.querySelectorAll('[data-ntf]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-ntf');
          var link = b.getAttribute('data-link');
          window.Store.markRead(id);
          window.App.updateBadges();
          if (link) location.hash = link; else window.App.refresh();
        });
      });
    }
  };
})();
