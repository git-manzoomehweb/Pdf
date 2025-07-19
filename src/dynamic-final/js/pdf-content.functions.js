// General functions
function cleanInvisibleCharsFromTags(text) {
    if (typeof text !== 'string') return text;

    // لیست کاراکترهای نامرئی کنترل جهت متن
    const invisibleChars = /[\u200E\u200F\u202A-\u202E]/g;

    // فقط داخل تگ‌های HTML پاکسازی کن
    return text.replace(/<[^>]+>/g, tag => tag.replace(invisibleChars, ''));
}
function sanitizeText(text) {
    if (typeof text !== 'string') return text;

    // حذف همه کاراکترهای کنترل جهت متن (جهت جلوگیری از خراب‌شدن خروجی)
    const cleaned = text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');

    return cleaned;
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
function detectDirection(text) {
    const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return rtlChars.test(text) ? 'rtl' : 'ltr';
}
function extractFilenameFromUrl(url) {
    if (!url) return "";
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.split('/').pop();
    } catch (e) {
        return url.split('/').pop();
    }
}
function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
async function getLocalizedText(dir, faText, enText) {
    const isRTL = dir === 'rtl';
    return isRTL ? faText : enText;
}
async function checkSection(input) {
    console.log(input)

    // اگر ورودی null یا undefined یا رشته خالی بود
    if (
        input === null ||
        input === undefined ||
        (typeof input === 'string' && input.trim() === '') ||
                (Array.isArray(input) && input.length === 0)

    ) {
        return 'hidden';
    }

    // اگر رشته HTML هست مثل <p></p> یا <div>  </div> یا فقط تگ‌های خالی
    if (typeof input === 'string') {
        const temp = document.createElement('div');
        temp.innerHTML = input;

        // اگر هیچ متن قابل‌نمایشی نداشت
        if (temp.textContent.trim() === '') {
            return 'hidden';
        }
    }

    // در غیر اینصورت مشکلی نیست
    return '';
}
async function waitForImagesToLoad(container) {
    const images = container.querySelectorAll("img");
    const promises = [];
    images.forEach(img => {
        if (!img.complete) {
            promises.push(new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            }));
        }
    });
    await Promise.all(promises);
}
function formatDateToReadable(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    };
    const formatted = date.toLocaleDateString('en-US', options);
    const [weekday, month, day, year] = formatted.replace(',', '').split(' ');
    return `${day} ${month} ${year}<span class="mx-1"> / </span>${weekday}`;
}
// General functions
// ----------------------------- Lounge PDF --------------------------------

