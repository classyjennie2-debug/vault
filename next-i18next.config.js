const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  ns: ['common', 'dashboard', 'referral'],
  defaultNS: 'common',
  localePath: path.resolve('./public/locales'),
  react: {
    useSuspense: false, // Disable suspense for better compatibility
  },
}
