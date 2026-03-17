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
}

export type CountryCode = keyof typeof COUNTRY_CODES

export function validatePhone(phoneNumber: string, countryCode: CountryCode): boolean {
  const country = COUNTRY_CODES[countryCode]
  if (!country) return false
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  return country.pattern.test(cleanNumber)
}

export function formatPhone(phoneNumber: string, countryCode: CountryCode): string {
  const country = COUNTRY_CODES[countryCode]
  if (!country) return phoneNumber
  
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Format based on pattern
  // This is a simple formatter - adjust as needed per country
  let formatted = cleanNumber
  if (countryCode === 'US' || countryCode === 'CA') {
    formatted = `+${country.code} (${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`
  } else if (countryCode === 'GB') {
    formatted = `+${country.code} ${cleanNumber.slice(0, 4)} ${cleanNumber.slice(4)}`
  }
  
  return formatted
}

export function getCountryCodeEntry(code: CountryCode) {
  return COUNTRY_CODES[code]
}

export const COUNTRY_CODES_LIST = Object.entries(COUNTRY_CODES).map(([key, value]) => ({
  code: key as CountryCode,
  ...value,
}))
