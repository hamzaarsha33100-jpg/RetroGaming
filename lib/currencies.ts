export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  locale: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1, locale: "en-US", flag: "🇺🇸" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rate: 278.5, locale: "en-PK", flag: "🇵🇰" },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92, locale: "de-DE", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79, locale: "en-GB", flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67, locale: "ar-AE", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 3.75, locale: "ar-SA", flag: "🇸🇦" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36, locale: "en-CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52, locale: "en-AU", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.5, locale: "ja-JP", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.15, locale: "zh-CN", flag: "🇨🇳" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.2, locale: "en-IN", flag: "🇮🇳" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 32.4, locale: "tr-TR", flag: "🇹🇷" },
  { code: "BHD", symbol: "ب.د", name: "Bahraini Dinar", rate: 0.376, locale: "ar-BH", flag: "🇧🇭" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", rate: 0.308, locale: "ar-KW", flag: "🇰🇼" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", rate: 3.64, locale: "ar-QA", flag: "🇶🇦" },
  { code: "OMR", symbol: "ر.ع", name: "Omani Rial", rate: 0.385, locale: "ar-OM", flag: "🇴🇲" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 1.66, locale: "en-NZ", flag: "🇳🇿" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.34, locale: "en-SG", flag: "🇸🇬" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.72, locale: "ms-MY", flag: "🇲🇾" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 56.1, locale: "en-PH", flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 15500, locale: "id-ID", flag: "🇮🇩" },
  { code: "THB", symbol: "฿", name: "Thai Baht", rate: 35.8, locale: "th-TH", flag: "🇹🇭" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", rate: 24600, locale: "vi-VN", flag: "🇻🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 1330, locale: "ko-KR", flag: "🇰🇷" },
];

export const DEFAULT_CURRENCY = "USD";

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function convertPrice(priceUsd: number, code: string): number {
  const currency = getCurrency(code);
  return priceUsd * currency.rate;
}

export function formatCurrency(priceUsd: number, code: string): string {
  const currency = getCurrency(code);
  const converted = convertPrice(priceUsd, code);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: converted >= 1000 ? 0 : 2,
    }).format(converted);
  } catch {
    return `${currency.symbol}${converted.toFixed(2)}`;
  }
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  PK: "PKR", AE: "AED", SA: "SAR", BH: "BHD", KW: "KWD", QA: "QAR", OM: "OMR",
  US: "USD", GB: "GBP", EU: "EUR", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  CA: "CAD", AU: "AUD", NZ: "NZD", JP: "JPY", CN: "CNY", IN: "INR",
  TR: "TRY", SG: "SGD", MY: "MYR", PH: "PHP", ID: "IDR", TH: "THB",
  VN: "VND", KR: "KRW",
};

export function detectCurrencyFromLocale(locale?: string): string {
  if (locale) {
    const parts = locale.split("-");
    const country = parts[parts.length - 1]?.toUpperCase();
    if (country && COUNTRY_CURRENCY_MAP[country]) {
      return COUNTRY_CURRENCY_MAP[country];
    }
  }
  return DEFAULT_CURRENCY;
}
