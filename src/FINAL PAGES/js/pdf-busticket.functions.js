// ======================= Loading / Lang State =======================
let loadingStartTime = Date.now();
let isContentLoaded = false;
let isMinTimeElapsed = false;
let apiDataLoaded = false;
const MIN_LOADING_TIME = 4000;
let mainlid;
let invoiceType;
let translations;

// (اضافیِ امن: تشخیص جهت متن – اگر قبلاً در فایل مشترک داری، حذفش مشکلی ندارد)
function detectDirection(text = "") {
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return rtlRegex.test(String(text)) ? "rtl" : "ltr";
}

// ======================= Public Entrypoint ==========================
function setlid(lid, invoice = null) {
  mainlid = Array.isArray(lid) ? lid[0] : lid;
  invoiceType = Array.isArray(invoice) ? invoice[0] : invoice;
  ensureTranslationsReady();
}

// ======================= Small Utils ===============================
function barDirection(lid) {
  return (Array.isArray(lid) ? lid[0] : lid) == 2 ? `dir-ltr` : `dir-rtl`;
}
function barArrowRotation(lid) {
  return (Array.isArray(lid) ? lid[0] : lid) == 2 ? `rotate-0` : `rotate-180`;
}
function formatPrice(num) { try { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); } catch { return num; } }
function renderUnitCost(unit) {
  const map = { "10": "IRR", "IRR": "IRR", "USD": "USD", "EUR": "EUR", "AED": "AED" };
  return map[String(unit)] || String(unit || "");
}

