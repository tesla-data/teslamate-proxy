
module.exports = async (ctx) => {
  const { header: { authorization }, query: { url }, request: { body: payload } } = ctx;

  const res = await fetch(url + '/api/ds/query', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization }, body: JSON.stringify(payload) });
  ctx.body = await res.json();
};