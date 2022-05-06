const axios = require('axios');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url }, request: { body: payload } } = ctx;
  const { data } = await axios.post(url + '/api/ds/query', payload, { headers: { Authorization: authorization } });
  ctx.body = data;
};