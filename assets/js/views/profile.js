/* ==========================================================================
   پروفایل کاربری
   ========================================================================== */
window.Views = window.Views || {};

window.Views.profile = {
  render: function () {
    var p = window.PROFILE;
    var esc = window.UI.esc;
    var masked = this._masked = !this._masked; /* تغییر وضعیت نمایش هر بار رندر */

    var nid = masked ? window.UI.mask(p.nationalId, 3, 3) : p.nationalId;
    var mob = masked ? window.UI.mask(p.mobile, 4, 4) : p.mobile;
    var contracts = window.CONTRACTS.map(function (c) {
      return '<div class="aside-doc" style="align-items:flex-start">' + window.icon('car') +
        '<span><b>' + window.UI.esc(c.vehicle) + '</b> — مدل ' + window.fa(c.model) +
        '<span style="display:block;font-size:11px;color:var(--muted-foreground)">شماره قرارداد: ' + window.fa(window.UI.mask(c.no, 4, 2)) +
        ' | اقساط باقی‌مانده: ' + window.fa(c.remain) + ' قسط | قسط ماهانه: ' + window.fmtNum(c.monthly) + ' تومان</span></span></div>';
    }).join('');

    function kvRow(k, v, opts) {
      opts = opts || {};
      return '<div class="k">' + k + '</div><div class="v">' + v +
        (opts.mask ? '<button class="masked-btn" data-action="toggle-mask" style="display:none"></button>' : '') + '</div>';
    }

    return '<div class="page-head anim-in">' +
        '<div><h1 class="page-title">' + window.icon('user') + 'پروفایل کاربری</h1>' +
        '<div class="page-sub">اطلاعات هویتی، قراردادها و اطلاعات تماس ثبت‌شده شما</div></div>' +
        '<a class="btn btn-outline btn-sm" href="#/service/svc-19">' + window.icon('refresh-cw') + 'به‌روزرسانی آدرس و تلفن</a>' +
      '</div>' +

      '<div class="card anim-in-1" style="flex-direction:row;align-items:center;gap:16px;flex-wrap:wrap;padding:18px 16px">' +
        window.UI.avatar(p.fullName, 'av-56') +
        '<div style="flex:1;min-width:200px">' +
          '<div style="font-family:var(--font-heading);font-size:17px;font-weight:700;color:var(--foreground)">' + esc(p.fullName) + '</div>' +
          '<div class="text-sm text-muted mt-1">شماره مشتری: <b>' + window.fa(p.customerNo) + '</b> — عضویت از ' + window.fa(p.memberSince) + '</div>' +
        '</div>' +
        '<span class="badge st-done">' + window.icon('badge-check') + 'مشتری فعال</span>' +
      '</div>' +

      '<div class="prof-grid">' +
        '<div class="card card--flush">' +
          '<div class="card-h"><div class="card-t">اطلاعات هویتی</div>' +
            '<button class="btn btn-ghost btn-xs" id="mask-toggle">' + window.icon(masked ? 'eye' : 'eye-off') + (masked ? 'نمایش اطلاعات' : 'پنهان‌سازی') + '</button></div>' +
          '<div class="card-b"><div class="kv">' +
            kvRow('نام و نام خانوادگی', esc(p.fullName)) +
            kvRow('کد ملی', '<span class="masked-val">' + window.fa(nid) + '</span>') +
            kvRow('شماره همراه', '<span class="masked-val">' + window.fa(mob) + '</span>') +
            kvRow('شماره مشتری', window.fa(p.customerNo)) +
          '</div></div>' +
          '<div class="card-f"><span class="text-xs text-muted">' + window.icon('shield-check', 'ic-12') + ' اطلاعات حساس به‌صورت پیش‌فرض محافظت‌شده نمایش داده می‌شود.</span></div>' +
        '</div>' +

        '<div class="card card--flush">' +
          '<div class="card-h"><div class="card-t">اطلاعات تماس و نشانی</div></div>' +
          '<div class="card-b"><div class="kv">' +
            kvRow('نشانی ثبت‌شده', esc(p.address)) +
            kvRow('کد پستی', window.fa(p.postalCode)) +
            kvRow('تلفن ثابت', window.fa(p.phone)) +
            kvRow('رایانامه', esc(p.email)) +
          '</div></div>' +
          '<div class="card-f"><a href="#/service/svc-19" class="btn btn-outline btn-xs">' + window.icon('refresh-cw', 'ic-12') + 'درخواست اصلاح اطلاعات</a></div>' +
        '</div>' +

        '<div class="card card--flush" style="grid-column:1/-1">' +
          '<div class="card-h"><div class="card-t">قراردادهای فعال</div><span class="badge bd-primary">' + window.fa(window.CONTRACTS.length) + ' قرارداد</span></div>' +
          '<div class="card-b"><div class="aside-sticky-list">' + contracts + '</div></div>' +
          '<div class="card-f"><span class="text-xs text-muted">شماره کامل قرارداد تنها در اسناد رسمی و رسیدها نمایش داده می‌شود.</span></div>' +
        '</div>' +
      '</div>';
  },

  afterRender: function () { /* noop */ },

  bind: function (root) {
    var btn = root.querySelector('#mask-toggle');
    if (btn) btn.addEventListener('click', function () { window.App.refresh(); });
  }
};
