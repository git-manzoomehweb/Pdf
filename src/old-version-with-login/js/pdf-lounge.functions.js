// ----------------------------- Lounge PDF --------------------------------
            // متغیرهای کنترل لودینگ
            let loadingStartTime = Date.now();
            let isContentLoaded = false;
            let isMinTimeElapsed = false;
            let apiDataLoaded = false;
            const MIN_LOADING_TIME = 2000; // 2 ثانیه حداقل
            let mainlid;

            function setlid(lid){
              mainlid = lid;
            }

            function initializePageLanguage(lid) {
                const translations = {
                    1: { // فارسی
                        lang: 'fa',
                        dir: 'rtl',
                        mainTitle: 'لانژ',
                        contractNumber: 'شماره قرارداد',
                        issueDate: 'تاریخ صدور',
                        contractTime: 'ساعت قرارداد',
                        accessDenied: 'شما اجازه دسترسی به این صفحه را ندارید',
                        loadingText: 'در حال بارگذاری',
                        pdfLoadingText: 'در حال تولید PDF',
                        textAlign: 'text-right',
                        justifyContent: '!justify-end',
                        centerText: "text-center"
                    },
                    2: { // انگلیسی
                        lang: 'en',
                        dir: 'ltr',
                        mainTitle: 'Lounge',
                        contractNumber: 'Contract Number',
                        issueDate: 'Issue Date',
                        contractTime: 'Contract Time',
                        accessDenied: 'You do not have permission to access this page',
                        loadingText: 'Loading',
                        pdfLoadingText: 'Generating PDF',
                        textAlign: 'text-left',
                        justifyContent: '!justify-start',
                        centerText: "text-center"
                    },
                    3: { // عربی
                        lang: 'ar',
                        dir: 'rtl',
                        mainTitle: 'الصالة',
                        contractNumber: 'رقم العقد',
                        issueDate: 'تاريخ الإصدار',
                        contractTime: 'وقت العقد',
                        accessDenied: 'ليس لديك إذن للوصول إلى هذه الصفحة',
                        loadingText: 'جاري التحميل',
                        pdfLoadingText: 'جاري إنشاء PDF',
                        textAlign: 'text-right',
                        justifyContent: '!justify-end',
                        centerText: "text-center"
                    }
                };

                const t = translations[lid] || translations[1];
                window.currentTranslations = t;

                // تنظیم attributes اصلی HTML
                const htmlRoot = document.getElementById('html-root');
                const body = document.body;
                const mainContent = document.getElementById('main-content-wrapper');
                const headerSection = document.getElementById('header-section');
                const accessDeniedMessage = document.getElementById('access-denied-message');
                const pdfLoadingText = document.getElementById('pdf-loading-text');
                const mainLoadingText = document.getElementById('main-loading-text');

                // if (htmlRoot) {
                //     htmlRoot.setAttribute('lang', t.lang);
                //     htmlRoot.setAttribute('dir', t.dir);
                // }

                // if (body) {
                //     body.setAttribute('dir', t.dir);
                //     body.className = body.className.replace(/dir-(rtl|ltr)/g, '') + ` dir-${t.dir}`;
                // }

                if (mainContent) {
                    mainContent.setAttribute('dir', t.dir);
                    mainContent.className = mainContent.className.replace(/dir-(rtl|ltr)/g, '') + ` dir-${t.dir}`;
                }

                if (headerSection) {
                    headerSection.setAttribute('dir', t.dir);
                    headerSection.className = headerSection.className.replace(/(!justify-start|!justify-end)/g, '') + ` ${t.justifyContent}`;
                }

                // تنظیم متن لودینگ اصلی
                if (mainLoadingText) {
                    mainLoadingText.textContent = t.loadingText;
                }

                // تنظیم متون ثابت
                setTimeout(() => {
                    const mainTitle = document.getElementById('main-title');
                    if (mainTitle) {
                        mainTitle.textContent = t.mainTitle;
                        mainTitle.className = mainTitle.className.replace(/(text-left|text-right)/g, '') + ` ${t.textAlign}`;
                    }

                    const contractNumberLabel = document.getElementById('contract-number-label');
                    if (contractNumberLabel) {
                        contractNumberLabel.innerHTML = `${t.contractNumber}`;
                        contractNumberLabel.className = contractNumberLabel.className.replace(/(text-left|text-right)/g, '') + ` ${t.textAlign}`;
                    }

                    const issueDateLabel = document.getElementById('issue-date-label');
                    if (issueDateLabel) {
                        issueDateLabel.innerHTML = `${t.issueDate}`;
                        issueDateLabel.className = issueDateLabel.className.replace(/(text-left|text-right)/g, '') + ` ${t.textAlign}`;
                    }

                    const contractTimeLabel = document.getElementById('contract-time-label');
                    if (contractTimeLabel) {
                        contractTimeLabel.innerHTML = `${t.contractTime}`;
                        contractTimeLabel.className = contractTimeLabel.className.replace(/(text-left|text-right)/g, '') + ` ${t.textAlign}`;
                    }

                    // تنظیم پیغام خطای دسترسی
                    if (accessDeniedMessage) {
                        accessDeniedMessage.textContent = t.accessDenied;
                        accessDeniedMessage.setAttribute('dir', t.dir);
                        accessDeniedMessage.className = accessDeniedMessage.className.replace(/dir-(rtl|ltr)/g, '') + ` dir-${t.dir}`;
                    }

                    // تنظیم متن لودینگ PDF
                    const loadingText = document.getElementById('loading-text');
                    if (loadingText) {
                        loadingText.textContent = t.pdfLoadingText;
                    }

                    if (pdfLoadingText) {
                        pdfLoadingText.setAttribute('dir', t.dir);
                        pdfLoadingText.className = pdfLoadingText.className.replace(/dir-(rtl|ltr)/g, '') + ` dir-${t.dir}`;
                    }
              }, 2000);
            }

            function initializeLoadingSystem() {
                // شروع تایمر حداقل زمان
                setTimeout(() => {
                    isMinTimeElapsed = true;
                    checkLoadingComplete();
                }, MIN_LOADING_TIME);

                // بررسی لود شدن تصاویر
                checkImagesLoaded();
                
                // بررسی لود شدن فونت‌ها
                checkFontsLoaded();
                
                // بررسی API و محتوا
                checkContentLoaded();
            }

            function checkImagesLoaded() {
                const images = document.querySelectorAll('img');
                let loadedCount = 0;
                const totalImages = images.length;

                if (totalImages === 0) {
                    // اگر تصویری نیست، این بخش کامل است
                    return Promise.resolve();
                }

                return new Promise((resolve) => {
                    images.forEach(img => {
                        if (img.complete) {
                            loadedCount++;
                        } else {
                            img.onload = img.onerror = () => {
                                loadedCount++;
                                if (loadedCount === totalImages) {
                                    resolve();
                                }
                            };
                        }
                    });

                    if (loadedCount === totalImages) {
                        resolve();
                    }
                });
            }

            function checkFontsLoaded() {
                if (document.fonts && document.fonts.ready) {
                    return document.fonts.ready;
                }
                // Fallback برای مرورگرهای قدیمی
                return new Promise(resolve => setTimeout(resolve, 500));
            }

            function checkContentLoaded() {
                // بررسی اینکه آیا API call ها کامل شده‌اند
                const checkApiInterval = setInterval(() => {
                    // بررسی وجود داده‌های API در DOM
                    const hasApiContent = document.querySelector('[datamembername="db.lounge_pdf"]');
                    const hasGeneratedContent = document.querySelector('h1'); // محتوای تولید شده

                    if (hasApiContent && hasGeneratedContent) {
                        apiDataLoaded = true;
                        clearInterval(checkApiInterval);
                        checkAllResourcesLoaded();
                    }
                }, 100);

                // Timeout برای اطمینان (حداکثر 10 ثانیه انتظار)
                setTimeout(() => {
                    if (!apiDataLoaded) {
                        apiDataLoaded = true;
                        clearInterval(checkApiInterval);
                        checkAllResourcesLoaded();
                    }
                }, 10000);
            }

            async function checkAllResourcesLoaded() {
                try {
                    // انتظار برای تمام resources
                    await Promise.all([
                        checkImagesLoaded(),
                        checkFontsLoaded()
                    ]);

                initializePageLanguage(mainlid);
                initializeLoadingSystem();
                    
                    isContentLoaded = true;
                    checkLoadingComplete();
                } catch (error) {
                    console.warn('خطا در لود resources:', error);
                    isContentLoaded = true;
                    checkLoadingComplete();
                }
            }

            function checkLoadingComplete() {
                if (isMinTimeElapsed && isContentLoaded && apiDataLoaded) {
                    hideLoadingScreen();
                }
            }

            function hideLoadingScreen() {
                const loadingScreen = document.getElementById('main-loading-screen');
                const mainContent = document.getElementById('main-content-wrapper');

                if (loadingScreen && mainContent) {
                    // مخفی کردن لودینگ
                    loadingScreen.classList.add('hidden');
                    
                    // نمایش محتوای اصلی
                    setTimeout(() => {
                        mainContent.classList.add('loaded');
                        loadingScreen.style.display = 'none';
                    }, 500);
                }
            }

            // در صورت خطا، حداکثر بعد از 15 ثانیه لودینگ را مخفی کن
            setTimeout(() => {
                if (!isContentLoaded) {
                    console.warn('Loading timeout - forcing content display');
                    isContentLoaded = true;
                    isMinTimeElapsed = true;
                    apiDataLoaded = true;
                    checkLoadingComplete();
                }
            }, 15000);

            // Hook برای basis system - زمانی که API اجرا شد
            window.onBasisApiComplete = function() {
                apiDataLoaded = true;
                checkAllResourcesLoaded();
            };

            // Hook جایگزین برای تشخیص تکمیل محتوا
            window.addEventListener('load', function() {
                setTimeout(() => {
                    if (!apiDataLoaded) {
                        apiDataLoaded = true;
                        checkAllResourcesLoaded();
                    }
                }, 500);
            });



