// ----------------------------- Visa PDF --------------------------------
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

function initializePageLanguage(lid) {
  const translations = {
    1: {
      // فارسی
      lang: "fa",
      dir: "rtl",
      mainTitle: "ویزا",
      contractNumber: "شماره قرارداد",
      issueDate: "تاریخ صدور",
      contractTime: "ساعت قرارداد",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری...",
      pdfLoadingText: "در حال تولید PDF...",
      textAlign: "text-right",
      justifyContent: "!justify-end",
    },
    2: {
      // انگلیسی
      lang: "en",
      dir: "ltr",
      mainTitle: "Visa",
      contractNumber: "Contract Number",
      issueDate: "Issue Date",
      contractTime: "Contract Time",
      accessDenied: "You do not have permission to access this page",
      loadingText: "Loading...",
      pdfLoadingText: "Generating PDF...",
      textAlign: "text-left",
      justifyContent: "!justify-start",
    },
    3: {
      // عربی
      lang: "ar",
      dir: "rtl",
      mainTitle: "جواز سفر",
      contractNumber: "رقم العقد",
      issueDate: "تاريخ الإصدار",
      contractTime: "وقت العقد",
      accessDenied: "ليس لديك إذن للوصول إلى هذه الصفحة",
      loadingText: "جاري التحميل...",
      pdfLoadingText: "جاري إنشاء PDF...",
      textAlign: "text-right",
      justifyContent: "!justify-end",
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

  if (htmlRoot) {
    htmlRoot.setAttribute("lang", t.lang);
    htmlRoot.setAttribute("dir", t.dir);
  }

  if (body) {
    body.setAttribute("dir", t.dir);
    body.className =
      body.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
  }

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

    const contractNumberLabel = document.getElementById(
      "contract-number-label"
    );
    if (contractNumberLabel) {
      contractNumberLabel.innerHTML = `${t.contractNumber}<span>:</span>`;
      contractNumberLabel.className =
        contractNumberLabel.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    const issueDateLabel = document.getElementById("issue-date-label");
    if (issueDateLabel) {
      issueDateLabel.innerHTML = `${t.issueDate}<span>:</span>`;
      issueDateLabel.className =
        issueDateLabel.className.replace(/(text-left|text-right)/g, "") +
        ` ${t.textAlign}`;
    }

    const contractTimeLabel = document.getElementById("contract-time-label");
    if (contractTimeLabel) {
      contractTimeLabel.innerHTML = `${t.contractTime}<span>:</span>`;
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

function checkImagesLoaded() {
  const images = document.querySelectorAll("img");
  let loadedCount = 0;
  const totalImages = images.length;

  if (totalImages === 0) {
    // اگر تصویری نیست، این بخش کامل است
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
  // Fallback برای مرورگرهای قدیمی
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function checkContentLoaded() {
  // بررسی اینکه آیا API call ها کامل شده‌اند
  const checkApiInterval = setInterval(() => {
    // بررسی وجود داده‌های API در DOM
    const hasApiContent = document.querySelector(
      '[datamembername="db.visa_pdf"]'
    );
    const hasGeneratedContent = document.querySelector("h1"); // محتوای تولید شده

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
    // مخفی کردن لودینگ
    loadingScreen.classList.add("hidden");

    // نمایش محتوای اصلی
    setTimeout(() => {
      mainContent.classList.add("loaded");
      loadingScreen.style.display = "none";
    }, 500);
  }
}

// در صورت خطا، حداکثر بعد از 15 ثانیه لودینگ را مخفی کن
setTimeout(() => {
  if (!isContentLoaded) {
    console.warn("Loading timeout - forcing content display");
    isContentLoaded = true;
    isMinTimeElapsed = true;
    apiDataLoaded = true;
    checkLoadingComplete();
  }
}, 15000);

// Hook برای basis system - زمانی که API اجرا شد
window.onBasisApiComplete = function () {
  apiDataLoaded = true;
  checkAllResourcesLoaded();
};

// Hook جایگزین برای تشخیص تکمیل محتوا
window.addEventListener("load", function () {
  setTimeout(() => {
    if (!apiDataLoaded) {
      apiDataLoaded = true;
      checkAllResourcesLoaded();
    }
  }, 500);
});

async function RenderInfoCardVisa($data, lang) {
  let VisaJson = $data;
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

  if (!VisaJson || !VisaJson.visainfo) {
    console.error("Invalid hotel data:", VisaJson);
    return `<div class="text-red-500 ${t.textAlign}" dir="${t.dir}">${t.error}</div>`;
  }

  const visa = VisaJson.visainfo;
  let infocard = `<h1 class="text-lg font-danademibold text-center" dir="${t.dir}">${visa.visaname}</h1>
        <div class="flex text-sm" dir="${t.dir}">
            <span class="text-sm font-danademibold ${t.textAlign}">${visa.visacountry}</span>
        </div>`;

  return infocard;
}

async function renderRulesVisa($data, lang) {
  const rules = $data?.note;

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

  let direction = detectDirection(rules) || t.dir;

  let ulitem = "";
  rules.forEach((item, index) => {
    const text = item.trim();

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

async function renderVisaInfo($data, lang) {
  let product_info = $data?.product_info;

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات ویزا",
      visaName: "نام ویزا <br/> Visa Name",
      country: "کشور <br/> Country",
      application: "کاربرد ویزا <br/> Application",
      visaType: "نوع ویزا <br/> Visa Type",
      visitLog: "دفعات ورود <br/> Visit Log",
      validity: "مدت اعتبار <br/> Validity Duration",
      documents: "مدارک مورد نیاز <br/> Documents",
      date: "تاریخ <br/> Date",
      dir: "rtl",
      textAlign: "text-right",
      marginside: "mr-4",
            centerText: "text-center"

    },
    2: {
      // انگلیسی
      title: "Visa Information",
      visaName: "Visa Name",
      country: "Country",
      application: "Application",
      visaType: "Visa Type",
      visitLog: "Visit Log",
      validity: "Validity Duration",
      documents: "Documents",
      date: "Date",
      dir: "ltr",
      textAlign: "text-left",
      marginside: "ml-4",
            centerText: "text-center"

    },
    3: {
      // عربی
      title: "معلومات التأشيرة",
      visaName: "اسم التأشيرة",
      country: "البلد",
      application: "تطبيق التأشيرة",
      visaType: "نوع التأشيرة",
      visitLog: "سجل الزيارة",
      validity: "مدة الصلاحية",
      documents: "الوثائق المطلوبة",
      date: "التاريخ",
      dir: "rtl",
      textAlign: "text-right",
      marginside: "mr-4",
            centerText: "text-center"

    },
  };

  // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
  const t = translations[lang] || translations[1];

  // تبدیل آرایه مدارک به لیست HTML
  const documentsList = product_info?.documents?.length
    ? `<ul class="list-disc pr-4 ${t.centerText}">${
        product_info.documents
          .map((doc) => `<li class="text-[#292929] text-sm font-danademibold">${doc.name1 || "–"}</li>`)
          .join("")
      }</ul>`
    : "–";


  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 ">
        <div class="flex justify-between gap-4 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.visaName}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.visaname || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.country}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.visacountry || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.application}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.application || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.visaType}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.visatype || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.visitLog}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.visit_log || "–"}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.validity}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText}">
                    ${product_info.validity_duration ? `${product_info.validity_duration.time} ${product_info.validity_duration.months}` : "–"}
                </div>
            </div>
            </div>
            <div class=" flex !justify-start gap-4 mt-4 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col ">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.documents}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.centerText} ${t.marginside}">
                    ${documentsList}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.date}</span>
                <div class="text-[#292929] text-sm font-danademibold dir-${t.dir} ${t.centerText}">
                    <span>${product_info.dateinfo?.mstring || "–"}</span>
                    ${lang === 1 ? `<span>(${product_info.dateinfo?.sstring || "–"})</span>` : ""}
                </div>
            </div>
        </div>
        </div>
    `;
}

async function renderVisaPassengerInfo($data, lang) {
  const visainfo = $data?.visainfo;
  const passengers = $data?.passengerinfo || [];

  // تعریف ترجمه‌ها برای هر زبان
  const translations = {
    1: {
      // فارسی
      title: "اطلاعات مسافران",
      row: "ردیف <br/> NO",
      passengers: "نام / نام خانوادگی <br/> SURNAME / NAME",
      fathername: "نام پدر <br/> Father Name",
      gender: "جنسیت <br/> Gender",
      birthdate: "تاریخ تولد <br/> Birthdate",
      nationality: "ملیت <br/> Nationality",
      countryOfBirth: "کشور محل تولد <br/> Country of Birth",
      countryOfPassportIssue: "کشور صدور پاسپورت <br/> Country of Passport Issue",
      age: "سن <br/> Age",
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
      fathername: "Father Name",
      gender: "Gender",
      birthdate: "Birthdate",
      nationality: "Nationality",
      countryOfBirth: "Country of Birth",
      countryOfPassportIssue: "Country of Passport Issue",
      age: "Age",
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
      fathername: "اسم الأب",
      gender: "الجنس",
      birthdate: "تاريخ الميلاد",
      nationality: "الجنسية",
      countryOfBirth: "بلد الميلاد",
      countryOfPassportIssue: "بلد إصدار جواز السفر",
      age: "العمر",
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
    const info = p.visa_passenger;
    return {
      name: `${info.fullname.firstname?.trim() || ""} ${info.fullname.lastname?.trim() || ""}`,
      fathername: info.fathername || "–",
      gender: info.gender || "–",
      birthdate: info.birthdate?.birthdate1 || "–",
      nationality: info.countryofresidence?.countryname || "–",
      countryOfBirth: info.Countryofbirth?.countryname || "–",
      countryOfPassportIssue: info.countryofpassportissue?.countryname || "–",
      age: info.type || "–"  ,
    };
  });


  const passengerNames = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.name}</h2>`)
    .join("");

  const passengerFatherNames = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.fathername}</h2>`)
    .join("");

  const passengerGenders = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.gender == "1" ? t.male : t.female}</h2>`)
    .join("");

  const passengerBirthdates = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.birthdate}</h2>`)
    .join("");

  const passengerNationalities = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.nationality}</h2>`)
    .join("");

  const passengerCountriesOfBirth = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.countryOfBirth}</h2>`)
    .join("");

  const passengerCountriesOfPassportIssue = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.countryOfPassportIssue}</h2>`)
    .join("");

  const passengerAges = parsedPassengers
    .map((p) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${p.age}</h2>`)
    .join("");

  const rowNumbers = parsedPassengers
    .map((_, index) => `<h2 class="text-[#292929] text-sm font-danademibold ${t.centerText}">${index + 1}</h2>`)
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-2 max-sm:flex-col max-sm:flex-wrap max-sm:justify-center" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.row}</span>
                ${rowNumbers}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.passengers}</span>
                ${passengerNames}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.fathername}</span>
                ${passengerFatherNames}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.gender}</span>
                ${passengerGenders}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.birthdate}</span>
                ${passengerBirthdates}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.nationality}</span>
                ${passengerNationalities}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.countryOfBirth}</span>
                ${passengerCountriesOfBirth}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.countryOfPassportIssue}</span>
                ${passengerCountriesOfPassportIssue}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.centerText}">${t.age}</span>
                ${passengerAges}
            </div>
        </div>
    `;
}

