
module.exports = async (ctx) => {
  const res = await fetch(`https://reurl.cc/${ctx.params.id}`);
  ctx.redirect(res.headers.get('target'));
}