// ======================= Language bootstrap ========================
function initializePageLanguage(lid, invoice = null) {
  translations = {
    1: { lang: "fa", dir: "rtl", accessDenied: "شما اجازه دسترسی به این صفحه را ندارید", loadingText: "در حال بارگذاری", pdfLoadingText: "در حال تولید PDF", textAlign: "text-right", justifyContent: "!justify-end", electronTicket: "بلیط الکترونیکی", downloadPdf: "دانلود PDF", hidePrice: "مخفی کردن قیمت", showPrice: "نمایش قیمت", invoiceNumber: "شماره فاکتور", pnrCode: "کد PNR", eticketNumber: "شماره بلیط الکترونیکی", dateOfIssue: "تاریخ صدور", passenger: "مسافر", age: "سن", birthdate: "تاریخ تولد", nationalCode: "کد ملی", priceDetails: "جزئیات قیمت", basePrice: "قیمت پایه", tax: "مالیات", total: "مجموع", extraService: "خدمات اضافی", fareConditions: "قوانین", connectionTime: "زمان انتظار", travelTime: "مدت سفر", route: "مسیر", departure: "رفت", return: "برگشت", adult: "بزرگسال", child: "کودک", infant: "نوزاد", trainNumber: "شماره قطار", flightNumber: "شماره پرواز", airline: "ایرلاین", aircraft: "هواپیما", flightTime: "زمان پرواز", gate: "گیت", terminal: "ترمینال", seatcount: "تعداد صندلی", seat: "شماره صندلی", cabin: "کابین", baggage: "بار", checkedBag: "چمدان", carryOn: "کیف دستی" },
    2: { lang: "en", dir: "ltr", accessDenied: "You do not have permission to access this page", loadingText: "Loading", pdfLoadingText: "Generating PDF", textAlign: "text-left", justifyContent: "!justify-start", electronTicket: "Electronic Ticket", downloadPdf: "Download PDF", hidePrice: "Hide Price", showPrice: "Show Price", invoiceNumber: "Invoice Number", pnrCode: "PNR Code", eticketNumber: "ETicket Number", dateOfIssue: "Date Of Issue", passenger: "Passenger", age: "Age", birthdate: "Birthdate", nationalCode: "National Code", priceDetails: "Price Details", basePrice: "Base Price", tax: "Tax", total: "Total", extraService: "Extra Service", fareConditions: "Fare Conditions", connectionTime: "Connection Time", travelTime: "Travel Time", route: "Route", departure: "Departure", return: "Return", adult: "Adult", child: "Child", infant: "Infant", trainNumber: "Train Number", flightNumber: "Flight Number", airline: "Airline", aircraft: "Aircraft", flightTime: "Flight Time", gate: "Gate", terminal: "Terminal", seatcount: "Seat Count", seat: "Seat Number", cabin: "Cabin", baggage: "Baggage", checkedBag: "Checked Bag", carryOn: "Carry On" },
    3: { lang: "ar", dir: "rtl", accessDenied: "ليس لديك إذن للوصول إلى هذه الصفحة", loadingText: "جاري التحميل", pdfLoadingText: "جاري إنشاء PDF", textAlign: "text-right", justifyContent: "!justify-end", electronTicket: "التذكرة الإلكترونية", downloadPdf: "تحميل PDF", hidePrice: "إخفاء السعر", showPrice: "إظهار السعر", invoiceNumber: "رقم الفاتورة", pnrCode: "رمز PNR", eticketNumber: "رقم التذكرة الإلكترونية", dateOfIssue: "تاريخ الإصدار", passenger: "المسافر", age: "العمر", birthdate: "تاريخ الميلاد", nationalCode: "الرقم الوطني", priceDetails: "تفاصيل السعر", basePrice: "السعر الأساسي", tax: "الضريبة", total: "المجموع", extraService: "خدمة إضافية", fareConditions: "شروط الأجرة", connectionTime: "وقت الانتظار", travelTime: "وقت السفر", route: "المسار", departure: "المغادرة", return: "العودة", adult: "بالغ", child: "طفل", infant: "رضيع", trainNumber: "رقم القطار", flightNumber: "رقم الرحلة", airline: "شركة الطيران", aircraft: "الطائرة", flightTime: "وقت الرحلة", gate: "البوابة", terminal: "المحطة", seatcount: "عدد المقاعد", seat: "رقم المقعد", cabin: "المقصورة", baggage: "الأمتعة", checkedBag: "الحقيبة المسجلة", carryOn: "الحقيبة اليدوية" },
  };

  const t = translations[lid] || translations[1];
  window.currentTranslations = t;

  const mainContent = document.getElementById("main-content-wrapper");
  const headerSection = document.getElementById("header-section");
  const accessDeniedMessage = document.getElementById("access-denied-message");
  const pdfLoadingText = document.getElementById("pdf-loading-text");
  const mainLoadingText = document.getElementById("main-loading-text");

  if (mainContent) {
    mainContent.setAttribute("dir", t.dir);
    mainContent.className = mainContent.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
  }
  if (headerSection) {
    headerSection.setAttribute("dir", t.dir);
    headerSection.className = headerSection.className.replace(/(!justify-start|!justify-end)/g, "") + ` ${t.justifyContent}`;
  }
  if (mainLoadingText) mainLoadingText.textContent = t.loadingText;

  setTimeout(() => {
    translatePageElements(t, invoice);

    if (accessDeniedMessage) {
      accessDeniedMessage.textContent = t.accessDenied;
      accessDeniedMessage.setAttribute("dir", t.dir);
      accessDeniedMessage.className = accessDeniedMessage.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
    }

    const loadingText = document.getElementById("loading-text");
    if (loadingText) loadingText.textContent = t.pdfLoadingText;

    if (pdfLoadingText) {
      pdfLoadingText.setAttribute("dir", t.dir);
      pdfLoadingText.className = pdfLoadingText.className.replace(/dir-(rtl|ltr)/g, "") + ` dir-${t.dir}`;
    }
  }, 4000);
}

