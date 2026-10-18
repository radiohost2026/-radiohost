// api/stream.js - Proxy seguro para o player tocar em HTTPS
export default async function handler(req, res) {
  try {
    const azuraUrl = "http://173.212.231.94/listen/radioclans/radio.mp3";
    
    const response = await fetch(azuraUrl, {
      headers: { "User-Agent": "RadioHost/1.0" }
    });

    if (!response.ok || !response.body) {
      return res.status(502).end("Erro no Azura");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (e) {
    res.status(500).end("Erro stream: " + e.message);
  }
}
