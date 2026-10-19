import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  try {
    let users = await redis.get('rh_users_v2');
    if(!users) users = {};
    if(typeof users === 'string'){
      try{ users = JSON.parse(users); } catch(e){ users = {}; }
    }

    if(req.method==='GET'){
      return res.status(200).json(users);
    }
    if(req.method==='POST'){
      let {email, ...data} = req.body;
      email = email.toLowerCase().trim();
      users[email] = data;
      await redis.set('rh_users_v2', JSON.stringify(users));
      return res.status(200).json({ok:true});
    }
    if(req.method==='PUT'){
      let {email, ...patch} = req.body;
      email = email.toLowerCase().trim();
      if(users[email]){
        users[email] = {...users[email], ...patch};
        await redis.set('rh_users_v2', JSON.stringify(users));
      }
      return res.status(200).json({ok:true});
    }
    if(req.method==='DELETE'){
      let email = (req.query.email||'').toLowerCase().trim();
      if(email === 'admin@radiohost.com.br') return res.status(403).json({error:'Clans nao apaga'});
      delete users[email];
      await redis.set('rh_users_v2', JSON.stringify(users));
      return res.status(200).json({ok:true});
    }
  } catch(e){
    return res.status(500).json({error: e.message});
  }
}
