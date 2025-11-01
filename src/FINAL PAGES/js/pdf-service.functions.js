// ----------------------------- Service PDF --------------------------------
// متغیرهای کنترل لودینگ
let loadingStartTime = Date.now();
let isContentLoaded = false;
let isMinTimeElapsed = false;
let apiDataLoaded = false;
const MIN_LOADING_TIME = 2000; // 2 ثانیه حداقل
let mainlid;

function setlid(lid) {
  mainlid = lid;
}

let translations;
function initializePageLanguage(lid) {
  translations = {
    1: {
      // فارسی
      lang: "fa",
      dir: "rtl",
      mainTitle: "خدمات",
      contractNumber: "شماره قرارداد",
      issueDate: "تاریخ صدور",
      contractTime: "ساعت قرارداد",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری",
      pdfLoadingText: "در حال تولید PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
      


      reject: `<p style="text-align:center">متاسفانه سرویس شما تایید نشد</p>
                <p style="text-align:center">Unfortunately, your Service was not approved</p>
                <p style="text-align:center">جهت هماهنگی و پاسخگویی به سوالات خود را با واحد پشتیبانی تماس حاصل نمایید</p>
               <p style="text-align:center">Contact the support unit to coordinate and answer your questions</p>`,


      onrequest: `<p style="text-align:center">واچر شما منتظر تایید واحد رزرواسیون است</p>
                <p style="text-align:center">Your voucher is waiting for the approval of the reservation</p>
                <p style="text-align:center">جهت هماهنگی و پاسخگویی به سوالات خود با واحد پشتیبانی تماس حاصل نمایید.</p>
               <p style="text-align:center">Contact the support unit to coordinate and answer your questions</p>`,


    },
    2: {
      // انگلیسی
      lang: "en",
      dir: "ltr",
      mainTitle: "Service",
      contractNumber: "Contract Number",
      issueDate: "Issue Date",
      contractTime: "Contract Time",
      accessDenied: "You do not have permission to access this page",
      loadingText: "Loading",
      pdfLoadingText: "Generating PDF",
      textAlign: "text-left",
      justifyContent: "!justify-start",

      
      reject: `
                <p style="text-align:center">Unfortunately, your Service was not approved</p>
               <p style="text-align:center">Contact the support unit to coordinate and answer your questions</p>`,


      onrequest: `<p style="text-align:center">Your voucher is waiting for the approval of the reservation</p>
               <p style="text-align:center">Contact the support unit to coordinate and answer your questions</p>`,

    },
    3: {
      // عربی
      lang: "ar",
      dir: "rtl",
      mainTitle: "الخدمة",
      contractNumber: "رقم العقد",
      issueDate: "تاريخ الإصدار",
      contractTime: "وقت العقد",
      accessDenied: "ليس لديك إذن للوصول إلى هذه الصفحة",
      loadingText: "جاري التحميل",
      pdfLoadingText: "جاري إنشاء PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",

reject: `
  <p style="text-align:center">للأسف، لم يتم اعتماد خدمتك</p>
  <p style="text-align:center">يرجى التواصل مع وحدة الدعم للتنسيق والإجابة على استفساراتك</p>`,

onrequest: `
  <p style="text-align:center">قسيمتك بانتظار موافقة الحجز</p>
  <p style="text-align:center">يرجى التواصل مع وحدة الدعم للتنسيق والإجابة على استفساراتك</p>`,


    },
  };

  const t = translations[lid] || translations[1];
  window.currentTranslations = t;

  // تنظیم attributes اصلی HTML
  const htmlRoot = document.getElementById("html-root");
  const body = document.body;
  const mainContent = document.getElementById("main-content-wrapper");
  const headerSection = document.getElementById("header-section");
  const accessDeniedMessage = document.getElementById("access-denied-message");
  const pdfLoadingText = document.getElementById("pdf-loading-text");
  const mainLoadingText = document.getElementById("main-loading-text");

  // if (htmlRoot) {
  //   htmlRoot.setAttribute("lang", t.lang);
  //   htmlRoot.setAttribute("dir", t.dir);
  // }

  // if (body) {
  //   body.setAttribute("dir", t.dir);
  //   body.className =
  //     body.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
  // }

  if (mainContent) {
    mainContent.setAttribute("dir", t.dir);
    mainContent.className =
      mainContent.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
  }

  if (headerSection) {
    headerSection.setAttribute("dir", t.dir);
    headerSection.className =
      headerSection.className.replace(/(!justify-start|!justify-end)/g, "") +
      ` ${t.justifyContent}`;
  }

  // تنظیم متن لودینگ اصلی
  if (mainLoadingText) {
    mainLoadingText.textContent = t.loadingText;
  }

  // تنظیم متون ثابت
  setTimeout(() => {
    const mainTitle = document.getElementById("main-title");
    if (mainTitle) {
      mainTitle.textContent = t.mainTitle;
      mainTitle.className =
        mainTitle.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    const contractNumberLabel=document.getElementById("contract-number-label");
    if (contractNumberLabel) {
      contractNumberLabel.innerHTML = `${t.contractNumber}`;
      contractNumberLabel.className =
        contractNumberLabel.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    const issueDateLabel = document.getElementById("issue-date-label");
    if (issueDateLabel) {
      issueDateLabel.innerHTML = `${t.issueDate}`;
      issueDateLabel.className =
        issueDateLabel.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    const contractTimeLabel = document.getElementById("contract-time-label");
    if (contractTimeLabel) {
      contractTimeLabel.innerHTML = `${t.contractTime}`;
      contractTimeLabel.className =
        contractTimeLabel.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    // تنظیم پیغام خطای دسترسی
    if (accessDeniedMessage) {
      accessDeniedMessage.textContent = t.accessDenied;
      accessDeniedMessage.setAttribute("dir", t.dir);
      accessDeniedMessage.className =
        accessDeniedMessage.className.replace(/dir-(rtl|ltr)/g, "") +
        ` dir-${t.dir}`;
    }

    // تنظیم متن لودینگ PDF
    const loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.textContent = t.pdfLoadingText;
    }

    if (pdfLoadingText) {
      pdfLoadingText.setAttribute("dir", t.dir);
      pdfLoadingText.className =
        pdfLoadingText.className.replace(/dir-(rtl|ltr)/g, "") +
        ` dir-${t.dir}`;
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



function nodata_error(message, status) {
  if(message){
    try {
  
      console.log("nodata_error() inputs:", { status, message });
  
      // حذف امن Main_Data اگر وجود دارد
      const main = document.getElementById("main-content");
      if (main && typeof main.remove === 'function') main.remove();
  
      // نرمال‌سازی status
      const s = (status == null ? '' : String(status)).trim().toLowerCase();
  
      // دسترسی امن به ترجمه‌ها
      // const t = (typeof translations === 'object' && translations != null && translations[mainlid])
      //   ? translations[mainlid]
      //   : {};
  
      // نگاشت استیتوس به کلید ترجمه + فالبک متن ثابت
      const map = {
        'onrequest':        translations[mainlid].onrequest ?? 'در حال استعلام / On request',
        'on request':       translations[mainlid].onrequest ?? 'در حال استعلام / On request',
        'on_request':       translations[mainlid].onrequest ?? 'در حال استعلام / On request',
        'reject':           translations[mainlid].reject    ?? 'رد شده / Rejected',
        'rejected':         translations[mainlid].reject    ?? 'رد شده / Rejected',
      };
  
      // انتخاب متن بر اساس status
      const text = map[s];
  
      // اگر متن پیدا شد، همان را برگردان
      if (text) {
        return `
          <div class="bg-red-300 border-2 border-red-500 rounded-xl py-4 px-8 max-sm:px-3 font-danaregular max-w-7xl !text-center w-fit mx-auto my-auto h-fit">
            ${text}
          </div>`;
      }
  
      // اگر status ناشناخته بود ولی message داریم، خود message را نشان بده
      if (message != null && String(message).trim().length > 0) {
        return `
          <div class="bg-red-300 border-2 border-red-500 rounded-xl py-4 px-8 max-sm:px-3 font-danaregular max-w-7xl !text-center w-fit mx-auto my-auto h-fit">
            ${String(message)}
          </div>`;
      }
  
      // در غیر اینصورت چیزی نشان نده
      return '';
    } catch (err) {
      console.error('nodata_error() failed:', err);
      return '';
    }
  }
}


function checkImagesLoaded() {
  const images = document.querySelectorAll("img");
  let loadedCount = 0;
  const totalImages = images.length;

  if (totalImages === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    images.forEach((img) => {
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
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function checkContentLoaded() {
  const checkApiInterval = setInterval(() => {
    const hasApiContent = document.querySelector(
      '[datamembername="db.visa_pdf"]'
    );
    const hasGeneratedContent = document.querySelector("h1");

    if (hasApiContent && hasGeneratedContent) {
      apiDataLoaded = true;
      clearInterval(checkApiInterval);
      checkAllResourcesLoaded();
    }
  }, 100);

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
    await Promise.all([checkImagesLoaded(), checkFontsLoaded()]);

    initializePageLanguage(mainlid);
    initializeLoadingSystem();

    isContentLoaded = true;
    checkLoadingComplete();
  } catch (error) {
    console.warn("خطا در لود resources:", error);
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
  const loadingScreen = document.getElementById("main-loading-screen");
  const mainContent = document.getElementById("main-content-wrapper");

  if (loadingScreen && mainContent) {
    loadingScreen.classList.add("hidden");

    setTimeout(() => {
      mainContent.classList.add("loaded");
      loadingScreen.style.display = "none";
    }, 500);
  }
}

// Timeout و hooks
setTimeout(() => {
  if (!isContentLoaded) {
    console.warn("Loading timeout - forcing content display");
    isContentLoaded = true;
    isMinTimeElapsed = true;
    apiDataLoaded = true;
    checkLoadingComplete();
  }
}, 15000);

window.onBasisApiComplete = function () {
  apiDataLoaded = true;
  checkAllResourcesLoaded();
};

window.addEventListener("load", function () {
  setTimeout(() => {
    if (!apiDataLoaded) {
      apiDataLoaded = true;
      checkAllResourcesLoaded();
    }
  }, 500);
});

// ================= توابع رندر چندزبانه =================

async function RenderInfoCardService($data, lang) {
  let ServiceJson = $data;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      error: "داده‌های سرویس نامعتبر است.",
      dir: "rtl",
      textAlign: "text-right",
    },
    2: {
      // انگلیسی
      error: "Invalid service data provided.",
      dir: "ltr",
      textAlign: "text-left",
    },
    3: {
      // عربی
      error: "بيانات الخدمة غير صالحة.",
      dir: "rtl",
      textAlign: "text-right",
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  if (!ServiceJson || !ServiceJson.serviceinfo) {
    console.error("Invalid service data:", ServiceJson);
    return `<div class="text-red-500 ${t.textAlign}" dir="${t.dir}">${t.error}</div>`;
  }

  const service = ServiceJson.serviceinfo;
  let infocard = `<h1 class="text-lg font-danademibold text-center" dir="${t.dir}">${service.servicegroupname}</h1>
        <div class="flex text-sm justify-center" dir="${t.dir}">
            <span class="text-sm font-danademibold ${t.textAlign}">${service.servicename}</span>
        </div>`;

  return infocard;
}

async function RenderServiceCardBox($data, lang) {
  let product_info = $data?.product_info;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات خدمات",
      serviceName: "نام خدمات <br/> Service Name",
      city: "شهر <br/> City",
      date: "تاریخ <br/> Date",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
    2: {
      // انگلیسی
      title: "Service Information",
      serviceName: "Service Name",
      city: "City",
      date: "Date",
      dir: "ltr",
      textAlign: "text-left",
      centerText: "text-center"
    },
    3: {
      // عربی
      title: "معلومات الخدمة",
      serviceName: "اسم الخدمة",
      city: "المدينة",
      date: "التاريخ",
      dir: "rtl",
      textAlign: "text-right",
      centerText: "text-center"
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];
  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-4 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.serviceName}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.servicename || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.city}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.city || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.date}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText} dir-${t.dir}">
                    <span>${product_info.dateinfo?.mstring || product_info.validate?.fdate  }</span>
                    ${lang === 1 ? `<span>(${product_info.dateinfo?.sstring || "–"})</span>` : ""}
                </div>
            </div>
        </div>
    `;
}

async function RenderServicePassengers($data, lang) {
  const serviceinfo = $data?.serviceinfo;
  const passengers = $data?.passengerinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات مسافران",
      row: "ردیف <br/> NO",
      passengers: "نام / نام خانوادگی <br/> SURNAME / NAME",
      passengerType: "نوع مسافر <br/> Type",
      gender: "جنسیت <br/> Gender",
      adult: "بزرگسال",
      child: "کودک",
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
      passengers: "Surname / Name",
      passengerType: "Type",
      gender: "Gender",
      adult: "Adult",
      child: "Child",
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
      passengers: "الاسم / اللقب",
      passengerType: "النوع",
      gender: "الجنس",
      adult: "بالغ",
      child: "طفل",
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
    const info = p.service_passenger;
    return {
      name: `${info.fullname.firstname?.trim() || ""} ${info.fullname.lastname?.trim() || ""}`,
      type: info.type === "adult" ? t.adult : t.child,
      gender: info.gender === "1" ? t.male : t.female
    };
  });

  const passengerNames = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.name}</h2>`)
    .join("");

  const passengerTypes = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.type}</h2>`)
    .join("");

  const passengerGenders = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.gender}</h2>`)
    .join("");

  const rowNumbers = parsedPassengers
    .map((_, index) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${index + 1}</h2>`)
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-4 overflow-x-auto  max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col max-sm:hidden">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.row}</span>
                ${rowNumbers}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.passengers}</span>
                ${passengerNames}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.passengerType}</span>
                ${passengerTypes}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.centerText}">${t.gender}</span>
                ${passengerGenders}
            </div>
        </div>
    `;
}

async function renderServiceRules($data, lang) {
  const rule = $data?.rule?.rule;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      noRulesData: "قوانینی ثبت نشده است.",
      dir: "rtl",
      textAlign: "text-right",
    },
    2: {
      // انگلیسی
      noRulesData: "No rules have been registered.",
      dir: "ltr",
      textAlign: "text-left",
    },
    3: {
      // عربی
      noRulesData: "لم يتم تسجيل أي قوانين.",
      dir: "rtl",
      textAlign: "text-right",
    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  if (!rule) {
    return `<div class="text-gray-500" dir="${t.dir}">${t.noRulesData}</div>`;
  }

  // تبدیل قوانین به لیست
  const rules = rule.split(/\r?\n|\r/).filter((line) => line.trim().length > 0);

  let items = rules.map((r) => `<li>${fixRTLTextCompletely(r)}</li>`).join("");

  return `
    <ul class="list-none pl-5 max-sm:pl-0  text-sm ${t.textAlign}" dir="${t.dir}">${items}</ul>
  `;
}

// Helper functions برای RTL text fixing
function fixRTLTextCompletely(text) {
  if (typeof text !== 'string') return text;

  // جدا کردن تگ‌ها از متن (هم باز و هم بسته)
  const parts = text.split(/(<[^>]+>)/g);

  const fixed = parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      // این یک تگ HTML هست → فقط کاراکترهای مخفی رو حذف کن
      return part.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
    } else {
      // این متن واقعی هست → اصلاحات مربوط به جهت متن انجام بده
      return fixRTLTextFromJSON(part);
    }
  });

  return fixed.join('');
}

function fixRTLTextFromJSON(text) {
  if (typeof text !== 'string') return text;

  const rtlCharRange = /[\u0600-\u06FF]/;
  const ltrSensitiveChars = [':', '-', '(', ')', '/', '.', ',', '|'];

  if (rtlCharRange.test(text)) {
    const RLE = '\u202B'; // Right-To-Left Embedding
    const PDF = '\u202C'; // Pop Directional Formatting

    // اعمال RLE و PDF فقط به کل متن RTL، اگر شامل کاراکتر حساس بود
    const hasLTRSensitive = ltrSensitiveChars.some(char => text.includes(char));
    if (hasLTRSensitive) {
      text = RLE + text + PDF;
    }
  }

  return text;
}

function detectDirection(text) {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return rtlChars.test(text) ? 'rtl' : 'ltr';
}

// ----------------------------- Service PDF --------------------------------