function translatePageElements(t, invoice = null) {
  const electronTicketTitle = document.querySelector('.font-danabold.text-xl');
  if (electronTicketTitle && electronTicketTitle.textContent.includes('Electronic Ticket')) {
    electronTicketTitle.textContent = t.electronTicket;
  }

  const downloadBtn = document.querySelector('button[onclick="generatePDF()"]');
  if (downloadBtn) {
    const btnText = downloadBtn.querySelector('svg')?.nextSibling;
    if (btnText && btnText.textContent.trim() === 'Download PDF') {
      btnText.textContent = ` ${t.downloadPdf}`;
    }
  }

  const priceBtn = document.querySelector('button[onclick="togglePrice(this)"] .button-content-text');
  if (priceBtn) {
    if (priceBtn.textContent.trim() === 'Hide Price') priceBtn.textContent = t.hidePrice;
    else if (priceBtn.textContent.trim() === 'Show Price') priceBtn.textContent = t.showPrice;
  }

  translateHeaderTitles(t);
  translateTicketTitles(t, invoice);
  translatePriceTitles(t);

  const baggageTitle = document.querySelector('.baggage_conditions h3');
  if (baggageTitle) baggageTitle.textContent = t.baggage;

  const fareConditionsTitle = document.querySelector('h3.fare-condition');
  if (fareConditionsTitle && fareConditionsTitle.textContent.includes('Fare Conditions')) {
    fareConditionsTitle.textContent = t.fareConditions;
  }
}

function translateHeaderTitles(t) {
  const headerTitles = document.querySelectorAll('.header__details__container__item__title');
  headerTitles.forEach(title => {
    const text = title.textContent.trim().toLowerCase();
    if (text === 'invoice number') title.textContent = t.invoiceNumber;
    if (text === 'pnr code') title.textContent = t.pnrCode;
    if (text === 'eticket number') title.textContent = t.eticketNumber;
    if (text === 'date of issue:') title.textContent = t.dateOfIssue;
  });
}

function translateTicketTitles(t, invoice = null) {
  // عناوین (Passenger / Age / National Code / Seat)
  const ticketTitles = document.querySelectorAll('.ticketContainer__details__head__item__title');
  // ticketTitles.forEach(title => {
  //   const raw = title.textContent.trim().replace(':','').toLowerCase();
  //   if (raw.includes('passenger')) title.textContent = t.passenger + ':';
  //   if (raw === 'age') title.textContent = t.age;
  //   if (raw.includes('national code')) title.textContent = t.nationalCode + ':';
  //   if (raw.includes('seat')) title.textContent = t.seat + ':';
  // });
ticketTitles.forEach(title => {
  const raw = title.textContent.trim().replace(/[:：]+/g, '').toLowerCase();

  if (raw.includes('passenger')) title.innerHTML = `${t.passenger}<span class="inline-block">:</span>`;
  if (raw === 'age') title.innerHTML = `${t.age}<span class="inline-block">:</span>`;
  if (raw.includes('national code')) title.innerHTML = `${t.nationalCode}<span class="inline-block">:</span>`;

  // 🔧 fix here
  if (raw.includes('seat count') || raw.includes('seatcount')) {
    title.innerHTML = `${t.seatcount}<span class="inline-block">:</span>`;
  }

  if (raw.includes('seat number') || raw.includes('seatnumber')) {
    title.innerHTML = `${t.seat}<span class="inline-block">:</span>`;
  }
});




  const routeTitles = document.querySelectorAll('.ticketContainer__details__time:not(#from-to-yellow-bar)');
  routeTitles.forEach(route => {
    const txt = route.textContent;
    if (/\bRoute\b/i.test(txt) || /\bDeparture\b/i.test(txt) || /\bReturn\b/i.test(txt)) {
      route.innerHTML = route.innerHTML
        .replace(/Route/g, t.route)
        .replace(/Departure/g, t.departure)
        .replace(/Return/g, t.return);
    }
  });

  // Connection/Travel Time
  const extraLabels = document.querySelectorAll('.text-xs.text-gray-500.font-danabold');
  extraLabels.forEach(el => {
    const v = el.textContent.trim();
    if (v === 'Connection Time') el.textContent = t.connectionTime;
    if (v === 'Travel Time') el.textContent = t.travelTime;
  });
}

