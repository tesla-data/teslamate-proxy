const axios = require('axios');

module.exports = async (ctx, id) => {
  const { headers: { target } } = await axios.get(`https://reurl.cc/${id}`);
  ctx.redirect(target);
}