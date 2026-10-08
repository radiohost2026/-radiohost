export default async function handler(req, res){
  if(req.method!== 'POST') return res.status(405).json({error:'Use POST'});
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if(!GEMINI_KEY) return res.status(500).json({error:'GEMINI_API_KEY não configurada na Vercel'});
  try{
    const { text } = req.body;
    if(!text) return res.status(400).json({error:'Texto vazio'});

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_KEY}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        contents:[{parts:[{text:`Say in Brazilian Portuguese, energetic radio voice: ${text}`}]}],
        generationConfig:{
          responseModalities:["AUDIO"],
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"Kore"}}}
        }
      })
    });
    const data = await resp.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if(!b64) return res.status(500).json({error:'IA não retornou áudio: '+(data.error?.message||JSON.stringify(data).slice(0,200))});

    // Converte PCM para WAV base64
    const pcm = Buffer.from(b64,'base64');
    const wavHeader = Buffer.alloc(44);
    const sr = 24000, ch = 1;
    wavHeader.write('RIFF',0); wavHeader.writeUInt32LE(36+pcm.length,4); wavHeader.write('WAVE',8);
    wavHeader.write('fmt ',12); wavHeader.writeUInt32LE(16,16); wavHeader.writeUInt16LE(1,20);
    wavHeader.writeUInt16LE(ch,22); wavHeader.writeUInt32LE(sr,24); wavHeader.writeUInt32LE(sr*ch*2,28);
    wavHeader.writeUInt16LE(ch*2,32); wavHeader.writeUInt16LE(16,34); wavHeader.write('data',36);
    wavHeader.writeUInt32LE(pcm.length,40);
    const wav = Buffer.concat([wavHeader, pcm]);
    res.json({audio:'data:audio/wav;base64,'+wav.toString('base64')});
  }catch(e){ res.status(500).json({error:e.message}); }
     }
