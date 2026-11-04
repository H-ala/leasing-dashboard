/* ==========================================================================
   فرم اختصاصی هر خدمت — ۲۰ فرم متفاوت بر اساس ماهیت خدمت
   (اطلاعات هویتی خودکار + فیلدهای اختصاصی + مدارک + پیش‌نویس + اعتبارسنجی)
   ========================================================================== */
window.Views = window.Views || {};

(function () {
  'use strict';

  var esc = window.UI.esc;
  var FILES = []; /* فایل‌های انتخاب‌شده فرم جاری */

  function resetFiles() { FILES.length = 0; }

  function fieldVals(svc, root) {
    var vals = {};
    svc.fields.forEach(function (f) {
      var els = root.querySelectorAll('[name="' + f.n + '"]');
      if (!els.length) return;
      if (f.t === 'cbs') {
        var arr = [];
        els.forEach(function (el) { if (el.checked) arr.push(el.value); });
        vals[f.n] = arr;
      } else if (f.t === 'chk') {
        vals[f.n] = els[0].checked;
      } else if (f.t === 'radio') {
        els.forEach(function (el) { if (el.checked) vals[f.n] = el.value; });
      } else {
        vals[f.n] = els[0].value;
      }
    });
    return vals;
  }

  function validate(svc, root) {
    var ok = true;
    var firstBad = null;
    /* پاک‌سازی قبلی */
    root.querySelectorAll('.f.is-error').forEach(function (f) { f.classList.remove('is-error'); });
    root.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });

    svc.fields.forEach(function (f) {
      var wrap = root.querySelector('[data-field="' + f.n + '"]');
      if (!wrap) return;
      var bad = false;
      if (f.t === 'cbs') {
        var any = root.querySelectorAll('[name="' + f.n + '"]:checked').length > 0;
        if (f.req && !any) bad = true;
      } else if (f.t === 'chk') {
        if (f.req && !root.querySelector('[name="' + f.n + '"]').checked) bad = true;
        if (bad) wrap.querySelector('input').classList.add('is-invalid');
      } else if (f.t === 'radio') {
        if (f.req && !root.querySelector('[name="' + f.n + '"]:checked')) bad = true;
        if (bad) wrap.querySelectorAll('.rdo-card').forEach(function (rc) { rc.classList.add('is-invalid'); });
      } else {
        var el = root.querySelector('[name="' + f.n + '"]');
        var v = window.enDigits(el.value).trim();
        if (f.req && !v) bad = true;
        if (!bad && v && f.pattern) {
          try { if (!new RegExp(f.pattern).test(v)) bad = true; } catch (e) { /* noop */ }
        }
        if (!bad && f.t === 'num' && v && (isNaN(Number(v.replace(/,/g, ''))) || Number(v.replace(/,/g, '')) <= 0)) bad = true;
        if (bad) { el.classList.add('is-invalid'); }
      }
      if (bad) {
        wrap.classList.add('is-error');
        ok = false;
        if (!firstBad) firstBad = wrap;
      }
    });

    /* فایل‌های الزامی */
    var wrap2 = root.querySelector('[data-field="__files"]');
    if (wrap2 && svc.reqDocs && svc.reqDocs.length && !FILES.length) {
      wrap2.classList.add('is-error');
      ok = false;
      if (!firstBad) firstBad = wrap2;
    }
    /* تأیید صحت */
    var chk = root.querySelector('#confirm-check');
    var wrap3 = root.querySelector('[data-field="__confirm"]');
    if (wrap3 && !chk.checked) {
      wrap3.classList.add('is-error');
      chk.classList.add('is-invalid');
      ok = false;
      if (!firstBad) firstBad = wrap3;
    }
    if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  function renderFiles() {
    var list = document.getElementById('svc-files-list');
    if (!list) return;
    list.innerHTML = FILES.map(function (f, i) {
      return '<div class="file-item">' +
        '<span class="file-ic">' + window.icon('file-text') + '</span>' +
        '<div style="min-width:0"><div class="file-name">' + window.UI.esc(f.name) + '</div>' +
        '<div class="file-size">' + f.size + '</div></div>' +
        '<button type="button" class="file-x" data-rmfile="' + i + '" aria-label="حذف فایل">' + window.icon('trash', 'ic-12') + '</button>' +
      '</div>';
    }).join('');
    if (FILES.length) {
      var wrap = document.querySelector('[data-field="__files"]');
      if (wrap) wrap.classList.remove('is-error');
    }
  }

  function bindZone(root) {
    var zone = root.querySelector('#svc-dropzone');
    if (!zone) return;
    var input = zone.querySelector('input[type=file]');
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('is-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('is-over');
      addFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
    list_remove(root);
  }

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList || [], function (f) {
      var kb = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' مگابایت' : Math.max(1, Math.round(f.size / 1024)) + ' کیلوبایت';
      var size = window.fa(kb.replace('.', '٫').replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; }));
      FILES.push({ name: f.name, size: size });
    });
    renderFiles();
  }

  function list_remove(root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rmfile]');
      if (!b) return;
      FILES.splice(+b.getAttribute('data-rmfile'), 1);
      renderFiles();
    });
  }

  window.Views.form = {
    render: function (params) {
      var svc = window.svcById(params.id);
      if (!svc) return '<div class="card">' + window.UI.empty({ icon: 'alert-circle', title: 'خدمت یافت نشد', action: { href: '#/services', label: 'بازگشت به خدمات' } }) + '</div>';
      var cat = window.svcCat(svc);
      var p = window.PROFILE;
      resetFiles();

      var draft = window.Store.getDraft(svc.id);
      var draftBanner = draft
        ? '<div class="alert al-warning" style="margin-bottom:4px"><span class="al-ic">' + window.icon('history') + '</span>' +
          '<div><div class="al-title">پیش‌نویس ذخیره‌شده پیدا شد</div><div class="al-desc">اطلاعات این فرم قبلاً به‌صورت موقت ذخیره شده است. می‌توانید ادامه دهید یا پیش‌نویس را حذف کنید.</div></div>' +
          '<button class="btn btn-outline btn-xs" data-draft="restore" style="margin-inline-start:auto">بازیابی</button>' +
          '<button class="btn btn-ghost btn-xs" data-draft="discard">حذف</button></div>'
        : '';

      var badges = (svc.badges || []).map(window.UI.badge).join('');

      /* فیلدهای اختصاصی */
      var draftVals = (draft && draft.values) || {};
      var fieldsHtml = svc.fields.map(function (f, i) {
        return window.UI.field(f, draftVals[f.n], 'fld-' + i);
      }).join('');

      /* قرارداد */
      var contractHtml = '';
      if (svc.contract) {
        contractHtml =
          '<section class="fsection">' +
            '<div class="fsection-head"><span class="fsection-ic">' + window.icon('clipboard-list') + '</span>' +
            '<div><div class="fsection-t">انتخاب قرارداد</div><div class="fsection-d">قرارداد مرتبط با این درخواست را انتخاب کنید</div></div></div>' +
            '<div class="f-grid">' +
              '<div class="f f-col-12"><label class="f-label" for="contract-sel">قرارداد <span class="f-req">*</span></label>' +
              '<select class="select" id="contract-sel">' +
                window.CONTRACTS.map(function (c) { return '<option value="' + c.id + '">' + window.fa(c.no) + ' — ' + esc(c.vehicle) + '</option>'; }).join('') +
              '</select></div>' +
            '</div>' +
            '<div class="contract-box" id="contract-box"></div>' +
          '</section>';
      }

      return '<div class="crumbs anim-in">' +
          '<a href="#/home">صفحه اصلی</a><span class="sep">/</span>' +
          '<a href="#/services">خدمات غیرحضوری</a><span class="sep">/</span>' +
          '<a href="#/services?cat=' + cat.id + '">' + esc(cat.label) + '</a><span class="sep">/</span>' +
          '<span class="cur">' + esc(svc.title) + '</span>' +
        '</div>' +

        '<div class="svc-hero anim-in">' +
          '<span class="svc-ic" style="--c:' + cat.color + '">' + window.icon(svc.icon) + '</span>' +
          '<div style="flex:1;min-width:240px">' +
            '<div class="svc-hero-t">' + esc(svc.title) + '</div>' +
            '<div class="svc-hero-d">' + esc(svc.desc) + '</div>' +
            '<div class="svc-hero-badges">' + badges + '</div>' +
          '</div>' +
          '<button class="btn btn-ghost btn-sm" data-action="go-back">' + window.icon('chevron-right') + 'بازگشت</button>' +
        '</div>' +

        (svc.note ? '<div style="margin-bottom:14px" class="anim-in-1">' + window.UI.alert({ variant: svc.note.variant, icon: svc.note.icon, title: svc.note.title, text: svc.note.text }) + '</div>' : '') +

        '<div class="form-layout">' +
          '<form class="form-main" id="svc-form" novalidate>' + draftBanner +
            '<div class="card card--flush" style="padding:16px">' +

              /* اطلاعات هویتی خودکار */
              '<section class="fsection">' +
                '<div class="fsection-head"><span class="fsection-ic">' + window.icon('user') + '</span>' +
                '<div><div class="fsection-t">اطلاعات هویتی مشتری</div><div class="fsection-d">به‌صورت خودکار از پروفایل شما تکمیل شده است</div></div>' +
                '<span class="badge bd-success" style="margin-inline-start:auto">' + window.icon('badge-check') + 'تکمیل خودکار</span></div>' +
                '<div class="f-grid">' +
                  '<div class="f f-col-4"><label class="f-label">نام و نام خانوادگی</label><input class="input" readonly value="' + esc(p.fullName) + '"></div>' +
                  '<div class="f f-col-4"><label class="f-label">کد ملی</label><input class="input" readonly value="' + window.fa(window.UI.mask(p.nationalId, 3, 3)) + '"></div>' +
                  '<div class="f f-col-4"><label class="f-label">شماره همراه</label><input class="input" readonly value="' + window.fa(window.UI.mask(p.mobile, 4, 4)) + '"></div>' +
                '</div>' +
              '</section>' +

              contractHtml +

              /* فیلدهای اختصاصی خدمت */
              '<section class="fsection">' +
                '<div class="fsection-head"><span class="fsection-ic">' + window.icon(svc.icon) + '</span>' +
                '<div><div class="fsection-t">مشخصات درخواست</div><div class="fsection-d">فیلدهای اختصاصی خدمت «' + esc(svc.title) + '»</div></div></div>' +
                '<div class="f-grid">' + fieldsHtml + '</div>' +
              '</section>' +

              /* مدارک */
              '<section class="fsection" data-field="__files">' +
                '<div class="fsection-head"><span class="fsection-ic">' + window.icon('paperclip') + '</span>' +
                '<div><div class="fsection-t">مدارک و پیوست‌ها</div><div class="fsection-d">' + (svc.reqDocs && svc.reqDocs.length ? 'بارگذاری مدارک ستاره‌دار الزامی است' : 'بارگذاری مدارک اختیاری است') + '</div></div></div>' +
                window.UI.fileZone('svc-dropzone', svc.reqDocs) +
                '<div class="f-err" style="margin-top:6px">بارگذاری مدارک الزامی این خدمت فراموش شده است</div>' +
              '</section>' +

              /* توضیحات + تأیید */
              '<section class="fsection" data-field="__confirm">' +
                '<div class="fsection-head"><span class="fsection-ic">' + window.icon('file-text') + '</span>' +
                '<div><div class="fsection-t">توضیحات تکمیلی و تأیید</div></div></div>' +
                '<div class="f f-col-12"><label class="f-label">توضیحات تکمیلی (اختیاری)</label>' +
                '<textarea class="textarea" id="__notes" placeholder="هر نکته‌ای که لازم است کارشناس بداند...">' + esc(draftVals.__notes || '') + '</textarea></div>' +
                '<label class="chk mt-3" style="max-width:640px"><input type="checkbox" id="confirm-check"><span>صحت اطلاعات وارد‌شده و مدارک بارگذاری‌شده را تأیید می‌کنم و می‌دانم در صورت ارائه اطلاعات نادرست، درخواست رد خواهد شد. <span class="f-req">*</span></span></label>' +
                '<div class="f-err">تأیید صحت اطلاعات برای ثبت نهایی الزامی است</div>' +
              '</section>' +

              '<div class="form-actions">' +
                '<button type="button" class="btn btn-secondary" data-form-act="draft">' + window.icon('history') + 'ذخیره پیش‌نویس</button>' +
                '<button type="submit" class="btn btn-primary btn-lg" data-form-act="submit" id="svc-submit">' + window.icon('check') + 'ثبت نهایی درخواست</button>' +
                '<span class="fa-note">' + window.icon('alert-circle') + 'فیلدهای ستاره‌دار الزامی هستند</span>' +
              '</div>' +
            '</div>' +
          '</form>' +

          /* ستون کنار: راهنما */
          '<aside class="form-aside">' +
            '<div class="card">' +
              '<div class="card-h"><div><div class="card-t">راهنمای ثبت درخواست</div><div class="card-d">مدارک لازم و مراحل رسیدگی</div></div>' +
              '<span class="badge bd-cyan">' + window.icon('info') + 'راهنما</span></div>' +
              '<div class="card-b">' +
                (svc.guide && svc.guide.docs.length
                  ? '<div class="aside-sticky-list">' + svc.guide.docs.map(function (d) {
                      return '<div class="aside-doc">' + window.icon('check') + '<span>' + esc(d) + '</span></div>';
                    }).join('') + '</div>'
                  : '<div class="aside-note">' + window.icon('info') + '<span>برای این خدمت مدرک خاصی نیاز نیست؛ کافی است فرم را تکمیل کنید.</span></div>') +
                '<div class="aside-note" style="margin-top:12px">' + window.icon('history') +
                  '<span><b>مراحل رسیدگی:</b> ' + window.svcStages(svc).map(function (s, i) { return window.fa(i + 1) + ') ' + s; }).join(' ← ') + '</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="card">' +
              '<div class="card-b" style="display:flex;gap:11px;align-items:flex-start">' +
                '<span class="stat-ic" style="background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)">' + window.icon('headphones') + '</span>' +
                '<div><div style="font-weight:700;font-size:13px;color:var(--foreground)">سؤالی درباره این خدمت دارید؟</div>' +
                '<div class="text-sm text-muted mt-1" style="line-height:1.8">کارشناسان ما پاسخگو هستند.</div>' +
                '<a class="btn btn-outline btn-sm mt-2" href="#/tickets">' + window.icon('ticket') + 'ثبت تیکت</a></div>' +
              '</div>' +
            '</div>' +
          '</aside>' +
        '</div>';
    },

    afterRender: function (params) {
      var svc = window.svcById(params.id);
      if (svc && svc.contract) updateContractBox(window.CONTRACTS[0].id);
      renderFiles();
    },

    bind: function (root, params) {
      var svc = window.svcById(params.id);
      if (!svc) return;
      var form = root.querySelector('#svc-form');
      bindZone(root);

      /* جعبه اطلاعات قرارداد */
      var csel = root.querySelector('#contract-sel');
      if (csel) csel.addEventListener('change', function () { updateContractBox(csel.value); });

      /* دکمه‌های پیش‌نویس در بنر */
      root.querySelectorAll('[data-draft]').forEach(function (b) {
        b.addEventListener('click', function () {
          var act = b.getAttribute('data-draft');
          if (act === 'discard') {
            window.UI.confirm({ title: 'حذف پیش‌نویس', desc: 'اطلاعات ذخیره‌شده این فرم حذف شود؟', icon: 'trash', variant: 'destructive', confirmLabel: 'حذف پیش‌نویس' }).then(function (yes) {
              if (yes) { window.Store.clearDraft(svc.id); window.UI.toast('success', 'پیش‌نویس حذف شد'); window.App.refresh(); }
            });
          } else if (act === 'restore') {
            restoreDraft(root, svc);
            window.UI.toast('success', 'پیش‌نویس بازیابی شد', 'اطلاعات ذخیره‌شده در فرم قرار گرفت.');
          }
        });
      });

      /* دکمه ذخیره پیش‌نویس */
      form.querySelector('[data-form-act="draft"]').addEventListener('click', function () {
        var vals = fieldVals(svc, root);
        vals.__notes = root.querySelector('#__notes').value;
        window.Store.saveDraft(svc.id, { values: vals, files: FILES.map(function (f) { return { name: f.name, size: f.size }; }) });
        window.UI.toast('success', 'پیش‌نویس ذخیره شد', 'می‌توانید هر زمان دیگر این فرم را تکمیل کنید.');
      });

      /* ارسال فرم */
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(svc, root)) {
          window.UI.toast('error', 'ثبت درخواست ناموفق بود', 'لطفاً فیلدهای مشخص‌شده را تکمیل یا اصلاح کنید.');
          return;
        }
        var btn = form.querySelector('#svc-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spin"></span> در حال ثبت درخواست...';
        setTimeout(function () {
          var vals = fieldVals(svc, root);
          vals.__notes = root.querySelector('#__notes').value;
          var req = window.Store.addRequest(svc, vals, FILES.map(function (f) { return { name: f.name, size: f.size }; }));
          window.Store.clearDraft(svc.id);
          resetFiles();
          showReceipt(req, svc);
          btn.disabled = false;
          btn.innerHTML = window.icon('check') + 'ثبت نهایی درخواست';
        }, 1100);
      });
    }
  };

  /* ---------- کمکی ---------- */
  function updateContractBox(cid) {
    var c = window.CONTRACTS.filter(function (x) { return x.id === cid; })[0];
    var box = document.getElementById('contract-box');
    if (!c || !box) return;
    box.innerHTML =
      '<div><div class="cb-k">شماره قرارداد</div><div class="cb-v">' + window.fa(c.no) + '</div></div>' +
      '<div><div class="cb-k">خودرو</div><div class="cb-v">' + window.UI.esc(c.vehicle) + '</div></div>' +
      '<div><div class="cb-k">پلاک</div><div class="cb-v">' + esc(c.plate) + '</div></div>' +
      '<div><div class="cb-k">اقساط باقی‌مانده</div><div class="cb-v">' + window.fa(c.remain) + ' قسط</div></div>';
  }

  function restoreDraft(root, svc) {
    var d = window.Store.getDraft(svc.id);
    if (!d) return;
    svc.fields.forEach(function (f) {
      var v = d.values[f.n];
      if (v == null) return;
      var els = root.querySelectorAll('[name="' + f.n + '"]');
      if (!els.length) return;
      if (f.t === 'cbs') { els.forEach(function (el) { el.checked = v.indexOf(el.value) !== -1; }); }
      else if (f.t === 'chk') { els[0].checked = !!v; }
      else if (f.t === 'radio') { els.forEach(function (el) { if (el.value === v) el.checked = true; }); }
      else { els[0].value = v; }
    });
    var notes = root.querySelector('#__notes');
    if (notes && d.values.__notes) notes.value = d.values.__notes;
    if (d.files && d.files.length) { d.files.forEach(function (f) { FILES.push(f); }); renderFiles(); }
  }

  function showReceipt(req, svc) {
    var now = new Date();
    var hh = now.getHours(), mm = now.getMinutes();
    var time = window.fa((hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm);
    var dialog = window.UI.dialog({
      icon: 'circle-check', variant: 'success',
      title: 'درخواست شما با موفقیت ثبت شد',
      desc: 'این شماره پیگیری را جهت پیگیری و پیام‌های بعدی نزد خود نگه دارید.',
      body: '<div class="receipt-box">' +
          '<div style="font-size:11.5px;color:var(--muted-foreground);margin-bottom:6px">شماره پیگیری درخواست</div>' +
          '<div class="receipt-track" style="display:flex;align-items:center;justify-content:center;gap:10px">' + window.fa(req.track) +
            '<button class="copy-btn" data-copy="' + req.track + '">' + window.icon('copy') + 'کپی</button></div>' +
          '<div style="margin-top:14px;text-align:start">' +
            '<div class="receipt-row"><span class="k">عنوان خدمت</span><span class="v">' + window.UI.esc(svc.title) + '</span></div>' +
            '<div class="receipt-row"><span class="k">تاریخ و ساعت ثبت</span><span class="v">' + window.TODAY + ' - ' + time + '</span></div>' +
            '<div class="receipt-row"><span class="k">وضعیت فعلی</span><span class="v">فعال — در انتظار بررسی</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="text-sm text-muted mt-3" style="text-align:center;line-height:1.9">وضعیت درخواست و تاریخچه رسیدگی، از بخش «درخواست‌های من» قابل مشاهده است.</div>',
      actions: [
        { id: 'print', label: window.icon('printer') + 'چاپ رسید', cls: 'btn-outline' },
        { id: 'view', label: 'مشاهده جزئیات درخواست', cls: 'btn-primary', onClick: function () { setTimeout(function () { location.hash = '#/request/' + req.track; }, 120); } }
      ],
      wide: true
    });

    /* چاپ رسید */
    dialog.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy]');
      if (b) { copyText(b.getAttribute('data-copy')); window.UI.toast('success', 'کپی شد', 'شماره پیگیری در کلیپ‌بورد قرار گرفت.'); return; }
      if (e.target.closest('[data-dlg-act="print"]')) {
        window.App.printReceipt(req, svc);
      }
    });
  }

  function copyText(t) {
    try {
      navigator.clipboard.writeText(t);
    } catch (e) {
      var ta = document.createElement('textarea');
      ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* noop */ }
      ta.remove();
    }
  }
  window.UI.copyText = copyText;
})();