async function RenderInfoCardLounge($data, lang) {
  let loungeJson = $data;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      error: "داده‌های هتل نامعتبر است.",
      dir: "rtl",
      textAlign: "text-right",
    },
    2: {
      // انگلیسی
      error: "Invalid hotel data provided.",
      dir: "ltr",
      textAlign: "text-left",
    },
    3: {
      // عربی
      error: "بيانات الفندق غير صالحة.",
      dir: "rtl",
      textAlign: "text-right",
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  if (!loungeJson || !loungeJson.cipinfo) {
    console.error("Invalid hotel data:", loungeJson);
    return `<div class="text-red-500 ${t.textAlign}" dir="${t.dir}">${t.error}</div>`;
  }

  const cip = loungeJson.cipinfo;
  let infocard = `<h1 class="text-lg font-danademibold text-center" dir="${t.dir}">${cip.loungename}</h1>
        <div class="flex text-sm" dir="${t.dir}">
            <span class="text-sm font-danademibold ${t.textAlign}">${cip.airport}</span>
            <span class="mx-2">/</span>
            <span class="text-sm font-danademibold ${t.textAlign}">${cip.cities}</span>
        </div>`;

  return infocard;
}

async function renderRulesLounge($data, lang) {
  const rules = $data?.pdf_description;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      noItems: "هیچ آیتمی در pdf_description پیدا نشد",
      invalidText: "آیتم {index} متن معتبری ندارد",
      dir: "rtl",
      textAlign: "text-right",
    },
    2: {
      // انگلیسی
      noItems: "No items found in pdf_description",
      invalidText: "Item {index} does not have valid text",
      dir: "ltr",
      textAlign: "text-left",
    },
    3: {
      // عربی
      noItems: "لم يتم العثور على أي عناصر في pdf_description",
      invalidText: "العنصر {index} لا يحتوي على نص صالح",
      dir: "rtl",
      textAlign: "text-right",
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  if (!rules || !Array.isArray(rules)) {
    console.warn(t.noItems);
    return null;
  }

  let direction = detectDirection(rules?.[0]?.note.text) || t.dir;

  let ulitem = "";
  rules.forEach((item, index) => {
    const text = item?.note?.text?.trim();

    if (text) {
      ulitem += `<li>${text}</li>`;
    } else {
      console.warn(t.invalidText.replace("{index}", index), item);
    }
  });

  return `<ul dir="${direction}" class="${t.textAlign}">${fixRTLTextCompletely(
    ulitem
  )}</ul>`;
}

