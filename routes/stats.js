const Query = require('../lib/Query');
const stats = require('../lib/stats');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, period = 'month', from = '0', to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.execute([stats.buildQuery(car_id, period)], from, to);
};