// async function renderServiceInfoVisa($data, lang) {
//   const visainfo = $data?.visainfo;
//   const services = $data?.serviceinfo || [];

//   // تعریف ترجمه‌ها برای هر زبان
//   const translations = {
//     1: {
//       // فارسی
//       title: "اطلاعات خدمات",
//       serviceName: "نام خدمات <br/> Service Name",
//       count: "تعداد <br/> Count",
//       description: "توضیحات <br/> Description",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//     2: {
//       // انگلیسی
//       title: "Service Information",
//       serviceName: "Service Name",
//       count: "Count",
//       description: "Description",
//       dir: "ltr",
//       textAlign: "text-left",
//     },
//     3: {
//       // عربی
//       title: "معلومات الخدمات",
//       serviceName: "اسم الخدمة",
//       count: "العدد",
//       description: "الوصف",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//   };

//   // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
//   const t = translations[lang] || translations[1];

//   const serviceNames = services
//     .map(
//       (s) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           s.service.servicename || "–"
//         }</h2>`
//     )
//     .join("");

//   const serviceDescriptions = services
//     .map(
//       (s) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           s.service.des_service || "–"
//         }</h2>`
//     )
//     .join("");

//   const serviceCount = services
//     .map(
//       (s) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           s.service.count || "–"
//         }</h2>`
//     )
//     .join("");

