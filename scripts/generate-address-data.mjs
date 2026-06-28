/**
 * Generator: builds js/israel-address-data.js with a richer mock database.
 * Run: node scripts/generate-address-data.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const NUMBERS = {
  mega: [1, 3, 7, 12, 18, 24, 32, 45, 58, 72, 88, 104],
  large: [2, 8, 15, 23, 31, 44, 56, 68],
  medium: [4, 11, 19, 27, 38, 52],
  small: [5, 14, 26, 41],
};

const COMMON_HE = [
  "Herzl Street", "Weizmann Street", "HaAtzmaut Street", "Ben Gurion Boulevard",
  "Jabotinsky Street", "Rabbi Akiva Street", "HaShalom Street", "HaHagana Street",
  "HaHistadrut Street", "Golda Meir Street", "Menachem Begin Boulevard", "HaNegev Street",
];

const ARAB_STREETS = [
  "Al-Quds Street", "Al-Nasr Street", "Al-Salam Street", "Al-Wahda Street",
  "Al-Mahatta Street", "Al-Rashid Street", "Al-Amal Street", "Al-Shuhada Street",
];

const MEGA_STREETS = {
  Jerusalem: [
    ["Jaffa Road", "דרך יפו"], ["King George Street", "רחוב קינג ג'ורג'"], ["Ben Yehuda Street", "רחוב בן יehuda"],
    ["Herzl Boulevard", "שדרות Herzl"], ["Keren Hayesod Street", "רחוב קeren Hayesod"], ["Strauss Street", "רחוב שtrauss"],
    ["Agripas Street", "רחוב אgrípas"], ["Emek Refaim Street", "רחוב עמק רפaim"], ["Derech Hebron", "דרך חברון"],
    ["Shmuel Hanavi Street", "רחוב שmuel Hanavi"], ["Bar Ilan Street", "רחוב בר אilan"], ["Yehezkel Street", "רחוב יechezkel"],
    ["Shir HaShirim Street", "רחוב שir HaShirim"], ["Pierre Koenig Street", "רחוב פierre Koenig"], ["Kanfei Nesharim Street", "רחוב כנפי נשרים"],
    ["Harav Herzog Street", "רחוב הרב הרzog"], ["Golomb Street", "רחוב גolomb"], ["Shazar Boulevard", "שדרות שazar"],
    ["Begin Boulevard", "שדרות בegin"], ["Sderot Herzl", "שדרות Herzl"], ["Malha Technology Park", "פארק טכנולוגי מalha"],
    ["Hebron Road", "דרך חברון"], ["Chords Bridge Road", "גשר המיתרים"], ["Sderot Ben Zvi", "שדרות בen Zvi"],
    ["Rabbi Akiva Street", "רחוב רabbi Akiva"], ["HaNeviim Street", "רחוב הנeviim"], ["Shlomo HaMelech Street", "רחוב שלמה המelech"],
  ],
  "Tel Aviv-Yafo": [
    ["Rothschild Boulevard", "שדרות רothschild"], ["Dizengoff Street", "רחוב dizengoff"], ["Allenby Street", "רחוב allenby"],
    ["Ibn Gabirol Street", "רחוב ibn Gabirol"], ["Ben Yehuda Street", "רחוב בen Yehuda"], ["Herzl Street", "רחוב herzl"],
    ["Namir Road", "דרך namir"], ["Menachem Begin Boulevard", "שדרות menachem Begin"], ["HaYarkon Street", "רחוב hayarkon"],
    ["Frishman Street", "רחוב frishman"], ["Bugrashov Street", "רחוב bugrashov"], ["Basel Street", "רחוב basel"],
    ["Gordon Street", "רחוב gordon"], ["King George Street", "רחוב king George"], ["Levinsky Street", "רחוב levinsky"],
    ["Salame Road", "דרך salame"], ["Nahalat Binyamin Street", "רחוב nahalat Binyamin"], ["Montefiore Street", "רחוב montefiore"],
    ["Florentin Street", "רחוב florentin"], ["HaMasger Street", "רחוב hamasger"], ["HaRav Kook Street", "רחוב harav Kook"],
    ["Arlozorov Street", "רחוב arlozorov"], ["Weizmann Street", "רחוב weizmann"], ["Jabotinsky Street", "רחוב jabotinsky"],
    ["HaBaron Hirsch Street", "רחוב habaron Hirsch"], ["HaCarmel Market", "שוק הcarmel"], ["HaYarkon Park", "פark Hayarkon"],
    ["Sderot Rothschild", "שדרות rothschild"], ["HaMered Street", "רחוב hamered"], ["Lilienblum Street", "רחוב lilienblum"],
  ],
  Haifa: [
    ["Herzl Street", "רחוב herzl"], ["HaNassi Boulevard", "שדרות hanassi"], ["Moriah Boulevard", "שדרות moriah"],
    ["Sderot Ben Gurion", "שדרות ben Gurion"], ["HaGalil Street", "רחוב hagalil"], ["HaPalmach Street", "רחוב hapalmach"],
    ["HaAtzmaut Street", "רחוב haatzmaut"], ["HaHagana Street", "רחוב hahagana"], ["HaAliya Street", "רחוב haaliya"],
    ["Jaffa Street", "רחוב jaffa"], ["HaNeviim Street", "רחוב haneviim"], ["HaHistadrut Boulevard", "שדרות hahistadrut"],
    ["Sderot HaHagana", "שדרות hahagana"], ["HaWadi Street", "רחוב hawadi"], ["Massada Street", "רחוב massada"],
    ["Yefe Nof Street", "רחוב yefe Nof"], ["HaGefen Street", "רחוב hagefen"], ["HaTziyonut Boulevard", "שדרות hatziyonut"],
    ["HaShalom Street", "רחוב hashalom"], ["Kiryat Eliezer", "קריית eliezer"], ["Bat Galim", "בat Galim"],
    ["Carmel Center", "מרכז hacarmel"], ["Technion City", "עיר htechnion"], ["HaMaayan Street", "רחוב hamaayan"],
  ],
};

const LARGE_EXTRA = {
  "Rishon LeZion": ["Herzl Street", "Rothschild Street", "Jabotinsky Street", "Bar Kochva Street", "Ibn Gabirol Street", "Sokolov Street", "Bialik Street", "HaRav Nissim Street", "Eilat Street", "HaAmal Street", "Kfar Saba Road", "HaHistadrut Street", "Lubich Street", "Montefiore Street", "HaShomer Street"],
  "Petah Tikva": ["Chaim Ozer Street", "Bar Kochva Street", "Sirkin Street", "Jabotinsky Street", "Rabbi Akiva Street", "HaHagana Street", "HaHistadrut Street", "Weizmann Street", "Herzl Street", "HaRav Herzog Street", "HaShacham Street", "Em HaMoshavot Boulevard", "HaOved Street", "HaGiborim Street", "HaMeyasdim Street"],
  Netanya: ["Ben Gurion Boulevard", "Herzl Street", "Weizmann Street", "HaRav Kook Street", "HaTaasiya Street", "Sokolov Street", "HaGalil Street", "HaSharon Street", "HaMaayan Street", "Jabotinsky Street", "HaAtzmaut Street", "Kiryat Hasharon", "HaOranim Street", "HaTamar Street", "HaSadot Street"],
  Beersheba: ["Rager Boulevard", "Herzl Street", "HaShalom Street", "Sderot Tzahal", "HaAtzmaut Street", "HaNegev Street", "HaHagana Street", "HaAliya Street", "HaPalmach Street", "Ben Gurion Boulevard", "HaAvot Street", "HaMatmid Street", "HaStudentim Street", "HaEmek Street", "HaDarom Street"],
  Ashdod: ["HaAtzmaut Boulevard", "Menachem Begin Boulevard", "Rabbi Akiva Street", "HaShalom Street", "Herzl Street", "HaNegev Street", "HaHagana Street", "HaHistadrut Street", "HaTmarim Street", "HaMelachim Street", "HaOmarim Street", "HaShikma Street", "HaOranim Street", "HaSadot Street", "HaMaayan Street"],
  Ashkelon: ["Ben Gurion Boulevard", "Herzl Street", "HaAtzmaut Street", "Rambam Street", "HaHagana Street", "HaNegev Street", "HaShikma Street", "HaOranim Street", "HaTmarim Street", "HaSadot Street", "HaMaayan Street", "HaGalil Street", "HaSharon Street", "HaHistadrut Street", "HaPalmach Street"],
  "Kfar Saba": ["Weizmann Street", "Herzl Street", "Rabbi Akiva Street", "HaMeisner Street", "HaHagana Street", "HaAtzmaut Street", "HaSharon Street", "HaOranim Street", "HaTamar Street", "HaSadot Street", "HaMaayan Street", "Jabotinsky Street", "Ben Gurion Boulevard", "HaHistadrut Street", "HaPalmach Street"],
  Herzliya: ["Sokolov Street", "Ben Gurion Boulevard", "HaNasi Street", "Medinat HaYehudim Street", "HaYarkon Street", "HaMaayan Street", "HaSharon Street", "HaOranim Street", "HaTmarim Street", "Jabotinsky Street", "Herzl Street", "Weizmann Street", "HaAtzmaut Street", "HaSadot Street", "HaGalil Street"],
  Rehovot: ["Weizmann Street", "Herzl Street", "HaNasi Street", "Yavne Street", "HaHagana Street", "HaAtzmaut Street", "HaHistadrut Street", "HaPalmach Street", "HaOranim Street", "HaShikma Street", "HaTmarim Street", "Ben Gurion Boulevard", "Jabotinsky Street", "HaMaayan Street", "HaSadot Street"],
  "Ramat Gan": ["Bialik Street", "Jabotinsky Street", "Krinitzi Street", "HaYarkon Street", "Herzl Street", "Weizmann Street", "HaAtzmaut Street", "HaHagana Street", "HaHistadrut Street", "HaOranim Street", "HaShikma Street", "Ben Gurion Boulevard", "HaMaayan Street", "HaSadot Street", "HaGalil Street"],
};

const CITIES = [
  { name: "Jerusalem", he: "ירושלים", zipBase: 9100000, tier: "mega" },
  { name: "Tel Aviv-Yafo", he: "תל אביב-יפו", zipBase: 6100000, tier: "mega" },
  { name: "Haifa", he: "חיפה", zipBase: 3100000, tier: "mega" },
  { name: "Rishon LeZion", he: "ראשון לציון", zipBase: 7500000, tier: "large" },
  { name: "Petah Tikva", he: "פתח תקווה", zipBase: 4900000, tier: "large" },
  { name: "Ashdod", he: "אשדוד", zipBase: 7700000, tier: "large" },
  { name: "Netanya", he: "נתניה", zipBase: 4200000, tier: "large" },
  { name: "Beersheba", he: "באר שבע", zipBase: 8400000, tier: "large" },
  { name: "Holon", he: "חולון", zipBase: 5800000, tier: "large" },
  { name: "Bnei Brak", he: "בני ברק", zipBase: 5100000, tier: "large" },
  { name: "Ramat Gan", he: "רמת גן", zipBase: 5200000, tier: "large" },
  { name: "Ashkelon", he: "אשקלון", zipBase: 7800000, tier: "large" },
  { name: "Rehovot", he: "רחובות", zipBase: 7600000, tier: "large" },
  { name: "Bat Yam", he: "בת ים", zipBase: 5900000, tier: "medium" },
  { name: "Beit Shemesh", he: "בית שמש", zipBase: 9900000, tier: "medium" },
  { name: "Kfar Saba", he: "כפר סבא", zipBase: 4400000, tier: "large" },
  { name: "Herzliya", he: "הרצליה", zipBase: 4600000, tier: "large" },
  { name: "Hadera", he: "חדרה", zipBase: 3800000, tier: "medium" },
  { name: "Modi'in-Maccabim-Re'ut", he: "מודיעין-מכבים-רעות", zipBase: 7170000, tier: "medium" },
  { name: "Nazareth", he: "נצרת", zipBase: 1600000, tier: "medium", arab: true },
  { name: "Lod", he: "לוד", zipBase: 7100000, tier: "medium" },
  { name: "Ramla", he: "רמלה", zipBase: 7200000, tier: "medium" },
  { name: "Ra'anana", he: "רעננה", zipBase: 4300000, tier: "medium" },
  { name: "Rahat", he: "רהט", zipBase: 8530000, tier: "medium", arab: true },
  { name: "Givatayim", he: "גבעתיים", zipBase: 5300000, tier: "medium" },
  { name: "Hod Hasharon", he: "הוד השרון", zipBase: 4500000, tier: "medium" },
  { name: "Kiryat Ata", he: "קריית אתא", zipBase: 2800000, tier: "medium" },
  { name: "Nahariya", he: "נהריה", zipBase: 2200000, tier: "medium" },
  { name: "Kiryat Gat", he: "קריית גת", zipBase: 8200000, tier: "medium" },
  { name: "Umm al-Fahm", he: "אום אל-פחם", zipBase: 3000000, tier: "medium", arab: true },
  { name: "Eilat", he: "אילת", zipBase: 8800000, tier: "medium" },
  { name: "Acre", he: "עכו", zipBase: 2400000, tier: "medium", arab: true },
  { name: "Elad", he: "אלעד", zipBase: 4080000, tier: "medium" },
  { name: "Rosh HaAyin", he: "ראש העין", zipBase: 4800000, tier: "medium" },
  { name: "Ramat Hasharon", he: "רמת השרון", zipBase: 4700000, tier: "medium" },
  { name: "Kiryat Motzkin", he: "קריית מוצקין", zipBase: 2600000, tier: "medium" },
  { name: "Ness Ziona", he: "נס ציונה", zipBase: 7400000, tier: "medium" },
  { name: "Yavne", he: "יבנה", zipBase: 8100000, tier: "medium" },
  { name: "Or Yehuda", he: "אור יהודה", zipBase: 6000000, tier: "medium" },
  { name: "Safed", he: "צפת", zipBase: 1300000, tier: "medium" },
  { name: "Tamra", he: "טמרה", zipBase: 3080000, tier: "small", arab: true },
  { name: "Dimona", he: "דימונה", zipBase: 8600000, tier: "small" },
  { name: "Sakhnin", he: "סכנין", zipBase: 3085000, tier: "small", arab: true },
  { name: "Netivot", he: "נתיבות", zipBase: 8770000, tier: "small" },
  { name: "Ofakim", he: "אופקים", zipBase: 8750000, tier: "small" },
  { name: "Arad", he: "ערד", zipBase: 8900000, tier: "small" },
  { name: "Sderot", he: "שדרות", zipBase: 8700000, tier: "small" },
  { name: "Karmiel", he: "כרמיאל", zipBase: 2100000, tier: "medium" },
  { name: "Yokneam Illit", he: "יוקנעם עילית", zipBase: 2060000, tier: "medium" },
  { name: "Tiberias", he: "טבריה", zipBase: 1400000, tier: "medium" },
  { name: "Migdal HaEmek", he: "מגדל העמק", zipBase: 2300000, tier: "small" },
  { name: "Ariel", he: "אריאל", zipBase: 4070000, tier: "small" },
  { name: "Kiryat Bialik", he: "קריית ביאליק", zipBase: 2700000, tier: "medium" },
  { name: "Ma'ale Adumim", he: "מעלה אדומים", zipBase: 9850000, tier: "medium" },
  { name: "Kiryat Yam", he: "קריית ים", zipBase: 2900000, tier: "medium" },
  { name: "Kiryat Ono", he: "קריית אונו", zipBase: 5500000, tier: "medium" },
  { name: "Yehud-Monosson", he: "יהוד-מונוסון", zipBase: 5600000, tier: "medium" },
  { name: "Tira", he: "טירה", zipBase: 4490000, tier: "small", arab: true },
  { name: "Nesher", he: "נשר", zipBase: 3680000, tier: "small" },
  { name: "Tirat Carmel", he: "טירת כרמל", zipBase: 3900000, tier: "small" },
  { name: "Taibe", he: "טייבה", zipBase: 4040000, tier: "small", arab: true },
  { name: "Qalansawe", he: "קלנסווה", zipBase: 3060000, tier: "small", arab: true },
  { name: "Beit She'an", he: "בית שאן", zipBase: 1170000, tier: "small" },
  { name: "Giv'at Shmuel", he: "גבעת שמואל", zipBase: 5400000, tier: "small" },
  { name: "Azor", he: "אזור", zipBase: 5810000, tier: "small" },
  { name: "Maghar", he: "מג'אר", zipBase: 2010000, tier: "small", arab: true },
  { name: "Kafr Qasim", he: "כפר קאסם", zipBase: 4901000, tier: "small", arab: true },
  { name: "Kfar Yona", he: "כפר יונה", zipBase: 4030000, tier: "small" },
  { name: "Or Akiva", he: "אור עקיבא", zipBase: 3061000, tier: "small" },
  { name: "Kiryat Malakhi", he: "קריית מלאכי", zipBase: 8300000, tier: "small" },
  { name: "Kiryat Shmona", he: "קריית שמונה", zipBase: 1100000, tier: "small" },
  { name: "Mitzpe Ramon", he: "מצפה רמון", zipBase: 8060000, tier: "small" },
  { name: "Ma'alot-Tarshiha", he: "מעלות-תרשיחא", zipBase: 2101000, tier: "small" },
  { name: "Daliyat al-Karmel", he: "דלiyat אל-כרמל", zipBase: 3001000, tier: "small", arab: true },
  { name: "Shfaram", he: "שפרעם", zipBase: 2020000, tier: "small", arab: true },
  { name: "Arraba", he: "עראבה", zipBase: 3081000, tier: "small", arab: true },
  { name: "Yafa an-Naseriyye", he: "יפיע", zipBase: 3002000, tier: "small", arab: true },
  { name: "Ma'ale Iron", he: "מעלה עירון", zipBase: 3003000, tier: "small", arab: true },
  { name: "Zikhron Ya'akov", he: "זכרון יעקב", zipBase: 3090000, tier: "medium" },
  { name: "Gedera", he: "גדרה", zipBase: 7000000, tier: "medium" },
  { name: "Gan Yavne", he: "גן יבנה", zipBase: 7080000, tier: "small" },
  { name: "Even Yehuda", he: "אבן יהודה", zipBase: 4050000, tier: "small" },
  { name: "Kadima-Zoran", he: "קדימה-צורן", zipBase: 6090000, tier: "medium" },
  { name: "Harish", he: "חריש", zipBase: 3760000, tier: "small" },
  { name: "Nof HaGalil", he: "נוף הגליל", zipBase: 1700000, tier: "medium" },
  { name: "Kiryat Ye'arim", he: "קריית יערים", zipBase: 9901000, tier: "small" },
  { name: "Beitar Illit", he: "ביתר עילית", zipBase: 9902000, tier: "medium" },
  { name: "Modi'in Illit", he: "מודיעין עילית", zipBase: 7190000, tier: "medium" },
];

function getStreetsForCity(city) {
  if (MEGA_STREETS[city.name]) {
    return MEGA_STREETS[city.name].map(([en, he]) => ({ en, he: he || en }));
  }
  if (LARGE_EXTRA[city.name]) {
    return LARGE_EXTRA[city.name].map((en) => ({ en, he: en }));
  }
  const pool = city.arab ? ARAB_STREETS : COMMON_HE;
  const tier = city.tier;
  const count = tier === "large" ? 12 : tier === "medium" ? 8 : 6;
  const streets = [];
  for (let i = 0; i < count; i++) {
    streets.push({ en: pool[i % pool.length], he: pool[i % pool.length] });
  }
  streets.push(
    { en: `${city.name} Central`, he: `מרכז ${city.he}` },
    { en: `${city.name} Industrial Zone`, he: `אזור תעשייה ${city.he}` },
    { en: "HaMaayan Street", he: "רחוב המעיין" },
    { en: "HaOranim Street", he: "רחוב האורנים" },
    { en: "HaShikma Street", he: "רחוב השקמה" }
  );
  return streets;
}

function buildAddresses() {
  const all = [];
  let globalIdx = 0;

  for (const city of CITIES) {
    const streets = getStreetsForCity(city);
    const numbers = NUMBERS[city.tier] || NUMBERS.medium;

    streets.forEach((street, si) => {
      numbers.forEach((num, ni) => {
        const zip = String(city.zipBase + si * 137 + ni * 19 + num).padStart(7, "0").slice(0, 7);
        const streetLine = `${street.en} ${num}`;
        all.push({
          street: streetLine,
          streetHe: `${street.he} ${num}`,
          city: city.name,
          cityHe: city.he,
          zip,
          label: `${streetLine}, ${city.name}`,
          tier: city.tier,
          id: globalIdx++,
        });
      });
    });
  }

  return all;
}

const addresses = buildAddresses();

const output = `/**
 * Rich mock address database (auto-generated).
 * Run: node scripts/generate-address-data.mjs
 *
 * NOT every real address - expanded demo data with
 * multiple streets × house numbers per city, English + Hebrew search.
 */
