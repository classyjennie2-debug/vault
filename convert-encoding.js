const fs = require('fs');

const languages = ['es', 'pt', 'fr'];

languages.forEach(lang => {
  const filePath = `./public/locales/${lang}/investments.json`;
  try {
    // Read the entire file as buffer
    const buffer = fs.readFileSync(filePath);
    
    // Decode from UTF-16LE to string
    const content = buffer.toString('utf16le');
    
    // Encode to UTF-8 bytes
    const utf8Buffer = Buffer.from(content, 'utf8');
    
    // Write back as UTF-8
    fs.writeFileSync(filePath, utf8Buffer, 'utf8');
    console.log(`✓ Converted ${lang} from UTF-16LE to UTF-8`);
  } catch (err) {
    console.error(`✗ Error converting ${lang}:`, err.message);
  }
});

