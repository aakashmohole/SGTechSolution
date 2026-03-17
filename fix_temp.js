const fs = require('fs');

const filesToFix = [
  'client/src/app/inventory/[id]/page.tsx',
  'client/src/app/inventory/page.tsx',
  'client/src/app/custom-build/page.tsx',
  'client/src/app/checkout/page.tsx',
  'client/src/app/admin/dashboard/page.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Fix className inside template strings
  content = content.replace(/ ₹{/g, ' ${');
  // Fix `Bearer ₹{token}`
  content = content.replace(/Bearer ₹{/g, 'Bearer ${');
  // Fix `Alert: You have ₹{`
  content = content.replace(/have ₹{/g, 'have ${');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed syntax issues');
