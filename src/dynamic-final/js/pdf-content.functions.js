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

// voucher pdf fa
async function RenderInfoCard_FA($data) {
    let hotelJson = $data;

    if (!hotelJson || !hotelJson.hotelinfo) {
        console.error("Invalid hotel data:", hotelJson);
        return '<div class="text-red-500">Invalid hotel data provided.</div>';
    }

    const hotel = hotelJson.hotelinfo;
    const hotelImageName = extractFilenameFromUrl(hotel.hotelimage);

    const checkin = hotelJson.checkin?.mstring ? formatDateToReadable(hotelJson.checkin.mstring) : "";
    const checkout = hotelJson.checkout?.mstring ? formatDateToReadable(hotelJson.checkout.mstring) : "";
    const nights = hotelJson.nights || 0;
    const roomsCount = hotelJson.rooms?.length || 0;
    let infocard = `
    <div class="w-3/5 ">
    <div class="flex leading-5 gap-x-3 ticketContainer">
        <figure class="w-[80px] h-[80px] rounded-[5px] overflow-hidden" >
            
            <img  class="hotelimage w-[80px] h-[80px] object-cover " width="80" height="80" src="${hotelImageName}"
                alt="${hotel.hotelname}" />
        </figure>
        <div class="flex flex-col gap-y-1">
            <h2 class="text-lg font-danademibold">
                ${hotel.hotelname}
            </h2>
            <div class="flex items-center">
                ${RenderRateHotel_FA(hotel.star)}
                <span class="text-sm ml-2 font-danaregular">${hotel.star} <span class="mr-1">ستاره</span> </span>
            </div>
            <div class="text-base font-danaregular dir-rtl">
                <span>
                ${hotel.country}
                </span>
                <span class="mx-1"> / </span>
                 <span>
                 ${hotel.city}
                 </span>
                 </div>
        </div>
    </div>
    
    <div class="mt-3">
                        
    </div>
    </div>
    <div class="w-2/5 border-r-2 border-[#E3E3E3] pr-3 ">
    <ul class="flex flex-col gap-y-2">
        <li>
            <h2 class="text-base font-danademibold">زمان ورورد</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] text-nowrap">

                <svg id="calendar-icon-pdf" class="scale-110 origin-center min-w-3" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>

                <span class="font-danaregular dir-ltr">
                ${checkin}
                (${hotelJson.checkin?.sstring})
                </span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">زمان خروج</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] text-nowrap">

                                <svg id="calendar-icon-pdf" class="scale-110 origin-center min-w-3" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>

                <span class="font-danaregular dir-ltr">
                ${checkout}
                (${hotelJson.checkout?.sstring})
                </span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">تعداد شب ها</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${nights}
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">تعداد اتاق ها</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${roomsCount}
            </div>
        </li>
    </ul>
    </div>`;

    return infocard;
}
async function renderRules_FA($data) {
    const rules = $data?.pdf_description;
    if (!rules || !Array.isArray(rules)) {
        console.warn("هیچ آیتمی در pdf_description پیدا نشد");
        return null;
    }

    let direction;
    direction = detectDirection(rules?.[0]?.note.text);

    let ulitem = '';
    rules.forEach((item, index) => {
        const text = item?.note?.text?.trim();

        if (text) {
            ulitem += `<li>${text}</li>`;
        } else {
            console.warn(`آیتم ${index} متن معتبری ندارد`, item);
        }
    });

    // return `<ul dir="${direction}" class="text-right">${ulitem}</ul>`;
    return `<ul dir="${direction}" class="text-right">${fixRTLTextCompletely(ulitem)}</ul>`;

}
function RenderRateHotel_FA(starCount) {
    let stars = '';
    for (let i = 0; i < starCount; i++) {
        stars += `
                    <svg id="star-icon-pdf" width="14" height="14" viewBox="0 0 14 14" fill="none" >
<path d="M10.2667 8.62758C10.2323 8.41991 10.3017 8.20816 10.4528 8.06175L12.6344 5.99675C12.8141 5.82816 12.88 5.5715 12.8036 5.33758C12.7225 5.10425 12.5178 4.93508 12.2728 4.90008L9.37359 4.4795C9.16418 4.44741 8.98276 4.315 8.88943 4.12425L7.59501 1.51675C7.49409 1.32075 7.30101 1.1895 7.08168 1.16675H6.83609L6.73693 1.20758L6.67334 1.23091C6.63834 1.25133 6.60684 1.27641 6.57943 1.30675L6.52693 1.34758C6.47968 1.39308 6.44059 1.44675 6.41026 1.50508L5.13276 4.12425C5.03359 4.32258 4.83993 4.45675 4.61943 4.4795L1.72026 4.90008C1.47934 4.938 1.27984 5.10658 1.20168 5.33758C1.12118 5.56916 1.18243 5.82583 1.35859 5.99675L3.46501 8.03841C3.61609 8.18716 3.68551 8.40008 3.65109 8.6095L3.13193 11.4795C3.07534 11.8266 3.30576 12.1556 3.65109 12.2209C3.79284 12.2437 3.93751 12.2209 4.06526 12.1567L6.64943 10.8028C6.69843 10.776 6.75209 10.7585 6.80693 10.7503H6.96501C7.06709 10.7532 7.16684 10.7789 7.25668 10.8267L9.84026 12.1742C10.0578 12.2909 10.3233 12.2734 10.5228 12.1276C10.7263 11.987 10.829 11.7408 10.7853 11.4976L10.2667 8.62758Z" fill="#FFBF1C"/>
</svg>`;
    }
    return stars;
}
async function renderRooms_FA($data) {
    let hotelinfo = $data?.hotelinfo;
    let roominfo = $data?.rooms;
    let roomcontent = '';

    roominfo.forEach((room) => {
        const parsedPassengers = room.passengers.map(p => {
            const typeRaw = p.type || '';
            const typeMatch = typeRaw.match(/^([^\(]+)(?:\s*\((.+)\))?/);
            const passengerType = typeMatch?.[1]?.trim() || '–';
            const passengerAge = typeMatch?.[2]?.trim() || (p.age || '–');

            return {
                name: `${p.fullname.firstname.trim()} ${p.fullname.lastname.trim()}`,
                type: passengerType,
                age: passengerAge,
                transfer: p.transfer_data || null
            };
        });

        const passengerNames = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold text-nowrap">${p.name}</h2>`
        ).join('');

        const passengerTypes = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold text-center">${p.type}</h2>`
        ).join('');

        const passengerAges = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold dir-ltr text-center text-nowrap">${p.age}</h2>`
        ).join('');

        roomcontent += `
        <h2 class="font-bold text-lg my-2 font-danabold">اتاق ${room.index}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4">
            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap">نوع اتاق</span>
                <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">${room.roomtype.trim()}</div>
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">خدمات</span>
                <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                    ${escapeXML(hotelinfo.services)}
                </div>
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">مسافران</span>
                ${passengerNames}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap text-center">نوع مسافر</span>
                ${passengerTypes}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular text-center">سن</span>
                ${passengerAges}
            </div>

            <div class="gap-y-2 flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">وضعیت</span>
                <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                    ${room.onrequest === "1" ? "On Request" : "Available"}
                </div>
            </div>
        </div>
        `;

        // باکس ترنسفر
        const transfers = parsedPassengers.filter(p => p.transfer);
        if (transfers.length > 0) {
            roomcontent += `
            <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
                <h3 class="font-danabold text-base text-[#292929] mb-1">ترنسفر اتاق ${room.index}</h3>
                ${transfers.map(p => `
                    <div class="flex justify-between flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
                        <div class="flex flex-col w-1/5">
                            <span class="text-[#6D6D6D] text-sm font-danaregular">نام مسافر</span>
                            <div class="text-[#292929] text-sm font-danademibold">${p.name}</div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[#6D6D6D] text-sm font-danaregular">فرودگاه ورود</span>
                            <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_arrival || '–'}</div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[#6D6D6D] text-sm font-danaregular">شماره پرواز ورود</span>
                            <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.arrival_flight_number || '–'}</div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[#6D6D6D] text-sm font-danaregular">فرودگاه خروج</span>
                            <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_departure || '–'}</div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[#6D6D6D] text-sm font-danaregular">شماره پرواز خروج</span>
                            <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.departure_flight_number || '–'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            `;
        }
    });

    return roomcontent;
}
function renderFlightInfo_FA(flightinfo) {
    if (!flightinfo) return '';

    const renderSegment = (title, flight) => `
        <h2 class="font-bold text-lg my-2 font-danabold">${title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">ایرلاین</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.airlines}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">شماره پرواز</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.flightno}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">تاریخ</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.date.sstring} (${flight.date.mstring})</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">ساعت حرکت</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.etime}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">ساعت رسیدن</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.atime}</div>
            </div>
        </div>
    `;

    return `
        ${renderSegment("پرواز رفت", flightinfo.enterflight)}
        ${renderSegment("پرواز برگشت", flightinfo.exitflight)}
    `;
}
function renderBrokerInfo_FA(broker) {
    if (!broker?.brokerinfo) return '';

    const b = broker.brokerinfo;
    const support = broker.support?.person?.[0]?.info || {};

    return `
        <h2 class="font-bold text-lg my-2 font-danabold">کارگزار </h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">نام کارگزار </span>
                <div class="text-[#292929] text-sm font-danademibold">${b.broker_name}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">کشور</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.country || []).map(c => c.countryname).join(', ')}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">نام مدیر</span>
                <div class="text-[#292929] text-sm font-danademibold">${b.manager_name || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">تلفن</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.phone || []).map(p => p.number).join(', ')}</div>
            </div>
            ${b.email ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">ایمیل</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.email}</div>
            </div>
            ` : ''}
            ${b.website ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">وب‌سایت</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.website}</div>
            </div>
            ` : ''}
        </div>

        ${support.name || support.tel ? `
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
            <h3 class="font-danabold text-base text-[#292929] mb-1">پشتیبان</h3>
            <div class="flex flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">نام</span>
                    <div class="text-[#292929] text-sm font-danademibold">${support.name || '–'}</div>
                </div>
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">تلفن</span>
                    <div class="text-[#292929] text-sm font-danademibold dir-ltr">${support.tel || '–'}</div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}
// voucher pdf fa

// voucher pdf EN
async function RenderInfoCard_EN($data) {
    let hotelJson = $data;

    if (!hotelJson || !hotelJson.hotelinfo) {
        console.error("Invalid hotel data:", hotelJson);
        return '<div class="text-red-500">Invalid hotel data provided.</div>';
    }

    const hotel = hotelJson.hotelinfo;
    const hotelImageName = extractFilenameFromUrl(hotel.hotelimage);

    const checkin = hotelJson.checkin?.mstring ? formatDateToReadable(hotelJson.checkin.mstring) : "";
    const checkout = hotelJson.checkout?.mstring ? formatDateToReadable(hotelJson.checkout.mstring) : "";
    const nights = hotelJson.nights || 0;
    const roomsCount = hotelJson.rooms?.length || 0;

    let infocard = `
    <div class="w-3/5 ">
    <div class="flex leading-5 gap-x-3 ticketContainer">
        <figure class="w-[80px] h-[80px] rounded-[5px] overflow-hidden" >
            
            <img  class="hotelimage w-[80px] h-[80px] object-cover " width="80" height="80" src="${hotelImageName}"
                alt="${hotel.hotelname}" />
        </figure>
        <div class="flex flex-col gap-y-1">
            <h2 class="text-lg font-danademibold">
                ${hotel.hotelname}
            </h2>
            <div class="flex items-center">
                ${RenderRateHotel_EN(hotel.star)}
                <span class="text-sm ml-2 font-danaregular">${hotel.star} <span class="ml-1">star</span> </span>
            </div>
            <div class="text-base font-danaregular">
                <span>
                ${hotel.ecountry}
                </span>
                <span class="mx-1"> / </span>
                 <span>
                 ${hotel.ecity}
                 </span>
                 </div>
        </div>
    </div>

    <div class="mt-3">

    </div>
</div>
<div class="w-2/5 border-l-2 border-[#E3E3E3] pl-3 ">
    <ul class="flex flex-col gap-y-2">
        <li>
            <h2 class="text-base font-danademibold">Check in</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424]">

                <svg id="calendar-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
                </svg>
                <span class="font-danaregular">${checkin}</span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">Check out</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424]">

                                <svg id="calendar-icon-pdf" class="scale-110 origin-center" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
                </svg>
                <span class="font-danaregular">${checkout}</span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">Night</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${nights}
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">Room</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${roomsCount}
            </div>
        </li>
    </ul>
</div>`;

    return infocard;
}
async function renderRules_EN($data) {
    const rules = $data?.pdf_description;
    if (!rules || !Array.isArray(rules)) {
        console.warn("هیچ آیتمی در pdf_description پیدا نشد");
        return null;
    }

    let direction;
    direction = detectDirection(rules?.[0]?.note.text);

    let ulitem = '';
    rules.forEach((item, index) => {
        const text = item?.note?.text?.trim();

        if (text) {
            ulitem += `<li>${text}</li>`;
        } else {
            console.warn(`آیتم ${index} متن معتبری ندارد`, item);
        }
    });

    return `<ul dir="${direction}">${ulitem}</ul>`;
}
function RenderRateHotel_EN(starCount) {
    let stars = '';
    for (let i = 0; i < starCount; i++) {
        stars += `
                    <svg id="star-icon-pdf" width="14" height="14" viewBox="0 0 14 14" fill="none" >
<path d="M10.2667 8.62758C10.2323 8.41991 10.3017 8.20816 10.4528 8.06175L12.6344 5.99675C12.8141 5.82816 12.88 5.5715 12.8036 5.33758C12.7225 5.10425 12.5178 4.93508 12.2728 4.90008L9.37359 4.4795C9.16418 4.44741 8.98276 4.315 8.88943 4.12425L7.59501 1.51675C7.49409 1.32075 7.30101 1.1895 7.08168 1.16675H6.83609L6.73693 1.20758L6.67334 1.23091C6.63834 1.25133 6.60684 1.27641 6.57943 1.30675L6.52693 1.34758C6.47968 1.39308 6.44059 1.44675 6.41026 1.50508L5.13276 4.12425C5.03359 4.32258 4.83993 4.45675 4.61943 4.4795L1.72026 4.90008C1.47934 4.938 1.27984 5.10658 1.20168 5.33758C1.12118 5.56916 1.18243 5.82583 1.35859 5.99675L3.46501 8.03841C3.61609 8.18716 3.68551 8.40008 3.65109 8.6095L3.13193 11.4795C3.07534 11.8266 3.30576 12.1556 3.65109 12.2209C3.79284 12.2437 3.93751 12.2209 4.06526 12.1567L6.64943 10.8028C6.69843 10.776 6.75209 10.7585 6.80693 10.7503H6.96501C7.06709 10.7532 7.16684 10.7789 7.25668 10.8267L9.84026 12.1742C10.0578 12.2909 10.3233 12.2734 10.5228 12.1276C10.7263 11.987 10.829 11.7408 10.7853 11.4976L10.2667 8.62758Z" fill="#FFBF1C"/>
            </svg>`;
    }
    return stars;
}
async function renderRooms_EN($data) {
    let hotelinfo = $data?.hotelinfo;
    let roominfo = $data?.rooms;
    let roomcontent = '';

    roominfo.forEach((room) => {
        const parsedPassengers = room.passengers.map(p => {
            const typeRaw = p.type || '';
            const typeMatch = typeRaw.match(/^([^\(]+)(?:\s*\((.+)\))?/);
            const passengerType = typeMatch?.[1]?.trim() || '–';
            const passengerAge = typeMatch?.[2]?.trim() || (p.age || '–');

            return {
                name: `${p.fullname.firstname.trim()} ${p.fullname.lastname.trim()}`,
                type: passengerType,
                age: passengerAge,
                transfer: p.transfer_data || null
            };
        });

        const passengerNames = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold">${p.name}</h2>`
        ).join('');

        const passengerTypes = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold">${p.type}</h2>`
        ).join('');

        const passengerAges = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold">${p.age}</h2>`
        ).join('');

        const childrenCount = (room.numpassenger.childwithbed || 0) + (room.numpassenger.childwithoutbed || 0);

        roomcontent += `
            <h2 class="font-bold text-lg my-2 font-danabold">Room ${room.index}</h2>
            <div class="bg-[#F4FBF9] rounded-xl p-4 flex flex-wrap justify-between gap-4">
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Room type</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">${room.roomtype.trim()}</div>
                </div>

                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Board</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                        ${escapeXML(hotelinfo.services)}
                    </div>
                </div>

                <!-- Passenger Names -->
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Passenger</span>
                    ${passengerNames}
                </div>

                <!-- Passenger Types (Gender) -->
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Gender</span>
                    ${passengerTypes}
                </div>

                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Age</span>
                    ${passengerAges}
                </div>

                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Status</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                        ${room.onrequest === "1" ? "On Request" : "Available"}
                    </div>
                </div>
            </div>
        `;

        // باکس ترنسفر
        const transfers = parsedPassengers.filter(p => p.transfer);
        if (transfers.length > 0) {
            roomcontent += `
            <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
    <h3 class="font-danabold text-base text-[#292929] mb-1">Room ${room.index} Transfer</h3>
    ${transfers.map(p => `
        <div class="flex justify-between flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
            <div class="flex flex-col w-1/5">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Passenger Name</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.name}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Arrival Airport</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_arrival || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Arrival Flight No.</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.arrival_flight_number || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Departure Airport</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_departure || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Departure Flight No.</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.departure_flight_number || '–'}</div>
            </div>
        </div>
    `).join('')}
</div>
            `;
        }
    });

    return roomcontent;
}
function renderFlightInfo_EN(flightinfo) {
    if (!flightinfo) return '';

    const renderSegment = (title, flight) => `
        <h2 class="font-bold text-lg my-2 font-danabold">${title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4 flex-wrap">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Airline</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.airlines}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Flight Number</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.flightno}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Date</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.date.sstring} (${flight.date.mstring})</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Departure Time</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.etime}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Arrival Time</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.atime}</div>
            </div>
        </div>
    `;

    return `
        ${renderSegment("Departure Flight", flightinfo.enterflight)}
        ${renderSegment("Return Flight", flightinfo.exitflight)}
    `;
}
function renderBrokerInfo_EN(broker) {
    if (!broker?.brokerinfo) return '';

    const b = broker.brokerinfo;
    const support = broker.support?.person?.[0]?.info || {};

    return `
        <h2 class="font-bold text-lg my-2 font-danabold">Broker</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4 flex-wrap">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Broker Name</span>
                <div class="text-[#292929] text-sm font-danademibold">${b.broker_name}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Country</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.country || []).map(c => c.countryname).join(', ')}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Manager Name</span>
                <div class="text-[#292929] text-sm font-danademibold">${b.manager_name || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Phone</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.phone || []).map(p => p.number).join(', ')}</div>
            </div>
            ${b.email ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Email</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.email}</div>
            </div>` : ''}
            ${b.website ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">Website</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.website}</div>
            </div>` : ''}
        </div>

        ${support.name || support.tel ? `
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
            <h3 class="font-danabold text-base text-[#292929] mb-1">Support</h3>
            <div class="flex flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Name</span>
                    <div class="text-[#292929] text-sm font-danademibold">${support.name || '–'}</div>
                </div>
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">Phone</span>
                    <div class="text-[#292929] text-sm font-danademibold dir-ltr">${support.tel || '–'}</div>
                </div>
            </div>
        </div>` : ''}
    `;
}
// voucher pdf EN

