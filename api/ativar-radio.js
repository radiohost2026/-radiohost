export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });

  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      try { body = typeof body === 'string' ? JSON.parse(body) : body; } catch {}
      if (!body || !body.nome) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        if (raw) try { body = JSON.parse(raw); } catch {}
      }
    }

    const nome = body?.nome || body?.name;
    const email = body?.email || '';
    if (!nome) return res.status(400).json({ ok:false, error: 'Nome vazio: ' + JSON.stringify(body).slice(0,200) });

    const AZURACAST_URL = 'http://173.212.231.94';
    // ATENÇÃO: COLE SUA CHAVE NOVA AQUI DENTRO DAS ASPAS - A CHAVE GIGANTE QUE APARECEU EM AZUL
    const API_KEY = '984cf6ca7fee3cfc:87e95514087b6be0ccbc148f8f2d900e';

    if (API_KEY.includes('COLE_AQUI')) {
      return res.status(500).json({ ok:false, error: 'VOCÊ NÃO COLOU A CHAVE! Volte no GitHub e troque COLE_AQUI_SUA_CHAVE_GIGANTE pela chave azul do AzuraCast' });
    }

    const short_name = nome.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,10) + Date.now().toString().slice(-4);

    // Tenta criar no AzuraCast
    const response = await fetch(`${AZURACAST_URL}/api/stations`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, short_name: short_name, frontend_type: 'icecast', backend_type: 'liquidsoap' })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0,500) }; }

    if (!response.ok) {
      return res.status(500).json({ ok:false, error: `AzuraCast erro ${response.status}: ${text.slice(0,600)}` });
    }

    return res.status(200).json({ ok:true, station: data, short_name });

  } catch (e) {
    return res.status(500).json({ ok:false, error: 'Erro interno: ' + e.message });
  }
}
