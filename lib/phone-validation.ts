// Country codes with phone number formats
export const COUNTRY_CODES = {
  US: { code: '+1', flag: '🇺🇸', name: 'United States', pattern: /^\d{10}$/, format: '(XXX) XXX-XXXX' },
  CA: { code: '+1', flag: '🇨🇦', name: 'Canada', pattern: /^\d{10}$/, format: '(XXX) XXX-XXXX' },
  GB: { code: '+44', flag: '🇬🇧', name: 'United Kingdom', pattern: /^\d{10,11}$/, format: 'XXXX XXX XXXX' },
  AU: { code: '+61', flag: '🇦🇺', name: 'Australia', pattern: /^\d{9}$/, format: 'XXXX XXX XXX' },
  IN: { code: '+91', flag: '🇮🇳', name: 'India', pattern: /^\d{10}$/, format: 'XXXXX XXXXX' },
  NG: { code: '+234', flag: '🇳🇬', name: 'Nigeria', pattern: /^\d{10}$/, format: 'XXXXX XXXXX' },
  KE: { code: '+254', flag: '🇰🇪', name: 'Kenya', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  ZA: { code: '+27', flag: '🇿🇦', name: 'South Africa', pattern: /^\d{9}$/, format: 'XXX XXX XXXX' },
  SG: { code: '+65', flag: '🇸🇬', name: 'Singapore', pattern: /^\d{8}$/, format: 'XXXX XXXX' },
  NZ: { code: '+64', flag: '🇳🇿', name: 'New Zealand', pattern: /^\d{9}$/, format: 'XXX XXX XXXX' },
  DE: { code: '+49', flag: '🇩🇪', name: 'Germany', pattern: /^\d{10,11}$/, format: 'XXXX XXXXXXX' },
  FR: { code: '+33', flag: '🇫🇷', name: 'France', pattern: /^\d{9}$/, format: 'X XX XX XX XX' },
  ES: { code: '+34', flag: '🇪🇸', name: 'Spain', pattern: /^\d{9}$/, format: 'XXX XX XX XX' },
  IT: { code: '+39', flag: '🇮🇹', name: 'Italy', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  BR: { code: '+55', flag: '🇧🇷', name: 'Brazil', pattern: /^\d{10,11}$/, format: '(XX) XXXXX-XXXX' },
  MX: { code: '+52', flag: '🇲🇽', name: 'Mexico', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  JP: { code: '+81', flag: '🇯🇵', name: 'Japan', pattern: /^\d{9,10}$/, format: 'XX-XXXX-XXXX' },
  CN: { code: '+86', flag: '🇨🇳', name: 'China', pattern: /^\d{11}$/, format: 'XXXX XXXX XXXX' },
  HK: { code: '+852', flag: '🇭🇰', name: 'Hong Kong', pattern: /^\d{8}$/, format: 'XXXX XXXX' },
  MY: { code: '+60', flag: '🇲🇾', name: 'Malaysia', pattern: /^\d{9,10}$/, format: 'X XXXX XXXX' },
  TH: { code: '+66', flag: '🇹🇭', name: 'Thailand', pattern: /^\d{9}$/, format: 'XX XXX XXXX' },
  VN: { code: '+84', flag: '🇻🇳', name: 'Vietnam', pattern: /^\d{9,10}$/, format: 'XXX XXX XXXX' },
  PH: { code: '+63', flag: '🇵🇭', name: 'Philippines', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  ID: { code: '+62', flag: '🇮🇩', name: 'Indonesia', pattern: /^\d{10,11}$/, format: 'XXX XXXX XXXX' },
  PK: { code: '+92', flag: '🇵🇰', name: 'Pakistan', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  BD: { code: '+880', flag: '🇧🇩', name: 'Bangladesh', pattern: /^\d{10}$/, format: 'XXXX XXXXXX' },
  LK: { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  AE: { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  SA: { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', pattern: /^\d{9}$/, format: 'X XXX XXXX' },
  QA: { code: '+974', flag: '🇶🇦', name: 'Qatar', pattern: /^\d{8}$/, format: 'XXXX XXXX' },
  EG: { code: '+20', flag: '🇪🇬', name: 'Egypt', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  MA: { code: '+212', flag: '🇲🇦', name: 'Morocco', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  RU: { code: '+7', flag: '🇷🇺', name: 'Russia', pattern: /^\d{10}$/, format: 'XXX XXX XX XX' },
  PL: { code: '+48', flag: '🇵🇱', name: 'Poland', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  SE: { code: '+46', flag: '🇸🇪', name: 'Sweden', pattern: /^\d{9}$/, format: 'XX XXX XXXX' },
  NO: { code: '+47', flag: '🇳🇴', name: 'Norway', pattern: /^\d{8}$/, format: 'XXXX XXXX' },
  NL: { code: '+31', flag: '🇳🇱', name: 'Netherlands', pattern: /^\d{9}$/, format: 'X XXX XXXXX' },
  BE: { code: '+32', flag: '🇧🇪', name: 'Belgium', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  AT: { code: '+43', flag: '🇦🇹', name: 'Austria', pattern: /^\d{10}$/, format: 'XXX XXXXXXX' },
  CH: { code: '+41', flag: '🇨🇭', name: 'Switzerland', pattern: /^\d{9}$/, format: 'XX XXX XXXX' },
  GR: { code: '+30', flag: '🇬🇷', name: 'Greece', pattern: /^\d{10}$/, format: 'XXX XXXX XXXX' },
  PT: { code: '+351', flag: '🇵🇹', name: 'Portugal', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  TR: { code: '+90', flag: '🇹🇷', name: 'Turkey', pattern: /^\d{10}$/, format: 'XXX XXX XX XX' },
  IL: { code: '+972', flag: '🇮🇱', name: 'Israel', pattern: /^\d{9}$/, format: 'XX XXX XXXX' },
  CO: { code: '+57', flag: '🇨🇴', name: 'Colombia', pattern: /^\d{10}$/, format: 'XXX XXX XXXX' },
  AR: { code: '+54', flag: '🇦🇷', name: 'Argentina', pattern: /^\d{10}$/, format: 'XXX XXXX XXXX' },
  CL: { code: '+56', flag: '🇨🇱', name: 'Chile', pattern: /^\d{9}$/, format: 'X XXXX XXXX' },
  PE: { code: '+51', flag: '🇵🇪', name: 'Peru', pattern: /^\d{9}$/, format: 'XXX XXX XXX' },
  EC: { code: '+593', flag: '🇪🇨', name: 'Ecuador', pattern: /^\d{9}$/, format: 'XXX XXX XXXX' },
}

export type CountryCode = keyof typeof COUNTRY_CODES

// Normalize user input: remove non-digits and drop the country code prefix if the
// user typed it. This lets callers accept either a local number or a full E.164.
export function stripCountryCode(phoneNumber: string, countryCode: CountryCode): string {
  const country = COUNTRY_CODES[countryCode]
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  if (!country) return digitsOnly

  const countryDigits = country.code.replace(/\D/g, '')
  if (digitsOnly.startsWith(countryDigits)) {
    return digitsOnly.slice(countryDigits.length)
  }
  return digitsOnly
}

export function validatePhone(phoneNumber: string, countryCode: CountryCode): boolean {
  const country = COUNTRY_CODES[countryCode]
  if (!country) return false

  const localNumber = stripCountryCode(phoneNumber, countryCode)
  return country.pattern.test(localNumber)
}

export function formatPhone(phoneNumber: string, countryCode: CountryCode): string {
  const country = COUNTRY_CODES[countryCode]
  if (!country) return phoneNumber

  const localNumber = stripCountryCode(phoneNumber, countryCode)

  // Format based on pattern; keep it simple and return prefixed number
  let formatted = localNumber
  if (countryCode === 'US' || countryCode === 'CA') {
    formatted = `${country.code} (${localNumber.slice(0, 3)}) ${localNumber.slice(3, 6)}-${localNumber.slice(6)}`
  } else if (countryCode === 'GB') {
    formatted = `${country.code} ${localNumber.slice(0, 4)} ${localNumber.slice(4)}`
  } else if (countryCode === 'IN') {
    formatted = `${country.code} ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`
  }

  return formatted.startsWith(country.code) ? formatted : `${country.code} ${formatted}`
}

export function getCountryCodeEntry(code: CountryCode) {
  return COUNTRY_CODES[code]
}

export const COUNTRY_CODES_LIST = Object.entries(COUNTRY_CODES).map(([key, value]) => ({
  countryCode: key as CountryCode,
  ...value,
}))
