const Query = require('../lib/Query');
const updates = require('../lib/updates');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = 0, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  const ret = await query.cachedQuery(
    [updates.buildQuery(car_id)], from, to, car_id, '/updates',
    (data) => data[data.length - 1] && data[data.length - 1].time || '0',
    (data, ret) => {
      data.pop();
      data.push(...ret);
      return data;
    }
  );
  ret.reverse();
  ctx.body = ret;
};