async function renderLoungeInfo($data, lang) {
  let product_info = $data?.product_info;
  let Flightinfo = "";

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات lounge",
      airport: "نام فرودگاه <br/> Airport Name",
      city: "شهر <br/> City",
      airline: "ایرلاین <br/> Airline",
      routecode: "کد مسیر <br/> Route Code",
      date: "تاریخ <br/> Date",
      time: "ساعت <br/> Time",
      travelType: "نوع سفر <br/> Travel Type",
      flightType: "نوع پرواز <br/> Flight Type",
      domestic: "داخلی ",
      international: "خارجی ",
      arrival: "ورودی ",
      departure: "خروجی ",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Lounge Information",
      airport: "Airport Name",
      city: "City",
      airline: "Airline",
      routecode: "Route Code",
      date: "Date",
      time: "Time",
      travelType: "Travel Type",
      flightType: "Flight Type",
      domestic: "Domestic",
      international: "International",
      arrival: "Arrival",
      departure: "Departure",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات الصالة",
      airport: "اسم المطار",
      city: "المدينة",
      airline: "الخطوط الجوية",
      routecode: "رمز المسار",
      date: "التاريخ",
      time: "الوقت",
      travelType: "نوع السفر",
      flightType: "نوع الرحلة",
      domestic: "محلي",
      international: "دولي",
      arrival: "وصول",
      departure: "مغادرة",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];


  Flightinfo += `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${
    t.dir
  }">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-1 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center " dir="${
          t.dir
        }">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.airport}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.airportName}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.city}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.cityname}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.airline}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.airline}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.routecode}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.routecode}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.date}</span>
                <div class="text-[#292929] text-sm font-danademibold dir-${ t.dir} ${t.centerText}">
                    <span class="!text-center block">${product_info.dateinfo.mstring}</span>
                    ${
                      lang === 1
                        ? `<span class="!text-center block">(${product_info.dateinfo.sstring})</span>`
                        : ""
                    }
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.time}</span>
                <div class="text-[#292929] text-sm font-danademibold ${
                  t.centerText
                }">
                    ${product_info.time}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.travelType}</span>
                <div class="text-[#292929] text-sm font-danademibold ${
                  t.centerText
                }">
                    ${
                      product_info.traveltype === "1"
                        ? t.domestic
                        : t.international
                    }
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap  ${t.centerText}">${t.flightType}</span>
                <div class="text-[#292929] text-sm font-danademibold ${
                  t.centerText
                }">
                    <span class="inline-block">${
                      product_info.flighttype === "1" ? t.arrival : t.departure
                    }</span>
                    <span class="mx-1">-</span>
                    <span class="inline-block">${
                      product_info.city_flight
                    }</span>
                </div>
            </div>
        </div>
    `;

  return Flightinfo;
}

