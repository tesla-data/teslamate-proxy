const Query = require('../lib/Query');
const chargeDetail = require('../lib/chargeDetail');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, charge_id, car_id, from, to } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.execute(chargeDetail.buildQuery(charge_id, car_id), from, to);
};