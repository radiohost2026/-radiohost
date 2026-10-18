export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { nome, email } = req.body;

  try {
    const response = await fetch(`${process.env.AZURACAST_URL}/api/stations`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.AZURACAST_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nome,
        shortcode: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20) + Date.now().toString().slice(-3),
        description: `Radio de ${email}`,
        frontend_type: 'icecast',
        backend_type: 'liquidsoap'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: 'AzuraCast erro', details: data });
    }

    return res.status(200).json({ sucesso: true, radio: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
