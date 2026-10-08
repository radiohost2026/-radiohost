export default async function handler(req,res){
 const key=process.env.GEMINI_API_KEY;
 const {text}=req.body;
 const r=await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({input:{text},voice:{languageCode:'pt-BR',name:'pt-BR-Wavenet-A'},audioConfig:{audioEncoding:'MP3'}})
 });
 const d=await r.json();
 if(!d.audioContent) return res.status(500).json({error:d.error?.message});
 res.json({audio:'data:audio/mp3;base64,'+d.audioContent});
}
