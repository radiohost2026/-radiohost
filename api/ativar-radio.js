export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const AZURACAST_URL = 'http://173.212.231.94';
  const API_KEY = '7c2714e4dda42c7f:5331cd60d0c7d9e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4'; // COLA AQUI SUA CHAVE COMPLETA COPIADA DO AZURACAST, TEM QUE TER 2 PARTES SEPARADAS POR :

  const { nome, email, plano } = req.body || {};
  if (!nome || !email) return res.status(400).json({ error: 'Falta nome/email' });

  try {
    const short = nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8) + Date.now().toString().slice(-4);
    
    const resp = await fetch(`${AZURACAST_URL}/api/stations`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, short_name: short, frontend_type: 'icecast', backend_type: 'liquidsoap' })
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { 
      return res.status(500).json({ ok:false, error: 'AzuraCast retornou HTML, sua API KEY está errada ou incompleta. Resposta: ' + text.slice(0,300) }); 
    }

    if (!resp.ok) return res.status(500).json({ ok:false, error: JSON.stringify(data) });
    
    return res.json({ ok:true, station: data });

  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
