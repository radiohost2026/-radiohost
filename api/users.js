import { kv } from '@vercel/kv';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  let users = await kv.get('rh_users_v2') || {};

  if(req.method==='GET'){
    return res.status(200).json(users);
  }
  if(req.method==='POST'){
    let {email, ...data} = req.body;
    email = email.toLowerCase().trim();
    users[email] = data;
    await kv.set('rh_users_v2', users);
    return res.status(200).json({ok:true, users});
  }
  if(req.method==='PUT'){
    let {email, ...patch} = req.body;
    email = email.toLowerCase().trim();
    if(users[email]){
      users[email] = {...users[email], ...patch};
      await kv.set('rh_users_v2', users);
    }
    return res.status(200).json({ok:true});
  }
  if(req.method==='DELETE'){
    let email = (req.query.email||'').toLowerCase().trim();
    delete users[email];
    await kv.set('rh_users_v2', users);
    return res.status(200).json({ok:true});
  }
                 }
