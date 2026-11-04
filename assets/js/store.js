/* ==========================================================================
   Store — مدیریت وضعیت و ذخیره‌سازی (localStorage) با قابلیت اتصال آینده به API
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'lzm_state_v1';
  var SESSION_KEY = 'lzm_session_v1';

  function deep(o) { return JSON.parse(JSON.stringify(o)); }

  var Store = {
    state: null,

    /* بارگذاری یا مقداردهی اولیه */
    init: function () {
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { /* حالت خصوصی مرورگر */ }
      if (raw) {
        try { this.state = JSON.parse(raw); } catch (e) { this.state = null; }
      }
      if (!this.state || !this.state.requests) {
        this.state = {
          requests: deep(window.MOCK_REQUESTS),
          tickets: deep(window.MOCK_TICKETS),
          notifs: deep(window.MOCK_NOTIFS),
          dismissed: [],
          drafts: {}
        };
        this.save();
      }
    },

    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { /* noop */ }
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
      this.init();
    },

    /* ---------- نشست کاربر ---------- */
    session: {
      get: function () { try { return localStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } },
      set: function (v) { try { localStorage.setItem(SESSION_KEY, v ? '1' : '0'); } catch (e) { /* noop */ } }
    },

    /* ---------- درخواست‌ها ---------- */
    requests: function () { return this.state.requests; },
    reqByTrack: function (track) {
      var t = String(track).toLowerCase();
      for (var i = 0; i < this.state.requests.length; i++) {
        if (String(this.state.requests[i].track).toLowerCase() === t) return this.state.requests[i];
      }
      return null;
    },
    addRequest: function (svc, fields, fileNames) {
      var now = new Date();
      var pad = function (x) { return x < 10 ? '0' + x : '' + x; };
      var pMonth;
      try { pMonth = new Intl.DateTimeFormat('en-US-u-ca-persian', { month: '2-digit' }).format(now); }
      catch (e) { pMonth = pad(now.getMonth() + 1); }
      var num = String(Math.floor(1000 + Math.random() * 9000));
      var track = '1405-' + pMonth + '-' + num;
      var stages = deep(window.svcStages(svc));
      var req = {
        track: track,
        svc: svc.id,
        status: 'active',
        createdAt: 'هم‌اکنون',
        updatedAt: 'هم‌اکنون',
        unit: null,
        step: 1,
        fields: fields,
        files: fileNames.map(function (n) { return { name: n.name, size: n.size }; }),
        history: [
          { ts: 'امروز - ' + fa(pad(now.getHours()) + ':' + pad(now.getMinutes())), t: 'ثبت درخواست', d: 'درخواست «' + svc.title + '» با موفقیت ثبت شد و در صف بررسی قرار گرفت.', unit: null }
        ],
        messages: []
      };
      req.stages = stages;
      this.state.requests.unshift(req);
      this.addNotif('success', 'circle-check', 'درخواست شما با موفقیت ثبت شد', 'درخواست «' + svc.title + '» با شماره پیگیری ' + fa(track) + ' ثبت شد.', '#/request/' + track);
      this.save();
      return req;
    },
    addFiles: function (track, names) {
      var req = this.reqByTrack(track);
      if (!req) return;
      (names || []).forEach(function (f) { req.files.push({ name: f.name, size: f.size }); });
      req.updatedAt = 'هم‌اکنون';
      req.history.push({ ts: 'هم‌اکنون', t: 'ارسال مدرک تکمیلی', d: 'مشتری ' + names.length + ' فایل پیوست کرد: ' + names.map(function (n) { return n.name; }).join('، '), unit: null });
      this.addNotif('info', 'file-text', 'مدرک تکمیلی ارسال شد', 'فایل‌های پیوست شما به درخواست ' + fa(track) + ' اضافه شد و برای کارشناس ارسال گردید.', '#/request/' + track);
      this.save();
    },
    addMessage: function (track, text, fileName) {
      var req = this.reqByTrack(track);
      if (!req) return;
      req.messages.push({ from: 'customer', ts: 'هم‌اکنون', text: text, file: fileName || null });
      req.updatedAt = 'هم‌اکنون';
      req.messages.push({ from: 'system', ts: 'هم‌اکنون', text: 'پیام شما با موفقیت ثبت شد و برای کارشناس مربوطه ارسال گردید. پاسخ از طریق همین بخش اعلام می‌شود.' });
      this.addNotif('info', 'message', 'پیام شما ثبت شد', 'پیام شما درباره درخواست ' + fa(track) + ' برای کارشناس ارسال شد.', '#/request/' + track);
      this.save();
    },

    /* ---------- تیکت‌ها ---------- */
    tickets: function () { return this.state.tickets; },
    addTicket: function (cat, title, text, fileNames) {
      var num = String(Math.floor(1000 + Math.random() * 9000));
      var t = {
        id: 'TK-1405-' + num, cat: cat, title: title, status: 'open',
        createdAt: 'هم‌اکنون',
        msgs: [{ from: 'customer', ts: 'هم‌اکنون', text: text, file: (fileNames && fileNames[0]) ? fileNames[0].name : null }]
      };
      this.state.tickets.unshift(t);
      this.addNotif('success', 'ticket', 'تیکت شما ثبت شد', 'تیکت «' + title + '» با شماره ' + fa(t.id) + ' ثبت شد؛ پاسخ کارشناس در همین بخش اعلام می‌شود.', '#/tickets');
      this.save();
      return t;
    },
    replyTicket: function (id, text) {
      var list = this.state.tickets;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].msgs.push({ from: 'customer', ts: 'هم‌اکنون', text: text });
          if (list[i].status === 'closed') list[i].status = 'open';
          list[i].status = list[i].status === 'answered' ? 'answered' : 'open';
          this.save();
          return list[i];
        }
      }
      return null;
    },

    /* ---------- اعلان‌ها ---------- */
    notifs: function () { return this.state.notifs; },
    unreadCount: function () {
      var c = 0; this.state.notifs.forEach(function (n) { if (n.unread) c++; }); return c;
    },
    addNotif: function (type, icon, title, desc, link) {
      this.state.notifs.unshift({ id: 'n' + Date.now(), type: type, icon: icon, title: title, desc: desc, time: 'هم‌اکنون', unread: true, link: link || null });
    },
    markRead: function (id) {
      this.state.notifs.forEach(function (n) { if (n.id === id) n.unread = false; });
      this.save();
    },
    markAllRead: function () {
      this.state.notifs.forEach(function (n) { n.unread = false; });
      this.save();
    },

    /* ---------- اطلاعیه‌ها ---------- */
    isDismissed: function (id) { return this.state.dismissed.indexOf(id) !== -1; },
    dismiss: function (id) { this.state.dismissed.push(id); this.save(); },

    /* ---------- پیش‌نویس فرم‌ها ---------- */
    saveDraft: function (svcId, data) {
      this.state.drafts[svcId] = { ts: Date.now(), values: data.values, files: data.files };
      this.save();
    },
    getDraft: function (svcId) { return this.state.drafts[svcId] || null; },
    clearDraft: function (svcId) { delete this.state.drafts[svcId]; this.save(); }
  };

  window.Store = Store;
})();
