// ----------------------------- Voucher PDF --------------------------------
// متغیرهای کنترل لودینگ
let loadingStartTime = Date.now();
let isContentLoaded = false;
let isMinTimeElapsed = false;
let apiDataLoaded = false;
const MIN_LOADING_TIME = 4000; // 2 ثانیه حداقل
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
      mainTitle: "واچر",
      contractNumber: "شماره قرارداد",
      issueDate: "تاریخ صدور",
      contractTime: "ساعت قرارداد",
      accessDenied: "شما اجازه دسترسی به این صفحه را ندارید",
      loadingText: "در حال بارگذاری",
      pdfLoadingText: "در حال تولید PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
    },
    2: {
      // انگلیسی
      lang: "en",
      dir: "ltr",
      mainTitle: "Voucher",
      contractNumber: "Contract Number",
      issueDate: "Issue Date",
      contractTime: "Contract Time",
      accessDenied: "You do not have permission to access this page",
      loadingText: "Loading",
      pdfLoadingText: "Generating PDF",
      textAlign: "text-left",
      justifyContent: "!justify-start",
    },
    3: {
      // عربی
      lang: "ar",
      dir: "rtl",
      mainTitle: "قسيمة",
      contractNumber: "رقم العقد",
      issueDate: "تاريخ الإصدار",
      contractTime: "وقت العقد",
      accessDenied: "ليس لديك إذن للوصول إلى هذه الصفحة",
      loadingText: "جاري التحميل",
      pdfLoadingText: "جاري إنشاء PDF",
      textAlign: "text-right",
      justifyContent: "!justify-end",
    },
  };

  const t = translations[lid] || translations[1];
  window.currentTranslations = t;

  // تنظیم attributes اصلی HTML
  // const htmlRoot = document.getElementById("html-root");
  // const body = document.body;
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

    const contractNumberLabel = document.getElementById("contract-number-label");
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
  }, 4000);
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
      '[datamembername="db.voucher_pdf"]' // تغییر برای voucher
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




            // function extractFilenameFromUrl(url) {
            //     if (!url) return "";
            //     try {
            //         const parsedUrl = new URL(url);
            //         return parsedUrl.pathname.split('/').pop();
            //     } catch (e) {
            //         return url.split('/').pop();
            //     }
            // }

