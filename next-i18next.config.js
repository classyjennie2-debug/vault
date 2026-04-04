const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt', 'fr', 'zh', 'ar', 'ph'],
  },
  ns: ['common', 'dashboard', 'referral', 'home', 'pricing'],
  defaultNS: 'common',
  localePath: path.resolve('./public/locales'),
  react: {
    useSuspense: false, // Disable suspense for better compatibility
  },
}