function translatePriceTitles(t) {
  const priceDetailsTitle = document.querySelector('h3.font-danabold');
  if (priceDetailsTitle && priceDetailsTitle.textContent.trim() === 'Price Details') {
    priceDetailsTitle.textContent = t.priceDetails;
  }
  const allH3 = document.querySelectorAll('h3.font-danabold');
  if (allH3[1] && allH3[1].textContent.trim() === 'Extra Service') {
    allH3[1].textContent = t.extraService;
  }

  const priceLabels = document.querySelectorAll('.ticketContainer__info__details__title');
  // priceLabels.forEach(label => {
  //   label.innerHTML = label.innerHTML.replace('Base Price:', t.basePrice + ':');
  //   label.innerHTML = label.innerHTML.replace('Tax:', t.tax + ':');
  //   label.innerHTML = label.innerHTML.replace('Total:', t.total + ':');
  // });

  priceLabels.forEach(label => {
    label.innerHTML = label.innerHTML.replace('Base Price:', `${t.basePrice}<span class="inline-block">:</span>`);
    label.innerHTML = label.innerHTML.replace('Tax:', `${t.tax}<span class="inline-block">:</span>`);
    label.innerHTML = label.innerHTML.replace('Total:', `${t.total}<span class="inline-block">:</span>`);
  });

}

// ======================= Toggle Price (single) =====================
function togglePrice(element) {
  const textSpan = element.querySelector(".button-content-text");
  const t = window.currentTranslations || { hidePrice: "Hide Price", showPrice: "Show Price" };
  const priceBox = document.querySelector(".ticketContainer__info__details_PriceBox");
  if (!textSpan || !priceBox) return;

  const cur = textSpan.textContent.trim();
  if (cur === t.hidePrice || cur === "Hide Price") {
    textSpan.textContent = t.showPrice;
    priceBox.classList.add("hidden");
  } else {
    textSpan.textContent = t.hidePrice;
    priceBox.classList.remove("hidden");
  }
}

// ======================= Passenger Type ============================
async function passenger_type(typedata, lid) {
  try {
    const waitForTranslations = async (maxWait = 5000) => {
      const start = Date.now();
      while (!translations && (Date.now() - start) < maxWait) {
        await new Promise(r => setTimeout(r, 100));
      }
      return translations;
    };
    await waitForTranslations();

    const defaultValue = translations?.[1]?.adult ? "مسافر" : "Passenger";
    if (typedata == null || typedata === '') return defaultValue;
    const lidValue = Array.isArray(lid) ? lid[0] : lid;
    const trns = translations?.[lidValue];
    if (!trns) return defaultValue;

    const type = String(typedata).trim();
    switch (type) {
      case "0": return trns.infant || "نوزاد";
      case "1": return trns.child || "کودک";
      case "2": return trns.adult || "بزرگسال";
      default: return defaultValue;
    }
  } catch {
    const type = String(typedata || '').trim();
    switch (type) { case "0": return "نوزاد"; case "1": return "کودک"; case "2": return "بزرگسال"; default: return "مسافر"; }
  }
}

// ======================= Loading System ============================
function initializeLoadingSystem() {
  setTimeout(() => { isMinTimeElapsed = true; checkLoadingComplete(); }, MIN_LOADING_TIME);
  checkImagesLoaded();
  checkFontsLoaded();
  checkContentLoaded();
}

function checkImagesLoaded() {
  const images = document.querySelectorAll("img");
  let loadedCount = 0;
  const totalImages = images.length;
  if (totalImages === 0) return Promise.resolve();

  return new Promise((resolve) => {
    images.forEach((img) => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) resolve();
        };
      }
    });
    if (loadedCount === totalImages) resolve();
  });
}

