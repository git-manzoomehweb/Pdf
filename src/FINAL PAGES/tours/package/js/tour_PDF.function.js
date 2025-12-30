const safeTxt = (s) =>
  String(s ?? "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");

const pick = (obj, path, def = undefined) => {
  if (!obj) return def;
  try {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      const k = parts[i];
      if (Array.isArray(cur)) cur = cur[0];
      cur = cur?.[k];
      if (cur === undefined || cur === null) return def;
    }
    return cur;
  } catch {
    return def;
  }
};

const isBlank = (v) => v == null || (typeof v === "string" && v.trim() === "");

function logRowDebug(rowIdx, hotels, prices, resolved) {}

function extractIdFromAnchoredHotelname(raw) {
  if (!raw || typeof raw !== "string") return "";
  const m = raw.match(/href=['"]\\\?id=(\d+)['"]/i);
  return m ? m[1] : "";
}

function getServiceText(h) {
  const svc = h?.service;
  if (typeof svc === "string") return svc;
  if (svc && typeof svc === "object") return svc.service ?? "";
  const alt = pick(h, "service.service", "");
  return alt || "";
}

function buildHotelLink(h) {
  const realName = pick(h, "hotelname1.realname") || h.hotelname || "";
  let id = pick(h, "hotelname1.hotelid") || h.hotelid || h.hotelcode || "";
  if (!id) id = extractIdFromAnchoredHotelname(h.hotelname);

  if (id) {
    return `<a class="showhotel" href="\\hotel.bc?id=${encodeURIComponent(
      id
    )}">${safeTxt(realName)}</a>`;
  }
  return `${safeTxt(realName)}`;
}

function starBlock(cnt) {
  const s = String(cnt ?? "").trim();
  if (!s || s === "0" || s === "-") return "";
  return `
<span class="flex items-center justify-center">
  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.9333 14.79C17.8742 14.434 17.9932 14.071 18.2523 13.82L21.9923 10.28C22.3003 9.991 22.4132 9.551 22.2822 9.15C22.1432 8.75 21.7922 8.46 21.3722 8.4L16.4023 7.679C16.0433 7.624 15.7322 7.397 15.5722 7.07L13.3532 2.6C13.1802 2.264 12.8492 2.039 12.4732 2H12.0522L11.8822 2.07L11.7732 2.11C11.7132 2.145 11.6592 2.188 11.6122 2.24L11.5223 2.31C11.4412 2.388 11.3742 2.48 11.3222 2.58L9.13225 7.07C8.96225 7.41 8.63025 7.64 8.25225 7.679L3.28225 8.4C2.86925 8.465 2.52725 8.754 2.39325 9.15C2.25525 9.547 2.36025 9.987 2.66225 10.28L6.27325 13.78C6.53225 14.035 6.65125 14.4 6.59225 14.759L5.70225 19.679C5.60525 20.274 6.00025 20.838 6.59225 20.95C6.83525 20.989 7.08325 20.95 7.30225 20.84L11.7323 18.519C11.8162 18.473 11.9082 18.443 12.0022 18.429H12.2732C12.4482 18.434 12.6192 18.478 12.7732 18.56L17.2022 20.87C17.5752 21.07 18.0303 21.04 18.3722 20.79C18.7213 20.549 18.8973 20.127 18.8223 19.71L17.9333 14.79Z" fill="#EAB308"></path>
  </svg> ${safeTxt(s)}
</span>`;
}

const fmtNum = (n) => {
  if (n == null || n === "" || isNaN(n)) return "";
  return Number(n).toLocaleString("fa-IR");
};

function priceTD(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return `<td><p><span class="price1">—</span></p></td>`;
  }

  const spans = values
    .filter((v) => !isBlank(v.v))
    .map(
      (v) => `<span class="price1">${fmtNum(v.v)} ${safeTxt(v.u || "")}</span>`
    )
    .join(' <span class="plus"> + </span> ');

  const finalContent = spans || `<span class="price1">—</span>`;
  return `<td><p>${finalContent}</p></td>`;
}

/* ====================== Prices ====================== */
function extractPrices(priceinfo) {
  const extractMulti = (key, fields) => {
    const arr = priceinfo[key];
    if (!arr) return [];
    const res = [];
    for (const item of arr) {
      const obj = item[key] || item;
      const val = obj?.[fields[0]] ?? "";
      const unit = obj?.[fields[1]] ?? "";
      if (!isBlank(val) || !isBlank(unit)) res.push({ v: val, u: unit });
    }
    return res;
  };

  return {
    double: extractMulti("doublecost", ["doublecostf", "doubleunit"]),
    single: extractMulti("singlecost", ["singlecostf", "singleunit"]),
    triple: extractMulti("triplecost", ["triplecostf", "tripleunit"]),
    chdwb: extractMulti("childwithbed", ["childwithbedf", "childwithbedunit"]),
    chdnb: extractMulti("childwithoutbed", [
      "childwithoutbedf",
      "childwithoutbedunit",
    ]),
  };
}

function hotelInlineRow(h) {
  const nameHTML = buildHotelLink(h);
  const star = h?.star;
  const serviceText = getServiceText(h);
  return `
<table class="inline_tbl">
  <tbody>
    <tr class="hotel-info1">
      <td class="hotel_name1">${nameHTML}</td>
      <td class="hotel_name2">${starBlock(star)}</td>
      <td class="hotel_name3">${serviceText ? safeTxt(serviceText) : ""}</td>
    </tr>
  </tbody>
</table>`;
}

/* ====================== Renderer ====================== */
function renderInventoryTable({ rows, mount = ".table-container2" }) {
  const host =
    typeof mount === "string" ? document.querySelector(mount) : mount;
  if (!host) return;

  const theadHTML = `
<thead>
<tr class="name-table">
<th class="hotel-1">
<table class="part3"><tbody><tr>
<td class="part31">نام هتل</td>
<td class="part32">درجه</td>
<td class="part33">خدمات</td>
</tr></tbody></table>
</th>
<th class="hotel-2">
    
   <div>
    <span>
     نرخ اتاق
      
    </span>
    <span>
   
      2 تخته
    </span>
    </div>
    
    </th>
<th class="hotel-3">
      <div><span>
     نرخ اتاق
      
    </span>
    <span>
   
      1 تخته
    </span></div>
    </th>
<th class="hotel-4">
    <div>
        <span>
     نرخ اتاق
      
    </span>
    <span>
   
      3 تخته
    </span></div>
    </th>
<th class="hotel-6">
   
   
 <div><span>
نرخ کودک      
    </span>
    <span>
   
   6 تا 12 سال
    </span></div>
    
    </th>
<th class="hotel-7"> 
    <div>
        <span>
نرخ کودک      
    </span>
    <span>
   2 تا 6 سال
    </span>
    </div>
    </th>
<th class="hotel-5">توضیحات</th>
</tr>
</thead>`;

  const tbodyHTML = `
<tbody class="tb-main">
${rows
  .map((row, idx) => {
    const hotels = (((row.hotelinfo || [])[0] || {}).hotels || []).map(
      (h) => h.hotel || h || {}
    );
    const prices = row.priceinfo || {};
    const p = extractPrices(prices);

    const hotelsHTML = hotels.length
      ? hotels.map(hotelInlineRow).join("")
      : hotelInlineRow({ hotelname1: { realname: "—" } });

    const desc =
      pick(hotels[0], "description") ||
      pick(row, "description.0.descriptionf") ||
      "—";

    return `
<tr>
<td>${hotelsHTML}</td>
${priceTD(p.double)}
${priceTD(p.single)}
${priceTD(p.triple)}
${priceTD(p.chdwb)}
${priceTD(p.chdnb)}
<td class="hotel-description-col">${safeTxt(desc)}</td>
</tr>`;
  })
  .join("")}
</tbody>`;

  const colgroupHTML = `
<colgroup>
  <col class="col-hotel">
  <col class="col-dbl">
  <col class="col-sng">
  <col class="col-trp">
  <col class="col-chdwb">
  <col class="col-chdnb">
  <col class="col-desc">
</colgroup>`;

  host.innerHTML = `<table class="hotel-info">${colgroupHTML}${theadHTML}${tbodyHTML}</table>`;
}

/* ====================== Normalize & Callback ====================== */
function normalizeInventory(raw) {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = [];
    }
  }
  if (data && !Array.isArray(data) && Array.isArray(data.root))
    data = data.root;
  if (!Array.isArray(data)) data = data ? [data] : [];
  return data;
}

const setSInventory = async (args) => {
  let raw = args?.source?.rows ?? args?.source ?? [];
  const rows = normalizeInventory(raw);
  renderInventoryTable({ rows, mount: ".table-container2" });
};
