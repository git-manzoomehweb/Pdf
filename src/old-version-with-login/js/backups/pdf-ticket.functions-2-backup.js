// loading
// متغیرهای کنترل لودینگ
let loadingStartTime = Date.now();
let isContentLoaded = false;
let isMinTimeElapsed = false;
let apiDataLoaded = false;
const MIN_LOADING_TIME = 4000; // 4 ثانیه حداقل
let mainlid;
let invoiceType;

function setlid(lid, invoice = null) {
  mainlid = lid;
  invoiceType = invoice;
}

function initializePageLanguage(lid, invoice = null) {
  const translations = {
    1: {
      // فارسی
      lang: "fa",
      dir: "rtl",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری",
      pdfLoadingText: "در حال تولید PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
      // ترجمه‌های جدید برای invoice 8 و 9
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
      trainNumber: "شماره قطار",
      route: "مسیر",
      departure: "رفت",
      return: "برگشت",
      adult: "بزرگسال",
      child: "کودک",
      infant: "نوزاد"
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
      // ترجمه‌های انگلیسی (بدون تغییر)
      electronTicket: "Electronic Ticket",
      downloadPdf: "Download PDF",
      hidePrice: "Hide Price",
      showPrice: "Show Price",
      invoiceNumber: "invoice number",
      pnrCode: "PNR Code",
      eticketNumber: "ETicket Number",
      dateOfIssue: "Date Of issue",
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
      trainNumber: "train number",
      route: "Route",
      departure: "Departure",
      return: "Return",
      adult: "Adult",
      child: "Child",
      infant: "Infant"
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
      // ترجمه‌های عربی
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
      trainNumber: "رقم القطار",
      route: "المسار",
      departure: "المغادرة",
      return: "العودة",
      adult: "بالغ",
      child: "طفل",
      infant: "رضيع"
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

  // تنظیم متون ثابت فقط اگر invoice برابر 8 یا 9 باشد
  setTimeout(() => {
    if (invoice === 8 || invoice === 9) {
      translatePageElements(t);
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
  }, 4000);
}

function translatePageElements(t) {
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
  translateTicketTitles(t);

  // ترجمه عناوین قیمت
  translatePriceTitles(t);

  // ترجمه شرایط کرایه
  const fareConditionsTitle = document.querySelector('h3.fare-condition');
  if (fareConditionsTitle && fareConditionsTitle.textContent.includes('Fare Conditions')) {
    fareConditionsTitle.textContent = t.fareConditions;
  }
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

function translateTicketTitles(t) {
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

  // ترجمه train number
  const trainNumberElements = document.querySelectorAll('span');
  trainNumberElements.forEach(element => {
    if (element.textContent.includes('train number:')) {
      element.innerHTML = element.innerHTML.replace('train number:', t.trainNumber + ':');
    }
  });
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

// بهبود فانکشن‌های موجود برای پشتیبانی از ترجمه
function passenger_type($data) {
  const t = window.currentTranslations || translations[2];
  if ($data == 0) {
    return t.infant;
  } else if ($data == 1) {
    return t.child;
  } else if ($data == 2) {
    return t.adult;
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

function checkContentLoaded() {
  const checkApiInterval = setInterval(() => {
    const hasApiContent = document.querySelector(
      '[datamembername="db.ticket_pdf"]' // برای ticket
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
// loading


// ticket pdf
// function togglePrice(element) {
//     const textSpan = element.querySelector(".button-content-text");
//     if (textSpan.textContent.trim() === "Hide Price") {
//         textSpan.textContent = "Show Price";
//         document.querySelector(".ticketContainer__info__details_PriceBox").classList.add("hidden");
//     } else {
//         textSpan.textContent = "Hide Price";
//         document.querySelector(".ticketContainer__info__details_PriceBox").classList.remove("hidden");
//     }
// }

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

            async function arrive_date_info($data , invoicetype) {


                var len = $data.length
                var arrive_date = $data[len - 1].route.routeDate.mstring
                var arrive_date_S = $data[len - 1].route.routeDate.sstring
                var arrive_dtime = $data[len - 1].route.atime
                if(invoicetype === 8){
                    return `<span id="landingDate" class=" text-sm">${arrive_date_S}</span> | <span id="landingTime" class=" text-sm">${arrive_dtime}</span>`
                }else{
                    return `<span id="landingDate" class=" text-sm">${await convertDateFormat(arrive_date)}</span> | <span id="landingTime" class=" text-sm">${arrive_dtime}</span>`
                }
            }



            function passenger_type($data) {
                if ($data == 0) {
                    return `Infant`
                } else if ($data == 1) {
                    return `Child`
                } else if ($data == 2) {
                    return `Adult`
                }
            }


            function passenger_gender(gender) {
                if (gender == 0) {
                    return `Ms.`
                } else if ($data == 1) {
                    return `Mr.`
                }
            }


            async function route_array($data , invoicetype) {
                var output = "";
                var data = $data;

                if(invoicetype === 8){
for (var i = 0; i < data.length; i++) {
  output += `<div class=" relative "><div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
                   
                    <div class="ticketContainer__details__path__item__times pathItem__times flex flex-col justify-between items-center w-1/6">
                        <span class="pathItem__times__start text-nowrap text-sm">
                           ${data[i].route.etime}
                        </span>

                    </div>

           

            <div class="ticketContainer__details__path__item__path pathItem__path flex  flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">



    <svg xmlns="http://www.w3.org/2000/svg" class="train-icon" fill="#9ca3af" width="23" height="23" viewBox="0 0 256 256" id="Flat" stroke="#9ca3af">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path d="M188,24H68A32.03667,32.03667,0,0,0,36,56V184a32.03667,32.03667,0,0,0,32,32H79.99976L65.59961,235.2002a8.00019,8.00019,0,0,0,12.80078,9.5996L100.00024,216h55.99952l21.59985,28.7998a8.00019,8.00019,0,0,0,12.80078-9.5996L176.00024,216H188a32.03667,32.03667,0,0,0,32-32V56A32.03667,32.03667,0,0,0,188,24ZM84,184a12,12,0,1,1,12-12A12,12,0,0,1,84,184Zm36-64H52V80h68Zm52,64a12,12,0,1,1,12-12A12,12,0,0,1,172,184Zm32-64H136V80h68Z"/> </g>

</svg>


</div>
                    <div class="ticketContainer__details__path__item__details pathItem__details w-4/6 px-2.5">

                        <h3 class="pathItem__details__city text-xl font-danamedium ">${
                          data[i].route.startairport.startotherinfo.city
                        }</h3>
                        
                        
                        
                        <span class="pathItem__details__airport text-xs text-gray-500 font-danaregular">${
                          data[i].route.startairport.airport
                        }<span class="text-sm mx-1 font-danabold">(${
    data[i].route.startairport.startotherinfo.shortname
  })</span></span>

                      
                        <div
                        class="pathItem__details__airline flex items-center gap-2 text-xs text-gray-500 absolute max-md:static top-16 bottom-auto my-auto flex-wrap">
                        <span class="flex gap-1 items-center">
                            <img class="mr-2.5" src="/${
                              data[i].route.trainimage
                            }" width="32" height="32" alt="${
                                data[i].route.trainid
                            }"/>
                            ${data[i].route.trainid}
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>train number: </span>

                            <span>${data[i].route.routecode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>${data[i].route.class}</span>
                        </span>
                    </div>
                    </div>
                </div>
              <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
                   
                    <div
                        class="ticketContainer__details__path__item__times pathItem__times relative flex flex-nowrap justify-end flex-col items-center w-1/6">
                        
                        

                        
                        <span class="pathItem__times__start text-nowrap text-sm">
                           ${data[i].route.atime}
                        </span>

                        
                    </div>
                 <div class="ticketContainer__details__path__item__path pathItem__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
    <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
</div>
                    <div class="ticketContainer__details__path__item__details pathItem__details w-4/6 px-2.5 pt-8">

                        <h3 class="pathItem__details__city text-xl font-danamedium ">${
                          data[i].route.endairport.endotherinfo.city
                        }</h3>
                        <span class="pathItem__details__airport text-xs text-gray-500 font-danaregular">${
                          data[i].route.endairport.airport
                        }<span class="text-sm mx-1 font-danabold">(${
    data[i].route.endairport.endotherinfo.shortname
  })</span></span>

                      
                        <div
                        class="hidden pathItem__details__airline flex items-center gap-2 text-xs text-gray-500 mt-1 absolute max-md:static top-16 bottom-auto my-auto ">
                        <span class="flex gap-1 items-center">
                            <img class="mr-2.5" src="/${
                              data[i].route.trainimage
                            }" width="50" height="50" alt="${
    data[i].route.trainid
  }"/>
                            ${data[i].route.trainid}
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>flight number: </span>

                            <span>${data[i].route.routecode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>${data[i].route.class}</span>
                        </span>
                    </div>
                    </div>
                </div>
            </div>
            `;
}



                }else{
                for (var i = 0; i < data.length; i++) {
                    output += `<div class=" relative ${(connection_time(data) && (i == 0 || i != data.length-1) ) ? 'mb-0' : 'mb-5'} "><div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
                   
                    <div class="ticketContainer__details__path__item__times pathItem__times flex flex-col justify-between items-center w-1/6">
                        <span class="pathItem__times__start text-nowrap text-sm">
                           ${data[i].route.etime}
                        </span>

                    </div>

           

            <div class="ticketContainer__details__path__item__path pathItem__path flex  flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
    <img class="max-w-none absolute right-0 z-10 ${(connection_time(data) && i == 0) ? '' : 'hidden'}" src="/images/airplane-route.png" width="17" height="23" alt="airplane-route"/>
</div>
                    <div class="ticketContainer__details__path__item__details pathItem__details w-4/6 px-2.5">

                        <h3 class="pathItem__details__city text-xl font-danamedium ">${data[i].route.startairport.startotherinfo.city}</h3>
                        
                        
                        
                        <span class="pathItem__details__airport text-xs text-gray-500 font-danaregular">${data[i].route.startairport.airport}<span class="text-sm mx-1 font-danabold">(${data[i].route.startairport.startotherinfo.shortname})</span></span>

                      
                        <div
                        class="pathItem__details__airline flex items-center gap-2 text-xs text-gray-500 mt-1 absolute max-md:static top-16 bottom-auto my-auto ">
                        <span class="flex gap-1 items-center">
                            <img class="mr-2.5" src="/${data[i].route.airlineimage}" width="50" height="50" alt="${data[i].route.airline}"/>
                            ${data[i].route.airline}
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>flight number: </span>

                            <span>${data[i].route.routecode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>${data[i].route.class} - ${data[i].route.classCode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9496 6.48717C10.9482 6.47081 10.941 6.42787 10.905 6.40762C10.8799 6.39243 10.8499 6.39749 10.8299 6.40762L10.8099 6.41774C9.7994 7.09622 8.58379 7.54685 7.30815 7.73419C7.12806 7.75951 6.94797 7.64305 6.89795 7.46078C6.78789 7.04559 6.43272 6.77217 6.0075 6.77217H5.9925L5.91363 6.77535C5.52384 6.8069 5.20523 7.07154 5.10205 7.46078C5.05203 7.64305 4.87194 7.75951 4.69185 7.73419C3.41621 7.54685 2.2006 7.09622 1.1901 6.41774C1.18509 6.41268 1.13507 6.3823 1.09505 6.40762C1.05002 6.43293 1.05002 6.49369 1.05002 6.49369L1.08504 9.07596L1.08751 9.17503C1.13839 10.1922 1.9683 11 2.98599 11H9.009L9.10688 10.9975C10.1119 10.946 10.91 10.106 10.91 9.07596L10.95 6.49369L10.9496 6.48717ZM5.62578 7.82488C5.6509 7.64088 5.80949 7.49622 5.9975 7.49622C6.2076 7.49622 6.37269 7.66837 6.37269 7.87597V8.52913L6.36932 8.58127C6.34486 8.76847 6.19009 8.90887 5.9975 8.90887C5.7924 8.90887 5.62231 8.74178 5.62231 8.52913V7.87597L5.62578 7.82488Z" fill="black"></path>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.10355 2.30632C8.0085 1.57215 7.3932 1 6.64282 1H5.35218C4.6018 1 3.98649 1.57215 3.89145 2.30632H2.90595C1.85543 2.30632 1 3.17214 1 4.23543C1 4.23543 1.02501 5.0658 1.04002 5.32403C1.04002 5.37466 1.06503 5.42023 1.10505 5.44555L1.58529 5.77972C2.41071 6.32706 3.37569 6.71845 4.3952 6.91389C4.46173 6.92655 4.52676 6.89263 4.56128 6.83389C4.85793 6.33415 5.4012 6.01263 5.9975 6.01263C6.5978 6.01263 7.13607 6.33769 7.42421 6.83693C7.45823 6.89668 7.52426 6.93162 7.5913 6.91845C8.61931 6.72352 9.58429 6.33162 10.4147 5.77466C10.4347 5.76453 10.6548 5.6177 10.8954 5.43998C10.935 5.41061 10.959 5.362 10.96 5.31238C10.97 4.68555 11 4.23543 11 4.23543C11 3.17214 10.1446 2.30632 9.09405 2.30632H8.10355ZM5.35218 1.75949H6.64282C6.97799 1.75949 7.26313 1.9924 7.34317 2.30632H4.65183C4.73187 1.9924 5.01701 1.75949 5.35218 1.75949Z" fill="black"></path>
                            </svg></span>

                            <span>${data[i].route.baggage.CheckedBag}</span>
                        </span>
                    </div>
                    </div>
                </div>
              <div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 min-h-[70px] max-[794px]:min-h-auto">
                   
                    <div
                        class="ticketContainer__details__path__item__times pathItem__times relative flex flex-nowrap justify-end flex-col items-center w-1/6">
                        
                        
                        <div class="absolute -top-[19px]">
                            <span class="text-xs text-gray-500 font-danabold">Travel Time</span>
                            <span class="pathItem__times__duration flex items-center gap-1 text-xs text-gray-500">
                                <svg width="12" height="12" viewBox="0 0 9 9" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_1_755)">
                                        <path
                                            d="M4.5 0.375C3.68415 0.375 2.88663 0.616927 2.20827 1.07019C1.52992 1.52345 1.00121 2.16769 0.688999 2.92143C0.376787 3.67518 0.295099 4.50458 0.454263 5.30475C0.613427 6.10492 1.00629 6.83992 1.58319 7.41682C2.16008 7.99371 2.89508 8.38658 3.69525 8.54574C4.49543 8.7049 5.32483 8.62321 6.07857 8.311C6.83232 7.99879 7.47655 7.47008 7.92981 6.79173C8.38307 6.11338 8.625 5.31585 8.625 4.5C8.62371 3.40638 8.1887 2.35792 7.41539 1.58461C6.64208 0.811302 5.59362 0.37629 4.5 0.375ZM4.5 7.875C3.83249 7.875 3.17997 7.67706 2.62495 7.30621C2.06994 6.93536 1.63735 6.40826 1.38191 5.79156C1.12646 5.17486 1.05963 4.49626 1.18985 3.84157C1.32008 3.18688 1.64151 2.58552 2.11352 2.11351C2.58552 1.64151 3.18689 1.32007 3.84157 1.18985C4.49626 1.05962 5.17486 1.12646 5.79156 1.38191C6.40826 1.63735 6.93536 2.06993 7.30621 2.62495C7.67706 3.17997 7.875 3.83249 7.875 4.5C7.87391 5.39477 7.51798 6.25258 6.88528 6.88528C6.25258 7.51798 5.39477 7.87391 4.5 7.875Z"
                                            fill="#BEBBCE" />
                                        <path
                                            d="M4.875 4.34475V2.25C4.875 2.15054 4.83549 2.05516 4.76516 1.98484C4.69484 1.91451 4.59946 1.875 4.5 1.875C4.40054 1.875 4.30516 1.91451 4.23484 1.98484C4.16451 2.05516 4.125 2.15054 4.125 2.25V4.5C4.12502 4.59945 4.16454 4.69482 4.23488 4.76512L5.35988 5.89012C5.4306 5.95843 5.52533 5.99623 5.62365 5.99538C5.72197 5.99452 5.81603 5.95508 5.88556 5.88556C5.95509 5.81603 5.99452 5.72197 5.99538 5.62365C5.99623 5.52533 5.95843 5.4306 5.89012 5.35988L4.875 4.34475Z"
                                            fill="#BEBBCE" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1_755">
                                            <rect width="9" height="9" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                ${data[i].route.timing}<span class="mx-[2px]">min</span>  
                            </span>
                        </div>
                        
                        <span class="pathItem__times__start text-nowrap text-sm">
                           ${data[i].route.atime}
                        </span>

                        
                    </div>
                 <div class="ticketContainer__details__path__item__path pathItem__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
    <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
</div>
                    <div class="ticketContainer__details__path__item__details pathItem__details w-4/6 px-2.5 pt-8">

                        <h3 class="pathItem__details__city text-xl font-danamedium ">${data[i].route.endairport.endotherinfo.city}</h3>
                        <span class="pathItem__details__airport text-xs text-gray-500 font-danaregular">${data[i].route.endairport.airport}<span class="text-sm mx-1 font-danabold">(${data[i].route.endairport.endotherinfo.shortname})</span></span>

                      
                        <div
                        class="hidden pathItem__details__airline flex items-center gap-2 text-xs text-gray-500 mt-1 absolute max-md:static top-16 bottom-auto my-auto ">
                        <span class="flex gap-1 items-center">
                            <img class="mr-2.5" src="/${data[i].route.airlineimage}" width="50" height="50" alt="${data[i].route.airline}"/>
                            ${data[i].route.airline}
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>flight number: </span>

                            <span>${data[i].route.routecode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span>${data[i].route.class} - ${data[i].route.classCode}</span>
                        </span>

                        |

                        <span class="flex gap-1 items-center">
                            <span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9496 6.48717C10.9482 6.47081 10.941 6.42787 10.905 6.40762C10.8799 6.39243 10.8499 6.39749 10.8299 6.40762L10.8099 6.41774C9.7994 7.09622 8.58379 7.54685 7.30815 7.73419C7.12806 7.75951 6.94797 7.64305 6.89795 7.46078C6.78789 7.04559 6.43272 6.77217 6.0075 6.77217H5.9925L5.91363 6.77535C5.52384 6.8069 5.20523 7.07154 5.10205 7.46078C5.05203 7.64305 4.87194 7.75951 4.69185 7.73419C3.41621 7.54685 2.2006 7.09622 1.1901 6.41774C1.18509 6.41268 1.13507 6.3823 1.09505 6.40762C1.05002 6.43293 1.05002 6.49369 1.05002 6.49369L1.08504 9.07596L1.08751 9.17503C1.13839 10.1922 1.9683 11 2.98599 11H9.009L9.10688 10.9975C10.1119 10.946 10.91 10.106 10.91 9.07596L10.95 6.49369L10.9496 6.48717ZM5.62578 7.82488C5.6509 7.64088 5.80949 7.49622 5.9975 7.49622C6.2076 7.49622 6.37269 7.66837 6.37269 7.87597V8.52913L6.36932 8.58127C6.34486 8.76847 6.19009 8.90887 5.9975 8.90887C5.7924 8.90887 5.62231 8.74178 5.62231 8.52913V7.87597L5.62578 7.82488Z" fill="black"></path>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.10355 2.30632C8.0085 1.57215 7.3932 1 6.64282 1H5.35218C4.6018 1 3.98649 1.57215 3.89145 2.30632H2.90595C1.85543 2.30632 1 3.17214 1 4.23543C1 4.23543 1.02501 5.0658 1.04002 5.32403C1.04002 5.37466 1.06503 5.42023 1.10505 5.44555L1.58529 5.77972C2.41071 6.32706 3.37569 6.71845 4.3952 6.91389C4.46173 6.92655 4.52676 6.89263 4.56128 6.83389C4.85793 6.33415 5.4012 6.01263 5.9975 6.01263C6.5978 6.01263 7.13607 6.33769 7.42421 6.83693C7.45823 6.89668 7.52426 6.93162 7.5913 6.91845C8.61931 6.72352 9.58429 6.33162 10.4147 5.77466C10.4347 5.76453 10.6548 5.6177 10.8954 5.43998C10.935 5.41061 10.959 5.362 10.96 5.31238C10.97 4.68555 11 4.23543 11 4.23543C11 3.17214 10.1446 2.30632 9.09405 2.30632H8.10355ZM5.35218 1.75949H6.64282C6.97799 1.75949 7.26313 1.9924 7.34317 2.30632H4.65183C4.73187 1.9924 5.01701 1.75949 5.35218 1.75949Z" fill="black"></path>
                            </svg></span>

                            <span>${data[i].route.baggage.CheckedBag}</span>
                        </span>
                    </div>
                    </div>
                </div>
                ${await connection_time(data[i].route.connectionTime)}
            </div>
            `
                }
                }

                return output;
            }

            function baggages_array($data) {

                var output = "";
                var data = $data
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        output += `<div dir="${detectDirection(data[i].baggage.type)}" >${data[i].baggage.type}</div><div dir="${detectDirection(data[i].baggage.type)}" >${data[i].baggage.title}</div><br/>`
                    }
                    return output;
                }


            }

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
    // return output;
}



            function connection_time($data) {
                var output = "";
                var data = $data
                if (data !== undefined) {
                    let connectiontime = parseFloat(data)
                    if (connectiontime !== 0) {
                        const hours = Math.floor(connectiontime / 60);
                        const minutes = connectiontime % 60;
                        output += `<div class="ticketContainer__details__path__item pathItem flex gap-2 relative mt-1 h-12">

    <div
        class="ticketContainer__details__path__item__times pathItem__times flex flex-nowrap justify-center flex-col items-center w-1/6 -mt-[10px]">
        <span class="pathItem__times__start text-nowrap text-sm">
            <span class="text-xs text-gray-500 font-danabold" >Connection Time </span>
            <span class="flex justify-center items-center text-center text-xs text-gray-500">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.89035 4.7532C8.68596 4.02783 9.76188 3.0468 9.85995 0.703125H10.5703V0H1.42969V0.703125H2.14005C2.23812 3.0468 3.31404 4.02783 4.10965 4.7532C4.64334 5.23978 4.94531 5.5376 4.94531 6C4.94531 6.4624 4.64334 6.76022 4.10965 7.2468C3.31404 7.97217 2.23812 8.9532 2.14005 11.2969H1.42969V12H10.5703V11.2969H9.85995C9.76188 8.9532 8.68596 7.97217 7.89035 7.2468C7.35666 6.76022 7.05469 6.4624 7.05469 6C7.05469 5.5376 7.35666 5.23978 7.89035 4.7532ZM5.64844 8.63527C5.53985 8.65767 5.43258 8.69027 5.32788 8.73359L3.17452 9.62466C3.52617 8.73052 4.09256 8.21388 4.58337 7.76641C5.1311 7.26703 5.64844 6.79535 5.64844 6V8.63527ZM7.41663 7.76641C7.90744 8.21388 8.4738 8.73052 8.82548 9.62463L6.67212 8.73356C6.56742 8.69025 6.46015 8.65765 6.35156 8.63524V6C6.35156 6.79535 6.8689 7.26703 7.41663 7.76641ZM3.16216 2.34375C2.99217 1.9008 2.87477 1.36598 2.84405 0.703125H9.15593C9.1252 1.36598 9.00783 1.9008 8.83781 2.34375H3.16216Z" fill="#BEBBCE"/>
</svg>
<span>
                ${hours}H : ${minutes}M
                </span>
                </span>
        </span>
    </div>
    <div
        class="ticketContainer__details__path__item__path pathItem__path flex flex-col items-center relative border-l-2 border-dashed border-gray-400 w-2.5">
        <div class="w-2 h-2 rounded-full bg-gray-400 absolute bottom-0 right-[5px]"></div>
    </div>
</div>`
                    }
                    return output;
                }
            }
            async function multi_route_array($data , invoicetype) {
                var output = "";
                var data = $data

                if (data.length > 1) {

                                    if(invoicetype === 8){

                                                            for (var i = 1; i < data.length; i++) {
                        var segment_len = data[i].segment.length
                        output += `
            <div class="return_stracture mt-4 ticketContainer border-2 border-dashed overflow-hidden border-gray-400 rounded-2xl mx-auto max-w-screen-md min-w-[794px] shrink-0 ">
        <div class="ticketContainer__details w-full">
            <div class="ticketContainer__details__time px-4 py-2 flex gap-3 w-full items-center text-sm">Route ${data[i].segment_id} : </div>
            <div class="ticketContainer__details__time px-12 py-2 flex gap-3 w-full items-center bg-[#F9C643] text-sm">
                

                <div class="ticketContainer__details__time__flight flex items-center gap-2 shrink-0">
<svg xmlns="http://www.w3.org/2000/svg" fill="#9ca3af" class="train-icon" width="23" height="23" viewBox="0 0 256 256" id="Flat" stroke="#9ca3af">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path d="M188,24H68A32.03667,32.03667,0,0,0,36,56V184a32.03667,32.03667,0,0,0,32,32H79.99976L65.59961,235.2002a8.00019,8.00019,0,0,0,12.80078,9.5996L100.00024,216h55.99952l21.59985,28.7998a8.00019,8.00019,0,0,0,12.80078-9.5996L176.00024,216H188a32.03667,32.03667,0,0,0,32-32V56A32.03667,32.03667,0,0,0,188,24ZM84,184a12,12,0,1,1,12-12A12,12,0,0,1,84,184Zm36-64H52V80h68Zm52,64a12,12,0,1,1,12-12A12,12,0,0,1,172,184Zm32-64H136V80h68Z"/> </g>

</svg>
        
                            <span id="flightDate" class=" text-sm">${await convertDateFormat(data[i].segment[0].route.routeDate.mstring)}</span>
                            |
                            <span id="flightTime" class=" text-sm">${data[i].segment[0].route.etime}</span>
                        </div>


                        <div class="ticketContainer__details__time__arrow h-[2px] w-full flex relative z-10 justify-end ">
                           <img class="absolute right-[-6px] top-[-15px] z-[9]"  src="/images/arrow-rtl.png" width="32" height="32" alt="arrow-rtl"/>
                        </div>


                        <div class="ticketContainer__details__time__landing flex items-center gap-2 shrink-0">
<svg xmlns="http://www.w3.org/2000/svg" fill="#9ca3af" class="train-icon" width="23" height="23" viewBox="0 0 256 256" id="Flat" stroke="#9ca3af">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path d="M188,24H68A32.03667,32.03667,0,0,0,36,56V184a32.03667,32.03667,0,0,0,32,32H79.99976L65.59961,235.2002a8.00019,8.00019,0,0,0,12.80078,9.5996L100.00024,216h55.99952l21.59985,28.7998a8.00019,8.00019,0,0,0,12.80078-9.5996L176.00024,216H188a32.03667,32.03667,0,0,0,32-32V56A32.03667,32.03667,0,0,0,188,24ZM84,184a12,12,0,1,1,12-12A12,12,0,0,1,84,184Zm36-64H52V80h68Zm52,64a12,12,0,1,1,12-12A12,12,0,0,1,172,184Zm32-64H136V80h68Z"/> </g>

</svg>
                            <span id="landingDate" class=" text-sm">${await convertDateFormat(data[i].segment[segment_len - 1].route.routeDate.mstring)}</span> | 
                            <span id="landingTime" class=" text-sm">${data[i].segment[segment_len - 1].route.atime}</span>
                        </div>
            </div>
            <div class="ticketContainer__details__path pathContainer p-4 flex flex-col">
                ${await route_array(data[i].segment)}
            </div>
            </div></div>`
                    }
                    
                                    }else{
                    for (var i = 1; i < data.length; i++) {
                        var segment_len = data[i].segment.length
                        output += `
            <div class="return_stracture mt-4 ticketContainer border-2 border-dashed overflow-hidden border-gray-400 rounded-2xl mx-auto max-w-screen-md min-w-[794px] shrink-0 ">
        <div class="ticketContainer__details w-full">
            <div class="ticketContainer__details__time px-4 py-2 flex gap-3 w-full items-center text-sm">Route ${data[i].segment_id} : </div>
            <div class="ticketContainer__details__time px-12 py-2 flex gap-3 w-full items-center bg-[#F9C643] text-sm">
                

                <div class="ticketContainer__details__time__flight flex items-center gap-2 shrink-0">
                            <svg width="22" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_1_717)">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M12.9967 4.04383C12.4616 3.83566 11.7331 3.91 11.0456 4.24442C10.4088 4.55709 9.78484 4.91151 9.11998 5.26178C8.30949 4.65771 7.48892 4.07605 6.6662 3.49506C6.1033 3.09873 5.55654 2.99132 5.04397 3.17539C4.75521 3.27773 4.48568 3.41493 4.22368 3.54778C4.11657 3.60258 4.0077 3.65757 3.89561 3.71157C3.7801 3.76681 3.69244 3.86712 3.65247 3.98997C3.6128 4.11145 3.62499 4.24437 3.6862 4.35748L5.30417 7.34695C4.95632 7.53815 4.54275 7.7678 4.13505 7.99418C3.77818 8.19254 3.42503 8.3883 3.12222 8.55566L2.87823 8.10715C2.75308 7.88034 2.46796 7.79743 2.24155 7.9221C2.01504 8.04589 1.93134 8.33197 2.0565 8.55878L2.48153 9.33888C3.41411 11.0117 4.96594 11.4859 6.63407 10.6058C8.41206 9.6675 10.3557 8.61404 12.7506 7.2883C13.0439 7.12684 13.3203 6.90271 13.537 6.63508C13.9201 6.162 14.1135 5.55465 13.8625 4.92513C13.6961 4.50402 13.3965 4.19867 12.9967 4.04383Z"
                                        fill="#2F2F2F" />
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M12.1 13.2007H3.27127C3.01252 13.2007 2.80252 13.4107 2.80252 13.6695C2.80252 13.9282 3.01252 14.1382 3.27127 14.1382H12.1C12.3588 14.1382 12.5688 13.9282 12.5688 13.6695C12.5688 13.4107 12.3588 13.2007 12.1 13.2007Z"
                                        fill="#2F2F2F" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1_717">
                                        <rect width="15" height="15" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
        
                            <span id="flightDate" class=" text-sm">${await convertDateFormat(data[i].segment[0].route.routeDate.mstring)}</span>
                            |
                            <span id="flightTime" class=" text-sm">${data[i].segment[0].route.etime}</span>
                        </div>


                        <div class="ticketContainer__details__time__arrow h-[2px] w-full flex relative z-10 justify-end ">
                           <img class="absolute right-[-6px] top-[-15px] z-[9]"  src="/images/arrow-rtl.png" width="32" height="32" alt="arrow-rtl"/>
                        </div>


                        <div class="ticketContainer__details__time__landing flex items-center gap-2 shrink-0">
                            <svg width="22" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12.9765 9.27775C12.8015 8.73088 12.2852 8.2115 11.5927 7.88775C10.949 7.58963 10.2809 7.32775 9.59024 7.0315C9.54961 6.02148 9.48524 5.01773 9.41899 4.01273C9.37274 3.32585 9.11211 2.83335 8.64649 2.55085C8.38524 2.39085 8.10899 2.26773 7.84086 2.14773C7.73086 2.09898 7.61961 2.04898 7.50711 1.99585C7.39149 1.94085 7.25836 1.93585 7.13774 1.9821C7.01836 2.02773 6.92274 2.12085 6.87336 2.2396L5.56837 5.37835C5.20087 5.22835 4.76212 5.05148 4.32962 4.8771C3.95087 4.7246 3.57649 4.57335 3.25587 4.44335L3.45087 3.97148C3.54837 3.73148 3.43337 3.45773 3.19399 3.36023C2.95524 3.2621 2.68024 3.3771 2.58274 3.6171L2.24399 4.43835C1.53087 6.21585 2.13899 7.72025 3.87274 8.46275C5.72087 9.254 7.76274 10.1015 10.3002 11.1284C10.6102 11.2546 10.9584 11.3284 11.3027 11.3284C11.9115 11.3284 12.5052 11.0965 12.8365 10.5053C13.059 10.1109 13.1077 9.68588 12.9765 9.27775Z"
                                    fill="#2F2F2F" />
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12.1 13.2007H3.27127C3.01252 13.2007 2.80252 13.4107 2.80252 13.6695C2.80252 13.9282 3.01252 14.1382 3.27127 14.1382H12.1C12.3588 14.1382 12.5688 13.9282 12.5688 13.6695C12.5688 13.4107 12.3588 13.2007 12.1 13.2007Z"
                                    fill="#2F2F2F" />
                            </svg>
                            <span id="landingDate" class=" text-sm">${await convertDateFormat(data[i].segment[segment_len - 1].route.routeDate.mstring)}</span> | 
                            <span id="landingTime" class=" text-sm">${data[i].segment[segment_len - 1].route.atime}</span>
                        </div>
            </div>
            <div class="ticketContainer__details__path pathContainer p-4 flex flex-col">
                ${await route_array(data[i].segment)}
            </div>
            </div></div>`
                    }
                                    }

                    return output;
                }
            }
            function convertDateFormat($data) {
                var output = "";
                var dateString = $data;
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const parts = dateString.split('-');
                const year = parts[0];
                const month = monthNames[parseInt(parts[1]) - 1];
                const day = parts[2];
                return `${day} ${month} ${year}`;
            }