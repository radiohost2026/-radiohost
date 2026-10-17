export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  // MUDA PARA HTTPS
  const AZURACAST_URL = 'https://173.212.231.94';
  const API_KEY = '7c2714e4dda42c7f:5331cd60'; // COLA SUA CHAVE COMPLETA AQUI, COM OS DOIS LADOS DO :

  const { nome, email } = req.body || {};
  if (!nome) return res.status(400).json({ error: 'Sem nome' });

  const short = nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8) + Date.now().toString().slice(-4);

  try {
    // Tenta endpoint CORRETO para criar estação
    const endpoints = [`${AZURACAST_URL}/api/admin/stations`, `${AZURACAST_URL}/api/stations`];
    let lastError = '';

    for (const url of endpoints) {
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: nome,
            short_name: short,
            description: `Rádio de ${email}`,
            frontend_type: 'icecast',
            backend_type: 'liquidsoap'
          })
        });
        const txt = await r.text();
        if (txt.includes('<!DOCTYPE')) { lastError = `Endpoint ${url} retornou HTML (405) - tentando próximo`; continue; }
        const data = JSON.parse(txt);
        if (r.ok) return res.json({ ok: true, station: data, short_name: short });
        lastError = JSON.stringify(data);
      } catch (e) { lastError = e.message; }
    }
    return res.status(500).json({ ok:false, error: 'Nenhum endpoint aceitou. Último erro: ' + lastError });

  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
            }
