/* ==========================================================================
   UI — کامپوننت‌های مشترک رندر و رفتار
   ========================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  window.UI = {
    esc: esc,

    /* ---------- توست ---------- */
    toast: function (variant, title, desc) {
      var root = document.getElementById('toast-root');
      var el = document.createElement('div');
      var ic = variant === 'success' ? 'circle-check' : variant === 'error' ? 'alert-circle' : variant === 'warning' ? 'alert-triangle' : 'info';
      el.className = 'toast t-' + variant;
      el.innerHTML =
        '<span class="t-ic">' + window.icon(ic) + '</span>' +
        '<div><div class="t-title">' + esc(title) + '</div>' + (desc ? '<div class="t-desc">' + esc(desc) + '</div>' : '') + '</div>' +
        '<button class="t-x" aria-label="بستن">' + window.icon('x', 'ic-12') + '</button>';
      root.appendChild(el);
      var close = function () {
        el.classList.add('is-out');
        setTimeout(function () { el.remove(); }, 220);
      };
      el.querySelector('.t-x').addEventListener('click', close);
      setTimeout(close, 4200);
    },

    /* ---------- دیالوگ ---------- */
    dialog: function (opts) {
      var root = document.getElementById('dialog-root');
      var overlay = document.createElement('div');
      overlay.className = 'dlg-overlay';
      var dlg = document.createElement('div');
      dlg.className = 'dlg' + (opts.wide ? ' dlg-wide' : '');
      dlg.setAttribute('role', 'dialog');
      dlg.setAttribute('aria-modal', 'true');
      var html = '<button class="dlg-x" aria-label="بستن">' + window.icon('x') + '</button>';
      if (opts.icon) {
        html += '<div class="dlg-icon v-' + (opts.variant || 'default') + '">' + window.icon(opts.icon) + '</div>';
      }
      html += '<div class="dlg-title">' + opts.title + '</div>';
      if (opts.desc) html += '<div class="dlg-desc">' + opts.desc + '</div>';
      if (opts.body) html += '<div class="dlg-body">' + opts.body + '</div>';
      if (opts.actions && opts.actions.length) {
        html += '<div class="dlg-footer">' + opts.actions.map(function (a) {
          return '<button class="btn ' + a.cls + '" data-dlg-act="' + a.id + '"' + (a.autofocus ? ' autofocus' : '') + '>' + a.label + '</button>';
        }).join('') + '</div>';
      }
      dlg.innerHTML = html;
      overlay.appendChild(dlg);
      root.appendChild(overlay);

      var close = function () {
        overlay.classList.add('is-closing');
        dlg.classList.add('is-closing');
        setTimeout(function () { overlay.remove(); }, 210);
        document.removeEventListener('keydown', onKey);
      };
      var onKey = function (e) { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      dlg.querySelector('.dlg-x').addEventListener('click', close);
      dlg.addEventListener('click', function (e) {
        var b = e.target.closest('[data-dlg-act]');
        if (!b) return;
        var act = opts.actions.filter(function (a) { return a.id === b.getAttribute('data-dlg-act'); })[0];
        if (act && act.onClick) { act.onClick(); }
        close();
      });
      return { close: close, el: dlg };
    },

    /* دیالوگ تأیید (معادل ConfirmDialog مرجع) */
    confirm: function (opts) {
      return new Promise(function (resolve) {
        var done = false;
        UI.dialog({
          title: esc(opts.title || 'تأیید عملیات'),
          desc: opts.desc ? esc(opts.desc) : null,
          icon: opts.icon || 'alert-circle',
          variant: opts.variant || 'default',
          actions: [
            { id: 'no', label: opts.cancelLabel || 'انصراف', cls: 'btn-secondary', onClick: function () { done = false; } },
            { id: 'yes', label: opts.confirmLabel || 'تأیید', cls: 'btn-' + (opts.variant === 'destructive' ? 'destructive' : 'primary'), autofocus: true, onClick: function () { done = true; } }
          ]
        });
        /* تشخیص نتیجه */
        var root = document.getElementById('dialog-root');
        var obs = new MutationObserver(function () {
          if (!root.querySelector('.dlg')) {
            obs.disconnect();
            resolve(done);
          }
        });
        obs.observe(root, { childList: true, subtree: false });
      });
    },

    /* ---------- اجزای نمایشی ---------- */
    badge: function (b) {
      return '<span class="badge ' + b.cls + '">' + window.icon(b.icon) + b.t + '</span>';
    },

    statusBadge: function (status) {
      var st = window.STATUSES[status] || window.STATUSES.active;
      return '<span class="badge ' + st.cls + '">' + window.icon(st.icon) + st.label + '</span>';
    },

    avatar: function (name, size, cls) {
      var initials = (name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('');
      return '<span class="avatar ' + (size || 'av-32') + (cls ? ' ' + cls : '') + '">' + esc(initials) + '</span>';
    },

    alert: function (o) {
      return '<div class="alert al-' + (o.variant || 'info') + '">' +
        '<span class="al-ic">' + window.icon(o.icon || 'info') + '</span>' +
        '<div style="flex:1;min-width:0"><div class="al-title">' + esc(o.title || '') + '</div>' +
        (o.text ? '<div class="al-desc">' + esc(o.text) + '</div>' : '') + '</div>' +
        (o.dismiss ? '<button class="al-close" data-action="dismiss-ann" data-id="' + o.id + '" aria-label="بستن">' + window.icon('x', 'ic-12') + '</button>' : '') +
        '</div>';
    },

    empty: function (o) {
      return '<div class="empty">' +
        '<div class="empty-ic">' + window.icon(o.icon || 'search') + '</div>' +
        '<div class="empty-t">' + esc(o.title) + '</div>' +
        (o.desc ? '<div class="empty-d">' + esc(o.desc) + '</div>' : '') +
        (o.action ? '<a class="btn btn-outline btn-sm mt-1" href="' + o.action.href + '">' + o.action.label + '</a>' : '') +
        '</div>';
    },

    /* کارت خدمت */
    serviceCard: function (svc) {
      var cat = window.svcCat(svc);
      var badges = (svc.badges || []).map(UI.badge).join('');
      return '<article class="card svc" tabindex="0" role="button" data-action="open-service" data-id="' + svc.id + '" aria-label="' + esc(svc.title) + '" style="--c:' + cat.color + '">' +
        '<div class="svc-top">' +
          '<span class="svc-ic">' + window.icon(svc.icon) + '</span>' +
          '<div style="min-width:0"><h3 class="svc-t">' + esc(svc.title) + '</h3>' +
          '<span class="svc-cat">' + esc(cat.label) + '</span></div>' +
        '</div>' +
        '<p class="svc-desc">' + esc(svc.desc) + '</p>' +
        '<div class="svc-foot">' +
          '<div class="svc-badges">' + badges + '</div>' +
          '<button class="btn btn-primary btn-sm" data-action="open-service" data-id="' + svc.id + '">ثبت درخواست ' + window.icon('chevron-left') + '</button>' +
        '</div>' +
      '</article>';
    },

    /* جدول درخواست‌ها */
    reqRow: function (r) {
      var svc = window.svcById(r.svc) || { title: '—', icon: 'file-text', cat: 'other' };
      var cat = window.svcCat(svc) || { color: 'var(--muted-foreground)' };
      var unit = r.unit ? esc(r.unit) : '<span class="text-muted">در حال تخصیص</span>';
      var reject = r.status === 'rejected' && r.rejectReason
        ? '<div class="req-reject-cell" title="' + esc(r.rejectReason) + '">' + window.icon('alert-circle', 'ic-12') + 'دلیل رد</div>' : '';
      return '<tr data-action="open-request" data-track="' + esc(r.track) + '">' +
        '<td class="cell-track">' + window.fa(r.track) + reject + '</td>' +
        '<td><div class="cell-main"><span class="cm-ic" style="background:color-mix(in srgb,' + cat.color + ' 11%,transparent);color:' + cat.color + '">' + window.icon(svc.icon) + '</span>' +
          '<div>' + esc(svc.title) + '</div></div></td>' +
        '<td class="hide-sm">' + (r.createdAt || '—') + '</td>' +
        '<td class="hide-sm hide-md">' + (r.updatedAt || '—') + '</td>' +
        '<td>' + UI.statusBadge(r.status) + '</td>' +
        '<td class="hide-md">' + unit + '</td>' +
        '<td><span class="btn btn-outline btn-xs">جزئیات ' + window.icon('chevron-left', 'ic-12') + '</span></td>' +
      '</tr>';
    },

    reqTable: function (list) {
      if (!list.length) return UI.empty({ icon: 'clipboard-list', title: 'درخواستی یافت نشد', desc: 'با تغییر فیلترها یا جستجوی دیگر، دوباره تلاش کنید. برای ثبت درخواست جدید به بخش خدمات غیرحضوری بروید.', action: { href: '#/services', label: 'مشاهده خدمات' } });
      return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>شماره پیگیری</th><th>عنوان خدمت</th><th class="hide-sm">تاریخ ثبت</th><th class="hide-sm hide-md">آخرین به‌روزرسانی</th><th>وضعیت</th><th class="hide-md">واحد رسیدگی‌کننده</th><th></th>' +
        '</tr></thead><tbody>' + list.map(UI.reqRow).join('') + '</tbody></table></div>';
    },

    /* استپر مراحل */
    stepper: function (stages, step, status) {
      var doneMax = status === 'done' ? stages.length : status === 'rejected' ? step : step;
      var html = '<div class="steps">';
      stages.forEach(function (s, i) {
        var state = '';
        if (status === 'rejected' && i === step - 1) state = 'is-done'; /* مرحله عدم تأیید */
        else if (i < doneMax) state = 'is-done';
        if (status === 'active' && i === step) state = 'is-current';
        if (status === 'doing' && i === step) state = 'is-current';
        if (status === 'rejected' && i === step) state = 'is-current';
        var dot = state === 'is-done' ? window.icon('check') : (i + 1);
        html += '<div class="step ' + state + '"><div class="step-dot">' + dot + '</div><div class="step-label">' + esc(s) + '</div></div>';
      });
      html += '</div>';
      /* نسخه عمودی موبایل */
      html += '<div class="steps--v">';
      stages.forEach(function (s, i) {
        var state = i < doneMax ? 'is-done' : (i === doneMax && status !== 'done' ? 'is-current' : '');
        var dot = state === 'is-done' ? window.icon('check') : (i + 1);
        var sub = '';
        if (status === 'rejected' && i === step - 1) sub = '<span class="step-sub">در همین مرحله رد شد — شرح دلایل در بالا</span>';
        html += '<div class="step ' + state + '"><div class="step-dot">' + dot + '</div><div class="step-label">' + esc(s) + sub + '</div></div>';
      });
      html += '</div>';
      return html;
    },

    /* تایم‌لاین تاریخچه */
    timeline: function (history) {
      if (!history || !history.length) return UI.empty({ icon: 'history', title: 'تاریخچه‌ای ثبت نشده است' });
      return '<div class="tl">' + history.map(function (h) {
        return '<div class="tl-item is-done">' +
          '<div class="tl-dot"></div>' +
          '<div class="tl-time">' + esc(h.ts) + '</div>' +
          '<div class="tl-t">' + esc(h.t) + '</div>' +
          (h.d ? '<div class="tl-d">' + esc(h.d) + '</div>' : '') +
          (h.unit ? '<span class="tl-unit">' + window.icon('briefcase') + esc(h.unit) + '</span>' : '') +
        '</div>';
      }).join('') + '</div>';
    },

    /* ---------- فرم‌ها ---------- */
    field: function (f, val, id) {
      var req = f.req ? ' <span class="f-req">*</span>' : '';
      var spanCls = f.span ? 'f-col-' + f.span : 'f-col-6';
      var hint = f.hint ? '<div class="f-hint">' + esc(f.hint) + '</div>' : '';
      var err = '<div class="f-err">' + esc(f.err || 'این فیلد الزامی است') + '</div>';
      var inner = '';
      var v = val == null ? '' : val;
      if (f.t === 'text' || f.t === 'num' || f.t === 'tel' || f.t === 'date') {
        var inputMode = f.t === 'num' ? 'inputmode="numeric"' : '';
        inner = '<input class="input" type="text" id="' + id + '" name="' + f.n + '" value="' + esc(v) + '" placeholder="' + esc(f.ph || '') + '" ' + inputMode + '>';
      } else if (f.t === 'sel') {
        inner = '<select class="select" id="' + id + '" name="' + f.n + '"><option value="">انتخاب کنید...</option>' +
          f.opts.map(function (op) {
            var ov = typeof op === 'string' ? op : op.v; var ol = typeof op === 'string' ? op : op.l;
            return '<option value="' + esc(ov) + '"' + (v === ov ? ' selected' : '') + '>' + esc(ol) + '</option>';
          }).join('') + '</select>';
      } else if (f.t === 'ta') {
        inner = '<textarea class="textarea" id="' + id + '" name="' + f.n + '" placeholder="' + esc(f.ph || '') + '">' + esc(v) + '</textarea>';
      } else if (f.t === 'radio') {
        inner = '<div class="rdo-cards">' + f.opts.map(function (op) {
          return '<label class="rdo-card"><input type="radio" name="' + f.n + '" value="' + esc(op) + '"' + (v === op ? ' checked' : '') + '>' +
            '<span class="rc-box">' + window.icon('circle-check') + esc(op) + '</span></label>';
        }).join('') + '</div>';
      } else if (f.t === 'cbs') {
        inner = '<div class="chk-group">' + f.opts.map(function (op) {
          var checked = Array.isArray(v) ? v.indexOf(op) !== -1 : false;
          return '<label class="chk"><input type="checkbox" name="' + f.n + '" value="' + esc(op) + '"' + (checked ? ' checked' : '') + '><span>' + esc(op) + '</span></label>';
        }).join('') + '</div>';
      } else if (f.t === 'chk') {
        return '<div class="f ' + spanCls + '" data-field="' + f.n + '">' +
          '<label class="chk"><input type="checkbox" name="' + f.n + '" value="1"' + (v ? ' checked' : '') + (f.req ? ' data-req="1"' : '') + '><span>' + esc(f.l) + (f.req ? ' <span class="f-req">*</span>' : '') + '</span></label>' +
          err + '</div>';
      }
      return '<div class="f ' + spanCls + '" data-field="' + f.n + '">' +
        '<label class="f-label" for="' + id + '">' + esc(f.l) + req + '</label>' + inner + hint + err +
      '</div>';
    },

    /* ناحیه بارگذاری فایل */
    fileZone: function (zoneId, reqDocs) {
      var docs = (reqDocs && reqDocs.length)
        ? '<div class="doc-req">' + reqDocs.map(function (d) { return '<span class="badge bd-gray">' + window.icon('alert-circle') + d + ' <span class="f-req">*</span></span>'; }).join('') + '</div>' : '';
      return docs +
        '<div class="dropzone" id="' + zoneId + '" tabindex="0" role="button" aria-label="بارگذاری فایل">' +
          window.icon('upload') +
          '<div class="dz-t">فایل‌ها را اینجا رها کنید یا <span>از سیستم انتخاب کنید</span></div>' +
          '<div class="dz-d">فرمت‌های مجاز: JPG، PNG، PDF — حداکثر حجم هر فایل: ۱۰ مگابایت</div>' +
          '<input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style="display:none">' +
        '</div>' +
        '<div class="file-list" id="' + zoneId + '-list"></div>';
    },

    /* ماسک اطلاعات حساس */
    mask: function (val, keepStart, keepEnd) {
      var s = String(val);
      if (s.length <= keepStart + keepEnd) return s;
      var hidden = s.length - keepStart - keepEnd;
      return s.slice(0, keepStart) + new Array(hidden + 1).join('*') + s.slice(s.length - keepEnd);
    }
  };
})();
