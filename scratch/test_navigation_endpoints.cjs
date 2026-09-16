const http = require('http');

function get(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verify() {
  console.log('--- 1. Testing Consalud Luna by riesgoId (R-CS-00147-01) ---');
  const r1 = await get({
    host: 'localhost',
    port: 3001,
    path: '/api/cartera/mascota/R-CS-00147-01',
    method: 'GET',
    headers: { host: 'consalud.localhost:5173' }
  });
  console.log('Status:', r1.status, 'Nombre:', r1.data?.poliza?.mascota?.nombre, 'Especie:', r1.data?.poliza?.mascota?.especie);

  console.log('--- 2. Testing Consalud Rocky by riesgoId (R-CS-00147-02) ---');
  const r2 = await get({
    host: 'localhost',
    port: 3001,
    path: '/api/cartera/mascota/R-CS-00147-02',
    method: 'GET',
    headers: { host: 'consalud.localhost:5173' }
  });
  console.log('Status:', r2.status, 'Nombre:', r2.data?.poliza?.mascota?.nombre, 'Especie:', r2.data?.poliza?.mascota?.especie);

  console.log('--- 3. Testing Zurich Santander Copito by riesgoId (R-ZS-00051-01) ---');
  const r3 = await get({
    host: 'localhost',
    port: 3001,
    path: '/api/cartera/mascota/R-ZS-00051-01',
    method: 'GET',
    headers: { host: 'zurichsantander.localhost:5173' }
  });
  console.log('Status:', r3.status, 'Nombre:', r3.data?.poliza?.mascota?.nombre, 'Especie:', r3.data?.poliza?.mascota?.especie);

  console.log('--- 4. Testing Frontend Vite index.html response ---');
  const fe = await get({
    host: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET'
  });
  console.log('Vite frontend HTTP Status:', fe.status, 'Contains root div:', fe.data.includes('id="root"'));
}

verify().catch(console.error);