function checkFontsLoaded() {
  if (document.fonts && document.fonts.ready) return document.fonts.ready;
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function checkContentLoaded() {
  const checkApiInterval = setInterval(() => {
    const hasApiContent = document.querySelector('[datamembername="db.ticket_pdf"], [datamembername="db.bus_ticket_pdf"]');
    const hasGeneratedContent = document.querySelector("h1");
    const hasPassengerData = window.$data?.passenger?.passengerinfo?.type;

    if (hasApiContent && hasGeneratedContent && hasPassengerData) {
      apiDataLoaded = true;
      clearInterval(checkApiInterval);
      ensureTranslationsReady();
      checkAllResourcesLoaded();
    }
  }, 100);

  setTimeout(() => {
    if (!apiDataLoaded) {
      apiDataLoaded = true;
      clearInterval(checkApiInterval);
      ensureTranslationsReady();
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
  } catch {
    isContentLoaded = true;
    checkLoadingComplete();
  }
}

function checkLoadingComplete() {
  if (isMinTimeElapsed && isContentLoaded && apiDataLoaded) hideLoadingScreen();
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
      if ((Array.isArray(mainlid) ? mainlid[0] : mainlid) == 2) {
        mainContentpdf.classList.add("dir-ltr");
      } else {
        mainContentpdf.classList.add("dir-rtl");
      }
    }, 500);
  }
}

// Safety timeout & hooks
setTimeout(() => {
  if (!isContentLoaded) {
    isContentLoaded = true; isMinTimeElapsed = true; apiDataLoaded = true; checkLoadingComplete();
  }
}, 15000);

window.onBasisApiComplete = function () {
  apiDataLoaded = true;
  checkAllResourcesLoaded();
};
window.addEventListener("load", function () {
  setTimeout(() => { if (!apiDataLoaded) { apiDataLoaded = true; checkAllResourcesLoaded(); } }, 500);
});

// ======================= Page-specific helpers =====================
function nodata_error($data) {
  const len = ($data || "").length || 0;
  if (len > 0) {
    const msg = $data;
    if (msg === 'no data') {
      const tc = document.querySelector('.ticketContainer');
      const tci = document.querySelector('.ticketContainer__info');
      const fc = document.querySelector('.fare_conditions');
      if (tc) tc.remove();
      if (tci) tci.remove();
      if (fc) fc.remove();
      return `<p class="text-xl text-center">Receiving ticket number , please wait ...</p>`;
    }
  }
  return "";
}

async function arrive_date_info($data, invoicetype, lid) {
  const len = $data.length;
  const arrive_date = $data[len - 1].route.routeDate.mstring;
  const arrive_date_S = $data[len - 1].route.routeDate.sstring;
  const arrive_dtime = $data[len - 1].route.atime || "";
  if (invoicetype === 8) {
    return `<span id="landingDate" class=" text-sm" style="direction: ltr !important;display: inline-block;" >${arrive_date_S}</span> | <span id="landingTime" class=" text-sm" style="direction: ltr !important;display: inline-block;">${arrive_dtime}</span>`;
  } else {
    return `<span id="landingDate" class=" text-sm" style="direction: ltr !important;display: inline-block;">${await convertDateFormat(arrive_date, arrive_date_S, lid)}</span> | <span id="landingTime" class=" text-sm" style="direction: ltr !important;display: inline-block;">${arrive_dtime}</span>`;
  }
}

function passenger_gender(gender) {
  gender = String(gender);

  if (mainlid === 1) {
    // فارسی
    return gender === "0" ? "خانم" : "آقا";
  } else if (mainlid === 2) {
    // انگلیسی
    return gender === "0" ? "Ms." : "Mr.";
  } else if (mainlid === 3) {
    // عربی
    return gender === "0" ? "الآنسة" : "السيد";
  } else {
    // حالت پیش‌فرض (انگلیسی)
    return gender === "0" ? "Ms." : "Mr.";
  }
}


