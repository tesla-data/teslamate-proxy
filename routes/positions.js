const Query = require('../lib/Query');
const position = require('../lib/position');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = Date.now() - 86400 * 1000, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.execute([position.buildQuery(car_id, from, to)], from, to);
};