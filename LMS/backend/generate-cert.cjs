const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const opts = {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256'
};

const pems = selfsigned.generate(attrs, opts);

const sslDir = path.join(__dirname, 'ssl');
fs.writeFileSync(path.join(sslDir, 'key.pem'), pems.private);
fs.writeFileSync(path.join(sslDir, 'cert.pem'), pems.cert);

console.log('✅ Self-signed SSL certificates created successfully!');
console.log('   - ssl/key.pem');
console.log('   - ssl/cert.pem');