// voucher pdf AR
async function RenderInfoCard_AR($data) {
    let hotelJson = $data;

    if (!hotelJson || !hotelJson.hotelinfo) {
        console.error("Invalid hotel data:", hotelJson);
        return '<div class="text-red-500">Invalid hotel data provided.</div>';
    }

    const hotel = hotelJson.hotelinfo;
    const hotelImageName = extractFilenameFromUrl(hotel.hotelimage);

    const checkin = hotelJson.checkin?.mstring ? formatDateToReadable(hotelJson.checkin.mstring) : "";
    const checkout = hotelJson.checkout?.mstring ? formatDateToReadable(hotelJson.checkout.mstring) : "";
    const nights = hotelJson.nights || 0;
    const roomsCount = hotelJson.rooms?.length || 0;
    let infocard = `
    <div class="w-3/5 ">
    <div class="flex leading-5 gap-x-3 ticketContainer">
        <figure class="w-[80px] h-[80px] rounded-[5px] overflow-hidden" >
            
            <img  class="hotelimage w-[80px] h-[80px] object-cover " width="80" height="80" src="${hotelImageName}"
                alt="${hotel.hotelname}" />
        </figure>
        <div class="flex flex-col gap-y-1">
            <h2 class="text-lg font-danademibold">
                ${hotel.hotelname}
            </h2>
            <div class="flex items-center">
                ${RenderRateHotel_AR(hotel.star)}
                <span class="text-sm ml-2 font-danaregular">${hotel.star} <span class="mr-1">النجم</span> </span>
            </div>
            <div class="text-base font-danaregular dir-rtl">
                <span>
                ${hotel.country}
                </span>
                <span class="mx-1"> / </span>
                 <span>
                 ${hotel.city}
                 </span>
                 </div>
        </div>
    </div>
    
    <div class="mt-3">
    </div>
    </div>
    <div class="w-2/5 border-r-2 border-[#E3E3E3] pr-3 ">
    <ul class="flex flex-col gap-y-2">
        <li>
            <h2 class="text-base font-danademibold">وقت الوصول</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] text-nowrap">

                <svg id="calendar-icon-pdf" class="scale-110 origin-center min-w-3" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>

                <span class="font-danaregular dir-ltr">
                ${checkin}
                </span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">وقت المغادرة</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] text-nowrap">

                                <svg id="calendar-icon-pdf" class="scale-110 origin-center min-w-3" xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 12 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.17319 6.2289C7.96769 6.2289 7.80119 6.0624 7.80119 5.8569C7.80119 5.6519 7.96769 5.4854 8.17319 5.4854C8.37869 5.4854 8.54519 5.6519 8.54519 5.8569C8.54519 6.0624 8.37869 6.2289 8.17319 6.2289ZM8.17319 8.1029C7.96769 8.1029 7.80119 7.9364 7.80119 7.7309C7.80119 7.5254 7.96769 7.3589 8.17319 7.3589C8.37869 7.3589 8.54519 7.5254 8.54519 7.7309C8.54519 7.9364 8.37869 8.1029 8.17319 8.1029ZM5.99969 6.2289C5.79469 6.2289 5.62819 6.0624 5.62819 5.8569C5.62819 5.6519 5.79469 5.4854 5.99969 5.4854C6.20519 5.4854 6.37169 5.6519 6.37169 5.8569C6.37169 6.0624 6.20519 6.2289 5.99969 6.2289ZM5.99969 8.1029C5.79469 8.1029 5.62819 7.9364 5.62819 7.7309C5.62819 7.5254 5.79469 7.3589 5.99969 7.3589C6.20519 7.3589 6.37169 7.5254 6.37169 7.7309C6.37169 7.9364 6.20519 8.1029 5.99969 8.1029ZM3.8267 6.2289C3.6212 6.2289 3.4547 6.0624 3.4547 5.8569C3.4547 5.6519 3.6212 5.4854 3.8267 5.4854C4.0322 5.4854 4.1987 5.6519 4.1987 5.8569C4.1987 6.0624 4.0322 6.2289 3.8267 6.2289ZM3.8267 8.1029C3.6212 8.1029 3.4547 7.9364 3.4547 7.7309C3.4547 7.5254 3.6212 7.3589 3.8267 7.3589C4.0322 7.3589 4.1987 7.5254 4.1987 7.7309C4.1987 7.9364 4.0322 8.1029 3.8267 8.1029ZM10.0947 2.6649C9.69269 2.2619 9.11969 2.0349 8.43769 1.9779V1.4414C8.43769 1.2114 8.25069 1.0249 8.02069 1.0249C7.79069 1.0249 7.60419 1.2114 7.60419 1.4414V3.4139C7.56769 3.4239 7.53219 3.4364 7.49269 3.4364C7.26219 3.4364 7.07569 3.2494 7.07569 3.0194V2.0534C7.07569 1.99818 7.03094 1.9534 6.97569 1.9534H4.3957V1.4414C4.3957 1.2114 4.2092 1.0249 3.9792 1.0249C3.7487 1.0249 3.5622 1.2114 3.5622 1.4414V3.4139C3.5262 3.4239 3.4902 3.4364 3.4507 3.4364C3.2207 3.4364 3.0337 3.2494 3.0337 3.0194V2.19141C3.0337 2.12638 2.97244 2.07862 2.91008 2.0971C1.84121 2.41381 1.2207 3.27685 1.2207 4.5534V8.3329C1.2207 9.9879 2.2167 10.9754 3.8847 10.9754H8.11519C9.78319 10.9754 10.7792 10.0019 10.7792 8.3709V4.5544C10.7812 3.7694 10.5447 3.1164 10.0947 2.6649Z" fill="#242424"/>
</svg>

                <span class="font-danaregular dir-ltr">
                ${checkout}
                </span>
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">عدد الليالي</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${nights}
            </div>
        </li>
        <li>
            <h2 class="text-base font-danademibold">عدد الغرف</h2>
            <div class="flex items-center w-full gap-x-2 text-sm text-[#242424] font-danaregular">
                ${roomsCount}
            </div>
        </li>
    </ul>
    </div>`;

    return infocard;
}
async function renderRules_AR($data) {
    const rules = $data?.pdf_description;
    if (!rules || !Array.isArray(rules)) {
        console.warn("هیچ آیتمی در pdf_description پیدا نشد");
        return null;
    }

    let direction;
    direction = detectDirection(rules?.[0]?.note.text);

    let ulitem = '';
    rules.forEach((item, index) => {
        const text = item?.note?.text?.trim();

        if (text) {
            ulitem += `<li>${text}</li>`;
        } else {
            console.warn(`آیتم ${index} متن معتبری ندارد`, item);
        }
    });

    // return `<ul dir="${direction}" class="text-right">${ulitem}</ul>`;
    return `<ul dir="${direction}" class="text-right">${fixRTLTextCompletely(ulitem)}</ul>`;

}
function RenderRateHotel_AR(starCount) {
    let stars = '';
    for (let i = 0; i < starCount; i++) {
        stars += `
                    <svg id="star-icon-pdf" width="14" height="14" viewBox="0 0 14 14" fill="none" >
<path d="M10.2667 8.62758C10.2323 8.41991 10.3017 8.20816 10.4528 8.06175L12.6344 5.99675C12.8141 5.82816 12.88 5.5715 12.8036 5.33758C12.7225 5.10425 12.5178 4.93508 12.2728 4.90008L9.37359 4.4795C9.16418 4.44741 8.98276 4.315 8.88943 4.12425L7.59501 1.51675C7.49409 1.32075 7.30101 1.1895 7.08168 1.16675H6.83609L6.73693 1.20758L6.67334 1.23091C6.63834 1.25133 6.60684 1.27641 6.57943 1.30675L6.52693 1.34758C6.47968 1.39308 6.44059 1.44675 6.41026 1.50508L5.13276 4.12425C5.03359 4.32258 4.83993 4.45675 4.61943 4.4795L1.72026 4.90008C1.47934 4.938 1.27984 5.10658 1.20168 5.33758C1.12118 5.56916 1.18243 5.82583 1.35859 5.99675L3.46501 8.03841C3.61609 8.18716 3.68551 8.40008 3.65109 8.6095L3.13193 11.4795C3.07534 11.8266 3.30576 12.1556 3.65109 12.2209C3.79284 12.2437 3.93751 12.2209 4.06526 12.1567L6.64943 10.8028C6.69843 10.776 6.75209 10.7585 6.80693 10.7503H6.96501C7.06709 10.7532 7.16684 10.7789 7.25668 10.8267L9.84026 12.1742C10.0578 12.2909 10.3233 12.2734 10.5228 12.1276C10.7263 11.987 10.829 11.7408 10.7853 11.4976L10.2667 8.62758Z" fill="#FFBF1C"/>
</svg>`;
    }
    return stars;
}
async function renderRooms_AR($data) {
    let hotelinfo = $data?.hotelinfo;
    let roominfo = $data?.rooms;
    let roomcontent = '';

    roominfo.forEach((room) => {
        const parsedPassengers = room.passengers.map(p => {
            const typeRaw = p.type || '';
            const typeMatch = typeRaw.match(/^([^\(]+)(?:\s*\((.+)\))?/);
            const passengerType = typeMatch?.[1]?.trim() || '–';
            const passengerAge = typeMatch?.[2]?.trim() || (p.age || '–');

            return {
                name: `${p.fullname.firstname.trim()} ${p.fullname.lastname.trim()}`,
                type: passengerType,
                age: passengerAge,
                transfer: p.transfer_data || null
            };
        });

        const passengerNames = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold text-nowrap">${p.name}</h2>`
        ).join('');

        const passengerTypes = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold text-center">${p.type}</h2>`
        ).join('');

        const passengerAges = parsedPassengers.map(p =>
            `<h2 class="text-[#292929] text-sm font-danademibold dir-ltr text-center text-nowrap">${p.age}</h2>`
        ).join('');

        const childrenCount = (room.numpassenger.childwithbed || 0) + (room.numpassenger.childwithoutbed || 0);

        roomcontent += `
            <h2 class="font-bold text-lg my-2 font-danabold">الغرفة ${room.index}</h2>
            <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4">
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular  text-nowrap">نوع الغرفة</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">${room.roomtype.trim()}</div>
                </div>
    
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">خدمات</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                        ${escapeXML(hotelinfo.services)}
                    </div>
                </div>
    
                <!-- Passenger Names -->
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">الركاب</span>
                    ${passengerNames}
                </div>
    
                <!-- Passenger Types (Gender) -->
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular text-nowrap text-center">نوع مسافر</span>
                    ${passengerTypes}
                </div>
    
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular text-center">عمر</span>
                    ${passengerAges}
                </div>
    
                <div class="gap-y-2 flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">حالة</span>
                    <div class="text-[#292929] text-sm font-danademibold self-center flex justify-center items-center h-[calc(100%-20px)]">
                        ${room.onrequest === "1" ? "On Request" : "Available"}
                    </div>
                </div>
            </div>
        `;

        // باکس ترنسفر
        const transfers = parsedPassengers.filter(p => p.transfer);
        if (transfers.length > 0) {
            roomcontent += `
            <div dir="rtl" class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
    <h3 class="font-danabold text-base text-[#292929] mb-1">نقل الغرفة ${room.index}</h3>
    ${transfers.map(p => `
        <div class="flex justify-between flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
            <div class="flex flex-col w-1/5">
                <span class="text-[#6D6D6D] text-sm font-danaregular">اسم الراكب</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.name}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">مطار الوصول</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_arrival || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">رقم رحلة الوصول</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.arrival_flight_number || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">مطار المغادرة</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.airport_departure || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">رقم رحلة المغادرة</span>
                <div class="text-[#292929] text-sm font-danademibold">${p.transfer?.departure_flight_number || '–'}</div>
            </div>
        </div>
    `).join('')}
</div>
            `;
        }
    });

    return roomcontent;
}
function renderFlightInfo_AR(flightinfo) {
    if (!flightinfo) return '';

    const renderSegment = (title, flight) => `
        <h2 class="font-bold text-lg my-2 font-danabold">${title}</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4 flex-wrap" dir="rtl">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">شركة الطيران</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.airlines}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">رقم الرحلة</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.flightno}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">التاريخ</span>
                <div class="text-[#292929] text-sm font-danademibold">${flight.date.sstring} (${flight.date.mstring})</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">وقت المغادرة</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.etime}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">وقت الوصول</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${flight.atime}</div>
            </div>
        </div>
    `;

    return `
        ${renderSegment("رحلة الذهاب", flightinfo.enterflight)}
        ${renderSegment("رحلة الإياب", flightinfo.exitflight)}
    `;
}
function renderBrokerInfo_AR(broker) {
    if (!broker?.brokerinfo) return '';

    const b = broker.brokerinfo;
    const support = broker.support?.person?.[0]?.info || {};

    return `
        <h2 class="font-bold text-lg my-2 font-danabold">الوسيط</h2>
        <div class="bg-[#F4FBF9] rounded-xl p-4 flex justify-between gap-4 flex-wrap" dir="rtl">
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">اسم الوسيط</span>
                <div class="text-[#292929] text-sm font-danademibold">${b.broker_name}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">الدولة</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.country || []).map(c => c.countryname).join(', ')}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">اسم المدير</span>
                <div class="text-[#292929] text-sm font-danademibold">${b.manager_name || '–'}</div>
            </div>
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">الهاتف</span>
                <div class="text-[#292929] text-sm font-danademibold">${(b.phone || []).map(p => p.number).join(', ')}</div>
            </div>
            ${b.email ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">البريد الإلكتروني</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.email}</div>
            </div>` : ''}
            ${b.website ? `
            <div class="flex flex-col">
                <span class="text-[#6D6D6D] text-sm font-danaregular">الموقع الإلكتروني</span>
                <div class="text-[#292929] text-sm font-danademibold dir-ltr">${b.website}</div>
            </div>` : ''}
        </div>

        ${support.name || support.tel ? `
        <div class="bg-[#F4FBF9] rounded-xl p-4 mt-3 flex flex-col gap-2">
            <h3 class="font-danabold text-base text-[#292929] mb-1">الدعم</h3>
            <div class="flex flex-wrap gap-4 border border-dashed border-[#DADADA] p-3 rounded-lg">
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">الاسم</span>
                    <div class="text-[#292929] text-sm font-danademibold">${support.name || '–'}</div>
                </div>
                <div class="flex flex-col">
                    <span class="text-[#6D6D6D] text-sm font-danaregular">الهاتف</span>
                    <div class="text-[#292929] text-sm font-danademibold dir-ltr">${support.tel || '–'}</div>
                </div>
            </div>
        </div>` : ''}
    `;
}
// voucher pdf AR

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