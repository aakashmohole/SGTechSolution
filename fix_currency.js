const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('client/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace >$ with >₹
    content = content.replace(/>\$/g, '>₹');
    // Replace }$ with }₹
    content = content.replace(/}\$/g, '}₹');
    // Replace +$ with +₹
    content = content.replace(/\+\$/g, '+₹');
    // Replace :$ with :₹
    content = content.replace(/:\$/g, ':₹');
    // Replace space$ with space₹ (if it's not a template literal like ` ${`)
    content = content.replace(/ \$/g, ' ₹');
    // For string replacements like "${" that were broken, let's fix JSX text ones:
    // e.g., <span>${part.price}</span> -> <span>₹{part.price}</span>
    content = content.replace(/>\${/g, '>₹{');
    // Also " + ${" to " + ₹{"? No
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done');
