/* ==========================================================================
   صفحه خدمات غیرحضوری ۲ — کارت‌های آیکون و عنوان
   ========================================================================== */

window.Views = window.Views || {};

(function () {
    'use strict';

    window.Views.services2 = {
        render: function () {
            return (
                '<div class="page-head anim-in">' +
                '<div>' +
                '<h1 class="page-title">' + window.icon('grid') + 'خدمات غیرحضوری</h1>' +
                '<div class="page-sub">خدمت موردنظر را انتخاب کنید.</div>' +
                '</div>' +
                '</div>' +
                '<div class="svc2-grid anim-in-1">' +
                window.SERVICES.map(function (s) {
                    return (
                        '<button class="svc2-card" data-action="open-service" data-id="' + s.id + '">' +
                        '<span class="svc2-icon">' + window.icon(s.icon) + '</span>' +
                        '<span class="svc2-title">' + window.UI.esc(s.title) + '</span>' +
                        '</button>'
                    );
                }).join('') +
                '</div>'
            );
        }
    };
})();