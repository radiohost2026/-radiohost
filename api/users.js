import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const redis = Redis.fromEnv();
  const KEY = 'radiohost:users';

  try {
    // Pega sempre como OBJETO
    let users = await redis.get(KEY);
    if (!users) users = {};
    // Se ainda for array antigo, converte pra objeto
    if (Array.isArray(users)) {
      let obj = {};
      users.forEach(u => { if(u.email) obj[u.email.toLowerCase()] = u; });
      users = obj;
      await redis.set(KEY, users);
    }

    if (req.method === 'GET') {
      return res.status(200).json(users);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body;
      if (!body.email) return res.status(400).json({error:'sem email'});
      const email = body.email.toLowerCase().trim();
      if (email === 'admin@radiohost.com.br') return res.status(200).json({ok:true});
      
      // Junta com o que já existe
      users[email] = { ...(users[email] || {}), ...body, email: email };
      await redis.set(KEY, users);
      return res.status(200).json({ sucesso: true, total: Object.keys(users).length });
    }

    if (req.method === 'DELETE') {
      const { email } = req.query;
      const e = (email||'').toLowerCase().trim();
      if (e && e !== 'admin@radiohost.com.br') {
        delete users[e];
        await redis.set(KEY, users);
      }
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({error:'metodo'});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
                                 }
