/**
 * ============================================================================
 * VELAR CLINIC — Smart Booking Engine & Baghdad Timezone Utilities
 * ============================================================================
 * Architecture:
 * - Uses `Asia/Baghdad` (UTC+3) for live Open/Closed status & past-slot checks.
 * - Persists appointments & settings in `localStorage` for instant zero-backend
 *   GitHub Pages operation, structured behind a clean `VelarStore` adapter so
 *   swapping to Supabase requires changing only the store methods.
 * ============================================================================
 */

(function (global) {
  'use strict';

  const CONFIG = global.VELAR_CONFIG;

  /**
   * --------------------------------------------------------------------------
   * 1. BAGHDAD TIMEZONE (Asia/Baghdad, UTC+3) HELPERS
   * --------------------------------------------------------------------------
   */
  function getBaghdadNowParts() {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: CONFIG.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = {};
      formatter.formatToParts(now).forEach((p) => {
        if (p.type !== 'literal') parts[p.type] = p.value;
      });
      const year = parseInt(parts.year, 10);
      const month = parseInt(parts.month, 10);
      const day = parseInt(parts.day, 10);
      let hour = parseInt(parts.hour, 10);
      if (hour === 24) hour = 0;
      const minute = parseInt(parts.minute, 10);
      const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      return { year, month, day, hour, minute, dateStr, dayOfWeek, totalMinutes: hour * 60 + minute };
    } catch (e) {
      // Fallback UTC+3 calculation
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const baghdad = new Date(utcMs + 3 * 3600000);
      const year = baghdad.getFullYear();
      const month = baghdad.getMonth() + 1;
      const day = baghdad.getDate();
      const hour = baghdad.getHours();
      const minute = baghdad.getMinutes();
      const pad = (n) => String(n).padStart(2, '0');
      return {
        year,
        month,
        day,
        hour,
        minute,
        dateStr: `${year}-${pad(month)}-${pad(day)}`,
        dayOfWeek: baghdad.getDay(),
        totalMinutes: hour * 60 + minute
      };
    }
  }

  function addDaysToDateStr(dateStr, offsetDays) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
    const pad = (n) => String(n).padStart(2, '0');
    return {
      dateStr: `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`,
      year: dt.getUTCFullYear(),
      month: dt.getUTCMonth() + 1,
      day: dt.getUTCDate(),
      dayOfWeek: dt.getUTCDay()
    };
  }

  function timeToMinutes(hhmm) {
    if (!hhmm || !hhmm.includes(':')) return 0;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToHHMM(totalMin) {
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function formatTimeDisplay(hhmm, lang) {
    const [hStr, mStr] = hhmm.split(':');
    const h24 = parseInt(hStr, 10);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    if (lang === 'en') {
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      return `${h12}:${mStr} ${ampm}`;
    }
    // Natural Iraqi Arabic period labels
    let suffix = 'ص';
    if (h24 >= 12 && h24 < 17) suffix = 'ع';
    else if (h24 >= 17) suffix = 'م';
    return `${h12}:${mStr} ${suffix}`;
  }

  const DAY_NAMES = {
    ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortEn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  const MONTH_NAMES = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  function formatDateFriendly(dateStr, lang) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (lang === 'en') {
      return `${DAY_NAMES.shortEn[dow]}, ${d} ${MONTH_NAMES.en[m - 1]} ${y}`;
    }
    return `${DAY_NAMES.ar[dow]}، ${d} ${MONTH_NAMES.ar[m - 1]} ${y}`;
  }

  /**
   * --------------------------------------------------------------------------
   * 2. STORAGE ADAPTER (localStorage — Ready to Swap to Supabase)
   * --------------------------------------------------------------------------
   */
  const VelarStore = {
    _safeGet(key) {
      try {
        return global.localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    _safeSet(key, value) {
      try {
        global.localStorage.setItem(key, value);
      } catch (e) {
        // Ignore storage quota / sandbox restrictions gracefully
      }
    },

    getSettings() {
      const raw = this._safeGet(CONFIG.storageKeys.settings);
      if (!raw) return Object.assign({}, CONFIG.defaultSettings);
      try {
        const parsed = JSON.parse(raw);
        return Object.assign({}, CONFIG.defaultSettings, parsed);
      } catch (e) {
        return Object.assign({}, CONFIG.defaultSettings);
      }
    },

    saveSettings(newSettings) {
      const merged = Object.assign({}, CONFIG.defaultSettings, newSettings);
      this._safeSet(CONFIG.storageKeys.settings, JSON.stringify(merged));
      return merged;
    },

    getAppointments() {
      const raw = this._safeGet(CONFIG.storageKeys.appointments);
      if (!raw) return [];
      try {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },

    saveAppointments(list) {
      this._safeSet(CONFIG.storageKeys.appointments, JSON.stringify(list));
    },

    nextBookingId() {
      const raw = this._safeGet(CONFIG.storageKeys.counter);
      const current = raw ? parseInt(raw, 10) : 103;
      const next = isNaN(current) ? 104 : current + 1;
      this._safeSet(CONFIG.storageKeys.counter, String(next));
      return `#VL-${next}`;
    },

    /**
     * Pre-seeds 3 realistic demo appointments for today (or next open day)
     * so the clinic owner immediately sees Booked vs Available slots.
     */
    ensureDemoSeed() {
      const today = getBaghdadNowParts().dateStr;
      const seeded = this._safeGet(CONFIG.storageKeys.seededDate);
      const existing = this.getAppointments();
      if (seeded === today && existing.length > 0) return;

      const settings = this.getSettings();
      let targetDate = today;
      // If today is a closed day, seed on the next open day
      for (let i = 0; i < 7; i++) {
        const candidate = addDaysToDateStr(today, i);
        if (!isDateClosed(candidate.dateStr, settings)) {
          targetDate = candidate.dateStr;
          break;
        }
      }

      const slots = generateRawSlots(settings);
      if (slots.length < 3) return;

      const pickIndices = [1, 3, Math.min(5, slots.length - 1)];
      const demoEntries = [
        {
          id: '#VL-101',
          patientName: 'مصطفى كريم الجبوري',
          phone: '07714528910',
          serviceId: 'whitening',
          serviceNameAr: 'تنظيف وتبييض الأسنان بالليزر',
          serviceNameEn: 'Laser Teeth Whitening & Cleaning',
          date: targetDate,
          time: slots[pickIndices[0]],
          notes: 'جلسة تبييض قبل مناسبة',
          status: 'confirmed',
          source: 'web',
          createdAt: new Date().toISOString()
        },
        {
          id: '#VL-102',
          patientName: 'سارة علي العبيدي',
          phone: '07803219455',
          serviceId: 'veneers',
          serviceNameAr: 'ابتسامة هوليوود والفينير',
          serviceNameEn: 'Hollywood Smile & Veneers',
          date: targetDate,
          time: slots[pickIndices[1]],
          notes: 'استشارة عدسات إيماكس',
          status: 'confirmed',
          source: 'web',
          createdAt: new Date().toISOString()
        },
        {
          id: '#VL-103',
          patientName: 'حيدر محمد الشمري',
          phone: '07728841023',
          serviceId: 'fillings',
          serviceNameAr: 'الحشوات التجميلية وعلاج العصب',
          serviceNameEn: 'Cosmetic Fillings & Root Canal',
          date: targetDate,
          time: slots[pickIndices[2]],
          notes: 'ألم خفيف بالضرس السفلي',
          status: 'confirmed',
          source: 'phone',
          createdAt: new Date().toISOString()
        }
      ];

      // Merge without duplicating IDs or existing booked slots
      const merged = existing.slice();
      demoEntries.forEach((demo) => {
        const exists = merged.some(
          (a) => a.id === demo.id || (a.date === demo.date && a.time === demo.time && a.status !== 'cancelled')
        );
        if (!exists) merged.push(demo);
      });

      this.saveAppointments(merged);
      if (!this._safeGet(CONFIG.storageKeys.counter)) {
        this._safeSet(CONFIG.storageKeys.counter, '103');
      }
      this._safeSet(CONFIG.storageKeys.seededDate, today);
    },

    createAppointment(payload) {
      const appointments = this.getAppointments();
      const conflict = appointments.some(
        (a) => a.date === payload.date && a.time === payload.time && a.status !== 'cancelled'
      );
      if (conflict) {
        return { ok: false, error: 'SLOT_TAKEN' };
      }

      const id = this.nextBookingId();
      const record = {
        id,
        patientName: payload.patientName.trim(),
        phone: payload.phone.trim(),
        serviceId: payload.serviceId,
        serviceNameAr: payload.serviceNameAr,
        serviceNameEn: payload.serviceNameEn,
        date: payload.date,
        time: payload.time,
        notes: (payload.notes || '').trim(),
        status: 'confirmed',
        source: payload.source || 'web',
        createdAt: new Date().toISOString()
      };
      appointments.push(record);
      this.saveAppointments(appointments);
      return { ok: true, appointment: record };
    },

    updateAppointmentStatus(id, newStatus) {
      const appointments = this.getAppointments();
      const idx = appointments.findIndex((a) => a.id === id);
      if (idx === -1) return false;
      appointments[idx].status = newStatus;
      this.saveAppointments(appointments);
      return true;
    }
  };

  /**
   * --------------------------------------------------------------------------
   * 3. SLOT GENERATOR & LIVE CLINIC STATUS (Asia/Baghdad)
   * --------------------------------------------------------------------------
   */
  function isDateClosed(dateStr, settings) {
    const s = settings || VelarStore.getSettings();
    if (Array.isArray(s.emergencyClosedDates) && s.emergencyClosedDates.includes(dateStr)) {
      return true;
    }
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return Array.isArray(s.closedDays) && s.closedDays.includes(dow);
  }

  function generateRawSlots(settings) {
    const s = settings || VelarStore.getSettings();
    const step = parseInt(s.slotDuration, 10) || 30;
    const windows = [];

    if (s.splitShiftEnabled && s.shift2OpenTime && s.shift2CloseTime) {
      windows.push([timeToMinutes(s.shift2OpenTime), timeToMinutes(s.shift2CloseTime)]);
    }
    windows.push([timeToMinutes(s.openTime), timeToMinutes(s.closeTime)]);

    // Sort windows chronologically
    windows.sort((a, b) => a[0] - b[0]);

    const seen = new Set();
    const slots = [];
    windows.forEach(([startMin, endMin]) => {
      if (endMin <= startMin) return;
      for (let t = startMin; t + step <= endMin; t += step) {
        const hhmm = minutesToHHMM(t);
        if (!seen.has(hhmm)) {
          seen.add(hhmm);
          slots.push(hhmm);
        }
      }
    });
    return slots;
  }

  function getSlotsForDate(dateStr, settings) {
    const s = settings || VelarStore.getSettings();
    if (isDateClosed(dateStr, s)) return [];

    const nowBg = getBaghdadNowParts();
    const isToday = dateStr === nowBg.dateStr;
    const bookedTimes = new Set(
      VelarStore.getAppointments()
        .filter((a) => a.date === dateStr && a.status !== 'cancelled')
        .map((a) => a.time)
    );

    return generateRawSlots(s).map((hhmm) => {
      const slotMin = timeToMinutes(hhmm);
      const isPast = isToday && slotMin <= nowBg.totalMinutes;
      const isBooked = bookedTimes.has(hhmm);
      return {
        time: hhmm,
        isBooked,
        isPast,
        isAvailable: !isBooked && !isPast
      };
    });
  }

  function getLiveClinicStatus(lang) {
    const settings = VelarStore.getSettings();
    const nowBg = getBaghdadNowParts();
    const todayClosed = isDateClosed(nowBg.dateStr, settings);

    const windows = [];
    if (settings.splitShiftEnabled && settings.shift2OpenTime && settings.shift2CloseTime) {
      windows.push({
        start: timeToMinutes(settings.shift2OpenTime),
        end: timeToMinutes(settings.shift2CloseTime),
        openStr: settings.shift2OpenTime,
        closeStr: settings.shift2CloseTime
      });
    }
    windows.push({
      start: timeToMinutes(settings.openTime),
      end: timeToMinutes(settings.closeTime),
      openStr: settings.openTime,
      closeStr: settings.closeTime
    });
    windows.sort((a, b) => a.start - b.start);

    if (!todayClosed) {
      // Currently inside an open shift?
      const activeWin = windows.find((w) => nowBg.totalMinutes >= w.start && nowBg.totalMinutes < w.end);
      if (activeWin) {
        const closeDisp = formatTimeDisplay(activeWin.closeStr, lang);
        return {
          isOpen: true,
          text: lang === 'en' ? `Open Now • Closes ${closeDisp}` : `مفتوح الآن • يغلق ${closeDisp}`
        };
      }
      // Opens later today?
      const nextToday = windows.find((w) => nowBg.totalMinutes < w.start);
      if (nextToday) {
        const openDisp = formatTimeDisplay(nextToday.openStr, lang);
        return {
          isOpen: false,
          text: lang === 'en' ? `Closed • Opens ${openDisp}` : `مغلق حالياً • يفتح ${openDisp}`
        };
      }
    }

    // Find next open day within 7 days
    let nextOpenDay = null;
    for (let i = 1; i <= 7; i++) {
      const cand = addDaysToDateStr(nowBg.dateStr, i);
      if (!isDateClosed(cand.dateStr, settings)) {
        nextOpenDay = cand;
        break;
      }
    }

    const firstOpenDisp = formatTimeDisplay(windows[0].openStr, lang);
    if (nextOpenDay) {
      const dayLabel = lang === 'en' ? DAY_NAMES.shortEn[nextOpenDay.dayOfWeek] : DAY_NAMES.ar[nextOpenDay.dayOfWeek];
      return {
        isOpen: false,
        text:
          lang === 'en'
            ? `Closed • Opens ${dayLabel} ${firstOpenDisp}`
            : `مغلق حالياً • يفتح ${dayLabel} ${firstOpenDisp}`
      };
    }

    return {
      isOpen: false,
      text: lang === 'en' ? 'Currently Closed' : 'مغلق حالياً'
    };
  }

  /**
   * --------------------------------------------------------------------------
   * 4. VALIDATION & WHATSAPP URL BUILDERS
   * --------------------------------------------------------------------------
   */
  function normalizeIraqiPhone(input) {
    // Convert Arabic/Persian digits to ASCII digits and strip spaces/dashes
    const map = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
    return String(input || '')
      .replace(/[٠-٩]/g, (d) => map[d])
      .replace(/[\s\-()]/g, '');
  }

  function isValidIraqiPhone(input) {
    const cleaned = normalizeIraqiPhone(input);
    return /^07[3-9]\d{8}$/.test(cleaned) || /^07\d{9}$/.test(cleaned);
  }

  function toWhatsAppInternational(iraqiPhone) {
    const cleaned = normalizeIraqiPhone(iraqiPhone);
    if (cleaned.startsWith('07') && cleaned.length === 11) {
      return '964' + cleaned.slice(1);
    }
    if (cleaned.startsWith('+964')) return cleaned.slice(1);
    if (cleaned.startsWith('964')) return cleaned;
    return cleaned;
  }

  function buildBookingWhatsAppUrl(appointment) {
    const settings = VelarStore.getSettings();
    const clinicWa = (settings.whatsappNumber || CONFIG.contact.whatsappNumber).replace(/[^\d]/g, '');
    const timeAr = formatTimeDisplay(appointment.time, 'ar');
    const dateAr = formatDateFriendly(appointment.date, 'ar');
    const notesText = appointment.notes && appointment.notes.trim() ? appointment.notes.trim() : 'لا يوجد';

    const message = [
      'مرحباً عيادة ڤيلار التخصصية، أود تأكيد حجزي:',
      `- رقم الحجز: ${appointment.id}`,
      `- الاسم: ${appointment.patientName}`,
      `- رقم الهاتف: ${appointment.phone}`,
      `- الخدمة: ${appointment.serviceNameAr}`,
      `- التاريخ: ${dateAr} (${appointment.date})`,
      `- وقت الدخول: ${timeAr}`,
      `- ملاحظات: ${notesText}`
    ].join('\n');

    return `https://wa.me/${clinicWa}?text=${encodeURIComponent(message)}`;
  }

  function buildPatientReminderWhatsAppUrl(appointment) {
    const patientWa = toWhatsAppInternational(appointment.phone);
    const timeAr = formatTimeDisplay(appointment.time, 'ar');
    const message = `مرحباً ${appointment.patientName}، نذكركم بموعدكم اليوم في عيادة ڤيلار التخصصية لطب الأسنان الساعة ${timeAr} (${appointment.serviceNameAr} - رقم الحجز ${appointment.id}). نتمنى لكم دوام الصحة والعافية.`;
    return `https://wa.me/${patientWa}?text=${encodeURIComponent(message)}`;
  }

  global.VelarEngine = {
    getBaghdadNowParts,
    addDaysToDateStr,
    timeToMinutes,
    minutesToHHMM,
    formatTimeDisplay,
    formatDateFriendly,
    DAY_NAMES,
    MONTH_NAMES,
    VelarStore,
    isDateClosed,
    generateRawSlots,
    getSlotsForDate,
    getLiveClinicStatus,
    normalizeIraqiPhone,
    isValidIraqiPhone,
    toWhatsAppInternational,
    buildBookingWhatsAppUrl,
    buildPatientReminderWhatsAppUrl
  };
})(window);