async function renderLoungePassengerInfo($data, lang) {
  const cipinfo = $data?.cipinfo;
  const passengers = $data?.passengerinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات مسافران",
      row: "ردیف <br/> NO",
      passengers: "مسافران <br/> Passengers",
      type: "نوع مسافر <br/> Passenger Type",
      gender: "جنسیت <br/> Gender",
      country: "ملیت <br/> Nationality",
      male: "مرد",
      female: "زن",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Passenger Information",
      row: "Row",
      passengers: "Passengers",
      type: "Passenger Type",
      gender: "Gender",
      country: "Nationality",
      male: "Male",
      female: "Female",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات المسافرين",
      row: "الصف",
      passengers: "المسافرون",
      type: "نوع المسافر",
      gender: "الجنس",
      country: "الجنسية",
      male: "ذكر",
      female: "أنثى",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  const parsedPassengers = passengers.map((p) => {
    const info = p.cip_passenger;
    return {
      name: `${info.fullname.firstname?.trim() || ""} ${
        info.fullname.lastname?.trim() || ""
      }`,
      type: info.type || "–",
      gender: info.gender || "–",
      birthdate: info.birthdate?.birthdate1 || "–",
      country: info.countryofresidence?.countryname || "–",
    };
  });

  const passengerNames = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.name}</h2>`
    )
    .join("");

  const passengerTypes = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.type}</h2>`
    )
    .join("");

  const passengerCountries = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.country}</h2>`
    )
    .join("");

  const passengerGender = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          p.gender == "1" ? t.male : t.female
        }</h2>`
    )
    .join("");

  const rowNumbers = parsedPassengers
    .map(
      (_, index) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          index + 1
        }</h2>`
    )
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-4 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col max-sm:hidden">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.row}</span>
                ${rowNumbers}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.passengers}</span>
                ${passengerNames}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.type}</span>
                ${passengerTypes}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.gender}</span>
                ${passengerGender}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.country}</span>
                ${passengerCountries}
            </div>
        </div>
    `;
}

