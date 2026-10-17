import https from 'https';
export default async function handler(req, res){
  res.setHeader('Content-Type','application/json');
  if(req.method!=='POST') return res.status(405).json({ok:false, error:'POST only'});
  try{
    let body=req.body;
    if(!body || typeof body==='string' || !body.nome){
      const chunks=[]; for await(const c of req) chunks.push(c);
      const raw=Buffer.concat(chunks).toString();
      if(raw) try{ body=JSON.parse(raw); }catch{}
    }
    const nome=body?.nome; const email=body?.email||'';
    if(!nome) return res.status(400).json({ok:false, error:'Sem nome'});
    
    const AZURACAST_URL='https://173.212.231.94';
    const API_KEY='984cf6ca7fee3cfc:87e95514087b6be0ccbc148f8f2d900e';
    if(API_KEY.includes('COLE_AQUI')) return res.status(500).json({ok:false, error:'Chave não colada! Troque COLE_AQUI pela chave azul'});

    const short=nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)+Date.now().toString().slice(-4);
    const agent=new https.Agent({rejectUnauthorized:false});

    const endpoints=[`${AZURACAST_URL}/api/admin/stations`, `${AZURACAST_URL}/api/stations`];
    for(const url of endpoints){
      const r=await fetch(url,{method:'POST', headers:{'X-API-Key':API_KEY,'Content-Type':'application/json'}, body:JSON.stringify({name:nome, short_name:short, frontend_type:'icecast', backend_type:'liquidsoap', description:`${email}`}), agent});
      const txt=await r.text();
      if(txt.includes('405') || txt.includes('<!DOCTYPE')) continue;
      try{
        const data=JSON.parse(txt);
        if(r.ok) return res.json({ok:true, station:data, short_name:short});
      }catch{}
    }
    return res.status(500).json({ok:false, error:'AzuraCast ainda deu 405 nos 2 endpoints. Desative o Always use HTTPS nas Configurações e use chave Super Admin.'});
  }catch(e){ return res.status(500).json({ok:false, error:e.message}); }
}
