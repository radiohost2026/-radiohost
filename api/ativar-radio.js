export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Method not allowed' });

  const { nomeRadio, emailCliente, senha, plano } = req.body;

  const AZURACAST_URL = process.env.AZURACAST_URL; // http://173.212.231.94
  const API_KEY = process.env.AZURACAST_API_KEY;

  if (!AZURACAST_URL || !API_KEY) {
    return res.status(500).json({ erro: 'Variáveis AZURACAST_URL ou API_KEY não configuradas no Vercel' });
  }

  // Remove http:// e barra no final
  const baseUrl = AZURACAST_URL.replace(/\/$/, '');

  // Define short_name: sem espaço, sem acento
  const shortName = nomeRadio.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_').substring(0, 30);

  const limites = {
    "20": { listeners: 50, desc: "Plano R$20" },
    "30": { listeners: 100, desc: "Plano R$30 - Mais vendido" },
    "600": { listeners: 500, desc: "Plano R$600 Ilimitado" }
  };

  const config = limites[plano] || limites["30"];

  try {
    // 1. Cria a estação
    const createRes = await fetch(`${baseUrl}/api/admin/stations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nomeRadio,
        short_name: shortName,
        description: `${config.desc} - Cliente: ${emailCliente}`,
        frontend_type: 'icecast',
        backend_type: 'liquidsoap',
        frontend_config: {
          sc_mounts: [`/${shortName}`]
        }
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return res.status(400).json({ erro: `AzuraCast erro: ${createRes.status} - ${errText}` });
    }

    const station = await createRes.json();
    const stationId = station.id;
    const finalShortName = station.short_name || shortName;

    return res.json({
      sucesso: true,
      link: `${baseUrl}/public/${finalShortName}`,
      painel: `${baseUrl}/public/${finalShortName}`,
      id: stationId,
      short_name: finalShortName
    });

  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
      }
