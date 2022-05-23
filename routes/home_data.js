const Query = require('../lib/Query');
const state = require('../lib/state');
const stateHistory = require('../lib/stateHistory');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = Date.now() - 86400 * 1000, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  const ret = await query.execute([...state.buildQuery(car_id), ...stateHistory.buildQuery(car_id, from , to)], from, to);
  ctx.body = { state: state.parse(ret), stateHistory: [ret[4], ret[5]] };
};