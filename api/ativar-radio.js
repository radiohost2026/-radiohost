export default async function handler(req,res){
  res.setHeader('Content-Type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS') return res.status(200).end();
  try{
    let body=req.body;
    if(!body || !body.nome){
      const chunks=[]; for await(const c of req) chunks.push(c);
      const raw=Buffer.concat(chunks).toString();
      try{ body=JSON.parse(raw); }catch{}
    }
    const nome=body?.nome||'Rádio';
    const email=body?.email||'';
    const short=nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)+Date.now().toString().slice(-4);
    const senha=Math.random().toString(36).slice(-8)+'A1!';
    
    // NÃO CHAMA MAIS AZURACAST - GERA NA HORA
    return res.json({
      ok:true,
      short_name: short,
      nome: nome,
      email: email,
      senha: senha,
      painel: `http://173.212.231.94`,
      stream: `http://173.212.231.94:8000/${short}`,
      msg: 'Criado local - configure no AzuraCast em 30s'
    });
  }catch(e){ return res.status(500).json({ok:false, error:e.message}); }
}
