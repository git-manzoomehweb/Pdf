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
      mainTitle: "خدمات",
      contractNumber: "شماره قرارداد",
      issueDate: "تاریخ صدور",
      contractTime: "ساعت قرارداد",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری...",
      pdfLoadingText: "در حال تولید PDF...",
      textAlign: "text-right",
      justifyContent: "justify-end",
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
      loadingText: "Loading...",
      pdfLoadingText: "Generating PDF...",
      textAlign: "text-left",
      justifyContent: "justify-start",
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
      justifyContent: "justify-end",
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
      headerSection.className.replace(/(justify-start|justify-end)/g, "") +
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
  }, 100);
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
  console.log("Basis API completed");
  apiDataLoaded = true;
  checkAllResourcesLoaded();
};

// Hook جایگزین برای تشخیص تکمیل محتوا
window.addEventListener("load", function () {
  setTimeout(() => {
    if (!apiDataLoaded) {
      console.log("Window load event triggered");
      apiDataLoaded = true;
      checkAllResourcesLoaded();
    }
  }, 500);
});

// async function RenderServiceCard($data) {
//   const service = $data?.serviceinfo;
//   if (!service) {
//     console.error("serviceinfo is missing", $data);
//     return '<div class="text-red-500">اطلاعات سرویس موجود نیست</div>';
//   }

//   return `
//         <h1 class="text-lg font-danademibold text-center w-full border-b-2 border-[#E3E3E3] mb-4 pb-2">${
//           service.servicegroupname
//         }</h1>

//         <div class="justify-between flex items-center">
//             <h2 class="text-base font-danademibold text-center">${
//               service.servicename
//             }</h2>
//             <div class="flex justify-center gap-2 text-sm font-danaregular mt-2">
//                 <div>شهر: ${service.city}</div>
//                 <div>|</div>
//                 <div>تاریخ: 
//                     <span class="dir-ltr inline-block mx-1">
//                         ${service.traveldate?.mstring || ""}
//                     </span>
//                     <span class="dir-ltr inline-block mx-1">
//                         (${service.traveldate?.sstring || ""})
//                     </span>
//                     </div>
//             </div>
//         </div>
    
//     `;
// }

async function RenderServicePassengers($data) {
  const passengers = $data?.passengerinfo;
  if (!passengers || passengers.length === 0) {
    return '<div class="text-gray-500 mt-3">اطلاعات مسافران موجود نیست.</div>';
  }

  const parsedPassengers = passengers.map((p) => {
    const info = p.service_passenger;
    return {
      name: `${info.fullname.firstname?.trim() || ""} ${
        info.fullname.lastname?.trim() || ""
      }`,
      type: info.type === "adult" ? "بزرگسال" : "کودک",
      gender: info.gender === "1" ? "مرد" : "زن",
      birthdate: info.birthdate?.birthdate1 || "–",
    };
  });

  const passengerNames = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold text-nowrap">${p.name}</h2>`
    )
    .join("");

  const passengerTypes = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold text-center">${p.type}</h2>`
    )
    .join("");

  const passengerGender = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold text-center">${p.gender}</h2>`
    )
    .join("");

  const passengerBirthdates = parsedPassengers
    .map(
      (p) =>
        `<h2 class="text-[#292929] text-sm font-danademibold dir-ltr text-center text-nowrap">${p.birthdate}</h2>`
    )
    .join("");

  return `
        <h2 class="font-bold text-lg my-2 font-danabold">اطلاعات مسافران</h2>

        <div class="bg-[#F4F4F4] rounded-xl p-4 flex justify-between gap-4 overflow-x-auto">

            <div class="gap-y-2 flex flex-col">
                <span class="bg-[#F4F4F4] text-sm font-danaregular">مسافران</span>
                ${passengerNames}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="bg-[#F4F4F4] text-sm font-danaregular text-nowrap text-center">نوع مسافر</span>
                ${passengerTypes}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="bg-[#F4F4F4] text-sm font-danaregular text-center">جنسیت</span>
                ${passengerGender}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="bg-[#F4F4F4] text-sm font-danaregular text-center">تاریخ تولد</span>
                ${passengerBirthdates}
            </div>
        </div>
    `;
}

async function RenderServiceRules($data) {
  const rule = $data?.rule?.rule;
  if (!rule) {
    return '<div class="text-gray-500">قوانینی ثبت نشده است.</div>';
  }

  // تبدیل قوانین به لیست
  const rules = rule.split(/\r?\n|\r/).filter((line) => line.trim().length > 0);

  let items = rules.map((r) => `<li>${fixRTLTextCompletely(r)}</li>`).join("");

  return `
            <ul class="list-none pl-5 text-sm text-right" dir="rtl">${items}</ul>
    `;
}

async function RenderServiceCardBox($data) {
  const service = $data?.serviceinfo;
  if (!service) return "";

  return `
            <h2 class="font-bold text-lg my-2 font-danabold">اطلاعات خدمات</h2>

        <div class="bg-[#F4F4F4] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div class="flex justify-between gap-4 text-sm bg-[#F4F4F4] font-danaregular">
                <div class="flex flex-col">
                    <span class="bg-[#F4F4F4]">عنوان </span>
                    <span class="text-[#292929] font-danademibold">${
                      service.servicename
                    }</span>
                </div>
                <div class="flex flex-col">
                    <span class="bg-[#F4F4F4]">شهر</span>
                    <span class="text-[#292929] font-danademibold">${
                      service.city || "—"
                    }</span>
                </div>

                <div class="flex flex-col">
                    <span class="bg-[#F4F4F4]">تاریخ</span>
                    <span class="text-[#292929] font-danademibold dir-ltr text-nowrap">${
                      service.traveldate?.sstring || "—"
                    }</span>
                </div>
            </div>
        </div>
    `;
}
