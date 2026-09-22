const https = require('https');

const payload = {
  _subject: "🎉 TEST COMMANDE ISIVENTE - 19 900 FCFA (Test)",
  _template: "table",
  _captcha: "false",
  name: "Isivente Test",
  email: "notifications@isivente.vercel.app",
  "📦 Produit": "Test Produit",
  "💰 Montant Total": "19 900 FCFA",
  "👤 Nom du Client": "Tu",
  "📞 Téléphone": "0192901817",
};

const data = JSON.stringify(payload);

const req = https.request('https://formsubmit.co/ajax/tolkeeee@gmail.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://isivente.vercel.app',
    'Referer': 'https://isivente.vercel.app/'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Response body:', body);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
