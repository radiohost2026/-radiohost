// api/ativar-radio.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const AZURACAST_URL = 'http://173.212.231.94';
  const API_KEY = '7c2714e4dda42c7f:5331cd60a56a4e5e4e63dd7caf7ea07e'; // << COLA AQUI A CHAVE QUE VOCÊ COPIAR

  const { nome, email, plano } = req.body;
  if (!nome || !email) return res.status(400).json({ error: 'Falta nome/email' });

  try {
    // 1. Cria estação
    const r = await fetch(`${AZURACAST_URL}/api/stations`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nome,
        short_name: nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10) + Date.now().toString().slice(-3),
        frontend_type: 'icecast',
        backend_type: 'liquidsoap'
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ ok: false, error: JSON.stringify(data) });

    // Senha aleatória pro cliente
    const password = Math.random().toString(36).slice(-8) + 'Rh!';

    return res.json({ ok: true, station: data, password, email });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
