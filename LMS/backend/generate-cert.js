import selfsigned from 'selfsigned';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }]
});

writeFileSync(join(__dirname, 'ssl', 'key.pem'), pems.private);
writeFileSync(join(__dirname, 'ssl', 'cert.pem'), pems.cert);

console.log('✅ Self-signed SSL certificates created successfully!');
console.log('   - ssl/key.pem');
console.log('   - ssl/cert.pem');
console.log('✅ Backend will now run on HTTPS');


