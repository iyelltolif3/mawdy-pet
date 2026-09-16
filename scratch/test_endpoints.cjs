const http = require('http');

function makeRequest(options, postData = null) {
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
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== 1. Health check ===');
  const health = await makeRequest({ host: 'localhost', port: 3001, path: '/health', method: 'GET' });
  console.log('Health:', health.status, health.data);

  console.log('\n=== 2. Admin Tenants List ===');
  const tenants = await makeRequest({ host: 'localhost', port: 3001, path: '/api/admin/tenants', method: 'GET' });
  console.log('Tenants count:', tenants.data?.tenants?.length);
  tenants.data?.tenants?.forEach((t) => {
    console.log(`- ${t.nombreVisible} (${t.sponsorId}): primary=${t.tema?.colores?.primary}, secondary=${t.tema?.colores?.secondary}, font=${t.tema?.fuente}`);
  });

  console.log('\n=== 3. Host: consalud.localhost:5173 /api/tenant ===');
  const consalud = await makeRequest({
    host: 'localhost',
    port: 3001,
    path: '/api/tenant',
    method: 'GET',
    headers: { host: 'consalud.localhost:5173' },
  });
  console.log('Consalud resolved:', consalud.status, consalud.data?.nombreVisible, consalud.data?.tema?.colores?.primary);

  console.log('\n=== 4. Host: admin.localhost:5173 /api/tenant ===');
  const adminHost = await makeRequest({
    host: 'localhost',
    port: 3001,
    path: '/api/tenant',
    method: 'GET',
    headers: { host: 'admin.localhost:5173' },
  });
  console.log('Admin resolved:', adminHost.status, adminHost.data?.nombreVisible, adminHost.data?.isAdmin);

  console.log('\n=== 5. Upload Logo Validation (Rejection of invalid format) ===');
  const badUpload = await makeRequest(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/admin/upload-logo',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      sponsorId: 'consalud',
      filename: 'foto.jpg',
      mimeType: 'image/jpeg',
      base64Data: Buffer.from('fake-jpeg').toString('base64'),
    }
  );
  console.log('Bad upload status (should be 400):', badUpload.status, badUpload.data);

  console.log('\n=== 6. Upload Logo Validation (Accepted SVG) ===');
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#006194"/></svg>`;
  const goodUpload = await makeRequest(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/admin/upload-logo',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      sponsorId: 'consalud',
      filename: 'consalud-nuevo.svg',
      mimeType: 'image/svg+xml',
      base64Data: Buffer.from(sampleSvg).toString('base64'),
    }
  );
  console.log('Good upload status (should be 200):', goodUpload.status, goodUpload.data);

  console.log('\n=== 7. PUT /api/admin/tenants/consalud with primary & secondary hex ===');
  const updateResp = await makeRequest(
    {
      host: 'localhost',
      port: 3001,
      path: '/api/admin/tenants/consalud',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      tema: {
        colores: {
          primary: '#006194',
          secondary: '#006A63',
        },
        fuente: 'Plus Jakarta Sans',
      },
    }
  );
  console.log('Update status:', updateResp.status, updateResp.data?.success, updateResp.data?.tenant?.tema?.colores);
}

runTests().catch(console.error);
