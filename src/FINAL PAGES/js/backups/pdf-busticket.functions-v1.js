// loading
// متغیرهای کنترل لودینگ
let loadingStartTime = Date.now();
let isContentLoaded = false;
let isMinTimeElapsed = false;
let apiDataLoaded = false;
const MIN_LOADING_TIME = 4000; // 4 ثانیه حداقل
let mainlid;
let invoiceType;
let  translations;


function setlid(lid, invoice = null) {
  mainlid = lid;
  invoiceType = invoice;
  ensureTranslationsReady(); // اضافه کردن این خط

}

function barDirection(lid) {
    if (lid == 2) {
        return `dir-ltr`
    } else {
        return `dir-rtl`
    }
}

function barArrowRotation(lid){
    if (lid == 2) {
        return `rotate-0`
    } else {
        return `rotate-180`
    }
}


function formatPrice(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initializePageLanguage(lid, invoice = null) {
  translations = {
    1: {
      // فارسی
      lang: "fa",
      dir: "rtl",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری",
      pdfLoadingText: "در حال تولید PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
      // ترجمه‌های مشترک
      electronTicket: "بلیط الکترونیکی",
      downloadPdf: "دانلود PDF",
      hidePrice: "مخفی کردن قیمت",
      showPrice: "نمایش قیمت",
      invoiceNumber: "شماره فاکتور",
      pnrCode: "کد PNR",
      eticketNumber: "شماره بلیط الکترونیکی",
      dateOfIssue: "تاریخ صدور",
      passenger: "مسافر",
      age: "سن",
      birthdate: "تاریخ تولد",
      nationalCode: "کد ملی",
      priceDetails: "جزئیات قیمت",
      basePrice: "قیمت پایه",
      tax: "مالیات",
      total: "مجموع",
      extraService: "خدمات اضافی",
      fareConditions: "شرایط کرایه",
      connectionTime: "زمان انتظار",
      travelTime: "مدت سفر",
      route: "مسیر",
      departure: "رفت",
      return: "برگشت",
      adult: "بزرگسال",
      child: "کودک",
      infant: "نوزاد",
      // ترجمه‌های قطار
      trainNumber: "شماره قطار",
      // ترجمه‌های پرواز
      flightNumber: "شماره پرواز",
      airline: "ایرلاین",
      aircraft: "هواپیما",
      flightTime: "زمان پرواز",
      gate: "گیت",
      terminal: "ترمینال",
      seat: "صندلی",
      cabin: "کابین",
      baggage: "بار",
      checkedBag: "چمدان",
      carryOn: "کیف دستی"
    },
    2: {
      // انگلیسی
      lang: "en",
      dir: "ltr",
      accessDenied: "You do not have permission to access this page",
      loadingText: "Loading",
      pdfLoadingText: "Generating PDF",
      textAlign: "text-left",
      justifyContent: "!justify-start",
      // ترجمه‌های مشترک
      electronTicket: "Electronic Ticket",
      downloadPdf: "Download PDF",
      hidePrice: "Hide Price",
      showPrice: "Show Price",
      invoiceNumber: "Invoice Number",
      pnrCode: "PNR Code",
      eticketNumber: "ETicket Number",
      dateOfIssue: "Date Of Issue",
      passenger: "Passenger",
      age: "Age",
      birthdate: "Birthdate",
      nationalCode: "National Code",
      priceDetails: "Price Details",
      basePrice: "Base Price",
      tax: "Tax",
      total: "Total",
      extraService: "Extra Service",
      fareConditions: "Fare Conditions",
      connectionTime: "Connection Time",
      travelTime: "Travel Time",
      route: "Route",
      departure: "Departure",
      return: "Return",
      adult: "Adult",
      child: "Child",
      infant: "Infant",
      // ترجمه‌های قطار
      trainNumber: "Train Number",
      // ترجمه‌های پرواز
      flightNumber: "Flight Number",
      airline: "Airline",
      aircraft: "Aircraft",
      flightTime: "Flight Time",
      gate: "Gate",
      terminal: "Terminal",
      seat: "Seat",
      cabin: "Cabin",
      baggage: "Baggage",
      checkedBag: "Checked Bag",
      carryOn: "Carry On"
    },
    3: {
      // عربی
      lang: "ar",
      dir: "rtl",
      accessDenied: "ليس لديك إذن للوصول إلى هذه الصفحة",
      loadingText: "جاري التحميل",
      pdfLoadingText: "جاري إنشاء PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
      // ترجمه‌های مشترک
      electronTicket: "التذكرة الإلكترونية",
      downloadPdf: "تحميل PDF",
      hidePrice: "إخفاء السعر",
      showPrice: "إظهار السعر",
      invoiceNumber: "رقم الفاتورة",
      pnrCode: "رمز PNR",
      eticketNumber: "رقم التذكرة الإلكترونية",
      dateOfIssue: "تاريخ الإصدار",
      passenger: "المسافر",
      age: "العمر",
      birthdate: "تاريخ الميلاد",
      nationalCode: "الرقم الوطني",
      priceDetails: "تفاصيل السعر",
      basePrice: "السعر الأساسي",
      tax: "الضريبة",
      total: "المجموع",
      extraService: "خدمة إضافية",
      fareConditions: "شروط الأجرة",
      connectionTime: "وقت الانتظار",
      travelTime: "وقت السفر",
      route: "المسار",
      departure: "المغادرة",
      return: "العودة",
      adult: "بالغ",
      child: "طفل",
      infant: "رضيع",
      // ترجمه‌های قطار
      trainNumber: "رقم القطار",
      // ترجمه‌های پرواز
      flightNumber: "رقم الرحلة",
      airline: "شركة الطيران",
      aircraft: "الطائرة",
      flightTime: "وقت الرحلة",
      gate: "البوابة",
      terminal: "المحطة",
      seat: "المقعد",
      cabin: "المقصورة",
      baggage: "الأمتعة",
      checkedBag: "الحقيبة المسجلة",
      carryOn: "الحقيبة اليدوية"
    },
  };

  const t = translations[lid] || translations[1];
  window.currentTranslations = t;

  // تنظیم attributes اصلی HTML
  const mainContent = document.getElementById("main-content-wrapper");
  const headerSection = document.getElementById("header-section");
  const accessDeniedMessage = document.getElementById("access-denied-message");
  const pdfLoadingText = document.getElementById("pdf-loading-text");
  const mainLoadingText = document.getElementById("main-loading-text");

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

  // تنظیم متون ثابت برای همه نوع‌های invoice
  setTimeout(() => {
    translatePageElements(t, invoice);

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
  }, 4000);
}

function translatePageElements(t, invoice = null) {
  // ترجمه عنوان صفحه
  const electronTicketTitle = document.querySelector('.font-danabold.text-xl');
  if (electronTicketTitle && electronTicketTitle.textContent.includes('Electronic Ticket')) {
    electronTicketTitle.textContent = t.electronTicket;
  }

  // ترجمه دکمه دانلود PDF
  const downloadBtn = document.querySelector('button[onclick="generatePDF()"]');
  if (downloadBtn) {
    const btnText = downloadBtn.querySelector('svg').nextSibling;
    if (btnText && btnText.textContent.trim() === 'Download PDF') {
      btnText.textContent = ` ${t.downloadPdf}`;
    }
  }

  // ترجمه دکمه قیمت
  const priceBtn = document.querySelector('button[onclick="togglePrice(this)"] .button-content-text');
  if (priceBtn) {
    if (priceBtn.textContent.trim() === 'Hide Price') {
      priceBtn.textContent = t.hidePrice;
    } else if (priceBtn.textContent.trim() === 'Show Price') {
      priceBtn.textContent = t.showPrice;
    }
  }

  // ترجمه عناوین header
  translateHeaderTitles(t);

  // ترجمه عناوین ticket
  translateTicketTitles(t, invoice);

  // ترجمه عناوین قیمت
  translatePriceTitles(t);

  // ترجمه شرایط کرایه
  const fareConditionsTitle = document.querySelector('h3.fare-condition');
  if (fareConditionsTitle && fareConditionsTitle.textContent.includes('Fare Conditions')) {
    fareConditionsTitle.textContent = t.fareConditions;
  }

  // ترجمه عناوین مسیر برای پروازها
  translateFlightSpecificElements(t, invoice);
}

function translateHeaderTitles(t) {
  // ترجمه عناوین در header
  const headerTitles = document.querySelectorAll('.header__details__container__item__title');
  headerTitles.forEach(title => {
    const text = title.textContent.trim();
    switch(text) {
      case 'invoice number':
        title.textContent = t.invoiceNumber;
        break;
      case 'PNR Code':
        title.textContent = t.pnrCode;
        break;
      case 'ETicket Number':
        title.textContent = t.eticketNumber;
        break;
      case 'Date Of issue:':
        title.textContent = t.dateOfIssue + ':';
        break;
    }
  });
}

function translateTicketTitles(t, invoice = null) {
  // ترجمه عناوین در ticket
  const ticketTitles = document.querySelectorAll('.ticketContainer__details__head__item__title');
  ticketTitles.forEach(title => {
    const text = title.textContent.trim();
    switch(text) {
      case 'Passenger:':
        title.textContent = t.passenger + ':';
        break;
      case 'Age':
      case 'Age:':
        title.textContent = t.age + ':';
        break;
      case 'Birthdate:':
        title.textContent = t.birthdate + ':';
        break;
      case 'National Code:':
        title.textContent = t.nationalCode + ':';
        break;
    }
  });

  // ترجمه متن‌های Route
  const routeTitles = document.querySelectorAll('.ticketContainer__details__time');
  routeTitles.forEach(route => {
    if (route.textContent.includes('Route')) {
      route.textContent = route.textContent.replace('Route', t.route);
    }
    if (route.textContent.includes('Departure')) {
      route.textContent = route.textContent.replace('Departure', t.departure);
    }
    if (route.textContent.includes('Return')) {
      route.textContent = route.textContent.replace('Return', t.return);
    }
  });

  // ترجمه Connection Time و Travel Time
  const connectionTimeElements = document.querySelectorAll('.text-xs.text-gray-500.font-danabold');
  connectionTimeElements.forEach(element => {
    if (element.textContent.trim() === 'Connection Time') {
      element.textContent = t.connectionTime;
    }
    if (element.textContent.trim() === 'Travel Time') {
      element.textContent = t.travelTime;
    }
  });

  // ترجمه مختص قطار
  if (invoice === 8 || invoice === 9) {
    const trainNumberElements = document.querySelectorAll('span');
    trainNumberElements.forEach(element => {
      if (element.textContent.includes('train number:')) {
        element.innerHTML = element.innerHTML.replace('train number:', t.trainNumber + ':');
      }
    });
  } else {
    // ترجمه مختص پرواز
    const flightNumberElements = document.querySelectorAll('span');
    flightNumberElements.forEach(element => {
      if (element.textContent.includes('flight number:')) {
        element.innerHTML = element.innerHTML.replace('flight number:', t.flightNumber + ':');
      }
    });
  }
}

function translateFlightSpecificElements(t, invoice = null) {
  // ترجمه عناصر مختص پرواز (برای همه انواع invoice غیر از 8 و 9)
  if (invoice !== 8 && invoice !== 9) {
    // ترجمه airline details
    const airlineElements = document.querySelectorAll('.pathItem__details__airline span');
    airlineElements.forEach(element => {
      if (element.textContent.includes('flight number:')) {
        element.textContent = element.textContent.replace('flight number:', t.flightNumber + ':');
      }
    });

    // ترجمه baggage info
    const baggageElements = document.querySelectorAll('span');
    baggageElements.forEach(element => {
      if (element.textContent.includes('Checked Bag') || element.textContent.includes('CheckedBag')) {
        element.textContent = element.textContent.replace(/Checked ?Bag/g, t.checkedBag);
      }
    });
  }
}

function translatePriceTitles(t) {
  // ترجمه عناوین قیمت
  const priceDetailsTitle = document.querySelector('h3.font-danabold');
  if (priceDetailsTitle && priceDetailsTitle.textContent.trim() === 'Price Details') {
    priceDetailsTitle.textContent = t.priceDetails;
  }

  const extraServiceTitle = document.querySelectorAll('h3.font-danabold')[1];
  if (extraServiceTitle && extraServiceTitle.textContent.trim() === 'Extra Service') {
    extraServiceTitle.textContent = t.extraService;
  }

  // ترجمه Base Price, Tax, Total
  const priceLabels = document.querySelectorAll('.ticketContainer__info__details__title');
  priceLabels.forEach(label => {
    const text = label.textContent.trim();
    if (text.includes('Base Price:')) {
      label.innerHTML = label.innerHTML.replace('Base Price:', t.basePrice + ':');
    }
    if (text.includes('Tax:')) {
      label.innerHTML = label.innerHTML.replace('Tax:', t.tax + ':');
    }
    if (text.includes('Total:')) {
      label.innerHTML = label.innerHTML.replace('Total:', t.total + ':');
    }
  });
}

// بهبود تابع togglePrice برای پشتیبانی از چندزبانه
function togglePrice(element) {
  const textSpan = element.querySelector(".button-content-text");
  const t = window.currentTranslations || translations[2]; // پیش‌فرض انگلیسی
  
  if (textSpan.textContent.trim() === t.hidePrice || textSpan.textContent.trim() === "Hide Price") {
    textSpan.textContent = t.showPrice;
    document.querySelector(".ticketContainer__info__details_PriceBox").classList.add("hidden");
  } else {
    textSpan.textContent = t.hidePrice;
    document.querySelector(".ticketContainer__info__details_PriceBox").classList.remove("hidden");
  }
}



async function passenger_type(typedata, lid) {
  try {
      // تابع helper برای انتظار تا translations آماده شود
      const waitForTranslations = async (maxWait = 5000) => {
          const startTime = Date.now();
          while (!translations && (Date.now() - startTime) < maxWait) {
              await new Promise(resolve => setTimeout(resolve, 100));
          }
          return translations;
      };

      // صبر تا translations آماده شود
      await waitForTranslations();

      // مقدار پیش‌فرض
      const defaultValue = "مسافر";
      
      // بررسی پارامترها
      if (typedata == null || typedata === undefined || typedata === '') {
          console.warn("typedata is invalid:", typedata);
          return defaultValue;
      }
      
      if (!lid || (Array.isArray(lid) && lid.length === 0)) {
          console.warn("lid is invalid:", lid);
          return defaultValue;
      }
      
      // تبدیل lid به عدد اگر آرایه است
      const lidValue = Array.isArray(lid) ? lid[0] : lid;
      
      // بررسی موجودیت translations
      if (!translations || !translations[lidValue]) {
          console.warn(`Translation for lid ${lidValue} not found`);
          return defaultValue;
      }
      
      const trns = translations[lidValue];
      
      // تبدیل typedata به string برای مقایسه دقیق‌تر
      const type = String(typedata).trim();
      
      // بازگرداندن مقدار بر اساس نوع با fallback
      switch (type) {
          case "0":
              return trns.infant || "نوزاد";
          case "1":
              return trns.child || "کودک";
          case "2":
              return trns.adult || "بزرگسال";
          default:
              console.warn("Invalid typedata:", typedata);
              return defaultValue;
      }
      
  } catch (e) {
      console.error("Error in passenger_type:", e);
      // fallback بر اساس typedata
      const type = String(typedata || '').trim();
      switch (type) {
          case "0": return "نوزاد";
          case "1": return "کودک"; 
          case "2": return "بزرگسال";
          default: return "مسافر";
      }
  }
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

// function checkContentLoaded() {
//   const checkApiInterval = setInterval(() => {
//     const hasApiContent = document.querySelector(
//       '[datamembername="db.ticket_pdf"]' // برای ticket
//     );
//     const hasGeneratedContent = document.querySelector("h1");

//     if (hasApiContent && hasGeneratedContent) {
//       apiDataLoaded = true;
//       clearInterval(checkApiInterval);
//       checkAllResourcesLoaded();
//     }
//   }, 100);

//   setTimeout(() => {
//     if (!apiDataLoaded) {
//       apiDataLoaded = true;
//       clearInterval(checkApiInterval);
//       checkAllResourcesLoaded();
//     }
//   }, 10000);
// }

// busss
function checkContentLoaded() {
  const checkApiInterval = setInterval(() => {
      const hasApiContent = document.querySelector('[datamembername="db.ticket_pdf"]');
      const hasGeneratedContent = document.querySelector("h1");
      const hasPassengerData = window.$data?.passenger?.passengerinfo.type; // اضافه کردن این چک

      if (hasApiContent && hasGeneratedContent && hasPassengerData) {
          apiDataLoaded = true;
          clearInterval(checkApiInterval);
          
          // اطمینان از آماده بودن translations
          ensureTranslationsReady();
          
          checkAllResourcesLoaded();
      }
  }, 100);

  setTimeout(() => {
      if (!apiDataLoaded) {
          apiDataLoaded = true;
          clearInterval(checkApiInterval);
          ensureTranslationsReady(); // اضافه کردن این خط
          checkAllResourcesLoaded();
      }
  }, 10000);
}

async function checkAllResourcesLoaded() {
  try {
    await Promise.all([checkImagesLoaded(), checkFontsLoaded()]);

    initializePageLanguage(mainlid, invoiceType);
    initializeLoadingSystem();

    isContentLoaded = true;
    checkLoadingComplete();
  } catch (error) {
    console.warn("خطا در لود resources", error);
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
  const mainContentpdf = document.getElementById("main-content");

  if (loadingScreen && mainContent) {
    loadingScreen.classList.add("hidden");
    mainContent.classList.add("loaded");
    loadingScreen.style.display = "none";

    setTimeout(() => {
      if(mainlid == 2){
        mainContentpdf.classList.add("dir-ltr");
      }else{
        mainContentpdf.classList.add("dir-rtl");
      }
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

// این تابع را در فایل اصلی جاوااسکریپت خود قرار دهید
function togglePrice(element) {
    const textSpan = element.querySelector(".button-content-text");
    const t = window.currentTranslations || {
        hidePrice: "Hide Price",
        showPrice: "Show Price"
    };
    
    const currentText = textSpan.textContent.trim();
    
    // بررسی متن فعلی در هر دو زبان ممکن
    if (currentText === t.hidePrice || currentText === "Hide Price") {
        textSpan.textContent = t.showPrice;
        document.querySelector(".ticketContainer__info__details_PriceBox").classList.add("hidden");
    } else {
        textSpan.textContent = t.hidePrice;
        document.querySelector(".ticketContainer__info__details_PriceBox").classList.remove("hidden");
    }
}

function nodata_error($data) {
    var len = $data.length
    var output = "";
    if (len > 0) {
        var msg = $data
        if (msg = 'no data') {
            document.querySelector('.ticketContainer').remove();
            document.querySelector('.ticketContainer__info').remove();
            document.querySelector('.fare_conditions').remove();
            return `<p class="text-xl text-center">Receiving ticket number , please wait ...</p>`
        }
    }
}

async function arrive_date_info($data , invoicetype , lid) {
    var len = $data.length
    var arrive_date = $data[len - 1].route.routeDate.mstring
    var arrive_date_S = $data[len - 1].route.routeDate.sstring
    var arrive_dtime = $data[len - 1].route.atime
    if(invoicetype === 8){
        return `<span id="landingDate" class=" text-sm">${arrive_date_S}</span> | <span id="landingTime" class=" text-sm">${arrive_dtime}</span>`
    }else{
        return `<span id="landingDate" class=" text-sm">${await convertDateFormat(arrive_date , arrive_date_S , lid )}</span> | <span id="landingTime" class=" text-sm">${arrive_dtime}</span>`
    }
}

function passenger_gender(gender) {
    if (gender == 0) {
        return `Ms.`
    } else if (gender == 1) {
        return `Mr.`
    }
}

async function route_array($data, invoicetype) {
    let data = $data.route; // چون route داخل آبجکت route هست
    let output = "";

    output += `
    <div class="relative">
        <!-- بخش مبدا -->
        <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
            <div class="ticketContainer__details__path__item__times flex flex-col justify-between items-center w-1/6 max-md:w-3/12">
                <span class="pathItem__times__start text-nowrap text-sm">
                    ${data.etime || "-"}
                </span>
            </div>

            <div class="ticketContainer__details__path__item__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
                <svg class="max-w-none absolute -right-[3px] z-10 -top-[2px]" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="#292929"><path d="M4 16v2a2 2 0 0 0 2 2h1v-2h10v2h1a2 2 0 0 0 2-2v-2M4 11h16v4H4v-4Zm0-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5H4V6Zm3 0h10"></path></svg>
            </div>

            <div class="ticketContainer__details__path__item__details w-4/6 px-2.5">
                <h3 class="text-xl font-danamedium max-md:text-lg max-sm:text-base">
                    ${data.startstation.startotherinfo.city}
                </h3>
                <span class="text-xs text-gray-500 font-danaregular max-sm:text-[10px]">
                    ${data.startstation.station}
                </span>

                <div class="flex items-center gap-2 text-xs text-gray-500 absolute max-md:static top-16 flex-wrap max-sm:text-[10px] max-sm:gap-1">
                    <span class="flex gap-1 items-center">
                        ${data.busoperatorimage ? `<img src="/${data.busoperatorimage}" width="32" height="32" alt="${data.busoperatorid}" />` : ""}
                        ${data.busoperatorname}
                    </span>
                    |
                    <span>${data.class || "معمولی"}</span>
                </div>
            </div>
        </div>

        <!-- بخش مقصد -->
        <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
            <div class="ticketContainer__details__path__item__times flex flex-col items-center w-1/6 max-md:w-3/12">
                <span class="pathItem__times__start text-nowrap text-sm">
                </span>
            </div>

            <div class="ticketContainer__details__path__item__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
                <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
            </div>

            <div class="ticketContainer__details__path__item__details w-4/6 px-2.5 pt-8">
                <h3 class="text-xl font-danamedium max-md:text-lg max-sm:text-base">
                    ${data.endstation.endotherinfo.city}
                </h3>
                <span class="text-xs text-gray-500 font-danaregular max-sm:text-[10px]">
                    ${data.endstation.station}
                </span>
            </div>
        </div>
    </div>`;

    return output;
}


// function baggages_array($data) {
//     var output = "";
//     var data = $data
//     if (data.length > 0) {
//         for (var i = 0; i < data.length; i++) {
//             output += `<div dir="${detectDirection(data[i].baggage.type)}" >${data[i].baggage.type}</div><div dir="${detectDirection(data[i].baggage.type)}" >${data[i].baggage.title}</div><br/>`
//         }
//         return output;
//     }
// }

function pdf_desc_array($data) {
    var output = "";
    var data = $data
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            output += `<div dir="${detectDirection(data[i].note.title)}" >${data[i].note.title}</div><div dir="${detectDirection(data[i].note.text)}">${data[i].note.text}</div><br/>`
        }
        return output;
    }
}

function desc_array($data) {
    var output = "";
    var data = $data;

    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].departure !== undefined) {
                const dep = data[i].departure;
                let formattedDep = typeof dep === 'string' ? dep : JSON.stringify(dep);
                formattedDep = formattedDep
                    .replace(/^"|"$/g, '') 
                    .replace(/\\n/g, '<br>') 
                    .replace(/<font[^>]*>|<\/font>/gi, ''); 
                output += `<div class=" font-danaregular" dir="${detectDirection(formattedDep)}" >${formattedDep}</div>`;
            }

            if (data[i].return !== undefined) {
                const ret = data[i].return;
                let formattedRet = typeof ret === 'string' ? ret : JSON.stringify(ret);
                formattedRet = formattedRet
                    .replace(/^"|"$/g, '')
                    .replace(/\\n/g, '<br>')
                    .replace(/<font[^>]*>|<\/font>/gi, '');
                output += `<div class=" font-danaregular" dir="${detectDirection(formattedRet)}" >${formattedRet}</div>`;
            }
        }

        document.getElementById("desc_array").innerHTML = output;
    }
}

// function connection_time($data) {
//     var output = "";
//     var data = $data
//     if (data !== undefined) {
//         let connectiontime = parseFloat(data)
//         if (connectiontime !== 0) {
//             const hours = Math.floor(connectiontime / 60);
//             const minutes = connectiontime % 60;
//             output += `<div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 h-12">
//                 <div class="ticketContainer__details__path__item__times pathItem__times flex flex-nowrap justify-center flex-col items-center w-1/6 -mt-[10px] max-md:w-3/12">
//                     <span class="pathItem__times__start text-nowrap text-sm">
//                         <span class="text-xs text-gray-500 font-danabold max-sm:text-[10px]" >Connection Time </span>
//                         <span class="flex justify-center items-center text-center text-xs text-gray-500 max-sm:text-[10px]">
//                             <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M7.89035 4.7532C8.68596 4.02783 9.76188 3.0468 9.85995 0.703125H10.5703V0H1.42969V0.703125H2.14005C2.23812 3.0468 3.31404 4.02783 4.10965 4.7532C4.64334 5.23978 4.94531 5.5376 4.94531 6C4.94531 6.4624 4.64334 6.76022 4.10965 7.2468C3.31404 7.97217 2.23812 8.9532 2.14005 11.2969H1.42969V12H10.5703V11.2969H9.85995C9.76188 8.9532 8.68596 7.97217 7.89035 7.2468C7.35666 6.76022 7.05469 6.4624 7.05469 6C7.05469 5.5376 7.35666 5.23978 7.89035 4.7532ZM5.64844 8.63527C5.53985 8.65767 5.43258 8.69027 5.32788 8.73359L3.17452 9.62466C3.52617 8.73052 4.09256 8.21388 4.58337 7.76641C5.1311 7.26703 5.64844 6.79535 5.64844 6V8.63527ZM7.41663 7.76641C7.90744 8.21388 8.4738 8.73052 8.82548 9.62463L6.67212 8.73356C6.56742 8.69025 6.46015 8.65765 6.35156 8.63524V6C6.35156 6.79535 6.8689 7.26703 7.41663 7.76641ZM3.16216 2.34375C2.99217 1.9008 2.87477 1.36598 2.84405 0.703125H9.15593C9.1252 1.36598 9.00783 1.9008 8.83781 2.34375H3.16216Z" fill="#BEBBCE"/>
//                             </svg>
//                             <span>${hours}H : ${minutes}M</span>
//                         </span>
//                     </span>
//                 </div>
//                 <div class="ticketContainer__details__path__item__path pathItem__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
//                     <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
//                 </div>
//             </div>`
//         }
//         return output;
//     }else{
//       return '';
//     }
// }

// async function multi_route_array($data , invoicetype , lid) {
//     var output = "";
//     var data = $data

//     if (data.length > 1) {
//         if(invoicetype === 8){
//             for (var i = 1; i < data.length; i++) {
//                 var segment_len = data[i].segment.length
//                 output += `
//                     <div class="return_stracture mt-4 ticketContainer border-2 border-dashed overflow-hidden border-gray-400 rounded-2xl mx-auto max-w-screen-md min-w-[794px] max-[794px]:min-w-full shrink-0 ">
//                         <div class="ticketContainer__details w-full">
//                             <div class="ticketContainer__details__time px-4 py-2 flex gap-3 w-full items-center text-sm max-sm:text-xs">Route ${data[i].segment_id} : </div>
//                             <div class="ticketContainer__details__time px-12 py-2 flex gap-3 w-full items-center bg-[#F9C643] text-sm dir-ltr max-[794px]:flex-wrap max-[794px]:px-1 max-[794px]:gap-x-1 max-sm:px-2">
                                
//                                 <div class="ticketContainer__details__time__flight flex items-center gap-2 shrink-0">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="#9ca3af" class="train-icon max-sm:w-5 max-sm:h-5" width="23" height="23" viewBox="0 0 256 256" id="Flat" stroke="#9ca3af">
//                                         <g id="SVGRepo_bgCarrier" stroke-width="0"/>
//                                         <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
//                                         <g id="SVGRepo_iconCarrier"> 
//                                             <path d="M188,24H68A32.03667,32.03667,0,0,0,36,56V184a32.03667,32.03667,0,0,0,32,32H79.99976L65.59961,235.2002a8.00019,8.00019,0,0,0,12.80078,9.5996L100.00024,216h55.99952l21.59985,28.7998a8.00019,8.00019,0,0,0,12.80078-9.5996L176.00024,216H188a32.03667,32.03667,0,0,0,32-32V56A32.03667,32.03667,0,0,0,188,24ZM84,184a12,12,0,1,1,12-12A12,12,0,0,1,84,184Zm36-64H52V80h68Zm52,64a12,12,0,1,1,12-12A12,12,0,0,1,172,184Zm32-64H136V80h68Z"/> 
//                                         </g>
//                                     </svg>
//                                     <span id="flightDate" class=" text-sm max-sm:text-xs">${await convertDateFormat(data[i].segment[0].route.routeDate.mstring , data[i].segment[0].route.routeDate.sstring , lid)}</span>
//                                     |
//                                     <span id="flightTime" class=" text-sm max-sm:text-xs">${data[i].segment[0].route.etime}</span>
//                                 </div>

//                                 <div class="ticketContainer__details__time__arrow h-[2px] w-full flex relative z-10 justify-end ">
//                                    <img class="absolute right-[-6px] top-[-15px] z-[9] max-sm:w-6 max-sm:h-6 max-sm:right-[-3px] max-sm:top-[-12px]"  src="/images/arrow-rtl.png" width="32" height="32" alt="arrow-rtl"/>
//                                 </div>

//                                 <div class="ticketContainer__details__time__landing flex items-center gap-2 shrink-0">
//                                     <svg xmlns="http://www.w3.org/2000/svg" fill="#9ca3af" class="train-icon max-sm:w-5 max-sm:h-5" width="23" height="23" viewBox="0 0 256 256" id="Flat" stroke="#9ca3af">
//                                         <g id="SVGRepo_bgCarrier" stroke-width="0"/>
//                                         <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
//                                         <g id="SVGRepo_iconCarrier"> 
//                                             <path d="M188,24H68A32.03667,32.03667,0,0,0,36,56V184a32.03667,32.03667,0,0,0,32,32H79.99976L65.59961,235.2002a8.00019,8.00019,0,0,0,12.80078,9.5996L100.00024,216h55.99952l21.59985,28.7998a8.00019,8.00019,0,0,0,12.80078-9.5996L176.00024,216H188a32.03667,32.03667,0,0,0,32-32V56A32.03667,32.03667,0,0,0,188,24ZM84,184a12,12,0,1,1,12-12A12,12,0,0,1,84,184Zm36-64H52V80h68Zm52,64a12,12,0,1,1,12-12A12,12,0,0,1,172,184Zm32-64H136V80h68Z"/> 
//                                         </g>
//                                     </svg>
//                                     <span id="landingDate" class=" text-sm max-sm:text-xs">${await convertDateFormat(data[i].segment[segment_len - 1].route.routeDate.mstring , data[i].segment[segment_len - 1].route.routeDate.sstring , lid)}</span> | 
//                                     <span id="landingTime" class=" text-sm max-sm:text-xs">${data[i].segment[segment_len - 1].route.atime}</span>
//                                 </div>
//                             </div>
//                             <div class="ticketContainer__details__path pathContainer p-4 flex flex-col max-sm:p-2">
//                                 ${await route_array(data[i].segment, invoicetype)}
//                             </div>
//                         </div>
//                     </div>`
//             }
//         } else {
//             // کد پرواز با کلاس‌های ریسپانسیو
//             for (var i = 1; i < data.length; i++) {
//                 var segment_len = data[i].segment.length
//                 output += `
//                     <div class="return_stracture mt-4 ticketContainer border-2 border-dashed overflow-hidden border-gray-400 rounded-2xl mx-auto max-w-screen-md min-w-[794px] max-[794px]:min-w-full shrink-0 ">
//                         <div class="ticketContainer__details w-full">
//                             <div class="ticketContainer__details__time px-4 py-2 flex gap-3 w-full items-center text-sm max-sm:text-xs max-sm:px-2">Route ${data[i].segment_id} : </div>
//                             <div class="ticketContainer__details__time px-12 py-2 flex gap-3 w-full items-center bg-[#F9C643] text-sm dir-ltr max-[794px]:flex-wrap max-[794px]:px-1 max-[794px]:gap-x-1 max-sm:px-2">
                                
//                                 <div class="ticketContainer__details__time__flight flex items-center gap-2 shrink-0">
//                                     <svg width="22" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="max-sm:w-5 max-sm:h-5">
//                                         <g clip-path="url(#clip0_1_717)">
//                                             <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9967 4.04383C12.4616 3.83566 11.7331 3.91 11.0456 4.24442C10.4088 4.55709 9.78484 4.91151 9.11998 5.26178C8.30949 4.65771 7.48892 4.07605 6.6662 3.49506C6.1033 3.09873 5.55654 2.99132 5.04397 3.17539C4.75521 3.27773 4.48568 3.41493 4.22368 3.54778C4.11657 3.60258 4.0077 3.65757 3.89561 3.71157C3.7801 3.76681 3.69244 3.86712 3.65247 3.98997C3.6128 4.11145 3.62499 4.24437 3.6862 4.35748L5.30417 7.34695C4.95632 7.53815 4.54275 7.7678 4.13505 7.99418C3.77818 8.19254 3.42503 8.3883 3.12222 8.55566L2.87823 8.10715C2.75308 7.88034 2.46796 7.79743 2.24155 7.9221C2.01504 8.04589 1.93134 8.33197 2.0565 8.55878L2.48153 9.33888C3.41411 11.0117 4.96594 11.4859 6.63407 10.6058C8.41206 9.6675 10.3557 8.61404 12.7506 7.2883C13.0439 7.12684 13.3203 6.90271 13.537 6.63508C13.9201 6.162 14.1135 5.55465 13.8625 4.92513C13.6961 4.50402 13.3965 4.19867 12.9967 4.04383Z" fill="#2F2F2F" />
//                                             <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1 13.2007H3.27127C3.01252 13.2007 2.80252 13.4107 2.80252 13.6695C2.80252 13.9282 3.01252 14.1382 3.27127 14.1382H12.1C12.3588 14.1382 12.5688 13.9282 12.5688 13.6695C12.5688 13.4107 12.3588 13.2007 12.1 13.2007Z" fill="#2F2F2F" />
//                                         </g>
//                                         <defs>
//                                             <clipPath id="clip0_1_717">
//                                                 <rect width="15" height="15" fill="white" />
//                                             </clipPath>
//                                         </defs>
//                                     </svg>
//                                     <span id="flightDate" class=" text-sm max-sm:text-xs">${await convertDateFormat(data[i].segment[0].route.routeDate.mstring , data[i].segment[0].route.routeDate.sstring ,lid )}</span>
//                                     |
//                                     <span id="flightTime" class=" text-sm max-sm:text-xs">${data[i].segment[0].route.etime}</span>
//                                 </div>

//                                 <div class="ticketContainer__details__time__arrow h-[2px] w-full flex relative z-10 justify-end ">
//                                    <img class="absolute right-[-6px] top-[-15px] z-[9] max-sm:w-6 max-sm:h-6 max-sm:right-[-3px] max-sm:top-[-12px]"  src="/images/arrow-rtl.png" width="32" height="32" alt="arrow-rtl"/>
//                                 </div>

//                                 <div class="ticketContainer__details__time__landing flex items-center gap-2 shrink-0">
//                                     <svg width="22" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="max-sm:w-5 max-sm:h-5">
//                                         <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9765 9.27775C12.8015 8.73088 12.2852 8.2115 11.5927 7.88775C10.949 7.58963 10.2809 7.32775 9.59024 7.0315C9.54961 6.02148 9.48524 5.01773 9.41899 4.01273C9.37274 3.32585 9.11211 2.83335 8.64649 2.55085C8.38524 2.39085 8.10899 2.26773 7.84086 2.14773C7.73086 2.09898 7.61961 2.04898 7.50711 1.99585C7.39149 1.94085 7.25836 1.93585 7.13774 1.9821C7.01836 2.02773 6.92274 2.12085 6.87336 2.2396L5.56837 5.37835C5.20087 5.22835 4.76212 5.05148 4.32962 4.8771C3.95087 4.7246 3.57649 4.57335 3.25587 4.44335L3.45087 3.97148C3.54837 3.73148 3.43337 3.45773 3.19399 3.36023C2.95524 3.2621 2.68024 3.3771 2.58274 3.6171L2.24399 4.43835C1.53087 6.21585 2.13899 7.72025 3.87274 8.46275C5.72087 9.254 7.76274 10.1015 10.3002 11.1284C10.6102 11.2546 10.9584 11.3284 11.3027 11.3284C11.9115 11.3284 12.5052 11.0965 12.8365 10.5053C13.059 10.1109 13.1077 9.68588 12.9765 9.27775Z" fill="#2F2F2F" />
//                                         <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1 13.2007H3.27127C3.01252 13.2007 2.80252 13.4107 2.80252 13.6695C2.80252 13.9282 3.01252 14.1382 3.27127 14.1382H12.1C12.3588 14.1382 12.5688 13.9282 12.5688 13.6695C12.5688 13.4107 12.3588 13.2007 12.1 13.2007Z" fill="#2F2F2F" />
//                                     </svg>
//                                     <span id="landingDate" class=" text-sm max-sm:text-xs">${await convertDateFormat(data[i].segment[segment_len - 1].route.routeDate.mstring , data[i].segment[segment_len - 1].route.routeDate.sstring , lid)}</span> | 
//                                     <span id="landingTime" class=" text-sm max-sm:text-xs">${data[i].segment[segment_len - 1].route.atime}</span>
//                                 </div>
//                             </div>
//                             <div class="ticketContainer__details__path pathContainer p-4 flex flex-col max-sm:p-2">
//                                 ${await route_array(data[i].segment, invoicetype)}
//                             </div>
//                         </div>
//                     </div>`
//             }
//         }

//         return output;
//     }
// }

// function convertDateFormat(mstring , sstring , lid) {
//     var output = "";
//     var dateString = mstring;
//     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const parts = dateString.split('-');
//     const year = parts[0];
//     const month = monthNames[parseInt(parts[1]) - 1];
//     const day = parts[2];
//     return `${day} ${month} ${year}`;
// }

function convertDateFormat(mstring, sstring, lid) {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Convert Gregorian date
    const gregorianParts = mstring.split('-');
    const gregorianYear = gregorianParts[0];
    const gregorianMonth = monthNames[parseInt(gregorianParts[1]) - 1];
    const gregorianDay = gregorianParts[2];
    const gregorianOutput = `${gregorianDay} ${gregorianMonth} ${gregorianYear}`;
    
    if (lid == 2 || lid == 3) {
        return gregorianOutput;
    } else if (lid == 1) {
        // Convert Persian date
        const persianParts = sstring.split('-');
        const persianYear = persianParts[0];
        const persianMonthNum = parseInt(persianParts[1]);
        const persianDay = persianParts[2];
        
        // Persian month names
        const persianMonthNames = [
            "فروردین", "اردیبهشت", "خرداد", "تیر", 
            "مرداد", "شهریور", "مهر", "آبان", 
            "آذر", "دی", "بهمن", "اسفند"
        ];
        const persianMonth = persianMonthNames[persianMonthNum - 1];
        
        return `${persianDay} ${persianMonth} ${persianYear} (${gregorianOutput})`;
    }
    return gregorianOutput; // Default fallback
}


// تابع برای به‌روزرسانی عناصر سن بعد از لود شدن کامل
// busss
function updateAgeElements() {
  const ageElements = document.querySelectorAll('#cargoWeight');
  
  ageElements.forEach(async (element) => {
      if (element.textContent.trim() === '' || element.textContent.trim() === '-') {
          try {
              // دوباره تلاش برای دریافت مقدار
              const typeData = window.$data?.passenger?.passengerinfo.type;
              if (typeData) {
                  const result = await passenger_type(typeData, [mainlid]);
                  if (result) {
                      element.textContent = result;
                  }
              }
          } catch (e) {
              console.error('Error updating age element:', e);
          }
      }
  });
}

// اجرای به‌روزرسانی بعد از لود کامل
window.addEventListener('load', () => {
  setTimeout(updateAgeElements, 1000);
  setTimeout(updateAgeElements, 3000); // دوباره بررسی کنیم
});

// اضافه کردن این تابع به ابتدای فایل JavaScript
function ensureTranslationsReady() {
  if (!translations) {
      // اگر translations موجود نیست، یک نسخه پیش‌فرض ایجاد کنیم
      translations = {
          1: {
              adult: "بزرگسال",
              child: "کودک", 
              infant: "نوزاد"
          },
          2: {
              adult: "Adult",
              child: "Child",
              infant: "Infant"
          },
          3: {
              adult: "بالغ",
              child: "طفل",
              infant: "رضيع"
          }
      };
  }
}