//   return `
//         <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
//         <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.serviceName}</span>
//                 ${serviceNames}
//             </div>
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.count}</span>
//                 ${serviceCount}
//             </div>
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.description}</span>
//                 ${serviceDescriptions}
//             </div>
//         </div>
//     `;
// }

// async function renderTransferInfoVisa($data, lang) {
//   const transfers = $data?.transferinfo || [];

//   // تعریف ترجمه‌ها برای هر زبان
//   const translations = {
//     1: {
//       // فارسی
//       title: "اطلاعات ترنسفر",
//       carName: "نام خودرو <br/> Car Name",
//       address: "آدرس <br/> Address",
//       time: "زمان <br/> Time",
//       phone: "شماره تماس <br/> Phone Number",
//       description: "توضیحات <br/> Description",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//     2: {
//       // انگلیسی
//       title: "Transfer Information",
//       carName: "Car Name",
//       address: "Address",
//       time: "Time",
//       phone: "Phone Number",
//       description: "Description",
//       dir: "ltr",
//       textAlign: "text-left",
//     },
//     3: {
//       // عربی
//       title: "معلومات النقل",
//       carName: "اسم السيارة",
//       address: "العنوان",
//       time: "الوقت",
//       phone: "رقم الهاتف",
//       description: "الوصف",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//   };