/* eslint-disable max-lines */

export const ISRAEL_CITIES = ${JSON.stringify(
  CITIES.map(({ name, he, zipBase, tier }) => ({ name, he, zipBase, tier })),
  null,
  2
)};

export const ISRAEL_MOCK_ADDRESSES = ${JSON.stringify(addresses, null, 2)};

export const ISRAEL_CITY_NAMES = ISRAEL_CITIES.map((c) => ({
  name: c.name,
  he: c.he,
  zip: String(c.zipBase + 1).padStart(7, "0").slice(0, 7),
  tier: c.tier,
}));

export function searchIsraelMockAddresses(query, limit = 12) {
  const q = query.trim().toLowerCase();
  const qRaw = query.trim();
  if (q.length < 1) return [];

  const scored = [];

  for (const addr of ISRAEL_MOCK_ADDRESSES) {
    const haystack = [
      addr.label,
      addr.city,
      addr.cityHe,
      addr.street,
      addr.streetHe || "",
      addr.zip,
      addr.tier,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q) && !(addr.cityHe && addr.cityHe.includes(qRaw))) continue;

    let score = 0;
    if (addr.city.toLowerCase() === q || addr.cityHe === qRaw) score += 100;
    else if (addr.city.toLowerCase().startsWith(q) || (addr.cityHe && addr.cityHe.startsWith(qRaw))) score += 80;
    else if (addr.city.toLowerCase().includes(q)) score += 50;
    if (addr.street.toLowerCase().startsWith(q)) score += 40;
    else if (addr.street.toLowerCase().includes(q)) score += 20;
    if (addr.streetHe && addr.streetHe.includes(qRaw)) score += 35;
    if (addr.zip.includes(q)) score += 30;

    scored.push({ addr, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const results = [];
  for (const { addr } of scored) {
    const key = addr.label;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(addr);
    if (results.length >= limit) break;
  }

  return results;
}

export function getAddressesByCity(cityName) {
  const q = cityName.trim().toLowerCase();
  const qRaw = cityName.trim();
  return ISRAEL_MOCK_ADDRESSES.filter(
    (a) => a.city.toLowerCase() === q || a.cityHe === qRaw
  );
}

export function getCityStats() {
  const byTier = { mega: 0, large: 0, medium: 0, small: 0 };
  for (const c of ISRAEL_CITIES) byTier[c.tier] = (byTier[c.tier] || 0) + 1;
  return byTier;
}

export const MOCK_STATS = {
  cities: ISRAEL_CITIES.length,
  addresses: ISRAEL_MOCK_ADDRESSES.length,
  tiers: getCityStats(),
};
`;

writeFileSync(join(root, "js", "israel-address-data.js"), output, "utf8");

console.log("Generated israel-address-data.js");
console.log("  Cities:", CITIES.length);
console.log("  Addresses:", addresses.length);
console.log("  Tiers:", JSON.stringify(
  CITIES.reduce((acc, c) => { acc[c.tier] = (acc[c.tier] || 0) + 1; return acc; }, {})
));
