export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).end();
  
  const { nome, email } = req.body;
  const AZURA_URL = 'http://173.212.231.94';
  const AZURA_KEY = 'SUA_API_KEY_AQUI'; // <--- coloca sua key

  try{
    // Cria estação no AzuraCast
    let r = await fetch(`${AZURA_URL}/api/admin/stations`,{
      method:'POST',
      headers:{
        'X-API-Key': AZURA_KEY,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        name: nome,
        short_name: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,''),
        frontend_type: 'icecast',
        backend_type: 'liquidsoap',
        description: `Rádio ${nome} - ${email}`
      })
    });
    let data = await r.json();
    return res.status(200).json({ok:true, station:data});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
}
