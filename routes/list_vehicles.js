const Query = require('../lib/Query');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.execute([{ refId: 'vehicles', rawSql: 'SELECT * FROM cars ORDER BY display_priority ASC, name ASC;' }]);
};