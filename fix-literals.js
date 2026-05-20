const fs = require('fs');
const path = require('path');

const files = [
  'src/app/notifications/page.tsx',
  'src/app/messages/page.tsx',
  'src/app/messages/actions.ts',
  'src/app/messages/MessageClient.tsx',
  'src/app/books/[id]/page.tsx',
  'src/app/books/[id]/WishlistButton.tsx',
  'src/app/books/[id]/actions.ts',
  'src/app/wishlist/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/actions.ts',
  'src/app/seller/page.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace \\` with `
    content = content.replace(/\\\\\\`/g, '\`').replace(/\\\\\\$/g, '$');
    // Sometimes it's written as \\`
    content = content.replace(/\\\\`/g, '\`').replace(/\\\\$/g, '$');
    
    // Actually in my node script I wrote: \\\` -> which outputs \` in the file.
    content = content.replace(/\\\\`/g, '\`');
    content = content.replace(/\\\\\$/g, '$');
    
    // Also fix any `\${` -> `${`
    content = content.replace(/\\\$\\{/g, '${');
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Fixed literal escapes.');
