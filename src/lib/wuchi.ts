export type CountryCode = "ZW" | "ZA" | "IN";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: Country[] = [
  { code: "ZW", name: "Zimbabwe",     flag: "🇿🇼", currency: "USD", symbol: "$"  },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", symbol: "R"  },
  { code: "IN", name: "India",        flag: "🇮🇳", currency: "INR", symbol: "₹"  },
];

export const SUPPORTED_PAIRS: Array<[CountryCode, CountryCode]> = [
  ["ZA", "ZW"],
  ["ZW", "ZA"],
  ["ZW", "IN"],
  ["IN", "ZW"],
  ["ZA", "IN"],
  ["IN", "ZA"],
];

export const getCountry = (code: CountryCode) =>
  COUNTRIES.find((c) => c.code === code)!;

export const isSupported = (from: CountryCode, to: CountryCode) =>
  SUPPORTED_PAIRS.some(([a, b]) => a === from && b === to);

export const WHATSAPP_NUMBER = "263779260663"; // primary
export const SECONDARY_PHONE = "+27 83 764 5861";
export const PRIMARY_PHONE = "+263 77 926 0663";
export const BRAND_NAME = "Done Money Transfer";
export const BRAND_TAGLINE = "Fast · Secure · Reliable";
export const BANK_DETAILS = {
  bank: "FNB",
  accountNumber: "63200553485",
  accountName: "Rebecca Mokwena",
};

export const formatMoney = (amount: number, symbol = "") =>
  `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;