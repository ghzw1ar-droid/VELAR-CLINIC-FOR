/**
 * ============================================================================
 * VELAR CLINIC FOR DENTAL CARE — Centralized Configuration & Assets
 * عيادة ڤيلار التخصصية لطب الأسنان
 * ============================================================================
 * Edit this file to customize clinic contact details, default hours,
 * services, bilingual translations, and photography URLs.
 *
 * Deployment: Zero-build-step, ready for GitHub Pages.
 * ============================================================================
 */

(function (global) {
  'use strict';

  /**
   * --------------------------------------------------------------------------
   * 1. CENTRALIZED IMAGES CONFIGURATION
   * --------------------------------------------------------------------------
   * - `clinic`: Real local clinic photos stored in `./images/`.
   * - `stock`: High-resolution demo dental stock photos (Unsplash HD).
   *   >>> SWAP GUIDE: Replace any `stock` URL with `'./images/your-photo.jpg'`
   *   when you have your own treatment photos ready.
   * - `localFallbacks`: Automatic graceful fallback if a local `./images/`
   *   file hasn't been uploaded yet during demo previews.
   */
  const IMAGES = {
    // REAL LOCAL CLINIC PHOTOS (saved in ./images/)
    clinic: {
      exterior: './images/clinic-exterior.jpg',   // Hero background & Clinic Tour
      reception: './images/clinic-reception.jpg', // Why Choose Velar & Clinic Tour
      waiting: './images/clinic-waiting.jpg',     // Waiting Lounge & Clinic Tour
      room: './images/clinic-room.jpg'            // Equipment & Treatment Room Tour
    },

    // FALLBACKS FOR LOCAL PHOTOS (only used via onerror if ./images/*.jpg is missing)
    localFallbacks: {
      exterior: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=85&auto=format&fit=crop',
      reception: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=85&auto=format&fit=crop',
      waiting: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=85&auto=format&fit=crop',
      room: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=85&auto=format&fit=crop'
    },

    // HIGH-RESOLUTION DEMO STOCK PHOTOS (Unsplash HD Dental Photography)
    // Swap any URL below to './images/...' whenever you add real case photos.
    stock: {
      // [DEMO STOCK] Cosmetic Composite Fillings & Root Canal
      fillings: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Laser Teeth Whitening & Cleaning
      whitening: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Hollywood Smile & Porcelain Veneers
      veneers: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Orthodontics & Clear Aligners
      orthodontics: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Dental Implants
      implants: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Dental Checkup & Digital X-Ray
      checkup: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1200&q=85&auto=format&fit=crop',
      // [DEMO STOCK] Interactive Before & After Smile Transformation
      beforeSmile: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=85&auto=format&fit=crop',
      afterSmile: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=85&auto=format&fit=crop'
    }
  };

  /**
   * Generates a clean luxury SVG data-URI fallback if both local & stock images fail (e.g., offline).
   */
  function createSvgFallback(title) {
    const safeTitle = String(title || 'Velar Clinic').replace(/[<>&"']/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="55%" stop-color="#064E3B"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill="url(#g)"/>
      <circle cx="680" cy="90" r="140" fill="#10B981" fill-opacity="0.12"/>
      <circle cx="120" cy="430" r="160" fill="#34D399" fill-opacity="0.08"/>
      <g transform="translate(362,175)" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 14 C6 14 2 28 5 46 C8 64 14 86 22 86 C28 86 30 68 38 68 C46 68 48 86 54 86 C62 86 68 64 71 46 C74 28 70 14 58 14 C48 14 44 22 38 22 C32 22 28 14 18 14 Z" fill="#FFFFFF" fill-opacity="0.14"/>
        <path d="M10 22 Q24 58 38 66" stroke="#34D399" stroke-width="5"/>
      </g>
      <text x="400" y="320" text-anchor="middle" fill="#ECFDF5" font-family="sans-serif" font-size="24" font-weight="700">${safeTitle}</text>
      <text x="400" y="352" text-anchor="middle" fill="#A7F3D0" font-family="sans-serif" font-size="14" letter-spacing="2">VELAR CLINIC FOR DENTAL CARE</text>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  /**
   * Reusable onerror handler attached to <img> tags.
   * First tries data-fallback-src (for local -> stock), then falls back to luxury SVG.
   */
  function handleImageError(imgEl, label) {
    if (!imgEl) return;
    const step = imgEl.getAttribute('data-fb-step') || '0';
    const fallbackUrl = imgEl.getAttribute('data-fallback-src');
    if (step === '0' && fallbackUrl && imgEl.src !== fallbackUrl) {
      imgEl.setAttribute('data-fb-step', '1');
      imgEl.src = fallbackUrl;
      return;
    }
    if (step !== '2') {
      imgEl.setAttribute('data-fb-step', '2');
      imgEl.onerror = null;
      imgEl.src = createSvgFallback(label || imgEl.alt || 'Velar Clinic');
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 2. CLINIC BRANDING, CONTACT & DEFAULT SCHEDULE
   * --------------------------------------------------------------------------
   */
  const CLINIC_CONFIG = {
    brand: {
      nameAr: 'عيادة ڤيلار التخصصية لطب الأسنان',
      nameEn: 'VELAR CLINIC FOR DENTAL CARE',
      shortAr: 'عيادة ڤيلار',
      shortEn: 'VELAR CLINIC',
      taglineAr: 'رعاية تخصصية لطب وتجميل الأسنان',
      taglineEn: 'Specialized Cosmetic & Medical Dental Care'
    },
    contact: {
      phoneDisplay: '+964 772 295 9698',
      phoneTel: '+9647722959698',
      whatsappNumber: '9647722959698', // No "+" or spaces for wa.me API
      addressAr: 'العراق — موقع العيادة الرئيسي (يرجى تحديث العنوان الدقيق من config.js)',
      addressEn: 'Iraq — Main Clinic Location (Update exact street address in config.js)',
      googleMapsUrl: 'https://maps.google.com/?q=Velar+Clinic+for+Dental+Care+Iraq'
    },
    timezone: 'Asia/Baghdad', // UTC+3 (Iraq Standard Time)
    adminDemoPin: '1234',

    // Default Operating Settings (overridden by receptionist changes in localStorage)
    defaultSettings: {
      openTime: '15:00',       // 3:00 PM
      closeTime: '21:00',      // 9:00 PM
      splitShiftEnabled: false,
      shift2OpenTime: '10:00', // Optional morning shift start
      shift2CloseTime: '13:00',// Optional morning shift end
      slotDuration: 30,        // Minutes: 20 | 30 | 45
      closedDays: [5],         // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      emergencyClosedDates: [],// Array of 'YYYY-MM-DD' strings
      whatsappNumber: '9647722959698'
    },

    storageKeys: {
      settings: 'velar_clinic_settings_v1',
      appointments: 'velar_clinic_appointments_v1',
      counter: 'velar_clinic_booking_seq_v1',
      seededDate: 'velar_clinic_seeded_date_v1',
      lang: 'velar_clinic_lang_v1'
    },

    // 6 Core Dental Services
    services: [
      {
        id: 'fillings',
        icon: 'shield-check',
        image: IMAGES.stock.fillings,
        titleAr: 'الحشوات التجميلية وعلاج العصب',
        titleEn: 'Cosmetic Fillings & Root Canal',
        descAr: 'حشوات ضوئية مطابقة تماماً للون السن وعلاج عصب دقيق بجهاز الروتاري الحديث بدون ألم.',
        descEn: 'Tooth-colored composite fillings and painless precision root canal therapy using rotary endodontics.',
        durationMin: 45,
        durationAr: '45 دقيقة',
        durationEn: '45 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      },
      {
        id: 'whitening',
        icon: 'sparkles',
        image: IMAGES.stock.whitening,
        titleAr: 'تنظيف وتبييض الأسنان بالليزر',
        titleEn: 'Laser Teeth Whitening & Cleaning',
        descAr: 'إزالة التكلسات والتصبغات بلطف مع تبييض فوري آمن يمنحك إشراقة ناصعة في جلسة واحدة.',
        descEn: 'Gentle ultrasonic scaling and safe in-office laser whitening for visibly brighter teeth in one visit.',
        durationMin: 30,
        durationAr: '30 دقيقة',
        durationEn: '30 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      },
      {
        id: 'veneers',
        icon: 'gem',
        image: IMAGES.stock.veneers,
        titleAr: 'ابتسامة هوليوود والفينير',
        titleEn: 'Hollywood Smile & Veneers',
        descAr: 'عدسات إيماكس والزيركون المصممة رقمياً لتتناغم مع ملامح وجهك وتمنحك ابتسامة طبيعية فاخرة.',
        descEn: 'Digitally designed E-max and Zirconia veneers tailored to your facial harmony for a natural luxury smile.',
        durationMin: 60,
        durationAr: '60 دقيقة',
        durationEn: '60 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      },
      {
        id: 'orthodontics',
        icon: 'smile',
        image: IMAGES.stock.orthodontics,
        titleAr: 'تقويم الأسنان والتقويم الشفاف',
        titleEn: 'Orthodontics & Clear Aligners',
        descAr: 'تصحيح اصطفاف الأسنان والفكين باستخدام التقويم المعدني والشفاف بإشراف تخصصي ومتابعة دورية.',
        descEn: 'Precision alignment using modern metal brackets or invisible clear aligners with structured follow-ups.',
        durationMin: 45,
        durationAr: '45 دقيقة',
        durationEn: '45 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      },
      {
        id: 'implants',
        icon: 'heart-pulse',
        image: IMAGES.stock.implants,
        titleAr: 'زراعة الأسنان التخصصية',
        titleEn: 'Specialized Dental Implants',
        descAr: 'تعويض الأسنان المفقودة بزراعات عالمية معتمدة عالية الثبات لاستعادة الوظيفة والمظهر الطبيعي.',
        descEn: 'Certified international titanium implants restoring full chewing strength and natural aesthetics.',
        durationMin: 60,
        durationAr: '60 دقيقة',
        durationEn: '60 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      },
      {
        id: 'checkup',
        icon: 'scan-line',
        image: IMAGES.stock.checkup,
        titleAr: 'الكشف والاستشارة والأشعة الرقمية',
        titleEn: 'Dental Checkup & Digital X-Ray',
        descAr: 'فحص شامل للأسنان واللثة مع تصوير أشعة رقمية عالية الدقة وخطة علاج واضحة ومفصلة.',
        descEn: 'Comprehensive oral exam with low-radiation digital radiography and a transparent treatment plan.',
        durationMin: 30,
        durationAr: '30 دقيقة',
        durationEn: '30 mins',
        priceAr: 'يُحدد بعد الكشف',
        priceEn: 'Determined after exam'
      }
    ],

    // 4 Real Clinic Gallery Items
    gallery: [
      {
        id: 'exterior',
        src: IMAGES.clinic.exterior,
        fallback: IMAGES.localFallbacks.exterior,
        badgeAr: 'واجهة العيادة',
        badgeEn: 'Clinic Facade',
        captionAr: 'واجهة عيادة ڤيلار التخصصية بتصميم عصري وموقع يسهل الوصول إليه',
        captionEn: 'Modern architectural facade of Velar Clinic with easy access'
      },
      {
        id: 'reception',
        src: IMAGES.clinic.reception,
        fallback: IMAGES.localFallbacks.reception,
        badgeAr: 'صالة الاستقبال',
        badgeEn: 'Reception Desk',
        captionAr: 'استقبال راقٍ وفريق إداري يضمن دخولك في موعدك المحدد بدون انتظار',
        captionEn: 'Refined reception desk ensuring punctual, zero-wait appointments'
      },
      {
        id: 'waiting',
        src: IMAGES.clinic.waiting,
        fallback: IMAGES.localFallbacks.waiting,
        badgeAr: 'قاعة الانتظار المريحة',
        badgeEn: 'Patient Comfort Lounge',
        captionAr: 'أجواء هادئة ومريحة صُممت خصيصاً لراحة المراجع قبل الجلسة',
        captionEn: 'Calm, hotel-inspired lounge designed for complete patient comfort'
      },
      {
        id: 'room',
        src: IMAGES.clinic.room,
        fallback: IMAGES.localFallbacks.room,
        badgeAr: 'غرفة العلاج الحديثة',
        badgeEn: 'Modern Treatment Suite',
        captionAr: 'كرسي أسنان متطور مع أعلى معايير التعقيم الطبي وأحدث الأجهزة الرقمية',
        captionEn: 'Advanced dental unit equipped with hospital-grade sterilization'
      }
    ]
  };

  /**
   * --------------------------------------------------------------------------
   * 3. BILINGUAL I18N DICTIONARY (ARABIC RTL + ENGLISH LTR)
   * --------------------------------------------------------------------------
   */
  const TRANSLATIONS = {
    ar: {
      navHome: 'الرئيسية',
      navServices: 'الخدمات',
      navGallery: 'جولة بالعيادة',
      navBeforeAfter: 'قبل وبعد',
      navBooking: 'احجز موعدك',
      navLocation: 'الموقع',
      callNow: 'اتصل الآن',
      heroBadge: 'عيادة ڤيلار التخصصية لطب الأسنان',
      heroTitle: 'ابتسامتك تستحق رعاية تخصصية بمعايير عالمية',
      heroSubtitle: 'عناية طبية وتجميلية حديثة بدون ألم، تعقيم بدرجة مستشفيات، ونظام حجز إلكتروني فوري يضمن دخولك بوقتك المحدد خلال 30 ثانية.',
      heroPrimaryCta: 'احجز موعدك في 30 ثانية',
      heroSecondaryCta: 'جولة داخل العيادة',
      trust1Title: 'تعقيم بدرجة طبية 100%',
      trust1Sub: 'أجهزة أوتوكلاف عالمية لكل مراجع',
      trust2Title: 'أحدث أجهزة طب الأسنان',
      trust2Sub: 'تشخيص رقمي وعلاج دقيق بدون ألم',
      trust3Title: 'حجز إلكتروني بدون انتظار',
      trust3Sub: 'اختر وقتك المناسب وأكّده فوراً عبر واتساب',
      servicesEyebrow: 'تخصصاتنا الطبية',
      servicesTitle: 'خدمات طب وتجميل الأسنان المتكاملة',
      servicesSubtitle: 'نجمع بين الخبرة التخصصية والتقنيات الحديثة لنمنحك نتائج تدوم وابتسامة صحية واثقة.',
      bookThisService: 'احجز هذه الخدمة',
      galleryEyebrow: 'بيئة طبية فاخرة',
      galleryTitle: 'جولة داخل عيادة ڤيلار',
      gallerySubtitle: 'صور حقيقية لعيادتنا صُممت بعناية لتجمع بين الفخامة والراحة والنظافة الطبية الفائقة.',
      clickToZoom: 'اضغط للتكبير',
      whyEyebrow: 'لماذا عيادة ڤيلار؟',
      whyTitle: 'معايير طبية دقيقة وتجربة مريحة منذ لحظة وصولك',
      whyPoint1: 'فريق متخصص يستمع لاحتياجك ويضع خطة علاجية واضحة قبل البدء.',
      whyPoint2: 'أدوات معقمة ومغلفة فردياً لكل مريض وفق بروتوكولات التعقيم العالمية.',
      whyPoint3: 'نظام مواعيد ذكي يحترم وقتك ويغنيك عن الانتظار الطويل في العيادة.',
      beforeAfterEyebrow: 'نتائج حقيقية ملموسة',
      beforeAfterTitle: 'قبل وبعد تجميل وتبييض الأسنان',
      beforeAfterSubtitle: 'اسحب المؤشر يميناً ويساراً لمقارنة الفرق في إشراقة وتناسق الابتسامة.',
      beforeLabel: 'قبل العلاج',
      afterLabel: 'بعد العلاج',
      dragToCompare: 'اسحب للمقارنة',
      bookingEyebrow: 'حجز فوري مباشر',
      bookingTitle: 'احجز موعدك في 30 ثانية',
      bookingSubtitle: 'اختر الخدمة واليوم والوقت المتاح، وسيتم تثبيت موعدك وتأكيده فوراً عبر واتساب العيادة.',
      step1Label: '1. اختر الخدمة',
      step2Label: '2. اختر التاريخ',
      step3Label: '3. اختر وقت الدخول',
      step4Label: '4. بيانات المراجع',
      legendAvailable: 'متاح',
      legendBooked: 'محجوز',
      legendSelected: 'مختار',
      legendPast: 'منتهي',
      labelFullName: 'الاسم الكامل',
      placeholderFullName: 'مثال: أحمد علي حسين',
      labelPhone: 'رقم الهاتف العراقي (واتساب)',
      placeholderPhone: '077xxxxxxxx',
      phoneHint: 'يجب أن يبدأ بـ 07 ويتكون من 11 رقماً',
      labelNotes: 'ملاحظات أو نوع الألم (اختياري)',
      placeholderNotes: 'مثال: ألم في الضرس العلوي أو استشارة فينير...',
      submitBooking: 'تأكيد الحجز عبر واتساب',
      summaryTitle: 'ملخص الحجز',
      summaryService: 'الخدمة',
      summaryDate: 'التاريخ',
      summaryTime: 'الوقت',
      notSelectedYet: 'لم يُحدد بعد',
      closedDayNotice: 'العيادة مغلقة في هذا اليوم. يرجى اختيار يوم آخر.',
      noSlotsNotice: 'لا توجد أوقات متبقية متاحة لهذا اليوم. يرجى اختيار اليوم التالي.',
      locationEyebrow: 'أوقات الدوام والتواصل',
      locationTitle: 'زورونا في عيادة ڤيلار التخصصية',
      hoursTitle: 'جدول أوقات الدوام الرسمي',
      dayClosed: 'عطلة رسمية',
      contactTitle: 'التواصل السريع والموقع',
      phoneLabel: 'الهاتف المباشر وواتساب',
      chatWhatsapp: 'تواصل عبر واتساب',
      openInMaps: 'افتح الموقع في خرائط Google',
      mapCardSubtitle: 'انقر لفتح الاتجاهات المباشرة إلى عيادة ڤيلار',
      footerRights: 'جميع الحقوق محفوظة',
      adminPortal: 'بوابة الإدارة',
      stickyBookNow: 'احجز موعدك الآن',
      modalTitle: 'تم تسجيل موعدك بنجاح!',
      modalSubtitle: 'تم حجز الوقت المحدد باسمك. يرجى إرسال رسالة التأكيد عبر واتساب لإتمام التثبيت النهائي.',
      modalOpenWhatsapp: 'إرسال التأكيد عبر واتساب الآن',
      modalClose: 'إغلاق',
      bookingIdLabel: 'رقم الحجز',
      errSelectService: 'يرجى اختيار الخدمة المطلوبة.',
      errSelectDate: 'يرجى اختيار تاريخ متاح للموعد.',
      errSelectTime: 'يرجى اختيار وقت دخول متاح.',
      errNameRequired: 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل).',
      errPhoneInvalid: 'يرجى إدخال رقم هاتف عراقي صحيح مكون من 11 رقماً يبدأ بـ 07.',
      errSlotTaken: 'عذراً، هذا الوقت تم حجزه للتو. يرجى اختيار وقت آخر متاح.'
    },
    en: {
      navHome: 'Home',
      navServices: 'Services',
      navGallery: 'Clinic Tour',
      navBeforeAfter: 'Before & After',
      navBooking: 'Book Now',
      navLocation: 'Location',
      callNow: 'Call Now',
      heroBadge: 'VELAR CLINIC FOR DENTAL CARE',
      heroTitle: 'Your Smile Deserves Specialized World-Class Care',
      heroSubtitle: 'Modern painless cosmetic & medical dentistry, hospital-grade sterilization, and instant 30-second online booking with zero waiting.',
      heroPrimaryCta: 'Book in 30 Seconds',
      heroSecondaryCta: 'Tour the Clinic',
      trust1Title: '100% Medical Sterilization',
      trust1Sub: 'Certified autoclave cycles for every patient',
      trust2Title: 'Latest Dental Technology',
      trust2Sub: 'Digital diagnostics & painless precision care',
      trust3Title: 'Zero-Wait Online Booking',
      trust3Sub: 'Pick your exact time & confirm via WhatsApp',
      servicesEyebrow: 'Our Specialties',
      servicesTitle: 'Comprehensive Dental & Cosmetic Services',
      servicesSubtitle: 'Combining specialist expertise with modern technology for lasting oral health and confident smiles.',
      bookThisService: 'Book This Service',
      galleryEyebrow: 'Luxury Clinical Environment',
      galleryTitle: 'Inside Velar Clinic',
      gallerySubtitle: 'Real photos of our clinic crafted to unite refined comfort with uncompromising clinical hygiene.',
      clickToZoom: 'Click to enlarge',
      whyEyebrow: 'Why Choose Velar?',
      whyTitle: 'Precision Dentistry & Comfort From the Moment You Arrive',
      whyPoint1: 'Dedicated specialists who listen first and provide a clear, transparent treatment plan.',
      whyPoint2: 'Individually sealed, sterilized instruments following strict international protocols.',
      whyPoint3: 'Smart appointment scheduling that respects your time and eliminates crowded waiting rooms.',
      beforeAfterEyebrow: 'Visible Transformations',
      beforeAfterTitle: 'Before & After Smile Aesthetics',
      beforeAfterSubtitle: 'Drag the handle left or right to compare teeth whitening and veneer brilliance.',
      beforeLabel: 'Before',
      afterLabel: 'After',
      dragToCompare: 'Drag to compare',
      bookingEyebrow: 'Instant Appointment',
      bookingTitle: 'Book Your Visit in 30 Seconds',
      bookingSubtitle: 'Select your service, date, and open time slot — locked immediately and confirmed via clinic WhatsApp.',
      step1Label: '1. Select Service',
      step2Label: '2. Select Date',
      step3Label: '3. Select Time Slot',
      step4Label: '4. Patient Details',
      legendAvailable: 'Available',
      legendBooked: 'Booked',
      legendSelected: 'Selected',
      legendPast: 'Passed',
      labelFullName: 'Full Name',
      placeholderFullName: 'e.g. Ahmed Ali Hussein',
      labelPhone: 'Iraqi Mobile Number (WhatsApp)',
      placeholderPhone: '077xxxxxxxx',
      phoneHint: 'Must start with 07 and contain 11 digits',
      labelNotes: 'Notes or Pain Description (Optional)',
      placeholderNotes: 'e.g. Upper molar sensitivity or veneer consultation...',
      submitBooking: 'Confirm Booking via WhatsApp',
      summaryTitle: 'Booking Summary',
      summaryService: 'Service',
      summaryDate: 'Date',
      summaryTime: 'Time',
      notSelectedYet: 'Not selected yet',
      closedDayNotice: 'The clinic is closed on this day. Please select another date.',
      noSlotsNotice: 'No remaining slots available for today. Please choose another date.',
      locationEyebrow: 'Hours & Contact',
      locationTitle: 'Visit Velar Clinic for Dental Care',
      hoursTitle: 'Official Working Hours',
      dayClosed: 'Closed',
      contactTitle: 'Direct Contact & Directions',
      phoneLabel: 'Direct Phone & WhatsApp',
      chatWhatsapp: 'Chat on WhatsApp',
      openInMaps: 'Open in Google Maps',
      mapCardSubtitle: 'Tap to open direct navigation to Velar Clinic',
      footerRights: 'All rights reserved',
      adminPortal: 'Admin Portal',
      stickyBookNow: 'Book Your Appointment',
      modalTitle: 'Appointment Reserved!',
      modalSubtitle: 'Your time slot is now held under your name. Send the pre-filled WhatsApp message to finalize confirmation.',
      modalOpenWhatsapp: 'Send Confirmation on WhatsApp',
      modalClose: 'Close',
      bookingIdLabel: 'Booking ID',
      errSelectService: 'Please select a dental service.',
      errSelectDate: 'Please select an available date.',
      errSelectTime: 'Please select an available time slot.',
      errNameRequired: 'Please enter your full name (at least 3 characters).',
      errPhoneInvalid: 'Please enter a valid 11-digit Iraqi mobile number starting with 07.',
      errSlotTaken: 'Sorry, this time slot was just booked. Please pick another slot.'
    }
  };

  global.VELAR_IMAGES = IMAGES;
  global.VELAR_CONFIG = CLINIC_CONFIG;
  global.VELAR_I18N = TRANSLATIONS;
  global.velarHandleImgError = handleImageError;
  global.velarCreateSvgFallback = createSvgFallback;
})(window);