// invoice pdf functions
let globalInvoiceType = null;
    function setInvoiceType(type) {
      globalInvoiceType = type;
      console.log(globalInvoiceType)
    }


    function safeValue(value) {
      return (value !== undefined && value !== null && value !== '') ? value : '-';
    }

    function renderBillSection(bill = {}) {
      const {
        totalprice = 0,
        commission = 0,
        totalwithcommisions = 0,
        unit = "-",
        coupon = {}
      } = bill;

      const { couponcost = 0, couponcode = "-" } = coupon;

      const formatPrice = (num) => {
        if (typeof num === 'number') return num.toLocaleString();
        const parsed = parseFloat(num);
        return isNaN(parsed) ? "-" : parsed.toLocaleString();
      };

      return `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="bank-card-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.64871 11.2761H7.63721C7.34396 11.2761 7.10596 11.0381 7.10596 10.7449C7.10596 10.4516 7.34396 10.2136 7.63721 10.2136H8.64871C8.94196 10.2136 9.17996 10.4516 9.17996 10.7449C9.17996 11.0381 8.94196 11.2761 8.64871 11.2761ZM5.89753 11.2761H4.88603C4.59278 11.2761 4.35478 11.0381 4.35478 10.7449C4.35478 10.4516 4.59278 10.2136 4.88603 10.2136H5.89753C6.19078 10.2136 6.42878 10.4516 6.42878 10.7449C6.42878 11.0381 6.19078 11.2761 5.89753 11.2761ZM1.98398 7.50073C1.86662 7.50073 1.77148 7.59586 1.77148 7.71323V10.8299C1.77148 12.8083 3.04223 14.1378 4.93278 14.1378H12.0657C13.9577 14.1378 15.2284 12.8083 15.2284 10.8299V7.71323C15.2284 7.59586 15.1333 7.50073 15.0159 7.50073H1.98398Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.0159 6.43817C15.1333 6.43817 15.2284 6.34303 15.2284 6.22567V6.169C15.2284 4.19063 13.9577 2.86108 12.0664 2.86108H4.93278C3.04223 2.86108 1.77148 4.19063 1.77148 6.169V6.22567C1.77148 6.34303 1.86662 6.43817 1.98398 6.43817H15.0159Z" fill="#292929"/>
</svg>
        <span>Total Cost Table</span>
      </h2>
      <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
        <table class="w-full text-left border-separate border-spacing-y-2 border-none">
          <thead>
            <tr>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Total Cost :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Commission :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Discount :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Discount code:</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Cost by Commission :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Unit:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(totalprice)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(commission)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(couponcost)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${safeValue(couponcode)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(totalwithcommisions)}</td>
              <td class="text-[#292929] text-xs font-dana_FANum_medium">${safeValue(unit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
    }

    function renderPriceDetailsSection($data, priceDetails = {}) {
      const type = $data?.invoiceDetails?.invoicetype;

      const formatPrice = (num) => {
        if (typeof num === 'number') return num.toLocaleString();
        const parsed = parseFloat(num);
        return isNaN(parsed) ? "-" : parsed.toLocaleString();
      };

      // جدول دو ردیفه با هدر (label) و مقدار (value) کنار هم
      const renderMultiRowTable = (columns = []) => {
        const headers = columns.map(col => `
      <th class="text-[#6D6D6D] text-xs font-danaregular">${col.label}</th>
    `).join('');

        const values = columns.map(col => `
      <td class="text-[#292929] text-xs font-danamedium">
        ${col.label === 'Unit' ? col.value : formatPrice(col.value)}
      </td>
    `).join('');

        return `
      <table class="w-full text-left border-separate border-spacing-y-2 border-none">
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          <tr>${values}</tr>
        </tbody>
      </table>
    `;
      };

      // این تابع برای بخش‌های تک‌ردیفه (که قبلا بود)
      const renderRow = (label, value) => `
    <tr>
      <td class="text-[#6D6D6D] text-xs font-danaregular">${label}</td>
      <td class="text-[#292929] text-xs font-danamedium">
        ${label === 'Unit' ? value : formatPrice(value)}
      </td>
    </tr>
  `;

      const startSection = (title) => `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
        <span>${title}</span>
      </h2>
      <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
        <table class="w-full text-left border-separate border-spacing-y-2 border-none">
          <tbody>
  `;

      const endSection = () => `
          </tbody>
        </table>
      </div>
    </section>
  `;

      const renderCostTableByProduct = ({
        flight = 0,
        hotel = 0,
        insurance = 0,
        service = 0,
        transfer = 0,
        visa = 0,
        total = 0,
        unit = '-'
      }) => `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
        <span>Cost Table By Product</span>
      </h2>
      <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
        <table class="w-full text-left border-separate border-spacing-y-2 border-none">
          <thead>
            <tr>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Flight :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Hotel :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Insurance :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">service :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">transfer :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">visa :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Total Cost :</th>
              <th class="text-[#6D6D6D] text-xs font-danaregular">Unit :</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(flight)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(hotel)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(insurance)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(service)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(transfer)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(visa)}</td>
              <td class="text-[#292929] text-xs font-danamedium">${formatPrice(total)}</td>
              <td class="text-[#292929] text-xs font-dana_FANum_medium">${unit}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

      switch (type) {

        case '3': { // Hotel Room Price
          const parts = [];

          if (Array.isArray(priceDetails.roomPrice)) {
            priceDetails.roomPrice.forEach((item, index) => {
              const roomData = item.room || {};
              const guests = Object.entries(roomData); // مانند [["adult", {...}]]

              guests.forEach(([guestType, guestData]) => {
                const { roomIndex, count, perperson, total, unit } = guestData;
                parts.push(`
          <section class="dir-ltr mt-4">
            <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
              <span>Room ${roomIndex} - ${guestType.charAt(0).toUpperCase() + guestType.slice(1)}</span>
            </h2>
            <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
              <table class="w-full text-left border-separate border-spacing-y-2 border-none">
                <thead>
                  <tr>
                    <th class="text-[#6D6D6D] text-xs font-danaregular">Count</th>
                    <th class="text-[#6D6D6D] text-xs font-danaregular">Per Person</th>
                    <th class="text-[#6D6D6D] text-xs font-danaregular">Total</th>
                    <th class="text-[#6D6D6D] text-xs font-danaregular">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-[#292929] text-xs font-danamedium">${formatPrice(count)}</td>
                    <td class="text-[#292929] text-xs font-danamedium">${formatPrice(perperson)}</td>
                    <td class="text-[#292929] text-xs font-danamedium">${formatPrice(total)}</td>
                    <td class="text-[#292929] text-xs font-dana_FANum_medium">${unit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        `);
              });
            });
          }

          return parts.join('');
        }


        case '4': { // tour
          const parts = [];

          if (Array.isArray(priceDetails.roomPrice)) {
            priceDetails.roomPrice.forEach((item, index) => {
              const roomData = item.room || {};
              const guests = Object.entries(roomData); // مثال: [["adult", [ { adult: {...} } ]] یا [["adult", { adult: {...} }]]

              guests.forEach(([guestType, guestList]) => {
                // حالت جدید: guestList یک آرایه از آبجکت‌هاست
                if (Array.isArray(guestList)) {
                  guestList.forEach((guestItem) => {
                    const guest = guestItem[guestType] || {};
                    const { roomIndex, count, perperson, total, unit } = guest;

                    parts.push(`
              <section class="dir-ltr mt-4">
                <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                  <span>Room ${roomIndex} - ${guestType.charAt(0).toUpperCase() + guestType.slice(1)}</span>
                </h2>
                <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                  <table class="w-full text-left border-separate border-spacing-y-2 border-none">
                    <thead>
                      <tr>
                        <th class="text-[#6D6D6D] text-xs font-danaregular">Count</th>
                        <th class="text-[#6D6D6D] text-xs font-danaregular">Per Person</th>
                        <th class="text-[#6D6D6D] text-xs font-danaregular">Total</th>
                        <th class="text-[#6D6D6D] text-xs font-danaregular">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-[#292929] text-xs font-danamedium">${formatPrice(count)}</td>
                        <td class="text-[#292929] text-xs font-danamedium">${formatPrice(perperson)}</td>
                        <td class="text-[#292929] text-xs font-danamedium">${formatPrice(total)}</td>
                        <td class="text-[#292929] text-xs font-dana_FANum_medium">${unit}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            `);
                  });
                }
                // حالت قدیمی: guestList آبجکت ساده است (بدون آرایه)
                else if (typeof guestList === 'object') {
                  const guest = guestList[guestType] || {};
                  const { roomIndex, count, perperson, total, unit } = guest;

                  parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Room ${roomIndex} - ${guestType.charAt(0).toUpperCase() + guestType.slice(1)}</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                <table class="w-full text-left border-separate border-spacing-y-2 border-none">
                  <thead>
                    <tr>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Count</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Per Person</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Total</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(count)}</td>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(perperson)}</td>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(total)}</td>
                      <td class="text-[#292929] text-xs font-dana_FANum_medium">${unit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          `);
                }
              });
            });
          }

          return parts.join('');
        }

        case '6': // Flight + Hotel + Insurance
          return renderCostTableByProduct(priceDetails);


        case '11': { // Lounge
          const parts = [];

          if (priceDetails.adult?.length) {
            priceDetails.adult.forEach(item => {
              const { count, perperson, total, unit } = item.adult;
              parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Adult Lounge Info</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                ${renderMultiRowTable([
                { label: 'Count', value: count },
                { label: 'Per Person', value: perperson },
                { label: 'Total', value: total },
                { label: 'Unit', value: unit }
              ])}
              </div>
            </section>
          `);
            });
          }

          if (priceDetails.services?.length) {
            priceDetails.services.forEach(item => {
              const { name, count, perperson, total, unit } = item.service;
              parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Service: ${name}</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                ${renderMultiRowTable([
                { label: 'Count', value: count },
                { label: 'Per Person', value: perperson },
                { label: 'Total', value: total },
                { label: 'Unit', value: unit }
              ])}
              </div>
            </section>
          `);
            });
          }

          if (priceDetails.transfers?.length) {
            priceDetails.transfers.forEach(item => {
              const { car_name, perperson, total, unit } = item.transfer;
              parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Transfer: ${car_name}</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                ${renderMultiRowTable([
                { label: 'Per Person', value: perperson },
                { label: 'Total', value: total },
                { label: 'Unit', value: unit }
              ])}
              </div>
            </section>
          `);
            });
          }

          if (priceDetails.escortinfo?.length) {
            priceDetails.escortinfo.forEach(item => {
              const { firsname, lastname, perperson, total, unit } = item.escort;
              parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Escort: ${firsname} ${lastname}</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                ${renderMultiRowTable([
                { label: 'Per Person', value: perperson },
                { label: 'Total', value: total },
                { label: 'Unit', value: unit }
              ])}
              </div>
            </section>
          `);
            });
          }

          return parts.join('');
        }


        case '12': { return ""; }


        default: { // train-1
          const parts = [];

          if (priceDetails.adult?.length) {
            priceDetails.adult.forEach((item, index) => {
              // دقت کن که item.adult وجود داره و مقادیرش
              const { special_class, count, perperson, total, unit } = item.adult;
              parts.push(`
            <section class="dir-ltr mt-4">
              <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg id="coins-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.45249 8.28039C5.08416 8.23081 4.72291 8.15289 4.36874 8.03248C4.08541 7.94039 3.80916 7.81998 3.54708 7.64289C3.47624 7.60039 3.41249 7.54373 3.33458 7.48706V9.15873C3.32749 9.36414 3.38416 9.52706 3.49749 9.66164C3.66041 9.86706 3.85874 9.99456 4.07124 10.1008C4.37583 10.2566 4.69458 10.3558 5.02041 10.4337C5.33916 10.5046 5.65791 10.5471 5.97666 10.5683C6.17499 10.5825 6.37333 10.5896 6.57166 10.5825C6.57874 10.0866 6.57874 9.39956 6.57874 9.22248L6.57166 8.34414C6.20333 8.35831 5.82791 8.32998 5.45249 8.28039Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33882 11.326C5.0484 11.2765 4.75798 11.2127 4.47465 11.1348C4.14173 11.0427 3.82298 10.901 3.5184 10.6885C3.46173 10.646 3.39798 10.6035 3.33423 10.554C3.33423 10.5894 3.33423 11.6873 3.32715 12.2044C3.32715 12.4523 3.40507 12.6294 3.53965 12.7781C3.69548 12.9552 3.87965 13.0685 4.0709 13.1677C4.41798 13.3377 4.77215 13.444 5.1334 13.5148C5.4734 13.5856 5.82048 13.621 6.16756 13.6352C6.30215 13.6423 6.43673 13.6423 6.57132 13.6423C6.5784 13.1819 6.5784 12.2752 6.5784 12.0556V11.404C6.50756 11.411 6.42965 11.411 6.35882 11.411C6.01882 11.411 5.67882 11.3898 5.33882 11.326Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.84542 5.72323C9.08626 5.67365 9.32709 5.63115 9.57501 5.60282V4.46948C9.50417 4.52615 9.44042 4.56865 9.37667 4.61823C8.86667 4.95115 8.32126 5.10698 7.76167 5.21323C7.49959 5.25573 7.23751 5.28407 6.97541 5.30532C6.46541 5.34782 5.96249 5.33365 5.45249 5.26282C5.08416 5.21323 4.72291 5.13532 4.36874 5.0149C4.08541 4.92282 3.80916 4.8024 3.54708 4.62532C3.47624 4.57573 3.41249 4.52615 3.33458 4.46948V6.14115C3.32749 6.33948 3.38416 6.5024 3.49749 6.64407C3.66041 6.84948 3.85874 6.97698 4.07124 7.08323C4.37583 7.23906 4.69458 7.33823 5.02041 7.41614C5.33916 7.48698 5.65791 7.52947 5.97666 7.55072C6.18208 7.56489 6.38749 7.57198 6.58583 7.56489C6.59291 7.33114 6.66374 7.0549 6.86916 6.78573C7.10292 6.48115 7.37209 6.30407 7.58459 6.18365C7.94584 5.98532 8.34959 5.83657 8.84542 5.72323Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.53391 3.63441C3.71382 3.83771 3.92703 3.96379 4.14803 4.06862C4.54753 4.25846 4.96261 4.36187 5.38266 4.42916C5.73824 4.48654 6.09524 4.51487 6.38282 4.50991C7.05432 4.51062 7.64933 4.44333 8.23583 4.26908C8.52837 4.18196 8.81312 4.06791 9.08087 3.88871C9.2275 3.79025 9.36491 3.67479 9.47045 3.50691C9.61141 3.2845 9.61354 3.02525 9.47045 2.80566C9.42158 2.73058 9.36491 2.66116 9.304 2.60237C9.07662 2.38208 8.81454 2.25387 8.54537 2.14833C8.06583 1.96062 7.57354 1.86783 7.07486 1.82604C6.39486 1.76866 5.7177 1.79771 5.04478 1.94646C4.67928 2.0265 4.32086 2.13912 3.97945 2.32966C3.79741 2.43166 3.62386 2.55208 3.48432 2.73837C3.36816 2.8935 3.30016 3.06987 3.34903 3.29158C3.3802 3.43183 3.45032 3.54021 3.53391 3.63441Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6712 12.1025C13.6457 12.1217 13.6329 12.1323 13.6195 12.1415C13.4721 12.2357 13.3291 12.3412 13.1768 12.4206C12.6399 12.7032 12.0753 12.8342 11.5008 12.9115C11.1531 12.9582 10.8038 12.9731 10.4539 12.9702C10.1118 12.9681 9.76968 12.9469 9.4311 12.8874C9.14281 12.8357 8.85523 12.7698 8.57048 12.6912C8.23756 12.5991 7.91527 12.4602 7.61422 12.2492C7.55472 12.2074 7.49522 12.1635 7.42722 12.1139C7.42722 12.15 7.43218 13.2444 7.42439 13.7664C7.42156 14.0087 7.49877 14.1879 7.63477 14.338C7.79273 14.5123 7.97689 14.6292 8.16885 14.7255C8.51027 14.8969 8.86514 15.0003 9.2271 15.074C9.56993 15.1434 9.91489 15.1824 10.2613 15.1951C10.8584 15.2171 11.452 15.176 12.0406 15.0372C12.3792 14.9571 12.7114 14.8495 13.0273 14.6717C13.2079 14.5704 13.3794 14.45 13.5189 14.2658C13.6202 14.1319 13.674 13.9761 13.6726 13.7834C13.6691 13.2515 13.6712 12.1408 13.6712 12.1025Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.58965 11.2204C7.75328 11.4258 7.95374 11.5533 8.16269 11.6609C8.4694 11.8189 8.78815 11.9174 9.11257 11.9917C9.4299 12.0647 9.74936 12.1093 10.0702 12.1299C10.6907 12.1702 11.3084 12.1376 11.9225 12.0066C12.2958 11.9273 12.662 11.8147 13.0112 11.6213C13.1982 11.5186 13.376 11.3953 13.5198 11.2062C13.6204 11.0737 13.6742 10.92 13.6728 10.7295C13.6686 10.1933 13.6693 9.07907 13.6679 9.05215C13.5977 9.10244 13.534 9.15061 13.4695 9.19452C12.9631 9.53382 12.4148 9.68965 11.8559 9.79023C11.5953 9.83698 11.3325 9.86461 11.0697 9.88657C10.5618 9.92907 10.0539 9.90923 9.54749 9.84123C9.18128 9.79165 8.81861 9.71302 8.46161 9.59332C8.17899 9.4984 7.90274 9.38082 7.64349 9.20444C7.57407 9.15698 7.50536 9.10527 7.42674 9.04932C7.42674 9.08473 7.43028 10.1911 7.42532 10.7196C7.4239 10.9221 7.48057 11.0836 7.58965 11.2204Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.07369 6.90877C7.89164 7.01006 7.7181 7.13117 7.57856 7.31746C7.46239 7.47259 7.39439 7.64896 7.44327 7.87067C7.47444 8.01092 7.54456 8.11929 7.62814 8.2135C7.80806 8.41679 8.02127 8.54288 8.24227 8.64771C8.64177 8.83754 9.05685 8.94096 9.4776 9.00825C9.83248 9.06492 10.1895 9.09396 10.4771 9.089C11.1486 9.08971 11.7436 9.02242 12.3301 8.84817C12.6226 8.76104 12.9081 8.647 13.1751 8.46779C13.3217 8.36934 13.4591 8.25388 13.5654 8.086C13.7056 7.86358 13.7078 7.60434 13.5647 7.38475C13.5158 7.30967 13.4591 7.24025 13.3982 7.18146C13.1716 6.96118 12.9088 6.83297 12.6396 6.72743C12.1608 6.53972 11.6678 6.44693 11.1691 6.40514C10.4891 6.34777 9.81194 6.37681 9.13902 6.52556C8.77352 6.6056 8.4151 6.71822 8.07369 6.90877Z" fill="#292929"/>
</svg>
                <span>Adult Ticket Info ${index + 1}</span>
              </h2>
              <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative py-2 px-6 overflow-hidden">
                <table class="w-full text-left border-separate border-spacing-y-2 border-none">
                  <thead>
                    <tr>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Class</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Count</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Per Person</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Total</th>
                      <th class="text-[#6D6D6D] text-xs font-danaregular">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-[#292929] text-xs font-danamedium">${special_class}</td>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(count)}</td>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(perperson)}</td>
                      <td class="text-[#292929] text-xs font-danamedium">${formatPrice(total)}</td>
                      <td class="text-[#292929] text-xs font-dana_FANum_medium">${unit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          `);
            });
          }

          return parts.join('');
        }
      }
    }

    function renderInvoiceDetails($data) {
      const invoiceDetails = $data.invoiceDetails || {};
      const invoiceDate = $data.invoiceDate || {};
      const account =
        $data.account?.mycounter_forPassenger ||
        $data.account?.person ||
        $data.account?.supplier_agency ||
        $data.account?.mycounter_forAgency ||
        $data.account?.partner_agency ||
        {};

      const isPartnerAgency = !!$data.account?.partner_agency;

      // اگر partner_agency بود، از فیلدهای خاص آن استفاده کن
      const contractNumber = invoiceDetails.factorid || "-";
      const registerDate = invoiceDate.mstring || "-";
      const registerTime = invoiceDate.time || "-";

      const counterName = isPartnerAgency
        ? `${account.namecounter || ""} ${account.familycounter || ""}`.trim() || "-"
        : invoiceDetails.counterName || account.counterName || "-";

      const buyerName = isPartnerAgency
        ? account.agencyname || "-"
        : `${account.fullname?.firstname || ""} ${account.fullname?.lastname || ""}`.trim();

      const ownername = $data.invoiceDetails.ownerid;
      const persons = $data.invoiceDetails.persons;
      const address = isPartnerAgency ? account.agencyaddress || "-" : account.address || "-";
      const phone = isPartnerAgency ? account.agencytell || "-" : account.tel || "-";
      const email = isPartnerAgency ? account.agencyemail || "-" : account.email || "-";
      const mobile = isPartnerAgency ? account.agencymobile || "-" : account.mobile || "-";

      const serviceType = invoiceDetails.title || "-";
      const agreementText = invoiceDetails.description || "-";
      const userDescription = invoiceDetails.userDescription || "-";

      return `
        <h1 class="my-4 font-dana_FANum_demibold text-center">قرارداد ارائه خدمات مسافرتی و گردشگری</h1>
        <div class="w-full flex justify-between flex-wrap gap-y-2">
            <div class="w-[25.5%] bg-[#F4F4F4] border-2 border-[#E8E8E8] rounded-xl p-4 text-justify">
                <ul class="text-[#414141] font-dana_FANum_regular flex flex-col justify-between gap-y-3">
                    <li>
                        <span class="text-base print:text-xs font-dana_FANum_medium">شماره قرارداد</span>
                        <span class="text-lg print:text-base font-dana_FANum_demibold tracking-tighter">${contractNumber}</span>
                    </li>
                    <li class="text-sm"><span>تاریخ ثبت :</span><span class="inline-block dir-ltr font-dana_FANum_demibold" >${registerDate}</span></li>
                    <li class="text-sm"><span>ساعت ثبت :</span><span class="font-dana_FANum_demibold" >${registerTime}</span></li>
                    <li class="text-sm"><span>نام کانتر :</span><span class="font-dana_FANum_demibold" >${counterName}</span></li>
                </ul>
            </div>

            <div class="w-[36.5%] bg-[#F4F4F4] border-2 border-[#E8E8E8] rounded-xl p-4 text-justify">
                <ul class="text-[#414141] font-dana_FANum_regular flex flex-col gap-y-[6px]">
                    <li class="text-sm"><span>نام خریدار :</span><span class="font-dana_FANum_demibold" >${buyerName}</span></li>
                    <li class="text-sm"><span>آدرس :</span><span class="font-dana_FANum_demibold" >${address}</span></li>
                    <li class="text-sm"><span>تلفن :</span><span class="inline-block dir-ltr font-dana_FANum_demibold">${phone}</span></li>
                    <li class="text-sm"><span>ایمیل :</span><span class="font-dana_FANum_demibold" >${email}</span></li>
                    <li class="text-sm"><span>موبایل :</span><span class="inline-block dir-ltr font-dana_FANum_demibold">${mobile}</span></li>
                </ul>
            </div>

            <div class="w-[36.5%] bg-[#F4F4F4] border-2 border-[#E8E8E8] rounded-xl p-4 text-justify">
                <ul class="text-[#414141] font-dana_FANum_regular flex flex-col gap-y-[6px]">
                    <li class="text-sm"><span>نوع خدمات :</span><span class="font-dana_FANum_demibold" >${serviceType}</span></li>
                </ul>
            </div>

            <div class="w-full bg-[#F4F4F4] border-2 border-[#E8E8E8] rounded-sm font-danaregular p-4 text-justify">

              <div>
                
                این قرارداد فی‌مابین خانم/آقای 
 <span class="inline-block dir-ltr font-dana_FANum_demibold mx-1">${buyerName}</span>


 دارای شماره تلفن ثابت 

 <span class="inline-block dir-ltr font-dana_FANum_demibold mx-1">(${phone})</span>
  و همراه 

  <span class="inline-block dir-ltr font-dana_FANum_demibold mx-1">(${mobile})</span>
   به نشانی

   <span class="inline-block font-dana_FANum_demibold mx-1">(${address})</span>


منعقد یا به نمایندگی تام‌الاختیار از سوی افراد
ذیل جمعاً به تعداد
<span class=" font-dana_FANum_demibold mx-1">${persons}</span>


 نفر که از این پس "گردشگر" نامیده می‌شوند از یک طرف و دفتر
<span class=" font-dana_FANum_demibold mx-1">${ownername}</span>

  که از این پس "کارگزار" نامیده
می‌شود، به صورت خرید اینترنتی منعقد گردیده است.

</div>
            </div>
        </div>
    `;
    }


    //     <div>
    //   This contract is concluded between Mr./Ms. 
    //   ${buyerName}, with landline number 
    //   (<span class="inline-block dir-ltr">${phone}</span>)
    //   and mobile number 
    //   (<span class="inline-block dir-ltr">${mobile}</span>),
    //   residing at 
    //   (${address}),
    //   either personally or as the authorized representative of the individuals listed below, totaling 
    //   ${persons} 
    //   persons (hereinafter referred to as "Tourist"), on the one hand, and the office of 
    //   ${ownername}, 
    //   (hereinafter referred to as "Operator"), on the other hand, through an online purchase.
    // </div>


    function renderFlightInfoSection(route) {
      const {
        route: routeName,
        routeDate,
        etime,
        atime,
        airline,
        startairport,
        endairport,
        routecode,
      } = route;

      const flightclass = route.class;

      const fromAirport = `${startairport.airport} / ${startairport.startotherinfo.city}`;
      const fromCode = startairport.startotherinfo.shortname;

      const toAirport = `${endairport.airport} / ${endairport.endotherinfo.city}`;
      const toCode = endairport.endotherinfo.shortname;

      return `

    <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative pb-[25px] overflow-hidden">
      <div class="flex justify-between p-[6px]">
        <div class="w-1/2 flex gap-x-2 items-center">
          <div class="bg-[#EAEAEA] rounded-md w-9 h-9 flex justify-center items-center">
<svg id="takeoff-airplane-icon-pdf" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.97052 14C8.31553 13.987 7.67982 13.7765 7.14703 13.3962C6.61424 13.016 6.20931 12.4837 5.98551 11.8695C5.97977 11.858 5.97404 11.8459 5.96902 11.8344V11.8294C5.95609 11.8 5.94244 11.7699 5.93023 11.7392C5.86275 11.5816 5.60431 10.9593 5.54042 10.8017C5.51355 10.7366 5.49982 10.6667 5.5 10.5963C5.50017 10.5258 5.51427 10.456 5.54147 10.391C5.56867 10.326 5.60842 10.2669 5.65851 10.2172C5.70859 10.1675 5.76798 10.1281 5.83331 10.1013C5.89865 10.0746 5.96863 10.0609 6.03928 10.061C6.10992 10.0612 6.17984 10.0753 6.24504 10.1024C6.31023 10.1295 6.36943 10.1692 6.41925 10.2191C6.46908 10.2691 6.50856 10.3284 6.53543 10.3935C6.57205 10.4809 6.6675 10.7115 6.7558 10.9256L8.04084 10.3828C8.51106 10.183 8.98414 9.98247 9.38545 9.81418L7.89942 6.22275C7.87156 6.15546 7.8577 6.08322 7.8587 6.01043C7.85969 5.93764 7.87549 5.8658 7.90516 5.79929C7.93484 5.73278 7.97777 5.67299 8.03133 5.62353C8.08489 5.57408 8.14796 5.53601 8.21672 5.51162C8.35599 5.46221 8.49168 5.40993 8.6252 5.35909C8.93841 5.2311 9.25978 5.12392 9.58717 5.03826C9.91194 4.97374 10.2477 4.99103 10.5641 5.08856C10.8805 5.1861 11.1675 5.3608 11.3991 5.59684C12.2678 6.35523 13.1357 7.1172 13.9835 7.89708C14.6914 7.61707 15.5019 7.26115 16.3038 6.97183C17.0243 6.6808 17.8304 6.68286 18.5493 6.97756C18.7662 7.08955 18.9569 7.24602 19.1088 7.43671C19.2607 7.6274 19.3705 7.84799 19.4309 8.08399C19.7604 9.25273 18.8566 10.2281 17.881 10.6399C15.6928 11.5601 13.1063 12.6408 10.5125 13.6799C10.0237 13.8838 9.5003 13.9924 8.97052 14ZM7.21814 11.8953C7.87358 12.9236 8.84344 13.1886 10.1098 12.683C12.6942 11.6475 15.2786 10.569 17.4603 9.6509C17.9248 9.4554 18.5551 8.9541 18.3935 8.37474C18.3729 8.28097 18.3318 8.19287 18.2732 8.11665C18.2147 8.04044 18.1401 7.97795 18.0547 7.9336C17.6029 7.77516 17.1078 7.79281 16.6685 7.98302C15.957 8.23939 15.2822 8.53158 14.4739 8.88678C14.2761 8.98937 14.0504 9.0254 13.8306 8.98953C13.6106 8.95364 13.4081 8.84777 13.2534 8.6877C12.4106 7.91427 11.5499 7.15874 10.6877 6.40536C10.2713 6.04157 10.0165 6.04228 9.8363 6.08382C9.58751 6.14881 9.34315 6.22966 9.10476 6.32587L10.5836 9.89939C10.6381 10.0307 10.638 10.1783 10.5835 10.3096C10.529 10.4409 10.4245 10.5453 10.2929 10.5998C9.82767 10.7924 9.14425 11.0832 8.4601 11.3718C8.02506 11.5587 7.59216 11.7384 7.21814 11.8953Z" fill="#7D7D7D"/>
<path d="M16.9708 18H7.02922C6.88886 18 6.75427 17.9473 6.65502 17.8535C6.55577 17.7598 6.5 17.6326 6.5 17.5C6.5 17.3674 6.55577 17.2402 6.65502 17.1465C6.75427 17.0527 6.88886 17 7.02922 17H16.9708C17.1111 17 17.2458 17.0527 17.345 17.1465C17.4443 17.2402 17.5 17.3674 17.5 17.5C17.5 17.6326 17.4443 17.7598 17.345 17.8535C17.2458 17.9473 17.1111 18 16.9708 18Z" fill="#7D7D7D"/>
</svg>
          </div>
          <div>
            <span class="block text-[#6D6D6D] text-xs font-interregular">From:</span>
            <span class="text-black text-xs font-danamedium">${fromAirport} <span class="text-[#292929]">(${fromCode})</span></span>
          </div>
        </div>
        <div class="w-1/2 flex gap-x-2 items-center">
          <div class="bg-[#EAEAEA] rounded-md w-9 h-9 flex justify-center items-center">
<svg id="landing-airplane-icon-pdf" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.8191 10.1601C6.36737 9.68558 6.06946 9.08584 5.96462 8.43972C5.85978 7.79359 5.95288 7.13134 6.23171 6.54006C6.23581 6.52792 6.24043 6.51528 6.24503 6.50364L6.24859 6.50012C6.26035 6.47027 6.27211 6.4394 6.2854 6.40906C6.34983 6.25023 6.61003 5.62864 6.67698 5.47237C6.70436 5.40742 6.7443 5.34852 6.79449 5.29905C6.84467 5.24958 6.90415 5.2105 6.96948 5.18406C7.03482 5.15762 7.10477 5.14428 7.17532 5.14487C7.24587 5.14547 7.31565 5.15994 7.38066 5.1875C7.44568 5.21507 7.50464 5.25515 7.55427 5.30544C7.60388 5.35572 7.64307 5.41533 7.66968 5.48075C7.69633 5.54611 7.70981 5.61608 7.70936 5.68666C7.70893 5.75724 7.69464 5.82697 7.66726 5.89192C7.63096 5.97942 7.53433 6.20953 7.44437 6.42296L8.73441 6.95379C9.20729 7.14721 9.6827 7.34215 10.0847 7.50879L11.5901 3.92546C11.6183 3.85831 11.6599 3.79762 11.7123 3.74709C11.7647 3.69657 11.8268 3.65723 11.895 3.6315C11.9631 3.60578 12.0358 3.59419 12.1086 3.59743C12.1815 3.60068 12.2529 3.61868 12.3186 3.65037C12.4517 3.71453 12.5844 3.77412 12.7145 3.83319C13.0258 3.96561 13.3282 4.11848 13.6194 4.29076C13.8938 4.47607 14.1179 4.72676 14.2713 5.02016C14.4246 5.31356 14.5026 5.64044 14.4979 5.97109C14.5705 7.12193 14.6401 8.27478 14.6827 9.42596C15.3799 9.73173 16.2031 10.057 16.973 10.423C17.6869 10.7301 18.2527 11.3041 18.5494 12.0223C18.6225 12.2552 18.6455 12.5008 18.617 12.7429C18.5884 12.985 18.509 13.2182 18.3839 13.4273C17.7855 14.4839 16.4565 14.5283 15.4773 14.1251C13.2836 13.2183 10.6955 12.1414 8.13179 11.0302C7.64291 10.8264 7.19735 10.5311 6.8191 10.1601ZM7.08093 7.43385C6.81169 8.62325 7.30605 9.49871 8.5565 10.0425C11.1111 11.1496 13.6961 12.2265 15.8838 13.1302C16.3496 13.3225 17.1493 13.4175 17.4472 12.895C17.4993 12.8143 17.533 12.7231 17.5459 12.6279C17.5589 12.5326 17.5507 12.4357 17.5221 12.3438C17.3167 11.9113 16.9557 11.572 16.5114 11.3938C15.8285 11.0688 15.146 10.7951 14.3248 10.4708C14.1127 10.4026 13.9283 10.2676 13.799 10.0862C13.6697 9.90464 13.6024 9.68631 13.6073 9.46374C13.5635 8.32068 13.4944 7.17746 13.4228 6.03476C13.3882 5.48292 13.2083 5.30238 13.052 5.20361C12.8307 5.07262 12.6013 4.95593 12.3652 4.85429L10.8674 8.41993C10.8124 8.55105 10.7076 8.65486 10.576 8.70857C10.4443 8.76229 10.2966 8.76146 10.1653 8.70633C9.701 8.51144 9.01346 8.23058 8.32692 7.94769C7.88796 7.77019 7.45559 7.58917 7.08093 7.43385Z" fill="#7D7D7D"/>
<path d="M16.9708 18H7.02922C6.88886 18 6.75427 17.9473 6.65502 17.8535C6.55577 17.7598 6.5 17.6326 6.5 17.5C6.5 17.3674 6.55577 17.2402 6.65502 17.1465C6.75427 17.0527 6.88886 17 7.02922 17H16.9708C17.1111 17 17.2458 17.0527 17.345 17.1465C17.4443 17.2402 17.5 17.3674 17.5 17.5C17.5 17.6326 17.4443 17.7598 17.345 17.8535C17.2458 17.9473 17.1111 18 16.9708 18Z" fill="#7D7D7D"/>
</svg>
          </div>
          <div>
            <span class="block text-[#6D6D6D] text-xs font-interregular">To:</span>
            <span class="text-black text-xs font-danamedium">${toAirport} <span class="text-[#292929]">(${toCode})</span></span>
          </div>
        </div>
      </div>
      <div class="h-[25px] w-full bg-[#EAEAEA] absolute bottom-0 left-0 right-0 rounded-[4px]">
        <ul class="flex justify-between px-2">
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Date:</span>
            <span class="text-[#292929] text-sm font-danamedium">${routeDate.mstring}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Exit Time:</span>
            <span class="text-[#292929] text-sm font-danamedium">${etime}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Flight NO:</span>
            <span class="text-[#292929] text-sm font-danamedium">${routecode}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Arrival Time:</span>
            <span class="text-[#292929] text-sm font-danamedium">${atime}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Airline:</span>
            <span class="text-[#292929] text-sm font-danamedium">${airline}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Flight Class:</span>
            <span class="text-[#292929] text-sm font-danamedium">${flightclass}</span>
          </li>
        </ul>
      </div>
    </div>
  `;
    }

    function renderCipInfoSection(cip) {
      return `


      <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
        <div class="flex justify-between items-center py-[6px] px-2">
          <div class="w-1/2 flex gap-x-2 items-center">
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Lounge:</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cip.loungename || '-'}</span>
          </div>
          <div class="w-1/2 flex gap-x-2 items-center">
            <ul class="flex justify-between px-2 gap-x-5">
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Airport:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cip.airportname || '-'}</span>
              </li>
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Airline:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cip.airline || '-'}</span>
              </li>
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Flight No:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cip.routecode || '-'}</span>
              </li>
            </ul>
          </div>
        </div>

        <hr class="w-[98%] mx-auto" />

        <div class="flex justify-between items-center py-[6px] px-2">
          <div class="w-full flex gap-x-2 items-center">
            <ul class="flex justify-between gap-x-2 w-full flex-wrap">
              <li class="flex items-center gap-x-2">
<svg id="pin-icon-pdf" class="scale-110 origin-center" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.72936 6.06138C5.03224 6.06138 4.46482 5.49396 4.46482 4.79683C4.46482 4.09971 5.03224 3.53229 5.72936 3.53229C6.42649 3.53229 6.99345 4.09971 6.99345 4.79683C6.99345 5.49396 6.42649 6.06138 5.72936 6.06138ZM5.72936 1.14575C3.70124 1.14575 2.05078 2.79621 2.05078 4.82479C2.05078 7.40796 5.07211 9.85408 5.72936 9.85408C6.38661 9.85408 9.40795 7.40796 9.40795 4.82479C9.40795 2.79621 7.75749 1.14575 5.72936 1.14575Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs font-danaregular">City:</span>
                <span class="text-[#292929] text-sm font-danamedium">${cip.route || '-'}</span>
              </li>
              <li class="flex items-center gap-x-2">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs font-danaregular">Date:</span>
                <span class="text-[#292929] text-sm font-danamedium">${cip.routeDate?.mstring || '-'}</span>
              </li>
              <li class="flex items-center gap-x-2">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs font-danaregular">Time:</span>
                <span class="text-[#292929] text-sm font-danamedium">${cip.time || '-'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  `;
    }

    function renderHotelInfoSection(room) {
      if (!room) return '';

      const {
        hotelName = '',
        hotelStar = '',
        cityName = '',
        roomNumber = '',
        roomType = '',
        fromDate = {},
        toDate = {},
        passengersRoom = {},
        service = '',
      } = room;

      // تبدیل تعداد مسافر به رشته‌ای مثل "1 Adult 1 children"
      const passengersTextParts = [];
      if (passengersRoom.adult) passengersTextParts.push(`${passengersRoom.adult} Adult${passengersRoom.adult > 1 ? 's' : ''}`);
      if (passengersRoom.child) passengersTextParts.push(`${passengersRoom.child} Children`);
      else {
        // اگر کلید child اصلی نباشه، بررسی کلیدهای دیگر (child Withbed, child Withoutbed)
        if (passengersRoom['child Withbed']) passengersTextParts.push(`${passengersRoom['child Withbed']} Children With Bed`);
        if (passengersRoom['child Withoutbed']) passengersTextParts.push(`${passengersRoom['child Withoutbed']} Children Without Bed`);
      }
      if (passengersRoom.infant) passengersTextParts.push(`${passengersRoom.infant} Infant${passengersRoom.infant > 1 ? 's' : ''}`);
      if (passengersRoom['extra Adult']) passengersTextParts.push(`${passengersRoom['extra Adult']} Extra Adult${passengersRoom['extra Adult'] > 1 ? 's' : ''}`);

      const passengersText = passengersTextParts.join(' ') || '-';

      // تبدیل تاریخ از mstring به فرمت yyyy/mm/dd
      function formatDate(dateObj) {
        if (!dateObj?.mstring) return '-';
        return dateObj.mstring.replace(/-/g, '/');
      }

      const checkInDate = formatDate(fromDate);
      const checkOutDate = formatDate(toDate);

      return `

  <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
    <div class="flex justify-between items-center py-[6px] px-2 ">
      <div class="w-1/2 flex gap-x-2 items-center">
        <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Hotel:</span>
        <span class="text-[#292929] text-sm text-nowrap font-danamedium">${hotelName}</span>
      </div>
      <div class="w-1/2 flex gap-x-2 items-center">
        <ul class="flex justify-between px-2 gap-x-5">
          <li><span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Grade:</span><span class="text-[#292929] text-sm text-nowrap font-danamedium">${hotelStar} star</span></li>
          <li><span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Services:</span><span class="text-[#292929] text-sm text-nowrap font-danamedium">${service}</span></li>
          <li><span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Room Type:</span><span class="text-[#292929] text-sm text-nowrap font-danamedium">${roomType}</span></li>
        </ul>
      </div>
    </div>
    <hr class="w-[98%] mx-auto" />
    <div class="flex justify-between items-center py-[6px] px-2 ">
      <div class="w-full flex gap-x-2 items-center">
        <ul class="flex justify-between gap-x-2 w-full flex-wrap">
          <li class="flex items-center gap-x-2">
<svg id="pin-icon-pdf" class="scale-110 origin-center" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.72936 6.06138C5.03224 6.06138 4.46482 5.49396 4.46482 4.79683C4.46482 4.09971 5.03224 3.53229 5.72936 3.53229C6.42649 3.53229 6.99345 4.09971 6.99345 4.79683C6.99345 5.49396 6.42649 6.06138 5.72936 6.06138ZM5.72936 1.14575C3.70124 1.14575 2.05078 2.79621 2.05078 4.82479C2.05078 7.40796 5.07211 9.85408 5.72936 9.85408C6.38661 9.85408 9.40795 7.40796 9.40795 4.82479C9.40795 2.79621 7.75749 1.14575 5.72936 1.14575Z" fill="#6D6D6D"/>
</svg>
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">city :</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cityName}</span>
          </li>
          <li class="flex items-center gap-x-2">
<svg id="small-bed-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.49982 3.63506H5.40734C5.59525 3.63506 5.75109 3.78631 5.75109 3.97881C5.75109 4.16672 5.59525 4.32256 5.40734 4.32256H4.49982C4.31191 4.32256 4.15607 4.16672 4.15607 3.97881C4.15607 3.78631 4.31191 3.63506 4.49982 3.63506ZM7.24984 3.63506H8.15734C8.34526 3.63506 8.50109 3.78631 8.50109 3.97881C8.50109 4.16672 8.34526 4.32256 8.15734 4.32256H7.24984C7.06192 4.32256 6.90609 4.16672 6.90609 3.97881C6.90609 3.78631 7.06192 3.63506 7.24984 3.63506ZM2.95524 4.86341H9.75692C9.88067 4.86341 9.98609 4.75799 9.98609 4.63424V3.15839C9.98609 2.80548 9.98609 2.62673 9.9265 2.46173C9.82109 2.17298 9.59192 1.94381 9.30776 1.84298C9.13817 1.77881 8.95942 1.77881 8.60192 1.77881H4.11024C3.75274 1.77881 3.57399 1.77881 3.40899 1.84298C3.12024 1.94381 2.89107 2.16839 2.78566 2.46173C2.72607 2.62673 2.72607 2.80548 2.72607 3.15839V4.63424C2.72607 4.75799 2.82691 4.86341 2.95524 4.86341Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.7605 6.03858C10.6537 5.73974 10.4191 5.50278 10.1065 5.38453C9.93186 5.32495 9.75173 5.32495 9.42448 5.32495H3.28647C2.95922 5.32495 2.77864 5.32495 2.59347 5.38866C2.29189 5.50278 2.05768 5.73974 1.95089 6.03674C1.88672 6.21274 1.88672 6.39378 1.88672 6.72287V8.87703C1.88672 9.06679 2.04072 9.22079 2.23047 9.22079C2.42022 9.22079 2.57422 9.06679 2.57422 8.87703V8.74412C2.57422 8.69352 2.61526 8.65245 2.66589 8.65245H10.0451C10.0957 8.65245 10.1367 8.69352 10.1367 8.74412V8.87703C10.1367 9.06679 10.2907 9.22079 10.4805 9.22079C10.6702 9.22079 10.8242 9.06679 10.8242 8.87703V6.72287C10.8242 6.39378 10.8242 6.21274 10.7605 6.03858Z" fill="#6D6D6D"/>
</svg>
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Room :</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${roomNumber}</span>
          </li>
          <li class="flex items-center gap-x-2">
<svg id="user-icon-pdf" class="scale-110 origin-center" class="scale-150" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.06714 1.51294C7.30739 1.51294 8.31297 2.51852 8.31297 3.75877C8.31297 4.99903 7.30739 6.00461 6.06714 6.00461C4.82687 6.00461 3.82129 4.99903 3.82129 3.75877C3.82129 2.51852 4.82687 1.51294 6.06714 1.51294Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.12154 6.41675H5.05902C3.91318 6.41675 2.95068 7.37925 2.95068 8.52508V8.66258C2.95068 9.12091 3.31735 9.48758 3.77568 9.48758H8.35904C8.81737 9.48758 9.22987 9.16675 9.18404 8.66258V8.52508C9.22987 7.37925 8.26737 6.41675 7.12154 6.41675Z" fill="#6D6D6D"/>
</svg>
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Passengers :</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${passengersText}</span>
          </li>
          <li class="flex items-center gap-x-2">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Check in :</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${checkInDate}</span>
          </li>
          <li class="flex items-center gap-x-2">
            <span class="-scale-x-100">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
            </span>
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Check out :</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${checkOutDate}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div></div>
  `;
    }

    function renderTourHotelInfoSection(data) {
      if (!Array.isArray(data) || data.length === 0) return '';

      // تابع کمکی برای تبدیل تعداد مسافرها به رشته مطابق مثال شما
      function getPassengersText(passengersRoom = {}) {
        const parts = [];
        if (passengersRoom.adult) parts.push(`${passengersRoom.adult} Adult${passengersRoom.adult > 1 ? 's' : ''}`);
        if (passengersRoom.child) parts.push(`${passengersRoom.child} Children`);
        else {
          if (passengersRoom['child Withbed']) parts.push(`${passengersRoom['child Withbed']} Children With Bed`);
          if (passengersRoom['child Withoutbed']) parts.push(`${passengersRoom['child Withoutbed']} Children Without Bed`);
        }
        if (passengersRoom.infant) parts.push(`${passengersRoom.infant} Infant${passengersRoom.infant > 1 ? 's' : ''}`);
        if (passengersRoom['extra Adult']) parts.push(`${passengersRoom['extra Adult']} Extra Adult${passengersRoom['extra Adult'] > 1 ? 's' : ''}`);
        return parts.join(' ') || '-';
      }

      // تابع کمکی فرمت تاریخ yyyy/mm/dd
      function formatDate(dateObj) {
        if (!dateObj?.mstring) return '-';
        return dateObj.mstring.replace(/-/g, '/');
      }

      let html = `<section class="dir-ltr mt-4">
    <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="bulleted-list-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 12.0376H5.7557C5.36399 12.0376 5.04736 12.3542 5.04736 12.7459C5.04736 13.1376 5.36399 13.4543 5.7557 13.4543H14.2557C14.6474 13.4543 14.9641 13.1376 14.9641 12.7459C14.9641 12.3542 14.6474 12.0376 14.2557 12.0376Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 7.7876H5.7557C5.36399 7.7876 5.04736 8.10422 5.04736 8.49593C5.04736 8.88764 5.36399 9.20426 5.7557 9.20426H14.2557C14.6474 9.20426 14.9641 8.88764 14.9641 8.49593C14.9641 8.10422 14.6474 7.7876 14.2557 7.7876Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.7557 4.95426H14.2557C14.6474 4.95426 14.9641 4.63764 14.9641 4.24593C14.9641 3.85422 14.6474 3.5376 14.2557 3.5376H5.7557C5.36399 3.5376 5.04736 3.85422 5.04736 4.24593C5.04736 4.63764 5.36399 4.95426 5.7557 4.95426Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 3.35352C2.43705 3.35352 2.03613 3.75656 2.03613 4.25309C2.03613 4.74468 2.43705 5.14489 2.92934 5.14489C3.42163 5.14489 3.82326 4.74468 3.82326 4.25309C3.82326 3.75656 3.42163 3.35352 2.92934 3.35352Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 7.70312C2.43705 7.70312 2.03613 8.10333 2.03613 8.59563C2.03613 9.08721 2.43705 9.48813 2.92934 9.48813C3.42163 9.48813 3.82326 9.08721 3.82326 8.59563C3.82326 8.10333 3.42163 7.70312 2.92934 7.70312Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 11.8535C2.43705 11.8535 2.03613 12.2566 2.03613 12.7531C2.03613 13.2447 2.43705 13.6449 2.92934 13.6449C3.42163 13.6449 3.82326 13.2447 3.82326 12.7531C3.82326 12.2566 3.42163 11.8535 2.92934 11.8535Z" fill="#292929"/>
</svg>
      <span>List of Rooms</span>
    </h2>`;

      data.forEach((hotelGroup) => {
        const rooms = hotelGroup.hotel || [];
        if (rooms.length === 0) return;

        const { hotelName = '-', cityName = '-', hotelStar = '-', service = '-' } = rooms[0].room || {};

        // برای هر اتاق یک کارت طبق طراحی
        rooms.forEach(({ room }) => {
          const {
            roomNumber = '-',
            roomType = '-',
            fromDate = {},
            toDate = {},
            passengersRoom = {},
            service: roomService = service // اگر سرویس اتاق نبود، از هتل استفاده شود
          } = room || {};

          html += `
      <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
        <div class="flex justify-between items-center py-[6px] px-2 ">
          <div class="w-1/2 flex gap-x-2 items-center">
            <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Hotel:</span>
            <span class="text-[#292929] text-sm text-nowrap font-danamedium">${hotelName}</span>
          </div>
          <div class="w-1/2 flex gap-x-2 items-center">
            <ul class="flex justify-between px-2 gap-x-5">
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Grade:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${hotelStar} star</span>
              </li>
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Services:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${roomService}</span>
              </li>
              <li>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Room Type:</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${roomType}</span>
              </li>
            </ul>
          </div>
        </div>
        <hr class="w-[98%] mx-auto" />
        <div class="flex justify-between items-center py-[6px] px-2 ">
          <div class="w-full flex gap-x-2 items-center">
            <ul class="flex justify-between gap-x-2 w-full flex-wrap">
              <li class="flex items-center gap-x-2">
<svg id="pin-icon-pdf" class="scale-110 origin-center" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.72936 6.06138C5.03224 6.06138 4.46482 5.49396 4.46482 4.79683C4.46482 4.09971 5.03224 3.53229 5.72936 3.53229C6.42649 3.53229 6.99345 4.09971 6.99345 4.79683C6.99345 5.49396 6.42649 6.06138 5.72936 6.06138ZM5.72936 1.14575C3.70124 1.14575 2.05078 2.79621 2.05078 4.82479C2.05078 7.40796 5.07211 9.85408 5.72936 9.85408C6.38661 9.85408 9.40795 7.40796 9.40795 4.82479C9.40795 2.79621 7.75749 1.14575 5.72936 1.14575Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">city :</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${cityName}</span>
              </li>
              <li class="flex items-center gap-x-2">
<svg id="small-bed-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.49982 3.63506H5.40734C5.59525 3.63506 5.75109 3.78631 5.75109 3.97881C5.75109 4.16672 5.59525 4.32256 5.40734 4.32256H4.49982C4.31191 4.32256 4.15607 4.16672 4.15607 3.97881C4.15607 3.78631 4.31191 3.63506 4.49982 3.63506ZM7.24984 3.63506H8.15734C8.34526 3.63506 8.50109 3.78631 8.50109 3.97881C8.50109 4.16672 8.34526 4.32256 8.15734 4.32256H7.24984C7.06192 4.32256 6.90609 4.16672 6.90609 3.97881C6.90609 3.78631 7.06192 3.63506 7.24984 3.63506ZM2.95524 4.86341H9.75692C9.88067 4.86341 9.98609 4.75799 9.98609 4.63424V3.15839C9.98609 2.80548 9.98609 2.62673 9.9265 2.46173C9.82109 2.17298 9.59192 1.94381 9.30776 1.84298C9.13817 1.77881 8.95942 1.77881 8.60192 1.77881H4.11024C3.75274 1.77881 3.57399 1.77881 3.40899 1.84298C3.12024 1.94381 2.89107 2.16839 2.78566 2.46173C2.72607 2.62673 2.72607 2.80548 2.72607 3.15839V4.63424C2.72607 4.75799 2.82691 4.86341 2.95524 4.86341Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.7605 6.03858C10.6537 5.73974 10.4191 5.50278 10.1065 5.38453C9.93186 5.32495 9.75173 5.32495 9.42448 5.32495H3.28647C2.95922 5.32495 2.77864 5.32495 2.59347 5.38866C2.29189 5.50278 2.05768 5.73974 1.95089 6.03674C1.88672 6.21274 1.88672 6.39378 1.88672 6.72287V8.87703C1.88672 9.06679 2.04072 9.22079 2.23047 9.22079C2.42022 9.22079 2.57422 9.06679 2.57422 8.87703V8.74412C2.57422 8.69352 2.61526 8.65245 2.66589 8.65245H10.0451C10.0957 8.65245 10.1367 8.69352 10.1367 8.74412V8.87703C10.1367 9.06679 10.2907 9.22079 10.4805 9.22079C10.6702 9.22079 10.8242 9.06679 10.8242 8.87703V6.72287C10.8242 6.39378 10.8242 6.21274 10.7605 6.03858Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Room :</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${roomNumber}</span>
              </li>
              <li class="flex items-center gap-x-2">
<svg id="user-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.06714 1.51294C7.30739 1.51294 8.31297 2.51852 8.31297 3.75877C8.31297 4.99903 7.30739 6.00461 6.06714 6.00461C4.82687 6.00461 3.82129 4.99903 3.82129 3.75877C3.82129 2.51852 4.82687 1.51294 6.06714 1.51294Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.12154 6.41675H5.05902C3.91318 6.41675 2.95068 7.37925 2.95068 8.52508V8.66258C2.95068 9.12091 3.31735 9.48758 3.77568 9.48758H8.35904C8.81737 9.48758 9.22987 9.16675 9.18404 8.66258V8.52508C9.22987 7.37925 8.26737 6.41675 7.12154 6.41675Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Passengers :</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${getPassengersText(passengersRoom)}</span>
              </li>
              <li class="flex items-center gap-x-2">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Check in :</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${formatDate(fromDate)}</span>
              </li>
              <li class="flex items-center gap-x-2">
                <span class="-scale-x-100">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
                </span>
                <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Check out :</span>
                <span class="text-[#292929] text-sm text-nowrap font-danamedium">${formatDate(toDate)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      `;
        });
      });

      html += `</section>`;
      return html;
    }


    function renderInsuranceInfoSection(insurance) {
      if (!insurance || !Array.isArray(insurance) || insurance.length === 0) {
        console.warn("هیچ اطلاعاتی برای بیمه موجود نیست.");
        return '';
      }

      const isType4 = Number(globalInvoiceType) === 4;

      console.log('globalInvoiceType =', globalInvoiceType);
      console.log('insurance =', insurance);

      const country = isType4 ? insurance[0].insuranceCountry : insurance.country;
      const name = isType4 ? insurance[0].insuranceName : insurance.name;
      const provider = isType4 ? insurance[0].insuranceProvider : insurance.Provider;

      const duration = !isType4 && insurance.duration
        ? `
      <li class="flex items-center gap-x-2">
                <svg id="calendar-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>
        <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Duration:</span>
        <span class="text-[#292929] text-sm text-nowrap font-danamedium">${insurance.duration.duration} ${insurance.duration.durationtype}</span>
      </li>`
        : '';

      return `
    <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
      <div class="flex justify-between items-center py-[6px] px-2">
        <div class="w-full flex gap-x-2 items-center">
          <ul class="flex justify-between gap-x-2 w-full flex-wrap">

            <li class="flex items-center gap-x-2">
<svg id="pin-icon-pdf" class="scale-110 origin-center" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.72936 6.06138C5.03224 6.06138 4.46482 5.49396 4.46482 4.79683C4.46482 4.09971 5.03224 3.53229 5.72936 3.53229C6.42649 3.53229 6.99345 4.09971 6.99345 4.79683C6.99345 5.49396 6.42649 6.06138 5.72936 6.06138ZM5.72936 1.14575C3.70124 1.14575 2.05078 2.79621 2.05078 4.82479C2.05078 7.40796 5.07211 9.85408 5.72936 9.85408C6.38661 9.85408 9.40795 7.40796 9.40795 4.82479C9.40795 2.79621 7.75749 1.14575 5.72936 1.14575Z" fill="#6D6D6D"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Country:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${country}</span>
            </li>

            <li class="flex items-center gap-x-2">
<svg id="user-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.06714 1.51294C7.30739 1.51294 8.31297 2.51852 8.31297 3.75877C8.31297 4.99903 7.30739 6.00461 6.06714 6.00461C4.82687 6.00461 3.82129 4.99903 3.82129 3.75877C3.82129 2.51852 4.82687 1.51294 6.06714 1.51294Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.12154 6.41675H5.05902C3.91318 6.41675 2.95068 7.37925 2.95068 8.52508V8.66258C2.95068 9.12091 3.31735 9.48758 3.77568 9.48758H8.35904C8.81737 9.48758 9.22987 9.16675 9.18404 8.66258V8.52508C9.22987 7.37925 8.26737 6.41675 7.12154 6.41675Z" fill="#6D6D6D"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Name:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${name}</span>
            </li>

            ${duration}

            <li class="flex items-center gap-x-2">
<svg id="check-in-icon-pdf" class="scale-110 origin-center" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.42875 5.1765H4.05313C3.86338 5.1765 3.70938 5.0225 3.70938 4.83275C3.70938 4.643 3.86338 4.489 4.05313 4.489H7.42875C7.6185 4.489 7.7725 4.643 7.7725 4.83275C7.7725 5.0225 7.6185 5.1765 7.42875 5.1765ZM7.59971 7.67625L6.65371 8.559C6.58725 8.62087 6.50292 8.65112 6.41904 8.65112C6.32692 8.65112 6.23525 8.61446 6.16788 8.54204C6.03817 8.40316 6.0455 8.18546 6.18438 8.05575L6.49192 7.76883H4.23371C4.04396 7.76883 3.88996 7.61483 3.88996 7.42508C3.88996 7.23533 4.04396 7.08133 4.23371 7.08133H6.49238L6.18483 6.79441C6.0455 6.66516 6.03817 6.44746 6.16742 6.30858C6.29713 6.17016 6.51438 6.16191 6.65325 6.29162L7.59925 7.173C7.66892 7.23808 7.70879 7.32929 7.70879 7.42462C7.70879 7.51996 7.66892 7.61116 7.59971 7.67625ZM9.16583 2.44162C8.83446 2.10933 8.36146 1.92187 7.79909 1.87512V1.43237C7.79909 1.24262 7.64508 1.08862 7.45533 1.08862C7.26558 1.08862 7.11158 1.24262 7.11158 1.43237V3.059C7.08179 3.06771 7.052 3.07779 7.01946 3.07779C6.82971 3.07779 6.67571 2.92379 6.67571 2.73404V1.94662C6.67571 1.896 6.63469 1.85496 6.58404 1.85496H4.46563V1.43237C4.46563 1.24262 4.31163 1.08862 4.12188 1.08862C3.93213 1.08862 3.77813 1.24262 3.77813 1.43237V3.059C3.74833 3.06771 3.71854 3.07779 3.686 3.07779C3.49625 3.07779 3.34225 2.92379 3.34225 2.73404V2.0626C3.34225 2.00298 3.28605 1.9592 3.22897 1.97643C2.35417 2.24048 1.84717 2.95083 1.84717 3.99904V7.73217C1.84717 9.09708 2.6685 9.91154 4.04396 9.91154H7.53325C8.90871 9.91154 9.73004 9.10854 9.73004 7.76379V3.9995C9.73188 3.35233 9.53663 2.81379 9.16583 2.44162Z" fill="#6D6D6D"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Provider:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${provider}</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  `;
    }

    function renderServiceInfoSection(service) {
      return `
    <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
      <div class="flex justify-between items-center py-[6px] px-2">
        <div class="w-full flex gap-x-2 items-center">
          <ul class="flex justify-between gap-x-2 w-full flex-wrap">
            <li class="flex items-center gap-x-2">
<svg id="bulleted-list-icon-pdf" class="scale-110 origin-center" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 12.0376H5.7557C5.36399 12.0376 5.04736 12.3542 5.04736 12.7459C5.04736 13.1376 5.36399 13.4543 5.7557 13.4543H14.2557C14.6474 13.4543 14.9641 13.1376 14.9641 12.7459C14.9641 12.3542 14.6474 12.0376 14.2557 12.0376Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 7.7876H5.7557C5.36399 7.7876 5.04736 8.10422 5.04736 8.49593C5.04736 8.88764 5.36399 9.20426 5.7557 9.20426H14.2557C14.6474 9.20426 14.9641 8.88764 14.9641 8.49593C14.9641 8.10422 14.6474 7.7876 14.2557 7.7876Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.7557 4.95426H14.2557C14.6474 4.95426 14.9641 4.63764 14.9641 4.24593C14.9641 3.85422 14.6474 3.5376 14.2557 3.5376H5.7557C5.36399 3.5376 5.04736 3.85422 5.04736 4.24593C5.04736 4.63764 5.36399 4.95426 5.7557 4.95426Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 3.35352C2.43705 3.35352 2.03613 3.75656 2.03613 4.25309C2.03613 4.74468 2.43705 5.14489 2.92934 5.14489C3.42163 5.14489 3.82326 4.74468 3.82326 4.25309C3.82326 3.75656 3.42163 3.35352 2.92934 3.35352Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 7.70312C2.43705 7.70312 2.03613 8.10333 2.03613 8.59563C2.03613 9.08721 2.43705 9.48813 2.92934 9.48813C3.42163 9.48813 3.82326 9.08721 3.82326 8.59563C3.82326 8.10333 3.42163 7.70312 2.92934 7.70312Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 11.8535C2.43705 11.8535 2.03613 12.2566 2.03613 12.7531C2.03613 13.2447 2.43705 13.6449 2.92934 13.6449C3.42163 13.6449 3.82326 13.2447 3.82326 12.7531C3.82326 12.2566 3.42163 11.8535 2.92934 11.8535Z" fill="#292929"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Service:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${service.servicename}</span>
            </li>
            <li class="flex items-center gap-x-2">
<svg id="location-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg" class="scale-110 origin-center print:scale-100" width="9" height="12" viewBox="0 0 9 12" fill="none" >
<path d="M4.49653 0.5C6.965 0.5 9 2.54484 9 5.07477C9 6.34963 8.55371 7.5332 7.81915 8.53637C7.00878 9.64293 6.00997 10.6071 4.8857 11.3638C4.62839 11.5387 4.39617 11.5519 4.11377 11.3638C2.9831 10.6071 1.98428 9.64293 1.18085 8.53637C0.445756 7.5332 0 6.34963 0 5.07477C0 2.54484 2.035 0.5 4.49653 0.5ZM4.49653 3.67726C3.68029 3.67726 3.01459 4.37629 3.01459 5.21721C3.01459 6.06474 3.68029 6.73132 4.49653 6.73132C5.3133 6.73132 5.98541 6.06474 5.98541 5.21721C5.98541 4.37629 5.3133 3.67726 4.49653 3.67726Z" fill="#242424"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">City:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${service.servicecityname}</span>
            </li>
            <li class="flex items-center gap-x-2">
                <svg id="calendar-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>
              <span class="text-[#6D6D6D] text-xs text-nowrap font-danaregular mr-1">Date:</span>
              <span class="text-[#292929] text-sm text-nowrap font-danamedium">${service.servicedate.sstring}</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  `;
    }

    function renderVisaInfoSection(visa) {
      return `
    <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative overflow-hidden">
      <div class="flex justify-between items-center py-[6px] px-2">
        <div class="w-full flex gap-x-2 items-start flex-col">
          <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <li class="flex items-center gap-x-2">
<svg id="bulleted-list-icon-pdf" class="scale-110 origin-center" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 12.0376H5.7557C5.36399 12.0376 5.04736 12.3542 5.04736 12.7459C5.04736 13.1376 5.36399 13.4543 5.7557 13.4543H14.2557C14.6474 13.4543 14.9641 13.1376 14.9641 12.7459C14.9641 12.3542 14.6474 12.0376 14.2557 12.0376Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 7.7876H5.7557C5.36399 7.7876 5.04736 8.10422 5.04736 8.49593C5.04736 8.88764 5.36399 9.20426 5.7557 9.20426H14.2557C14.6474 9.20426 14.9641 8.88764 14.9641 8.49593C14.9641 8.10422 14.6474 7.7876 14.2557 7.7876Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.7557 4.95426H14.2557C14.6474 4.95426 14.9641 4.63764 14.9641 4.24593C14.9641 3.85422 14.6474 3.5376 14.2557 3.5376H5.7557C5.36399 3.5376 5.04736 3.85422 5.04736 4.24593C5.04736 4.63764 5.36399 4.95426 5.7557 4.95426Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 3.35352C2.43705 3.35352 2.03613 3.75656 2.03613 4.25309C2.03613 4.74468 2.43705 5.14489 2.92934 5.14489C3.42163 5.14489 3.82326 4.74468 3.82326 4.25309C3.82326 3.75656 3.42163 3.35352 2.92934 3.35352Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 7.70312C2.43705 7.70312 2.03613 8.10333 2.03613 8.59563C2.03613 9.08721 2.43705 9.48813 2.92934 9.48813C3.42163 9.48813 3.82326 9.08721 3.82326 8.59563C3.82326 8.10333 3.42163 7.70312 2.92934 7.70312Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 11.8535C2.43705 11.8535 2.03613 12.2566 2.03613 12.7531C2.03613 13.2447 2.43705 13.6449 2.92934 13.6449C3.42163 13.6449 3.82326 13.2447 3.82326 12.7531C3.82326 12.2566 3.42163 11.8535 2.92934 11.8535Z" fill="#292929"/>
</svg>
              <span class="text-[#6D6D6D] font-danaregular">Visa Name:</span>
              <span class="text-[#292929] font-danamedium">${visa.visaname}</span>
            </li>
            <li class="flex items-center gap-x-2">
<svg id="location-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg" class="scale-110 origin-center print:scale-100" width="9" height="12" viewBox="0 0 9 12" fill="none" >
<path d="M4.49653 0.5C6.965 0.5 9 2.54484 9 5.07477C9 6.34963 8.55371 7.5332 7.81915 8.53637C7.00878 9.64293 6.00997 10.6071 4.8857 11.3638C4.62839 11.5387 4.39617 11.5519 4.11377 11.3638C2.9831 10.6071 1.98428 9.64293 1.18085 8.53637C0.445756 7.5332 0 6.34963 0 5.07477C0 2.54484 2.035 0.5 4.49653 0.5ZM4.49653 3.67726C3.68029 3.67726 3.01459 4.37629 3.01459 5.21721C3.01459 6.06474 3.68029 6.73132 4.49653 6.73132C5.3133 6.73132 5.98541 6.06474 5.98541 5.21721C5.98541 4.37629 5.3133 3.67726 4.49653 3.67726Z" fill="#242424"/>
</svg>
              <span class="text-[#6D6D6D] font-danaregular">Country:</span>
              <span class="text-[#292929] font-danamedium">${visa.visacountry}</span>
            </li>
            <li class="flex items-center gap-x-2">
                <svg id="calendar-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>
              <span class="text-[#6D6D6D] font-danaregular">Date:</span>
              <span class="text-[#292929] font-danamedium">${visa.visadate?.sstring || '-'}</span>
            </li>
            <li><span class="text-[#6D6D6D] font-danaregular">Application:</span> ${visa.application}</li>
            <li><span class="text-[#6D6D6D] font-danaregular">Type:</span> ${visa.visatype}</li>
            <li><span class="text-[#6D6D6D] font-danaregular">Visit:</span> ${visa.visit_log}</li>
            <li><span class="text-[#6D6D6D] font-danaregular">Validity:</span> ${safeValue(visa.validity_duration?.time)} ${safeValue(visa.validity_duration?.months)}</li>
            <li><span class="text-[#6D6D6D] font-danaregular">Documents:</span>
                <div class="divide-x inline-block">
${visa.documents?.map((doc, index, arr) =>
        `<span class="inline-block  mx-1">${doc.name1}${index < arr.length - 1 ? ',' : ''}</span>`
      ).join('') || ''}
                </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    `;
    }

    function renderTrainInfoSection(route) {
      const {
        route: routeName,
        routeDate,
        etime,
        atime,
        trainid,
        trainimage,
        startairport,
        endairport,
        routecode,
      } = route;

      const trainclass = route.class;

      const fromAirport = `${startairport.airport} / ${startairport.startotherinfo.city}`;
      const fromCode = startairport.startotherinfo.shortname;

      const toAirport = `${endairport.airport} / ${endairport.endotherinfo.city}`;
      const toCode = endairport.endotherinfo.shortname;

      return `

    <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative pb-[25px] overflow-hidden">
      <div class="flex justify-between p-[6px]">
        <div class="w-1/2 flex gap-x-2 items-center">
          <div class="bg-[#EAEAEA] rounded-md w-9 h-9 flex justify-center items-center">
                <img src="${trainimage}" width="36" height="36" alt="${trainid}" />

          </div>
          <div>
            <span class="block text-[#6D6D6D] text-xs font-interregular">From:</span>
            <span class="text-black text-xs font-danamedium">${fromAirport} <span class="text-[#292929]">(${fromCode})</span></span>
          </div>
        </div>
        <div class="w-1/2 flex gap-x-2 items-center">
          <div>
            <span class="block text-[#6D6D6D] text-xs font-interregular">To:</span>
            <span class="text-black text-xs font-danamedium">${toAirport} <span class="text-[#292929]">(${toCode})</span></span>
          </div>
        </div>
      </div>
      <div class="h-[25px] w-full bg-[#EAEAEA] absolute bottom-0 left-0 right-0 rounded-[4px]">
        <ul class="flex justify-between px-2">
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Date:</span>
            <span class="text-[#292929] text-sm font-danamedium">${routeDate.mstring}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Exit Time:</span>
            <span class="text-[#292929] text-sm font-danamedium">${etime}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Route Code :</span>
            <span class="text-[#292929] text-sm font-danamedium">${routecode}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Arrival Time:</span>
            <span class="text-[#292929] text-sm font-danamedium">${atime}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Train Name:</span>
            <span class="text-[#292929] text-sm font-danamedium">${trainid}</span>
          </li>
          <li>
            <span class="text-[#6D6D6D] text-xs font-danaregular">Class:</span>
            <span class="text-[#292929] text-sm font-danamedium">${trainclass}</span>
          </li>
        </ul>
      </div>
    </div>
  `;
    }

    function renderProducts(products) {
      return products.map(product => {


        console.log(product)



        if (globalInvoiceType != 8 && globalInvoiceType != 9) {
          console.log(globalInvoiceType, "testttttttttttttttttttttttttttttttttttttttttt flight")
          if (product.departure) {
            return product.departure.map(item => renderFlightInfoSection(item.route)).join('');
          }

          if (product.return) {
            return product.return.map(item => renderFlightInfoSection(item.route)).join('');
          }
        }

        if (globalInvoiceType == 8 || globalInvoiceType == 9) {

          if (product.departure) {
            return product.departure.map(item => renderTrainInfoSection(item.route)).join('');
          }

          if (product.return) {
            return product.return.map(item => renderTrainInfoSection(item.route)).join('');
          }
        }




        if (product.hotels) {
          return renderTourHotelInfoSection(product.hotels.hotel.room);
        }

        if (product.hotel) {
          return renderHotelInfoSection(product.hotel.room);
        }

        if (product.insurance) {
          return renderInsuranceInfoSection(product.insurance);
        }

        if (product.departure?.[0]?.cip) {
          return renderCipInfoSection(product.departure[0].cip);
        }

        if (product.return?.[0]?.cip) {
          return renderCipInfoSection(product.return[0].cip);
        }

        if (product.service?.service) {
          return renderServiceInfoSection(product.service?.service);
        }
        if (product.visa?.visa) {
          return renderVisaInfoSection(product.visa?.visa);
        }



        return ''; // fallback
      }).join('');
    }

    function renderAllProducts(products) {
      if (!Array.isArray(products) || products.length === 0) return '<p>هیچ محصولی یافت نشد.</p>';

      const flights = [];
      const returns = [];
      const hotels = [];
      const tourhotels = [];
      const insurances = [];
      const cips = [];
      const services = [];
      const visa = [];
      const traindeparture = [];
      const trainreturn = [];


      for (const product of products) {


        if (globalInvoiceType == 8 || globalInvoiceType == 9) {
          if (product?.departure?.length) {
            for (const item of product.departure) {
              if (item?.route) traindeparture.push(item.route);
            }
          }
          if (product?.return?.length) {
            for (const item of product.return) {
              if (item?.route) trainreturn.push(item.route);
            }
          }

        }


        if (globalInvoiceType != 8 && globalInvoiceType != 9) {
          if (product?.departure?.length) {
            for (const item of product.departure) {
              if (item?.route) flights.push(item.route);
              if (item?.cip) cips.push(item.cip);
            }
          }
          if (product?.return?.length) {
            for (const item of product.return) {
              if (item?.route) returns.push(item.route);
            }
          }
        }


        if (product?.hotel?.room) hotels.push(product.hotel.room);
        if (product?.hotels) tourhotels.push(product.hotels);
        if (product?.insurance) insurances.push(product.insurance);

        if (product?.service?.length) {
          for (const item of product.service) {
            if (item?.service) services.push(item.service);
          }
        }
        if (product?.visa?.length) {
          for (const item of product.visa) {
            if (item?.visa) visa.push(item.visa);
          }
        }



      }


      let html = '';

      if (traindeparture.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="airplane-right-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<g clip-path="url(#clip0_295_137)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0838 10.7266C15.1676 10.7046 16.3174 10.1774 16.2795 9.07268C16.2421 7.96477 15.052 7.36048 13.9604 7.26736C13.1838 7.20412 12.4004 7.18674 11.6424 7.17021L11.5185 7.16746C11.3716 7.16711 11.3497 7.15825 11.2788 7.01943C10.7391 5.93871 10.1706 4.8697 9.68676 3.9684C9.3559 3.34152 8.9047 2.96777 8.34872 2.86123C8.0107 2.79445 7.68091 2.77312 7.33181 2.75161C7.19498 2.74256 7.05675 2.73391 6.9151 2.72198C6.82446 2.71446 6.73651 2.74273 6.67173 2.80023C6.6079 2.85776 6.5732 2.93976 6.57541 3.0275L6.68548 6.99192L4.85428 7.09301L3.74891 5.81957C3.68127 5.74502 3.58682 5.69716 3.48691 5.69385L2.11177 5.64918C2.00952 5.64624 1.91452 5.68783 1.85416 5.76355C1.79381 5.83927 1.77529 5.93943 1.80324 6.03616L2.5608 8.61983L1.98787 11.1571C1.96633 11.2518 1.99259 11.3539 2.059 11.4333C2.06738 11.444 2.07668 11.4538 2.08643 11.4632C2.15078 11.525 2.23685 11.5621 2.32545 11.5651L3.70061 11.6098C3.80098 11.6126 3.89416 11.5728 3.95509 11.5003L4.96766 10.2848L6.81272 10.5168C6.84688 11.2703 6.93803 13.3208 6.988 14.4879C6.99162 14.5752 7.03706 14.6608 7.10093 14.7221C7.16954 14.7844 7.25973 14.8186 7.35005 14.8171C7.48929 14.8145 7.62628 14.8149 7.76185 14.8149C8.09515 14.816 8.43973 14.8166 8.77619 14.7744C9.33372 14.7016 9.74628 14.3673 10.0368 13.7552C10.4633 12.8646 10.9574 11.8286 11.4114 10.8002C11.4689 10.6711 11.4929 10.6574 11.6485 10.6653C12.4331 10.7021 13.2676 10.7379 14.0838 10.7266Z" fill="#292929"/>
</g>
<defs>
<clipPath id="clip0_295_137">
<rect width="17" height="17" fill="white"/>
</clipPath>
</defs>
</svg>
        <span>Departure Train</span>
      </h2>
      ${traindeparture.map(route => renderTrainInfoSection(route)).join('')}
    </section>`;
      }

      if (trainreturn.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="airplane-right-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<g clip-path="url(#clip0_295_137)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0838 10.7266C15.1676 10.7046 16.3174 10.1774 16.2795 9.07268C16.2421 7.96477 15.052 7.36048 13.9604 7.26736C13.1838 7.20412 12.4004 7.18674 11.6424 7.17021L11.5185 7.16746C11.3716 7.16711 11.3497 7.15825 11.2788 7.01943C10.7391 5.93871 10.1706 4.8697 9.68676 3.9684C9.3559 3.34152 8.9047 2.96777 8.34872 2.86123C8.0107 2.79445 7.68091 2.77312 7.33181 2.75161C7.19498 2.74256 7.05675 2.73391 6.9151 2.72198C6.82446 2.71446 6.73651 2.74273 6.67173 2.80023C6.6079 2.85776 6.5732 2.93976 6.57541 3.0275L6.68548 6.99192L4.85428 7.09301L3.74891 5.81957C3.68127 5.74502 3.58682 5.69716 3.48691 5.69385L2.11177 5.64918C2.00952 5.64624 1.91452 5.68783 1.85416 5.76355C1.79381 5.83927 1.77529 5.93943 1.80324 6.03616L2.5608 8.61983L1.98787 11.1571C1.96633 11.2518 1.99259 11.3539 2.059 11.4333C2.06738 11.444 2.07668 11.4538 2.08643 11.4632C2.15078 11.525 2.23685 11.5621 2.32545 11.5651L3.70061 11.6098C3.80098 11.6126 3.89416 11.5728 3.95509 11.5003L4.96766 10.2848L6.81272 10.5168C6.84688 11.2703 6.93803 13.3208 6.988 14.4879C6.99162 14.5752 7.03706 14.6608 7.10093 14.7221C7.16954 14.7844 7.25973 14.8186 7.35005 14.8171C7.48929 14.8145 7.62628 14.8149 7.76185 14.8149C8.09515 14.816 8.43973 14.8166 8.77619 14.7744C9.33372 14.7016 9.74628 14.3673 10.0368 13.7552C10.4633 12.8646 10.9574 11.8286 11.4114 10.8002C11.4689 10.6711 11.4929 10.6574 11.6485 10.6653C12.4331 10.7021 13.2676 10.7379 14.0838 10.7266Z" fill="#292929"/>
</g>
<defs>
<clipPath id="clip0_295_137">
<rect width="17" height="17" fill="white"/>
</clipPath>
</defs>
</svg>
        <span>Return Train</span>
      </h2>
      ${trainreturn.map(route => renderTrainInfoSection(route)).join('')}
    </section>`;
      }


      if (flights.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="airplane-right-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<g clip-path="url(#clip0_295_137)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0838 10.7266C15.1676 10.7046 16.3174 10.1774 16.2795 9.07268C16.2421 7.96477 15.052 7.36048 13.9604 7.26736C13.1838 7.20412 12.4004 7.18674 11.6424 7.17021L11.5185 7.16746C11.3716 7.16711 11.3497 7.15825 11.2788 7.01943C10.7391 5.93871 10.1706 4.8697 9.68676 3.9684C9.3559 3.34152 8.9047 2.96777 8.34872 2.86123C8.0107 2.79445 7.68091 2.77312 7.33181 2.75161C7.19498 2.74256 7.05675 2.73391 6.9151 2.72198C6.82446 2.71446 6.73651 2.74273 6.67173 2.80023C6.6079 2.85776 6.5732 2.93976 6.57541 3.0275L6.68548 6.99192L4.85428 7.09301L3.74891 5.81957C3.68127 5.74502 3.58682 5.69716 3.48691 5.69385L2.11177 5.64918C2.00952 5.64624 1.91452 5.68783 1.85416 5.76355C1.79381 5.83927 1.77529 5.93943 1.80324 6.03616L2.5608 8.61983L1.98787 11.1571C1.96633 11.2518 1.99259 11.3539 2.059 11.4333C2.06738 11.444 2.07668 11.4538 2.08643 11.4632C2.15078 11.525 2.23685 11.5621 2.32545 11.5651L3.70061 11.6098C3.80098 11.6126 3.89416 11.5728 3.95509 11.5003L4.96766 10.2848L6.81272 10.5168C6.84688 11.2703 6.93803 13.3208 6.988 14.4879C6.99162 14.5752 7.03706 14.6608 7.10093 14.7221C7.16954 14.7844 7.25973 14.8186 7.35005 14.8171C7.48929 14.8145 7.62628 14.8149 7.76185 14.8149C8.09515 14.816 8.43973 14.8166 8.77619 14.7744C9.33372 14.7016 9.74628 14.3673 10.0368 13.7552C10.4633 12.8646 10.9574 11.8286 11.4114 10.8002C11.4689 10.6711 11.4929 10.6574 11.6485 10.6653C12.4331 10.7021 13.2676 10.7379 14.0838 10.7266Z" fill="#292929"/>
</g>
<defs>
<clipPath id="clip0_295_137">
<rect width="17" height="17" fill="white"/>
</clipPath>
</defs>
</svg>
        <span>Departure Flights</span>
      </h2>
      ${flights.map(route => renderFlightInfoSection(route)).join('')}
    </section>`;
      }

      if (returns.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="airplane-right-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<g clip-path="url(#clip0_295_137)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0838 10.7266C15.1676 10.7046 16.3174 10.1774 16.2795 9.07268C16.2421 7.96477 15.052 7.36048 13.9604 7.26736C13.1838 7.20412 12.4004 7.18674 11.6424 7.17021L11.5185 7.16746C11.3716 7.16711 11.3497 7.15825 11.2788 7.01943C10.7391 5.93871 10.1706 4.8697 9.68676 3.9684C9.3559 3.34152 8.9047 2.96777 8.34872 2.86123C8.0107 2.79445 7.68091 2.77312 7.33181 2.75161C7.19498 2.74256 7.05675 2.73391 6.9151 2.72198C6.82446 2.71446 6.73651 2.74273 6.67173 2.80023C6.6079 2.85776 6.5732 2.93976 6.57541 3.0275L6.68548 6.99192L4.85428 7.09301L3.74891 5.81957C3.68127 5.74502 3.58682 5.69716 3.48691 5.69385L2.11177 5.64918C2.00952 5.64624 1.91452 5.68783 1.85416 5.76355C1.79381 5.83927 1.77529 5.93943 1.80324 6.03616L2.5608 8.61983L1.98787 11.1571C1.96633 11.2518 1.99259 11.3539 2.059 11.4333C2.06738 11.444 2.07668 11.4538 2.08643 11.4632C2.15078 11.525 2.23685 11.5621 2.32545 11.5651L3.70061 11.6098C3.80098 11.6126 3.89416 11.5728 3.95509 11.5003L4.96766 10.2848L6.81272 10.5168C6.84688 11.2703 6.93803 13.3208 6.988 14.4879C6.99162 14.5752 7.03706 14.6608 7.10093 14.7221C7.16954 14.7844 7.25973 14.8186 7.35005 14.8171C7.48929 14.8145 7.62628 14.8149 7.76185 14.8149C8.09515 14.816 8.43973 14.8166 8.77619 14.7744C9.33372 14.7016 9.74628 14.3673 10.0368 13.7552C10.4633 12.8646 10.9574 11.8286 11.4114 10.8002C11.4689 10.6711 11.4929 10.6574 11.6485 10.6653C12.4331 10.7021 13.2676 10.7379 14.0838 10.7266Z" fill="#292929"/>
</g>
<defs>
<clipPath id="clip0_295_137">
<rect width="17" height="17" fill="white"/>
</clipPath>
</defs>
</svg>
        <span>Return Flights</span>
      </h2>
      ${returns.map(route => renderFlightInfoSection(route)).join('')}
    </section>`;
      }




      if (hotels.length) {
        console.log(hotels)
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">
<svg id="bulleted-list-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 12.0376H5.7557C5.36399 12.0376 5.04736 12.3542 5.04736 12.7459C5.04736 13.1376 5.36399 13.4543 5.7557 13.4543H14.2557C14.6474 13.4543 14.9641 13.1376 14.9641 12.7459C14.9641 12.3542 14.6474 12.0376 14.2557 12.0376Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2557 7.7876H5.7557C5.36399 7.7876 5.04736 8.10422 5.04736 8.49593C5.04736 8.88764 5.36399 9.20426 5.7557 9.20426H14.2557C14.6474 9.20426 14.9641 8.88764 14.9641 8.49593C14.9641 8.10422 14.6474 7.7876 14.2557 7.7876Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.7557 4.95426H14.2557C14.6474 4.95426 14.9641 4.63764 14.9641 4.24593C14.9641 3.85422 14.6474 3.5376 14.2557 3.5376H5.7557C5.36399 3.5376 5.04736 3.85422 5.04736 4.24593C5.04736 4.63764 5.36399 4.95426 5.7557 4.95426Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 3.35352C2.43705 3.35352 2.03613 3.75656 2.03613 4.25309C2.03613 4.74468 2.43705 5.14489 2.92934 5.14489C3.42163 5.14489 3.82326 4.74468 3.82326 4.25309C3.82326 3.75656 3.42163 3.35352 2.92934 3.35352Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 7.70312C2.43705 7.70312 2.03613 8.10333 2.03613 8.59563C2.03613 9.08721 2.43705 9.48813 2.92934 9.48813C3.42163 9.48813 3.82326 9.08721 3.82326 8.59563C3.82326 8.10333 3.42163 7.70312 2.92934 7.70312Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.92934 11.8535C2.43705 11.8535 2.03613 12.2566 2.03613 12.7531C2.03613 13.2447 2.43705 13.6449 2.92934 13.6449C3.42163 13.6449 3.82326 13.2447 3.82326 12.7531C3.82326 12.2566 3.42163 11.8535 2.92934 11.8535Z" fill="#292929"/>
</svg>
        <span>List of Rooms</span>
      </h2>
      ${hotels.map(room => renderHotelInfoSection(room)).join('')}
    </section>`;
      }


      if (tourhotels.length) {
        html += `
      ${tourhotels.map(hotel => renderTourHotelInfoSection(hotel)).join('')}`;
      }

      const validInsurances = Array.isArray(insurances)
        ? insurances.filter(ins => ins && Object.keys(ins).length > 0)
        : [];

      if (validInsurances.length > 0) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg class="h-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.37752 5.08241C3 5.62028 3 7.21907 3 10.4167V11.9914C3 17.6294 7.23896 20.3655 9.89856 21.5273C10.62 21.8424 10.9807 22 12 22C13.0193 22 13.38 21.8424 14.1014 21.5273C16.761 20.3655 21 17.6294 21 11.9914V10.4167C21 7.21907 21 5.62028 20.6225 5.08241C20.245 4.54454 18.7417 4.02996 15.7351 3.00079L15.1623 2.80472C13.595 2.26824 12.8114 2 12 2C11.1886 2 10.405 2.26824 8.83772 2.80472L8.26491 3.00079C5.25832 4.02996 3.75503 4.54454 3.37752 5.08241ZM15.0595 10.4995C15.3353 10.1905 15.3085 9.71642 14.9995 9.44055C14.6905 9.16467 14.2164 9.19151 13.9405 9.50049L10.9286 12.8739L10.0595 11.9005C9.78358 11.5915 9.30947 11.5647 9.00049 11.8405C8.69151 12.1164 8.66467 12.5905 8.94055 12.8995L10.3691 14.4995C10.5114 14.6589 10.7149 14.75 10.9286 14.75C11.1422 14.75 11.3457 14.6589 11.488 14.4995L15.0595 10.4995Z" fill="#000"/>
</svg>
        <span>Travel Insurance</span>
      </h2>
      ${validInsurances.map(ins => renderInsuranceInfoSection(ins)).join('')}
    </section>`;
      }


      if (cips.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2 ">

        <svg class="h-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.5332 18H6.88633C6.82438 18 6.7934 18 6.76531 17.9996C6.76021 17.9995 6.7551 17.9995 6.75 17.9994V18.9995V20C6.75 20.4143 6.41421 20.75 6 20.75C5.58579 20.75 5.25 20.4143 5.25 20V17.6756C4.42121 17.3138 3.76073 16.6712 3.44197 15.8594C3.43268 15.8357 3.42288 15.8095 3.4033 15.757L2.10028 12.2643C1.68469 11.1504 2.61268 10 3.92689 10C4.7372 10 5.46079 10.4533 5.73699 11.1339L6.83511 13.84C6.93505 14.0863 6.98502 14.2094 7.05744 14.3101C7.22656 14.5452 7.49217 14.7116 7.79716 14.7735C7.92777 14.8 8.07437 14.8 8.36757 14.8H15.3467C15.9158 14.8 16.2004 14.8 16.4383 14.7019C16.5683 14.6484 16.6864 14.5744 16.787 14.4835C16.9713 14.317 17.0683 14.078 17.2623 13.6L18.263 11.1339C18.5392 10.4533 19.2628 10 20.0731 10C21.3873 10 22.3153 11.1504 21.8997 12.2643L20.7803 15.2649C20.5852 15.7879 20.4876 16.0494 20.3588 16.2717C20.0008 16.8892 19.4328 17.3776 18.75 17.6755V20C18.75 20.4143 18.4142 20.75 18 20.75C17.5858 20.75 17.25 20.4143 17.25 20V17.9954C17.0633 18 16.8352 18 16.5332 18Z" fill="#000"/>
<path d="M13.2357 3.5H10.7643C9.66322 3.49999 8.78836 3.49998 8.10305 3.58773C7.39835 3.67797 6.81875 3.86871 6.35812 4.3074C5.89405 4.74937 5.68912 5.31102 5.59278 5.99349C5.49998 6.65087 5.49999 7.48809 5.5 8.53272V9.41279L5.71048 9.56228C6.12613 9.85748 6.46195 10.2607 6.66373 10.7579L7.89815 13.7999L15.3468 13.8C15.4911 13.8 15.6081 13.8 15.7101 13.7986L15.7122 13.7985L16.1 13.7916L16.2263 13.4912C16.2577 13.4164 16.2928 13.33 16.3358 13.224L17.3365 10.7579C17.5383 10.2607 17.874 9.85762 18.2896 9.56243L18.5 9.41294V8.53275C18.5 7.48811 18.5 6.65088 18.4072 5.99349C18.3109 5.31102 18.1059 4.74937 17.6419 4.3074C17.1813 3.86871 16.6017 3.67797 15.897 3.58773C15.2116 3.49998 14.3368 3.49999 13.2357 3.5Z" fill="#000"/>
</svg>
        <span>CIP Services</span>
      </h2>
      ${cips.map(cip => renderCipInfoSection(cip)).join('')}
    </section>`;
      }


      if (services.length) {
        html += `
  <section class="dir-ltr mt-4">
    <h2 class="text-base font-danabold flex items-center gap-x-2">
<svg class="h-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0002 1.25C12.4144 1.25 12.7502 1.58579 12.7502 2V3C12.7502 3.41421 12.4144 3.75 12.0002 3.75C11.586 3.75 11.2502 3.41421 11.2502 3V2C11.2502 1.58579 11.586 1.25 12.0002 1.25ZM4.39927 4.39861C4.69216 4.10572 5.16703 4.10572 5.45993 4.39861L5.85277 4.79145C6.14566 5.08434 6.14566 5.55921 5.85277 5.85211C5.55987 6.145 5.085 6.145 4.7921 5.85211L4.39927 5.45927C4.10637 5.16638 4.10637 4.6915 4.39927 4.39861ZM19.6008 4.39887C19.8937 4.69176 19.8937 5.16664 19.6008 5.45953L19.208 5.85237C18.9151 6.14526 18.4402 6.14526 18.1473 5.85237C17.8544 5.55947 17.8544 5.0846 18.1473 4.79171L18.5402 4.39887C18.833 4.10598 19.3079 4.10598 19.6008 4.39887ZM1.25017 12C1.25017 11.5858 1.58596 11.25 2.00017 11.25H3.00017C3.41438 11.25 3.75017 11.5858 3.75017 12C3.75017 12.4142 3.41438 12.75 3.00017 12.75H2.00017C1.58596 12.75 1.25017 12.4142 1.25017 12ZM20.2502 12C20.2502 11.5858 20.586 11.25 21.0002 11.25H22.0002C22.4144 11.25 22.7502 11.5858 22.7502 12C22.7502 12.4142 22.4144 12.75 22.0002 12.75H21.0002C20.586 12.75 20.2502 12.4142 20.2502 12ZM4.57004 18.8657C5.25688 17.7919 6.72749 17.8271 7.4577 18.7618C8.4477 20.0291 9.82965 21.25 12.0002 21.25C14.2088 21.25 15.5699 20.2712 16.5051 19.0209C17.2251 18.0585 18.7909 17.9013 19.5458 19.0435C20.1708 19.9891 20.8488 20.7306 22.1722 21.0424C22.5754 21.1374 22.8252 21.5412 22.7302 21.9444C22.6352 22.3476 22.2313 22.5974 21.8282 22.5024C19.9762 22.066 19.0206 20.9692 18.2944 19.8705C18.2374 19.7844 18.1519 19.7406 18.0408 19.7427C17.9223 19.7449 17.7936 19.8027 17.7063 19.9195C16.5386 21.4804 14.7604 22.75 12.0002 22.75C9.15759 22.75 7.38876 21.1101 6.27565 19.6853C6.20392 19.5934 6.11032 19.5585 6.02981 19.5602C5.95388 19.5619 5.88442 19.5946 5.83365 19.674C5.09416 20.8301 4.13929 22.0389 2.17218 22.5024C1.76901 22.5974 1.36516 22.3476 1.27016 21.9444C1.17516 21.5412 1.42498 21.1374 1.82816 21.0424C3.2291 20.7123 3.90775 19.9011 4.57004 18.8657Z" fill="#000"/>
<path d="M22.1722 16.0424C20.8488 15.7306 20.1708 14.9891 19.5458 14.0435C19.137 13.425 18.4905 13.1875 17.8692 13.2526C17.955 12.8486 18.0002 12.4296 18.0002 12C18.0002 8.68629 15.3139 6 12.0002 6C8.68646 6 6.00017 8.68629 6.00017 12C6.00017 12.3623 6.03228 12.7171 6.0938 13.0617C5.51698 13.0396 4.93367 13.2972 4.57004 13.8657C3.90775 14.9011 3.2291 15.7123 1.82816 16.0424C1.42498 16.1374 1.17516 16.5412 1.27016 16.9444C1.36516 17.3476 1.76901 17.5974 2.17218 17.5024C4.13929 17.0389 5.09416 15.8301 5.83365 14.674C5.88442 14.5946 5.95388 14.5619 6.02981 14.5602C6.11032 14.5585 6.20392 14.5934 6.27565 14.6853C7.38876 16.1101 9.15759 17.75 12.0002 17.75C14.7604 17.75 16.5386 16.4804 17.7063 14.9195C17.7936 14.8027 17.9223 14.7449 18.0408 14.7427C18.1519 14.7406 18.2374 14.7844 18.2944 14.8705C19.0206 15.9692 19.9762 17.066 21.8282 17.5024C22.2313 17.5974 22.6352 17.3476 22.7302 16.9444C22.8252 16.5412 22.5754 16.1374 22.1722 16.0424Z" fill="#000"/>
</svg>
      <span>Service</span>
    </h2>
    ${services.map(service => renderServiceInfoSection(service)).join('')}
  </section>`;
      }

      if (visa.length) {
        html += `
    <section class="dir-ltr mt-4">
      <h2 class="text-base font-danabold flex items-center gap-x-2">

<svg class="h-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.75458 14.716L3.27222 16.6479C3.87647 18.9029 4.17859 20.0305 4.86351 20.7618C5.40432 21.3392 6.10421 21.7433 6.87466 21.9229C7.85044 22.1504 8.97798 21.8483 11.2331 21.244C13.4881 20.6398 14.6157 20.3377 15.347 19.6528C15.4077 19.5959 15.4664 19.5373 15.5233 19.477C15.1891 19.449 14.852 19.3952 14.5094 19.3271C13.8133 19.1887 12.9862 18.967 12.008 18.7049L11.9012 18.6763L11.8764 18.6697C10.8121 18.3845 9.92281 18.1457 9.21277 17.8892C8.46607 17.6195 7.7876 17.287 7.21148 16.7474C6.41753 16.0038 5.86193 15.0414 5.61491 13.982C5.43567 13.2133 5.48691 12.4594 5.62666 11.6779C5.76058 10.929 6.00109 10.0315 6.28926 8.95613L6.28926 8.95611L6.82365 6.96174L6.84245 6.8916C4.9219 7.40896 3.91101 7.71505 3.23687 8.34646C2.65945 8.88726 2.25537 9.58715 2.07573 10.3576C1.84821 11.3334 2.15033 12.4609 2.75458 14.716Z" fill="#000"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M20.8293 10.7154L20.3116 12.6473C19.7074 14.9024 19.4052 16.0299 18.7203 16.7612C18.1795 17.3386 17.4796 17.7427 16.7092 17.9223C16.6129 17.9448 16.5152 17.9621 16.415 17.9744C15.4999 18.0873 14.3834 17.7881 12.3508 17.2435C10.0957 16.6392 8.96815 16.3371 8.23687 15.6522C7.65945 15.1114 7.25537 14.4115 7.07573 13.641C6.84821 12.6652 7.15033 11.5377 7.75458 9.28263L8.27222 7.35077C8.3591 7.02654 8.43979 6.7254 8.51621 6.44561C8.97128 4.77957 9.27709 3.86298 9.86351 3.23687C10.4043 2.65945 11.1042 2.25537 11.8747 2.07573C12.8504 1.84821 13.978 2.15033 16.2331 2.75458C18.4881 3.35883 19.6157 3.66095 20.347 4.34587C20.9244 4.88668 21.3285 5.58657 21.5081 6.35703C21.7356 7.3328 21.4335 8.46034 20.8293 10.7154ZM11.0524 9.80589C11.1596 9.40579 11.5709 9.16835 11.971 9.27556L16.8006 10.5697C17.2007 10.6769 17.4381 11.0881 17.3309 11.4882C17.2237 11.8883 16.8125 12.1257 16.4124 12.0185L11.5827 10.7244C11.1826 10.6172 10.9452 10.206 11.0524 9.80589ZM10.2756 12.7033C10.3828 12.3032 10.794 12.0658 11.1941 12.173L14.0919 12.9495C14.492 13.0567 14.7294 13.4679 14.6222 13.868C14.515 14.2681 14.1038 14.5056 13.7037 14.3984L10.8059 13.6219C10.4058 13.5147 10.1683 13.1034 10.2756 12.7033Z" fill="#000"/>
</svg>

        <span>Visa Services</span>
      </h2>
      ${visa.map(v => renderVisaInfoSection(v)).join('')}
    </section>`;
      }




      return html;
    }

    function renderPassengers(passengers, $data) {
      const invoiceType = $data?.invoiceDetails?.invoicetype;
      const grouped = {};

      // گروه بندی مسافران بر اساس شماره اتاق
      passengers.forEach((pax) => {
        const passengerinfo = pax.passengerinfo;
        const rawRoomNum = passengerinfo.roomnumber ?? passengerinfo.roomid ?? "";
        const roomNum = parseInt(rawRoomNum);
        const finalRoomNum = isNaN(roomNum) ? null : roomNum;

        if (finalRoomNum !== null) {
          if (!grouped[finalRoomNum]) grouped[finalRoomNum] = [];
          grouped[finalRoomNum].push(pax); // توجه: اینجا کل آبجکت pax رو میذاریم
        }
      });

      const genderMap = { "0": "Female", "1": "Male" };
      const typeMap = { "1": "Child", "2": "Adult", "3": "Infant" };

      let html = "";

      const hasRooms = Object.keys(grouped).length > 0;

      // تابع کمکی برای ساختن جدول اطلاعات جانبی (بیمه، ترنسفر و ...)
      function renderInfoBox(title, data) {
        if (!data || Object.keys(data).length === 0) return "";

        const blacklist = ["file_address"];
        const entries = Object.entries(data).filter(([key]) => !blacklist.includes(key));

        if (entries.length === 0) return ""; // اگر بعد از فیلتر چیزی باقی نموند، هیچی نشون نده

        return `
    <tr>
      <td colspan="10" class="pt-2">
        <div class="mt-2 rounded-[10px] bg-[#F0F0F0] overflow-hidden border border-[#DADADA]">
          <table class="w-full text-left border-separate border-spacing-y-2 border-none">
            <thead>
              <tr>
                <th colspan="${entries.length}" class="text-black text-xs font-danabold px-2 pt-2 pb-1">${title}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                ${entries.map(([key]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `<td class="text-[#6D6D6D] text-xs font-danaregular px-2 py-1 whitespace-nowrap">${label}</td>`;
        }).join('')}
              </tr>
              <tr>
                ${entries.map(([_, value]) => {
          return `<td class="text-[#292929] text-xs font-danamedium px-2 py-1 whitespace-nowrap">${value || "-"}</td>`;
        }).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  `;
      }


      // اگر اتاقی وجود ندارد ولی مسافر هست (مسافران بدون اتاق)
      if (!hasRooms && passengers.length > 0) {
        html += `
      <section class="dir-ltr mt-4">
        <h2 class="text-base font-danabold flex items-center gap-x-2">
          <svg id="user-icon-pdf" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.06714 1.51294C7.30739 1.51294 8.31297 2.51852 8.31297 3.75877C8.31297 4.99903 7.30739 6.00461 6.06714 6.00461C4.82687 6.00461 3.82129 4.99903 3.82129 3.75877C3.82129 2.51852 4.82687 1.51294 6.06714 1.51294Z" fill="#6D6D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.12154 6.41675H5.05902C3.91318 6.41675 2.95068 7.37925 2.95068 8.52508V8.66258C2.95068 9.12091 3.31735 9.48758 3.77568 9.48758H8.35904C8.81737 9.48758 9.22987 9.16675 9.18404 8.66258V8.52508C9.22987 7.37925 8.26737 6.41675 7.12154 6.41675Z" fill="#6D6D6D"/>
</svg>
          <span>اطلاعات مسافر</span>
        </h2>
        <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative p-2 overflow-hidden">
          <table class="w-full text-left border-separate border-spacing-y-2 border-none">
            <thead>
              <tr>
                <th class="text-[#6D6D6D] text-xs font-danaregular">First Name</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Last Name</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Date of Birth</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">National Code</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Passport No</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Passport Expiry</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Issue Country</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Gender</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Age Type</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Cost</th>
              </tr>
            </thead>
            <tbody>
    `;

        passengers.forEach((pax) => {
          const info = pax.passengerinfo;
          const cost = pax.costinfo?.cost ?? 0;
          const transfer = pax.transfer;
          const insurance = info?.insuranceinfo;

          html += `
        <tr>
          <td class="text-[#292929] text-xs font-danamedium">${info.fullname.firstname}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.fullname.lastname}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.birthdate?.S_birthdate ?? ""}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.nationalcode}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.passportcode}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.passportexpiration}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.countryofresidence?.ecountryname ?? info.countryofpassportissue?.ecountryname ?? ""}</td>
          <td class="text-[#292929] text-xs font-danamedium">${genderMap[info.gender]}</td>
          <td class="text-[#292929] text-xs font-danamedium">${typeMap[info.type]}</td>
          <td class="text-[#292929] text-xs font-danamedium">${Number(cost).toLocaleString("en-US")}</td>
        </tr>
      `;

          if (transfer && Object.keys(transfer).length > 0) {
            html += renderInfoBox("Transfer Information", transfer);
          }


          if (insurance) {

            console.log("Insurance Information1", insurance);
          }
          if (insurance && (typeof insurance === 'object')) {

            console.log("Insurance Information2", insurance);
          }
          if (Object.keys(insuranceinfo).length > 0) {

            console.log("Insurance Information3", insurance);
          }


          if (insurance && Object.keys(insurance).length > 0) {
            html += renderInfoBox("Insurance Information", insurance);
          }
        });

        html += `
            </tbody>
          </table>
        </div>
      </section>
    `;

        return html;
      }

      // اگر اتاق‌ها وجود دارند
      Object.entries(grouped).forEach(([roomNum, paxList]) => {
        html += `
      <section class="dir-ltr mt-4">
        <h2 class="text-base font-danabold flex items-center gap-x-2">
          <svg class="h-5" id="large-bed-icon-pdf" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.4484 7.39969H4.55347C4.62099 7.39969 4.67858 7.3518 4.69579 7.28656C4.91576 6.45219 5.67608 5.83498 6.57853 5.83498C7.48098 5.83498 8.24131 6.45219 8.46124 7.28656C8.47846 7.3518 8.53604 7.39969 8.60362 7.39969H8.85798C8.92556 7.39969 8.98315 7.3518 9.00036 7.28656C9.2203 6.45219 9.98062 5.83498 10.8831 5.83498C11.7855 5.83498 12.5458 6.45219 12.7658 7.28656C12.783 7.3518 12.8406 7.39969 12.9082 7.39969H14.0132C14.2087 7.39969 14.3674 7.24102 14.3674 7.04552V4.75689C14.3674 4.20723 14.3674 3.93169 14.2732 3.67173C14.1138 3.22831 13.7646 2.87556 13.3042 2.70131C13.0449 2.61206 12.7687 2.61206 12.2197 2.61206H5.24191C4.69295 2.61206 4.41811 2.61206 4.14611 2.70485C3.69632 2.87556 3.34711 3.22831 3.18915 3.67031C3.09424 3.93169 3.09424 4.20652 3.09424 4.75689V7.04552C3.09424 7.24102 3.2529 7.39969 3.4484 7.39969Z" fill="#292929"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.3725 9.13107C15.2202 8.70748 14.8929 8.37953 14.4715 8.22936C14.2292 8.14648 13.9763 8.14648 13.4741 8.14648H3.98812C3.4852 8.14648 3.23304 8.14648 2.98583 8.23078C2.56791 8.38023 2.24137 8.7089 2.09049 9.13036C2.00195 9.37332 2.00195 9.62548 2.00195 10.1298V11.1151C2.00195 11.623 2.00195 11.878 2.08979 12.1202C2.23995 12.5389 2.56649 12.8647 2.97874 13.0106C3.10412 13.0581 3.23233 13.0822 3.39383 13.0935V13.8557C3.39383 14.1489 3.63183 14.3869 3.92508 14.3869C4.21833 14.3869 4.45633 14.1489 4.45633 13.8557V13.2465C4.45633 13.1682 4.51975 13.1048 4.59799 13.1048H12.865C12.9432 13.1048 13.0066 13.1682 13.0066 13.2465V13.8557C13.0066 14.1489 13.2446 14.3869 13.5379 14.3869C13.8311 14.3869 14.0691 14.1489 14.0691 13.8557V13.0935C14.2285 13.0829 14.3539 13.0602 14.475 13.0134C14.8943 12.8647 15.2216 12.5396 15.3725 12.1209C15.4603 11.878 15.4603 11.623 15.4603 11.1151V10.1298C15.4603 9.62619 15.4603 9.37332 15.3725 9.13107Z" fill="#292929"/>
</svg>
          <span>Room ${parseInt(roomNum) + 1}</span>
        </h2>
        <div class="mb-4 rounded-[10px] bg-[#F8F8F8] relative p-2 overflow-hidden">
          <table class="w-full text-left border-separate border-spacing-y-2 border-none">
            <thead>
              <tr>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Name:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Surname:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Date of Birth</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">National Code:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Passport No:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Expiration Date of Passport:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Gender:</th>
                <th class="text-[#6D6D6D] text-xs font-danaregular">Age Range:</th>
              </tr>
            </thead>
            <tbody>
    `;

        paxList.forEach((pax) => {
          const info = pax.passengerinfo;
          const transfer = pax.transfer;
          const insurance = info.insuranceinfo;

          html += `
        <tr>
          <td class="text-[#292929] text-xs font-danamedium">${info.fullname.firstname}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.fullname.lastname}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.birthdate?.S_birthdate ?? ""}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.nationalcode}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.passportcode}</td>
          <td class="text-[#292929] text-xs font-danamedium">${info.passportexpiration}</td>
          <td class="text-[#292929] text-xs font-danamedium">${genderMap[info.gender]}</td>
          <td class="text-[#292929] text-xs font-danamedium">${typeMap[info.type]}</td>
        </tr>
      `;

          if (transfer && Object.keys(transfer).length > 0) {
            html += renderInfoBox("Transfer Information", transfer);
          }
          if (insurance && Object.keys(insurance).length > 0) {
            html += renderInfoBox("Insurance Information", insurance);
          }
        });

        html += `
            </tbody>
          </table>
        </div>
      </section>
    `;
      });

      return html;
    }

    function detectDirection(text) {
      const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
      return rtlChars.test(text) ? 'rtl' : 'ltr';
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

    async function renderDescription($data) {
      const rules = $data?.pdf_description;
      if (!rules || !Array.isArray(rules)) {
        console.warn("هیچ آیتمی در pdf_description پیدا نشد");
        return null;
      }

      let direction = detectDirection(rules?.[0]?.note?.text);

      let ulitem = '';
      rules.forEach((item, index) => {
        const text = item?.note?.text?.trim();

        if (text) {
          const cleanedText = text.replace(/\n/g, '<br/>'); // ⬅️ این خط اضافه شده
          ulitem += `<li class="my-4">${cleanedText}</li>`;
        } else {
          console.warn(`آیتم ${index} متن معتبری ندارد`, item);
        }
      });

      if (ulitem) {
        return `
      <div class="w-full flex justify-between flex-wrap gap-y-2">
        <div class="w-full text-xs bg-[#F4F4F4] border-2 border-[#E8E8E8] rounded-sm font-danaregular p-4 text-justify">
          <ul dir="${direction}" class="text-justify">${fixRTLTextCompletely(ulitem)}</ul>
        </div>
      </div>
    `;
      } else {
        return '';
      }
    }



    function getOwner(ownerid) {

      $bc.setSource("db.ownerdb", {
        ownerid: ownerid,
        run: true,
      });

      return '';
    }



// invoice pdf functions