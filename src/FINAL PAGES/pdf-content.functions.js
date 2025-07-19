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

// تابع بهبود یافته برای دریافت متن چندزبانه
async function getLocalizedText(dir, faText, enText, arText = faText, lid = 1) {
    // اگر lid مشخص شده، از آن استفاده کن
    switch(parseInt(lid)) {
        case 1: // فارسی
            return faText;
        case 2: // انگلیسی
            return enText;
        case 3: // عربی
            return arText;
        default:
            // اگر lid نامعتبر بود، از direction استفاده کن
            if (dir === 'rtl') {
                return faText;
            } else {
                return enText;
            }
    }
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

// تابع کمکی برای تشخیص تکمیل رندر محتوا
function notifyContentRendered() {
    // اطلاع‌رسانی به سیستم لودینگ که محتوا آماده است
    if (typeof window.onBasisApiComplete === 'function') {
        setTimeout(() => {
            window.onBasisApiComplete();
        }, 100);
    }
}

// General functions