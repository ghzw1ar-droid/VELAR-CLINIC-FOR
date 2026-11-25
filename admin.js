/**
 * ============================================================================
 * VELAR CLINIC — Receptionist Admin Dashboard Logic (admin.html)
 * ============================================================================
 * Synced in real time with index.html via localStorage + window 'storage' event.
 * Default Demo PIN: 1234 (configured in js/config.js)
 * ============================================================================
 */

(function (global) {
  'use strict';

  function initVelarAdmin(rootEl) {
    const doc = rootEl || document;
    const CONFIG = global.VELAR_CONFIG;
    const Engine = global.VelarEngine;
    const Store = Engine.VelarStore;

    Store.ensureDemoSeed();

    let currentFilter = 'today'; // 'today' | 'tomorrow' | 'all'
    let isUnlocked = false;

    const $ = (id) => doc.querySelector(`#${id}`);

    // Toast Notification
    function showToast(msg, isError) {
      const toast = $('admin-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all duration-300 ${
        isError ? 'bg-red-600 text-white' : 'bg-slate-900 text-emerald-300 border border-emerald-500/30'
      }`;
      toast.classList.remove('hidden');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3200);
    }

    // 1. PIN Lock Handling
    const pinOverlay = $('pin-lock-overlay');
    const pinInput = $('pin-input');
    const pinForm = $('pin-form');
    const pinError = $('pin-error');
    const adminContent = $('admin-main-content');

    function unlockDashboard() {
      isUnlocked = true;
      if (pinOverlay) pinOverlay.classList.add('hidden');
      if (adminContent) adminContent.classList.remove('hidden');
      renderAll();
    }

    if (pinForm) {
      pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = (pinInput ? pinInput.value : '').trim();
        if (entered === CONFIG.adminDemoPin) {
          if (pinError) pinError.classList.add('hidden');
          unlockDashboard();
        } else {
          if (pinError) pinError.classList.remove('hidden');
          if (pinInput) {
            pinInput.value = '';
            pinInput.focus();
          }
        }
      });
    }

    const lockBtn = $('btn-lock-admin');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        isUnlocked = false;
        if (pinOverlay) pinOverlay.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    // 2. Render Dashboard Stats
    function renderStats() {
      const today = Engine.getBaghdadNowParts().dateStr;
      const all = Store.getAppointments();
      const todayAll = all.filter((a) => a.date === today);
      const todayConfirmed = todayAll.filter((a) => a.status === 'confirmed' || a.status === 'arrived');
      const todaySlots = Engine.getSlotsForDate(today);
      const openSlotsCount = todaySlots.filter((s) => s.isAvailable).length;

      const elTotal = $('stat-today-total');
      const elConfirmed = $('stat-today-confirmed');
      const elOpen = $('stat-today-open');
      const elDateBadge = $('admin-today-date');

      if (elTotal) elTotal.textContent = String(todayAll.length);
      if (elConfirmed) elConfirmed.textContent = String(todayConfirmed.length);
      if (elOpen) elOpen.textContent = String(openSlotsCount);
      if (elDateBadge) elDateBadge.textContent = Engine.formatDateFriendly(today, 'ar');
    }

    // 3. Render Appointments Table / Cards
    function renderAppointments() {
      const listEl = $('admin-appointments-list');
      if (!listEl) return;

      const today = Engine.getBaghdadNowParts().dateStr;
      const tomorrow = Engine.addDaysToDateStr(today, 1).dateStr;
      let items = Store.getAppointments().slice();

      if (currentFilter === 'today') {
        items = items.filter((a) => a.date === today);
      } else if (currentFilter === 'tomorrow') {
        items = items.filter((a) => a.date === tomorrow);
      }

      // Sort by date ascending, then time ascending
      items.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      // Update filter button styles
      doc.querySelectorAll('[data-admin-filter]').forEach((btn) => {
        const active = btn.getAttribute('data-admin-filter') === currentFilter;
        btn.className = active
          ? 'px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-sm transition'
          : 'px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition';
      });

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <p class="text-slate-500 font-semibold text-base">لا توجد مواعيد مسجلة في هذا التصنيف حالياً</p>
            <p class="text-slate-400 text-xs mt-1">يمكنك إضافة حجز هاتفي أو حضوري من الزر بالأعلى</p>
          </div>
        `;
        return;
      }

      const statusBadge = (status) => {
        if (status === 'arrived') {
          return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">حضر</span>';
        }
        if (status === 'cancelled') {
          return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">ملغي</span>';
        }
        return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">مؤكد</span>';
      };

      listEl.innerHTML = items
        .map((appt) => {
          const waReminderUrl = Engine.buildPatientReminderWhatsAppUrl(appt);
          const timeDisplay = Engine.formatTimeDisplay(appt.time, 'ar');
          const dateDisplay = Engine.formatDateFriendly(appt.date, 'ar');
          const isCancelled = appt.status === 'cancelled';
          const isArrived = appt.status === 'arrived';

          return `
            <div class="bg-white rounded-2xl border ${isCancelled ? 'border-slate-200 opacity-70' : 'border-slate-200/90'} p-4 sm:p-5 shadow-sm hover:shadow-md transition">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400" dir="ltr">${appt.id}</span>
                    ${statusBadge(appt.status)}
                    <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">${timeDisplay}</span>
                    <span class="text-xs text-slate-500 font-medium">${dateDisplay}</span>
                  </div>
                  <h4 class="text-base font-extrabold text-slate-900">${escapeHtml(appt.patientName)}</h4>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span class="font-semibold text-emerald-700">${escapeHtml(appt.serviceNameAr)}</span>
                    <a href="tel:${escapeHtml(appt.phone)}" dir="ltr" class="font-mono text-slate-700 hover:text-emerald-600 underline decoration-dotted">${escapeHtml(appt.phone)}</a>
                  </div>
                  ${appt.notes ? `<p class="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 inline-block mt-1">ملاحظة: ${escapeHtml(appt.notes)}</p>` : ''}
                </div>

                <div class="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <a href="tel:${escapeHtml(appt.phone)}" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition">
                    <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                    <span>اتصال</span>
                  </a>
                  <a href="${waReminderUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition">
                    <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                    <span>تذكير واتساب</span>
                  </a>
                  ${
                    !isCancelled && !isArrived
                      ? `<button type="button" data-action="arrive" data-id="${appt.id}" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                          <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                          <span>تحديد كـ حضر</span>
                        </button>`
                      : ''
                  }
                  ${
                    !isCancelled
                      ? `<button type="button" data-action="cancel" data-id="${appt.id}" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 transition">
                          <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
                          <span>إلغاء الحجز</span>
                        </button>`
                      : ''
                  }
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      if (global.lucide) global.lucide.createIcons();
    }

    // Delegate appointment action buttons
    const listContainer = $('admin-appointments-list');
    if (listContainer) {
      listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'arrive') {
          Store.updateAppointmentStatus(id, 'arrived');
          showToast(`تم تحديث حالة الحجز ${id} إلى "حضر"`);
          renderAll();
        } else if (action === 'cancel') {
          Store.updateAppointmentStatus(id, 'cancelled');
          showToast(`تم إلغاء الحجز ${id} وإعادة فتح الوقت تلقائياً على الموقع`);
          renderAll();
        }
      });
    }

    // Filter tabs
    doc.querySelectorAll('[data-admin-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-admin-filter');
        renderAppointments();
      });
    });

    // 4. Manual Walk-in / Phone Booking Modal
    const walkinModal = $('walkin-modal');
    const walkinOpenBtn = $('btn-open-walkin');
    const walkinCloseBtns = doc.querySelectorAll('[data-close-walkin]');
    const walkinForm = $('walkin-form');
    const walkinService = $('walkin-service');
    const walkinDate = $('walkin-date');
    const walkinTime = $('walkin-time');

    function populateWalkinServices() {
      if (!walkinService) return;
      walkinService.innerHTML = CONFIG.services
        .map((s) => `<option value="${s.id}">${s.titleAr}</option>`)
        .join('');
    }

    function populateWalkinSlots() {
      if (!walkinDate || !walkinTime) return;
      const dateVal = walkinDate.value;
      const slots = Engine.getSlotsForDate(dateVal);
      const available = slots.filter((s) => !s.isBooked);
      if (Engine.isDateClosed(dateVal)) {
        walkinTime.innerHTML = '<option value="">العيادة مغلقة في هذا التاريخ</option>';
        return;
      }
      if (available.length === 0) {
        walkinTime.innerHTML = '<option value="">لا توجد أوقات متاحة</option>';
        return;
      }
      walkinTime.innerHTML = available
        .map((s) => `<option value="${s.time}">${Engine.formatTimeDisplay(s.time, 'ar')}</option>`)
        .join('');
    }

    if (walkinOpenBtn && walkinModal) {
      walkinOpenBtn.addEventListener('click', () => {
        populateWalkinServices();
        if (walkinDate) {
          const today = Engine.getBaghdadNowParts().dateStr;
          walkinDate.value = today;
          walkinDate.min = today;
        }
        populateWalkinSlots();
        walkinModal.classList.remove('hidden');
      });
    }

    walkinCloseBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (walkinModal) walkinModal.classList.add('hidden');
      });
    });

    if (walkinDate) {
      walkinDate.addEventListener('change', populateWalkinSlots);
    }

    if (walkinForm) {
      walkinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = ($('walkin-name') ? $('walkin-name').value : '').trim();
        const phone = Engine.normalizeIraqiPhone($('walkin-phone') ? $('walkin-phone').value : '');
        const serviceId = walkinService ? walkinService.value : '';
        const dateVal = walkinDate ? walkinDate.value : '';
        const timeVal = walkinTime ? walkinTime.value : '';
        const notes = ($('walkin-notes') ? $('walkin-notes').value : '').trim();

        if (name.length < 2) {
          showToast('يرجى إدخال اسم المراجع', true);
          return;
        }
        if (!Engine.isValidIraqiPhone(phone)) {
          showToast('يرجى إدخال رقم هاتف عراقي صحيح (07xxxxxxxxx)', true);
          return;
        }
        if (!dateVal || !timeVal) {
          showToast('يرجى اختيار تاريخ ووقت متاح', true);
          return;
        }

        const svc = CONFIG.services.find((s) => s.id === serviceId) || CONFIG.services[0];
        const res = Store.createAppointment({
          patientName: name,
          phone,
          serviceId: svc.id,
          serviceNameAr: svc.titleAr,
          serviceNameEn: svc.titleEn,
          date: dateVal,
          time: timeVal,
          notes,
          source: 'reception'
        });

        if (!res.ok) {
          showToast('هذا الوقت محجوز مسبقاً، يرجى اختيار وقت آخر', true);
          populateWalkinSlots();
          return;
        }

        walkinForm.reset();
        if (walkinModal) walkinModal.classList.add('hidden');
        showToast(`تم تسجيل الحجز ${res.appointment.id} وإغلاق الوقت على الموقع`);
        renderAll();
      });
    }

    // 5. Clinic Schedule & Emergency Closure Controls
    function renderSettingsForm() {
      const s = Store.getSettings();
      if ($('set-open-time')) $('set-open-time').value = s.openTime;
      if ($('set-close-time')) $('set-close-time').value = s.closeTime;
      if ($('set-slot-duration')) $('set-slot-duration').value = String(s.slotDuration);
      if ($('set-whatsapp')) $('set-whatsapp').value = s.whatsappNumber || CONFIG.contact.whatsappNumber;
      if ($('set-split-enabled')) $('set-split-enabled').checked = Boolean(s.splitShiftEnabled);
      if ($('set-shift2-open')) $('set-shift2-open').value = s.shift2OpenTime || '10:00';
      if ($('set-shift2-close')) $('set-shift2-close').value = s.shift2CloseTime || '13:00';

      const splitBox = $('split-shift-fields');
      if (splitBox) {
        splitBox.classList.toggle('hidden', !s.splitShiftEnabled);
      }

      doc.querySelectorAll('input[name="closed-day"]').forEach((cb) => {
        const dayNum = parseInt(cb.value, 10);
        cb.checked = Array.isArray(s.closedDays) && s.closedDays.includes(dayNum);
      });

      renderEmergencyDates(s.emergencyClosedDates || []);
    }

    function renderEmergencyDates(dates) {
      const box = $('emergency-dates-list');
      if (!box) return;
      if (!dates.length) {
        box.innerHTML = '<span class="text-xs text-slate-400">لا توجد تواريخ إغلاق طارئ حالياً</span>';
        return;
      }
      box.innerHTML = dates
        .sort()
        .map(
          (d) => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
            <span>${Engine.formatDateFriendly(d, 'ar')} (${d})</span>
            <button type="button" data-remove-emergency="${d}" class="hover:text-red-900 font-extrabold px-1">&times;</button>
          </span>
        `
        )
        .join('');
    }

    const splitToggle = $('set-split-enabled');
    if (splitToggle) {
      splitToggle.addEventListener('change', () => {
        const splitBox = $('split-shift-fields');
        if (splitBox) splitBox.classList.toggle('hidden', !splitToggle.checked);
      });
    }

    const settingsForm = $('admin-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = Store.getSettings();
        const closedDays = [];
        doc.querySelectorAll('input[name="closed-day"]:checked').forEach((cb) => {
          closedDays.push(parseInt(cb.value, 10));
        });

        const updated = Store.saveSettings({
          openTime: $('set-open-time').value || '15:00',
          closeTime: $('set-close-time').value || '21:00',
          slotDuration: parseInt($('set-slot-duration').value, 10) || 30,
          whatsappNumber: ($('set-whatsapp').value || CONFIG.contact.whatsappNumber).replace(/[^\d]/g, ''),
          splitShiftEnabled: Boolean($('set-split-enabled') && $('set-split-enabled').checked),
          shift2OpenTime: ($('set-shift2-open') && $('set-shift2-open').value) || '10:00',
          shift2CloseTime: ($('set-shift2-close') && $('set-shift2-close').value) || '13:00',
          closedDays,
          emergencyClosedDates: current.emergencyClosedDates || []
        });

        showToast('تم حفظ إعدادات الدوام وتحديث الموقع الرئيسي فوراً');
        renderStats();
        renderEmergencyDates(updated.emergencyClosedDates);
        if (typeof global.velarOnExternalSync === 'function') global.velarOnExternalSync();
      });
    }

    const addEmergencyBtn = $('btn-add-emergency-date');
    const emergencyInput = $('emergency-date-input');
    if (addEmergencyBtn && emergencyInput) {
      emergencyInput.min = Engine.getBaghdadNowParts().dateStr;
      addEmergencyBtn.addEventListener('click', () => {
        const val = emergencyInput.value;
        if (!val) {
          showToast('يرجى اختيار تاريخ الإغلاق الطارئ أولاً', true);
          return;
        }
        const s = Store.getSettings();
        const dates = Array.isArray(s.emergencyClosedDates) ? s.emergencyClosedDates.slice() : [];
        if (!dates.includes(val)) {
          dates.push(val);
          Store.saveSettings(Object.assign({}, s, { emergencyClosedDates: dates }));
          emergencyInput.value = '';
          renderEmergencyDates(dates);
          renderStats();
          showToast(`تم إغلاق الحجز ليوم ${val} بنجاح`);
          if (typeof global.velarOnExternalSync === 'function') global.velarOnExternalSync();
        }
      });
    }

    const emergencyListEl = $('emergency-dates-list');
    if (emergencyListEl) {
      emergencyListEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-remove-emergency]');
        if (!btn) return;
        const target = btn.getAttribute('data-remove-emergency');
        const s = Store.getSettings();
        const dates = (s.emergencyClosedDates || []).filter((d) => d !== target);
        Store.saveSettings(Object.assign({}, s, { emergencyClosedDates: dates }));
        renderEmergencyDates(dates);
        renderStats();
        showToast(`تم إعادة فتح الحجز ليوم ${target}`);
        if (typeof global.velarOnExternalSync === 'function') global.velarOnExternalSync();
      });
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function renderAll() {
      renderStats();
      renderAppointments();
      renderSettingsForm();
    }

    // Listen for live cross-tab localStorage updates from index.html
    global.addEventListener('storage', () => {
      if (isUnlocked) renderAll();
    });

    // Expose refresh hook for single-file preview mode
    return {
      refresh: () => {
        if (isUnlocked) renderAll();
      }
    };
  }

  global.initVelarAdmin = initVelarAdmin;

  // Auto-init on standalone admin.html
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('velar-admin-page')) {
        initVelarAdmin(document);
      }
    });
  } else if (document.getElementById('velar-admin-page')) {
    initVelarAdmin(document);
  }
})(window);
