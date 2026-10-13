export const runtime = 'edge';
export async function GET() {
  const res = await fetch('http://173.212.231.94:8000/radio/8000', { cache: 'no-store' });
  return new Response(res.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
