const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbz_51KMGpbSfJOagqy0GA_VsZct3gqFBGlZszdKzTXheDYeOeR89m4AmHKK633ssPOU/exec';
const payload = {
  id: 'test-order',
  customerName: 'Test',
  customerPhone: '000',
  wilaya: 'Test',
  commune: 'Test',
  address: 'Test',
  deliveryType: 'home',
  paymentMethod: 'cod',
  deliveryCompany: 'Test',
  deliveryPrice: 0,
  subtotal: 0,
  couponCode: '',
  couponDiscount: 0,
  total: 0,
  status: 'pending',
  source: 'website',
  createdAt: '2026-05-05T00:00:00Z',
  items: [],
};

const data = JSON.stringify(payload);
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(url, options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers));
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('BODY', body);
  });
});

req.on('error', (err) => {
  console.error('ERROR', err);
});

req.write(data);
req.end();