//   // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
//   const t = translations[lang] || translations[1];

//   const carNames = transfers
//     .map(
//       (t) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           t.transfer?.car_name || "–"
//         }</h2>`
//     )
//     .join("");

//   const addresses = transfers
//     .map(
//       (t) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           t.transfer?.address || "–"
//         }</h2>`
//     )
//     .join("");

//   const times = transfers
//     .map(
//       (t) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           t.transfer?.time || "–"
//         }</h2>`
//     )
//     .join("");

//   const phones = transfers
//     .map(
//       (t) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           t.transfer?.phone || "–"
//         }</h2>`
//     )
//     .join("");

//   const descriptions = transfers
//     .map(
//       (t) =>
//         `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${
//           t.transfer?.des_transfer || "–"
//         }</h2>`
//     )
//     .join("");

//   return `
//         <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
//         <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.carName}</span>
//                 ${carNames}
//             </div>
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.address}</span>
//                 ${addresses}
//             </div>
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.time}</span>
//                 ${times}
//             </div>
//             <div class="flex flex-col gap-2">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.phone}</span>
//                 ${phones}
//             </div>
//             <div class="flex flex-col gap-2 col-span-full">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.description}</span>
//                 ${descriptions}
//             </div>
//         </div>
//     `;
// }

// async function renderEscortInfoVisa($data, lang) {
//   const escorts = $data?.escortinfo || [];

//   // تعریف ترجمه‌ها برای هر زبان
//   const translations = {
//     1: {
//       // فارسی
//       title: "اطلاعات اسکورت",
//       escortName: "نام اسکورت <br/> Escort Name",
//       gender: "جنسیت <br/> Gender",
//       male: "مرد",
//       female: "زن",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//     2: {
//       // انگلیسی
//       title: "Escort Information",
//       escortName: "Escort Name",
//       gender: "Gender",
//       male: "Male",
//       female: "Female",
//       dir: "ltr",
//       textAlign: "text-left",
//     },
//     3: {
//       // عربی
//       title: "معلومات المرافق",
//       escortName: "اسم المرافق",
//       gender: "الجنس",
//       male: "ذكر",
//       female: "أنثى",
//       dir: "rtl",
//       textAlign: "text-right",
//     },
//   };

//   // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
//   const t = translations[lang] || translations[1];

//   const escortNames = escorts
//     .map((e) => {
//       const { firsname, lastname } = e.escort || {};
//       return `<h2 class="text-[#292929] text-sm font-danademibold ${
//         t.textAlign
//       }">${firsname || ""} ${lastname || ""}</h2>`;
//     })
//     .join("");

//   const escortGenders = escorts
//     .map((e) => {
//       const gender = e.escort?.gender === "1" ? t.male : t.female;
//       return `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${gender}</h2>`;
//     })
//     .join("");

//   return `
//         <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
//         <div class="bg-[#F4F4F4] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
//             <div class="flex flex-col gap-2 w-1/2 justify-center items-center">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.escortName}</span>
//                 ${escortNames}
//             </div>
//             <div class="flex flex-col gap-2 w-1/2 justify-center items-center">
//                 <span class="text-[#6D6D6D] text-xs font-danaregular text-nowrap ${t.textAlign}">${t.gender}</span>
//                 ${escortGenders}
//             </div>
//         </div>
//     `;
// }

// ----------------------------- Visa PDF --------------------------------
