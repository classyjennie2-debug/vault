const fs = require('fs');

const languages = ['es', 'pt', 'fr'];

languages.forEach(lang => {
  try {
    const content = fs.readFileSync(`public/locales/${lang}/investments.json`, 'utf8');
    const json = JSON.parse(content);
    console.log(`✓ ${lang}: ${Object.keys(json).length} keys loaded successfully`);
  } catch (error) {
    console.log(`✗ ${lang}: Error - ${error.message}`);
  }
});