async function renderServiceInfoLounge($data, lang) {
  const cipinfo = $data?.cipinfo;
  const services = $data?.serviceinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات خدمات",
      serviceName: "نام خدمات <br/> Service Name",
      count: "تعداد <br/> Count",
      description: "توضیحات <br/> Description",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Service Information",
      serviceName: "Service Name",
      count: "Count",
      description: "Description",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات الخدمات",
      serviceName: "اسم الخدمة",
      count: "العدد",
      description: "الوصف",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  const serviceNames = services
    .map(
      (s) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          s.service.servicename || "–"
        }</h2>`
    )
    .join("");

  const serviceDescriptions = services
    .map(
      (s) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          s.service.des_service || "–"
        }</h2>`
    )
    .join("");

  const serviceCount = services
    .map(
      (s) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          s.service.count || "–"
        }</h2>`
    )
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between max-sm:flex-col max-sm:flex-wrap max-sm:justify-center gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.serviceName}</span>
                ${serviceNames}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.count}</span>
                ${serviceCount}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.description}</span>
                ${serviceDescriptions}
            </div>
        </div>
    `;
}

async function renderTransferInfoLounge($data, lang) {
  const transfers = $data?.transferinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات ترنسفر",
      carName: "نام ترنسفر<br/> Transfer Name",
      address: "آدرس <br/> Address",
      time: "زمان <br/> Time",
      phone: "شماره تماس <br/> Phone Number",
      description: "توضیحات <br/> Description",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Transfer Information",
      carName: "Transfer Name",
      address: "Address",
      time: "Time",
      phone: "Phone Number",
      description: "Description",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات النقل",
      carName: "اسم النقل",
      address: "العنوان",
      time: "الوقت",
      phone: "رقم الهاتف",
      description: "الوصف",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  // تغییر نام متغیر از t به transfer برای جلوگیری از تداخل
  const carNames = transfers
    .map(
      (transfer) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          transfer.transfer?.car_name || "–"
        }</h2>`
    )
    .join("");

  const addresses = transfers
    .map(
      (transfer) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          transfer.transfer?.address || "–"
        }</h2>`
    )
    .join("");

  const times = transfers
    .map(
      (transfer) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          transfer.transfer?.time || "–"
        }</h2>`
    )
    .join("");

  const phones = transfers
    .map(
      (transfer) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          transfer.transfer?.phone || "–"
        }</h2>`
    )
    .join("");

  const descriptions = transfers
    .map(
      (transfer) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${
          transfer.transfer?.des_transfer || "–"
        }</h2>`
    )
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between max-sm:flex-col max-sm:flex-wrap max-sm:justify-center gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.carName}</span>
                ${carNames}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.address}</span>
                ${addresses}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.time}</span>
                ${times}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.phone}</span>
                ${phones}
            </div>
            <div class="flex flex-col gap-2 col-span-full">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.description}</span>
                ${descriptions}
            </div>
        </div>
    `;
}

async function renderEscortInfoLounge($data, lang) {
  const escorts = $data?.escortinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات اسکورت",
      escortName: "نام اسکورت <br/> Escort Name",
      gender: "جنسیت <br/> Gender",
      male: "مرد",
      female: "زن",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Escort Information",
      escortName: "Escort Name",
      gender: "Gender",
      male: "Male",
      female: "Female",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات المرافق",
      escortName: "اسم المرافق",
      gender: "الجنس",
      male: "ذكر",
      female: "أنثى",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  const escortNames = escorts
    .map((e) => {
      const { firsname, lastname } = e.escort || {};
      return `<h2 class="text-[#292929] text-sm font-danademibold ${
        t.textAlign
      }">${firsname || ""} ${lastname || ""}</h2>`;
    })
    .join("");

  const escortGenders = escorts
    .map((e) => {
      const gender = e.escort?.gender === "1" ? t.male : t.female;
      return `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${gender}</h2>`;
    })
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between max-sm:flex-col max-sm:flex-wrap max-sm:justify-center gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2 w-1/2 justify-center items-center max-sm:w-full">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.escortName}</span>
                ${escortNames}
            </div>
            <div class="flex flex-col gap-2 w-1/2 justify-center items-center max-sm:w-full">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.gender}</span>
                ${escortGenders}
            </div>
        </div>
    `;
}

// ----------------------------- Lounge PDF --------------------------------
