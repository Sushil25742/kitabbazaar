const fs = require('fs');
const path = require('path');

const files = [
  'src/app/books/page.tsx',
  'src/app/checkout/page.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("import Link from 'next/link'")) {
      content = "import Link from 'next/link';\n" + content;
      fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Fixed imports.');
