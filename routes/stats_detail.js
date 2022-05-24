const Query = require('../lib/Query');
const drivesQ = require('../lib/drive/drives');
const chargesQ = require('../lib/charges');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = Date.now() - 86400 * 1000, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  const [drives, charges] = await query.execute([drivesQ.buildQuery(car_id), chargesQ.buildQuery(car_id)], from, to);
  ctx.body = { drives, charges };
};