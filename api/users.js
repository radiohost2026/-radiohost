// /api/users.js - precisa de Vercel KV
import { kv } from '@vercel/kv';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  let users = (await kv.get('rh_users')) || {};

  if(req.method==='GET'){
    return res.status(200).json(users);
  }
  if(req.method==='POST'){
    const {email, ...data}=req.body;
    users[email]=data;
    await kv.set('rh_users', users);
    return res.status(200).json({ok:true});
  }
  if(req.method==='PUT'){
    const {email, ...patch}=req.body;
    if(users[email]){ users[email]={...users[email], ...patch}; await kv.set('rh_users', users); }
    return res.status(200).json({ok:true});
  }
  if(req.method==='DELETE'){
    const email=req.query.email;
    delete users[email];
    await kv.set('rh_users', users);
    return res.status(200).json({ok:true});
  }
}