async function RenderInfoCardLounge($data, lang) {
    let loungeJson = $data;

    // تعریف ترجمه‌ها برای هر زبان
    const translations = {
        1: { // فارسی
            error: "داده‌های هتل نامعتبر است.",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            error: "Invalid hotel data provided.",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            error: "بيانات الفندق غير صالحة.",
            dir: "rtl",
            textAlign: "text-right"
        }
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


async function renderRulesLounge($data, lang ) {
    const rules = $data?.pdf_description;

    // تعریف ترجمه‌ها برای هر زبان
    const translations = {
        1: { // فارسی
            noItems: "هیچ آیتمی در pdf_description پیدا نشد",
            invalidText: "آیتم {index} متن معتبری ندارد",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            noItems: "No items found in pdf_description",
            invalidText: "Item {index} does not have valid text",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            noItems: "لم يتم العثور على أي عناصر في pdf_description",
            invalidText: "العنصر {index} لا يحتوي على نص صالح",
            dir: "rtl",
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    if (!rules || !Array.isArray(rules)) {
        console.warn(t.noItems);
        return null;
    }

    let direction = detectDirection(rules?.[0]?.note.text) || t.dir;

    let ulitem = '';
    rules.forEach((item, index) => {
        const text = item?.note?.text?.trim();

        if (text) {
            ulitem += `<li>${text}</li>`;
        } else {
            console.warn(t.invalidText.replace("{index}", index), item);
        }
    });

    return `<ul dir="${direction}" class="${t.textAlign}">${fixRTLTextCompletely(ulitem)}</ul>`;
}

async function renderLoungeInfo($data, lang) {
    let product_info = $data?.product_info;
    let Flightinfo = '';

    // تعریف ترجمه‌ها برای هر زبان
    const translations = {
        1: { // فارسی
            title: "اطلاعات lounge",
            airport: "نام فرودگاه",
            city: "شهر",
            airline: "ایرلاین",
            routecode: "کد مسیر",
            date: "تاریخ",
            time: "ساعت",
            travelType: "نوع سفر",
            flightType: "نوع پرواز",
            domestic: "داخلی",
            international: "خارجی",
            arrival: "ورودی",
            departure: "خروجی",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
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
            textAlign: "text-left"
        },
        3: { // عربی
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
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    console.log(product_info);

    Flightinfo += `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.airport}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.airportName}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.city}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.cityname}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.airline}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.airline}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.routecode}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.routecode}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.date}</span>
                <div class="text-[#292929] text-sm font-danademibold dir-${t.dir} ${t.textAlign}">
                    <span>${product_info.dateinfo.mstring}</span>
                    ${lang === 1 ? `<span>(${product_info.dateinfo.sstring})</span>` : ''}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.time}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.time}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.travelType}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    ${product_info.traveltype === "1" ? t.domestic : t.international}
                </div>
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.flightType}</span>
                <div class="text-[#292929] text-sm font-danademibold ${t.textAlign}">
                    <span class="inline-block">${product_info.flighttype === "1" ? t.arrival : t.departure}</span>
                    <span class="mx-1">-</span>
                    <span class="inline-block">${product_info.city_flight}</span>
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
        1: { // فارسی
            title: "اطلاعات مسافران",
            row: "ردیف",
            passengers: "مسافران",
            type: "نوع مسافر",
            gender: "جنسیت",
            country: "ملیت",
            male: "مرد",
            female: "زن",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            title: "Passenger Information",
            row: "Row",
            passengers: "Passengers",
            type: "Passenger Type",
            gender: "Gender",
            country: "Nationality",
            male: "Male",
            female: "Female",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            title: "معلومات المسافرين",
            row: "الصف",
            passengers: "المسافرون",
            type: "نوع المسافر",
            gender: "الجنس",
            country: "الجنسية",
            male: "ذكر",
            female: "أنثى",
            dir: "rtl",
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    const parsedPassengers = passengers.map(p => {
        const info = p.cip_passenger;
        return {
            name: `${info.fullname.firstname?.trim() || ''} ${info.fullname.lastname?.trim() || ''}`,
            type: info.type || '–',
            gender: info.gender || '–',
            birthdate: info.birthdate?.birthdate1 || '–',
            country: info.countryofresidence?.countryname || '–'
        };
    });

    console.log(parsedPassengers);

    const passengerNames = parsedPassengers.map(p =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${p.name}</h2>`
    ).join('');

    const passengerTypes = parsedPassengers.map(p =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${p.type}</h2>`
    ).join('');

    const passengerCountries = parsedPassengers.map(p =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${p.country}</h2>`
    ).join('');

    const passengerGender = parsedPassengers.map(p =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${p.gender == "1" ? t.male : t.female}</h2>`
    ).join('');

    const rowNumbers = parsedPassengers.map((_, index) =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${index + 1}</h2>`
    ).join('');

    return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4" dir="${t.dir}">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.row}</span>
                ${rowNumbers}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.passengers}</span>
                ${passengerNames}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.type}</span>
                ${passengerTypes}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.gender}</span>
                ${passengerGender}
            </div>
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.country}</span>
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
        1: { // فارسی
            title: "اطلاعات خدمات",
            serviceName: "نام خدمات",
            count: "تعداد",
            description: "توضیحات",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            title: "Service Information",
            serviceName: "Service Name",
            count: "Count",
            description: "Description",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            title: "معلومات الخدمات",
            serviceName: "اسم الخدمة",
            count: "العدد",
            description: "الوصف",
            dir: "rtl",
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    const serviceNames = services.map(s =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${s.service.servicename || '–'}</h2>`
    ).join('');

    const serviceDescriptions = services.map(s =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${s.service.des_service || '–'}</h2>`
    ).join('');

    const serviceCount = services.map(s =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${s.service.count || '–'}</h2>`
    ).join('');

    return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.serviceName}</span>
                ${serviceNames}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.count}</span>
                ${serviceCount}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.description}</span>
                ${serviceDescriptions}
            </div>
        </div>
    `;
}

async function renderTransferInfoLounge($data, lang ) {
    const transfers = $data?.transferinfo || [];

    // تعریف ترجمه‌ها برای هر زبان
    const translations = {
        1: { // فارسی
            title: "اطلاعات ترنسفر",
            carName: "نام خودرو",
            address: "آدرس",
            time: "زمان",
            phone: "شماره تماس",
            description: "توضیحات",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            title: "Transfer Information",
            carName: "Car Name",
            address: "Address",
            time: "Time",
            phone: "Phone Number",
            description: "Description",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            title: "معلومات النقل",
            carName: "اسم السيارة",
            address: "العنوان",
            time: "الوقت",
            phone: "رقم الهاتف",
            description: "الوصف",
            dir: "rtl",
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    const carNames = transfers.map(t =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${t.transfer?.car_name || '–'}</h2>`
    ).join('');

    const addresses = transfers.map(t =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${t.transfer?.address || '–'}</h2>`
    ).join('');

    const times = transfers.map(t =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${t.transfer?.time || '–'}</h2>`
    ).join('');

    const phones = transfers.map(t =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${t.transfer?.phone || '–'}</h2>`
    ).join('');

    const descriptions = transfers.map(t =>
        `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${t.transfer?.des_transfer || '–'}</h2>`
    ).join('');

    return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.carName}</span>
                ${carNames}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.address}</span>
                ${addresses}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.time}</span>
                ${times}
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.phone}</span>
                ${phones}
            </div>
            <div class="flex flex-col gap-2 col-span-full">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.description}</span>
                ${descriptions}
            </div>
        </div>
    `;
}


async function renderEscortInfoLounge($data, lang ) {
    const escorts = $data?.escortinfo || [];

    // تعریف ترجمه‌ها برای هر زبان
    const translations = {
        1: { // فارسی
            title: "اطلاعات اسکورت",
            escortName: "نام اسکورت",
            gender: "جنسیت",
            male: "مرد",
            female: "زن",
            dir: "rtl",
            textAlign: "text-right"
        },
        2: { // انگلیسی
            title: "Escort Information",
            escortName: "Escort Name",
            gender: "Gender",
            male: "Male",
            female: "Female",
            dir: "ltr",
            textAlign: "text-left"
        },
        3: { // عربی
            title: "معلومات المرافق",
            escortName: "اسم المرافق",
            gender: "الجنس",
            male: "ذكر",
            female: "أنثى",
            dir: "rtl",
            textAlign: "text-right"
        }
    };

    // انتخاب زبان بر اساس ورودی lang (پیش‌فرض: فارسی)
    const t = translations[lang] || translations[1];

    const escortNames = escorts.map(e => {
        const { firsname, lastname } = e.escort || {};
        return `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${firsname || ''} ${lastname || ''}</h2>`;
    }).join('');

    const escortGenders = escorts.map(e => {
        const gender = e.escort?.gender === "1" ? t.male : t.female;
        return `<h2 class="text-[#292929] text-sm font-danademibold ${t.textAlign}">${gender}</h2>`;
    }).join('');

    return `
        <h2 class="font-bold text-lg my-2 font-danabold ${t.textAlign}" dir="${t.dir}">${t.title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex justify-between gap-x-4 gap-y-2" dir="${t.dir}">
            <div class="flex flex-col gap-2 w-1/2 justify-center items-center">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.escortName}</span>
                ${escortNames}
            </div>
            <div class="flex flex-col gap-2 w-1/2 justify-center items-center">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap ${t.textAlign}">${t.gender}</span>
                ${escortGenders}
            </div>
        </div>
    `;
}

// ----------------------------- Lounge PDF --------------------------------