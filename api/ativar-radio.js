export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST' });
  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const AZURACAST_URL = 'http://173.212.231.94';
  const API_KEY = '984cf6ca7fee3cfc:87e95514087b6be0ccbc148f8f2d900e';

  const { nome, email } = req.body || {};
  const short = nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8) + Date.now().toString().slice(-4);

  try {
    const r = await fetch(`${AZURACAST_URL}/api/admin/stations`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, short_name: short, frontend_type: 'icecast', backend_type: 'liquidsoap' })
    });
    
    const txt = await r.text();
    try {
      const data = JSON.parse(txt);
      if (!r.ok) return res.status(500).json({ ok:false, error: txt.slice(0,500) });
      return res.json({ ok:true, data, short_name: short });
    } catch {
      return res.status(500).json({ ok:false, error: 'HTML retornado: ' + txt.slice(0,500) });
    }
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
    }
