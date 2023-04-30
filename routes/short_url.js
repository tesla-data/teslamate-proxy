const axios = require('axios');

module.exports = async (ctx) => {
  const { headers: { target } } = await axios.get(`https://reurl.cc/${ctx.params.id}`);
  ctx.redirect(target);
}