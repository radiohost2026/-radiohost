export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  
  const AZURA_URL = process.env.AZURACAST_URL || 'http://173.212.231.94';
  const AZURA_KEY = process.env.AZURACAST_API_KEY;
  
  if(!AZURA_KEY) return res.status(500).json({error:'SEM API KEY NA VERCEL - COLOCA EM SETTINGS'});
  
  const { nome, email, short_name } = req.body;
  const short = (short_name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,15);
  
  try{
    const r = await fetch(`${AZURA_URL}/api/admin/stations`,{
      method:'POST',
      headers:{'X-API-Key': AZURA_KEY, 'Content-Type':'application/json'},
      body: JSON.stringify({
        name: nome,
        short_name: short,
        description: `Cliente ${email}`,
        frontend_type: 'icecast',
        backend_type: 'liquidsoap',
        is_enabled: true
      })
    });
    
    const txt = await r.text();
    let data; try{ data = JSON.parse(txt); }catch{ data={raw:txt}; }
    
    if(!r.ok && r.status !== 422){
      return res.status(r.status).json({error:data});
    }
    
    return res.status(200).json({
      ok:true,
      station:{
        id: data.id || short,
        short_name: data.short_name || short,
        url: `${AZURA_URL}/public/${data.short_name || short}`
      }
    });
  }catch(e){
    return res.status(500).json({error:e.message});
  }
      }
