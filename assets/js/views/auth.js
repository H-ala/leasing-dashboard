/* ==========================================================================
   صفحه ورود (ورود مشتری به داشبورد)
   ========================================================================== */
window.Views = window.Views || {};

window.Views.login = {
  render: function () {
    var p = window.PROFILE;
    return '<div class="login-wrap">' +
      '<div class="login-box">' +
        '<div class="card login-card anim-in">' +
          '<div class="login-logo">' +
            '<span class="brand-logo">' + window.icon('car-front') + '</span>' +
            '<div class="login-t">لیزینگ مشرق‌زمین</div>' +
            '<div class="login-d">سامانه خدمات غیرحضوری مشتریان</div>' +
          '</div>' +
          '<div class="alert al-info">' +
            '<span class="al-ic">' + window.icon('info') + '</span>' +
            '<div><div class="al-title">نسخه نمایشی (دمو)</div>' +
            '<div class="al-desc">هر مقداری در فیلدها وارد کنید و وارد شوید؛ داده‌های نمونه نمایش داده می‌شود.</div></div>' +
          '</div>' +
          '<form id="login-form" novalidate>' +
            '<div class="f-grid">' +
              '<div class="f f-col-12" data-field="nid">' +
                '<label class="f-label" for="lg-nid">کد ملی <span class="f-req">*</span></label>' +
                '<input class="input" id="lg-nid" name="nid" inputmode="numeric" placeholder="کد ملی ۱۰ رقمی" style="text-align:center;letter-spacing:3px;font-size:15px">' +
                '<div class="f-err">کد ملی باید ۱۰ رقم باشد</div>' +
              '</div>' +
              '<div class="f f-col-12" data-field="pass">' +
                '<label class="f-label" for="lg-pass">رمز عبور <span class="f-req">*</span></label>' +
                '<input class="input" id="lg-pass" name="pass" type="password" placeholder="رمز عبور حساب کاربری" style="text-align:center">' +
                '<div class="f-err">رمز عبور را وارد کنید</div>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-lg btn-block mt-4" type="submit" id="lg-btn">' + window.icon('log-out') + 'ورود به داشبورد</button>' +
            '<div style="text-align:center;margin-top:10px"><a href="#" id="lg-forgot" class="text-sm text-primary">فراموشی رمز عبور؟</a></div>' +
          '</form>' +
        '</div>' +
        '<div class="login-foot">جهت دریافت رمز عبور با پشتیبانی <b>۰۲۱-۸۷۴۴</b> تماس بگیرید</div>' +
      '</div>' +
    '</div>';
  },

  bind: function (root) {
    var p = window.PROFILE;
    var form = root.querySelector('#login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nid = form.querySelector('[name=nid]');
      var pass = form.querySelector('[name=pass]');
      var ok = true;
      var nidVal = window.enDigits(nid.value).trim();
      var wrapN = nid.closest('.f'), wrapP = pass.closest('.f');
      wrapN.classList.remove('is-error'); wrapP.classList.remove('is-error');
      nid.classList.remove('is-invalid'); pass.classList.remove('is-invalid');
      if (!/^\d{10}$/.test(nidVal)) { wrapN.classList.add('is-error'); nid.classList.add('is-invalid'); ok = false; }
      if (!pass.value.trim()) { wrapP.classList.add('is-error'); pass.classList.add('is-invalid'); ok = false; }
      if (!ok) {
        window.UI.toast('error', 'ورود ناموفق بود', 'لطفاً خطاهای مشخص‌شده را برطرف کنید.');
        return;
      }
      var btn = form.querySelector('#lg-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spin"></span> در حال ورود...';
      setTimeout(function () {
        window.Store.session.set(true);
        window.UI.toast('success', 'خوش آمدید ' + p.fullName, 'ورود شما با موفقیت انجام شد.');
        location.hash = '#/home';
      }, 900);
    });
    var forgot = root.querySelector('#lg-forgot');
    if (forgot) forgot.addEventListener('click', function (e) {
      e.preventDefault();
      window.UI.toast('info', 'بازیابی رمز عبور', 'در نسخه نمایشی، رمز عبور برای ورود اختیاری است.');
    });
  }
};