async function route_array($data, invoicetype) {
  let data = $data.route;
  let output = "";
  output += `
    <div class="relative">
      <!-- From -->
      <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
        <div class="ticketContainer__details__path__item__times flex flex-col justify-between items-center w-1/6 max-md:w-3/12">
          <span class="pathItem__times__start text-nowrap text-sm">${data.etime || "-"}</span>
        </div>
        <div class="ticketContainer__details__path__item__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
          <svg class="max-w-none absolute -right-[3px] z-10 -top-[2px]" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="#9ca3af"><path d="M4 16v2a2 2 0 0 0 2 2h1v-2h10v2h1a2 2 0 0 0 2-2v-2M4 11h16v4H4v-4Zm0-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5H4V6Zm3 0h10"></path></svg>
        </div>
        <div class="ticketContainer__details__path__item__details w-4/6 px-2.5">
          <h3 class="text-xl font-danamedium max-md:text-lg max-sm:text-base">${data.startstation.startotherinfo.city}</h3>
          <span class="text-xs text-gray-500 font-danaregular max-sm:text-[10px]">${data.startstation.station}</span>
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
      <!-- To -->
      <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
        <div class="ticketContainer__details__path__item__times flex flex-col items-center w-1/6 max-md:w-3/12">
          <span class="pathItem__times__start text-nowrap text-sm"></span>
        </div>
        <div class="ticketContainer__details__path__item__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
          <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
        </div>
        <div class="ticketContainer__details__path__item__details w-4/6 px-2.5 pt-8">
          <h3 class="text-xl font-danamedium max-md:text-lg max-sm:text-base">${data.endstation.endotherinfo.city}</h3>
          <span class="text-xs text-gray-500 font-danaregular max-sm:text-[10px]">${data.endstation.station}</span>
        </div>
      </div>
    </div>`;
  return output;
}

// ======================= PDF/desc helpers (USED IN HTML) ===========
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


function convertDateFormat(mstring, sstring, lid) {
  try {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const gregorianParts = String(mstring || "").split('-');
    const gregorianYear = gregorianParts[0];
    const gregorianMonth = monthNames[parseInt(gregorianParts[1]) - 1] || "";
    const gregorianDay = gregorianParts[2];
    const gregorianOutput = `${gregorianDay} ${gregorianMonth} ${gregorianYear}`;

    const lidVal = Array.isArray(lid) ? lid[0] : lid;
    if (lidVal == 2 || lidVal == 3) return gregorianOutput;

    const persianParts = String(sstring || "").split('-');
    const persianYear = persianParts[0];
    const persianMonthNum = parseInt(persianParts[1]);
    const persianDay = persianParts[2];
    const persianMonthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    const persianMonth = persianMonthNames[persianMonthNum - 1] || "";
    return ` <span class="inline-block ">${persianDay} ${persianMonth} ${persianYear} </span> <span class="inline-block dir-ltr">(${gregorianOutput})</span>`;
  } catch {
    return mstring || sstring || "";
  }
}

// اگر Age خالی بود بعد از لود، دوباره سعی می‌کنیم پرش کنیم
function updateAgeElements() {
  const ageElements = document.querySelectorAll('#cargoWeight');
  ageElements.forEach(async (element) => {
    if (element.textContent.trim() === '' || element.textContent.trim() === '-') {
      try {
        const typeData = window.$data?.passenger?.passengerinfo?.type;
        if (typeData != null) {
          const result = await passenger_type(typeData, [mainlid]);
          if (result) element.textContent = result;
        }
      } catch (e) { /* noop */ }
    }
  });
}
window.addEventListener('load', () => {
  setTimeout(updateAgeElements, 1000);
  setTimeout(updateAgeElements, 3000);
});

// ======================= Fallback translations =====================
function ensureTranslationsReady() {
  if (!translations) {
    translations = {
      1: { adult: "بزرگسال", child: "کودک", infant: "نوزاد" },
      2: { adult: "Adult", child: "Child", infant: "Infant" },
      3: { adult: "بالغ", child: "طفل", infant: "رضيع" }
    };
  }
}
